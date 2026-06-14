import React, { useState } from 'react';
import './App.css';
import { LOGO_URL, ALBUMS } from './utils';
import { toast } from 'react-hot-toast';

export default function Header({ perfil, onLogout, onEliminarCuenta, isMuted, toggleMute, theme, toggleTheme, resetTheme, actualizarPerfil, cambiarFoto, albumActivo, setAlbumActivo, installPrompt, setInstallPrompt, updateAvailable, startTour, borrarNotificaciones }) {
  const [isLogoAnimating, setIsLogoAnimating] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAlbumDropdown, setShowAlbumDropdown] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editForm, setEditForm] = useState({ nickname: '', estadoTexto: '' });

  const handleLogoClick = () => {
    setShowAlbumDropdown(!showAlbumDropdown);
    setShowDropdown(false);
    if (!isLogoAnimating) {
      setIsLogoAnimating(true);
      setTimeout(() => setIsLogoAnimating(false), 500);
    }
  };

  const handleShare = async () => {
    const shareUrl = `https://sticker-tracker01.vercel.app/?ref=${perfil.id}`;
    const shareData = {
      title: 'Sticker Tracker - Mundial 2026',
      text: 'Únete a Sticker Tracker y completemos juntos el álbum del Mundial 2026.',
      url: shareUrl
    };
    
    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast.success("Enlace copiado al portapapeles.");
      }
    } catch (err) {
      console.log("El usuario canceló el menú de compartir");
    }
  };

  const openEditProfile = () => {
    setEditForm({ nickname: perfil.nickname || '', estadoTexto: perfil.estadoTexto || '' });
    setShowEditProfile(true);
    setShowDropdown(false);
  };

  const generarAvatarAleatorio = () => {
    // Usamos la API de DiceBear para generar avatares ilustrados/3D al instante
    const estilos = ['micah', 'bottts', 'adventurer', 'lorelei', 'fun-emoji'];
    const estiloAlAzar = estilos[Math.floor(Math.random() * estilos.length)];
    const seed = perfil.nickname + Math.floor(Math.random() * 10000);
    const url = `https://api.dicebear.com/7.x/${estiloAlAzar}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
    
    actualizarPerfil({ photoURL: url });
    setShowDropdown(false);
    toast.success("¡Avatar mágico generado!", { icon: '✨' });
  };

  return (
    <div className="header">
      <div style={{ position: 'relative' }}>
        <div onClick={handleLogoClick} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', userSelect: 'none', padding: '6px', borderRadius: '12px', transition: 'background 0.2s', margin: '-6px' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onPointerUp={(e) => e.currentTarget.style.background = 'transparent'}>
          <img src={LOGO_URL} alt="Logo" className={`header-logo ${isLogoAnimating ? 'logo-spin' : ''}`} />
          <div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', color: 'white' }}>
              {ALBUMS[albumActivo]?.nombre || 'Mundial 2026'} <span style={{ fontSize: '10px', opacity: 0.8 }}>▼</span>
            </div>
            <div style={{ opacity: 0.85, fontSize: '11px', marginTop: '-2px', color: 'white' }}>Gestor Cromos</div>
          </div>
        </div>
        
        {showAlbumDropdown && (
          <div className="animate-fade-in" style={{ position: 'absolute', top: '100%', left: 0, marginTop: '16px', background: 'var(--bg-card)', borderRadius: '14px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', minWidth: '220px', maxWidth: 'calc(100vw - 40px)', zIndex: 1001, display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border-primary)' }}>
            <div style={{ padding: '8px', fontSize: '11px', fontWeight: 'bold', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selecciona tu Colección</div>
            {Object.values(ALBUMS).map(album => (
              <button key={album.id} onClick={() => { setAlbumActivo(album.id); setShowAlbumDropdown(false); }} style={{ background: albumActivo === album.id ? 'var(--bg-input)' : 'transparent', border: 'none', color: albumActivo === album.id ? 'var(--accent-primary)' : 'var(--text-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold', textAlign: 'left', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onPointerDown={(e) => e.currentTarget.style.background = 'var(--border-primary)'} onPointerUp={(e) => e.currentTarget.style.background = albumActivo === album.id ? 'var(--bg-input)' : 'transparent'}>
                {album.nombre}
                {albumActivo === album.id && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
              </button>
            ))}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={toggleTheme} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} aria-label="Alternar tema">
          {theme === 'light' ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg><span>Noche</span></>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg><span>Día</span></>
          )}
        </button>
        <button onClick={toggleMute} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} aria-label="Alternar sonido">
          {isMuted ? (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg><span>Mudo</span></>
          ) : (
            <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/></svg><span>Sonido</span></>
          )}
        </button>
        <button onClick={() => setShowShareModal(true)} style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', borderRadius: '10px', padding: '4px 8px', cursor: 'pointer', fontSize: '10px', fontWeight: 'bold', transition: 'background 0.2s', display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center', justifyContent: 'center' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'} aria-label="Compartir">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span>Compartir</span>
        </button>
        <div style={{ position: 'relative' }}>
          <button onClick={() => { setShowDropdown(!showDropdown); setShowAlbumDropdown(false); }} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'background 0.2s', position: 'relative' }} onPointerDown={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'} onPointerUp={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}>
            {updateAvailable && <div style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', background: '#EF4444', borderRadius: '50%' }}></div>}
            {perfil.photoURL && <img src={perfil.photoURL} alt="" style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover', margin: '-2px 0' }} />}
            @{perfil.nickname} <span style={{ fontSize: '10px' }}>{showDropdown ? '▲' : '▼'}</span>
          </button>
          {showDropdown && (
            <div className="animate-fade-in" style={{ position: 'absolute', top: '100%', right: 0, marginTop: '12px', background: 'var(--bg-card)', borderRadius: '14px', padding: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', minWidth: '200px', maxWidth: 'calc(100vw - 40px)', zIndex: 1001, display: 'flex', flexDirection: 'column', gap: '4px', border: '1px solid var(--border-primary)' }}>
              <div style={{ padding: '8px 12px', cursor: 'default', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {perfil.photoURL ? (
                  <img src={perfil.photoURL} alt="" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 'bold', flexShrink: 0 }}>{perfil.nickname.charAt(0).toUpperCase()}</div>
                )}
                <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>@{perfil.nickname}</div>
                  {perfil.email && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{perfil.email}</div>}
                </div>
              </div>
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '0 0 4px 0' }}></div>
              <button onClick={openEditProfile} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                Editar perfil
              </button>
              <label style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%', display: 'block', margin: 0 }}>
                Cambiar foto
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { cambiarFoto(e); setShowDropdown(false); }} />
              </label>
              <button onClick={generarAvatarAleatorio} style={{ background: 'transparent', border: 'none', color: 'var(--accent-primary)', padding: '0 12px 12px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                ✨ Generar Avatar Aleatorio
              </button>
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>
              <button onClick={() => { setShowDropdown(false); startTour(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🗺️ Repetir Tour Guiado
              </button>
              <button onClick={() => { setShowDropdown(false); resetTheme(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                Tema Automático (Sistema)
              </button>
              {(updateAvailable || installPrompt) && <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>}
              <button onClick={() => { setShowDropdown(false); borrarNotificaciones(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🔕 Borrar Notificaciones
              </button>
              {updateAvailable ? (
                <button onClick={() => window.location.reload()} style={{ background: 'var(--accent-primary)', border: 'none', color: 'white', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                  Actualizar aplicación
                </button>
              ) : installPrompt ? (
                <button onClick={async () => { installPrompt.prompt(); const { outcome } = await installPrompt.userChoice; if(outcome === 'accepted') setInstallPrompt(null); setShowDropdown(false); }} style={{ background: 'var(--bg-input)', border: '1px solid var(--accent-primary)', color: 'var(--accent-primary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                  Instalar aplicación
                </button>
              ) : null}
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>
              <a href="https://ko-fi.com/stickertracker01" target="_blank" rel="noopener noreferrer" onClick={() => setShowDropdown(false)} style={{ textDecoration: 'none', color: '#FF5E5B', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', background: 'rgba(255, 94, 91, 0.1)', textAlign: 'left', display: 'block' }}>
                Apoyar proyecto
              </a>
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>
              <button onClick={() => { setShowDropdown(false); onLogout(); }} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                {perfil?.id?.startsWith('invitado_') ? 'Iniciar sesión' : 'Cerrar sesión'}
              </button>
              <div style={{ height: '1px', background: 'var(--border-primary)', margin: '4px 0' }}></div>
              <button onClick={() => { setShowDropdown(false); onEliminarCuenta(); }} style={{ background: 'transparent', border: 'none', color: '#DC2626', padding: '12px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', textAlign: 'left', width: '100%' }}>
                Eliminar cuenta
              </button>
            </div>
          )}
        </div>
      </div>

      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="card modal-content" style={{ margin: 0, padding: '24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: 'var(--accent-primary)', fontSize: '20px' }}>Compartir App</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5', margin: '8px 0 16px 0' }}>
              Escanea este código QR para abrir la aplicación en otro dispositivo, o comparte el enlace directamente.
            </p>
            <div style={{ background: 'white', padding: '16px', borderRadius: '16px', display: 'inline-block', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`https://sticker-tracker01.vercel.app/?ref=${perfil.id}`)}`} alt="Código QR" style={{ width: '200px', height: '200px', display: 'block' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
              <button onClick={() => { handleShare(); setShowShareModal(false); }} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Compartir Enlace
              </button>
              <button onClick={() => setShowShareModal(false)} className="btn-secondary" style={{ width: '100%' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="card modal-content" style={{ margin: 0, padding: '24px' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ marginTop: 0, color: 'var(--accent-primary)', fontSize: '20px' }}>Editar Perfil</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!editForm.nickname.trim()) return toast.error("El apodo no puede estar vacío");
              actualizarPerfil({ nickname: editForm.nickname.trim(), estadoTexto: editForm.estadoTexto.trim() });
              setShowEditProfile(false);
            }} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Apodo</label>
                <input type="text" value={editForm.nickname} onChange={e => setEditForm({...editForm, nickname: e.target.value})} className="input-field" style={{ padding: '10px 14px', marginTop: '4px' }} maxLength={20} required />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Estado (Mercado)</label>
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{editForm.estadoTexto?.length || 0}/120</span>
                </div>
                <textarea value={editForm.estadoTexto} onChange={e => setEditForm({...editForm, estadoTexto: e.target.value})} className="input-field" placeholder="Ej: Busco a Messi, sólo cambio en Madrid..." style={{ padding: '10px 14px', marginTop: '4px', height: '60px', resize: 'none' }} maxLength={120} />
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowEditProfile(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}