import React from 'react';
import './App.css';

export default function Header({ perfil, onLogout }) {
  return (
    <div className="header">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Mundial 2026</h1>
        <span style={{ opacity: 0.85, fontSize: '11px' }}>Gestor Cromos</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: '600' }}>@{perfil.nickname}</div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', transition: 'background 0.2s' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>Salir</button>
      </div>
    </div>
  );
}