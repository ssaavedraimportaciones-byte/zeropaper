'use client'

import Navbar from './components/Navbar'
import Hero from './components/Hero'
import MarqueeSection from './components/Marquee'
import ProblemaSection from './components/ProblemaSection'
import CuatroPilares from './components/CuatroPilares'
import MetricsAnimated from './components/MetricsAnimated'
import ComoFunciona from './components/ComoFunciona'
import Integraciones from './components/Integraciones'
import Seguridad from './components/Seguridad'
import Testimonios from './components/Testimonios'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

export default function Home() {
  return (
    <main className="min-h-screen mesh-bg">
      <Navbar />
      <Hero />
      <div className="section-divider w-full" />
      <MarqueeSection />
      <div className="section-divider w-full" />
      <ProblemaSection />
      <div className="section-divider w-full" />
      <CuatroPilares />
      <div className="section-divider w-full" />
      <MetricsAnimated />
      <div className="section-divider w-full" />
      <ComoFunciona />
      <div className="section-divider w-full" />
      <Integraciones />
      <div className="section-divider w-full" />
      <Seguridad />
      <div className="section-divider w-full" />
      <Testimonios />
      <div className="section-divider w-full" />
      <CTASection />
      <Footer />
    </main>
  )
}
