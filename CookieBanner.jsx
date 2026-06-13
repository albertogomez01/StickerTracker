import React, { useState, useEffect } from 'react';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Comprobamos si el usuario ya tomó una decisión en el pasado
    const consent = localStorage.getItem('google_adsense_consent');
    
    if (!consent) {
      // Si no existe registro, mostramos el banner obligatoriamente
      setShowBanner(true);
    } else if (consent === 'accepted') {
      // Si ya aceptó previamente, ejecutamos la carga directa de AdSense
      loadGoogleAdSense();
    }
  }, []);

  const loadGoogleAdSense = () => {
    // Evitamos duplicar el script si ya fue inyectado
    if (document.getElementById('google-adsense-script')) return;

    const script = document.createElement('script');
    script.id = 'google-adsense-script';
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6350264370547424";
    script.async = true;
    script.crossOrigin = "anonymous";
    
    document.head.appendChild(script);
    console.log("Google AdSense cargado legalmente tras recibir el consentimiento.");
  };

  const handleAccept = () => {
    localStorage.setItem('google_adsense_consent', 'accepted');
    setShowBanner(false);
    loadGoogleAdSense(); // Activamos los anuncios inmediatamente
  };

  const handleDecline = () => {
    localStorage.setItem('google_adsense_consent', 'declined');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="card animate-fade-in" style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 32px)', maxWidth: '600px', zIndex: 99999, padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', border: '2px solid var(--accent-primary)' }}>
      <h3 style={{ margin: '0 0 10px 0', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        🍪 Privacidad y Anuncios
      </h3>
      <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
        Utilizamos cookies propias para el funcionamiento de la app y de terceros (Google AdSense) para financiar los servidores mediante anuncios. Al aceptar, permites la personalización de publicidad según tus intereses. Puedes consultar los detalles en nuestra <a href="/privacidad" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Política de Privacidad</a> y <a href="/terminos" style={{ color: 'var(--accent-primary)', fontWeight: 'bold', textDecoration: 'none' }}>Términos de Servicio</a>.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button onClick={handleAccept} className="btn-secondary" style={{ width: '100%', fontSize: '14px', padding: '12px' }}>Aceptar y Continuar</button>
        <button onClick={handleDecline} className="btn-secondary" style={{ width: '100%', fontSize: '14px', padding: '12px' }}>Rechazar</button>
      </div>
    </div>
  );
}