# ZEROPAPER — ARCHIVO COMPLETO DE CONTEXTO
> Generado: Abril 2026
> Contiene: contexto técnico + design brief + estructura + pendientes
> Usa este archivo para continuar en cualquier IA (Claude, ChatGPT, Cursor, etc.)

---

# PARTE 1 — QUÉ ES ZEROPAPER

**ZeroPaper digitaliza el registro de operaciones portuarias desde el celular, en 30 segundos, sin papel.**

Sistema PWA (funciona en cualquier celular sin instalar nada) que reemplaza cuadernos, formularios y carpetas físicas en terminales portuarios, almacenes y zonas de aduana.

**URL producción**: https://sin-papel.vercel.app
**App**: https://sin-papel.vercel.app/app
**WhatsApp**: +56 9 9585 4721
**Email**: contacto@zeropaper.cl
**Repositorio**: github.com/ssaavedraimportaciones-byte/Sin-papel-
**Rama activa**: claude/clarify-task-description-ibwed

---

# PARTE 2 — IDENTIDAD VISUAL

## Colores
| Nombre | HEX | Uso |
|--------|-----|-----|
| Verde principal | `#22c55e` | CTAs, íconos, acentos, números |
| Fondo oscuro | `#060b09` | Fondo de pantallas/slides |
| Fondo card | `#0d1f17` | Tarjetas, paneles secundarios |
| Borde verde | `#1a3a28` | Bordes sutiles |
| Texto blanco | `#f0fdf4` | Títulos y texto principal |
| Texto gris | `#86efac` | Subtítulos, etiquetas |

## Tipografías
- **Títulos grandes**: Bebas Neue (Google Fonts) — mayúsculas, tracking amplio
- **Texto cuerpo**: DM Sans — limpio, moderno
- **Datos/código/stats**: Space Mono — monoespaciado

## Estilo visual
- Dark mode siempre
- Esquinas redondeadas: 12-16px
- Bordes verdes sutiles en cards
- Gradientes: de `#0d1f17` a `#060b09`
- Glow verde en elementos clave: `box-shadow: 0 0 20px #22c55e33`
- Sin imágenes de stock — solo datos, íconos y texto

---

# PARTE 3 — PROPUESTA DE VALOR

## Mensaje central
> "Deja de perder tiempo buscando papeles. ZeroPaper registra cada operación desde el celular en 30 segundos."

## Beneficios clave
1. ⏱ Registro en 30 segundos (vs 5-10 min en papel)
2. 🔍 Búsqueda instantánea por patente, empresa o folio
3. 📷 Foto del documento físico adjunta a cada registro
4. 🔄 Cambio de turno digital (sin notas en papel)
5. ☁️ Respaldo automático en la nube — nunca se pierde nada
6. 📊 Reportes en Excel con 1 clic para contabilidad y auditorías

## Datos clave
| Métrica | Valor |
|---------|-------|
| Tiempo de registro | 30 segundos |
| Implementación | 72 horas |
| Búsqueda | < 1 segundo |
| Disponibilidad | 99.5% uptime |
| Sin papel | 100% |
| ROI estimado | 3 meses |

---

# PARTE 4 — CLIENTE OBJETIVO

## Quién compra ZeroPaper
- Jefe de operaciones de terminal portuaria o almacén
- Responsable de control de contenedores
- Administrador de zona franca o aduana
- Gerente que quiere eliminar papeleo y errores

## Sus dolores actuales
- Cuadernos que se pierden o mojan
- Letras ilegibles en formularios
- Turnos que se traspasan sin información
- Horas buscando un documento de hace 2 semanas
- Auditorías que se transforman en caos

---

# PARTE 5 — PLANES Y PRECIOS

| Plan | Precio CLP/mes | Usuarios | Storage | Para quién |
|------|----------------|----------|---------|------------|
| Starter | $29.000 | 3 | 5 GB | Operaciones pequeñas |
| Pro | $59.000 | 15 | 50 GB | Terminales medianos |
| Enterprise | Cotización | Ilimitado | Ilimitado | Grupos portuarios |

---

# PARTE 6 — STACK TECNOLÓGICO

| Capa | Tecnología |
|------|-----------|
| Frontend app | HTML + Vanilla JS (PWA) |
| Landing | HTML + Vanilla JS |
| Backend API | Next.js 14 App Router (TypeScript) |
| Auth | JWT (access 15min + refresh 30d) + bcryptjs |
| Base de datos | Firebase Firestore (Admin SDK server-side) |
| Pagos | Stripe (checkout sessions + webhooks) |
| Deploy | Vercel (sin-papel.vercel.app) |
| PWA | manifest.json + sw.js (cache-first, offline) |

---

# PARTE 7 — ESTRUCTURA DEL REPOSITORIO

```
Sin-papel-/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/route.ts         # Login, register, refresh token
│   │   ├── operations/route.ts   # CRUD operaciones (GET/POST/DELETE)
│   │   ├── proxy/route.ts        # Proxy Firestore (oculta API key)
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts # Crear sesión de pago
│   │   │   └── webhook/route.ts  # Eventos Stripe
│   │   └── erp/webhook/route.ts  # Integración SAP/Oracle/Generic
│   ├── terminos/page.tsx         # Términos de servicio
│   ├── privacidad/page.tsx       # Política de privacidad
│   └── sla/page.tsx              # SLA
├── lib/
│   ├── firebase-admin.ts         # Firebase Admin SDK (lazy init)
│   ├── auth.ts                   # JWT sign/verify + bcrypt
│   └── stripe.ts                 # Stripe client + PLANS config
├── zeropaper_deploy/
│   ├── zeropaper_app.html        # App principal PWA
│   ├── zeropaper_landing.html    # Landing page
│   └── zeropaper_presentacion.html # Presentación ejecutiva 8 slides
├── .env.example                  # Variables de entorno requeridas
├── vercel.json                   # Rewrites: /app, /login, /dashboard
└── next.config.js                # Next.js config
```

---

# PARTE 8 — API REST (ENDPOINTS)

### Auth — POST /api/auth?action=
| action | Body | Respuesta |
|--------|------|-----------|
| `register` | `{email, password, name, company}` | `{access, refresh}` |
| `login` | `{email, password}` | `{access, refresh}` |
| `refresh` | `{refresh}` | `{access}` |

**Header**: `Authorization: Bearer <access_token>`

### Operaciones — /api/operations
- `GET ?limit=50` — lista operaciones paginadas
- `POST {type, plate, company, folio?, notes?, photoUrl?}` — crear
- `DELETE {id}` — eliminar

### Stripe — POST /api/stripe/checkout
- Body: `{plan: 'starter'|'pro'|'enterprise'}`
- Responde: `{url}` → redirigir al usuario

### ERP — POST /api/erp/webhook
- Header: `x-api-key: <ERP_WEBHOOK_SECRET>`
- Body: `{source: 'SAP'|'Oracle'|'Generic', event, payload}`

---

# PARTE 9 — VARIABLES DE ENTORNO REQUERIDAS

```env
# Firebase Admin
FIREBASE_PROJECT_ID=zeropaper-prod
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@zeropaper-prod.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# JWT
JWT_SECRET=string-aleatorio-64-caracteres
JWT_REFRESH_SECRET=otro-string-aleatorio-64-caracteres

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_ENTERPRISE=price_...

# ERP
ERP_WEBHOOK_SECRET=api-key-para-erp

# App
NEXT_PUBLIC_URL=https://sin-papel.vercel.app
```

---

# PARTE 10 — FIREBASE FIRESTORE (COLECCIONES)

### `users`
```json
{
  "email": "string",
  "name": "string",
  "company": "string",
  "passwordHash": "bcrypt hash",
  "role": "admin | operator | viewer",
  "plan": "trial | starter | pro | enterprise",
  "stripeCustomerId": "string?",
  "stripeSubscriptionId": "string?",
  "createdAt": "ISO string"
}
```

### `operations`
```json
{
  "type": "EIR | DAM | DUS | BL | OTRO",
  "plate": "string",
  "company": "string",
  "folio": "string?",
  "notes": "string?",
  "photoUrl": "string?",
  "companyId": "uid del usuario",
  "createdBy": "email",
  "createdAt": "ISO string"
}
```

### `erp_events`
```json
{
  "plate": "string",
  "company": "string",
  "folio": "string",
  "erpSource": "SAP | Oracle | Generic",
  "raw": "objeto original",
  "receivedAt": "ISO string"
}
```

---

# PARTE 11 — ESTADO ACTUAL / BUGS

| Item | Estado |
|------|--------|
| App PWA funcional | ✅ |
| Landing page | ✅ |
| Presentación ejecutiva 8 slides | ✅ |
| Backend API REST (auth, operations, stripe, erp) | ✅ |
| Firebase API key eliminada del frontend | ✅ |
| Proxy server-side Firestore | ✅ |
| manifest.json + sw.js (offline) | ✅ |
| Páginas legales (términos, privacidad, SLA) | ✅ |
| Build Next.js compila sin errores | ✅ |
| Deploy en Vercel | ✅ (sin-papel.vercel.app) |
| Variables de entorno en Vercel | ⚠️ Pendiente configurar |
| Stripe precios configurados | ⚠️ Pendiente |
| Webhook Stripe en producción | ⚠️ Pendiente |

---

# PARTE 12 — PRESENTACIÓN EJECUTIVA (8 SLIDES)

### Slide 1 — PORTADA
- Logo: "ZeroPaper™" en Bebas Neue verde sobre fondo oscuro
- Tagline: "El fin del papeleo portuario"
- Subtítulo: "Presentación Ejecutiva · 2026"
- Fondo oscuro con partículas verdes sutiles

### Slide 2 — EL PROBLEMA
- Título: "Cada día pierdes horas buscando papeles"
- ANTES (gris): cuadernos, carpetas, turnos manuales, documentos perdidos
- DESPUÉS (verde): app móvil, búsqueda 1s, turno digital, nube

### Slide 3 — LA SOLUCIÓN
- Título: "ZeroPaper: tu operación en el celular"
1. 📱 Abre la app → ingresa datos del vehículo y documento
2. 📷 Toma foto del documento físico
3. ✅ El supervisor ve todo en tiempo real

### Slide 4 — QUÉ GANA TU EMPRESA
- Título: "6 ventajas desde el primer día"
- ⏱ 30 segundos · 🔍 Búsqueda · 📷 Foto · 🔄 Turno · ☁️ Nube · 📊 Excel

### Slide 5 — MÉTRICAS
- **-87%** tiempo de registro
- **100%** operaciones respaldadas
- **72h** implementación
- **3 meses** ROI

### Slide 6 — ARQUITECTURA
- 📱 App web PWA (funciona sin internet)
- ☁️ Firebase Google Cloud (cifrado, redundante)
- 🔌 API REST (SAP, Oracle, cualquier ERP)

### Slide 7 — PLANES
- Starter $29.000 · Pro $59.000 · Enterprise cotización
- CTA: WhatsApp +56 9 9585 4721

### Slide 8 — CTA FINAL
- "Empieza en 72 horas"
- Contacto → Demo → Implementación → Operación
- Botón: AGENDAR DEMO GRATIS

---

# PARTE 13 — LANDING PAGE (ESTRUCTURA)

### Hero
- Tagline: "Deja de perder tiempo buscando papeles"
- Subtítulo: "ZeroPaper digitaliza el registro de operaciones portuarias desde el celular, en 30 segundos."
- Stats: 30s por registro · 72h implementación · 100% sin papel
- Botones: [ABRIR APP →] [Ver cómo funciona ↓]

### El Problema
- "¿Sigues usando cuadernos?"
- Cuadernos que nadie encuentra / Turnos a mano / Horas perdidas

### Beneficios
- 6 tarjetas: ⏱ 🔍 📷 🔄 ☁️ 📊

### Cómo Funciona
- 3 pasos: Registra → Fotografía → Supervisor ve todo

### Precios
- 3 planes con CTA WhatsApp

### CTA Final
- "Prueba gratis 30 días"

---

# PARTE 14 — INSTRUCCIONES PARA IA DE DISEÑO

1. **No uses imágenes de stock** — íconos emoji o SVG simples
2. **Siempre dark mode** — fondo `#060b09`, texto claro
3. **Verde `#22c55e`** para acción, beneficio, positivo
4. **Bebas Neue** para todos los títulos grandes
5. **Los números son el hero** — grandes, verdes, prominentes
6. **Máximo 30 palabras por slide**
7. **Si es HTML**: CSS puro, sin frameworks pesados
8. **Si es Figma/PowerPoint**: grilla 12 columnas, márgenes 48px
9. **Formato slides**: 16:9 — 1920x1080px
10. **Tono**: profesional y directo, no corporativo genérico

---

# PARTE 15 — PENDIENTES PARA CONTINUAR

## Lo que falta hacer (solo requiere acceso a dashboards)

### Vercel (sin-papel.vercel.app)
1. Settings → Environment Variables → agregar todas las vars de la Parte 9
2. Redeploy automático tras agregar vars

### Stripe (stripe.com/dashboard)
1. Products → Add product → "ZeroPaper Starter" → precio $29.000 CLP recurrente
2. Products → Add product → "ZeroPaper Pro" → precio $59.000 CLP recurrente
3. Copiar los `price_id` de cada producto a las env vars de Vercel
4. Developers → Webhooks → Add endpoint → `https://sin-papel.vercel.app/api/stripe/webhook`
5. Copiar `signing secret` → env var `STRIPE_WEBHOOK_SECRET`

### Firebase (console.firebase.google.com)
1. Project settings → Service accounts → Generate new private key
2. Copiar `project_id`, `client_email`, `private_key` a env vars de Vercel
3. Firestore → Rules → permitir acceso solo desde server (Admin SDK)

---

# PARTE 16 — COMANDOS ÚTILES

```bash
# Clonar y ejecutar localmente
git clone https://github.com/ssaavedraimportaciones-byte/Sin-papel-.git
cd Sin-papel-
git checkout claude/clarify-task-description-ibwed
npm install
cp .env.example .env.local
# editar .env.local con las credenciales reales
npm run dev
# abre http://localhost:3000

# Build para producción
npm run build

# Deploy manual a Vercel
npx vercel --prod
```

---

*Archivo generado automáticamente por Claude Code · Abril 2026*
*Repositorio: ssaavedraimportaciones-byte/Sin-papel- · Rama: claude/clarify-task-description-ibwed*
