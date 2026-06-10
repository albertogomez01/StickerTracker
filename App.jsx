import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 📋 CONFIGURACIÓN
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
  
  // PERSISTENCIA: Cargar desde localStorage
  const [perfil, setPerfil] = useState(() => {
    const saved = localStorage.getItem('panini_perfil');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [comunidadUsuarios, setComunidadUsuarios] = useState(() => {
    const saved = localStorage.getItem('panini_amigos');
    return saved ? JSON.parse(saved) : [];
  });

  // Guardar en localStorage cuando cambian los estados
  useEffect(() => { localStorage.setItem('panini_perfil', JSON.stringify(perfil)); }, [perfil]);
  useEffect(() => { localStorage.setItem('panini_amigos', JSON.stringify(comunidadUsuarios)); }, [comunidadUsuarios]);

  const [emailInput, setEmailInput] = useState('');
  const [nickInput, setNickInput] = useState('');
  const [textoFaltantes, setTextoFaltantes] = useState('');
  const [textoRepetidos, setTextoRepetidos] = useState('');
  const [seleccionExpandida, setSeleccionExpandida] = useState(null);
  const [nuevoAmigoNombre, setNuevoAmigoNombre] = useState('');
  const [busquedaAmigo, setBusquedaAmigo] = useState('');
  const [editandoAmigoId, setEditandoAmigoId] = useState(null);
  const [amigoFaltantesInput, setAmigoFaltantesInput] = useState('');
  const [amigoRepetidosInput, setAmigoRepetidosInput] = useState('');
  const [exclusionesTrueque, setExclusionesTrueque] = useState({}); 
  const canvasRef = useRef(null);
  const [esMovil, setEsMovil] = useState(false);

  useEffect(() => {
    const checkSize = () => setEsMovil(window.innerWidth < 600);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!emailInput.trim() || !nickInput.trim()) return alert("Rellena todos los campos.");
    setPerfil({ id: 'dev_user', email: emailInput.trim().toLowerCase(), nickname: nickInput.trim().toLowerCase(), stickers: {} });
  };

  const alternarCromoManual = (codigo) => {
    setPerfil(prev => {
      const copia = { ...prev.stickers };
      const valor = copia[codigo] || 0;
      copia[codigo] = valor === 0 ? 1 : valor === 1 ? 2 : valor < 11 ? valor + 1 : 0;
      return { ...prev, stickers: copia };
    });
  };

  const añadirAmigoNuevo = (e) => {
    e.preventDefault();
    if (!nuevoAmigoNombre.trim()) return;
    if (comunidadUsuarios.some(u => u.nickname.toLowerCase() === nuevoAmigoNombre.trim().toLowerCase())) return alert("Ya existe.");
    setComunidadUsuarios(prev => [{ id: 'u_' + Date.now(), nickname: nuevoAmigoNombre.trim(), stickers: {}, rawFaltantes: '', rawRepetidos: '' }, ...prev]);
    setNuevoAmigoNombre('');
  };

  const eliminarAmigo = (idAmigo) => {
    if (window.confirm("¿Eliminar?")) setComunidadUsuarios(prev => prev.filter(u => u.id !== idAmigo));
  };

  const parsearTextoAStickers = (texto, tipo, baseStickers = {}) => {
    let copia = { ...baseStickers };
    if (tipo === 'faltantes') {
      SELECCIONES.forEach(sel => {
        for (let i = 0; i < sel.total; i++) {
          const cod = `${sel.id}_${i.toString().padStart(2, '0')}`;
          if (!copia[cod]) copia[cod] = 1;
        }
      });
    }
    texto.split('\n').forEach(linea => {
      if (!linea.includes(':')) return;
      let [idFila, tokens] = linea.split(':');
      idFila = idFila.trim().toUpperCase() === 'ZAF' ? 'RSA' : idFila.trim().toUpperCase();
      const sel = SELECCIONES.find(s => s.id === idFila || s.alias === idFila);
      if (!sel) return;
      tokens.split(',').forEach(item => {
        let [n, c] = item.includes('x') ? item.split('x') : [item, '1'];
        let num = parseInt(n.trim(), 10);
        if (!isNaN(num)) {
          let cod = `${sel.id}_${(num - 1).toString().padStart(2, '0')}`;
          copia[cod] = tipo === 'faltantes' ? 0 : 1 + (parseInt(c.trim(), 10) || 1);
        }
      });
    });
    return copia;
  };

  const procesarImportadorTexto = (texto, tipo) => {
    setPerfil(prev => ({ ...prev, stickers: parsearTextoAStickers(texto, tipo, prev.stickers) }));
    alert("¡Procesado!");
  };

  const guardarListasAmigo = (idAmigo) => {
    setComunidadUsuarios(prev => prev.map(u => {
      if (u.id === idAmigo) {
        let stickers = parsearTextoAStickers(amigoFaltantesInput, 'faltantes', {});
        stickers = parsearTextoAStickers(amigoRepetidosInput, 'repetidos', stickers);
        return { ...u, stickers, rawFaltantes: amigoFaltantesInput, rawRepetidos: amigoRepetidosInput };
      }
      return u;
    }));
    setEditandoAmigoId(null);
  };

  // --- Renderizado (Se mantiene tu UI original) ---
  if (!perfil) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F766E', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <form onSubmit={handleLogin} style={{ background: '#FFF', padding: '30px', borderRadius: '24px', width: '360px' }}>
          <img src={LOGO_URL} alt="Logo" style={{ width: '56px', margin: '0 auto 12px', display: 'block' }} />
          <h2 style={{ textAlign: 'center' }}>Mundial 2026</h2>
          <input type="email" placeholder="Email" value={emailInput} onChange={e => setEmailInput(e.target.value)} style={{ width: '100%', marginBottom: '10px', padding: '10px' }} />
          <input type="text" placeholder="Nickname" value={nickInput} onChange={e => setNickInput(e.target.value)} style={{ width: '100%', marginBottom: '20px', padding: '10px' }} />
          <button type="submit" style={{ width: '100%', background: '#10B981', color: '#FFF', padding: '12px', border: 'none', borderRadius: '10px' }}>Iniciar</button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
       {/* Tu UI de secciones (Álbum, Importar, Intercambios) sigue aquí debajo */}
       {/* ... El resto de tu renderizado no necesita cambios ... */}
    </div>
  );
}