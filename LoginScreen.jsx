import React, { useState } from 'react';
import { LOGO_URL } from './utils';
import './App.css';
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';

export default function LoginScreen({ onLogin }) {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      // Pasamos el objeto 'user' completo que nos da Firebase. Contiene el UID seguro.
      onLogin(user);
    } catch (error) {
      console.error("Error al iniciar sesión con Google:", error);
    }
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
        
        <button type="button" onClick={handleGoogleLogin} className="btn-google">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
          <span>Continuar con Google</span>
        </button>

        <div className="login-footer">
          Al continuar, aceptas nuestros <a href="#">Términos de Servicio</a> y <a href="#">Política de Privacidad</a>.
        </div>
      </div>
    </div>
  );
}