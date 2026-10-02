import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';

/**
 * Manda una nota de voz a la Edge Function «mitico-transcribir» (Groq, gratis)
 * y devuelve el texto. La clave de Groq está solo en Supabase, nunca aquí.
 */
export async function transcribirNotaDeVoz(audio: Blob, nombreArchivo: string): Promise<string> {
  const token = await obtenerAccessTokenSupabaseApp();
  const form = new FormData();
  form.append('audio', audio, nombreArchivo);

  let respuesta: Response;
  try {
    respuesta = await fetch(`${SUPABASE_URL}/functions/v1/mitico-transcribir`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new Error('Sin conexión: no se ha podido enviar la nota de voz.');
  }

  let datos: { texto?: string; error?: string } | null = null;
  try {
    datos = await respuesta.json();
  } catch {
    datos = null;
  }
  if (respuesta.status === 404) {
    throw new Error('La transcripción todavía no está activada en el servidor.');
  }
  if (!respuesta.ok) {
    throw new Error(datos?.error || 'No se ha podido transcribir. Prueba otra vez.');
  }
  return String(datos?.texto || '').trim();
}

/** Formato de audio que admite este móvil para grabar (iPhone: mp4; Android/PC: webm). */
export function formatoGrabacion(): { mimeType: string; extension: string } | null {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') return null;
  const opciones: Array<[string, string]> = [
    ['audio/mp4', 'm4a'],
    ['audio/webm;codecs=opus', 'webm'],
    ['audio/webm', 'webm'],
    ['audio/ogg;codecs=opus', 'ogg'],
  ];
  for (const [mimeType, extension] of opciones) {
    if (typeof MediaRecorder.isTypeSupported !== 'function' || MediaRecorder.isTypeSupported(mimeType)) {
      return { mimeType, extension };
    }
  }
  return null;
}
