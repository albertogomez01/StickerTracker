import React from 'react';

export default function Terminos() {
  return (
    <div className="card" style={{ lineHeight: '1.6', fontSize: '14px', color: 'var(--text-primary)' }}>
      <h1 style={{ color: 'var(--accent-primary)', fontSize: '22px', marginTop: 0 }}>TÉRMINOS Y CONDICIONES DE USO</h1>
      <p><strong>Última actualización: 13 de junio de 2026</strong></p>
      <p>El acceso y el uso de la Aplicación Web Progresiva (PWA) <strong>Sticker Tracker Mundial 2026</strong> (en adelante, "la Aplicación") atribuyen la condición de usuario a quien lo haga, e implican la aceptación plena y sin reservas de todas y cada una de las disposiciones incluidas en este documento.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>1. OBJETO Y DESCRIPCIÓN DEL SERVICIO</h3>
      <p>La Aplicación proporciona una herramienta digital independiente orientada a coleccionistas de cromos deportivos con fines puramente organizativos, recreativos y de entretenimiento personal. Sus funcionalidades principales consisten en el control digital del inventario personal de cromos del usuario, el cruce de datos técnico para calcular compatibilidades de intercambio y la publicación opcional de listas en un Mercado Público para facilitar el contacto entre usuarios.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>2. EXCLUSIÓN DE RESPONSABILIDAD (DESCARGO DE RESPONSABILIDAD DE MARCAS)</h3>
      <div style={{ padding: '12px', borderRadius: '12px', background: 'var(--bg-input)', border: '1px solid var(--border-primary)', fontSize: '13px', lineHeight: '1.5', margin: '12px 0' }}>
        <p style={{ margin: 0 }}>
          Esta aplicación es un proyecto independiente <strong>creado por un fan y para fans</strong>. No posee ninguna afiliación, patrocinio, ni respaldo oficial por parte de Panini S.p.A., la FIFA, o cualquier otra entidad titular de los derechos. Las marcas y nombres mencionados se utilizan con fines puramente informativos y de identificación, bajo el principio de uso legítimo (fair use).
        </p>
      </div>
      <p><strong>AVISO IMPORTANTE:</strong> Esta Aplicación es una plataforma completamente independiente, desarrollada por y para fans. No está afiliada, autorizada, patrocinada, asociada comercialmente, avalada ni vinculada de ninguna manera oficial con la Fédération Internationale de Football Association (FIFA), con la empresa Panini S.p.A., con sus filiales directas ni con ninguna otra entidad licenciataria oficial del torneo de fútbol del año 2026.</p>
      <p>Todas las marcas registradas, nombres de selecciones, nombres de futbolistas, diseños de colecciones y derechos de propiedad intelectual mencionados o utilizados en la interfaz pertenecen legítimamente a sus respectivos titulares. El uso de referencias numéricas o descriptivas se realiza exclusivamente bajo el amparo de la doctrina de uso legítimo (<em>fair use</em>) y con carácter puramente informativo.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>3. CONDICIONES DE USO Y EXCLUSIÓN DE RESPONSABILIDAD CIVIL</h3>
      <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <li><strong>Gratuidad:</strong> El acceso a las funcionalidades básicas de organización de la Aplicación es de carácter gratuito.</li>
        <li><strong>Responsabilidad de los Intercambios:</strong> La Aplicación se limita estrictamente a actuar como un canal técnico que calcula la compatibilidad informática de las colecciones ("matches"). El Titular no interviene, media, ni gestiona transacciones económicas, envíos postales ni encuentros físicos entre coleccionistas. El Titular excluye toda responsabilidad por cualquier daño, perjuicio, pérdida o fraude derivado de los pactos privados, tratos o intercambios físicos que los usuarios acuerden libremente fuera del ámbito digital de la plataforma.</li>
      </ul>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>4. POLÍTICA DE MONETIZACIÓN Y ANUNCIOS</h3>
      <p>La Aplicación utiliza el servicio publicitario de Google AdSense y enlaces de afiliación comercial para costear el mantenimiento de los servidores en la nube. Los usuarios se comprometen a respetar los espacios publicitarios integrados y a no emplear técnicas maliciosas dirigidas a alterar fraudulentamente las impresiones o clics de dichos bloques de anuncios.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>5. MODIFICACIONES DE LOS TÉRMINOS</h3>
      <p>El Titular se reserva el derecho de modificar, suspender o actualizar las condiciones del servicio de la Aplicación en cualquier momento sin previo aviso para adaptarse a cambios legislativos o modificaciones en las funciones de la plataforma. El uso continuado de la app tras cualquier cambio constituye la aceptación formal de las nuevas condiciones.</p>

      <h3 style={{ color: 'var(--accent-primary)', fontSize: '16px', marginTop: '20px' }}>6. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h3>
      <p>Para la resolución de todas las disputas o cuestiones relacionadas con el uso de esta Aplicación, se aplicará la legislación de tu país de residencia, sometiéndose a los juzgados y tribunales competentes.</p>
    </div>
  );
}