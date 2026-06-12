import React, { useState } from 'react';
import { ALBUMS } from './utils';
import { toast } from 'react-hot-toast';

export default function Importar({ procesarImportadorTexto, perfil, albumActivo }) {
  const [textoFaltantes, setTextoFaltantes] = useState('');
  const [textoRepetidos, setTextoRepetidos] = useState('');

  const generarTextoListas = (paraWhatsApp = false) => {
    let faltantes = [];
    let repetidos = [];
    const albumData = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];
    const seleccionesAlbum = albumData.selecciones || [];
    const isSequential = albumData.isSequential;

    if (isSequential) {
      let fSeq = [];
      let rSeq = [];
      let currentSeq = 1;
      seleccionesAlbum.forEach(sel => {
        for (let i = 0; i < sel.total; i++) {
          const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
          const v = perfil?.stickers?.[cod] || 0;
          const absNum = currentSeq + i;
          if (v === 0) fSeq.push(absNum);
          else if (v >= 2) rSeq.push(v > 2 ? `${absNum}x${v - 1}` : `${absNum}`);
        }
        currentSeq += sel.total;
      });
      if (fSeq.length > 0) faltantes.push(fSeq.join(', '));
      if (rSeq.length > 0) repetidos.push(rSeq.join(', '));
    } else {
      seleccionesAlbum.forEach(sel => {
        let fSel = [];
        let rSel = [];
        for (let i = 0; i < sel.total; i++) {
          const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
          const v = perfil?.stickers?.[cod] || 0;
          if (v === 0) fSel.push(i + 1);
          else if (v >= 2) rSel.push(v > 2 ? `${i + 1}x${v - 1}` : `${i + 1}`);
        }
        if (fSel.length > 0) faltantes.push(`${sel.id}: ${fSel.join(', ')}`);
        if (rSel.length > 0) repetidos.push(`${sel.id}: ${rSel.join(', ')}`);
      });
    }

    if (paraWhatsApp) {
      return `*MIS FALTANTES - ${ALBUMS[albumActivo]?.nombre || 'Mundial 2026'}*\n${faltantes.join('\n')}\n\n*MIS REPETIDOS*\n${repetidos.join('\n')}`;
    }
    return `FALTAN:\n${faltantes.join('\n')}\n\nREPETIDOS:\n${repetidos.join('\n')}`;
  };

  const exportarListas = () => {
    const textoFinal = generarTextoListas();
    navigator.clipboard.writeText(textoFinal).then(() => {
      toast.success("¡Listas copiadas al portapapeles!");
    }).catch(() => {
      toast.error("Error al copiar al portapapeles.");
    });
  };

  const compartirPorWhatsApp = () => {
    const textoFinal = generarTextoListas(true);
    const textoCodificado = encodeURIComponent(textoFinal);
    window.open(`https://wa.me/?text=${textoCodificado}`, '_blank');
  };

  const albumData = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];
  const isSequential = albumData.isSequential;
  const placeFaltantes = isSequential ? "1, 2, 5-10, 15..." : "ESP: 1, 2, 5...";
  const placeRepetidos = isSequential ? "3x2, 12, 40-42..." : "MEX: 3x2, ESP: 12...";

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#10B981' }}>Exportar mis listas</h3>
        <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '10px', marginTop: 0 }}>Copia tus faltantes y repetidos para enviarlos por WhatsApp.</p>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={exportarListas} className="btn-primary" style={{ background: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1 }}>
            Copiar
          </button>
          <button onClick={compartirPorWhatsApp} className="btn-primary" style={{ background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', flex: 1 }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/></svg>
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>Pegar Lista de Faltantes</h3>
        <textarea value={textoFaltantes} onChange={(e) => setTextoFaltantes(e.target.value)} placeholder={placeFaltantes} className="input-field" style={{ height: '90px', marginBottom: '10px' }} />
        <button onClick={() => { procesarImportadorTexto(textoFaltantes, 'faltantes'); setTextoFaltantes(''); }} className="btn-primary">Calcular Álbum Completo</button>
      </div>

      <div className="card">
        <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#F59E0B' }}>Actualizar Lista de Repetidos</h3>
        <textarea value={textoRepetidos} onChange={(e) => setTextoRepetidos(e.target.value)} placeholder={placeRepetidos} className="input-field" style={{ height: '90px', marginBottom: '10px' }} />
        <button onClick={() => { procesarImportadorTexto(textoRepetidos, 'repetidos'); setTextoRepetidos(''); }} className="btn-primary">Actualizar repetidos</button>
      </div>
    </div>
  );
}