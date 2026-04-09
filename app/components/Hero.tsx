'use client'

import { useEffect, useRef, useState } from 'react'

const stats = [
  { value: 80, suffix: '%', label: 'Reducción de costos' },
  { value: 300, suffix: '%', label: 'Mayor velocidad' },
  { value: 0, suffix: '', label: 'Documentos perdidos' },
  { value: 500, suffix: '+', label: 'Empresas confían en nosotros' },
]

function AnimatedCounter({ value, suffix }: { value: number; suffix: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true
          const duration = 2000
          const steps = 60
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
      { threshold: 0.1 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  )
}

export default function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col justify-center pt-24 pb-16 overflow-hidden"
    >
      {/* Background orbs */}
      <div className="orb" style={{ width: 600, height: 600, background: '#0066FF', top: '-200px', left: '-100px' }} />
      <div className="orb" style={{ width: 400, height: 400, background: '#00D4FF', bottom: '-100px', right: '-50px', opacity: 0.1 }} />
      <div className="orb" style={{ width: 300, height: 300, background: '#7C3AED', top: '40%', right: '10%', opacity: 0.08 }} />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(0,102,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(0,102,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        {/* Label chip */}
        <div className="section-label mx-auto w-fit mb-8">
          <span style={{ color: '#00D4FF' }}>✦</span>
          Plataforma de Gestión Documental Empresarial
        </div>

        {/* Main headline */}
        <h1
          className="font-bold leading-none mb-6"
          style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 'clamp(2.5rem, 7vw, 5.5rem)',
            letterSpacing: '-0.02em',
          }}
        >
          El Futuro de tu Empresa
          <br />
          <span className="gradient-text">No Tiene Papel.</span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-gray-400 mx-auto mb-10 leading-relaxed"
          style={{ maxWidth: 680, fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}
        >
          Transforma tu organización con gestión documental{' '}
          <strong className="text-white">100% digital</strong>. Reduce costos, automatiza
          procesos, cumple normativas — todo desde una sola plataforma.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          <a href="#demo" className="btn-primary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
            Solicitar Demo Gratuita
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a href="#beneficios" className="btn-secondary" style={{ padding: '16px 36px', fontSize: '1.05rem' }}>
            Ver beneficios
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </a>
        </div>

        {/* Stats bar */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div
                className="font-bold mb-1 gradient-text"
                style={{
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 'clamp(2rem, 4vw, 2.8rem)',
                  lineHeight: 1,
                }}
              >
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </div>
              <div className="text-gray-400 text-sm font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="mt-16 flex flex-col items-center gap-2 text-gray-600 text-xs">
          <span>Desplázate para conocer más</span>
          <div
            className="w-6 h-10 rounded-full border-2 border-gray-700 flex items-start justify-center pt-2"
          >
            <div
              className="w-1 h-2 rounded-full bg-blue-500"
              style={{ animation: 'bounce 2s infinite' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
