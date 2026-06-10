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
import { db, auth } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

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

  useEffect(() => {
    try {
      if (perfil) {
        localStorage.setItem('panini_perfil', JSON.stringify(perfil));
        // Guardado automático en la nube cada vez que cambia el perfil
        if (perfil.id) {
          setDoc(doc(db, "usuarios", perfil.id), perfil).catch(e => console.error("Error nube:", e));
        }
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
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      setPerfil(docSnap.data()); // ☁️ Carga los datos existentes de la nube
    } else {
      // 🆕 Crea un perfil nuevo en la base de datos si es su primera vez
      const nuevoPerfil = { id: userId, email: user.email, nickname: user.displayName || user.nickname, stickers: {} };
      await setDoc(userRef, nuevoPerfil);
      setPerfil(nuevoPerfil);
    }
  };

  const alternarCromoManual = (codigo) => {
    const copia = { ...perfil.stickers };
    const valor = copia[codigo] !== undefined ? copia[codigo] : 0;
    copia[codigo] = valor === 0 ? 1 : valor === 1 ? 2 : valor < 11 ? valor + 1 : 0;
    setPerfil(prev => ({ ...prev, stickers: copia }));
  };

  const procesarImportadorTexto = (texto, tipo) => {

    const nuevaCopia = parsearTextoAStickers(texto, tipo, perfil.stickers);

    setPerfil(prev => ({ ...prev, stickers: nuevaCopia }));

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
      <Header perfil={perfil} onLogout={handleLogout} isMuted={isMuted} toggleMute={toggleMute} />
      <div className="content-wrapper" style={{ marginTop: '16px' }}>
        <div className="card stats-card">
          <div className="stats-grid">
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{tienesCount}</div><div style={{ fontSize: '11px', color: '#64748B' }}>Tengo</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: '#D97706' }}>{repetidasCount}</div><div style={{ fontSize: '11px', color: '#64748B' }}>Repes</div></div>
            <div><div style={{ fontSize: '18px', fontWeight: '800', color: '#E11D48' }}>{faltanCount}</div><div style={{ fontSize: '11px', color: '#64748B' }}>Faltan</div></div>
          </div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>{pctGlobal}%</div>
        </div>
      </div>
      <div className="content-wrapper">
        {seccionActual === 'album' && <Album perfil={perfil} alternarCromoManual={alternarCromoManual} isMuted={isMuted} />}
        {seccionActual === 'importar' && <Importar procesarImportadorTexto={procesarImportadorTexto} perfil={perfil} />}
        {seccionActual === 'intercambios' && <Intercambios perfil={perfil} />}
      </div>
      <Footer seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
    </div>

  );
}
