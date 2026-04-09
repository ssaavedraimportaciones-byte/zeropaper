const FB = {
  projectId: 'zeropaper-prod',
  apiKey: 'AIzaSyCli7F4hLi-XEmmekGZpO2KQ1SO612I85Y'
};
const FS_URL = `https://firestore.googleapis.com/v1/projects/${FB.projectId}/databases/(default)/documents`;

export const config = { runtime: 'edge', maxDuration: 15 };

export default async function handler(req) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') return new Response(null, { headers });

  const url = new URL(req.url);

  // GET: retrieve knowledge for a department/empresa
  if (req.method === 'GET') {
    const empresa = url.searchParams.get('empresa');
    const depto = url.searchParams.get('depto');
    if (!empresa) {
      return new Response(JSON.stringify({ error: 'empresa requerida' }), { status: 400, headers });
    }

    try {
      const path = depto
        ? `empresas/${empresa}/knowledge/${depto}`
        : `empresas/${empresa}/knowledge/global`;

      const res = await fetch(`${FS_URL}/${path}?key=${FB.apiKey}`);
      if (!res.ok) {
        return new Response(JSON.stringify({
          patterns: [], suggestions: [], corrections: [], problems: []
        }), { headers });
      }

      const doc = await res.json();
      const fields = doc.fields || {};
      const result = {};

      for (const [key, val] of Object.entries(fields)) {
        if (val.stringValue) {
          try { result[key] = JSON.parse(val.stringValue); } catch { result[key] = val.stringValue; }
        } else if (val.integerValue) {
          result[key] = parseInt(val.integerValue);
        }
      }

      return new Response(JSON.stringify(result), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  // POST: register a learning event
  if (req.method === 'POST') {
    let body;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ error: 'JSON inválido' }), { status: 400, headers });
    }

    const { empresa, depto, type, data } = body;
    if (!empresa || !type) {
      return new Response(JSON.stringify({ error: 'empresa y type requeridos' }), { status: 400, headers });
    }

    try {
      const docPath = depto
        ? `empresas/${empresa}/knowledge/${depto}`
        : `empresas/${empresa}/knowledge/global`;

      // Read existing
      let existing = {};
      try {
        const getRes = await fetch(`${FS_URL}/${docPath}?key=${FB.apiKey}`);
        if (getRes.ok) {
          const doc = await getRes.json();
          for (const [k, v] of Object.entries(doc.fields || {})) {
            if (v.stringValue) {
              try { existing[k] = JSON.parse(v.stringValue); } catch { existing[k] = v.stringValue; }
            }
          }
        }
      } catch {}

      // Process learning types
      if (type === 'ocr_correction') {
        // Store OCR corrections to improve future suggestions
        const corrections = existing.corrections || [];
        corrections.push({ ...data, ts: Date.now() });
        // Keep last 100
        existing.corrections = corrections.slice(-100);
      }

      if (type === 'doc_pattern') {
        // Track document type frequency by hour
        const patterns = existing.patterns || {};
        const hour = new Date().getHours();
        const key = `${data.docType}_h${hour}`;
        patterns[key] = (patterns[key] || 0) + 1;
        existing.patterns = patterns;
      }

      if (type === 'plate_frequency') {
        // Track frequent plates
        const plates = existing.frequentPlates || {};
        plates[data.plate] = (plates[data.plate] || 0) + 1;
        existing.frequentPlates = plates;
      }

      if (type === 'problem_solved') {
        // Store solved problems for future reference
        const problems = existing.solvedProblems || [];
        problems.push({ ...data, ts: Date.now() });
        existing.solvedProblems = problems.slice(-50);
      }

      if (type === 'suggestion_feedback') {
        // Track which suggestions were helpful
        const feedback = existing.suggestionFeedback || { helpful: 0, notHelpful: 0 };
        if (data.helpful) feedback.helpful++;
        else feedback.notHelpful++;
        existing.suggestionFeedback = feedback;
      }

      // Save back
      const fields = {};
      for (const [k, v] of Object.entries(existing)) {
        fields[k] = { stringValue: JSON.stringify(v) };
      }
      fields.updatedAt = { integerValue: String(Date.now()) };

      await fetch(`${FS_URL}/${docPath}?key=${FB.apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields })
      });

      return new Response(JSON.stringify({ ok: true }), { headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response('Method not allowed', { status: 405, headers });
}
