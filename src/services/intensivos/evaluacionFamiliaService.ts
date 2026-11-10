import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import type { InformeIntensivoFamilia } from '../../core/evaluations/intensiveFamilyReport';

// Evaluación del Intensivo para la familia (10/11): texto por IA y enlace al PDF.

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type TextoFamilia = {
  intensivo_alumno_id: string;
  texto_familia: string | null;
  mensaje_familia: string | null;
  texto_familia_at: string | null;
};

export function cargarTextosFamilia(intensivoId: string) {
  return api.rpcRows<TextoFamilia>('textos_familia_intensivo_app', { p_intensivo_id: intensivoId });
}

export function guardarTextoFamilia(intensivoAlumnoId: string, texto: string, mensaje: string) {
  return api.rpcVoid('guardar_texto_familia_intensivo_app', {
    p_intensivo_alumno_id: intensivoAlumnoId,
    p_texto: texto,
    p_mensaje: mensaje,
  });
}

type RespuestaFuncion = { ok?: boolean; error?: string; texto_familia?: string; mensaje_familia?: string; url?: string };

async function llamar(body: object) {
  const r = await api.edgeJson<RespuestaFuncion>('mitico-evaluacion-familia', body);
  if (!r?.ok) throw new Error(r?.error || 'No se ha podido completar.');
  return r;
}

export async function redactarConIA(informe: InformeIntensivoFamilia) {
  const r = await llamar({
    action: 'redactar',
    intensivo_alumno_id: informe.intensivoAlumnoId,
    // Solo datos estructurados: nada de observaciones internas.
    informe: {
      nombre: informe.nombre,
      intensivo: informe.intensivo,
      fechas: informe.fechas,
      asistencia: informe.asistencia,
      nivelInicio: informe.nivelInicio,
      nivelFinal: informe.nivelFinal,
      habilidades: informe.habilidades,
      actitud: informe.actitud,
      autonomia: informe.autonomia,
      objetivos: informe.objetivos,
    },
  });
  return { texto: String(r.texto_familia || ''), mensaje: String(r.mensaje_familia || '') };
}

function base64DeBytes(bytes: Uint8Array) {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

/** Sube el PDF al almacén privado y devuelve un enlace (caduca en 180 días). */
export async function subirPdfFamilia(intensivoAlumnoId: string, nombre: string, bytes: Uint8Array) {
  const r = await llamar({
    action: 'subir_pdf',
    intensivo_alumno_id: intensivoAlumnoId,
    nombre,
    pdf_base64: base64DeBytes(bytes),
  });
  return String(r.url || '');
}
