import React, { useState } from 'react';
import { LOGO_URL } from './utils';
import './App.css';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ onLogin }) {
  const [emailInput, setEmailInput] = useState('');
  const [nickInput, setNickInput] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !nickInput.trim()) return alert("Rellena todos los campos.");
    onLogin({ email: emailInput.trim().toLowerCase(), nickname: nickInput.trim().toLowerCase() });
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      onLogin({ 
        email: user.email, 
        nickname: user.displayName || user.email.split('@')[0] 
      });
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
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
        
        <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0' }}>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px', color: '#94A3B8' }}>O</span>
          <div style={{ flex: 1, height: '1px', background: '#E2E8F0' }}></div>
        </div>
        <button type="button" onClick={handleGoogleLogin} className="btn-secondary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style={{ width: '18px', height: '18px' }} />
          Continuar con Google
        </button>
      </form>
    </div>
  );
}