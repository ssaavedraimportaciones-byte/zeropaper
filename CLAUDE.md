# ZeroPaper™ — Deploy via Claude Code

## Instrucción para Claude Code
Despliega este proyecto a Vercel Production. Los archivos están en este directorio.

### Pasos exactos:
1. `npm install -g vercel` (si no está instalado)
2. `vercel deploy --prod --yes --name zeropaper`
3. Confirma que la URL funciona visitando el deployment
4. Reporta la URL final al usuario

### Estructura del proyecto
- `index.html` → landing page (ruta /)
- `zeropaper_app.html` → app principal PWA
- `zeropaper_admin.html` → panel admin (usuario: admin / contraseña: zeropaper2025)
- `sw.js` → service worker offline
- `manifest.json` → PWA manifest
- `icon.svg` → ícono PWA
- `vercel.json` → configuración Vercel (rewrites + headers)

### vercel.json ya configurado con:
- / → index.html (landing)
- /app → zeropaper_app.html
- /admin → zeropaper_admin.html
- SW headers sin caché

### Firebase ya configurado dentro de la app:
- Project ID: zeropaper-prod
- API Key: AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y

### NO modificar nada, solo deployar.
