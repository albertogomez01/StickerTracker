import React, { useState } from 'react';
import './App.css';
import { LOGO_URL } from './utils';

export default function Header({ perfil, onLogout, isMuted, toggleMute, theme, toggleTheme }) {
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogoClick = () => {
    if (isLogoAnimating) return; // Evita re-animar si ya está en curso
    setIsLogoAnimating(true);
    setTimeout(() => setIsLogoAnimating(false), 500); // Debe coincidir con la duración de la animación
  };

  return (
    <div className="header">
      <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none' }}>
        <img src={LOGO_URL} alt="Logo" className={`header-logo ${isLogoAnimating ? 'logo-spin' : ''}`} />
        <div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Mundial 2026</h1>
          <span style={{ opacity: 0.85, fontSize: '11px' }}>Gestor Cromos</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} aria-label="Alternar tema">{theme === 'light' ? 'Noche' : 'Día'}</button>
        <button onClick={toggleMute} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '6px 10px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} aria-label="Alternar sonido">{isMuted ? 'Mudo' : 'Sonido'}</button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => setShowDropdown(!showDropdown)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
            @{perfil.nickname} <span style={{ fontSize: '10px' }}>{showDropdown ? '▲' : '▼'}</span>
          </button>
          {showDropdown && (
            <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', background: 'var(--bg-card)', borderRadius: '14px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', minWidth: '180px', zIndex: 1001, display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border-primary)' }}>
              <a href="https://ko-fi.com/tu_usuario" target="_blank" rel="noopener noreferrer" onClick={() => setShowDropdown(false)} style={{ textDecoration: 'none', color: '#FF5E5B', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', background: 'rgba(255, 94, 91, 0.1)', textAlign: 'left', display: 'block' }}>
                Apoyar proyecto
              </a>
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>
              <button onClick={() => { setShowDropdown(false); onLogout(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}