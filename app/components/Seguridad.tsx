'use client'

const certificaciones = [
  {
    icon: '🛡️',
    titulo: 'ISO 27001',
    descripcion: 'Certificación internacional en gestión de seguridad de la información',
    color: '#00E676',
  },
  {
    icon: '🔐',
    titulo: 'Cifrado AES-256',
    descripcion: 'El mismo estándar de cifrado que usan los bancos y gobiernos del mundo',
    color: '#0066FF',
  },
  {
    icon: '🇪🇺',
    titulo: 'GDPR Compliant',
    descripcion: 'Cumplimiento total con el Reglamento General de Protección de Datos europeo',
    color: '#00D4FF',
  },
  {
    icon: '✅',
    titulo: 'SOC 2 Type II',
    descripcion: 'Auditoría independiente de controles de seguridad, disponibilidad y confidencialidad',
    color: '#7C3AED',
  },
  {
    icon: '✍️',
    titulo: 'Firma Electrónica Legal',
    descripcion: 'Validez jurídica certificada bajo normativas locales e internacionales',
    color: '#00E676',
  },
  {
    icon: '☁️',
    titulo: 'Backup Automático',
    descripcion: 'Copias de seguridad automáticas cada hora con retención de 10 años',
    color: '#0066FF',
  },
]

const garantias = [
  { valor: '99.9%', label: 'Uptime garantizado', icon: '⚡' },
  { valor: '< 1s', label: 'Tiempo de respuesta', icon: '🚀' },
  { valor: '10 años', label: 'Retención de datos', icon: '🗄️' },
  { valor: '24/7', label: 'Soporte técnico', icon: '🎯' },
]

export default function Seguridad() {
  return (
    <section id="seguridad" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label mx-auto w-fit">
            🔒 Seguridad
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Tu información,{' '}
            <span className="gradient-text">blindada</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            La seguridad no es una característica adicional — es la base sobre la que construimos todo.
            Cumplimos con los estándares más exigentes del mundo.
          </p>
        </div>

        {/* Certifications grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {certificaciones.map((cert, i) => (
            <div key={i} className="security-badge">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{
                  background: `${cert.color}14`,
                  border: `1px solid ${cert.color}30`,
                }}
              >
                {cert.icon}
              </div>
              <div>
                <p className="font-bold text-white text-sm mb-0.5">{cert.titulo}</p>
                <p className="text-gray-500 text-xs leading-snug">{cert.descripcion}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Guarantees row */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.06), rgba(0,212,255,0.04))',
            border: '1px solid rgba(0,102,255,0.2)',
          }}
        >
          <h3
            className="font-bold text-white text-center mb-8 text-xl"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            Garantías de nivel enterprise
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {garantias.map((g, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-2">{g.icon}</div>
                <div
                  className="font-bold gradient-text text-2xl mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {g.valor}
                </div>
                <p className="text-gray-400 text-sm">{g.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Trust statement */}
        <div className="text-center mt-10">
          <p className="text-gray-500 text-sm max-w-2xl mx-auto">
            ZeroPaper almacena y procesa datos en centros de datos certificados ISO 27001 en múltiples regiones.
            Nunca vendemos ni compartimos tu información con terceros.
          </p>
        </div>
      </div>
    </section>
  )
}
