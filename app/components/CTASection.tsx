'use client'

import { useState } from 'react'

export default function CTASection() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    empleados: '',
    mensaje: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <section id="demo" className="py-24 px-6 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="orb" style={{ width: 500, height: 500, background: '#0066FF', top: '-100px', right: '-100px', opacity: 0.12 }} />
        <div className="orb" style={{ width: 400, height: 400, background: '#00D4FF', bottom: '-50px', left: '-50px', opacity: 0.08 }} />
      </div>

      <div className="relative max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — copy */}
          <div>
            <div className="section-label mb-8">
              🚀 Solicitar Demo
            </div>
            <h2
              className="font-bold text-white mb-6"
              style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', lineHeight: 1.1 }}
            >
              Empieza a ahorrar{' '}
              <span className="gradient-text">desde el primer mes</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8 leading-relaxed">
              Agenda una demo personalizada para tu empresa. En 30 minutos te mostramos cómo Sin Papel
              se adapta a tu operación y cuánto puedes ahorrar.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              {[
                { icon: '✅', text: 'Demo completamente gratuita y sin compromisos' },
                { icon: '⚡', text: 'Propuesta personalizada para tu empresa en 24h' },
                { icon: '🚀', text: 'Implementación en menos de 72 horas' },
                { icon: '🔒', text: 'Prueba gratis de 30 días con soporte dedicado' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>

            {/* Urgency band */}
            <div
              className="rounded-xl p-4 flex items-center gap-3"
              style={{
                background: 'rgba(0,230,118,0.06)',
                border: '1px solid rgba(0,230,118,0.2)',
              }}
            >
              <span className="text-xl">🎁</span>
              <p className="text-sm text-gray-300">
                <strong className="text-green-400">Oferta especial:</strong> Las empresas que soliciten demo
                esta semana reciben 3 meses adicionales gratis en su plan anual.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div
            className="rounded-2xl p-8"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {submitted ? (
              <div className="text-center py-10">
                <div className="text-6xl mb-4">🎉</div>
                <h3
                  className="font-bold text-white text-2xl mb-3"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  ¡Solicitud recibida!
                </h3>
                <p className="text-gray-400 mb-6">
                  Un especialista de Sin Papel se pondrá en contacto contigo en las próximas 2 horas hábiles
                  para agendar tu demo personalizada.
                </p>
                <div className="badge badge-green mx-auto w-fit">
                  ✓ Confirmación enviada a tu correo
                </div>
              </div>
            ) : (
              <>
                <h3
                  className="font-bold text-white text-xl mb-6"
                  style={{ fontFamily: 'Outfit, sans-serif' }}
                >
                  Solicita tu demo gratuita
                </h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Nombre completo *</label>
                      <input
                        required
                        type="text"
                        value={form.nombre}
                        onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                        placeholder="Tu nombre"
                        className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Empresa *</label>
                      <input
                        required
                        type="text"
                        value={form.empresa}
                        onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                        placeholder="Nombre de tu empresa"
                        className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Correo empresarial *</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="tu@empresa.com"
                      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">Teléfono</label>
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        placeholder="+52 55 0000 0000"
                        className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none focus:border-blue-500 transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-xs mb-1 block">N° de empleados</label>
                      <select
                        value={form.empleados}
                        onChange={(e) => setForm({ ...form, empleados: e.target.value })}
                        className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: form.empleados ? 'white' : '#4B5563',
                        }}
                      >
                        <option value="" disabled>Selecciona</option>
                        <option value="1-50">1–50</option>
                        <option value="51-200">51–200</option>
                        <option value="201-500">201–500</option>
                        <option value="500+">500+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">¿Cómo podemos ayudarte?</label>
                    <textarea
                      rows={3}
                      value={form.mensaje}
                      onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                      placeholder="Cuéntanos sobre tus procesos actuales y principales desafíos..."
                      className="w-full rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 outline-none resize-none focus:border-blue-500 transition-colors"
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  </div>

                  <button type="submit" className="btn-primary w-full justify-center mt-2" style={{ padding: '16px' }}>
                    Solicitar Demo Gratuita
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>

                  <p className="text-center text-gray-600 text-xs">
                    Sin tarjeta de crédito · Sin compromisos · Respuesta en menos de 2 horas
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
