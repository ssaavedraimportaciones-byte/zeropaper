export default function SLA() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-invert">
      <h1>Acuerdo de Nivel de Servicio (SLA) — ZeroPaper</h1>
      <p><em>Vigente desde Abril 2026</em></p>

      <h2>Disponibilidad objetivo</h2>
      <table>
        <thead><tr><th>Plan</th><th>Uptime mensual</th><th>Tiempo máx. de resolución</th></tr></thead>
        <tbody>
          <tr><td>Starter</td><td>99.0%</td><td>48 horas hábiles</td></tr>
          <tr><td>Pro</td><td>99.5%</td><td>24 horas hábiles</td></tr>
          <tr><td>Enterprise</td><td>99.9%</td><td>4 horas hábiles</td></tr>
        </tbody>
      </table>

      <h2>Exclusiones</h2>
      <p>El SLA no aplica para interrupciones causadas por: mantenimientos programados (comunicados con 48h de anticipación), fuerza mayor, fallos de proveedores de infraestructura (Google Cloud, Vercel), o mal uso del servicio.</p>

      <h2>Compensaciones</h2>
      <p>Si el uptime mensual cae bajo el objetivo, el cliente tendrá derecho a un crédito equivalente al tiempo de interrupción × 2, aplicado al siguiente período de facturación. El crédito máximo es el 30% del valor mensual del plan.</p>

      <h2>Soporte</h2>
      <ul>
        <li>WhatsApp: +56 9 9585 4721 (horario hábil 9–18h, L-V)</li>
        <li>Email: soporte@zeropaper.cl</li>
        <li>Tiempo de respuesta inicial: 2h hábiles (Pro/Enterprise), 8h hábiles (Starter)</li>
      </ul>

      <h2>Contacto</h2>
      <p>contacto@zeropaper.cl · +56 9 9585 4721</p>
    </main>
  )
}
