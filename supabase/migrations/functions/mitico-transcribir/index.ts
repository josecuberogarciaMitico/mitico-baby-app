// Edge Function «mitico-transcribir» (02/10/2026).
// Recibe una nota de voz grabada en la app (campo «audio» de un formulario),
// comprueba que quien la manda tiene sesión en Mítico y la pasa a texto.
//
// Motor de transcripción (gratis):
//  - Por defecto, GEMINI: usa el secreto GEMINI_API_KEY que ya existe en
//    Supabase para Paco. No hay que configurar nada más.
//  - Si algún día se añade el secreto GROQ_API_KEY, se usa Groq (Whisper).
// Las claves viven SOLO aquí, como secretos de Supabase; nunca en la app.
//
// Despliegue (lo hace Jose desde el panel de Supabase):
//   Edge Functions → Deploy a new function → Via Editor → nombre «mitico-transcribir»
//   → pegar este archivo → Deploy.

const GROQ_URL = 'https://api.groq.com/openai/v1/audio/transcriptions';
// Mismos modelos que ya usa Paco (gratis); se prueba el siguiente si uno falla.
const MODELOS_GEMINI = ['gemini-3.5-flash-lite', 'gemini-3.5-flash'];
const MODELO = 'whisper-large-v3-turbo';
const MAX_BYTES = 6 * 1024 * 1024; // ~2-3 minutos de voz: de sobra para una nota
// Vocabulario del club para que Whisper escriba bien los términos de esquí.
const PISTA_VOCABULARIO =
  'Nota de un entrenador de esquí sobre un alumno: cuña, frenada, paralelismo, paralelo, viraje, ' +
  'giro, canteo, cantos, bastón, apoyo exterior, flexión, extensión, conducción, derrape, pista, ' +
  'cinta, percha, telesilla, remonte, iniciación.';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
};

const SIN_VOZ = 'SIN_VOZ';

/** Quita comillas y descarta respuestas que no son voz (silencio o lista de palabras). */
function limpiarTranscripcion(bruto: string): string {
  const texto = String(bruto || '').replace(/^["«»“”']+|["«»“”']+$/g, '').trim();
  if (!texto || texto.toUpperCase().includes(SIN_VOZ)) return '';
  const palabrasClave = PISTA_VOCABULARIO.toLowerCase().split(/[:,.]/).map((p) => p.trim()).filter((p) => p.length > 3);
  const trozos = texto.toLowerCase().split(',').map((p) => p.replace(/[.\s]+$/g, '').trim());
  const repetidas = trozos.filter((t) => palabrasClave.includes(t)).length;
  if (trozos.length >= 5 && repetidas >= 4) return '';
  return texto;
}

function aBase64(bytes: Uint8Array): string {
  let binario = '';
  const trozo = 0x8000;
  for (let i = 0; i < bytes.length; i += trozo) {
    binario += String.fromCharCode(...bytes.subarray(i, i + trozo));
  }
  return btoa(binario);
}

// Gemini admite audio y vídeo; si no acepta el tipo «audio/…» del móvil,
// se reintenta como vídeo del mismo formato (solo trae el sonido).
function tiposParaGemini(tipo: string): string[] {
  const base = (tipo || '').split(';')[0].trim().toLowerCase() || 'audio/mp4';
  if (base === 'audio/mp4' || base === 'audio/x-m4a' || base === 'audio/m4a') return ['audio/mp4', 'video/mp4'];
  if (base === 'audio/webm') return ['audio/webm', 'video/webm'];
  return [base];
}

async function transcribirConGemini(audio: File, clave: string): Promise<string> {
  const datos = aBase64(new Uint8Array(await audio.arrayBuffer()));
  // Sin lista de palabras: con audio sin voz, el modelo la repetía como si fuera
  // la transcripción (pasó el 02/10 en el iPhone de Jose).
  const instruccion =
    'Transcribe literalmente lo que dice la persona en este audio, en español de España. ' +
    'Es una nota de voz breve de un entrenador de esquí sobre un alumno. ' +
    'Devuelve SOLO las palabras dichas, con puntuación normal, sin comillas, sin títulos y sin comentarios. ' +
    `No inventes nada. Si no hay voz o no se entiende, responde exactamente: ${SIN_VOZ}`;
  let ultimoError = '';
  for (const modelo of MODELOS_GEMINI) {
    for (const mime of tiposParaGemini(audio.type)) {
      const r = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': clave },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ inline_data: { mime_type: mime, data: datos } }, { text: instruccion }] }],
            generationConfig: { temperature: 0, maxOutputTokens: 1024 },
          }),
        },
      );
      const cuerpo = await r.json().catch(() => null);
      if (r.ok) {
        const partes = cuerpo?.candidates?.[0]?.content?.parts;
        const texto = Array.isArray(partes)
          ? partes.map((p: { text?: string }) => (typeof p?.text === 'string' ? p.text : '')).join('').trim()
          : '';
        return limpiarTranscripcion(texto);
      }
      ultimoError = `${modelo} ${mime}: ${r.status} ${cuerpo?.error?.message || ''}`;
      console.error('Gemini error', ultimoError.slice(0, 500));
      if (r.status === 429) throw new Error('LIMITE');
    }
  }
  throw new Error(ultimoError || 'Gemini sin respuesta');
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

async function usuarioValido(req: Request): Promise<boolean> {
  const auth = req.headers.get('Authorization') || '';
  if (!auth.startsWith('Bearer ')) return false;
  const url = Deno.env.get('SUPABASE_URL');
  const anon = Deno.env.get('SUPABASE_ANON_KEY');
  if (!url || !anon) return false;
  const r = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: auth, apikey: anon },
  });
  return r.ok;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Método no permitido.' });

  try {
    if (!(await usuarioValido(req))) {
      return json(401, { error: 'Sesión no válida. Vuelve a entrar en la app.' });
    }

    const clave = Deno.env.get('GROQ_API_KEY');
    const claveGemini = Deno.env.get('GEMINI_API_KEY');
    if (!clave && !claveGemini) {
      return json(500, { error: 'Falta configurar la transcripción (GEMINI_API_KEY o GROQ_API_KEY).' });
    }

    const form = await req.formData();
    const audio = form.get('audio');
    if (!(audio instanceof File) || audio.size === 0) {
      return json(400, { error: 'No ha llegado ningún audio.' });
    }
    if (audio.size > MAX_BYTES) {
      return json(413, { error: 'La grabación es demasiado larga.' });
    }

    if (!clave) {
      try {
        const texto = await transcribirConGemini(audio, claveGemini as string);
        return json(200, { texto });
      } catch (error) {
        if (error instanceof Error && error.message === 'LIMITE') {
          return json(429, { error: 'Se ha llegado al límite gratuito de transcripción. Prueba en un minuto.' });
        }
        return json(502, { error: 'El servicio de transcripción no ha respondido. Prueba otra vez.' });
      }
    }

    const envio = new FormData();
    envio.append('file', audio, audio.name || 'nota.m4a');
    envio.append('model', MODELO);
    envio.append('language', 'es');
    envio.append('response_format', 'json');
    envio.append('temperature', '0');
    envio.append('prompt', PISTA_VOCABULARIO);

    const respuesta = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${clave}` },
      body: envio,
    });

    if (respuesta.status === 429) {
      return json(429, { error: 'Se ha llegado al límite gratuito de transcripción. Prueba en un minuto.' });
    }
    if (!respuesta.ok) {
      const detalle = await respuesta.text();
      console.error('Groq error', respuesta.status, detalle.slice(0, 500));
      return json(502, { error: 'El servicio de transcripción no ha respondido. Prueba otra vez.' });
    }

    const datos = await respuesta.json();
    const texto = limpiarTranscripcion(String(datos?.text || ''));
    return json(200, { texto });
  } catch (error) {
    console.error('mitico-transcribir', error);
    return json(500, { error: 'No se ha podido transcribir. Prueba otra vez.' });
  }
});
