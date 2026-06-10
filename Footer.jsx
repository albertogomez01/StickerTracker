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
        <span className="footer-nav-btn__icon">📋</span>
        <span className="footer-nav-btn__label">Mi álbum</span>
      </button>
      <button onClick={() => setSeccionActual('importar')} className={getButtonClass('importar')}>
        <span className="footer-nav-btn__icon">📤</span>
        <span className="footer-nav-btn__label">Importar</span>
      </button>
      <button onClick={() => setSeccionActual('intercambios')} className={getButtonClass('intercambios')}>
        <span className="footer-nav-btn__icon">🔄</span>
        <span className="footer-nav-btn__label">Intercambios</span>
      </button>
      <button onClick={() => setSeccionActual('mercado')} className={getButtonClass('mercado')}>
        <span className="footer-nav-btn__icon">🌍</span>
        <span className="footer-nav-btn__label">Mercado</span>
      </button>
      <button onClick={() => setSeccionActual('stats')} className={getButtonClass('stats')}>
        <span className="footer-nav-btn__icon">📊</span>
        <span className="footer-nav-btn__label">Stats</span>
      </button>
    </div>
  );
}