'use client'

const costos = [
  {
    icon: '🖨️',
    categoria: 'Impresión y consumibles',
    monto: '$4,200',
    desc: 'Tóner, papel, mantenimiento de impresoras por 100 empleados/año',
    pct: 28,
  },
  {
    icon: '🗄️',
    categoria: 'Almacenamiento físico',
    monto: '$3,800',
    desc: 'Archiveros, bodegas, cajas, material de organización',
    pct: 25,
  },
  {
    icon: '🕐',
    categoria: 'Tiempo productivo perdido',
    monto: '$4,500',
    desc: 'Búsqueda, archivo, firma y traslado manual de documentos',
    pct: 30,
  },
  {
    icon: '🚚',
    categoria: 'Logística y mensajería',
    monto: '$1,500',
    desc: 'Envíos de documentos físicos, courier y traslados internos',
    pct: 10,
  },
  {
    icon: '⚠️',
    categoria: 'Errores y reprocesos',
    monto: '$1,000',
    desc: 'Documentos perdidos, versiones incorrectas, correcciones',
    pct: 7,
  },
]

export default function ProblemaSection() {
  return (
    <section id="problema" className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-label mx-auto w-fit">
            💸 El Problema
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            El papel le cuesta a tu empresa{' '}
            <span className="gradient-text">mucho más</span>{' '}
            de lo que crees
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            En promedio, una empresa con 100 empleados gasta más de{' '}
            <strong className="text-red-400">$15,000 USD al año</strong> solo en gestión de documentos en papel.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left — cost breakdown */}
          <div className="flex flex-col gap-4">
            {costos.map((c, i) => (
              <div
                key={i}
                className="glass p-5 flex gap-4 items-start"
                style={{ transition: 'all 0.3s ease' }}
              >
                <div
                  className="text-2xl w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-white text-sm">{c.categoria}</span>
                    <span className="text-red-400 font-bold text-sm ml-2">{c.monto}</span>
                  </div>
                  <p className="text-gray-500 text-xs mb-2">{c.desc}</p>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)' }}>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${c.pct}%`,
                        background: 'linear-gradient(90deg, #EF4444, #F87171)',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right — CTA card */}
          <div className="sticky top-28">
            <div
              className="rounded-2xl p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(239,68,68,0.08) 0%, rgba(239,68,68,0.03) 100%)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              <div className="text-5xl mb-4">💸</div>
              <div
                className="font-bold mb-2"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: '3.5rem',
                  color: '#F87171',
                  lineHeight: 1,
                }}
              >
                $15,000
              </div>
              <p className="text-gray-400 mb-2">USD / año por 100 empleados</p>
              <p className="text-gray-500 text-sm mb-8">
                Y eso sin contar el costo ambiental ni el riesgo de perder información crítica.
              </p>

              <div className="h-px mb-8" style={{ background: 'rgba(239,68,68,0.2)' }} />

              <div
                className="rounded-2xl p-6 mb-6"
                style={{ background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.2)' }}
              >
                <div className="text-3xl mb-1">🌿</div>
                <div
                  className="font-bold text-green-400 text-3xl mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Con Sin Papel: $0
                </div>
                <p className="text-gray-400 text-sm">
                  Elimina el 100% de esos costos operativos
                </p>
              </div>

              <a href="#demo" className="btn-primary w-full justify-center">
                Calcular mi ahorro
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
