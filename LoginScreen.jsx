import React, { useState, useEffect, Suspense, lazy } from 'react';
import { LOGO_URL } from './utils';
import './App.css';
import { auth, googleProvider } from './firebase';
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const Privacidad = lazy(() => import('./Privacidad'));
const Terminos = lazy(() => import('./Terminos'));

export default function LoginScreen({ onLogin }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(null);

  useEffect(() => {
    // Comprueba si el usuario acaba de volver de una redirección de Google (común en iOS)
    let isMounted = true;
    setIsLoading(true);
    getRedirectResult(auth).then((result) => {
      if (isMounted) {
        if (result && result.user) {
          onLogin(result.user);
        } else {
          setIsLoading(false);
        }
      }
    }).catch((error) => {
      if (isMounted) {
        console.error("Error en redirect:", error);
        setErrorMsg("Error al iniciar sesión. Intenta abrir la página en tu navegador habitual (Chrome/Safari).");
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []); // Dependencia vacía: solo comprobar el redirect al montar la pantalla

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);
    try {
      // Detectar navegadores integrados (Instagram, Facebook) desde los cuales Google bloquea el inicio de sesión
      const ua = navigator.userAgent || navigator.vendor || window.opera;
      if (ua.includes("FBAN") || ua.includes("FBAV") || ua.includes("Instagram") || ua.includes("Line")) {
        throw new Error("Toca los 3 puntos arriba a la derecha y selecciona 'Abrir en navegador' (Chrome o Safari) para poder iniciar sesión.");
      }

      // Detectar si es iOS o si la PWA está instalada
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;

      if (isIOS || isStandalone) {
        // En iOS, Safari bloquea las ventanas emergentes. Usamos redirección segura.
        await signInWithRedirect(auth, googleProvider);
      } else {
        // En PC y Android, el Popup es más rápido y fluido
        const result = await signInWithPopup(auth, googleProvider);
        await onLogin(result.user);
      }
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
    try {
      const guestUser = {
        uid: `invitado_${Date.now()}`,
        displayName: 'Invitado',
        email: null
      };
      await onLogin(guestUser);
    } catch (error) {
      console.error("Error al iniciar como invitado:", error);
      setErrorMsg(error.message);
    }
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
            <span>Cargando tu álbum...</span>
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" />
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        <button type="button" onClick={handleGuestLogin} className="btn-secondary" disabled={isLoading} style={{ width: '100%', marginTop: '10px', opacity: isLoading ? 0.7 : 1, cursor: isLoading ? 'wait' : 'pointer' }}>
          {isLoading ? 'Entrando...' : 'Entrar como Invitado'}
        </button>

        <div className="login-footer">
          Al continuar, aceptas nuestros <a href="#" onClick={(e) => { e.preventDefault(); setShowModal('terminos'); }}>Términos de Servicio</a> y <a href="#" onClick={(e) => { e.preventDefault(); setShowModal('privacidad'); }}>Política de Privacidad</a>.
        </div>
      </div>
      
      {showModal && (
        <div className="modal-overlay" style={{ zIndex: 99999 }}>
          <div className="card modal-content" style={{ margin: 0, padding: '24px', maxHeight: '85vh', overflowY: 'auto', position: 'relative', textAlign: 'left' }}>
            <button onClick={() => setShowModal(null)} className="btn-secondary" style={{ position: 'sticky', top: 0, float: 'right', zIndex: 10, padding: '6px 12px', fontSize: '12px' }}>Cerrar</button>
            <Suspense fallback={<div style={{ textAlign: 'center', padding: '20px' }}>Cargando...</div>}>
              {showModal === 'privacidad' ? <Privacidad /> : <Terminos />}
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}