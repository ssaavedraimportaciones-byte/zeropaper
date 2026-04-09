'use client'

const pasos = [
  {
    numero: '01',
    icon: '🚀',
    titulo: 'Onboarding en 72 horas',
    descripcion:
      'Nuestro equipo de implementación configura la plataforma con las especificaciones de tu empresa. Conectamos tus sistemas actuales, importamos documentos existentes y capacitamos a tu equipo. Sin interrumpir tus operaciones.',
    detalles: [
      'Configuración personalizada',
      'Migración de documentos existentes',
      'Capacitación del equipo',
      'Soporte dedicado de implementación',
    ],
    color: '#0066FF',
    colorBg: 'rgba(0,102,255,0.08)',
    colorBorder: 'rgba(0,102,255,0.25)',
  },
  {
    numero: '02',
    icon: '⚙️',
    titulo: 'Digitaliza y automatiza',
    descripcion:
      'Digitaliza todos tus documentos y configura flujos de trabajo automáticos. Define quién aprueba qué, en qué orden y en cuánto tiempo. El sistema hace el seguimiento por ti y escala automáticamente si hay retrasos.',
    detalles: [
      'Digitalización masiva con IA',
      'Flujos de aprobación custom',
      'Notificaciones automáticas',
      'Escalamiento inteligente',
    ],
    color: '#00D4FF',
    colorBg: 'rgba(0,212,255,0.08)',
    colorBorder: 'rgba(0,212,255,0.25)',
  },
  {
    numero: '03',
    icon: '📈',
    titulo: 'Mide y optimiza',
    descripcion:
      'Dashboard ejecutivo en tiempo real. Ve cuánto estás ahorrando, qué procesos son más lentos, quién aprueba más documentos. Reportes automáticos para gerencia con KPIs claros y comparativas de mejora.',
    detalles: [
      'Dashboard ejecutivo en tiempo real',
      'Reportes automáticos para gerencia',
      'KPIs de eficiencia operativa',
      'Análisis de cuellos de botella',
    ],
    color: '#00E676',
    colorBg: 'rgba(0,230,118,0.08)',
    colorBorder: 'rgba(0,230,118,0.25)',
  },
]

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-20">
          <div className="section-label mx-auto w-fit">
            🗺️ ¿Cómo Funciona?
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            De cero a{' '}
            <span className="gradient-text">100% digital</span>
            {' '}en 3 pasos
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Un proceso probado con cientos de empresas. Sin fricciones, sin interrupciones, con resultados desde el primer mes.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {pasos.map((p, i) => (
            <div
              key={i}
              className={`glass rounded-2xl p-8 grid md:grid-cols-2 gap-8 items-center ${i % 2 === 1 ? 'md:[&>*:first-child]:order-2' : ''}`}
            >
              {/* Left / Info */}
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                    style={{ background: p.colorBg, border: `1px solid ${p.colorBorder}` }}
                  >
                    {p.icon}
                  </div>
                  <span
                    className="font-bold opacity-20"
                    style={{ fontFamily: 'Outfit, sans-serif', fontSize: '3rem', color: p.color, lineHeight: 1 }}
                  >
                    {p.numero}
                  </span>
                </div>
                <h3
                  className="font-bold text-white text-2xl mb-3"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {p.titulo}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">{p.descripcion}</p>
                <ul className="flex flex-col gap-2">
                  {p.detalles.map((d, j) => (
                    <li key={j} className="flex items-center gap-3 text-sm">
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: p.colorBg, border: `1px solid ${p.colorBorder}` }}
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={p.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                      <span className="text-gray-300">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right / Visual */}
              <div
                className="rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-52"
                style={{ background: p.colorBg, border: `1px solid ${p.colorBorder}` }}
              >
                <div style={{ fontSize: '5rem', lineHeight: 1, marginBottom: '16px' }}>{p.icon}</div>
                <div
                  className="font-bold text-5xl mb-2"
                  style={{ fontFamily: 'Outfit, sans-serif', color: p.color }}
                >
                  {p.numero}
                </div>
                <p className="font-semibold text-white">{p.titulo}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Timeline connector */}
        <div className="text-center mt-16">
          <div
            className="inline-flex items-center gap-4 rounded-2xl px-8 py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(0,102,255,0.08), rgba(0,230,118,0.05))',
              border: '1px solid rgba(0,102,255,0.2)',
            }}
          >
            <span className="text-3xl">⏱️</span>
            <div className="text-left">
              <p className="font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Implementación completa en menos de 72 horas
              </p>
              <p className="text-gray-400 text-sm">Sin interrumpir tus operaciones diarias</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
