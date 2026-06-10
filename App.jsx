import React, { useState, useEffect, useRef } from 'react';

import { base44 } from './base44';



// ==========================================

// 📋 CONFIGURACIÓN REAL PANINI (20 CROMOS POR PAÍS FIJOS)

// ==========================================

const SELECCIONES = [

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



const TOTAL_STICKERS = 992;

const LOGO_URL = "https://media.base44.com/images/public/6a2595c43f4f5e19a4497bd1/5bd12f067_logo.png";



export default function App() {

  const [seccionActual, setSeccionActual] = useState('intercambios');

  const [perfil, setPerfil] = useState(null);

  const [loading, setLoading] = useState(true);

 

  const [emailInput, setEmailInput] = useState('');

  const [nickInput, setNickInput] = useState('');

 

  const [textoFaltantes, setTextoFaltantes] = useState('');

  const [textoRepetidos, setTextoRepetidos] = useState('');



  const [seleccionExpandida, setSeleccionExpandida] = useState(null);

 

  // 👥 GESTIÓN DE AMIGOS DINÁMICOS

  const [comunidadUsuarios, setComunidadUsuarios] = useState([]); // Lista vacía al inicio

  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState(''); // Input para añadir

  const [busquedaAmigo, setBusquedaAmigo] = useState(''); // Input para filtrar

 

  // Estados de Edición de Cromos del Amigo

  const [editandoAmigoId, setEditandoAmigoId] = useState(null);

  const [amigoFaltantesInput, setAmigoFaltantesInput] = useState('');

  const [amigoRepetidosInput, setAmigoRepetidosInput] = useState('');

  const [exclusionesTrueque, setExclusionesTrueque] = useState({});



  const canvasRef = useRef(null);

  const [esMovil, setEsMovil] = useState(false);



  useEffect(() => {

    setLoading(false);

    const checkSize = () => setEsMovil(window.innerWidth < 600);

    checkSize();

    window.addEventListener('resize', checkSize);

    return () => window.removeEventListener('resize', checkSize);

  }, []);



  const handleLogin = async (e) => {

    e.preventDefault();

    if (!emailInput.trim() || !nickInput.trim()) return alert("Rellena todos los campos.");

    setPerfil({ id: 'dev_user', email: emailInput.trim().toLowerCase(), nickname: nickInput.trim().toLowerCase(), stickers: {} });

  };



  const alternarCromoManual = (codigo) => {

    const copia = { ...perfil.stickers };

    const valor = copia[codigo] !== undefined ? copia[codigo] : 0;

    copia[codigo] = valor === 0 ? 1 : valor === 1 ? 2 : valor < 11 ? valor + 1 : 0;

    setPerfil(prev => ({ ...prev, stickers: copia }));

  };



  // ➕ FUNCIÓN PARA AÑADIR UN NUEVO AMIGO A LA APLICACIÓN

  const añadirAmigoNuevo = (e) => {

    e.preventDefault();

    if (!nuevoAmigoNombre.trim()) return;

   

    const nombreLimpio = nuevoAmigoNombre.trim();

   

    // Evitar duplicados

    if (comunidadUsuarios.some(u => u.nickname.toLowerCase() === nombreLimpio.toLowerCase())) {

      return alert("Este amigo ya está en tu lista.");

    }



    const nuevoAmigo = {

      id: 'u_' + Date.now(),

      nickname: nombreLimpio,

      stickers: {},

      rawFaltantes: '',

      rawRepetidos: ''

    };



    setComunidadUsuarios(prev => [nuevoAmigo, ...prev]);

    setNuevoAmigoNombre('');

  };



  // 🗑️ FUNCIÓN PARA ELIMINAR UN AMIGO

  const eliminarAmigo = (idAmigo) => {

    if (!window.confirm("¿Seguro que quieres eliminar a este amigo de tu lista?")) return;

    setComunidadUsuarios(prev => prev.filter(u => u.id !== idAmigo));

  };



  const parsearTextoAStickers = (texto, tipo, baseStickers = {}) => {

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



  const procesarImportadorTexto = (texto, tipo) => {

    const nuevaCopia = parsearTextoAStickers(texto, tipo, perfil.stickers);

    setPerfil(prev => ({ ...prev, stickers: nuevaCopia }));

    alert(`¡Lista de ${tipo} procesada correctamente!`);

  };



  const guardarListasAmigo = (idAmigo) => {

    setComunidadUsuarios(prev => prev.map(u => {

      if (u.id === idAmigo) {

        let nuevosStickers = parsearTextoAStickers(amigoFaltantesInput, 'faltantes', {});

        nuevosStickers = parsearTextoAStickers(amigoRepetidosInput, 'repetidos', nuevosStickers);

        return { ...u, stickers: nuevosStickers, rawFaltantes: amigoFaltantesInput, rawRepetidos: amigoRepetidosInput };

      }

      return u;

    }));

    setEditandoAmigoId(null);

  };



  const alternarCromoEnTabla = (amigoId, codCromo) => {

    const llave = `${amigoId}_${codCromo}`;

    setExclusionesTrueque(prev => ({ ...prev, [llave]: !prev[llave] }));

  };



  const descargarImagenTrueque = (nickAmigo, leDoyList, meDaList) => {

    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, 700, 500);

    ctx.fillStyle = '#059669'; ctx.fillRect(0, 0, 700, 70);

    ctx.fillStyle = '#FFFFFF'; ctx.font = 'bold 20px system-ui';

    ctx.fillText(`Propuesta de Intercambio: @${perfil.nickname} ↔ @${nickAmigo}`, 25, 42);

    ctx.fillStyle = '#1E293B'; ctx.font = 'bold 15px system-ui';

    ctx.fillText(`🎁 Lo que Yo le doy a @${nickAmigo} (${leDoyList.length}):`, 40, 110);

    ctx.fillText(`📥 Lo que @${nickAmigo} me da a Mí (${meDaList.length}):`, 370, 110);

    ctx.font = '14px system-ui'; ctx.fillStyle = '#475569';

    let yYo = 140; leDoyList.slice(0, 15).forEach(c => { ctx.fillText(`• ${c}`, 40, yYo); yYo += 22; });

    if (leDoyList.length > 15) ctx.fillText(`... y ${leDoyList.length - 15} más`, 40, yYo);

    let yEl = 140; meDaList.slice(0, 15).forEach(c => { ctx.fillText(`• ${c}`, 370, yEl); yEl += 22; });

    if (meDaList.length > 15) ctx.fillText(`... y ${meDaList.length - 15} más`, 370, yEl);

    ctx.fillStyle = '#94A3B8'; ctx.font = 'italic 12px system-ui';

    ctx.fillText("Generado automáticamente por Gestor Panini 2026", 210, 475);

    const link = document.createElement('a'); link.download = `intercambio_${nickAmigo}.png`; link.href = canvas.toDataURL('image/png'); link.click();

  };



  // Contadores Propios

  let tienesCount = 0; let repetidasCount = 0; let faltanCount = 0;

  SELECCIONES.forEach(sel => {

    for (let i = 0; i < sel.total; i++) {

      const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;

      const v = perfil?.stickers?.[cod] || 0;

      if (v === 0) faltanCount++;

      else if (v === 1) tienesCount++;

      else if (v >= 2) { tienesCount++; repetidasCount += (v - 1); }

    }

  });

  const pctGlobal = Math.round((tienesCount / TOTAL_STICKERS) * 100) || 0;



  const renderDigitalFlag = (sel) => {

    if (sel.id === 'FWC') return <span style={{ fontSize: '18px' }}>🏆</span>;

    if (sel.id === 'CC') return <span style={{ fontSize: '18px' }}>🥤</span>;

    return <img src={`https://flagcdn.com/w40/${sel.flagCode}.png`} alt="" style={{ width: '22px', height: '14px', borderRadius: '3px', objectFit: 'cover' }} />;

  };



  if (!perfil) {

    return (

      <div style={{ minHeight: '100vh', background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, sans-serif', padding: '16px' }}>

        <form onSubmit={handleLogin} style={{ background: '#FFF', padding: '30px 24px', borderRadius: '24px', width: '100%', maxWidth: '360px', boxSizing: 'border-box' }}>

          <img src={LOGO_URL} alt="Logo" style={{ width: '56px', height: '56px', margin: '0 auto 12px auto', display: 'block' }} />

          <h2 style={{ margin: '0 0 4px 0', color: '#111827', fontSize: '22px', fontWeight: 'bold', textAlign: 'center' }}>Mundial 2026</h2>

          <div style={{ marginBottom: '14px' }}>

            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Email</label>

            <input type="email" required value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />

          </div>

          <div style={{ marginBottom: '20px' }}>

            <label style={{ fontSize: '12px', fontWeight: '600', display: 'block', marginBottom: '6px' }}>Nickname</label>

            <input type="text" required value={nickInput} onChange={(e) => setNickInput(e.target.value)} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: '1px solid #D1D5DB', boxSizing: 'border-box' }} />

          </div>

          <button type="submit" style={{ width: '100%', background: '#10B981', color: '#FFF', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}>Iniciar Aplicación</button>

        </form>

      </div>

    );

  }



  // Filtrado de la lista según la barra de búsqueda superior

  const amigosFiltrados = comunidadUsuarios.filter(u => u.nickname.toLowerCase().includes(busquedaAmigo.toLowerCase()));



  return (

    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', color: '#1E293B', paddingBottom: '90px', boxSizing: 'border-box' }}>

      <canvas ref={canvasRef} width="700" height="500" style={{ display: 'none' }} />



      {/* HEADER */}

      <div style={{ background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)', padding: '14px 20px', color: '#FFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <div>

          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>Mundial 2026</h1>

          <span style={{ opacity: 0.85, fontSize: '11px' }}>Gestor Cromos</span>

        </div>

        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '99px', fontSize: '12px' }}>@{perfil.nickname}</div>

      </div>



      {/* CONTADORES */}

      <div style={{ maxWidth: '768px', margin: '10px auto', padding: '0 12px' }}>

        <div style={{ background: '#FFF', borderRadius: '16px', padding: '14px', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', flex: 1, textAlign: 'center' }}>

            <div><div style={{ fontSize: '18px', fontWeight: '800', color: '#059669' }}>{tienesCount}</div><div style={{ fontSize: '11px', color: '#64748B' }}>Tengo</div></div>

            <div><div style={{ fontSize: '18px', fontWeight: '800', color: '#D97706' }}>{repetidasCount}</div><div style={{ fontSize: '11px', color: '#64748B' }}>Repes</div></div>

            <div><div style={{ fontSize: '18px', fontWeight: '800', color: '#E11D48' }}>{faltanCount}</div><div style={{ fontSize: '11px', color: '#64748B' }}>Faltan</div></div>

          </div>

          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#10B981' }}>{pctGlobal}%</div>

        </div>

      </div>



      {/* SECCIONES */}

      <div style={{ maxWidth: '768px', margin: '0 auto', padding: '0 12px' }}>

       

        {/* 📋 SECCIÓN ÁLBUM */}

        {seccionActual === 'album' && (

          <div style={{ background: '#FFF', borderRadius: '16px', padding: '12px', border: '1px solid #E2E8F0' }}>

            {SELECCIONES.map(sel => {

              let tEnFila = 0;

              for (let i = 0; i < sel.total; i++) {

                if ((perfil.stickers?.[`${sel.id}_${i.toString().padStart(2, '0')}`] || 0) >= 1) tEnFila++;

              }



              return (

                <div key={sel.id} style={{ borderBottom: '1px solid #F1F5F9', padding: '10px 0' }}>

                  <div onClick={() => setSeleccionExpandida(seleccionExpandida === sel.id ? null : sel.id)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>

                      {renderDigitalFlag(sel)}

                      <span style={{ fontWeight: '700', fontSize: '13px', width: '40px' }}>{sel.id}</span>

                      <span style={{ fontSize: '13px' }}>

                        {sel.nombre} <span style={{ color: '#94A3B8', fontSize: '11px' }}>({tEnFila}/{sel.total})</span>

                      </span>

                    </div>

                    <span style={{ color: '#94A3B8', fontSize: '10px' }}>{seleccionExpandida === sel.id ? '▲' : '▼'}</span>

                  </div>



                  {seleccionExpandida === sel.id && (

                    <div style={{ display: 'grid', gridTemplateColumns: esMovil ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: '6px', marginTop: '10px', background: '#F8FAFC', padding: '8px', borderRadius: '12px' }}>

                      {Array.from({ length: sel.total }).map((_, index) => {

                        const numeroVisual = index + 1;

                        const codigo = `${sel.id}_${index.toString().padStart(2, '0')}`;

                        const estado = perfil.stickers?.[codigo] || 0;

                       

                        let bg = estado === 1 ? '#10B981' : estado >= 2 ? '#F59E0B' : '#EF4444';

                        let txt = numeroVisual === 1 ? '🛡️ Escudo' : `${sel.id} ${numeroVisual}`;

                        if (estado >= 2) txt += ` (x${estado - 1})`;



                        return (

                          <button key={codigo} onClick={() => alternarCromoManual(codigo)} style={{ background: bg, color: '#FFF', border: 'none', padding: '8px 2px', borderRadius: '6px', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', minHeight: '36px' }}>

                            {txt}

                          </button>

                        );

                      })}

                    </div>

                  )}

                </div>

              );

            })}

          </div>

        )}



        {/* 📤 SECCIÓN IMPORTAR */}

        {seccionActual === 'importar' && (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>

              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>🚫 Pegar Lista de Faltantes</h3>

              <textarea value={textoFaltantes} onChange={(e) => setTextoFaltantes(e.target.value)} placeholder="ESP: 1, 2, 5..." style={{ width: '100%', height: '90px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }} />

              <button onClick={() => { procesarImportadorTexto(textoFaltantes, 'faltantes'); setTextoFaltantes(''); }} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✓ Calcular Álbum Completo</button>

            </div>



            <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>

              <h3 style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#F59E0B' }}>🔄 Actualizar Lista de Repetidos</h3>

              <textarea value={textoRepetidos} onChange={(e) => setTextoRepetidos(e.target.value)} placeholder="MEX: 3x2, ESP: 12..." style={{ width: '100%', height: '90px', borderRadius: '8px', border: '1px solid #CBD5E1', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }} />

              <button onClick={() => { procesarImportadorTexto(textoRepetidos, 'repetidos'); setTextoRepetidos(''); }} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✓ Actualizar repetidos</button>

            </div>

          </div>

        )}



        {/* 🔄 SECCIÓN INTERCAMBIOS */}

        {seccionActual === 'intercambios' && (

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

           

            {/* 🛠️ 1. FORMULARIO COMPLETO PARA BUSCAR Y AÑADIR AMIGOS (IGUAL A TU CAPTURA) */}

            <div style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>

              <label style={{ fontSize: '14px', fontWeight: '700', display: 'block', marginBottom: '8px' }}>🔍 Buscar usuario por apodo</label>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>

                <input type="text" value={busquedaAmigo} onChange={(e) => setBusquedaAmigo(e.target.value)} placeholder="Apodo del amigo..." style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0' }} />

                <button style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '10px 14px', borderRadius: '10px', cursor: 'pointer' }}>🔍</button>

              </div>



              <form onSubmit={añadirAmigoNuevo} style={{ borderTop: '1px solid #F1F5F9', paddingTop: '14px', display: 'flex', gap: '8px' }}>

                <input type="text" value={nuevoAmigoNombre} onChange={(e) => setNuevoAmigoNombre(e.target.value)} placeholder="Nombre del amigo..." style={{ flex: 1, padding: '10px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '14px' }} />

                <button type="submit" style={{ background: '#6EE7B7', color: '#0F766E', border: 'none', padding: '10px 16px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>

                  ➕ Añadir

                </button>

              </form>

            </div>



            {/* Fichas de amigos agregados */}

            {amigosFiltrados.length === 0 ? (

              <div style={{ background: '#FFF', borderRadius: '16px', padding: '24px', textAlign: 'center', color: '#94A3B8', border: '1px solid #E2E8F0', fontSize: '14px' }}>

                No tienes amigos en la lista. Escribe un nombre arriba para añadirlo.

              </div>

            ) : (

              amigosFiltrados.map(amigo => {

                let fCount = 0; let tCount = 0; let rCount = 0;

                SELECCIONES.forEach(s => {

                  for (let i = 0; i < s.total; i++) {

                    const status = amigo.stickers?.[`${s.id}_${i.toString().padStart(2, '0')}`] || 0;

                    if (status === 0) fCount++;

                    else if (status === 1) tCount++;

                    else if (status >= 2) { tCount++; rCount += (status - 1); }

                  }

                });



                const candidatosLeDoy = []; const candidatosElMeDa = [];

                SELECCIONES.forEach(sel => {

                  for (let i = 0; i < sel.total; i++) {

                    const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;

                    const miEstado = perfil?.stickers?.[cod] || 0;

                    const amigoEstado = amigo.stickers?.[cod] || 0;

                    const tag = i === 0 ? `${sel.id} Escudo` : `${sel.id} ${i + 1}`;



                    if (miEstado >= 2 && amigoEstado === 0) candidatosLeDoy.push({ cod, tag });

                    if (amigoEstado >= 2 && miEstado === 0) candidatosElMeDa.push({ cod, tag });

                  }

                });



                const realesLeDoy = candidatosLeDoy.filter(c => !exclusionesTrueque[`${amigo.id}_${c.cod}`]);

                const realesElMeDa = candidatosElMeDa.filter(c => !exclusionesTrueque[`${amigo.id}_${c.cod}`]);



                return (

                  <div key={amigo.id} style={{ background: '#FFF', borderRadius: '16px', padding: '16px', border: '1px solid #E2E8F0' }}>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>

                        <div style={{ width: '32px', height: '32px', background: '#E0F2FE', color: '#0369A1', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{amigo.nickname.charAt(0).toUpperCase()}</div>

                        <span style={{ fontWeight: '700', fontSize: '16px' }}>{amigo.nickname}</span>

                      </div>

                      <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '11px', padding: '4px 10px', borderRadius: '99px' }}>{realesLeDoy.length > 0 || realesElMeDa.length > 0 ? 'Intercambio Listo' : 'Pocos en común'}</span>

                    </div>



                    {editandoAmigoId === amigo.id ? (

                      <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>

                        <div style={{ marginBottom: '12px' }}>

                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#EF4444', display: 'block', marginBottom: '4px' }}>🔴 Cromos que le faltan a {amigo.nickname}</label>

                          <textarea value={amigoFaltantesInput} onChange={(e) => setAmigoFaltantesInput(e.target.value)} placeholder="Ej: FWC: 1-2, 5" style={{ width: '100%', height: '80px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '10px', boxSizing: 'border-box' }} />

                        </div>

                        <div style={{ marginBottom: '16px' }}>

                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#F59E0B', display: 'block', marginBottom: '4px' }}>🟡 Cromos repetidos de {amigo.nickname}</label>

                          <textarea value={amigoRepetidosInput} onChange={(e) => setAmigoRepetidosInput(e.target.value)} placeholder="Ej: MEX: 3x2" style={{ width: '100%', height: '80px', borderRadius: '10px', border: '1px solid #CBD5E1', padding: '10px', boxSizing: 'border-box' }} />

                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>

                          <button onClick={() => guardarListasAmigo(amigo.id)} style={{ background: '#059669', color: '#FFF', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✓ Guardar</button>

                          <button onClick={() => setEditandoAmigoId(null)} style={{ background: '#FFF', color: '#64748B', border: '1px solid #CBD5E1', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>✕ Cancelar</button>

                        </div>

                      </div>

                    ) : (

                      <div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center', marginBottom: '14px' }}>

                          <div style={{ background: '#ECFDF5', borderRadius: '8px', padding: '6px' }}><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#059669' }}>{tCount}</div><div style={{ fontSize: '10px', color: '#059669' }}>Tiene</div></div>

                          <div style={{ background: '#FEF2F2', borderRadius: '8px', padding: '6px' }}><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#EF4444' }}>{fCount}</div><div style={{ fontSize: '10px', color: '#EF4444' }}>Le faltan</div></div>

                          <div style={{ background: '#FFFBEB', borderRadius: '8px', padding: '6px' }}><div style={{ fontSize: '14px', fontWeight: 'bold', color: '#D97706' }}>{rCount}</div><div style={{ fontSize: '10px', color: '#D97706' }}>Repetidos</div></div>

                        </div>



                        <div style={{ border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '14px' }}>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: '#F8FAFC', padding: '10px', fontWeight: 'bold', fontSize: '12px', borderBottom: '1px solid #E2E8F0', textAlign: 'center' }}>

                            <div style={{ color: '#059669' }}>🎁 Yo le doy ({realesLeDoy.length})</div>

                            <div style={{ color: '#D97706' }}>📥 Me da ({realesElMeDa.length})</div>

                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '80px', maxHeight: '180px', overflowY: 'auto' }}>

                            <div style={{ borderRight: '1px solid #E2E8F0', padding: '6px', background: '#FFF' }}>

                              {candidatosLeDoy.length === 0 ? <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>Ninguno</div> :

                                candidatosLeDoy.map(c => {

                                  const desmarcado = exclusionesTrueque[`${amigo.id}_${c.cod}`];

                                  return (

                                    <div key={c.cod} onClick={() => alternarCromoEnTabla(amigo.id, c.cod)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px', borderRadius: '6px', cursor: 'pointer', background: desmarcado ? '#F1F5F9' : '#EF4444', color: desmarcado ? '#94A3B8' : '#FFF', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', textDecoration: desmarcado ? 'line-through' : 'none' }}>

                                      {desmarcado ? '❌' : '✓'} {c.tag}

                                    </div>

                                  );

                                })

                              }

                            </div>

                            <div style={{ padding: '6px', background: '#FFF' }}>

                              {candidatosElMeDa.length === 0 ? <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', padding: '10px' }}>Ninguno</div> :

                                candidatosElMeDa.map(c => {

                                  const desmarcado = exclusionesTrueque[`${amigo.id}_${c.cod}`];

                                  return (

                                    <div key={c.cod} onClick={() => alternarCromoEnTabla(amigo.id, c.cod)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px', borderRadius: '6px', cursor: 'pointer', background: desmarcado ? '#F1F5F9' : '#F59E0B', color: desmarcado ? '#94A3B8' : '#FFF', fontSize: '11px', fontWeight: 'bold', marginBottom: '4px', textDecoration: desmarcado ? 'line-through' : 'none' }}>

                                      {desmarcado ? '❌' : '➡️'} {c.tag}

                                    </div>

                                  );

                                })

                              }

                            </div>

                          </div>

                        </div>



                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>

                          <button onClick={() => { setEditandoAmigoId(amigo.id); setAmigoFaltantesInput(amigo.rawFaltantes || ''); setAmigoRepetidosInput(amigo.rawRepetidos || ''); }} style={{ background: '#FFF', border: '1px solid #CBD5E1', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>✍️ Sus cromos</button>

                          <button onClick={() => descargarImagenTrueque(amigo.nickname, realesLeDoy.map(x=>x.tag), realesElMeDa.map(x=>x.tag))} style={{ background: '#10B981', color: '#FFF', border: 'none', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>🖼️ Generar imagen</button>

                          <button onClick={() => eliminarAmigo(amigo.id)} style={{ background: '#FFF', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>🗑️ Eliminar</button>

                        </div>

                      </div>

                    )}

                  </div>

                );

              })

            )}

          </div>

        )}



      </div>



      {/* FOOTER NAV GENERAL */}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#FFF', borderTop: '1px solid #E2E8F0', padding: '10px 0', display: 'flex', justifyContent: 'space-around', zIndex: 1000 }}>

        <button onClick={() => setSeccionActual('album')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: seccionActual === 'album' ? '#10B981' : '#64748B', cursor: 'pointer' }}><span style={{ fontSize: '16px' }}>📋</span><span style={{ fontSize: '10px' }}>Mi álbum</span></button>

        <button onClick={() => setSeccionActual('importar')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: seccionActual === 'importar' ? '#10B981' : '#64748B', cursor: 'pointer' }}><span style={{ fontSize: '16px' }}>📤</span><span style={{ fontSize: '10px' }}>Importar</span></button>

        <button onClick={() => setSeccionActual('intercambios')} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', color: seccionActual === 'intercambios' ? '#10B981' : '#64748B', cursor: 'pointer' }}><span style={{ fontSize: '16px' }}>🔄</span><span style={{ fontSize: '10px' }}>Intercambios</span></button>

      </div>



    </div>

  );

}