'use client'

const pilares = [
  {
    icon: '💰',
    color: '#00E676',
    colorBg: 'rgba(0,230,118,0.08)',
    colorBorder: 'rgba(0,230,118,0.2)',
    numero: '01',
    titulo: 'Ahorro de Costos Drástico',
    subtitulo: 'Elimina el gasto en papel de raíz',
    descripcion:
      'Transforma costos fijos en ahorro inmediato. Sin impresoras, sin almacenamiento físico, sin mensajería. Tu CFO lo va a amar.',
    stats: [
      { label: 'Reducción en costos operativos', valor: '80%' },
      { label: 'ROI en el primer año', valor: '340%' },
    ],
    features: ['Cero papel de impresión', 'Eliminación de archiveros', 'Sin costos de mensajería'],
  },
  {
    icon: '⚡',
    color: '#0066FF',
    colorBg: 'rgba(0,102,255,0.08)',
    colorBorder: 'rgba(0,102,255,0.25)',
    numero: '02',
    titulo: 'Automatización y Velocidad',
    subtitulo: '300% más rápido que los procesos manuales',
    descripcion:
      'Los flujos de aprobación que antes tardaban días, ahora se resuelven en minutos. Notificaciones automáticas, escalamiento inteligente.',
    stats: [
      { label: 'Reducción en tiempo de procesos', valor: '75%' },
      { label: 'Documentos procesados por mes', valor: '10K+' },
    ],
    features: ['Flujos de aprobación automáticos', 'Notificaciones en tiempo real', 'Firma electrónica en 1 clic'],
  },
  {
    icon: '🔒',
    color: '#00D4FF',
    colorBg: 'rgba(0,212,255,0.08)',
    colorBorder: 'rgba(0,212,255,0.2)',
    numero: '03',
    titulo: 'Seguridad y Compliance',
    subtitulo: 'Cumplimiento normativo garantizado',
    descripcion:
      'Auditoría completa de cada acción, cifrado de extremo a extremo, backups automáticos. Cumple con GDPR, ISO 27001 y normativas locales.',
    stats: [
      { label: 'Documentos perdidos', valor: '0' },
      { label: 'Uptime garantizado', valor: '99.9%' },
    ],
    features: ['Cifrado AES-256', 'Auditoría completa', 'Backups automáticos diarios'],
  },
  {
    icon: '🔌',
    color: '#7C3AED',
    colorBg: 'rgba(124,58,237,0.08)',
    colorBorder: 'rgba(124,58,237,0.25)',
    numero: '04',
    titulo: 'Integración Sin Fricciones',
    subtitulo: 'Compatible con tus sistemas actuales',
    descripcion:
      'Se conecta con SAP, Oracle, Salesforce, Microsoft 365 y más. API abierta para integraciones custom. Sin migración traumática.',
    stats: [
      { label: 'Sistemas compatibles', valor: '50+' },
      { label: 'Implementación', valor: '< 72h' },
    ],
    features: ['API REST abierta', 'Conectores nativos SAP/Oracle', 'Sin interrupción operativa'],
  },
]

export default function CuatroPilares() {
  return (
    <section id="caracteristicas" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label mx-auto w-fit">
            ✦ Los 4 Pilares
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Todo lo que tu empresa necesita,{' '}
            <span className="gradient-text">en una sola plataforma</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Cuatro capacidades clave diseñadas para generar impacto real en la operación y rentabilidad de tu empresa.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6" id="beneficios">
          {pilares.map((p, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-8 flex flex-col gap-6 group"
              style={{ transition: 'all 0.3s ease' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                  style={{ background: p.colorBg, border: `1px solid ${p.colorBorder}` }}
                >
                  {p.icon}
                </div>
                <span
                  className="font-bold text-5xl opacity-10"
                  style={{ fontFamily: 'Outfit, sans-serif', color: p.color }}
                >
                  {p.numero}
                </span>
              </div>

              {/* Title */}
              <div>
                <h3
                  className="font-bold text-white text-xl mb-1"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  {p.titulo}
                </h3>
                <p className="text-sm font-medium" style={{ color: p.color }}>{p.subtitulo}</p>
              </div>

              {/* Description */}
              <p className="text-gray-400 text-sm leading-relaxed">{p.descripcion}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                {p.stats.map((s, j) => (
                  <div
                    key={j}
                    className="rounded-xl p-4 text-center"
                    style={{ background: p.colorBg, border: `1px solid ${p.colorBorder}` }}
                  >
                    <div
                      className="font-bold text-2xl mb-0.5"
                      style={{ fontFamily: 'Outfit, sans-serif', color: p.color }}
                    >
                      {s.valor}
                    </div>
                    <div className="text-gray-500 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Features list */}
              <ul className="flex flex-col gap-2">
                {p.features.map((f, j) => (
                  <li key={j} className="flex items-center gap-2 text-sm text-gray-400">
                    <span style={{ color: p.color, fontSize: '0.7rem' }}>●</span>
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA link */}
              <a
                href="#demo"
                className="text-sm font-semibold flex items-center gap-1 mt-auto"
                style={{ color: p.color }}
              >
                Conocer más
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
