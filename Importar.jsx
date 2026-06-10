import React, { useState } from 'react';

export default function Importar({ procesarImportadorTexto }) {
  const [textoFaltantes, setTextoFaltantes] = useState('');
  const [textoRepetidos, setTextoRepetidos] = useState('');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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