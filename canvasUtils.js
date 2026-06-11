export const generarImagenTrueque = (perfilNickname, nickAmigo, leDoyList, meDaList) => {
  const canvas = document.createElement('canvas');
  canvas.width = 700;
  canvas.height = 500;
  const ctx = canvas.getContext('2d');
  
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 700, 500);
  ctx.fillStyle = '#059669'; ctx.fillRect(0, 0, 700, 70);
  ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px system-ui';
  ctx.fillText(`Propuesta de Intercambio: @${perfilNickname} ↔ @${nickAmigo}`, 25, 42);
  
  ctx.fillStyle = '#1E293B'; ctx.font = 'bold 15px system-ui';
  ctx.fillText(`Lo que Yo le doy a @${nickAmigo} (${leDoyList.length}):`, 40, 110);
  ctx.fillText(`Lo que @${nickAmigo} me da a Mí (${meDaList.length}):`, 370, 110);
  
  ctx.font = '14px system-ui'; ctx.fillStyle = '#475569';
  let yYo = 140; leDoyList.slice(0, 15).forEach(c => { ctx.fillText(`• ${c}`, 40, yYo); yYo += 22; });
  if (leDoyList.length > 15) ctx.fillText(`... y ${leDoyList.length - 15} más`, 40, yYo);
  
  let yEl = 140; meDaList.slice(0, 15).forEach(c => { ctx.fillText(`• ${c}`, 370, yEl); yEl += 22; });
  if (meDaList.length > 15) ctx.fillText(`... y ${meDaList.length - 15} más`, 370, yEl);
  
  ctx.fillStyle = '#94A3B8'; ctx.font = 'italic 12px system-ui';
  ctx.fillText("Generado automáticamente por Gestor Panini 2026", 210, 475);
  
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    
    const file = new File([blob], `intercambio_${nickAmigo}.png`, { type: 'image/png' });
    
    // Comprobamos si el navegador (sobre todo en móviles) soporta compartir imágenes
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Propuesta de Intercambio',
          text: `¡Hola! Mira esta propuesta de intercambio de cromos.`
        });
      } catch (error) {
        console.log("El usuario canceló el menú de compartir");
      }
    } else {
      // Fallback: si es un PC sin soporte de compartir, la descargamos normal
      const link = document.createElement('a'); link.download = `intercambio_${nickAmigo}.png`; link.href = canvas.toDataURL('image/png'); link.click();
    }
  }, 'image/png');
};