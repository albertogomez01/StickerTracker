import React, { useState, useEffect } from 'react';
import './App.css';
import { SELECCIONES, TOTAL_STICKERS, parsearTextoAStickers } from './utils';
import LoginScreen from './LoginScreen';
import Header from './Header';
import Footer from './Footer';
import Album from './Album';
import Importar from './Importar';
import Intercambios from './Intercambios';

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

  const handleLogout = () => {
    if (window.confirm("¿Seguro que quieres cerrar sesión? Se borrarán tus datos guardados.")) {
      setPerfil(null);
      localStorage.removeItem('panini_amigos');
    }
  };

  const handleLogin = (user) => {
    setPerfil({ id: 'dev_user', email: user.email, nickname: user.nickname, stickers: {} });
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

  let tienesCount = 0; let repetidasCount = 0; let faltanCount = 0;

  SELECCIONES.forEach(sel => {

    for (let i = 0; i < sel.total; i++) {

      const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;

      const v = perfil?.stickers?.[cod] || 0;

      if (v === 0) faltanCount++;

      else if (v === 1) tienesCount++;

      else if (v >= 2) { tienesCount++; repetidasCount += (v - 1); }

    }

  });

  const pctGlobal = Math.round((tienesCount / TOTAL_STICKERS) * 100) || 0;



  if (!perfil) {
    return <LoginScreen onLogin={handleLogin} />;
  }



  return (
    <div className="app-container">
      <Header perfil={perfil} onLogout={handleLogout} />
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
        {seccionActual === 'album' && <Album perfil={perfil} alternarCromoManual={alternarCromoManual} />}
        {seccionActual === 'importar' && <Importar procesarImportadorTexto={procesarImportadorTexto} />}
        {seccionActual === 'intercambios' && <Intercambios perfil={perfil} />}
      </div>
      <Footer seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
    </div>

  );
}
