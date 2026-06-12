import React, { useState, useEffect, useRef } from 'react';
import { parsearTextoAStickers, ALBUMS } from './utils';
import AmigoCard from './AmigoCard';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, addDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Intercambios({ perfil, albumActivo, onLogout }) {
  const [comunidadUsuarios, setComunidadUsuarios] = useState([]);
  const [datosCargados, setDatosCargados] = useState(false);
  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState('');
  const [busquedaAmigo, setBusquedaAmigo] = useState('');
  const [soloCompatibles, setSoloCompatibles] = useState(false);
  
  const [chatAmigo, setChatAmigo] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const messagesEndRef = useRef(null);

  const getCol = (base) => albumActivo === 'mundial_2026' ? base : `${base}_${albumActivo}`;
  const localKey = albumActivo === 'mundial_2026' ? 'panini_amigos' : `panini_amigos_${albumActivo}`;

  useEffect(() => {
    setBusquedaAmigo('');
    setNuevoAmigoNombre('');
    setSoloCompatibles(false);
  }, [albumActivo]);

  useEffect(() => {
    if (!perfil?.id) {
      setDatosCargados(true);
      return;
    }
    setDatosCargados(false); // Reset para evitar que guarde basura al cambiar
    
    // 🎧 Escuchamos la lista de amigos en tiempo real
    const unsub = onSnapshot(doc(db, getCol("amigos"), perfil.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().lista || [];
        setComunidadUsuarios(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      } else {
        const guardado = localStorage.getItem(localKey);
        if (guardado) setComunidadUsuarios(JSON.parse(guardado));
        else setComunidadUsuarios([]);
      }
      setDatosCargados(true);
    });
    return () => unsub();
  }, [perfil?.id, albumActivo]);

  useEffect(() => {
    if (!chatAmigo || !perfil?.id) return;
    const chatId = [perfil.id, chatAmigo.id].sort().join('_');
    const q = query(collection(db, getCol('chats'), chatId, 'mensajes'), orderBy('timestamp', 'asc'));
    const unsub = onSnapshot(q, (snap) => {
      const msgs = [];
      snap.forEach(d => msgs.push({ id: d.id, ...d.data() }));
      setMensajes(msgs);
    });
    return () => unsub();
  }, [chatAmigo, perfil?.id, albumActivo]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes]);

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;
    const chatId = [perfil.id, chatAmigo.id].sort().join('_');
    const textoMensaje = nuevoMensaje.trim();
    setNuevoMensaje(''); 
    try {
      await addDoc(collection(db, getCol('chats'), chatId, 'mensajes'), {
        text: textoMensaje,
        from: perfil.id,
        timestamp: Date.now()
      });
      
      const notifRef = doc(db, 'notificaciones', chatAmigo.id);
      const notifSnap = await getDoc(notifRef);
      let notifs = notifSnap.exists() ? (notifSnap.data().lista || []) : [];
      notifs.push({ id: Date.now().toString(), text: `@${perfil.nickname} te ha enviado un mensaje.`, read: false });
      await setDoc(notifRef, { lista: notifs });
    } catch(err) {
      console.error(err);
      toast.error("Error al enviar el mensaje");
    }
  };

  useEffect(() => {
    if (!datosCargados) return; // No guardamos hasta haber cargado primero
    try {
      localStorage.setItem(localKey, JSON.stringify(comunidadUsuarios));
    } catch (error) { console.error("Error al guardar amigos:", error); }
  }, [comunidadUsuarios, datosCargados, localKey]);

  const guardarEnNube = (nuevaLista) => {
    if (perfil?.id) setDoc(doc(db, getCol("amigos"), perfil.id), { lista: nuevaLista }).catch(e => console.error(e));
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
          let nuevosStickers = parsearTextoAStickers(faltantes, 'faltantes', albumActivo, u.stickers || {});
          nuevosStickers = parsearTextoAStickers(repetidos, 'repetidos', albumActivo, nuevosStickers);
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
      for (const sel of ALBUMS[albumActivo].selecciones) {
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

  if (perfil?.id?.startsWith('invitado_')) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '40px 20px', marginTop: '20px' }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
        <h3 style={{ color: 'var(--accent-primary)', marginBottom: '12px' }}>Función Multijugador</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '20px' }}>
          La sección de Intercambios y el Chat Privado son exclusivos para usuarios registrados. Inicia sesión con una cuenta de Google para conectar con tus amigos.
        </p>
        <button onClick={onLogout} className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px', borderRadius: '10px', marginBottom: '16px' }}>
          Iniciar Sesión
        </button>
        <p style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
          (Al iniciar sesión, saldrás del modo invitado).
        </p>
      </div>
    );
  }

  if (chatAmigo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 180px)' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', marginBottom: '8px' }}>
          <button onClick={() => setChatAmigo(null)} className="btn-secondary" style={{ padding: '6px 12px' }}>Volver</button>
          <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Chat con @{chatAmigo.nickname}</div>
        </div>
        <div className="card" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', marginBottom: '8px' }}>
          {mensajes.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '13px', marginTop: '20px' }}>No hay mensajes. Escribe algo para empezar.</div>
          ) : (
            mensajes.map(m => {
              const isMe = m.from === perfil.id;
              return (
                <div key={m.id} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', background: isMe ? 'var(--accent-primary)' : 'var(--bg-input)', color: isMe ? 'white' : 'var(--text-primary)', padding: '8px 12px', borderRadius: '12px', maxWidth: '80%', fontSize: '14px', borderBottomRightRadius: isMe ? '2px' : '12px', borderBottomLeftRadius: isMe ? '12px' : '2px' }}>
                  {m.text}
                  <div style={{ fontSize: '10px', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                    {new Date(m.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={enviarMensaje} style={{ display: 'flex', gap: '8px' }}>
          <input type="text" value={nuevoMensaje} onChange={e => setNuevoMensaje(e.target.value)} className="input-field" placeholder="Escribe un mensaje..." style={{ flex: 1, padding: '12px 14px' }} />
          <button type="submit" className="btn-primary" style={{ padding: '12px 20px' }}>Enviar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card">
        <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>Buscar usuario por apodo</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" value={busquedaAmigo} onChange={(e) => setBusquedaAmigo(e.target.value)} placeholder="Apodo del amigo..." className="input-field" style={{ flex: 1 }} />
          <button type="button" onClick={() => setSoloCompatibles(!soloCompatibles)} className={soloCompatibles ? "btn-primary" : "btn-secondary"} style={{ padding: '0 12px', fontSize: '13px', background: soloCompatibles ? '#10B981' : '', color: soloCompatibles ? '#FFF' : '', borderColor: soloCompatibles ? '#10B981' : '' }}>
            {soloCompatibles ? 'Compatibles' : 'Todos'}
          </button>
        </div>
        <form onSubmit={añadirAmigoNuevo} style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', gap: '8px' }}>
          <input type="text" value={nuevoAmigoNombre} onChange={(e) => setNuevoAmigoNombre(e.target.value)} placeholder="Nombre del amigo..." className="input-field" style={{ flex: 1, fontSize: '14px' }} />
          <button type="submit" className="btn-primary" style={{ background: '#6EE7B7', color: '#0F766E' }}>Añadir</button>
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
            albumActivo={albumActivo}
            onOpenChat={setChatAmigo}
          />
        ))
      )}
    </div>
  );
}