'use client'

const links = {
  Producto: ['Características', 'Integraciones', 'Seguridad', 'Precios', 'Actualizaciones'],
  Empresa: ['Sobre nosotros', 'Blog', 'Casos de éxito', 'Prensa', 'Carreras'],
  Soporte: ['Centro de ayuda', 'Documentación API', 'Estado del sistema', 'Comunidad', 'Contacto'],
  Legal: ['Términos de servicio', 'Política de privacidad', 'Cookies', 'GDPR', 'Seguridad'],
}

export default function Footer() {
  return (
    <footer
      className="pt-20 pb-10 px-6"
      style={{
        background: 'rgba(2, 7, 20, 0.8)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{
                  background: 'linear-gradient(135deg, #0066FF, #00D4FF)',
                  boxShadow: '0 4px 20px rgba(0,102,255,0.3)',
                }}
              >
                SP
              </div>
              <span className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <span className="gradient-text-blue">Sin</span>{' '}
                <span className="text-white">Papel</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
              La plataforma de gestión documental que transforma empresas. Elimina el papel,
              automatiza procesos y escala tu operación sin límites.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              {['in', 'tw', 'fb', 'yt'].map((s, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:text-white text-sm font-bold transition-colors"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <p
                className="font-semibold text-white text-sm mb-4"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {group}
              </p>
              <ul className="flex flex-col gap-2.5">
                {items.map((item, i) => (
                  <li key={i}>
                    <a
                      href="#"
                      className="text-gray-500 text-sm hover:text-gray-300 transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div
          className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-gray-600 text-xs">
            © {new Date().getFullYear()} Sin Papel. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" style={{ animation: 'pulse 2s infinite' }} />
              <span className="text-gray-600 text-xs">Todos los sistemas operativos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-600 text-xs">Hecho con</span>
              <span className="text-red-500 text-xs">♥</span>
              <span className="text-gray-600 text-xs">para transformar empresas</span>
            </div>
          </div>
        </div>

        {/* Certifications row */}
        <div className="mt-8 flex flex-wrap justify-center gap-4 opacity-40">
          {['ISO 27001', 'SOC 2', 'GDPR', 'AES-256', 'Firma Electrónica Legal'].map((cert, i) => (
            <span
              key={i}
              className="text-xs text-gray-500 px-3 py-1 rounded-full"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {cert}
            </span>
          ))}
        </div>
      </div>
    </footer>
  )
}
