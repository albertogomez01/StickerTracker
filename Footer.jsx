import React from 'react';
import './App.css';

export default function Footer({ seccionActual, setSeccionActual }) {
  const getButtonClass = (seccion) => {
    // Construye el nombre de la clase dinámicamente
    return `footer-nav-btn ${seccionActual === seccion ? 'footer-nav-btn--active' : ''}`;
  };

  return (
    <div className="footer-nav">
      <button onClick={() => setSeccionActual('album')} className={getButtonClass('album')}>
        <span className="footer-nav-btn__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
        </span>
        <span className="footer-nav-btn__label">Mi álbum</span>
      </button>
      <button onClick={() => setSeccionActual('importar')} className={getButtonClass('importar')}>
        <span className="footer-nav-btn__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/></svg>
        </span>
        <span className="footer-nav-btn__label">Importar</span>
      </button>
      <button onClick={() => setSeccionActual('intercambios')} className={getButtonClass('intercambios')}>
        <span className="footer-nav-btn__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
        </span>
        <span className="footer-nav-btn__label">Intercambios</span>
      </button>
      <button onClick={() => setSeccionActual('mercado')} className={getButtonClass('mercado')}>
        <span className="footer-nav-btn__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </span>
        <span className="footer-nav-btn__label">Mercado</span>
      </button>
      <button onClick={() => setSeccionActual('stats')} className={getButtonClass('stats')}>
        <span className="footer-nav-btn__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
        </span>
        <span className="footer-nav-btn__label">Stats</span>
      </button>
    </div>
  );
}