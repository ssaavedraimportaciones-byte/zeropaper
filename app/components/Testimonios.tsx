'use client'

const testimonios = [
  {
    quote:
      'Implementamos Sin Papel en toda nuestra red de 12 sucursales en menos de una semana. El ahorro en el primer trimestre fue de $47,000 USD. La gerencia quedó impresionada con los reportes automáticos.',
    nombre: 'Carlos Mendoza',
    cargo: 'Director de Operaciones',
    empresa: 'Grupo Financiero Noreste',
    avatar: 'CM',
    rating: 5,
    color: '#0066FF',
    ahorroTag: '$47,000 USD / trimestre',
  },
  {
    quote:
      'El proceso de aprobación de facturas que tardaba 3 días ahora se completa en 20 minutos. Nuestra directora financiera considera Sin Papel como la mejor inversión tecnológica del año.',
    nombre: 'Ana Lucía Romero',
    cargo: 'Gerente de Finanzas',
    empresa: 'Constructora Torres & Asociados',
    avatar: 'AR',
    rating: 5,
    color: '#00D4FF',
    ahorroTag: '20 min vs 3 días',
  },
  {
    quote:
      'La integración con SAP fue transparente. En 48 horas ya teníamos todos los flujos de compras digitalizados. El equipo de soporte es excepcional — siempre disponibles y resuelven todo.',
    nombre: 'Roberto Fuentes',
    cargo: 'CTO',
    empresa: 'Industrias Manufacturas del Pacífico',
    avatar: 'RF',
    rating: 5,
    color: '#00E676',
    ahorroTag: '48h implementación',
  },
  {
    quote:
      'Pasamos de manejar 2,000 documentos físicos al mes a cero papel en 6 semanas. La huella de carbono de nuestra operación se redujo significativamente, algo que nuestros clientes valoran mucho.',
    nombre: 'María Elena Vázquez',
    cargo: 'Directora General',
    empresa: 'Logística Verde SA',
    avatar: 'MV',
    rating: 5,
    color: '#7C3AED',
    ahorroTag: 'Cero papel en 6 semanas',
  },
  {
    quote:
      'Nuestro departamento legal estaba escéptico al inicio — hoy son los más entusiastas. La firma electrónica tiene validez jurídica plena y la trazabilidad de los contratos es impecable.',
    nombre: 'Alejandro Ríos',
    cargo: 'Director Legal',
    empresa: 'Corporativo Ríos & Partners',
    avatar: 'AR',
    rating: 5,
    color: '#0066FF',
    ahorroTag: 'Validez legal garantizada',
  },
  {
    quote:
      'Somos una empresa de 800 empleados y temíamos que la migración fuera traumática. Sin Papel lo hizo increíblemente simple. Hoy no concebimos trabajar de otra manera.',
    nombre: 'Patricia Salinas',
    cargo: 'Vicepresidenta de RRHH',
    empresa: 'Corporación Alianza Global',
    avatar: 'PS',
    rating: 5,
    color: '#00D4FF',
    ahorroTag: '800 empleados adoptaron en semanas',
  },
]

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: count }).map((_, i) => (
        <span key={i} style={{ color: '#FFD700', fontSize: '14px' }}>★</span>
      ))}
    </div>
  )
}

export default function Testimonios() {
  return (
    <section id="testimonios" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label mx-auto w-fit">
            💬 Testimonios
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Lo que dicen los{' '}
            <span className="gradient-text">líderes empresariales</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Directores, gerentes y líderes de operaciones que ya transformaron su empresa con Sin Papel.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonios.map((t, i) => (
            <div key={i} className="testimonial-card flex flex-col justify-between gap-6">
              {/* Stars + tag */}
              <div className="flex items-start justify-between">
                <Stars count={t.rating} />
                <span
                  className="text-xs font-semibold px-3 py-1 rounded-full"
                  style={{
                    background: `${t.color}14`,
                    color: t.color,
                    border: `1px solid ${t.color}30`,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {t.ahorroTag}
                </span>
              </div>

              {/* Quote */}
              <div>
                <div className="text-3xl mb-3" style={{ color: t.color, opacity: 0.6 }}>"</div>
                <p className="text-gray-300 text-sm leading-relaxed italic">
                  {t.quote}
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{
                    background: `${t.color}20`,
                    color: t.color,
                    border: `2px solid ${t.color}40`,
                  }}
                >
                  {t.avatar}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm truncate">{t.nombre}</p>
                  <p className="text-gray-500 text-xs truncate">
                    {t.cargo} · {t.empresa}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom trust */}
        <div className="text-center mt-14 flex flex-col items-center gap-3">
          <div className="flex">
            {['CM', 'AR', 'RF', 'MV', 'PS'].map((initials, i) => (
              <div
                key={i}
                className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold -ml-2 first:ml-0 border-2"
                style={{
                  background: 'rgba(0,102,255,0.15)',
                  color: '#00D4FF',
                  borderColor: 'rgba(5, 11, 31, 1)',
                }}
              >
                {initials}
              </div>
            ))}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold -ml-2 border-2"
              style={{
                background: 'rgba(0,102,255,0.3)',
                color: '#fff',
                borderColor: 'rgba(5, 11, 31, 1)',
              }}
            >
              +495
            </div>
          </div>
          <p className="text-gray-400 text-sm">
            Más de <strong className="text-white">500 líderes empresariales</strong> ya confían en Sin Papel
          </p>
        </div>
      </div>
    </section>
  )
}
