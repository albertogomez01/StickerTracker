import React, { useState } from 'react';
import { LOGO_URL } from './utils';
import './App.css';

export default function LoginScreen({ onLogin }) {
  const [emailInput, setEmailInput] = useState('');
  const [nickInput, setNickInput] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !nickInput.trim()) return alert("Rellena todos los campos.");
    onLogin({ email: emailInput.trim().toLowerCase(), nickname: nickInput.trim().toLowerCase() });
  };

  return (
    <div className="login-container">
      <form onSubmit={handleLogin} className="login-form">
        <img src={LOGO_URL} alt="Logo" style={{ width: '56px', height: '56px', margin: '0 auto 12px auto', display: 'block' }} />
        <h2 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }}>Mundial 2026</h2>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email</label>
          <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} className="input-field" />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Nickname</label>
          <input type="text" required value={nickInput} onChange={(e) => setNickInput(e.target.value)} className="input-field" />
        </div>
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px' }}>Iniciar Aplicación</button>
      </form>
    </div>
  );
}