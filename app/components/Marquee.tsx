'use client'

const beneficios = [
  '✦ Ahorra hasta 80% en costos documentales',
  '⚡ Aprobaciones 300% más rápidas',
  '🔒 Certificación ISO 27001',
  '🌿 Cero papel, impacto ambiental nulo',
  '📱 Acceso desde cualquier dispositivo',
  '🔄 Sincronización en tiempo real',
  '✍️ Firma electrónica con validez legal',
  '☁️ Almacenamiento ilimitado en la nube',
  '📊 Reportes automáticos y auditorías',
  '🤝 Integración con SAP, Oracle, Salesforce',
]

const integraciones = [
  '⬛ SAP',
  '🔵 Oracle',
  '☁️ Salesforce',
  '📘 Microsoft 365',
  '🔴 Google Workspace',
  '💰 QuickBooks',
  '📦 Odoo',
  '🔷 Dynamics 365',
  '🟠 HubSpot',
  '🟢 Monday.com',
]

function MarqueeTrack({
  items,
  direction = 'left',
}: {
  items: string[]
  direction?: 'left' | 'right'
}) {
  const doubled = [...items, ...items]
  const animClass = direction === 'left' ? 'marquee-track-left' : 'marquee-track-right'

  return (
    <div className="overflow-hidden w-full">
      <div className={`marquee-track ${animClass}`}>
        {doubled.map((item, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center gap-3 px-6 py-3 mx-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              whiteSpace: 'nowrap',
            }}
          >
            <span className="text-gray-300 text-sm font-medium">{item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MarqueeSection() {
  return (
    <section className="py-10" style={{ background: 'rgba(0,0,0,0.2)' }}>
      <div className="flex flex-col gap-4">
        <MarqueeTrack items={beneficios} direction="left" />
        <MarqueeTrack items={integraciones} direction="right" />
      </div>
    </section>
  )
}
