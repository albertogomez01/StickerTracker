import React, { useState, useEffect } from 'react';
import { parsearTextoAStickers, SELECCIONES } from './utils';
import AmigoCard from './AmigoCard';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Intercambios({ perfil }) {
  const [comunidadUsuarios, setComunidadUsuarios] = useState([]);
  const [datosCargados, setDatosCargados] = useState(false);
  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState('');
  const [busquedaAmigo, setBusquedaAmigo] = useState('');
  const [soloCompatibles, setSoloCompatibles] = useState(false);

  useEffect(() => {
    if (!perfil?.id) {
      setDatosCargados(true);
      return;
    }
    
    // 🎧 Escuchamos la lista de amigos en tiempo real
    const unsub = onSnapshot(doc(db, "amigos", perfil.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().lista || [];
        setComunidadUsuarios(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      } else {
        const guardado = localStorage.getItem('panini_amigos');
        if (guardado) setComunidadUsuarios(JSON.parse(guardado));
      }
      setDatosCargados(true);
    });
    return () => unsub();
  }, [perfil?.id]);

  useEffect(() => {
    if (!datosCargados) return; // No guardamos hasta haber cargado primero
    try {
      localStorage.setItem('panini_amigos', JSON.stringify(comunidadUsuarios));
    } catch (error) { console.error("Error al guardar amigos:", error); }
  }, [comunidadUsuarios, datosCargados]);

  const guardarEnNube = (nuevaLista) => {
    if (perfil?.id) setDoc(doc(db, "amigos", perfil.id), { lista: nuevaLista }).catch(e => console.error(e));
  };

  const añadirAmigoNuevo = (e) => {
    e.preventDefault();
    if (!nuevoAmigoNombre.trim()) return;
    const nombreLimpio = nuevoAmigoNombre.trim();
    if (comunidadUsuarios.some(u => u.nickname.toLowerCase() === nombreLimpio.toLowerCase())) {
      return toast.error("Este amigo ya está en tu lista.");
    }
    const nuevoAmigo = { id: 'u_' + Date.now(), nickname: nombreLimpio, stickers: {}, rawFaltantes: '', rawRepetidos: '' };
    setComunidadUsuarios(prev => {
      const nueva = [nuevoAmigo, ...prev];
      guardarEnNube(nueva);
      return nueva;
    });
    setNuevoAmigoNombre('');
  };

  const eliminarAmigo = (idAmigo) => {
    if (!window.confirm("¿Seguro que quieres eliminar a este amigo de tu lista?")) return;
    setComunidadUsuarios(prev => {
      const nueva = prev.filter(u => u.id !== idAmigo);
      guardarEnNube(nueva);
      return nueva;
    });
  };

  const guardarListasAmigo = (idAmigo, faltantes, repetidos, avatarColor) => {
    setComunidadUsuarios(prev => {
      const nueva = prev.map(u => {
        if (u.id === idAmigo) {
          let nuevosStickers = parsearTextoAStickers(faltantes, 'faltantes', {});
          nuevosStickers = parsearTextoAStickers(repetidos, 'repetidos', nuevosStickers);
          return { ...u, stickers: nuevosStickers, rawFaltantes: faltantes, rawRepetidos: repetidos, avatarColor };
        }
        return u;
      });
      guardarEnNube(nueva);
      return nueva;
    });
  };

  const amigosFiltrados = comunidadUsuarios.filter(u => {
    const coincideTexto = u.nickname.toLowerCase().includes(busquedaAmigo.toLowerCase());
    if (!coincideTexto) return false;

    if (soloCompatibles) {
      let compatible = false;
      for (const sel of SELECCIONES) {
        for (let i = 0; i < sel.total; i++) {
          const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
          const miEstado = perfil?.stickers?.[cod] || 0;
          const suEstado = u.stickers?.[cod] || 0;
          if ((miEstado >= 2 && suEstado === 0) || (suEstado >= 2 && miEstado === 0)) {
            compatible = true;
            break;
          }
        }
        if (compatible) break;
      }
      return compatible;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card">
        <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>🔍 Buscar usuario por apodo</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" value={busquedaAmigo} onChange={(e) => setBusquedaAmigo(e.target.value)} placeholder="Apodo del amigo..." className="input-field" style={{ flex: 1 }} />
          <button type="button" onClick={() => setSoloCompatibles(!soloCompatibles)} className={soloCompatibles ? "btn-primary" : "btn-secondary"} style={{ padding: '0 12px', fontSize: '13px', background: soloCompatibles ? '#10B981' : '', color: soloCompatibles ? '#FFF' : '', borderColor: soloCompatibles ? '#10B981' : '' }}>
            {soloCompatibles ? '✅ Compatibles' : '🔀 Todos'}
          </button>
        </div>
        <form onSubmit={añadirAmigoNuevo} style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', gap: '8px' }}>
          <input type="text" value={nuevoAmigoNombre} onChange={(e) => setNuevoAmigoNombre(e.target.value)} placeholder="Nombre del amigo..." className="input-field" style={{ flex: 1, fontSize: '14px' }} />
          <button type="submit" className="btn-primary" style={{ background: '#6EE7B7', color: '#0F766E' }}>➕ Añadir</button>
        </form>
      </div>
      {amigosFiltrados.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>No tienes amigos en la lista. Escribe un nombre arriba para añadirlo.</div>
      ) : (
        amigosFiltrados.map(amigo => (
          <AmigoCard 
            key={amigo.id} 
            amigo={amigo} 
            perfil={perfil} 
            onGuardar={guardarListasAmigo} 
            onEliminar={eliminarAmigo} 
          />
        ))
      )}
    </div>
  );
}