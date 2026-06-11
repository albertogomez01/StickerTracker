import React, { useState } from 'react';
import { db } from './firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { ALBUMS } from './utils';
import { toast } from 'react-hot-toast';

export default function Estadisticas({ albumActivo }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCol = (base) => albumActivo === 'mundial_2026' ? base : `${base}_${albumActivo}`;

  useEffect(() => {
    setStats(null);
  }, [albumActivo]);

  const calcularEstadisticas = async () => {
    setLoading(true);
    setStats(null);
    try {
      const qStats = query(collection(db, getCol('mercado')), orderBy('timestamp', 'desc'), limit(100));
      const mercadoSnapshot = await getDocs(qStats);
      const totalUsuarios = mercadoSnapshot.size;
      
      if (totalUsuarios < 2) {
        toast.error("Se necesitan al menos 2 usuarios en el mercado para calcular estadísticas.");
        setLoading(false);
        return;
      }

      const stickerCounts = {};

      mercadoSnapshot.forEach(doc => {
        const userData = doc.data();
        for (const stickerCode in userData.stickers) {
          if (userData.stickers[stickerCode] >= 1) { // Si el usuario tiene el cromo
            stickerCounts[stickerCode] = (stickerCounts[stickerCode] || 0) + 1;
          }
        }
      });

      const allStickersStats = [];
      ALBUMS[albumActivo].selecciones.forEach(sel => {
        for (let i = 0; i < sel.total; i++) {
          const codigo = `${sel.id}_${i.toString().padStart(2, '0')}`;
          const count = stickerCounts[codigo] || 0;
          const porcentaje = (count / totalUsuarios) * 100;
          const tag = i === 0 ? `${sel.id} Escudo` : `${sel.id} ${i + 1}`;
          allStickersStats.push({ codigo, tag, porcentaje });
        }
      });

      allStickersStats.sort((a, b) => a.porcentaje - b.porcentaje);

      const masDificiles = allStickersStats.slice(0, 10);
      const masComunes = allStickersStats.slice(-10).reverse();

      setStats({ masDificiles, masComunes, totalUsuarios });

    } catch (e) {
      console.error(e);
      toast.error("Error al calcular las estadísticas.");
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card">
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Estadísticas de la Comunidad</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', marginTop: 0 }}>
          Descubre cuáles son los cromos más raros y los más comunes entre todos los usuarios que han publicado su perfil en el mercado.
        </p>
        <button onClick={calcularEstadisticas} className="btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? 'Calculando...' : 'Analizar Cromos de la Comunidad'}
        </button>
      </div>

      {stats && (
        <>
          <p style={{textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)', margin: '0'}}>
            Estadísticas basadas en <strong>{stats.totalUsuarios}</strong> perfiles públicos.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="card" style={{margin: 0}}><h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#EF4444' }}>Top 10 Más Difíciles</h4><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{stats.masDificiles.map(s => (<div key={s.codigo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}><span style={{ fontWeight: '600' }}>{s.tag}</span><span style={{ background: '#FEF2F2', color: '#DC2626', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>{s.porcentaje.toFixed(1)}%</span></div>))}</div></div>
            <div className="card" style={{margin: 0}}><h4 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#10B981' }}>Top 10 Más Comunes</h4><div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{stats.masComunes.map(s => (<div key={s.codigo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}><span style={{ fontWeight: '600' }}>{s.tag}</span><span style={{ background: '#ECFDF5', color: '#059669', padding: '2px 8px', borderRadius: '99px', fontSize: '11px', fontWeight: 'bold' }}>{s.porcentaje.toFixed(1)}%</span></div>))}</div></div>
          </div>
        </>
      )}
    </div>
  );
}