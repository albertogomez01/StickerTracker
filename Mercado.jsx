import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { SELECCIONES } from './utils';

export default function Mercado({ perfil }) {
  const [usuariosMercado, setUsuariosMercado] = useState([]);
  const [publicado, setPublicado] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!perfil?.id) return;
    getDoc(doc(db, 'mercado', perfil.id)).then(snap => {
      setPublicado(snap.exists());
    });
  }, [perfil?.id]);

  const togglePublicar = async () => {
    setLoading(true);
    try {
      if (publicado) {
        await deleteDoc(doc(db, 'mercado', perfil.id));
        setPublicado(false);
        alert("Tu perfil ya no es visible en el mercado.");
      } else {
        await setDoc(doc(db, 'mercado', perfil.id), {
          nickname: perfil.nickname,
          stickers: perfil.stickers,
          timestamp: Date.now()
        });
        setPublicado(true);
        alert("¡Tu lista ha sido publicada en el mercado!");
      }
    } catch (e) {
      console.error(e);
      alert("Hubo un error al actualizar tu estado en el mercado.");
    }
    setLoading(false);
  };

  const buscarMatches = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'mercado'));
      const matches = [];

      querySnapshot.forEach((document) => {
        if (document.id === perfil.id) return; // Saltarnos a nosotros mismos
        const data = document.data();
        
        let leDoy = 0;
        let meDa = 0;

        SELECCIONES.forEach(sel => {
          for (let i = 0; i < sel.total; i++) {
            const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
            const miSticker = perfil?.stickers?.[cod] || 0;
            const suSticker = data.stickers?.[cod] || 0;

            if (miSticker >= 2 && suSticker === 0) leDoy++;
            if (suSticker >= 2 && miSticker === 0) meDa++;
          }
        });

        // Solo mostrar usuarios con los que tenemos AL MENOS 1 cromo de intercambio útil
        if (leDoy > 0 || meDa > 0) {
          matches.push({ id: document.id, nickname: data.nickname, leDoy, meDa, total: leDoy + meDa, stickers: data.stickers });
        }
      });

      // Ordenar por la suma total de cromos útiles para ambos
      matches.sort((a, b) => b.total - a.total);
      setUsuariosMercado(matches);
      if (matches.length === 0) alert("No se encontraron usuarios con cromos compatibles por ahora.");
    } catch (e) {
      console.error(e);
      alert("Error al buscar en el mercado. Revisa los permisos de Firebase.");
    }
    setLoading(false);
  };

  const añadirAmigo = async (matchUser) => {
    try {
      const amigosRef = doc(db, 'amigos', perfil.id);
      const snap = await getDoc(amigosRef);
      let lista = snap.exists() ? (snap.data().lista || []) : [];
      
      if (lista.some(u => u.id === matchUser.id)) {
        return alert("Ya tienes a este usuario en tu lista de intercambios.");
      }

      const nuevoAmigo = { id: matchUser.id, nickname: matchUser.nickname, stickers: matchUser.stickers, rawFaltantes: '', rawRepetidos: '' };
      lista.push(nuevoAmigo);
      await setDoc(amigosRef, { lista });

      // 🔔 Enviar notificación al usuario destino
      try {
        const notifRef = doc(db, 'notificaciones', matchUser.id);
        const notifSnap = await getDoc(notifRef);
        let notifs = notifSnap.exists() ? (notifSnap.data().lista || []) : [];
        notifs.push({ id: Date.now().toString(), text: `¡@${perfil.nickname} te añadió desde el Mercado Público!`, read: false });
        await setDoc(notifRef, { lista: notifs });
      } catch (err) {
        console.error("No se pudo enviar la notificación.", err);
      }

      alert(`¡${matchUser.nickname} añadido a tu pestaña de Intercambios!`);
    } catch (e) {
      console.error(e);
      alert("Error al añadir amigo.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card">
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>🌍 Mercado Público</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', marginTop: 0 }}>Publica tu lista actual de cromos para que otros puedan encontrarte, o busca personas con las que tengas alta compatibilidad.</p>
        <button onClick={togglePublicar} className={publicado ? "btn-danger" : "btn-primary"} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} disabled={loading}>{loading ? '⏳ Procesando...' : (publicado ? 'Ocultar mi perfil del Mercado' : '📢 Publicar mi lista en el Mercado')}</button>
      </div>
      <div className="card" style={{ padding: '12px' }}>
        <button onClick={buscarMatches} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} disabled={loading}>🔍 {loading ? 'Buscando...' : 'Buscar Intercambios Compatibles'}</button>
      </div>
      {usuariosMercado.length > 0 && <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}><h4 style={{ margin: '0 4px', fontSize: '14px', color: 'var(--text-secondary)' }}>Resultados ({usuariosMercado.length})</h4>{usuariosMercado.map(user => (<div key={user.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}><div><div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)' }}>@{user.nickname}</div><div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Me da: <span style={{ color: '#D97706', fontWeight: 'bold' }}>{user.meDa}</span> | Le doy: <span style={{ color: '#059669', fontWeight: 'bold' }}>{user.leDoy}</span></div></div><button onClick={() => añadirAmigo(user)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px' }}>Añadir</button></div>))}</div>}
    </div>
  );
}