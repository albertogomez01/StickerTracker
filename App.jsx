import React, { useState, useEffect, useMemo, Suspense, lazy, useRef } from 'react';
import './App.css';
import Confetti from 'react-confetti';
import { ALBUMS, parsearTextoAStickers, LOGO_URL } from './utils';
import LoginScreen from './LoginScreen';
import Header from './Header';
import Footer from './Footer';
import { db, auth } from './firebase';
import { doc, getDoc, setDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { signOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Toaster, toast } from 'react-hot-toast';

const Album = lazy(() => import('./Album'));
const Importar = lazy(() => import('./Importar'));
const Intercambios = lazy(() => import('./Intercambios'));
const Mercado = lazy(() => import('./Mercado'));
const Estadisticas = lazy(() => import('./Estadisticas'));

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [seccionActual, setSeccionActual] = useState('intercambios');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [albumActivo, setAlbumActivo] = useState(() => localStorage.getItem('panini_album') || 'mundial_2026');
  const saveTimeoutRef = useRef(null);
  const actionHistoryRef = useRef([]);
  const [undoCount, setUndoCount] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);
  const [perfil, setPerfil] = useState(() => {
    try {
      const guardado = localStorage.getItem('panini_perfil');
      return guardado ? JSON.parse(guardado) : null;
    } catch (error) {
      return null;
    }
  });
  const [isMuted, setIsMuted] = useState(() => {
    try {
      return localStorage.getItem('panini_muted') === 'true';
    } catch (error) {
      return false;
    }
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem('panini_theme');
      if (savedTheme) return savedTheme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {}
    return 'light';
  });
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('panini_tutorial_seen'));

  useEffect(() => {
    // 📡 Listener para detectar conexión a Internet en tiempo real
    const handleOnline = () => {
      setIsNetworkOnline(true);
      toast.success("Conexión restaurada, sincronizando...");
    };
    const handleOffline = () => setIsNetworkOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      // Solo cambiamos automáticamente si el usuario no ha forzado un tema manualmente
      if (!localStorage.getItem('panini_theme')) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('panini_album', albumActivo);
  }, [albumActivo]);

  useEffect(() => {
    const initFCM = async () => {
      if (!perfil || perfil.id.startsWith('invitado_')) return;
      if (!('Notification' in window)) return;
      
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const messaging = getMessaging(auth.app);
          
          const currentToken = await getToken(messaging, { 
            vapidKey: 'BH3vp1lZuGRH93hctIbqdUx3JwpdCN2swoGTmH17S2l_W_lPwRenMJItnUSdD6Hn157jOYgleWYl-rJLDuoPWLQ' 
          });
          
          if (currentToken) {
            // Guardamos el token FCM en el perfil del usuario para enviarle notificaciones luego
            await setDoc(doc(db, 'usuarios', perfil.id), { fcmToken: currentToken }, { merge: true });
          }
          
          onMessage(messaging, (payload) => {
            toast.success(`${payload.notification.title}: ${payload.notification.body}`);
          });
        }
      } catch (e) {
        console.error("No se pudo inicializar Firebase Cloud Messaging:", e);
      }
    };
    initFCM();
  }, [perfil?.id]);

  useEffect(() => {
    // Escuchar cuando el dispositivo este listo para instalar la PWA
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    // Detectar si hay una actualización de la PWA disponible
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }
  }, []);

  useEffect(() => {
    // El "guardián" de Firebase: vigila que la sesión sea válida al recargar
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      let perfilLocal = null;
      try {
        const guardado = localStorage.getItem('panini_perfil');
        if (guardado) perfilLocal = JSON.parse(guardado);
      } catch(e) {}

      if (user) {
        // Si Firebase confirma la sesión pero no la tenemos, la recuperamos
        if (!perfilLocal || perfilLocal.id !== user.uid) {
          const userRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(userRef);
          
          const guestTransferStr = localStorage.getItem('panini_guest_transfer');
          let guestStickers = null;
          if (guestTransferStr) {
            try { guestStickers = JSON.parse(guestTransferStr); } catch (e) {}
            localStorage.removeItem('panini_guest_transfer');
          }

          if (docSnap.exists()) {
            const data = docSnap.data();
            if (guestStickers && Object.keys(guestStickers).length > 0) {
              const merged = { ...data.stickers };
              let modified = false;
              for (const [k, v] of Object.entries(guestStickers)) {
                if (v > (merged[k] || 0)) { merged[k] = v; modified = true; }
              }
              if (modified) {
                data.stickers = merged;
                await setDoc(userRef, { stickers: merged }, { merge: true });
                setTimeout(() => toast.success("¡Tus cromos de invitado se han transferido!"), 1000);
              }
            }
            setPerfil(data);
          } else {
            // Si viene de una redirección en iOS y es su primera vez, creamos el perfil aquí
            const nuevoPerfil = { id: user.uid, email: user.email, nickname: user.displayName || 'Invitado', photoURL: user.photoURL || null, stickers: guestStickers || {} };
            await setDoc(userRef, nuevoPerfil);
            setPerfil(nuevoPerfil);
            if (guestStickers && Object.keys(guestStickers).length > 0) {
              setTimeout(() => toast.success("¡Tus cromos de invitado se han guardado!"), 1000);
            }
          }
        }
      } else if (perfilLocal && !perfilLocal.id.startsWith('invitado_')) {
        // Si Firebase indica que expiró la sesión y NO es un invitado, lo deslogueamos por seguridad
        setPerfil(null);
      }
      
      // Ocultar la pantalla de carga después de procesar la sesión (con un pequeño retraso para ver la animación)
      setTimeout(() => setIsInitializing(false), 1200);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!perfil?.id || perfil.id.startsWith('invitado_')) return;
    
    // 🎧 Escuchamos los cambios de Firestore en tiempo real
    const unsub = onSnapshot(doc(db, "usuarios", perfil.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPerfil(prev => {
          if (!prev) return data;
          // Comparamos para evitar bucles si el cambio lo hicimos nosotros mismos en este dispositivo
          if (JSON.stringify(prev.stickers) !== JSON.stringify(data.stickers) || prev.nickname !== data.nickname || prev.photoURL !== data.photoURL) {
            return { ...prev, stickers: data.stickers, nickname: data.nickname, photoURL: data.photoURL };
          }
          return prev;
        });
      }
    });
    return () => unsub();
  }, [perfil?.id]);

  useEffect(() => {
    if (!perfil?.id || perfil.id.startsWith('invitado_')) return;
    
    // 🎧 Escuchamos la colección de notificaciones en tiempo real
    const unsubNotifs = onSnapshot(doc(db, "notificaciones", perfil.id), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data().lista || [];
        const noLeidas = data.filter(n => !n.read);
        
        if (noLeidas.length > 0) {
          noLeidas.forEach(n => {
            // Si la app está en segundo plano y hay permisos, lanzamos push nativa
            if ("Notification" in window && Notification.permission === "granted" && document.visibilityState !== "visible") {
              new Notification(n.title || "Nueva Notificación", { body: n.text, icon: LOGO_URL });
            } else {
              // Si la app está abierta o no hay permisos, usamos un toast integrado
              toast.success(`${n.title || "Nueva Notificación"}: ${n.text}`, { duration: 4000 });
            }
          });
          
          // Marcar como leídas automáticamente en Firestore para no repetir
          const marcadas = data.map(n => ({ ...n, read: true }));
          setDoc(doc(db, "notificaciones", perfil.id), { lista: marcadas });
        }
      }
    });
    return () => unsubNotifs();
  }, [perfil?.id]);

  useEffect(() => {
    try {
      if (perfil) {
        localStorage.setItem('panini_perfil', JSON.stringify(perfil));
      } else {
        // Si el perfil es null (logout), lo removemos
        localStorage.removeItem('panini_perfil');
      }
    } catch (error) {
      console.error("Error al guardar el perfil en localStorage:", error);
    }
  }, [perfil]);

  useEffect(() => {
    // Sistema de presencia en línea
    if (!perfil?.id || perfil.id.startsWith('invitado_')) return;
    const userRef = doc(db, 'usuarios', perfil.id);

    const setOnline = () => setDoc(userRef, { isOnline: true, lastSeen: Date.now() }, { merge: true }).catch(() => {});
    const setOffline = () => setDoc(userRef, { isOnline: false, lastSeen: Date.now() }, { merge: true }).catch(() => {});

    setOnline();

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') setOnline();
      else setOffline();
    };

    window.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', setOffline);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', setOffline);
      setOffline();
    };
  }, [perfil?.id]);

  const toggleMute = () => {
    setIsMuted(prev => {
      const newVal = !prev;
      try { localStorage.setItem('panini_muted', String(newVal)); } catch (e) {}
      return newVal;
    });
  };

  const toggleTheme = () => {
    setTheme(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('panini_theme', newTheme);
      return newTheme;
    });
  };

  const resetTheme = () => {
    localStorage.removeItem('panini_theme'); // Olvidamos la decisión manual
    const isDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDark ? 'dark' : 'light'); // Volvemos a leer el sistema
    toast.success("Tema automático (sistema) activado");
  };

  const cambiarApodo = async (nuevoApodo) => {
    if (!nuevoApodo || nuevoApodo.trim() === '' || nuevoApodo === perfil.nickname) return;
    const apodoLimpio = nuevoApodo.trim();
    const nuevoPerfil = { ...perfil, nickname: apodoLimpio };
    setPerfil(nuevoPerfil);

    if (perfil.id.startsWith('invitado_')) {
      toast.success("Apodo actualizado localmente.");
      return;
    }

    try {
      await setDoc(doc(db, "usuarios", perfil.id), nuevoPerfil);
      // Actualizamos también el mercado si el usuario estaba publicado
      const mercadoRef = doc(db, 'mercado', perfil.id);
      const mercadoSnap = await getDoc(mercadoRef);
      if (mercadoSnap.exists()) {
        await setDoc(mercadoRef, { nickname: apodoLimpio }, { merge: true });
      }
      toast.success("Apodo actualizado correctamente.");
    } catch (e) {
      console.error(e);
      toast.error("Error al actualizar el apodo.");
    }
  };

  const cambiarFoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const size = 150;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        const scale = Math.max(size / img.width, size / img.height);
        const x = (size / scale - img.width) / 2;
        const y = (size / scale - img.height) / 2;
        
        ctx.drawImage(img, 0, 0, img.width, img.height, x * scale, y * scale, img.width * scale, img.height * scale);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.8);
        const nuevoPerfil = { ...perfil, photoURL: base64 };
        setPerfil(nuevoPerfil);

        if (perfil.id.startsWith('invitado_')) {
          toast.success("Foto de perfil actualizada localmente.");
          return;
        }
        
        try {
          await setDoc(doc(db, "usuarios", perfil.id), nuevoPerfil);
          const colMercado = albumActivo === 'mundial_2026' ? 'mercado' : `mercado_${albumActivo}`;
          const mercadoRef = doc(db, colMercado, perfil.id);
          const mercadoSnap = await getDoc(mercadoRef);
          if (mercadoSnap.exists()) {
            await setDoc(mercadoRef, { photoURL: base64 }, { merge: true });
          }
          toast.success("Foto de perfil actualizada");
        } catch (error) {
          console.error(error);
          toast.error("Error al actualizar la foto");
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleEliminarCuenta = async () => {
    if (window.confirm("⚠️ ¿Estás completamente seguro de que quieres eliminar tu cuenta? Esta acción borrará todos tus cromos y datos guardados, y NO se puede deshacer.")) {
      if (perfil?.id?.startsWith('invitado_')) {
        setPerfil(null);
        localStorage.clear();
        toast.success("Tus datos de invitado han sido borrados.");
        return;
      }

      try {
        const user = auth.currentUser;
        if (!user) return toast.error("No hay sesión activa.");

        // 1. Borramos los datos de las colecciones principales del usuario en todos los álbumes
        const colecciones = ['usuarios', 'notificaciones'];
        Object.keys(ALBUMS).forEach(albumId => {
          const sufijo = albumId === 'mundial_2026' ? '' : `_${albumId}`;
          colecciones.push(`mercado${sufijo}`);
          colecciones.push(`amigos${sufijo}`);
        });

        await Promise.all(colecciones.map(col => deleteDoc(doc(db, col, user.uid)).catch(() => {})));

        // 2. Borramos la cuenta de autenticación en Firebase
        await deleteUser(user);

        // 3. Limpiamos la app localmente
        setPerfil(null);
        localStorage.clear();
        toast.success("Tu cuenta ha sido eliminada correctamente.");
      } catch (error) {
        console.error("Error al eliminar la cuenta:", error);
        if (error.code === 'auth/requires-recent-login') {
          toast.error("Por seguridad, cierra sesión y vuelve a entrar antes de eliminar tu cuenta.");
        } else {
          toast.error("Hubo un error al eliminar tu cuenta.");
        }
      }
    }
  };

  const handleLogout = async () => {
    if (perfil?.id?.startsWith('invitado_')) {
      // Guardamos la lista de cromos temporalmente antes de pedir login
      localStorage.setItem('panini_guest_transfer', JSON.stringify(perfil.stickers));
      setPerfil(null);
      return;
    }

    if (window.confirm("¿Seguro que quieres cerrar sesión? Se borrarán tus datos guardados.")) {
      try { await signOut(auth); } catch (e) { console.error("Error al cerrar sesión:", e); }
      setPerfil(null);
      localStorage.removeItem('panini_amigos');
    }
  };

  const handleLogin = async (user) => {
    // Usamos el UID de Firebase Auth como ID de usuario. Es único y seguro.
    const userId = user.uid;

    if (userId.startsWith('invitado_')) {
      setPerfil({ id: userId, email: user.email, nickname: user.displayName || 'Invitado', photoURL: null, stickers: {} });
      return;
    }

    const userRef = doc(db, "usuarios", userId);

    try {
      const docSnap = await getDoc(userRef);

      const guestTransferStr = localStorage.getItem('panini_guest_transfer');
      let guestStickers = null;
      if (guestTransferStr) {
        try { guestStickers = JSON.parse(guestTransferStr); } catch (e) {}
        localStorage.removeItem('panini_guest_transfer');
      }

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (guestStickers && Object.keys(guestStickers).length > 0) {
          const merged = { ...data.stickers };
          let modified = false;
          for (const [k, v] of Object.entries(guestStickers)) {
            if (v > (merged[k] || 0)) { merged[k] = v; modified = true; }
          }
          if (modified) {
            data.stickers = merged;
            await setDoc(userRef, { stickers: merged }, { merge: true });
            setTimeout(() => toast.success("¡Tus cromos de invitado se han transferido!"), 1000);
          }
        }
        setPerfil(data); // ☁️ Carga los datos existentes de la nube
      } else {
        // 🆕 Crea un perfil nuevo en la base de datos si es su primera vez
        const nuevoPerfil = { id: userId, email: user.email, nickname: user.displayName || user.nickname || 'Invitado', photoURL: user.photoURL || null, stickers: guestStickers || {} };
        await setDoc(userRef, nuevoPerfil);
        setPerfil(nuevoPerfil);
        if (guestStickers && Object.keys(guestStickers).length > 0) {
          setTimeout(() => toast.success("¡Tus cromos de invitado se han guardado!"), 1000);
        }
      }
    } catch (error) {
      console.warn("Error accediendo a la base de datos (quizás falta configuración o es invitado local):", error);
      // Fallback local si Firebase falla o entramos como invitado
      setPerfil({ id: userId, email: user.email, nickname: user.displayName || user.nickname || 'Invitado', stickers: {} });
    }
  };

  const deshacerUltimo = () => {
    if (actionHistoryRef.current.length === 0) return;
    const { codigo, valorPrevio } = actionHistoryRef.current.pop();
    setUndoCount(actionHistoryRef.current.length);

    setPerfil(prev => {
      const copia = { ...prev.stickers };
      copia[codigo] = valorPrevio;
      const nuevoPerfil = { ...prev, stickers: copia };
      
      if (nuevoPerfil.id && !nuevoPerfil.id.startsWith('invitado_')) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e)), 1500);
      }
      return nuevoPerfil;
    });
    toast.success("Acción deshecha", { id: 'deshacer-toast' });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escuchar Ctrl+Z (Windows) o Cmd+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        // Si el usuario está escribiendo texto en un buscador o chat, no intervenimos
        const tag = e.target.tagName.toLowerCase();
        if (tag === 'input' || tag === 'textarea') return;

        if (actionHistoryRef.current.length > 0) {
          e.preventDefault();
          deshacerUltimo();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const alternarCromoManual = (codigo) => {
    // Guardamos en memoria (Ref) cuál era el valor justo antes de que lo toquemos
    const valorPrevio = perfil?.stickers?.[codigo] || 0;
    actionHistoryRef.current.push({ codigo, valorPrevio });
    if (actionHistoryRef.current.length > 5) {
      actionHistoryRef.current.shift(); // Mantenemos el límite máximo en 5
    }
    setUndoCount(actionHistoryRef.current.length);

    setPerfil(prev => {
      const copia = { ...prev.stickers };
      const valor = copia[codigo] !== undefined ? copia[codigo] : 0;
      copia[codigo] = valor === 0 ? 1 : valor === 1 ? 2 : valor < 11 ? valor + 1 : 0;
      const nuevoPerfil = { ...prev, stickers: copia };
      
      // Agrupamos las escrituras a la base de datos (Debounce) para ahorrar cuota
      if (nuevoPerfil.id && !nuevoPerfil.id.startsWith('invitado_')) {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = setTimeout(() => setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e)), 1500);
      }
      return nuevoPerfil;
    });

    // Mostrar el toast temporal (sobrescribe cualquier toast de deshacer anterior)
    toast((t) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '14px' }}>Cromo actualizado</span>
        <button 
          onClick={() => {
            toast.dismiss(t.id);
            deshacerUltimo();
          }} 
          style={{ background: 'var(--bg-input)', border: '1px solid var(--border-primary)', color: 'var(--text-primary)', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Deshacer (Ctrl+Z)
        </button>
      </div>
    ), { id: 'deshacer-toast', duration: 4000 });
  };

  const marcarEquipoCompleto = (equipoId) => {
    if (!window.confirm(`¿Seguro que quieres marcar todos los cromos de este equipo como "Tengo"?`)) return;
    setPerfil(prev => {
      const copia = { ...prev.stickers };
      const albumData = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];
      const seleccion = albumData.selecciones.find(s => s.id === equipoId);
      
      if (seleccion) {
        for (let i = 0; i < seleccion.total; i++) {
          const cod = `${seleccion.id}_${i.toString().padStart(2, '0')}`;
          // Solo marca a 1 los que nos falten. Si alguno ya es 2 (repetido), lo deja igual
          if (!copia[cod] || copia[cod] === 0) copia[cod] = 1;
        }
      }
      
      const nuevoPerfil = { ...prev, stickers: copia };
      if (nuevoPerfil.id && !nuevoPerfil.id.startsWith('invitado_')) {
        setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e));
      }
      return nuevoPerfil;
    });
    toast.success(`Equipo completado correctamente.`);
  };

  const vaciarEquipoCompleto = (equipoId) => {
    if (!window.confirm(`¿Seguro que quieres quitar todos los cromos de este equipo?`)) return;
    setPerfil(prev => {
      const copia = { ...prev.stickers };
      const albumData = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];
      const seleccion = albumData.selecciones.find(s => s.id === equipoId);
      
      if (seleccion) {
        for (let i = 0; i < seleccion.total; i++) {
          const cod = `${seleccion.id}_${i.toString().padStart(2, '0')}`;
          copia[cod] = 0;
        }
      }
      
      const nuevoPerfil = { ...prev, stickers: copia };
      if (nuevoPerfil.id && !nuevoPerfil.id.startsWith('invitado_')) {
        setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e));
      }
      return nuevoPerfil;
    });
    toast.success(`Equipo vaciado correctamente.`);
  };

  const procesarImportadorTexto = (texto, tipo) => {
    setPerfil(prev => {
      const nuevaCopia = parsearTextoAStickers(texto, tipo, albumActivo, prev.stickers);
      const nuevoPerfil = { ...prev, stickers: nuevaCopia };
      // Guardamos en la nube inmediatamente al importar
      if (nuevoPerfil.id && !nuevoPerfil.id.startsWith('invitado_')) {
        setDoc(doc(db, "usuarios", nuevoPerfil.id), nuevoPerfil).catch(e => console.error(e));
      }
      return nuevoPerfil;
    });
    toast.success(`¡Lista de ${tipo} procesada correctamente!`);
  };

  // Contadores Propios
  const { tienesCount, repetidasCount, faltanCount, pctGlobal } = useMemo(() => {
    let tCount = 0; let rCount = 0; let fCount = 0;
    const albumData = ALBUMS[albumActivo] || ALBUMS['mundial_2026'];
    albumData.selecciones.forEach(sel => {
      if (sel.id === 'EXT26') return; // Excluimos los Extra Stickers del progreso general
      for (let i = 0; i < sel.total; i++) {
        const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
        const v = perfil?.stickers?.[cod] || 0;
        if (v === 0) fCount++;
        else if (v === 1) tCount++;
        else if (v >= 2) { tCount++; rCount += (v - 1); }
      }
    });
    const pct = Math.round((tCount / albumData.totalStickers) * 100) || 0;
    return { tienesCount: tCount, repetidasCount: rCount, faltanCount: fCount, pctGlobal: pct };
  }, [perfil?.stickers, albumActivo]);

  useEffect(() => {
    if (pctGlobal === 100) {
      setShowConfetti(true);
      // Detenemos el confeti después de 10 segundos para ahorrar recursos
      const timer = setTimeout(() => setShowConfetti(false), 10000);
      return () => clearTimeout(timer);
    }
  }, [pctGlobal]);


  if (isInitializing) {
    return (
      <div className="splash-screen">
        <div className="login-background">
          <div className="login-blob login-blob-1"></div>
          <div className="login-blob login-blob-2"></div>
        </div>
        <div className="splash-content">
          <img src={LOGO_URL} alt="Logo" className="splash-logo" />
          <h2 className="splash-title">Mundial 2026</h2>
          <p className="splash-subtitle">Preparando tu álbum...</p>
          <div className="splash-loader-container"><div className="splash-loader-bar"></div></div>
        </div>
      </div>
    );
  }

  if (!perfil) {
    return <LoginScreen onLogin={handleLogin} />;
  }



  return (
    <div className="app-container">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      {!isNetworkOnline && (
        <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', background: '#EF4444', color: 'white', padding: '6px 16px', borderRadius: '99px', fontSize: '13px', fontWeight: 'bold', zIndex: 1001, display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
          Estás Offline
        </div>
      )}
      <Header perfil={perfil} onLogout={handleLogout} onEliminarCuenta={handleEliminarCuenta} isMuted={isMuted} toggleMute={toggleMute} theme={theme} toggleTheme={toggleTheme} resetTheme={resetTheme} cambiarApodo={cambiarApodo} cambiarFoto={cambiarFoto} albumActivo={albumActivo} setAlbumActivo={setAlbumActivo} installPrompt={installPrompt} setInstallPrompt={setInstallPrompt} updateAvailable={updateAvailable} />

      <div className="content-wrapper" style={{ marginTop: '16px' }}>
        <div className="card stats-card-modern">
          <div className="stats-header">
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-primary)' }}>Progreso de {ALBUMS[albumActivo]?.nombre || 'Mundial 2026'}</span>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{tienesCount} de {ALBUMS[albumActivo]?.totalStickers || 992} cromos</span>
            </div>
            <span className="stats-pct">{pctGlobal}%</span>
          </div>
          <div className="stats-progress-bar-container"><div className="stats-progress-bar-fill" style={{ width: `${pctGlobal}%` }}></div></div>
          <div className="stats-grid-modern">
            <div className="stat-item have"><span className="stat-value">{tienesCount}</span><span className="stat-label">Tengo</span></div>
            <div className="stat-item repes"><span className="stat-value">{repetidasCount}</span><span className="stat-label">Repes</span></div>
            <div className="stat-item missing"><span className="stat-value">{faltanCount}</span><span className="stat-label">Faltan</span></div>
          </div>
        </div>
      </div>
      <div className="content-wrapper">
        <Suspense fallback={<div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>Cargando sección...</div>}>
          {seccionActual === 'album' && <Album perfil={perfil} alternarCromoManual={alternarCromoManual} marcarEquipoCompleto={marcarEquipoCompleto} vaciarEquipoCompleto={vaciarEquipoCompleto} isMuted={isMuted} albumActivo={albumActivo} deshacerUltimo={deshacerUltimo} undoCount={undoCount} />}
          {seccionActual === 'importar' && <Importar procesarImportadorTexto={procesarImportadorTexto} perfil={perfil} albumActivo={albumActivo} />}
          {seccionActual === 'intercambios' && <Intercambios perfil={perfil} albumActivo={albumActivo} onLogout={handleLogout} />}
          {seccionActual === 'mercado' && <Mercado perfil={perfil} setSeccionActual={setSeccionActual} albumActivo={albumActivo} onLogout={handleLogout} />}
          {seccionActual === 'stats' && <Estadisticas albumActivo={albumActivo} perfil={perfil} />}
        </Suspense>
      </div>
      <Footer seccionActual={seccionActual} setSeccionActual={setSeccionActual} />
      
      <SpeedInsights />
      <Toaster 
        position="bottom-center" 
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-primary)'
          }
        }}
      />

      {showTutorial && (
        <div className="modal-overlay">
          <div className="card modal-content" style={{ margin: 0, padding: '24px' }}>
            <h2 style={{ marginTop: 0, color: 'var(--accent-primary)', fontSize: '22px' }}>Bienvenido al Gestor</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
              Sigue estos sencillos pasos para completar tu coleccion rapidamente:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '20px 0' }}>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>1. Mi album</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Marca los cromos que vas consiguiendo. Los repetidos se sumaran automaticamente.</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>2. Mercado Publico</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Publica tu lista para que otros te encuentren y solicita intercambios a perfiles compatibles.</span>
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px', borderRadius: '12px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: 'var(--text-primary)' }}>3. Intercambios</strong>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Cruza tus listas con las de tus amigos y comparte imagenes resumen para coordinarte.</span>
              </div>
            </div>
            <button onClick={() => { setShowTutorial(false); localStorage.setItem('panini_tutorial_seen', 'true'); }} className="btn-primary" style={{ width: '100%' }}>Comenzar</button>
          </div>
        </div>
      )}
    </div>

  );
}
