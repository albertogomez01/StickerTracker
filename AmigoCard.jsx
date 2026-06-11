import React, { useState, useEffect } from 'react';
import { SELECCIONES } from './utils';
import { generarImagenTrueque } from './canvasUtils';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

const AVATAR_COLORS = [
  { bg: '#E0F2FE', text: '#0369A1' }, // Azul
  { bg: '#FEE2E2', text: '#B91C1C' }, // Rojo
  { bg: '#FEF3C7', text: '#B45309' }, // Amarillo
  { bg: '#D1FAE5', text: '#047857' }, // Verde
  { bg: '#E0E7FF', text: '#4338CA' }, // Índigo
  { bg: '#F3E8FF', text: '#6D28D9' }, // Morado
  { bg: '#FCE7F3', text: '#BE185D' }, // Rosa
  { bg: '#F3F4F6', text: '#374151' }, // Gris
];

export default function AmigoCard({ amigo, perfil, onGuardar, onEliminar, albumActivo, onOpenChat }) {
  const [isEditing, setIsEditing] = useState(false);
  const [faltantesInput, setFaltantesInput] = useState(amigo.rawFaltantes || '');
  const [repetidosInput, setRepetidosInput] = useState(amigo.rawRepetidos || '');
  const [exclusiones, setExclusiones] = useState({});
  const currentAvatarColor = amigo.avatarColor || AVATAR_COLORS[0];
  const [colorInput, setColorInput] = useState(currentAvatarColor);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    // Los amigos añadidos a mano ("u_...") no tienen estado en línea
    if (!amigo.id || amigo.id.startsWith('u_')) return; 
    const unsub = onSnapshot(doc(db, 'usuarios', amigo.id), (snap) => {
      if (snap.exists()) {
        setIsOnline(snap.data().isOnline === true);
      }
    });
    return () => unsub();
  }, [amigo.id]);

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

  const realesLeDoy = candidatosLeDoy.filter(c => !exclusiones[c.cod]);
  const realesElMeDa = candidatosElMeDa.filter(c => !exclusiones[c.cod]);

  const alternarExclusion = (cod) => setExclusiones(prev => ({ ...prev, [cod]: !prev[cod] }));

  const handleGuardar = () => {
    onGuardar(amigo.id, faltantesInput, repetidosInput, colorInput);
    setIsEditing(false);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '32px', height: '32px', background: currentAvatarColor.bg, color: currentAvatarColor.text, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{amigo.nickname.charAt(0).toUpperCase()}</div>
            {isOnline && <div style={{ position: 'absolute', bottom: 0, right: '-2px', width: '12px', height: '12px', background: '#10B981', border: '2px solid var(--bg-card)', borderRadius: '50%' }}></div>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: '700', fontSize: '16px' }}>{amigo.nickname}</span>
            <span style={{ fontSize: '11px', color: isOnline ? '#10B981' : 'var(--text-secondary)' }}>{isOnline ? 'En línea' : 'Desconectado'}</span>
          </div>
        </div>
        <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', padding: '4px 10px', borderRadius: '99px' }}>
          {realesLeDoy.length > 0 || realesElMeDa.length > 0 ? 'Intercambio Listo' : 'Pocos en común'}
        </span>
      </div>

      {isEditing ? (
        <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444', display: 'block', marginBottom: '4px' }}>Faltantes de {amigo.nickname}</label>
            <textarea value={faltantesInput} onChange={(e) => setFaltantesInput(e.target.value)} className="input-field" style={{ height: '80px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', display: 'block', marginBottom: '4px' }}>Repetidos de {amigo.nickname}</label>
            <textarea value={repetidosInput} onChange={(e) => setRepetidosInput(e.target.value)} className="input-field" style={{ height: '80px' }} />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', display: 'block', marginBottom: '8px' }}>Color de Avatar</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map((color, idx) => (
                <div
                  key={idx}
                  onClick={() => setColorInput(color)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: color.bg,
                    color: color.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    border: colorInput.bg === color.bg ? `2px solid ${color.text}` : '2px solid transparent',
                    boxSizing: 'border-box'
                  }}
                >
                {colorInput.bg === color.bg ? 'V' : ''}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleGuardar} className="btn-primary" style={{ background: '#059669' }}>Guardar</button>
            <button onClick={() => setIsEditing(false)} className="btn-primary" style={{ background: '#FFF', color: '#64748B', border: '1px solid #CBD5E1' }}>Cancelar</button>
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
              <div style={{ color: '#059669' }}>Yo le doy ({realesLeDoy.length})</div>
              <div style={{ color: '#D97706' }}>Me da ({realesElMeDa.length})</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80px', maxHeight: '180px', overflowY: 'auto' }}>
              <div style={{ borderRight: '1px solid #E2E8F0', padding: '6px', background: '#FFF' }}>
                {candidatosLeDoy.length === 0 ? <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>Ninguno</div> :
                  candidatosLeDoy.map(c => {
                    const desmarcado = exclusiones[c.cod];
                    return (
                      <div key={c.cod} onClick={() => alternarExclusion(c.cod)} className="trade-sticker" style={{ background: desmarcado ? '#F1F5F9' : '#EF4444', color: desmarcado ? '#94A3B8' : '#FFF', textDecoration: desmarcado ? 'line-through' : 'none' }}>
                        {desmarcado ? 'X' : 'V'} {c.tag}
                      </div>
                    );
                  })
                }
              </div>
              <div style={{ padding: '6px', background: '#FFF' }}>
                {candidatosElMeDa.length === 0 ? <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>Ninguno</div> :
                  candidatosElMeDa.map(c => {
                    const desmarcado = exclusiones[c.cod];
                    return (
                      <div key={c.cod} onClick={() => alternarExclusion(c.cod)} className="trade-sticker" style={{ background: desmarcado ? '#F1F5F9' : '#F59E0B', color: desmarcado ? '#94A3B8' : '#FFF', textDecoration: desmarcado ? 'line-through' : 'none' }}>
                        {desmarcado ? 'X' : '->'} {c.tag}
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button onClick={() => onOpenChat(amigo)} className="btn-primary" style={{ flex: '1 1 100%', background: '#3B82F6', color: '#FFF' }}>Abrir Chat Privado</button>
            <button onClick={() => { setFaltantesInput(amigo.rawFaltantes || ''); setRepetidosInput(amigo.rawRepetidos || ''); setColorInput(amigo.avatarColor || AVATAR_COLORS[0]); setIsEditing(true); }} className="btn-secondary" style={{ flex: '1 1 30%' }}>Editar</button>
            <button onClick={() => generarImagenTrueque(perfil?.nickname || 'Yo', amigo.nickname, realesLeDoy.map(x=>x.tag), realesElMeDa.map(x=>x.tag))} className="btn-primary" style={{ flex: '1 1 50%' }}>Compartir</button>
            <button onClick={() => onEliminar(amigo.id)} className="btn-danger" style={{ flex: '1 1 100%' }}>Eliminar</button>
          </div>
        </div>
      )}
    </div>
  );
}