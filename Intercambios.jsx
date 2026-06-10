import React, { useState, useEffect } from 'react';
import { parsearTextoAStickers } from './utils';
import AmigoCard from './AmigoCard';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function Intercambios({ perfil }) {
  const [comunidadUsuarios, setComunidadUsuarios] = useState([]);
  const [datosCargados, setDatosCargados] = useState(false);
  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState('');
  const [busquedaAmigo, setBusquedaAmigo] = useState('');

  useEffect(() => {
    const cargarAmigos = async () => {
      if (perfil?.id) {
        const docRef = doc(db, "amigos", perfil.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setComunidadUsuarios(docSnap.data().lista || []);
        } else {
          const guardado = localStorage.getItem('panini_amigos');
          if (guardado) setComunidadUsuarios(JSON.parse(guardado));
        }
      }
      setDatosCargados(true);
    };
    cargarAmigos();
  }, [perfil?.id]);

  useEffect(() => {
    if (!datosCargados) return; // No guardamos hasta haber cargado primero
    try {
      localStorage.setItem('panini_amigos', JSON.stringify(comunidadUsuarios));
      if (perfil?.id) {
        setDoc(doc(db, "amigos", perfil.id), { lista: comunidadUsuarios }).catch(e => console.error("Error nube:", e));
      }
    } catch (error) { console.error("Error al guardar amigos:", error); }
  }, [comunidadUsuarios, datosCargados, perfil?.id]);

  const añadirAmigoNuevo = (e) => {
    e.preventDefault();
    if (!nuevoAmigoNombre.trim()) return;
    const nombreLimpio = nuevoAmigoNombre.trim();
    if (comunidadUsuarios.some(u => u.nickname.toLowerCase() === nombreLimpio.toLowerCase())) {
      return alert("Este amigo ya está en tu lista.");
    }
    const nuevoAmigo = { id: 'u_' + Date.now(), nickname: nombreLimpio, stickers: {}, rawFaltantes: '', rawRepetidos: '' };
    setComunidadUsuarios(prev => [nuevoAmigo, ...prev]);
    setNuevoAmigoNombre('');
  };

  const eliminarAmigo = (idAmigo) => {
    if (!window.confirm("¿Seguro que quieres eliminar a este amigo de tu lista?")) return;
    setComunidadUsuarios(prev => prev.filter(u => u.id !== idAmigo));
  };

  const guardarListasAmigo = (idAmigo, faltantes, repetidos) => {
    setComunidadUsuarios(prev => prev.map(u => {
      if (u.id === idAmigo) {
        let nuevosStickers = parsearTextoAStickers(faltantes, 'faltantes', {});
        nuevosStickers = parsearTextoAStickers(repetidos, 'repetidos', nuevosStickers);
        return { ...u, stickers: nuevosStickers, rawFaltantes: faltantes, rawRepetidos: repetidos };
      }
      return u;
    }));
  };

  const amigosFiltrados = comunidadUsuarios.filter(u => u.nickname.toLowerCase().includes(busquedaAmigo.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card">
        <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>🔍 Buscar usuario por apodo</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" value={busquedaAmigo} onChange={(e) => setBusquedaAmigo(e.target.value)} placeholder="Apodo del amigo..." className="input-field" style={{ flex: 1 }} />
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