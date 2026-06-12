import React, { useState, useMemo, useEffect } from 'react';
import { ALBUMS } from './utils';
import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';

let globalAudioCtx = null;

const EXTRA_PLAYERS = [
  "Hakimi", "Davies", "Pulisic", "Gakpo", "C. Ronaldo",
  "Haaland", "Valverde", "Wirtz", "Son", "Doku",
  "Bellingham", "Mbappé", "Lamine", "Messi", "Modrić",
  "Luis Díaz", "Salah", "Caicedo", "Raúl J.", "Vinícius Jr."
];
const EXTRA_VARIANTS = ["Base", "Bronce", "Plata", "Oro"];

export default function Album({ perfil, alternarCromoManual, marcarEquipoCompleto, vaciarEquipoCompleto, isMuted, albumActivo, deshacerUltimo, undoCount }) {
  const [seleccionExpandida, setSeleccionExpandida] = useState(null);
  const [animatingSticker, setAnimatingSticker] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'faltantes', 'repetidos'
  const [busquedaAlbum, setBusquedaAlbum] = useState('');
  const [dificiles, setDificiles] = useState(new Set());

  useEffect(() => {
    const calcularDificiles = async () => {
      const cacheKey = `panini_dificiles_${albumActivo}`;
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < 1000 * 60 * 60 * 12) { // 12 horas de caché
            setDificiles(new Set(data));
            return;
          }
        }
      } catch(e) {}

      try {
        const colName = albumActivo === 'mundial_2026' ? 'mercado' : `mercado_${albumActivo}`;
        const q = query(collection(db, colName), orderBy('timestamp', 'desc'), limit(100));
        const snap = await getDocs(q);
        const mData = [];
        snap.forEach(doc => mData.push(doc.data()));

        const dif = new Set();
        const selecciones = ALBUMS[albumActivo]?.selecciones || [];
        
        selecciones.forEach(sel => {
          for(let i=0; i<sel.total; i++) {
            const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
            let loBuscan = 0;
            let loTienenRepetido = 0;
            mData.forEach(u => {
              const v = u.stickers?.[cod] || 0;
              if (v === 0) loBuscan++;
              else if (v >= 2) loTienenRepetido++;
            });
            if (loBuscan > 0 && (loTienenRepetido / loBuscan) <= 0.3) {
              dif.add(cod);
            }
          }
        });
        
        setDificiles(dif);
        localStorage.setItem(cacheKey, JSON.stringify({ data: Array.from(dif), timestamp: Date.now() }));
      } catch(e) {
        console.error("Error cargando dificultades:", e);
      }
    };

    calcularDificiles();
  }, [albumActivo]);

  const playPopSound = () => {
    if (isMuted) return; // Se omite el sonido si está silenciado

    try {
      if (!globalAudioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        globalAudioCtx = new AudioContext();
      }
      if (globalAudioCtx.state === 'suspended') {
        globalAudioCtx.resume();
      }
      const oscillator = globalAudioCtx.createOscillator();
      const gainNode = globalAudioCtx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(600, globalAudioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(200, globalAudioCtx.currentTime + 0.1);

      gainNode.gain.setValueAtTime(0.3, globalAudioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, globalAudioCtx.currentTime + 0.1);

      oscillator.connect(gainNode);
      gainNode.connect(globalAudioCtx.destination);
      oscillator.start();
      oscillator.stop(globalAudioCtx.currentTime + 0.1);
    } catch (e) {
      console.warn("Audio no soportado o bloqueado en este navegador.");
    }
  };

  const handleStickerClick = (codigo) => {
    playPopSound();
    alternarCromoManual(codigo);
    setAnimatingSticker(codigo);
    setTimeout(() => setAnimatingSticker(null), 300); // Quita la clase tras 300ms
  };

  const renderDigitalFlag = (sel) => {
    if (sel.id === 'FWC') return <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Copa</span>;
    if (sel.id === 'CC') return <span style={{ fontSize: '14px', fontWeight: 'bold' }}>CC</span>;
    if (sel.id === 'EXT26') return <span style={{ fontSize: '14px', fontWeight: 'bold' }}>🌟</span>;
    if (sel.flagCode) return <img src={`https://flagcdn.com/w40/${sel.flagCode}.png`} alt="" loading="lazy" style={{ width: '22px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} />;
    return <span style={{ fontSize: '14px', fontWeight: 'bold' }}>⚽</span>;
  };

  // Filtramos las selecciones para ocultar los países que no tienen cromos que coincidan
  const seleccionesFiltradas = useMemo(() => {
    return (ALBUMS[albumActivo] || ALBUMS['mundial_2026']).selecciones.filter(sel => {
      if (busquedaAlbum.trim() !== '') {
        const termino = busquedaAlbum.toLowerCase();
        if (!sel.nombre.toLowerCase().includes(termino) && !sel.id.toLowerCase().includes(termino)) {
          return false;
        }
      }
      if (filtro === 'todos') return true;
      for (let i = 0; i < sel.total; i++) {
        const estado = perfil.stickers?.[`${sel.id}_${i.toString().padStart(2, '0')}`] || 0;
        if (filtro === 'faltantes' && estado === 0) return true;
        if (filtro === 'repetidos' && estado >= 2) return true;
      }
      return false;
    });
  }, [albumActivo, busquedaAlbum, filtro, perfil.stickers]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ padding: '12px', display: 'flex', gap: '8px' }}>
        <input type="text" value={busquedaAlbum} onChange={(e) => { setBusquedaAlbum(e.target.value); setSeleccionExpandida(null); }} placeholder="Buscar país o código (ej: Argentina, ARG)..." className="input-field" style={{ flex: 1, padding: '10px 14px', fontSize: '14px' }} />
        {undoCount > 0 && (
          <button onClick={deshacerUltimo} className="btn-secondary" style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', borderColor: '#FCA5A5', background: '#FEF2F2', whiteSpace: 'nowrap', fontWeight: 'bold', fontSize: '13px' }} title="Deshacer último cambio">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            Deshacer ({undoCount})
          </button>
        )}
      </div>

      <div className="card" style={{ display: 'flex', gap: '8px', padding: '12px' }}>
        <button onClick={() => setFiltro('todos')} className="btn-secondary" style={{ flex: 1, background: filtro === 'todos' ? 'var(--accent-primary)' : '', color: filtro === 'todos' ? '#FFF' : '', borderColor: filtro === 'todos' ? 'var(--accent-primary)' : '' }}>Todos</button>
        <button onClick={() => setFiltro('faltantes')} className="btn-secondary" style={{ flex: 1, background: filtro === 'faltantes' ? '#EF4444' : '', color: filtro === 'faltantes' ? '#FFF' : '', borderColor: filtro === 'faltantes' ? '#EF4444' : '' }}>Faltan</button>
        <button onClick={() => setFiltro('repetidos')} className="btn-secondary" style={{ flex: 1, background: filtro === 'repetidos' ? '#F59E0B' : '', color: filtro === 'repetidos' ? '#FFF' : '', borderColor: filtro === 'repetidos' ? '#F59E0B' : '' }}>Repes</button>
      </div>

      <div className="card" style={{ padding: '12px' }}>
        {seleccionesFiltradas.length === 0 && (
          <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>No hay cromos que coincidan con este filtro.</div>
        )}
        {seleccionesFiltradas.map(sel => {
        let tEnFila = 0;
        for (let i = 0; i < sel.total; i++) {
          if ((perfil.stickers?.[`${sel.id}_${i.toString().padStart(2, '0')}`] || 0) >= 1) tEnFila++;
        }
        const pctSel = Math.round((tEnFila / sel.total) * 100) || 0;

        return (
          <div key={sel.id} style={{ borderBottom: '1px solid #F1F5F9', padding: '14px 0' }}>
            <div onClick={() => setSeleccionExpandida(seleccionExpandida === sel.id ? null : sel.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', paddingRight: '16px' }}>
                {renderDigitalFlag(sel)}
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                    <span><span style={{ fontWeight: '700', fontSize: '13px', width: '40px', display: 'inline-block' }}>{sel.id}</span> <span style={{ fontSize: '13px' }}>{sel.nombre}</span></span>
                    <span style={{ color: '#94A3B8', fontSize: '11px' }}>{tEnFila}/{sel.total} ({pctSel}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#E2E8F0', borderRadius: '2px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${pctSel}%`, height: '100%', background: pctSel === 100 ? '#10B981' : '#3B82F6', transition: 'width 0.3s ease' }}></div>
                  </div>
                </div>
              </div>
              <span style={{ color: '#94A3B8', fontSize: '10px' }}>{seleccionExpandida === sel.id ? '▲' : '▼'}</span>
            </div>
            {seleccionExpandida === sel.id && (
              <div style={{ marginTop: '12px', background: 'var(--bg-input)', padding: '12px', borderRadius: '16px' }}>
                {(pctSel < 100 || tEnFila > 0) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px', gap: '8px' }}>
                    {tEnFila > 0 && (
                      <button onClick={(e) => { e.stopPropagation(); vaciarEquipoCompleto(sel.id); }} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px', color: '#EF4444', borderColor: '#FCA5A5', background: '#FEF2F2' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Vaciar equipo
                      </button>
                    )}
                    {pctSel < 100 && (
                      <button onClick={(e) => { e.stopPropagation(); marcarEquipoCompleto(sel.id); }} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                        Completar equipo
                      </button>
                    )}
                  </div>
                )}
                {(() => {
                  const stickersData = Array.from({ length: sel.total })
                    .map((_, index) => {
                      const numeroVisual = index + 1;
                      const codigo = `${sel.id}_${index.toString().padStart(2, '0')}`;
                      const estado = perfil.stickers?.[codigo] || 0;
                      return { codigo, numeroVisual, estado };
                    })
                    .filter(s => {
                      if (filtro === 'faltantes') return s.estado === 0;
                      if (filtro === 'repetidos') return s.estado >= 2;
                      return true;
                    });

                  if (sel.id === 'EXT26') {
                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {EXTRA_PLAYERS.map((player, pIdx) => {
                          const playerStickers = stickersData.filter(s => Math.floor((s.numeroVisual - 1) / 4) === pIdx);
                          if (playerStickers.length === 0) return null;
                          return (
                            <div key={player} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-primary)', padding: '10px', borderRadius: '12px' }}>
                              <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                ⚽ {player}
                              </div>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                                {playerStickers.map(s => {
                                  const vIdx = (s.numeroVisual - 1) % 4;
                                  const variantName = EXTRA_VARIANTS[vIdx];
                                  const vColors = ['#E2E8F0', '#B45309', '#94A3B8', '#EAB308'];
                                  let bg = s.estado === 1 ? '#10B981' : s.estado >= 2 ? '#F59E0B' : '#EF4444';
                                  let txt = variantName;
                                  if (s.estado >= 2) txt += ` (x${s.estado - 1})`;
                                  const esDificil = dificiles.has(s.codigo);

                                  return (
                                    <button key={s.codigo} onClick={() => handleStickerClick(s.codigo)} className={`sticker-btn ${animatingSticker === s.codigo ? 'animate-pop' : ''}`} style={{ background: bg, position: 'relative', borderBottom: `3px solid ${vColors[vIdx]}`, padding: '6px 4px', fontSize: '11px' }}>
                                      {esDificil && (
                                        <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--bg-card)', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', zIndex: 10 }}>
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                        </div>
                                      )}
                                      {txt}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  return (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '8px' }}>
                      {stickersData.map(s => {
                        let bg = s.estado === 1 ? '#10B981' : s.estado >= 2 ? '#F59E0B' : '#EF4444';
                        let txt = s.numeroVisual === 1 ? 'Escudo' : `${sel.id} ${s.numeroVisual}`;
                        if (s.estado >= 2) txt += ` (x${s.estado - 1})`;
                        const esDificil = dificiles.has(s.codigo);

                        return (
                          <button key={s.codigo} onClick={() => handleStickerClick(s.codigo)} className={`sticker-btn ${animatingSticker === s.codigo ? 'animate-pop' : ''}`} style={{ background: bg, position: 'relative' }}>
                            {esDificil && (
                              <div style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--bg-card)', borderRadius: '50%', padding: '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', display: 'flex', zIndex: 10 }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="#EAB308" stroke="#CA8A04" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              </div>
                            )}
                            {txt}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}