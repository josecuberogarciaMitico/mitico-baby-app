// Paco y las Altas/Test al cargar listados de AimHarder (lógica pura, sin red).
//
// Al refrescar/cargar un turno Baby, los niños sin ficha entran como
// «Pendiente de Alta/Test». Paco decide, para cada uno, qué hacer:
//   - ya tiene un Alta/Test pendiente de envío  → «listo»: botón WhatsApp;
//   - ya se le mandó (o ya respondió)           → «enviado»: no se duplica;
//   - no tiene alta y AimHarder trae teléfono y fecha de nacimiento → «crear»;
//   - falta teléfono o fecha                    → «falta_dato»: a mano.
// El WhatsApp lo abre la app con el texto y el enlace ya escritos: Jose solo
// pulsa Enviar (gratis; el envío 100 % automático necesitaría la API de Meta).
import type { AltaNivelInicialApp } from '../../core/enrolment/enrolmentTypes';
import { normalizeWhatsappPhone } from '../../core/communications/whatsappContract';

export type PendienteAltaPaco = {
  nombre: string;
  telefono?: string | null;
  fechaNacimiento?: string | null;
};

export type EstadoAltaPaco = 'crear' | 'listo' | 'enviado' | 'falta_dato' | 'revisar';

export type DecisionAltaPaco = {
  nombre: string;
  estado: EstadoAltaPaco;
  telefono: string;
  fechaNacimiento: string;
  alta: AltaNivelInicialApp | null;
  motivo?: string;
};

export function claveNombreAlta(nombre: string | null | undefined): string {
  return String(nombre || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .replace(/\[INVITADO\]/g, ' ')
    .replace(/[^A-Z0-9Ñ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ENVIADOS = new Set(['ENVIADO', 'RESPONDIDO', 'VALIDADO', 'ANADIDO']);

export function decidirAltasPaco(
  pendientes: PendienteAltaPaco[],
  altas: AltaNivelInicialApp[]
): DecisionAltaPaco[] {
  const porNombre = new Map<string, AltaNivelInicialApp>();
  for (const alta of altas) {
    if (alta.estado === 'DESCARTADO') continue;
    const clave = claveNombreAlta(alta.nombre_completo);
    const previa = porNombre.get(clave);
    // Si hay varias, manda la más reciente.
    if (!previa || String(alta.creado_at || '') > String(previa.creado_at || '')) porNombre.set(clave, alta);
  }

  const vistos = new Set<string>();
  const decisiones: DecisionAltaPaco[] = [];
  for (const p of pendientes) {
    const clave = claveNombreAlta(p.nombre);
    if (!clave || vistos.has(clave)) continue;
    vistos.add(clave);
    const telefono = normalizeWhatsappPhone(p.telefono);
    const fechaNacimiento = String(p.fechaNacimiento || '').slice(0, 10);
    const alta = porNombre.get(clave) || null;
    const base = { nombre: String(p.nombre || '').trim(), telefono, fechaNacimiento, alta };
    if (alta && ENVIADOS.has(alta.estado)) {
      decisiones.push({ ...base, estado: 'enviado' });
    } else if (alta) {
      decisiones.push({ ...base, estado: 'listo' });
    } else if (telefono.length < 9 || !FECHA.test(fechaNacimiento)) {
      decisiones.push({
        ...base,
        estado: 'falta_dato',
        motivo:
          telefono.length < 9 && !FECHA.test(fechaNacimiento)
            ? 'faltan teléfono y fecha de nacimiento'
            : telefono.length < 9
            ? 'falta el teléfono'
            : 'falta la fecha de nacimiento',
      });
    } else {
      decisiones.push({ ...base, estado: 'crear' });
    }
  }
  return decisiones;
}

/** Mismo texto que «Enviar por WhatsApp» de Altas / Test. */
export function textoWhatsappAltaTest(nombreCompleto: string, enlace: string): string {
  const nombrePila = String(nombreCompleto || '').trim().split(/\s+/)[0] || nombreCompleto;
  return (
    `Hola familia, para preparar correctamente el grupo de ${nombrePila} necesitamos una pequeña valoración de su experiencia esquiando.\n\n` +
    `No tenéis que conocer su nivel: son 8 preguntas de respuesta cerrada sobre lo que le habéis visto hacer y se tarda aproximadamente 2 minutos.\n\n` +
    `${enlace}\n\nMuchas gracias.`
  );
}

export function urlWhatsappAltaTest(telefono: string, nombreCompleto: string, enlace: string): string {
  const numero = normalizeWhatsappPhone(telefono);
  if (!numero || !enlace) return '';
  return `https://wa.me/${numero}?text=${encodeURIComponent(textoWhatsappAltaTest(nombreCompleto, enlace))}`;
}

/** Resumen de Paco, una línea. */
export function resumenAltasPaco(decisiones: DecisionAltaPaco[]): string {
  const listos = decisiones.filter((d) => d.estado === 'listo').length;
  const enviados = decisiones.filter((d) => d.estado === 'enviado').length;
  const aMano = decisiones.filter((d) => d.estado === 'falta_dato' || d.estado === 'revisar').length;
  const partes: string[] = [];
  if (listos) partes.push(`${listos} con el WhatsApp listo para enviar`);
  if (enviados) partes.push(`${enviados} ya enviado${enviados === 1 ? '' : 's'}`);
  if (aMano) partes.push(`${aMano} para revisar a mano`);
  const total = decisiones.length;
  return `Paco · ${total} niño${total === 1 ? '' : 's'} nuevo${total === 1 ? '' : 's'} sin ficha: ${partes.join(', ') || 'nada que hacer'}.`;
}
