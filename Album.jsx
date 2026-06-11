import React, { useState } from 'react';
import { ALBUMS } from './utils';

let globalAudioCtx = null;

export default function Album({ perfil, alternarCromoManual, marcarEquipoCompleto, isMuted, albumActivo }) {
  const [seleccionExpandida, setSeleccionExpandida] = useState(null);
  const [animatingSticker, setAnimatingSticker] = useState(null);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'faltantes', 'repetidos'
  const [busquedaAlbum, setBusquedaAlbum] = useState('');

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
    if (sel.flagCode) return <img src={`https://flagcdn.com/w40/${sel.flagCode}.png`} alt="" style={{ width: '22px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} />;
    return <span style={{ fontSize: '14px', fontWeight: 'bold' }}>⚽</span>;
  };

  // Filtramos las selecciones para ocultar los países que no tienen cromos que coincidan
  const seleccionesFiltradas = (ALBUMS[albumActivo] || ALBUMS['mundial_2026']).selecciones.filter(sel => {
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ padding: '12px' }}>
        <input type="text" value={busquedaAlbum} onChange={(e) => { setBusquedaAlbum(e.target.value); setSeleccionExpandida(null); }} placeholder="Buscar país o código (ej: Argentina, ARG)..." className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
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
                {pctSel < 100 && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <button onClick={(e) => { e.stopPropagation(); marcarEquipoCompleto(sel.id); }} className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      Completar equipo
                    </button>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '8px' }}>
                  {Array.from({ length: sel.total })
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
                  })
                  .map(s => {
                    let bg = s.estado === 1 ? '#10B981' : s.estado >= 2 ? '#F59E0B' : '#EF4444';
                    let txt = s.numeroVisual === 1 ? 'Escudo' : `${sel.id} ${s.numeroVisual}`;
                    if (s.estado >= 2) txt += ` (x${s.estado - 1})`;
                    return (
                      <button key={s.codigo} onClick={() => handleStickerClick(s.codigo)} className={`sticker-btn ${animatingSticker === s.codigo ? 'animate-pop' : ''}`} style={{ background: bg }}>
                        {txt}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </div>
    </div>
  );
}