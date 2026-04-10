import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sin Papel — La Empresa del Futuro, Hoy',
  description:
    'Transforma tu organización con gestión documental 100% digital. Reduce costos, automatiza procesos y cumple normativas desde una sola plataforma.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  )
}
