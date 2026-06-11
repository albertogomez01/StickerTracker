import React, { useState } from 'react';
import { LOGO_URL } from './utils';
import './App.css';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ onLogin }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Pasamos el objeto 'user' completo que nos da Firebase. Contiene el UID seguro.
      await onLogin(user);
    } catch (error) {
      // Si el usuario simplemente cerró la ventana, no lo tratamos como un error molesto
      if (error.code !== 'auth/popup-closed-by-user') {
        console.error("Error al iniciar sesión con Google:", error);
        setErrorMsg(error.message);
      }
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    const guestUser = {
      uid: 'invitado_' + Date.now(),
      displayName: 'Invitado',
      email: null
    };
    await onLogin(guestUser);
    setIsLoading(false);
  };

  return (
    <div className="login-container">
      {/* Fondo animado */}
      <div className="login-background">
        <div className="login-blob login-blob-1"></div>
        <div className="login-blob login-blob-2"></div>
      </div>
      
      <div className="login-card">
        <img src={LOGO_URL} alt="Logo" className="login-logo" />
        <h2>Mundial 2026</h2>
        <p>Gestiona tus cromos y coordina intercambios de forma inteligente.</p>
        
        {errorMsg && <div style={{ color: '#DC2626', background: '#FEF2F2', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px', border: '1px solid #FCA5A5' }}>Error: {errorMsg}</div>}

        <button type="button" onClick={handleGoogleLogin} className="btn-google" disabled={isLoading} style={{ opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}>
          {isLoading ? (
            <span>⏳ Cargando tu álbum...</span>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        <button type="button" onClick={handleGuestLogin} className="btn-secondary" disabled={isLoading} style={{ width: '100%', marginTop: '10px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}>
          {isLoading ? '⏳ Entrando...' : '👤 Entrar como Invitado'}
        </button>

        <div className="login-footer">
          Al continuar, aceptas nuestros <a href="#" onClick={(e) => { e.preventDefault(); alert("Los Términos de Servicio estarán disponibles próximamente."); }}>Términos de Servicio</a> y <a href="#" onClick={(e) => { e.preventDefault(); alert("La Política de Privacidad estará disponible próximamente."); }}>Política de Privacidad</a>.
        </div>
      </div>
    </div>
  );
}