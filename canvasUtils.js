export const generarImagenTrueque = async (perfilNickname, nickAmigo, leDoyList, meDaList) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  
  // 1. Fondo Oscuro (Dark Mode)
  ctx.fillStyle = '#0F172A'; 
  ctx.fillRect(0, 0, 1080, 1920);

  // 2. Marca de agua para viralidad
  ctx.save();
  ctx.translate(540, 960);
  ctx.rotate(-Math.PI / 4);
  ctx.font = '900 140px system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.textAlign = 'center';
  ctx.fillText('STICKER TRACKER', 0, 0);
  ctx.fillText('MUNDIAL 2026', 0, 150);
  ctx.restore();

  // Utilidad para bordes neón
  const drawNeonRect = (x, y, w, h, color, glowColor) => {
    ctx.save();
    ctx.shadowBlur = 40;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = 6;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 40);
    else ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.05; // Fondo semitransparente tintado
    ctx.fill();
    ctx.restore();
  };

  // 3. Cabecera
  ctx.fillStyle = '#10B981';
  ctx.font = '900 60px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('TICKET DE INTERCAMBIO', 540, 140);
  
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 36px system-ui';
  ctx.fillText('Sticker Tracker 2026', 540, 200);

  // 4. Badge "Match Garantizado" (Gamificación)
  if (leDoyList.length > 0 && Math.abs(leDoyList.length - meDaList.length) <= 2) {
    ctx.save();
    ctx.fillStyle = '#F59E0B';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#D97706';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(300, 250, 480, 70, 35);
    else ctx.rect(300, 250, 480, 70);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.shadowBlur = 0;
    ctx.font = '900 32px system-ui';
    ctx.fillText('⭐ MATCH GARANTIZADO ⭐', 540, 298);
    ctx.restore();
  }

  // 5. Caja "Tú das" (Rojo)
  drawNeonRect(80, 380, 920, 520, '#EF4444', '#DC2626');
  ctx.fillStyle = '#EF4444';
  ctx.font = '900 46px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`🔴 Tú das a @${nickAmigo} (${leDoyList.length})`, 130, 460);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 36px system-ui';
  let xYo = 130, yYo = 530;
  leDoyList.slice(0, 20).forEach((c, i) => {
    if (i === 19 && leDoyList.length > 20) {
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`+ ${leDoyList.length - 19} cromos más...`, xYo, yYo);
    } else {
      ctx.fillText(`• ${c}`, xYo, yYo);
    }
    yYo += 50;
    if (i === 9) { xYo += 440; yYo = 530; } // Salto a la segunda columna
  });

  // Icono central
  ctx.fillStyle = '#38BDF8';
  ctx.font = '900 100px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('🔄', 540, 1020);

  // 6. Caja "Él te da" (Verde)
  drawNeonRect(80, 1070, 920, 520, '#10B981', '#059669');
  ctx.fillStyle = '#10B981';
  ctx.font = '900 46px system-ui';
  ctx.textAlign = 'left';
  ctx.fillText(`🟢 @${nickAmigo} te da (${meDaList.length})`, 130, 1150);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '500 36px system-ui';
  let xEl = 130, yEl = 1220;
  meDaList.slice(0, 20).forEach((c, i) => {
    if (i === 19 && meDaList.length > 20) {
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(`+ ${meDaList.length - 19} cromos más...`, xEl, yEl);
    } else {
      ctx.fillText(`• ${c}`, xEl, yEl);
    }
    yEl += 50;
    if (i === 9) { xEl += 440; yEl = 1220; }
  });

  // 7. Footer con QR dinámico y Enlace de Referidos
  let perfilId = '';
  try {
    const guardado = localStorage.getItem('panini_perfil');
    if (guardado) {
      const perfilObj = JSON.parse(guardado);
      perfilId = perfilObj.id;
    }
  } catch (e) {}
  
  const baseUrl = 'https://sticker-tracker01.vercel.app/';
  const linkCompartir = (perfilId && !perfilId.startsWith('invitado_')) ? `${baseUrl}?ref=${perfilId}` : baseUrl;

  const loadQR = () => new Promise(res => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkCompartir)}&color=ffffff&bgcolor=0F172A`;
  });
  
  const qrImg = await loadQR();
  if (qrImg) {
    ctx.drawImage(qrImg, 440, 1640, 200, 200);
  }

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '900 36px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('¿Quieres intercambiar así de rápido?', 540, 1890);

  // 8. Crear la vista previa en el DOM antes de compartir o descargar
  const dataUrl = canvas.toDataURL('image/png');
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '999999'; // Asegurar que esté por encima de todo

  const modal = document.createElement('div');
  modal.className = 'card modal-content';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.alignItems = 'center';
  modal.style.padding = '20px';
  modal.style.gap = '16px';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';

  const titulo = document.createElement('h3');
  titulo.innerText = 'Vista previa del Ticket';
  titulo.style.margin = '0';
  titulo.style.color = 'var(--text-primary)';
  titulo.style.fontSize = '18px';

  const imgPreview = document.createElement('img');
  imgPreview.src = dataUrl;
  imgPreview.style.width = '100%';
  imgPreview.style.maxWidth = '280px';
  imgPreview.style.borderRadius = '12px';
  imgPreview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '10px';
  btnContainer.style.width = '100%';

  const btnCancel = document.createElement('button');
  btnCancel.className = 'btn-secondary';
  btnCancel.innerText = 'Cancelar';
  btnCancel.style.flex = '1';
  btnCancel.onclick = () => document.body.removeChild(overlay); // Cierra la modal

  const btnShare = document.createElement('button');
  btnShare.className = 'btn-primary';
  btnShare.innerText = navigator.share ? 'Compartir' : 'Descargar';
  btnShare.style.flex = '1';
  btnShare.onclick = () => {
    document.body.removeChild(overlay); // Cerramos la modal
    
    // Procedemos a la ejecución nativa de compartir
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `intercambio_${nickAmigo}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: 'Ticket de Intercambio',
            text: `¡Hola @${nickAmigo}! 🔄 Mira nuestra propuesta de intercambio.\n\n🔴 Yo te doy: ${leDoyList.length} cromos.\n🟢 Tú me das: ${meDaList.length} cromos.\n\n¿Aceptas el trato? Completa tu álbum y gestiona tus intercambios aquí:\n${linkCompartir}`
          });
        } catch (error) {
          console.log("El usuario canceló el menú de compartir");
        }
      } else {
        const link = document.createElement('a'); 
        link.download = `intercambio_${nickAmigo}.png`; 
        link.href = dataUrl; 
        link.click();
      }
    }, 'image/png');
  };

  // Ensamblamos y mostramos la ventana modal
  btnContainer.appendChild(btnCancel);
  btnContainer.appendChild(btnShare);
  modal.appendChild(titulo);
  modal.appendChild(imgPreview);
  modal.appendChild(btnContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};

export const generarImagenLogro = async (perfilNickname, logro) => {
  const canvas = document.createElement('canvas');
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  
  // 1. Fondo Oscuro Premium
  ctx.fillStyle = '#0F172A'; 
  ctx.fillRect(0, 0, 1080, 1920);

  // Efecto de Iluminación Cinemática (Spotlight Radial)
  const spotlight = ctx.createRadialGradient(540, 845, 50, 540, 845, 700);
  spotlight.addColorStop(0, logro.color + '66'); // Foco de luz intenso en el centro
  spotlight.addColorStop(1, 'transparent'); // Se difumina hacia los bordes
  ctx.fillStyle = spotlight;
  ctx.fillRect(0, 0, 1080, 1920);

  // Efecto Bokeh (Partículas de luz desenfocadas de fondo)
  for (let i = 0; i < 40; i++) {
    ctx.beginPath();
    const bx = Math.random() * 1080;
    const by = Math.random() * 1920;
    const br = Math.random() * 25 + 5;
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    // Intercala el color de la medalla con un blanco semitransparente para dar profundidad
    ctx.fillStyle = Math.random() > 0.5 ? logro.color + '20' : '#FFFFFF10';
    ctx.fill();
  }

  // 2. Marca de agua
  ctx.save();
  ctx.translate(540, 960);
  ctx.rotate(-Math.PI / 4);
  ctx.font = '900 140px system-ui';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
  ctx.textAlign = 'center';
  ctx.fillText('STICKER TRACKER', 0, 0);
  ctx.fillText('MUNDIAL 2026', 0, 150);
  ctx.restore();

  const drawNeonRect = (x, y, w, h, color, glowColor) => {
    ctx.save();
    ctx.shadowBlur = 50;
    ctx.shadowColor = glowColor;
    ctx.strokeStyle = color;
    ctx.lineWidth = 8;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 50);
    else ctx.rect(x, y, w, h);
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.08;
    ctx.fill();
    ctx.restore();
  };

  // 3. Cabecera
  ctx.fillStyle = logro.color;
  ctx.font = '900 56px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('¡NUEVO LOGRO DESBLOQUEADO!', 540, 200);
  
  ctx.fillStyle = '#94A3B8';
  ctx.font = 'bold 36px system-ui';
  ctx.fillText(`@${perfilNickname} acaba de conseguir una medalla`, 540, 260);

  // 4. Caja Central (La Carta de Logro)
  drawNeonRect(140, 420, 800, 850, logro.color, logro.color);

  // Emoji/Icono Central
  ctx.font = '280px system-ui';
  ctx.fillText(logro.emoji || '🏆', 540, 780);

  // Título del logro
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '900 70px system-ui';
  ctx.fillText(logro.nombre.toUpperCase(), 540, 980);

  // Descripción del logro
  ctx.fillStyle = '#CBD5E1';
  ctx.font = '500 36px system-ui';
  ctx.fillText(logro.desc, 540, 1080);

  // 5. Footer con QR (incluyendo Referido)
  let perfilId = '';
  try {
    const guardado = localStorage.getItem('panini_perfil');
    if (guardado) {
      const perfilObj = JSON.parse(guardado);
      perfilId = perfilObj.id;
    }
  } catch (e) {}
  
  const baseUrl = 'https://sticker-tracker01.vercel.app/';
  const linkCompartir = (perfilId && !perfilId.startsWith('invitado_')) ? `${baseUrl}?ref=${perfilId}` : baseUrl;

  const loadQR = () => new Promise(res => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkCompartir)}&color=ffffff&bgcolor=0F172A`;
  });
  
  const qrImg = await loadQR();
  if (qrImg) {
    ctx.drawImage(qrImg, 440, 1450, 200, 200);
  }

  ctx.fillStyle = '#F8FAFC';
  ctx.font = '900 36px system-ui';
  ctx.fillText('¡Únete y completa tu álbum!', 540, 1720);

  // 6. Crear Vista Previa en DOM antes de compartir
  const dataUrl = canvas.toDataURL('image/png');
  
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.style.zIndex = '999999';

  const modal = document.createElement('div');
  modal.className = 'card modal-content';
  modal.style.display = 'flex';
  modal.style.flexDirection = 'column';
  modal.style.alignItems = 'center';
  modal.style.padding = '20px';
  modal.style.gap = '16px';
  modal.style.maxHeight = '90vh';
  modal.style.overflowY = 'auto';

  const titulo = document.createElement('h3');
  titulo.innerText = 'Presume de tu Logro';
  titulo.style.margin = '0';
  titulo.style.color = 'var(--text-primary)';
  titulo.style.fontSize = '18px';

  const imgPreview = document.createElement('img');
  imgPreview.src = dataUrl;
  imgPreview.style.width = '100%';
  imgPreview.style.maxWidth = '280px';
  imgPreview.style.borderRadius = '12px';
  imgPreview.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';

  const btnContainer = document.createElement('div');
  btnContainer.style.display = 'flex';
  btnContainer.style.gap = '10px';
  btnContainer.style.width = '100%';

  const btnCancel = document.createElement('button');
  btnCancel.className = 'btn-secondary';
  btnCancel.innerText = 'Cancelar';
  btnCancel.style.flex = '1';
  btnCancel.onclick = () => document.body.removeChild(overlay);

  const btnShare = document.createElement('button');
  btnShare.className = 'btn-primary';
  btnShare.innerText = navigator.share ? 'Compartir' : 'Descargar';
  btnShare.style.flex = '1';
  btnShare.onclick = () => {
    document.body.removeChild(overlay);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `logro_${logro.id}.png`, { type: 'image/png' });
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '¡Nuevo Logro!',
            text: `¡He conseguido la medalla "${logro.nombre}" en Sticker Tracker! 🏆\n\n¿Y tú cómo llevas el álbum? Únete aquí:\n${linkCompartir}`
          });
        } catch (error) {
          console.log("Menú compartir cancelado.");
        }
      } else {
        const link = document.createElement('a'); 
        link.download = `logro_${logro.id}.png`; 
        link.href = dataUrl; 
        link.click();
      }
    }, 'image/png');
  };

  btnContainer.appendChild(btnCancel);
  btnContainer.appendChild(btnShare);
  modal.appendChild(titulo);
  modal.appendChild(imgPreview);
  modal.appendChild(btnContainer);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
};