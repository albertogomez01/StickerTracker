import React, { useState, useEffect, useRef } from 'react';
import { parsearTextoAStickers, ALBUMS } from './utils';
import AmigoCard from './AmigoCard';
import { db } from './firebase';
import { doc, setDoc, getDoc, onSnapshot, collection, query, orderBy, addDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

export default function Intercambios({ perfil, albumActivo, onLogout }) {
  const [comunidadUsuarios, setComunidadUsuarios] = useState([]);
  const [datosCargados, setDatosCargados] = useState(false);
  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState('');
  const [busquedaAmigo, setBusquedaAmigo] = useState('');
  const [soloCompatibles, setSoloCompatibles] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
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
      notifs.push({ 
        id: Date.now().toString(), 
        title: `Nuevo mensaje de @${perfil.nickname}`, 
        text: textoMensaje.length > 40 ? textoMensaje.substring(0, 40) + '...' : textoMensaje, 
        read: false 
      });
      await setDoc(notifRef, { lista: notifs });
    } catch(err) {
      console.error(err);
      toast.error("Error al enviar el mensaje");
    }
  };

  const sincronizarAmigos = async () => {
    setIsSyncing(true);
    try {
      let hayCambios = false;
      const nuevaLista = await Promise.all(comunidadUsuarios.map(async (amigo) => {
        if (!String(amigo.id).startsWith('u_')) {
          const snap = await getDoc(doc(db, getCol('mercado'), amigo.id));
          if (snap.exists()) {
            const data = snap.data();
            if (JSON.stringify(amigo.stickers) !== JSON.stringify(data.stickers) || amigo.nickname !== data.nickname || amigo.photoURL !== data.photoURL) {
              hayCambios = true;
              return { ...amigo, stickers: data.stickers, nickname: data.nickname, photoURL: data.photoURL || null };
            }
          }
        }
        return amigo;
      }));
      if (hayCambios) {
        guardarEnNube(nuevaLista);
        toast.success("Listas de amigos sincronizadas");
      } else {
        toast("Tus amigos ya están al día");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al sincronizar amigos");
    }
    setIsSyncing(false);
  };

  useEffect(() => {
    if (!datosCargados) return; // No guardamos hasta haber cargado primero
    try {
      localStorage.setItem(localKey, JSON.stringify(comunidadUsuarios));
    } catch (error) { console.error("Error al guardar amigos:", error); }
  }, [comunidadUsuarios, datosCargados, localKey]);

  useEffect(() => {
    // Si se añade o elimina un amigo, actualizamos el contador en el perfil para los Logros
    if (datosCargados && perfil?.id && !perfil.id.startsWith('invitado_')) {
      if (perfil.amigosCount !== comunidadUsuarios.length) {
        updateDoc(doc(db, 'usuarios', perfil.id), { amigosCount: comunidadUsuarios.length }).catch(() => {});
      }
    }
  }, [comunidadUsuarios.length, datosCargados, perfil?.id, perfil?.amigosCount]);

  const guardarEnNube = (nuevaLista) => {
    if (perfil?.id) {
      setDoc(doc(db, getCol("amigos"), perfil.id), { lista: nuevaLista }).catch(e => console.error(e));
      if (!perfil.id.startsWith('invitado_')) {
        updateDoc(doc(db, 'usuarios', perfil.id), { amigosCount: nuevaLista.length }).catch(() => {});
      }
    }
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

  const amigosCalculados = comunidadUsuarios.map(u => {
    let compatible = false;
    let score = 0;
    for (const sel of ALBUMS[albumActivo].selecciones) {
      for (let i = 0; i < sel.total; i++) {
        const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
        const miEstado = perfil?.stickers?.[cod] || 0;
        const suEstado = u.stickers?.[cod] || 0;
        if ((miEstado >= 2 && suEstado === 0) || (suEstado >= 2 && miEstado === 0)) {
          compatible = true;
          score++;
        }
      }
    }
    return { ...u, compatible, score };
  });

  let amigosFiltrados = amigosCalculados.filter(u => u.nickname.toLowerCase().includes(busquedaAmigo.toLowerCase()));
  if (soloCompatibles) {
    amigosFiltrados = amigosFiltrados.filter(u => u.compatible).sort((a, b) => b.score - a.score);
  }

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
      <div className="card" style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Conecta y Compara</h3>
        Aquí puedes añadir a tus amigos (tanto los que usan la app como los que no) para comparar vuestras listas de cromos. La aplicación calculará automáticamente qué cromos os podéis intercambiar. Además, puedes usar el chat privado para coordinar los trueques.
      </div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: 'var(--accent-primary)' }}>Mis Amigos</h3>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{comunidadUsuarios.length} usuarios en lista</span>
          </div>
          <button onClick={sincronizarAmigos} disabled={isSyncing} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '10px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSyncing ? "logo-spin" : ""}><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            {isSyncing ? 'Sincronizando...' : 'Actualizar'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          <input type="text" value={busquedaAmigo} onChange={(e) => setBusquedaAmigo(e.target.value)} placeholder="Buscar amigo..." className="input-field" style={{ flex: 1, padding: '10px 14px' }} />
          <button type="button" onClick={() => setSoloCompatibles(!soloCompatibles)} className={soloCompatibles ? "btn-primary" : "btn-secondary"} style={{ padding: '0 12px', fontSize: '13px', background: soloCompatibles ? '#10B981' : '', color: soloCompatibles ? '#FFF' : '', borderColor: soloCompatibles ? '#10B981' : '' }}>
            {soloCompatibles ? 'Compatibles' : 'Todos'}
          </button>
        </div>

        <details style={{ background: 'var(--bg-input)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-primary)' }}>
          <summary style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)', cursor: 'pointer', userSelect: 'none' }}>+ Añadir amigo manualmente (Offline)</summary>
          <form onSubmit={añadirAmigoNuevo} style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input type="text" value={nuevoAmigoNombre} onChange={(e) => setNuevoAmigoNombre(e.target.value)} placeholder="Nombre del amigo offline..." className="input-field" style={{ flex: 1, fontSize: '13px', padding: '10px' }} />
            <button type="submit" className="btn-primary" style={{ background: '#6EE7B7', color: '#0F766E', padding: '10px 16px' }}>Añadir</button>
          </form>
        </details>
      </div>
      {!datosCargados ? (
        <>
          {[1, 2, 3].map(i => (
            <div key={i} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="skeleton-box" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div className="skeleton-box" style={{ width: '120px', height: '16px' }}></div>
                    <div className="skeleton-box" style={{ width: '60px', height: '12px' }}></div>
                  </div>
                </div>
                <div className="skeleton-box" style={{ width: '80px', height: '22px', borderRadius: '99px' }}></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <div className="skeleton-box" style={{ height: '45px', borderRadius: '8px' }}></div>
                <div className="skeleton-box" style={{ height: '45px', borderRadius: '8px' }}></div>
                <div className="skeleton-box" style={{ height: '45px', borderRadius: '8px' }}></div>
              </div>
              <div className="skeleton-box" style={{ height: '120px', borderRadius: '12px' }}></div>
            </div>
          ))}
        </>
      ) : amigosFiltrados.length === 0 ? (
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