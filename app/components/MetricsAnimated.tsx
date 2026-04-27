'use client'

import { useEffect, useRef, useState } from 'react'

const metrics = [
  {
    icon: '💵',
    value: 15000,
    prefix: '$',
    suffix: 'K',
    label: 'Ahorrados en promedio',
    sublabel: 'por empresa al primer año',
    color: '#00E676',
  },
  {
    icon: '📄',
    value: 2,
    prefix: '',
    suffix: 'M+',
    label: 'Documentos gestionados',
    sublabel: 'en nuestra plataforma',
    color: '#0066FF',
  },
  {
    icon: '⏱️',
    value: 75,
    prefix: '',
    suffix: '%',
    label: 'Reducción de tiempo',
    sublabel: 'en procesos de aprobación',
    color: '#00D4FF',
  },
  {
    icon: '🌳',
    value: 12000,
    prefix: '',
    suffix: '+',
    label: 'Árboles equivalentes',
    sublabel: 'salvados por nuestros clientes',
    color: '#7C3AED',
  },
]

function Counter({
  value,
  prefix,
  suffix,
  color,
}: {
  value: number
  prefix: string
  suffix: string
  color: string
}) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2200
          const steps = 80
          const increment = value / steps
          let current = 0
          const timer = setInterval(() => {
            current += increment
            if (current >= value) {
              setCount(value)
              clearInterval(timer)
            } else {
              setCount(Math.floor(current))
            }
          }, duration / steps)
        }
      },
      { threshold: 0.2 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  const display =
    value >= 1000 && suffix !== 'K'
      ? count.toLocaleString('es-MX')
      : count.toString()

  return (
    <div ref={ref}>
      <span style={{ color, fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.5rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1 }}>
        {prefix}{display}{suffix}
      </span>
    </div>
  )
}

export default function MetricsAnimated() {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, transparent, rgba(0,102,255,0.04) 50%, transparent)',
        }}
      />

      <div className="relative max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="section-label mx-auto w-fit">
            📊 Nuestro Impacto
          </div>
          <h2
            className="font-bold text-white mb-4"
            style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)' }}
          >
            Resultados que{' '}
            <span className="gradient-text">hablan por sí solos</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Datos reales de empresas que ya transformaron su operación.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div
              key={i}
              className="rounded-2xl p-8 text-center flex flex-col items-center gap-4"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.06)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                style={{
                  background: `${m.color}14`,
                  border: `1px solid ${m.color}30`,
                }}
              >
                {m.icon}
              </div>
              <Counter value={m.value} prefix={m.prefix} suffix={m.suffix} color={m.color} />
              <div>
                <p className="text-white font-semibold text-sm mb-0.5">{m.label}</p>
                <p className="text-gray-500 text-xs">{m.sublabel}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div
          className="mt-12 rounded-2xl p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, rgba(0,102,255,0.08), rgba(0,212,255,0.05))',
            border: '1px solid rgba(0,102,255,0.2)',
          }}
        >
          <p className="text-lg text-gray-300 mb-2">
            <strong className="gradient-text text-xl">500+ empresas</strong> ya eliminaron el papel de su operación
          </p>
          <p className="text-gray-500 text-sm">
            Únete a la revolución digital empresarial — la implementación promedio toma menos de 72 horas.
          </p>
        </div>
      </div>
    </section>
  )
}
