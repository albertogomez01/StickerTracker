import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc, query, where, onSnapshot, limit, orderBy, addDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ALBUMS } from './utils';
import { toast } from 'react-hot-toast';

const REGIONES_ESPANA = {
  "Andalucía": ["Sevilla", "Málaga", "Córdoba", "Granada", "Almería", "Jerez de la Frontera", "Cádiz", "Huelva", "Jaén"],
  "Aragón": ["Zaragoza", "Huesca", "Teruel"],
  "Asturias": ["Gijón", "Oviedo", "Avilés"],
  "Baleares": ["Palma de Mallorca", "Ibiza", "Mahón"],
  "Canarias": ["Las Palmas de Gran Canaria", "Santa Cruz de Tenerife", "La Laguna"],
  "Cantabria": ["Santander", "Torrelavega"],
  "Castilla y León": ["Valladolid", "Burgos", "Salamanca", "León", "Palencia", "Zamora"],
  "Castilla-La Mancha": ["Albacete", "Guadalajara", "Toledo", "Ciudad Real", "Cuenca"],
  "Cataluña": ["Barcelona", "L'Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell", "Tarragona", "Lleida", "Girona"],
  "Comunidad de Madrid": ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés", "Getafe", "Alcorcón"],
  "Comunidad Valenciana": ["Valencia", "Alicante", "Elche", "Castellón de la Plana", "Torrevieja"],
  "Extremadura": ["Badajoz", "Cáceres", "Mérida"],
  "Galicia": ["Vigo", "A Coruña", "Ourense", "Lugo", "Santiago de Compostela"],
  "La Rioja": ["Logroño"],
  "Murcia": ["Murcia", "Cartagena", "Lorca"],
  "Navarra": ["Pamplona"],
  "País Vasco": ["Bilbao", "Vitoria-Gasteiz", "San Sebastián", "Barakaldo"]
};

export default function Mercado({ perfil, setSeccionActual, albumActivo }) {
  const [usuariosMercado, setUsuariosMercado] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState([]);
  const [publicado, setPublicado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('explorar');
  const [busquedaMercado, setBusquedaMercado] = useState('');
  const [comunidadActiva, setComunidadActiva] = useState('');
  const [ciudadActiva, setCiudadActiva] = useState('');
  const [quedadas, setQuedadas] = useState([]);
  const [showFormQuedada, setShowFormQuedada] = useState(false);
  const [nuevaQuedada, setNuevaQuedada] = useState({ titulo: '', lugar: '', fecha: '' });

  // Función mágica para separar bases de datos sin romper a los usuarios antiguos
  const getCol = (base) => albumActivo === 'mundial_2026' ? base : `${base}_${albumActivo}`;

  useEffect(() => {
    setUsuariosMercado([]);
    setBusquedaMercado('');
    setComunidadActiva('');
    setCiudadActiva('');
    setQuedadas([]);
    setTab('explorar');
  }, [albumActivo]);

  useEffect(() => {
    if (!perfil?.id) return;
    getDoc(doc(db, getCol('mercado'), perfil.id)).then(snap => {
      setPublicado(snap.exists());
    });

    // Escuchar solicitudes pendientes entrantes en tiempo real
    const q = query(collection(db, getCol('solicitudes')), where('to', '==', perfil.id), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      const reqs = [];
      snap.forEach(d => reqs.push({ id: d.id, ...d.data() }));
      setSolicitudes(reqs);
    });

    // Escuchar solicitudes pendientes salientes (enviadas) en tiempo real
    const qEnviadas = query(collection(db, getCol('solicitudes')), where('from', '==', perfil.id), where('status', '==', 'pending'));
    const unsubEnviadas = onSnapshot(qEnviadas, (snap) => {
      const reqs = [];
      snap.forEach(d => reqs.push({ id: d.id, ...d.data() }));
      setSolicitudesEnviadas(reqs);
    });
    return () => { unsub(); unsubEnviadas(); };
  }, [perfil?.id, albumActivo]);

  useEffect(() => {
    if (!ciudadActiva) {
      setQuedadas([]);
      return;
    }
    const qQuedadas = query(collection(db, getCol('quedadas')), where('ciudad', '==', ciudadActiva));
    const unsubQuedadas = onSnapshot(qQuedadas, (snap) => {
      const list = [];
      snap.forEach(d => list.push({ id: d.id, ...d.data() }));
      list.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setQuedadas(list);
    });
    return () => unsubQuedadas();
  }, [ciudadActiva, albumActivo]);

  const togglePublicar = async () => {
    setLoading(true);
    try {
      if (publicado) {
        await deleteDoc(doc(db, getCol('mercado'), perfil.id));
        setPublicado(false);
        toast.success("Tu perfil ya no es visible en el mercado.");
      } else {
        await setDoc(doc(db, getCol('mercado'), perfil.id), {
          nickname: perfil.nickname,
          stickers: perfil.stickers,
          timestamp: Date.now()
        });
        setPublicado(true);
        toast.success("¡Tu lista ha sido publicada en el mercado!");
      }
    } catch (e) {
      console.error(e);
      toast.error("Hubo un error al actualizar tu estado en el mercado.");
    }
    setLoading(false);
  };

  const buscarMatches = async () => {
    setLoading(true);
    try {
      const qMercado = query(collection(db, getCol('mercado')), orderBy('timestamp', 'desc'), limit(50));
      const querySnapshot = await getDocs(qMercado);
      const matches = [];

      querySnapshot.forEach((document) => {
        if (document.id === perfil.id) return; // Saltarnos a nosotros mismos
        const data = document.data();
        
        let leDoy = 0;
        let meDa = 0;

        ALBUMS[albumActivo].selecciones.forEach(sel => {
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

      // Ordenar primero por la cantidad de cromos que me ofrecen (meDa), y en caso de empate por el total
      matches.sort((a, b) => b.meDa - a.meDa || b.total - a.total);
      setUsuariosMercado(matches);
      if (matches.length === 0) toast("No se encontraron usuarios con cromos compatibles por ahora.");
    } catch (e) {
      console.error(e);
      toast.error("Error al buscar en el mercado.");
    }
    setLoading(false);
  };

  const enviarSolicitud = async (matchUser) => {
    try {
      const solicitudId = `${perfil.id}_${matchUser.id}`;
      const solRef = doc(db, getCol('solicitudes'), solicitudId);
      const solSnap = await getDoc(solRef);
      if (solSnap.exists() && solSnap.data().status === 'pending') {
        return toast.error("Ya has enviado una solicitud pendiente a este usuario.");
      }

      await setDoc(solRef, {
        from: perfil.id,
        fromNickname: perfil.nickname,
        to: matchUser.id,
        toNickname: matchUser.nickname,
        status: 'pending',
        timestamp: Date.now()
      });
      toast.success(`Solicitud enviada a @${matchUser.nickname}. Estará en su buzón.`);
    } catch (e) {
      console.error(e);
      toast.error("Error al enviar la solicitud.");
    }
  };

  const generarRawListas = (stickersObj) => {
    let faltantes = [];
    let repetidos = [];
    ALBUMS[albumActivo].selecciones.forEach(sel => {
      let fSel = [];
      let rSel = [];
      for (let i = 0; i < sel.total; i++) {
        const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
        const v = stickersObj?.[cod] || 0;
        if (v === 0) fSel.push(i + 1);
        else if (v >= 2) rSel.push(v > 2 ? `${i + 1}x${v - 1}` : `${i + 1}`);
      }
      if (fSel.length > 0) faltantes.push(`${sel.id}: ${fSel.join(', ')}`);
      if (rSel.length > 0) repetidos.push(`${sel.id}: ${rSel.join(', ')}`);
    });
    return { rawFaltantes: faltantes.join('\n'), rawRepetidos: repetidos.join('\n') };
  };

  const aceptarSolicitud = async (solicitud) => {
    try {
      // 1. Marcar la solicitud como aceptada
      await setDoc(doc(db, getCol('solicitudes'), solicitud.id), { status: 'accepted' }, { merge: true });

      // 2. Descargar las estadísticas y añadirlo a mi lista de amigos
      const misAmigosRef = doc(db, getCol('amigos'), perfil.id);
      const miSnap = await getDoc(misAmigosRef);
      let miLista = miSnap.exists() ? (miSnap.data().lista || []) : [];
      
      if (!miLista.some(u => u.id === solicitud.from)) {
        const mercadoSnap = await getDoc(doc(db, getCol('mercado'), solicitud.from));
        const dataMercado = mercadoSnap.exists() ? mercadoSnap.data() : { stickers: {} };
        const { rawFaltantes, rawRepetidos } = generarRawListas(dataMercado.stickers);
        miLista.unshift({ id: solicitud.from, nickname: solicitud.fromNickname, stickers: dataMercado.stickers, rawFaltantes, rawRepetidos });
        await setDoc(misAmigosRef, { lista: miLista });
      }

      // 3. Añadirme automáticamente a su lista de amigos
      const susAmigosRef = doc(db, getCol('amigos'), solicitud.from);
      const suSnap = await getDoc(susAmigosRef);
      let suLista = suSnap.exists() ? (suSnap.data().lista || []) : [];
      
      if (!suLista.some(u => u.id === perfil.id)) {
        const { rawFaltantes, rawRepetidos } = generarRawListas(perfil.stickers);
        suLista.unshift({ id: perfil.id, nickname: perfil.nickname, stickers: perfil.stickers, rawFaltantes, rawRepetidos });
        await setDoc(susAmigosRef, { lista: suLista });
      }

      // 4. Notificar a la otra persona del éxito
      const notifRef = doc(db, 'notificaciones', solicitud.from);
      const notifSnap = await getDoc(notifRef);
      let notifs = notifSnap.exists() ? (notifSnap.data().lista || []) : [];
      notifs.push({ id: Date.now().toString(), text: `@${perfil.nickname} ha aceptado tu solicitud de intercambio.`, read: false });
      await setDoc(notifRef, { lista: notifs });

      // 5. Cambiar a la pestaña de intercambios directamente
      if (setSeccionActual) setSeccionActual('intercambios');

    } catch (e) {
      console.error(e);
      toast.error("Error al aceptar solicitud.");
    }
  };

  const rechazarSolicitud = async (solicitudId) => {
    if(!window.confirm("¿Rechazar esta solicitud?")) return;
    try {
      await deleteDoc(doc(db, getCol('solicitudes'), solicitudId));
    } catch (e) {
      console.error(e);
      toast.error("Error al rechazar solicitud.");
    }
  };

  const cancelarSolicitud = async (solicitudId) => {
    if(!window.confirm("¿Seguro que quieres cancelar esta solicitud enviada?")) return;
    try {
      await deleteDoc(doc(db, getCol('solicitudes'), solicitudId));
    } catch (e) {
      console.error(e);
      toast.error("Error al cancelar solicitud.");
    }
  };

  const handleCrearQuedada = async (e) => {
    e.preventDefault();
    if (!nuevaQuedada.titulo || !nuevaQuedada.lugar || !nuevaQuedada.fecha) return toast.error("Rellena todos los campos.");
    try {
      await addDoc(collection(db, getCol('quedadas')), {
        ciudad: ciudadActiva,
        titulo: nuevaQuedada.titulo,
        lugar: nuevaQuedada.lugar,
        fecha: nuevaQuedada.fecha,
        creador: perfil.id,
        creadorNombre: perfil.nickname,
        asistentes: [perfil.id],
        timestamp: Date.now()
      });
      setShowFormQuedada(false);
      setNuevaQuedada({ titulo: '', lugar: '', fecha: '' });
      toast.success("Quedada creada correctamente.");
    } catch(err) {
      console.error(err);
      toast.error("Error al crear la quedada.");
    }
  };

  const toggleAsistencia = async (quedada) => {
    const ref = doc(db, getCol('quedadas'), quedada.id);
    const voy = quedada.asistentes?.includes(perfil.id);
    try {
      await updateDoc(ref, {
        asistentes: voy ? arrayRemove(perfil.id) : arrayUnion(perfil.id)
      });
      toast.success(voy ? "Te has desapuntado de la quedada." : "Te has apuntado a la quedada.");
    } catch(err) {
      console.error(err);
      toast.error("Error al actualizar la asistencia.");
    }
  };

  const usuariosFiltrados = usuariosMercado.filter(u => u.nickname.toLowerCase().includes(busquedaMercado.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div className="card" style={{ display: 'flex', gap: '8px', padding: '12px' }}>
        <button onClick={() => setTab('explorar')} className="btn-secondary" style={{ flex: 1, background: tab === 'explorar' ? 'var(--accent-primary)' : '', color: tab === 'explorar' ? '#FFF' : '', borderColor: tab === 'explorar' ? 'var(--accent-primary)' : '' }}>Explorar</button>
        <button onClick={() => setTab('buzon')} className="btn-secondary" style={{ flex: 1, position: 'relative', background: tab === 'buzon' ? 'var(--accent-primary)' : '', color: tab === 'buzon' ? '#FFF' : '', borderColor: tab === 'buzon' ? 'var(--accent-primary)' : '' }}>
          Buzón
          {solicitudes.length > 0 && <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#EF4444', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>{solicitudes.length}</span>}
        </button>
        <button onClick={() => setTab('quedadas')} className="btn-secondary" style={{ flex: 1, background: tab === 'quedadas' ? 'var(--accent-primary)' : '', color: tab === 'quedadas' ? '#FFF' : '', borderColor: tab === 'quedadas' ? 'var(--accent-primary)' : '' }}>Quedadas</button>
      </div>

      {tab === 'explorar' && (
        <>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Mercado Público</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', marginTop: 0 }}>Publica tu lista actual de cromos para que otros puedan encontrarte, o busca personas con las que tengas alta compatibilidad.</p>
            <button onClick={togglePublicar} className={publicado ? "btn-danger" : "btn-primary"} style={{ width: '100%', display: 'flex', justifyContent: 'center' }} disabled={loading}>{loading ? 'Procesando...' : (publicado ? 'Ocultar mi perfil del Mercado' : 'Publicar mi lista en el Mercado')}</button>
          </div>
          <div className="card" style={{ padding: '12px' }}>
            <button onClick={buscarMatches} className="btn-secondary" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }} disabled={loading}>{loading ? 'Buscando...' : 'Buscar Intercambios Compatibles'}</button>
          </div>
          {usuariosMercado.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={busquedaMercado} onChange={(e) => setBusquedaMercado(e.target.value)} placeholder="Filtrar por nombre..." className="input-field" style={{ padding: '10px 14px', fontSize: '14px' }} />
              <h4 style={{ margin: '0 4px', fontSize: '14px', color: 'var(--text-secondary)' }}>Resultados ({usuariosFiltrados.length})</h4>
              {usuariosFiltrados.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', padding: '16px' }}>No se encontraron usuarios con ese nombre.</div>
              ) : (
                usuariosFiltrados.map(user => (
                  <div key={user.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)' }}>@{user.nickname}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Me da: <span style={{ color: '#D97706', fontWeight: 'bold' }}>{user.meDa}</span> | Le doy: <span style={{ color: '#059669', fontWeight: 'bold' }}>{user.leDoy}</span></div>
                    </div>
                    <button onClick={() => enviarSolicitud(user)} className="btn-primary" style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '10px' }}>Solicitar</button>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {tab === 'buzon' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Buzón de Solicitudes</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 0, marginTop: 0 }}>Gestiona las solicitudes de intercambio recibidas y enviadas.</p>
          </div>
          
          <h4 style={{ margin: '4px 4px 0 4px', fontSize: '14px', color: 'var(--text-secondary)' }}>Recibidas ({solicitudes.length})</h4>
          {solicitudes.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>No tienes solicitudes entrantes pendientes.</div>
          ) : (
            solicitudes.map(solicitud => (
              <div key={solicitud.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)' }}>@{solicitud.fromNickname}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Quiere intercambiar cromos</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => rechazarSolicitud(solicitud.id)} className="btn-danger" style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', minWidth: 'auto' }}>Rechazar</button>
                  <button onClick={() => aceptarSolicitud(solicitud)} className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', background: '#10B981', minWidth: 'auto' }}>Aceptar</button>
                </div>
              </div>
            ))
          )}

          <h4 style={{ margin: '14px 4px 0 4px', fontSize: '14px', color: 'var(--text-secondary)' }}>Enviadas ({solicitudesEnviadas.length})</h4>
          {solicitudesEnviadas.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px' }}>No has enviado ninguna solicitud por ahora.</div>
          ) : (
            solicitudesEnviadas.map(solicitud => (
              <div key={solicitud.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)' }}>@{solicitud.toNickname}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Esperando respuesta...</div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => cancelarSolicitud(solicitud.id)} className="btn-danger" style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', minWidth: 'auto' }}>Cancelar</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'quedadas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card">
            <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-primary)' }}>Grupos y Quedadas</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', marginTop: 0 }}>Organiza o únete a intercambios presenciales en tu ciudad con otros coleccionistas de tu zona.</p>
            
            <select className="input-field" value={comunidadActiva} onChange={e => { setComunidadActiva(e.target.value); setCiudadActiva(''); }} style={{ marginBottom: '10px', padding: '10px 14px' }}>
              <option value="">Selecciona tu Comunidad Autónoma...</option>
              {Object.keys(REGIONES_ESPANA).map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {comunidadActiva && (
              <select className="input-field" value={ciudadActiva} onChange={e => setCiudadActiva(e.target.value)} style={{ padding: '10px 14px' }}>
                <option value="">Selecciona tu Ciudad...</option>
                {REGIONES_ESPANA[comunidadActiva].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>

          {ciudadActiva && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)' }}>Eventos en {ciudadActiva}</h4>
                <button onClick={() => setShowFormQuedada(!showFormQuedada)} className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}>
                  {showFormQuedada ? 'Cancelar' : 'Nueva Quedada'}
                </button>
              </div>

              {showFormQuedada && (
                <form onSubmit={handleCrearQuedada} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input type="text" placeholder="Título (ej: Intercambio en la Plaza)" value={nuevaQuedada.titulo} onChange={e => setNuevaQuedada({...nuevaQuedada, titulo: e.target.value})} className="input-field" style={{ padding: '10px 14px' }} required />
                  <input type="text" placeholder="Lugar exacto" value={nuevaQuedada.lugar} onChange={e => setNuevaQuedada({...nuevaQuedada, lugar: e.target.value})} className="input-field" style={{ padding: '10px 14px' }} required />
                  <input type="datetime-local" value={nuevaQuedada.fecha} onChange={e => setNuevaQuedada({...nuevaQuedada, fecha: e.target.value})} className="input-field" style={{ padding: '10px 14px' }} required />
                  <button type="submit" className="btn-primary" style={{ marginTop: '4px' }}>Publicar</button>
                </form>
              )}

              {quedadas.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', color: '#94A3B8', fontSize: '14px', padding: '20px' }}>No hay quedadas programadas en {ciudadActiva} todavía.</div>
              ) : (
                quedadas.map(q => {
                  const voy = q.asistentes?.includes(perfil.id);
                  const totalAsistentes = q.asistentes?.length || 0;
                  return (
                    <div key={q.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 'bold', fontSize: '15px', color: 'var(--text-primary)' }}>{q.titulo}</div>
                        <div style={{ fontSize: '12px', color: 'var(--accent-primary)', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '4px 8px', borderRadius: '6px' }}>
                          {new Date(q.fecha).toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' })}
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Lugar: {q.lugar}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Organiza: @{q.creadorNombre}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', borderTop: '1px solid var(--border-primary)', paddingTop: '10px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                          Asistentes: {totalAsistentes}
                        </div>
                        <button onClick={() => toggleAsistencia(q)} className={voy ? "btn-danger" : "btn-primary"} style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '8px' }}>
                          {voy ? 'No voy' : 'Me apunto'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}