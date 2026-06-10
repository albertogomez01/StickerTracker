import React, { useState } from 'react';
import { SELECCIONES } from './utils';

export default function Importar({ procesarImportadorTexto, perfil }) {
  const [textoFaltantes, setTextoFaltantes] = useState('');
  const [textoRepetidos, setTextoRepetidos] = useState('');

  const exportarListas = () => {
    let faltantes = [];
    let repetidos = [];

    SELECCIONES.forEach(sel => {
      let fSel = [];
      let rSel = [];
      for (let i = 0; i < sel.total; i++) {
        const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
        const v = perfil?.stickers?.[cod] || 0;
        if (v === 0) fSel.push(i + 1);
        else if (v >= 2) {
          rSel.push(v > 2 ? `${i + 1}x${v - 1}` : `${i + 1}`);
        }
      }
      if (fSel.length > 0) faltantes.push(`${sel.id}: ${fSel.join(', ')}`);
      if (rSel.length > 0) repetidos.push(`${sel.id}: ${rSel.join(', ')}`);
    });

    const textoFinal = `🚫 FALTAN:\n${faltantes.join('\n')}\n\n🔄 REPETIDOS:\n${repetidos.join('\n')}`;
    navigator.clipboard.writeText(textoFinal).then(() => {
      alert("¡Listas copiadas al portapapeles!");
    }).catch(() => {
      alert("Error al copiar al portapapeles.");
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#10B981' }}>📤 Exportar mis listas</h3>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', marginTop: 0 }}>Copia tus faltantes y repetidos para enviarlos por WhatsApp.</p>
        <button onClick={exportarListas} className="btn-primary" style={{ background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <span>📋</span> Copiar al Portapapeles
        </button>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>🚫 Pegar Lista de Faltantes</h3>
        <textarea value={textoFaltantes} onChange={(e) => setTextoFaltantes(e.target.value)} placeholder="ESP: 1, 2, 5..." className="input-field" style={{ height: '90px', marginBottom: '10px' }} />
        <button onClick={() => { procesarImportadorTexto(textoFaltantes, 'faltantes'); setTextoFaltantes(''); }} className="btn-primary">✓ Calcular Álbum Completo</button>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#F59E0B' }}>🔄 Actualizar Lista de Repetidos</h3>
        <textarea value={textoRepetidos} onChange={(e) => setTextoRepetidos(e.target.value)} placeholder="MEX: 3x2, ESP: 12..." className="input-field" style={{ height: '90px', marginBottom: '10px' }} />
        <button onClick={() => { procesarImportadorTexto(textoRepetidos, 'repetidos'); setTextoRepetidos(''); }} className="btn-primary">✓ Actualizar repetidos</button>
      </div>
    </div>
  );
}