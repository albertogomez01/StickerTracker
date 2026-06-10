import React, { useState } from 'react';
import { SELECCIONES } from './utils';

export default function Album({ perfil, alternarCromoManual }) {
  const [seleccionExpandida, setSeleccionExpandida] = useState(null);

  const renderDigitalFlag = (sel) => {
    if (sel.id === 'FWC') return <span style={{ fontSize: '18px' }}>🏆</span>;
    if (sel.id === 'CC') return <span style={{ fontSize: '18px' }}>🥤</span>;
    return <img src={`https://flagcdn.com/w40/${sel.flagCode}.png`} alt="" style={{ width: '22px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} />;
  };

  return (
    <div className="card" style={{ padding: '12px' }}>
      {SELECCIONES.map(sel => {
        let tEnFila = 0;
        for (let i = 0; i < sel.total; i++) {
          if ((perfil.stickers?.[`${sel.id}_${i.toString().padStart(2, '0')}`] || 0) >= 1) tEnFila++;
        }
        return (
          <div key={sel.id} style={{ borderBottom: '1px solid #F1F5F9', padding: '14px 0' }}>
            <div onClick={() => setSeleccionExpandida(seleccionExpandida === sel.id ? null : sel.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', WebkitTapHighlightColor: 'transparent' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
                {renderDigitalFlag(sel)}
                <span style={{ fontWeight: '700', fontSize: '13px', width: '40px' }}>{sel.id}</span>
                <span style={{ fontSize: '13px' }}>{sel.nombre} <span style={{ color: '#94A3B8', fontSize: '11px' }}>({tEnFila}/{sel.total})</span></span>
              </div>
              <span style={{ color: '#94A3B8', fontSize: '10px' }}>{seleccionExpandida === sel.id ? '▲' : '▼'}</span>
            </div>
            {seleccionExpandida === sel.id && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))', gap: '8px', marginTop: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '16px' }}>
                {Array.from({ length: sel.total }).map((_, index) => {
                  const numeroVisual = index + 1;
                  const codigo = `${sel.id}_${index.toString().padStart(2, '0')}`;
                  const estado = perfil.stickers?.[codigo] || 0;
                  let bg = estado === 1 ? '#10B981' : estado >= 2 ? '#F59E0B' : '#EF4444';
                  let txt = numeroVisual === 1 ? '🛡️ Escudo' : `${sel.id} ${numeroVisual}`;
                  if (estado >= 2) txt += ` (x${estado - 1})`;
                  return (
                    <button key={codigo} onClick={() => alternarCromoManual(codigo)} className="sticker-btn" style={{ background: bg }}>
                      {txt}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}