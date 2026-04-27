# ZeroPaper — Contexto completo para continuación en otra IA

> Exportado: Abril 2026 · Rama activa: `claude/clarify-task-description-ibwed`

---

## Qué es ZeroPaper

Sistema de gestión digital de operaciones portuarias. Reemplaza cuadernos y formularios físicos con una app web PWA accesible desde cualquier celular.

**URL producción**: https://zeropaper-nu.vercel.app  
**Repositorio**: github.com/ssaavedraimportaciones-byte/sin-papel-  
**WhatsApp soporte**: +56 9 9585 4721  

---

## Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend app | HTML + Vanilla JS (PWA) — `zeropaper_deploy/zeropaper_app.html` |
| Landing | HTML + Vanilla JS — `zeropaper_deploy/zeropaper_landing.html` |
| Backend API | Next.js 14 App Router (TypeScript) |
| Auth | JWT (access 15min + refresh 30d) + bcryptjs |
| Base de datos | Firebase Firestore (vía Admin SDK server-side) |
| Pagos | Stripe (checkout sessions + webhooks) |
| Deploy | Vercel + Netlify (ambos configurados) |
| PWA | manifest.json + sw.js (cache-first, offline) |

---

## Estructura del repositorio

```
Sin-papel-/
├── app/                          # Next.js App Router
│   ├── api/
│   │   ├── auth/route.ts         # Login, register, refresh token
│   │   ├── operations/route.ts   # CRUD operaciones (GET/POST/DELETE)
│   │   ├── stripe/
│   │   │   ├── checkout/route.ts # Crear sesión de pago
│   │   │   └── webhook/route.ts  # Eventos Stripe (sub created/cancelled)
│   │   └── erp/webhook/route.ts  # Recibir eventos SAP/Oracle/Generic
│   ├── terminos/page.tsx         # Términos de servicio
│   ├── privacidad/page.tsx       # Política de privacidad
│   └── sla/page.tsx              # SLA
├── lib/
│   ├── firebase-admin.ts         # Firebase Admin SDK (server-side)
│   ├── auth.ts                   # JWT sign/verify + bcrypt
│   └── stripe.ts                 # Stripe client + PLANS config
├── zeropaper_deploy/
│   ├── zeropaper_app.html        # App principal PWA (2624 líneas)
│   ├── zeropaper_landing.html    # Landing page
│   ├── zeropaper_presentacion.html # Presentación ejecutiva 8 slides
│   ├── manifest.json             # PWA manifest
│   └── sw.js                     # Service worker
├── .env.example                  # Variables de entorno requeridas
├── vercel.json                   # Rewrites: /app, /login, /dashboard
├── netlify.toml                  # Redirects equivalentes
└── package.json                  # Next 14.2.5 + bcryptjs + jose + stripe + firebase-admin + zod
```

---

## Variables de entorno requeridas (.env.local)

```env
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# JWT (cambiar en producción)
JWT_SECRET=
JWT_REFRESH_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_PRO=
STRIPE_PRICE_ENTERPRISE=

# ERP Integration
ERP_WEBHOOK_SECRET=

# App URL
NEXT_PUBLIC_URL=https://zeropaper-nu.vercel.app
```

---

## API REST — Endpoints

### Auth `POST /api/auth?action=`
| action | Body | Respuesta |
|--------|------|-----------|
| `register` | `{email, password, name, company}` | `{access, refresh}` |
| `login` | `{email, password}` | `{access, refresh}` |
| `refresh` | `{refresh}` | `{access}` |

**Header auth**: `Authorization: Bearer <access_token>`

### Operaciones `POST/GET/DELETE /api/operations`
- `GET`: lista operaciones de la empresa (paginado, `?limit=50&after=cursor`)
- `POST`: crear operación `{type, plate, company, folio?, notes?, photoUrl?}`
- `DELETE`: eliminar `{id}`

### Stripe `POST /api/stripe/checkout`
- Body: `{plan: 'starter'|'pro'|'enterprise'}`
- Respuesta: `{url: string}` → redirigir al usuario

### ERP Webhook `POST /api/erp/webhook`
- Header: `x-api-key: <ERP_WEBHOOK_SECRET>`
- Body: `{source: 'SAP'|'Oracle'|'Generic', event: string, payload: {...}}`

---

## Firebase Firestore — Colecciones

### `users`
```
{
  email, name, company, passwordHash,
  role: 'admin'|'operator'|'viewer',
  plan: 'trial'|'starter'|'pro'|'enterprise',
  stripeCustomerId?, stripeSubscriptionId?,
  createdAt, planActivatedAt?
}
```

### `operations`
```
{
  type: 'EIR'|'DAM'|'DUS'|'BL'|'OTRO',
  plate, company, folio?, notes?, photoUrl?,
  companyId, createdBy, createdAt
}
```

### `erp_events`
```
{
  plate, company, folio, type, notes,
  erpSource, raw, originalEvent,
  receivedAt, timestamp
}
```

---

## Planes y precios

| Plan | Precio CLP/mes | Usuarios | Storage |
|------|----------------|----------|---------|
| Starter | $29.000 | 3 | 5 GB |
| Pro | $59.000 | 15 | 50 GB |
| Enterprise | Cotización | Ilimitado | Ilimitado |

---

## Bugs conocidos y estado

| Bug | Estado |
|-----|--------|
| `showTab` usaba `event` global (falla Firefox/Safari) | ✅ Corregido |
| Contadores nunca limpiaban setInterval | ✅ Corregido |
| Link `/soporte` en app | ✅ Corregido → wa.me |
| Link `zeropaper_admin.html` | ✅ Corregido → /dashboard |
| manifest.json faltaba | ✅ Creado |
| sw.js faltaba | ✅ Creado |
| API key Firebase expuesta en frontend | ⚠️ Pendiente migrar a Firebase Admin |
| Vercel 403 (deployment protection) | ⚠️ Requiere dashboard Vercel → desactivar protección |
| OCR endpoint `/api/ocr` no existe | ✅ App ya tiene fallback "rellenar manualmente" |

---

## Pendientes críticos

1. **Migrar Firebase frontend → Admin SDK**: La app HTML usa API key hardcodeada. Hay que crear endpoints API que reemplacen las llamadas directas a Firestore desde el browser.
2. **Actualizar zeropaper_app.html** para llamar a `/api/operations` en vez de Firebase directamente.
3. **Instalar dependencias**: `npm install` en el servidor o Mac para que Next.js compile.
4. **Variables de entorno en Vercel**: agregar todas las vars del `.env.example` en Vercel Dashboard → Settings → Environment Variables.
5. **Crear precios en Stripe**: Dashboard → Products → Add product → 3 precios → copiar price IDs a env vars.
6. **Desactivar Vercel Deployment Protection**: Settings → Deployment Protection → Disabled.

---

## Comandos útiles

```bash
# Desarrollo local
npm install
npm run dev

# Deploy manual
git push -u origin claude/clarify-task-description-ibwed

# Instalar deps en Mac
npm install bcryptjs jsonwebtoken stripe firebase-admin zod jose
npm install -D @types/bcryptjs @types/jsonwebtoken
```

---

## Contacto del cliente

- **WhatsApp**: +56 9 9585 4721
- **Empresa**: ssaavedraimportaciones-byte
- **Repo**: ssaavedraimportaciones-byte/sin-papel-
