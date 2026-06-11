import React, { useState, useEffect, useMemo } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import { SELECCIONES, TOTAL_STICKERS, parsearTextoAStickers } from './utils';
import LoginScreen from './LoginScreen';
import Header from './Header';
import Footer from './Footer';
import Album from './Album';
import Importar from './Importar';
import Intercambios from './Intercambios';
import Mercado from './Mercado';
import Estadisticas from './Estadisticas';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [seccionActual, setSeccionActual] = useState('intercambios');
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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('panini_theme', theme);
  }, [theme]);

  useEffect(() => {
    // Pedir permiso para enviar notificaciones web (si el navegador lo soporta)
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    // El "guardián" de Firebase: vigila que la sesión sea válida al recargar
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const guardado = localStorage.getItem('panini_perfil');
      const perfilLocal = guardado ? JSON.parse(guardado) : null;

      if (user) {
        // Si Firebase confirma la sesión pero no la tenemos en la app, la recuperamos
        if (!perfilLocal || perfilLocal.id !== user.uid) {
          const docSnap = await getDoc(doc(db, "usuarios", user.uid));
          if (docSnap.exists()) setPerfil(docSnap.data());
        }
      } else if (perfilLocal && !perfilLocal.id.startsWith('invitado_')) {
        // Si Firebase indica que expiró la sesión y NO es un invitado, lo deslogueamos por seguridad
        setPerfil(null);
      }
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
          if (JSON.stringify(prev.stickers) !== JSON.stringify(data.stickers)) {
            return { ...prev, stickers: data.stickers };
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
            noLeidas.forEach(n => new Notification("Nuevo Intercambio 🔄", { body: n.text, icon: 'https://media.base44.com/images/public/6a2595c43f4f5e19a4497bd1/5bd12f067_logo.png' }));
          } else {
            // Fallback: usar un alert estándar si no dio permisos
            alert("🔔 Nueva notificación:\n" + noLeidas.map(n => n.text).join('\n'));
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
      const nuevaCopia = parsearTextoAStickers(texto, tipo, prev.stickers);
      const nuevoPerfil = { ...prev, stickers: nuevaCopia };
      // Guardamos en la nube inmediatamente al importar
      if (nuevoPerfil.id) setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e));
      return nuevoPerfil;
    });
    alert(`¡Lista de ${tipo} procesada correctamente!`);
  };

  // Contadores Propios
  const { tienesCount, repetidasCount, faltanCount, pctGlobal } = useMemo(() => {
    let tCount = 0; let rCount = 0; let fCount = 0;
    SELECCIONES.forEach(sel => {
      for (let i = 0; i < sel.total; i++) {
        const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
        const v = perfil?.stickers?.[cod] || 0;
        if (v === 0) fCount++;
        else if (v === 1) tCount++;
        else if (v >= 2) { tCount++; rCount += (v - 1); }
      }
    });
    const pct = Math.round((tCount / TOTAL_STICKERS) * 100) || 0;
    return { tienesCount: tCount, repetidasCount: rCount, faltanCount: fCount, pctGlobal: pct };
  }, [perfil?.stickers]);

  useEffect(() => {
    if (pctGlobal === 100) {
      setShowConfetti(true);
      // Detenemos el confeti después de 10 segundos para ahorrar recursos
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [pctGlobal]);


  if (!perfil) {
    return <LoginScreen onLogin={handleLogin} />;
  }



  return (
    <div className="app-container">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      <Header perfil={perfil} onLogout={handleLogout} isMuted={isMuted} toggleMute={toggleMute} theme={theme} toggleTheme={toggleTheme} />
      <div className="content-wrapper" style={{ marginTop: '16px' }}>
        <div className="card stats-card-modern">
          <div className="stats-header">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>Progreso del Álbum</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tienesCount} de {TOTAL_STICKERS} cromos</span>
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
        {seccionActual === 'album' && <Album perfil={perfil} alternarCromoManual={alternarCromoManual} isMuted={isMuted} />}
        {seccionActual === 'importar' && <Importar procesarImportadorTexto={procesarImportadorTexto} perfil={perfil} />}
        {seccionActual === 'intercambios' && <Intercambios perfil={perfil} />}
        {seccionActual === 'mercado' && <Mercado perfil={perfil} />}
        {seccionActual === 'stats' && <Estadisticas />}
      </div>
      <Footer seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
    </div>

  );
}
