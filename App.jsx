import React, { useState, useEffect, useMemo, Suspense, lazy } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import { ALBUMS, parsearTextoAStickers, LOGO_URL } from './utils';
import LoginScreen from './LoginScreen';
import Header from './Header';
import Footer from './Footer';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster, toast } from 'react-hot-toast';

const Album = lazy(() => import('./Album'));
const Importar = lazy(() => import('./Importar'));
const Intercambios = lazy(() => import('./Intercambios'));
const Mercado = lazy(() => import('./Mercado'));
const Estadisticas = lazy(() => import('./Estadisticas'));

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [seccionActual, setSeccionActual] = useState('intercambios');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [albumActivo, setAlbumActivo] = useState(() => localStorage.getItem('panini_album') || 'mundial_2026');
  const [perfil, setPerfil] = useState(() => {
    try {
      const guardado = localStorage.getItem('panini_perfil');
      return guardado ? JSON.parse(guardado) : null;
    } catch (error) {
      return null;
    }
  });
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('panini_muted') === 'true';
    } catch (error) {
      return false;
    }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('panini_theme') || 'light');
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('panini_tutorial_seen'));

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('panini_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('panini_album', albumActivo);
  }, [albumActivo]);

  useEffect(() => {
    // Pedir permiso para enviar notificaciones web (si el navegador lo soporta)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // Escuchar cuando el dispositivo este listo para instalar la PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // El "guardián" de Firebase: vigila que la sesión sea válida al recargar
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let perfilLocal = null;
      try {
        const guardado = localStorage.getItem('panini_perfil');
        if (guardado) perfilLocal = JSON.parse(guardado);
      } catch(e) {}

      if (user) {
        // Si Firebase confirma la sesión pero no la tenemos, la recuperamos
        if (!perfilLocal || perfilLocal.id !== user.uid) {
          const docSnap = await getDoc(doc(db, "usuarios", user.uid));
          if (docSnap.exists()) setPerfil(docSnap.data());
        }
      } else if (perfilLocal && !perfilLocal.id.startsWith('invitado_')) {
        // Si Firebase indica que expiró la sesión y NO es un invitado, lo deslogueamos por seguridad
        setPerfil(null);
      }
      
      // Ocultar la pantalla de carga después de procesar la sesión (con un pequeño retraso para ver la animación)
      setTimeout(() => setIsInitializing(false), 1200);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!perfil?.id) return;
    
    // 🎧 Escuchamos los cambios de Firestore en tiempo real
    const unsub = onSnapshot(doc(db, "usuarios", perfil.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPerfil(prev => {
          if (!prev) return data;
          // Comparamos para evitar bucles si el cambio lo hicimos nosotros mismos en este dispositivo
          if (JSON.stringify(prev.stickers) !== JSON.stringify(data.stickers) || prev.nickname !== data.nickname) {
            return { ...prev, stickers: data.stickers, nickname: data.nickname };
          }
          return prev;
        });
      }
    });
    return () => unsub();
  }, [perfil?.id]);

  useEffect(() => {
    if (!perfil?.id) return;
    
    // 🎧 Escuchamos la colección de notificaciones en tiempo real
    const unsubNotifs = onSnapshot(doc(db, "notificaciones", perfil.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().lista || [];
        const noLeidas = data.filter(n => !n.read);
        
        if (noLeidas.length > 0) {
          // Lanzar notificación nativa por cada aviso no leído
          if ("Notification" in window && Notification.permission === "granted") {
            noLeidas.forEach(n => new Notification("Nuevo Intercambio", { body: n.text, icon: 'https://media.base44.com/images/public/6a2595c43f4f5e19a4497bd1/5bd12f067_logo.png' }));
          } else {
            // Fallback: usar un alert estándar si no dio permisos
            toast("Nueva notificación:\n" + noLeidas.map(n => n.text).join('\n'));
          }
          
          // Marcar como leídas automáticamente en Firestore para no repetir
          const marcadas = data.map(n => ({ ...n, read: true }));
          setDoc(doc(db, "notificaciones", perfil.id), { lista: marcadas });
        }
      }
    });
    return () => unsubNotifs();
  }, [perfil?.id]);

  useEffect(() => {
    try {
      if (perfil) {
        localStorage.setItem('panini_perfil', JSON.stringify(perfil));
      } else {
        // Si el perfil es null (logout), lo removemos
        localStorage.removeItem('panini_perfil');
      }
    } catch (error) {
      console.error("Error al guardar el perfil en localStorage:", error);
    }
  }, [perfil]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      try { localStorage.setItem('panini_muted', String(newVal)); } catch (e) {}
      return newVal;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const cambiarApodo = async (nuevoApodo) => {
    if (!nuevoApodo || nuevoApodo.trim() === '' || nuevoApodo === perfil.nickname) return;
    const apodoLimpio = nuevoApodo.trim();
    const nuevoPerfil = { ...perfil, nickname: apodoLimpio };
    setPerfil(nuevoPerfil);
    try {
      await setDoc(doc(db, "usuarios", perfil.id), nuevoPerfil);
      // Actualizamos también el mercado si el usuario estaba publicado
      const mercadoRef = doc(db, 'mercado', perfil.id);
      const mercadoSnap = await getDoc(mercadoRef);
      if (mercadoSnap.exists()) {
        await setDoc(mercadoRef, { nickname: apodoLimpio }, { merge: true });
      }
      toast.success("Apodo actualizado correctamente.");
    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar el apodo.");
    }
  };

  const handleLogout = async () => {
    if (window.confirm("¿Seguro que quieres cerrar sesión? Se borrarán tus datos guardados.")) {
      try { await signOut(auth); } catch (e) { console.error("Error al cerrar sesión:", e); }
      setPerfil(null);
      localStorage.removeItem('panini_amigos');
    }
  };

  const handleLogin = async (user) => {
    // Usamos el UID de Firebase Auth como ID de usuario. Es único y seguro.
    const userId = user.uid;
    const userRef = doc(db, "usuarios", userId);

    try {
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        setPerfil(docSnap.data()); // ☁️ Carga los datos existentes de la nube
      } else {
        // 🆕 Crea un perfil nuevo en la base de datos si es su primera vez
        const nuevoPerfil = { id: userId, email: user.email, nickname: user.displayName || user.nickname || 'Invitado', stickers: {} };
        await setDoc(userRef, nuevoPerfil);
        setPerfil(nuevoPerfil);
      }
    } catch (error) {
      console.warn("Error accediendo a la base de datos (quizás falta configuración o es invitado local):", error);
      // Fallback local si Firebase falla o entramos como invitado
      setPerfil({ id: userId, email: user.email, nickname: user.displayName || user.nickname || 'Invitado', stickers: {} });
    }
  };

  const alternarCromoManual = (codigo) => {
    setPerfil(prev => {
      const copia = { ...prev.stickers };
      const valor = copia[codigo] !== undefined ? copia[codigo] : 0;
      copia[codigo] = valor === 0 ? 1 : valor === 1 ? 2 : valor < 11 ? valor + 1 : 0;
      const nuevoPerfil = { ...prev, stickers: copia };
      // Guardamos en la nube inmediatamente al hacer clic
      if (nuevoPerfil.id) setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e));
      return nuevoPerfil;
    });
  };

  const procesarImportadorTexto = (texto, tipo) => {
    setPerfil(prev => {
      const nuevaCopia = parsearTextoAStickers(texto, tipo, albumActivo, prev.stickers);
      const nuevoPerfil = { ...prev, stickers: nuevaCopia };
      // Guardamos en la nube inmediatamente al importar
      if (nuevoPerfil.id) setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e));
      return nuevoPerfil;
    });
    toast.success(`¡Lista de ${tipo} procesada correctamente!`);
  };

  // Contadores Propios
  const { tienesCount, repetidasCount, faltanCount, pctGlobal } = useMemo(() => {
    let tCount = 0; let rCount = 0; let fCount = 0;
    const albumData = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];
    albumData.selecciones.forEach(sel => {
      for (let i = 0; i < sel.total; i++) {
        const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
        const v = perfil?.stickers?.[cod] || 0;
        if (v === 0) fCount++;
        else if (v === 1) tCount++;
        else if (v >= 2) { tCount++; rCount += (v - 1); }
      }
    });
    const pct = Math.round((tCount / albumData.totalStickers) * 100) || 0;
    return { tienesCount: tCount, repetidasCount: rCount, faltanCount: fCount, pctGlobal: pct };
  }, [perfil?.stickers, albumActivo]);

  useEffect(() => {
    if (pctGlobal === 100) {
      setShowConfetti(true);
      // Detenemos el confeti después de 10 segundos para ahorrar recursos
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [pctGlobal]);


  if (isInitializing) {
    return (
      <div className="splash-screen">
        <img src={LOGO_URL} alt="Logo" className="splash-logo" />
        <div className="splash-loader"></div>
        <h2 style={{ marginTop: '20px', fontSize: '22px', fontWeight: 'bold', letterSpacing: '-0.5px' }}>Mundial 2026</h2>
      </div>
    );
  }

  if (!perfil) {
    return <LoginScreen onLogin={handleLogin} />;
  }



  return (
    <div className="app-container">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <Header perfil={perfil} onLogout={handleLogout} isMuted={isMuted} toggleMute={toggleMute} theme={theme} toggleTheme={toggleTheme} cambiarApodo={cambiarApodo} albumActivo={albumActivo} setAlbumActivo={setAlbumActivo} />
      
      {installPrompt && (
        <div style={{ background: 'var(--accent-primary)', color: '#FFF', padding: '12px', textAlign: 'center', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', margin: '16px 12px 0 12px', borderRadius: '14px', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Instala la aplicacion para acceder mas rapido</span>
          <button onClick={async () => { installPrompt.prompt(); const { outcome } = await installPrompt.userChoice; if(outcome === 'accepted') setInstallPrompt(null); }} style={{ background: '#FFF', color: 'var(--accent-primary)', border: 'none', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>Instalar</button>
        </div>
      )}

      <div className="content-wrapper" style={{ marginTop: '16px' }}>
        <div className="card stats-card-modern">
          <div className="stats-header">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>Progreso de {ALBUMS[albumActivo]?.nombre || 'Mundial 2026'}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tienesCount} de {ALBUMS[albumActivo]?.totalStickers || 992} cromos</span>
            </div>
            <span className="stats-pct">{pctGlobal}%</span>
          </div>
          <div className="stats-progress-bar-container"><div className="stats-progress-bar-fill" style={{ width: `${pctGlobal}%` }}></div></div>
          <div className="stats-grid-modern">
            <div className="stat-item have"><span className="stat-value">{tienesCount}</span><span className="stat-label">Tengo</span></div>
            <div className="stat-item repes"><span className="stat-value">{repetidasCount}</span><span className="stat-label">Repes</span></div>
            <div className="stat-item missing"><span className="stat-value">{faltanCount}</span><span className="stat-label">Faltan</span></div>
          </div>
        </div>
      </div>
      <div className="content-wrapper">
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>Cargando sección...</div>}>
          {seccionActual === 'album' && <Album perfil={perfil} alternarCromoManual={alternarCromoManual} isMuted={isMuted} albumActivo={albumActivo} />}
          {seccionActual === 'importar' && <Importar procesarImportadorTexto={procesarImportadorTexto} perfil={perfil} albumActivo={albumActivo} />}
          {seccionActual === 'intercambios' && <Intercambios perfil={perfil} albumActivo={albumActivo} />}
          {seccionActual === 'mercado' && <Mercado perfil={perfil} setSeccionActual={setSeccionActual} albumActivo={albumActivo} />}
          {seccionActual === 'stats' && <Estadisticas albumActivo={albumActivo} perfil={perfil} />}
        </Suspense>
      </div>
      <Footer seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
      
      <SpeedInsights />
      <Toaster position="bottom-center" />

      {showTutorial && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ margin: 0, padding: '24px' }}>
            <h2 style={{ marginTop: 0, color: 'var(--accent-primary)', fontSize: '22px' }}>Bienvenido al Gestor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Sigue estos sencillos pasos para completar tu coleccion rapidamente:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>1. Mi album</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Marca los cromos que vas consiguiendo. Los repetidos se sumaran automaticamente.</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>2. Mercado Publico</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Publica tu lista para que otros te encuentren y solicita intercambios a perfiles compatibles.</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>3. Intercambios</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cruza tus listas con las de tus amigos y comparte imagenes resumen para coordinarte.</span>
              </div>
            </div>
            <button onClick={() => { setShowTutorial(false); localStorage.setItem('panini_tutorial_seen', 'true'); }} className="btn-primary" style={{ width: '100%' }}>Comenzar</button>
          </div>
        </div>
      )}
    </div>

  );
}
