export const SELECCIONES = [
  { id: 'FWC', nombre: 'FWC', total: 20 },
  { id: 'MEX', nombre: 'México', total: 20, flagCode: 'mx' },
  { id: 'RSA', nombre: 'Sudáfrica', total: 20, flagCode: 'za', alias: 'ZAF' },
  { id: 'KOR', nombre: 'Corea del Sur', total: 20, flagCode: 'kr' },
  { id: 'CZE', nombre: 'Rep. Checa', total: 20, flagCode: 'cz' },
  { id: 'CAN', nombre: 'Canadá', total: 20, flagCode: 'ca' },
  { id: 'BIH', nombre: 'Bosnia', total: 20, flagCode: 'ba' },
  { id: 'QAT', nombre: 'Catar', total: 20, flagCode: 'qa' },
  { id: 'SUI', nombre: 'Suiza', total: 20, flagCode: 'ch' },
  { id: 'BRA', nombre: 'Brasil', total: 20, flagCode: 'br' },
  { id: 'MAR', nombre: 'Marruecos', total: 20, flagCode: 'ma' },
  { id: 'HAI', nombre: 'Haití', total: 20, flagCode: 'ht' },
  { id: 'SCO', nombre: 'Escocia', total: 20, flagCode: 'gb-sct' },
  { id: 'USA', nombre: 'Estados Unidos', total: 20, flagCode: 'us' },
  { id: 'PAR', nombre: 'Paraguay', total: 20, flagCode: 'py' },
  { id: 'AUS', nombre: 'Australia', total: 20, flagCode: 'au' },
  { id: 'TUR', nombre: 'Turquía', total: 20, flagCode: 'tr' },
  { id: 'GER', nombre: 'Alemania', total: 20, flagCode: 'de' },
  { id: 'CUW', nombre: 'Curazao', total: 20, flagCode: 'cw' },
  { id: 'CIV', nombre: 'Costa de Marfil', total: 20, flagCode: 'ci' },
  { id: 'ECU', nombre: 'Ecuador', total: 20, flagCode: 'ec' },
  { id: 'NED', nombre: 'Países Bajos', total: 20, flagCode: 'nl' },
  { id: 'JPN', nombre: 'Japón', total: 20, flagCode: 'jp' },
  { id: 'SWE', nombre: 'Suecia', total: 20, flagCode: 'se' },
  { id: 'TUN', nombre: 'Túnez', total: 20, flagCode: 'tn' },
  { id: 'BEL', nombre: 'Bélgica', total: 20, flagCode: 'be' },
  { id: 'EGY', nombre: 'Egipto', total: 20, flagCode: 'eg' },
  { id: 'IRN', nombre: 'Irán', total: 20, flagCode: 'ir' },
  { id: 'NZL', nombre: 'Nueva Zelanda', total: 20, flagCode: 'nz' },
  { id: 'ESP', nombre: 'España', total: 20, flagCode: 'es' },
  { id: 'CPV', nombre: 'Cabo Verde', total: 20, flagCode: 'cv' },
  { id: 'KSA', nombre: 'Arabia Saudita', total: 20, flagCode: 'sa' },
  { id: 'URU', nombre: 'Uruguay', total: 20, flagCode: 'uy' },
  { id: 'FRA', nombre: 'Francia', total: 20, flagCode: 'fr' },
  { id: 'SEN', nombre: 'Senegal', total: 20, flagCode: 'sn' },
  { id: 'IRQ', nombre: 'Irak', total: 20, flagCode: 'iq' },
  { id: 'NOR', nombre: 'Noruega', total: 20, flagCode: 'no' },
  { id: 'ARG', nombre: 'Argentina', total: 20, flagCode: 'ar' },
  { id: 'ALG', nombre: 'Argelia', total: 20, flagCode: 'dz' },
  { id: 'AUT', nombre: 'Austria', total: 20, flagCode: 'at' },
  { id: 'JOR', nombre: 'Jordania', total: 20, flagCode: 'jo' },
  { id: 'POR', nombre: 'Portugal', total: 20, flagCode: 'pt' },
  { id: 'COD', nombre: 'Congo', total: 20, flagCode: 'cd' },
  { id: 'UZB', nombre: 'Uzbekistán', total: 20, flagCode: 'uz' },
  { id: 'COL', nombre: 'Colombia', total: 20, flagCode: 'co' },
  { id: 'ENG', nombre: 'Inglaterra', total: 20, flagCode: 'gb-eng' },
  { id: 'CRO', nombre: 'Croacia', total: 20, flagCode: 'hr' },
  { id: 'GHA', nombre: 'Ghana', total: 20, flagCode: 'gh' },
  { id: 'PAN', nombre: 'Panamá', total: 20, flagCode: 'pa' },
  { id: 'CC', nombre: 'Coca-Cola', total: 12, flagCode: 'cocacola' }
];

export const TOTAL_STICKERS = 992;
export const LOGO_URL = "https://media.base44.com/images/public/6a2595c43f4f5e19a4497bd1/5bd12f067_logo.png";

export const parsearTextoAStickers = (texto, tipo, baseStickers = {}) => {
  let copia = { ...baseStickers };
  if (tipo === 'faltantes') {
    SELECCIONES.forEach(sel => {
      for (let i = 0; i < sel.total; i++) {
        const codCromo = `${sel.id}_${i.toString().padStart(2, '0')}`;
        if (!copia[codCromo] || copia[codCromo] === 0) copia[codCromo] = 1;
      }
    });
  }

  const lineas = texto.split('\n');
  lineas.forEach(linea => {
    if (!linea.includes(':')) return;
    let [nombreFila, tokens] = linea.split(':');
    let idFila = nombreFila.trim().toUpperCase();
    if (idFila === 'ZAF' || idFila === 'RSA') idFila = 'RSA';

    const seleccionValida = SELECCIONES.find(s => s.id === idFila || s.alias === idFila);
    if (!seleccionValida) return;
   
    const idReal = seleccionValida.id;
    const items = tokens.split(',');

    items.forEach(item => {
      const limpio = item.trim();
      if (!limpio) return;

      let numerosAProcesar = [];
      if (limpio.includes('-')) {
        const partes = limpio.split('-');
        const inicio = parseInt(partes[0].trim(), 10);
        const fin = parseInt(partes[partes.length - 1].trim(), 10);
        if (!isNaN(inicio) && !isNaN(fin)) {
          for (let n = inicio; n <= fin; n++) numerosAProcesar.push({ num: n, repes: 1 });
        }
      } else {
        let numTexto = limpio;
        let cantidadRepetidos = 1;
        if (limpio.includes('x')) {
          const [n, c] = limpio.split('x');
          numTexto = n.trim();
          cantidadRepetidos = parseInt(c.trim(), 10) || 1;
        }
        const numeroVisual = parseInt(numTexto, 10);
        if (!isNaN(numeroVisual)) numerosAProcesar.push({ num: numeroVisual, repes: cantidadRepetidos });
      }

      numerosAProcesar.forEach(({ num, repes }) => {
        let numeroCodigo = num - 1;
        if (numeroCodigo < 0 || numeroCodigo >= seleccionValida.total) return;
        const codCromo = `${idReal}_${numeroCodigo.toString().padStart(2, '0')}`;
        if (tipo === 'faltantes') copia[codCromo] = 0;
        else if (tipo === 'repetidos') copia[codCromo] = 1 + repes;
      });
    });
  });
  return copia;
};