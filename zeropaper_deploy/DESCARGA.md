# ZeroPaper Deploy Files

Este directorio contiene los archivos de ZeroPaper en chunks para descarga.

## Descargar y reconstruir en Mac

```bash
#!/bin/bash
set -e
cd "/Users/macbookpro/claude code proyectos/zeropaper"
BASE="https://raw.githubusercontent.com/ssaavedraimportaciones-byte/Sin-papel-/claude/clarify-task-description-ibwed/zeropaper_deploy"

echo "==> Descargando zeropaper_landing.html..."
: > zeropaper_landing.html
for i in 00 01 02 03 04 05; do
  curl -fsSL "$BASE/land_$i" >> zeropaper_landing.html
  echo "  chunk land_$i OK"
done

echo "==> Descargando zeropaper_app.html..."
: > zeropaper_app.html
for i in 00 01 02 03 04 05 06 07 08 09; do
  curl -fsSL "$BASE/app_$i" >> zeropaper_app.html
  echo "  chunk app_$i OK"
done

echo "==> Verificando..."
wc -l zeropaper_landing.html zeropaper_app.html

echo "==> Deploy a Vercel..."
vercel --prod
```
