import React, { useState, useEffect, useMemo } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ALBUMS } from './utils';
import { toast } from 'react-hot-toast';

export default function Estadisticas({ albumActivo, perfil }) {
  const [tab, setTab] = useState('ranking'); 
  const [mercadoData, setMercadoData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selCotizador, setSelCotizador] = useState('');
  const [numCotizador, setNumCotizador] = useState('');
  const [statsCotizador, setStatsCotizador] = useState(null);

  const getCol = (base) => albumActivo === 'mundial_2026' ? base : `${base}_${albumActivo}`;
  const albumInfo = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const qStats = query(collection(db, getCol('mercado')), orderBy('timestamp', 'desc'), limit(100));
        const snap = await getDocs(qStats);
        const data = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        setMercadoData(data);
      } catch (e) {
        console.error(e);
        toast.error("Error al cargar los datos de la comunidad.");
      }
      setLoading(false);
    };
    fetchData();
    setSelCotizador('');
    setNumCotizador('');
    setStatsCotizador(null);
  }, [albumActivo]);

  const ranking = useMemo(() => {
    return mercadoData.map(u => {
      let tCount = 0;
      for (const cod in u.stickers) {
        if (u.stickers[cod] >= 1) tCount++;
      }
      const pct = Math.round((tCount / albumInfo.totalStickers) * 100) || 0;
      return { ...u, pct, tCount };
    }).sort((a, b) => b.tCount - a.tCount).slice(0, 50);
  }, [mercadoData, albumInfo]);

  const miPosicion = useMemo(() => {
    if (!perfil) return null;
    let tCount = 0;
    let rCount = 0;
    for (const cod in perfil.stickers) {
      if (perfil.stickers[cod] >= 1) tCount++;
      if (perfil.stickers[cod] >= 2) rCount += (perfil.stickers[cod] - 1);
    }
    const myRank = ranking.findIndex(u => u.id === perfil.id) + 1;
    return { tCount, rCount, pct: Math.round((tCount / albumInfo.totalStickers) * 100) || 0, rank: myRank };
  }, [ranking, perfil, albumInfo]);

  const calcularCotizacion = () => {
    if (!selCotizador || !numCotizador) return toast.error("Selecciona equipo y cromo.");
    const codigo = `${selCotizador}_${(parseInt(numCotizador) - 1).toString().padStart(2, '0')}`;
    
    let loBuscan = 0;
    let loTienenRepetido = 0;

    mercadoData.forEach(u => {
      const v = u.stickers[codigo] || 0;
      if (v === 0) loBuscan++;
      else if (v >= 2) loTienenRepetido++;
    });

    setStatsCotizador({ loBuscan, loTienenRepetido, total: mercadoData.length });
  };

  const logros = useMemo(() => {
    if (!miPosicion) return [];
    const { tCount, pct, rCount } = miPosicion;
    return [
      { id: 'inicio', nombre: 'Primeros Pasos', desc: 'Consigue tu primer cromo.', unl: tCount > 0, color: '#3B82F6' },
      { id: 'bronce', nombre: 'Coleccionista', desc: 'Alcanza el 25% del álbum.', unl: pct >= 25, color: '#D97706' },
      { id: 'plata', nombre: 'Avanzado', desc: 'Alcanza el 50% del álbum.', unl: pct >= 50, color: '#94A3B8' },
      { id: 'oro', nombre: 'Experto', desc: 'Alcanza el 75% del álbum.', unl: pct >= 75, color: '#EAB308' },
      { id: 'diamante', nombre: 'Leyenda', desc: 'Completa el álbum al 100%.', unl: pct >= 100, color: '#06B6D4' },
      { id: 'repes', nombre: 'Comerciante', desc: 'Acumula más de 50 cromos repetidos.', unl: rCount >= 50, color: '#10B981' }
    ];
  }, [miPosicion]);

  const getDificultad = () => {
    if (!statsCotizador) return null;
    const { loBuscan, loTienenRepetido } = statsCotizador;
    if (loBuscan === 0) return { texto: 'Muy Común', color: '#10B981' };
    const ratio = loTienenRepetido / loBuscan;
    if (ratio > 1.5) return { texto: 'Muy Común', color: '#10B981' };
    if (ratio > 0.8) return { texto: 'Normal', color: '#3B82F6' };
    if (ratio > 0.3) return { texto: 'Difícil', color: '#F59E0B' };
    return { texto: 'Muy Difícil', color: '#EF4444' };
  };

  const selInfo = albumInfo.selecciones.find(s => s.id === selCotizador);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ display: 'flex', gap: '8px', padding: '12px' }}>
        <button onClick={() => setTab('ranking')} className="btn-secondary" style={{ flex: 1, background: tab === 'ranking' ? 'var(--accent-primary)' : '', color: tab === 'ranking' ? '#FFF' : '', borderColor: tab === 'ranking' ? 'var(--accent-primary)' : '' }}>Ranking</button>
        <button onClick={() => setTab('logros')} className="btn-secondary" style={{ flex: 1, background: tab === 'logros' ? 'var(--accent-primary)' : '', color: tab === 'logros' ? '#FFF' : '', borderColor: tab === 'logros' ? 'var(--accent-primary)' : '' }}>Logros</button>
        <button onClick={() => setTab('cotizador')} className="btn-secondary" style={{ flex: 1, background: tab === 'cotizador' ? 'var(--accent-primary)' : '', color: tab === 'cotizador' ? '#FFF' : '', borderColor: tab === 'cotizador' ? 'var(--accent-primary)' : '' }}>Cotizador</button>
      </div>

      {tab === 'ranking' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Ranking Global (Top 50)</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 0, marginTop: 0 }}>Compite con la comunidad para ver quién completa el álbum {albumInfo.nombre} primero.</p>
          </div>
          {miPosicion && miPosicion.rank > 0 && (
            <div className="card" style={{ padding: '12px', background: 'var(--bg-input)', border: '1px solid var(--accent-primary)' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 'bold' }}>TU POSICIÓN</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ background: 'var(--accent-primary)', color: 'white', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>#{miPosicion.rank}</div>
                  <span style={{ fontWeight: 'bold', fontSize: '15px' }}>@{perfil.nickname}</span>
                </div>
                <span style={{ fontWeight: 'bold', color: 'var(--accent-primary)' }}>{miPosicion.pct}%</span>
              </div>
            </div>
          )}
          {loading ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando ranking...</div>
          ) : ranking.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No hay datos suficientes en el mercado.</div>
          ) : (
            <div className="card" style={{ padding: '0' }}>
              {ranking.map((u, index) => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: index < ranking.length - 1 ? '1px solid var(--border-primary)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: index < 3 ? '#F59E0B' : 'var(--text-secondary)', width: '24px' }}>#{index + 1}</span>
                    {u.photoURL ? (
                      <img src={u.photoURL} alt="" loading="lazy" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--bg-input)', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '12px' }}>{u.nickname.charAt(0).toUpperCase()}</div>
                    )}
                    <span style={{ fontWeight: 'bold', fontSize: '14px', color: u.id === perfil?.id ? 'var(--accent-primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>@{u.nickname}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{u.tCount} cromos</span>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', background: 'var(--bg-input)', padding: '4px 8px', borderRadius: '8px' }}>{u.pct}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'logros' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Tus Logros</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 0, marginTop: 0 }}>Desbloquea medallas a medida que avanzas en tu colección.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {logros.map(logro => (
              <div key={logro.id} className="card" style={{ margin: 0, opacity: logro.unl ? 1 : 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '16px 12px' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={logro.unl ? logro.color : 'var(--text-secondary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '8px' }}>
                  <circle cx="12" cy="8" r="7"></circle>
                  <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                </svg>
                <span style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '4px', color: 'var(--text-primary)' }}>{logro.nombre}</span>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>{logro.desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'cotizador' && (
        <>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Valor de Mercado</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', marginTop: 0 }}>Descubre lo difícil que es conseguir un cromo en base a la oferta y la demanda actual.</p>
            
            <select className="input-field" value={selCotizador} onChange={e => { setSelCotizador(e.target.value); setNumCotizador(''); setStatsCotizador(null); }} style={{ marginBottom: '10px', padding: '10px 14px' }}>
              <option value="">Selecciona el equipo...</option>
              {albumInfo.selecciones.map(sel => <option key={sel.id} value={sel.id}>{sel.nombre}</option>)}
            </select>

            {selCotizador && (
              <select className="input-field" value={numCotizador} onChange={e => { setNumCotizador(e.target.value); setStatsCotizador(null); }} style={{ marginBottom: '14px', padding: '10px 14px' }}>
                <option value="">Selecciona el cromo...</option>
                {Array.from({ length: selInfo?.total || 0 }).map((_, i) => (
                  <option key={i} value={i + 1}>{i === 0 ? 'Escudo' : `Cromo ${i + 1}`}</option>
                ))}
              </select>
            )}

            <button onClick={calcularCotizacion} className="btn-primary" style={{ width: '100%' }} disabled={!selCotizador || !numCotizador}>Analizar Mercado</button>
          </div>

          {statsCotizador && (
            <div className="card" style={{ textAlign: 'center', padding: '20px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.5px' }}>Dificultad Estimada</div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: getDificultad().color, margin: '8px 0 16px 0' }}>{getDificultad().texto}</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ background: '#FEF2F2', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#EF4444' }}>{statsCotizador.loBuscan}</div>
                  <div style={{ fontSize: '11px', color: '#DC2626', fontWeight: 'bold' }}>Lo buscan</div>
                </div>
                <div style={{ background: '#ECFDF5', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>{statsCotizador.loTienenRepetido}</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 'bold' }}>Lo ofrecen</div>
                </div>
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: '12px 0 0 0' }}>Datos basados en los últimos {statsCotizador.total} usuarios activos en el mercado.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}