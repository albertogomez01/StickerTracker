import React, { useState, useEffect, useRef } from 'react';
import { SELECCIONES, parsearTextoAStickers } from './utils';

export default function Intercambios({ perfil }) {
  const [comunidadUsuarios, setComunidadUsuarios] = useState(() => {
    try {
      const guardado = localStorage.getItem('panini_amigos');
      return guardado ? JSON.parse(guardado) : [];
    } catch (error) {
      return [];
    }
  });
  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState('');
  const [busquedaAmigo, setBusquedaAmigo] = useState('');
  const [editandoAmigoId, setEditandoAmigoId] = useState(null);
  const [amigoFaltantesInput, setAmigoFaltantesInput] = useState('');
  const [amigoRepetidosInput, setAmigoRepetidosInput] = useState('');
  const [exclusionesTrueque, setExclusionesTrueque] = useState({});
  const canvasRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem('panini_amigos', JSON.stringify(comunidadUsuarios));
    } catch (error) {}
  }, [comunidadUsuarios]);

  const añadirAmigoNuevo = (e) => {
    e.preventDefault();
    if (!nuevoAmigoNombre.trim()) return;
    const nombreLimpio = nuevoAmigoNombre.trim();
    if (comunidadUsuarios.some(u => u.nickname.toLowerCase() === nombreLimpio.toLowerCase())) {
      return alert("Este amigo ya está en tu lista.");
    }
    const nuevoAmigo = { id: 'u_' + Date.now(), nickname: nombreLimpio, stickers: {}, rawFaltantes: '', rawRepetidos: '' };
    setComunidadUsuarios(prev => [nuevoAmigo, ...prev]);
    setNuevoAmigoNombre('');
  };

  const eliminarAmigo = (idAmigo) => {
    if (!window.confirm("¿Seguro que quieres eliminar a este amigo de tu lista?")) return;
    setComunidadUsuarios(prev => prev.filter(u => u.id !== idAmigo));
  };

  const guardarListasAmigo = (idAmigo) => {
    setComunidadUsuarios(prev => prev.map(u => {
      if (u.id === idAmigo) {
        let nuevosStickers = parsearTextoAStickers(amigoFaltantesInput, 'faltantes', {});
        nuevosStickers = parsearTextoAStickers(amigoRepetidosInput, 'repetidos', nuevosStickers);
        return { ...u, stickers: nuevosStickers, rawFaltantes: amigoFaltantesInput, rawRepetidos: amigoRepetidosInput };
      }
      return u;
    }));
    setEditandoAmigoId(null);
  };

  const alternarCromoEnTabla = (amigoId, codCromo) => {
    const llave = `${amigoId}_${codCromo}`;
    setExclusionesTrueque(prev => ({ ...prev, [llave]: !prev[llave] }));
  };

  const descargarImagenTrueque = (nickAmigo, leDoyList, meDaList) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 700, 500);
    ctx.fillStyle = '#059669'; ctx.fillRect(0, 0, 700, 70);
    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px system-ui';
    ctx.fillText(`Propuesta de Intercambio: @${perfil.nickname} ↔ @${nickAmigo}`, 25, 42);
    ctx.fillStyle = '#1E293B'; ctx.font = 'bold 15px system-ui';
    ctx.fillText(`🎁 Lo que Yo le doy a @${nickAmigo} (${leDoyList.length}):`, 40, 110);
    ctx.fillText(`📥 Lo que @${nickAmigo} me da a Mí (${meDaList.length}):`, 370, 110);
    ctx.font = '14px system-ui'; ctx.fillStyle = '#475569';
    let yYo = 140; leDoyList.slice(0, 15).forEach(c => { ctx.fillText(`• ${c}`, 40, yYo); yYo += 22; });
    if (leDoyList.length > 15) ctx.fillText(`... y ${leDoyList.length - 15} más`, 40, yYo);
    let yEl = 140; meDaList.slice(0, 15).forEach(c => { ctx.fillText(`• ${c}`, 370, yEl); yEl += 22; });
    if (meDaList.length > 15) ctx.fillText(`... y ${meDaList.length - 15} más`, 370, yEl);
    ctx.fillStyle = '#94A3B8'; ctx.font = 'italic 12px system-ui';
    ctx.fillText("Generado automáticamente por Gestor Panini 2026", 210, 475);
    const link = document.createElement('a'); link.download = `intercambio_${nickAmigo}.png`; link.href = canvas.toDataURL('image/png'); link.click();
  };

  const amigosFiltrados = comunidadUsuarios.filter(u => u.nickname.toLowerCase().includes(busquedaAmigo.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <canvas ref={canvasRef} width="700" height="500" style={{ display: 'none' }} />
      <div className="card">
        <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>🔍 Buscar usuario por apodo</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" value={busquedaAmigo} onChange={(e) => setBusquedaAmigo(e.target.value)} placeholder="Apodo del amigo..." className="input-field" style={{ flex: 1 }} />
        </div>
        <form onSubmit={añadirAmigoNuevo} style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', gap: '8px' }}>
          <input type="text" value={nuevoAmigoNombre} onChange={(e) => setNuevoAmigoNombre(e.target.value)} placeholder="Nombre del amigo..." className="input-field" style={{ flex: 1, fontSize: '14px' }} />
          <button type="submit" className="btn-primary" style={{ background: '#6EE7B7', color: '#0F766E' }}>➕ Añadir</button>
        </form>
      </div>
      {amigosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>No tienes amigos en la lista. Escribe un nombre arriba para añadirlo.</div>
      ) : (
        amigosFiltrados.map(amigo => {
          let fCount = 0; let tCount = 0; let rCount = 0;
          SELECCIONES.forEach(s => {
            for (let i = 0; i < s.total; i++) {
              const status = amigo.stickers?.[`${s.id}_${i.toString().padStart(2, '0')}`] || 0;
              if (status === 0) fCount++;
              else if (status === 1) tCount++;
              else if (status >= 2) { tCount++; rCount += (status - 1); }
            }
          });
          const candidatosLeDoy = []; const candidatosElMeDa = [];
          SELECCIONES.forEach(sel => {
            for (let i = 0; i < sel.total; i++) {
              const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
              const miEstado = perfil?.stickers?.[cod] || 0;
              const amigoEstado = amigo.stickers?.[cod] || 0;
              const tag = i === 0 ? `${sel.id} Escudo` : `${sel.id} ${i + 1}`;
              if (miEstado >= 2 && amigoEstado === 0) candidatosLeDoy.push({ cod, tag });
              if (amigoEstado >= 2 && miEstado === 0) candidatosElMeDa.push({ cod, tag });
            }
          });
          const realesLeDoy = candidatosLeDoy.filter(c => !exclusionesTrueque[`${amigo.id}_${c.cod}`]);
          const realesElMeDa = candidatosElMeDa.filter(c => !exclusionesTrueque[`${amigo.id}_${c.cod}`]);
          return (
            <div key={amigo.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '32px', height: '32px', background: '#E0F2FE', color: '#0369A1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{amigo.nickname.charAt(0).toUpperCase()}</div>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>{amigo.nickname}</span>
                </div>
                <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', padding: '4px 10px', borderRadius: '99px' }}>{realesLeDoy.length > 0 || realesElMeDa.length > 0 ? 'Intercambio Listo' : 'Pocos en común'}</span>
              </div>
              {editandoAmigoId === amigo.id ? (
                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444', display: 'block', marginBottom: '4px' }}>🔴 Cromos que le faltan a {amigo.nickname}</label>
                    <textarea value={amigoFaltantesInput} onChange={(e) => setAmigoFaltantesInput(e.target.value)} className="input-field" style={{ height: '80px' }} />
                  </div>
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', display: 'block', marginBottom: '4px' }}>🟡 Cromos repetidos de {amigo.nickname}</label>
                    <textarea value={amigoRepetidosInput} onChange={(e) => setAmigoRepetidosInput(e.target.value)} className="input-field" style={{ height: '80px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={() => guardarListasAmigo(amigo.id)} className="btn-primary" style={{ background: '#059669' }}>✓ Guardar</button>
                    <button onClick={() => setEditandoAmigoId(null)} className="btn-primary" style={{ background: '#FFF', color: '#64748B', border: '1px solid #CBD5E1' }}>✕ Cancelar</button>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '14px' }}>
                    <div style={{ background: '#ECFDF5', borderRadius: '8px', padding: '6px' }}><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>{tCount}</div><div style={{ fontSize: '10px', color: '#059669' }}>Tiene</div></div>
                    <div style={{ background: '#FEF2F2', borderRadius: '8px', padding: '6px' }}><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>{fCount}</div><div style={{ fontSize: '10px', color: '#EF4444' }}>Le faltan</div></div>
                    <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '6px' }}><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#D97706' }}>{rCount}</div><div style={{ fontSize: '10px', color: '#D97706' }}>Repetidos</div></div>
                  </div>
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8FAFC', padding: '10px', fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>
                      <div style={{ color: '#059669' }}>🎁 Yo le doy ({realesLeDoy.length})</div>
                      <div style={{ color: '#D97706' }}>📥 Me da ({realesElMeDa.length})</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80px', maxHeight: '180px', overflowY: 'auto' }}>
                      <div style={{ borderRight: '1px solid #E2E8F0', padding: '6px', background: '#FFF' }}>
                        {candidatosLeDoy.length === 0 ? <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>Ninguno</div> :
                          candidatosLeDoy.map(c => {
                            const desmarcado = exclusionesTrueque[`${amigo.id}_${c.cod}`];
                            return (
                            <div key={c.cod} onClick={() => alternarCromoEnTabla(amigo.id, c.cod)} className="trade-sticker" style={{ background: desmarcado ? '#F1F5F9' : '#EF4444', color: desmarcado ? '#94A3B8' : '#FFF', textDecoration: desmarcado ? 'line-through' : 'none' }}>
                                {desmarcado ? '❌' : '✓'} {c.tag}
                              </div>
                            );
                          })
                        }
                      </div>
                      <div style={{ padding: '6px', background: '#FFF' }}>
                        {candidatosElMeDa.length === 0 ? <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>Ninguno</div> :
                          candidatosElMeDa.map(c => {
                            const desmarcado = exclusionesTrueque[`${amigo.id}_${c.cod}`];
                            return (
                            <div key={c.cod} onClick={() => alternarCromoEnTabla(amigo.id, c.cod)} className="trade-sticker" style={{ background: desmarcado ? '#F1F5F9' : '#F59E0B', color: desmarcado ? '#94A3B8' : '#FFF', textDecoration: desmarcado ? 'line-through' : 'none' }}>
                                {desmarcado ? '❌' : '➡️'} {c.tag}
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button onClick={() => { setEditandoAmigoId(amigo.id); setAmigoFaltantesInput(amigo.rawFaltantes || ''); setAmigoRepetidosInput(amigo.rawRepetidos || ''); }} className="btn-secondary" style={{ flex: '1 1 30%' }}>✍️ Editar</button>
                    <button onClick={() => descargarImagenTrueque(amigo.nickname, realesLeDoy.map(x=>x.tag), realesElMeDa.map(x=>x.tag))} className="btn-primary" style={{ flex: '1 1 50%' }}>🖼️ Generar imagen</button>
                    <button onClick={() => eliminarAmigo(amigo.id)} className="btn-danger" style={{ flex: '1 1 100%' }}>🗑️ Eliminar</button>
                  </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}