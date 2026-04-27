'use client'

const integraciones = [
  { nombre: 'SAP', descripcion: 'ERP empresarial', emoji: '⬛', categoria: 'ERP' },
  { nombre: 'Oracle', descripcion: 'Base de datos y ERP', emoji: '🔴', categoria: 'ERP' },
  { nombre: 'Salesforce', descripcion: 'CRM líder', emoji: '☁️', categoria: 'CRM' },
  { nombre: 'Microsoft 365', descripcion: 'Suite de oficina', emoji: '📘', categoria: 'Productividad' },
  { nombre: 'Google Workspace', descripcion: 'Colaboración online', emoji: '🔵', categoria: 'Productividad' },
  { nombre: 'QuickBooks', descripcion: 'Contabilidad', emoji: '💚', categoria: 'Finanzas' },
  { nombre: 'Odoo', descripcion: 'ERP open source', emoji: '🟣', categoria: 'ERP' },
  { nombre: 'Dynamics 365', descripcion: 'Microsoft ERP/CRM', emoji: '🔷', categoria: 'ERP' },
  { nombre: 'HubSpot', descripcion: 'Marketing y ventas', emoji: '🟠', categoria: 'CRM' },
  { nombre: 'Slack', descripcion: 'Comunicación interna', emoji: '💬', categoria: 'Comunicación' },
  { nombre: 'Dropbox', descripcion: 'Almacenamiento cloud', emoji: '📦', categoria: 'Storage' },
  { nombre: 'API Custom', descripcion: 'Conecta cualquier sistema', emoji: '🔗', categoria: 'Custom' },
]

const categorias = ['Todos', 'ERP', 'CRM', 'Productividad', 'Finanzas', 'Comunicación', 'Storage', 'Custom']

export default function Integraciones() {
  return (
    <section id="integraciones" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label mx-auto w-fit">
            🔌 Integraciones
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Se conecta con{' '}
            <span className="gradient-text">tus sistemas actuales</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            ZeroPaper se integra nativamente con los sistemas más usados del mercado.
            Si tu sistema no está en la lista, nuestra API abierta te permite conectar cualquier plataforma.
          </p>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categorias.map((cat, i) => (
            <span
              key={i}
              className={`px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-all ${
                i === 0
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
              style={
                i !== 0
                  ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                  : {}
              }
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Integrations grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {integraciones.map((int, i) => (
            <div key={i} className="integration-logo flex-col gap-2">
              <div className="text-3xl">{int.emoji}</div>
              <div className="text-center">
                <p className="font-semibold text-white text-sm">{int.nombre}</p>
                <p className="text-gray-500 text-xs">{int.descripcion}</p>
              </div>
              <span
                className="badge badge-blue text-xs"
                style={{ fontSize: '0.65rem', padding: '3px 10px' }}
              >
                {int.categoria}
              </span>
            </div>
          ))}
        </div>

        {/* API callout */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <div className="text-4xl mb-4">🔗</div>
          <h3
            className="font-bold text-white text-xl mb-2"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            API REST documentada y abierta
          </h3>
          <p className="text-gray-400 max-w-xl mx-auto mb-6">
            ¿Tienes un sistema legacy o desarrollado a medida? Nuestra API REST con autenticación OAuth2
            te permite conectar cualquier plataforma en horas.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="badge badge-cyan">REST API</span>
            <span className="badge badge-blue">OAuth 2.0</span>
            <span className="badge badge-cyan">Webhooks</span>
            <span className="badge badge-blue">SDK disponible</span>
            <span className="badge badge-cyan">Documentación completa</span>
          </div>
        </div>
      </div>
    </section>
  )
}
