'use client'

import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { label: 'Beneficios', href: '#beneficios' },
    { label: 'Características', href: '#caracteristicas' },
    { label: 'Integraciones', href: '#integraciones' },
    { label: 'Seguridad', href: '#seguridad' },
    { label: 'Testimonios', href: '#testimonios' },
  ]

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(5, 11, 31, 0.95)'
          : 'rgba(5, 11, 31, 0.5)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled
          ? '1px solid rgba(0, 102, 255, 0.15)'
          : '1px solid transparent',
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
            style={{
              background: 'linear-gradient(135deg, #0066FF, #00D4FF)',
              boxShadow: '0 4px 20px rgba(0,102,255,0.4)',
            }}
          >
            SP
          </div>
          <span
            className="text-xl font-bold font-outfit"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            <span className="gradient-text-blue">Sin</span>{' '}
            <span className="text-white">Papel</span>
          </span>
        </div>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href="#demo" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            Conocer más
          </a>
          <a href="#demo" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            Solicitar Demo
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Mobile menu btn */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="md:hidden px-6 pb-6 pt-2"
          style={{ background: 'rgba(5, 11, 31, 0.98)' }}
        >
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-gray-300 hover:text-white py-2 border-b border-white/5"
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </a>
            ))}
            <a href="#demo" className="btn-primary mt-4 justify-center">
              Solicitar Demo
            </a>
          </div>
        </div>
      )}
    </nav>
  )
}
