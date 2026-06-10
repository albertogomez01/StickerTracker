import React from 'react';
import './App.css';

export default function Header({ perfil, onLogout }) {
  return (
    <div className="header">
      <div>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Mundial 2026</h1>
        <span style={{ opacity: 0.85, fontSize: '11px' }}>Gestor Cromos</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '12px' }}>@{perfil.nickname}</div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', borderRadius: '8px', padding: '4px 8px', cursor: 'pointer', fontSize: '11px' }}>Salir</button>
      </div>
    </div>
  );
}