/**
 * ZeroPaper™ — Exportación automática semanal
 * Vercel Cron: cada lunes 10:00 UTC (07:00 Chile)
 * También acepta llamadas manuales desde el panel admin
 *
 * Endpoint: GET /api/exportar?empresa=ID&secret=TOKEN
 * Cron:     GET /api/exportar  (sin params, exporta todas las empresas)
 */

const FB_PROJECT = 'zeropaper-prod';
const FB_KEY     = 'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y';
const FS_BASE    = `https://firestore.googleapis.com/v1/projects/${FB_PROJECT}/databases/(default)/documents`;

// ── CRON CONFIG ───────────────────────────────────────────────
export const config = { maxDuration: 60 };

// ── UTILS ─────────────────────────────────────────────────────
function parseFs(doc) {
  if (!doc?.fields) return null;
  const f = doc.fields;
  const s = k => f[k]?.stringValue  ?? '';
  const n = k => Number(f[k]?.integerValue ?? f[k]?.doubleValue ?? 0);
  return {
    id:           doc.name?.split('/').pop() ?? '',
    ts:           n('ts'),
    fecha:        s('fecha'),
    tipo:         s('tipo'),
    estado:       s('estado') || 'PENDIENTE',
    patente:      s('patente') || s('vehiculo'),
    folio:        s('folio')   || s('documento'),
    departamento: s('departamento') || s('depto') || '—',
    operador:     s('operador')     || s('operadorNombre') || '—',
    observacion:  s('observacion')  || s('obs') || '',
  };
}

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n'))
    return '"' + str.replace(/"/g, '""') + '"';
  return str;
}

function opsToCSV(ops) {
  const headers = ['ID','Fecha','Tipo','Estado','Patente','Folio','Departamento','Operador','Observación','Timestamp'];
  const rows = ops.map(o => [
    o.id, o.fecha, o.tipo, o.estado, o.patente,
    o.folio, o.departamento, o.operador, o.observacion,
    o.ts ? new Date(o.ts).toISOString() : ''
  ].map(escapeCSV).join(','));
  return [headers.join(','), ...rows].join('\n');
}

function semanaActual() {
  const hoy  = new Date();
  const lun  = new Date(hoy);
  lun.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7));
  const dom  = new Date(lun);
  dom.setDate(lun.getDate() + 6);
  return {
    desde: lun.toISOString().slice(0, 10),
    hasta: dom.toISOString().slice(0, 10),
  };
}

async function obtenerEmailEmpresa(empresaId) {
  try {
    const r = await fetch(`${FS_BASE}/empresas/${empresaId}/config/settings?key=${FB_KEY}`);
    if (!r.ok) return null;
    const data = await r.json();
    return data.fields?.emailReportes?.stringValue || null;
  } catch { return null; }
}

// ── FIRESTORE ─────────────────────────────────────────────────
async function listarEmpresas() {
  const r = await fetch(`${FS_BASE}/empresas?key=${FB_KEY}&pageSize=100`);
  if (!r.ok) return [];
  const data = await r.json();
  return (data.documents || []).map(d => ({
    id:     d.name.split('/').pop(),
    nombre: d.fields?.nombre?.stringValue || d.name.split('/').pop(),
  }));
}

async function cargarOpsEmpresa(empresaId) {
  const r = await fetch(`${FS_BASE}/empresas/${empresaId}/ops?key=${FB_KEY}&pageSize=2000`);
  if (!r.ok) return [];
  const data = await r.json();
  return (data.documents || []).map(parseFs).filter(Boolean);
}

async function guardarReporte(empresaId, payload) {
  const tsId = Date.now();
  await fetch(`${FS_BASE}/empresas/${empresaId}/reportes?key=${FB_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        tipo:      { stringValue: 'exportacion_semanal' },
        ts:        { integerValue: String(tsId) },
        fecha:     { stringValue: new Date().toISOString().slice(0, 10) },
        totalOps:  { integerValue: String(payload.totalOps) },
        csvBase64: { stringValue: payload.csvBase64 },
        periodo:   { stringValue: payload.periodo },
        estado:    { stringValue: 'completado' },
      }
    })
  });
}

// ── EMAIL VIA RESEND (opcional) ────────────────────────────────
async function enviarEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from:    'ZeroPaper™ <onboarding@resend.dev>',
        to:      [to],
        subject, html
      })
    });
    return r.ok;
  } catch { return false; }
}

// ── HANDLER ───────────────────────────────────────────────────
export default async function handler(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS')
    return new Response(null, { headers: corsHeaders });

  const url       = new URL(req.url);
  const empresaId = url.searchParams.get('empresa') || null;
  const emailParam = url.searchParams.get('email') || process.env.EXPORT_EMAIL || null;
  const { desde, hasta } = semanaActual();
  const periodo   = `${desde} al ${hasta}`;

  const resultados = [];
  const empresas   = empresaId
    ? [{ id: empresaId, nombre: empresaId }]
    : await listarEmpresas();

  for (const emp of empresas) {
    try {
      const allOps  = await cargarOpsEmpresa(emp.id);
      const opsDelPeriodo = allOps.filter(o =>
        o.fecha >= desde && o.fecha <= hasta
      );

      if (opsDelPeriodo.length === 0) {
        resultados.push({ empresa: emp.id, ops: 0, status: 'sin_datos' });
        continue;
      }

      const csv       = opsToCSV(opsDelPeriodo);
      const csvBase64 = Buffer.from(csv).toString('base64');

      // Guardar en Firestore
      await guardarReporte(emp.id, { totalOps: opsDelPeriodo.length, csvBase64, periodo });

      // Email: primero busca en Firestore config, luego params, luego env
      const emailDest = emailParam || await obtenerEmailEmpresa(emp.id);
      if (emailDest) {
        const resumen = [
          `<h2>ZeroPaper™ — Exportación semanal</h2>`,
          `<p><strong>Empresa:</strong> ${emp.nombre}</p>`,
          `<p><strong>Período:</strong> ${periodo}</p>`,
          `<p><strong>Total operaciones:</strong> ${opsDelPeriodo.length}</p>`,
          `<p>El CSV está disponible en el panel admin en <strong>Reportes → Exportaciones</strong>.</p>`,
          `<hr><p style="font-size:12px;color:#888">ZeroPaper™ — reporte automático semanal · zeropaper-swart.vercel.app</p>`,
        ].join('');

        await enviarEmail({
          to: emailDest,
          subject: `[ZeroPaper™] Exportación semanal — ${emp.nombre} (${periodo})`,
          html: resumen,
        });
      }

      resultados.push({ empresa: emp.id, ops: opsDelPeriodo.length, status: 'ok' });
    } catch (err) {
      resultados.push({ empresa: emp.id, status: 'error', error: err.message });
    }
  }

  return new Response(
    JSON.stringify({ ok: true, periodo, resultados, ts: new Date().toISOString() }),
    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
