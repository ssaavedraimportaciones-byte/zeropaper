import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ZeroPaper — Operaciones portuarias sin papel',
  description:
    'Digitaliza el registro de operaciones portuarias desde el celular. Registro en 30 segundos, búsqueda instantánea, sin papel.',
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
