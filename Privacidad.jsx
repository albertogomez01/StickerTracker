import React from 'react';

export default function Privacidad() {
  return (
    <div style={{ lineHeight: '1.6', fontSize: '14px', color: 'var(--text-primary)' }}>
      <h1 style={{ color: 'var(--accent-primary)', fontSize: '22px', marginTop: 0 }}>POLÍTICA DE PRIVACIDAD</h1>
      <p><strong>Última actualización: 13 de junio de 2026</strong></p>
      <p>El presente Documento establece los términos en que <strong>[TU NOMBRE O PROYECTO]</strong> (en adelante, "el Titular") trata y protege la información que es proporcionada por los usuarios al utilizar la Aplicación Web Progresiva (PWA) <strong>Sticker Tracker Mundial 2026</strong> (en adelante, "la Aplicación").</p>
      <p>Esta Aplicación está comprometida con la seguridad de los datos de sus usuarios de acuerdo con el Reglamento General de Protección de Datos (RGPD) de la Unión Europea y demás normativas aplicables.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>1. INFORMACIÓN QUE SE RECOPILA</h3>
      <p>Nuestra Aplicación recopila y almacena la siguiente información con el único fin de prestar el servicio técnico de gestión e intercambio de coleccionables:</p>
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li><strong>Datos de Autenticación:</strong> Al iniciar sesión a través del proveedor de identidad de Google (Google Auth), recopilamos su nombre, dirección de correo electrónico y fotografía de perfil pública.</li>
        <li><strong>Datos de la Aplicación:</strong> Las listas de cromos/figuritas marcadas por el usuario (adquiridos, faltantes y repetidos).</li>
        <li><strong>Datos de Interacción:</strong> Identificadores internos del dispositivo en caso de activar las Notificaciones Push (Firebase Cloud Messaging).</li>
      </ul>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>2. FINALIDAD DEL TRATAMIENTO DE LOS DATOS</h3>
      <p>La Aplicación utiliza la información recopilada con las siguientes finalidades específicas:</p>
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li>Autenticar al usuario de forma segura en la plataforma.</li>
        <li>Almacenar y sincronizar sus listas de control en la base de datos en la nube (Firebase).</li>
        <li>Operar el "Motor de Intercambios" y el "Mercado Público Global", permitiendo cruzar de forma automatizada sus datos de cromos con otros usuarios para sugerir intercambios compatibles.</li>
        <li>Enviar notificaciones push del servicio (solicitudes de intercambio recibidas).</li>
      </ul>
      <p>Los datos no serán utilizados para elaborar perfiles automatizados comerciales ni se venderán a terceras empresas bajo ningún concepto.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>3. TRANSFERENCIAS DE DATOS Y PROVEEDORES DE SERVICIOS</h3>
      <p>La infraestructura técnica de la Aplicación depende de subencargados de tratamiento que cumplen con rigurosos estándares de seguridad internacional:</p>
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li><strong>Google Firebase / Vercel:</strong> Proveedores del alojamiento web, autenticación y la base de datos en tiempo real. Los datos se almacenan en servidores seguros y bajo sus respectivas políticas de privacidad globales.</li>
        <li><strong>Google AdSense:</strong> Proveedor publicitario que utiliza cookies y herramientas de seguimiento para mostrar anuncios, sujetos al consentimiento explícito previo del usuario en la Unión Europea.</li>
      </ul>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>4. DERECHOS DEL USUARIO (ARCO)</h3>
      <p>Como usuario, usted mantiene el control absoluto sobre sus datos. En cualquier momento puede ejercer sus derechos de acceso, rectificación, cancelación, oposición o supresión de sus datos personales. Para eliminar de forma inmediata y definitiva su cuenta y todo su historial de cromos de nuestra base de datos, puede hacerlo enviando una solicitud por escrito adjuntando copia de su documento de identidad al correo electrónico de contacto: <strong>[TU_CORREO@EMAIL.COM]</strong>.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>5. ENLACES A TERCEROS</h3>
      <p>Esta Aplicación puede contener enlaces comerciales a sitios de terceros (como Amazon o eBay) mediante programas de afiliación. Una vez que usted haga clic en estos enlaces y abandone nuestra plataforma, ya no tenemos control sobre el sitio al que es redirigido y, por lo tanto, no somos responsables de los términos o privacidad de esos otros sitios.</p>
    </div>
  );
}