import type {
  WhatsappGroupContext,
  WhatsappGrupoApp,
  WhatsappPreviewState,
} from './whatsappTypes';

export function normalizeWhatsappPhone(value: string | null | undefined): string {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length === 9 && /^[6789]/.test(digits)) return `34${digits}`;
  return digits;
}

export function whatsappDirectUrl(
  phone: string | null | undefined,
  text?: string
): string {
  const normalized = normalizeWhatsappPhone(phone);
  if (!normalized) return '';
  return `https://wa.me/${normalized}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function normalizeWhatsappGroupKey(value: string | null | undefined): string {
  return String(value || '')
    .trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9+]+/g, '_').replace(/^_+|_+$/g, '');
}

export function isValidWhatsappGroupLink(value: string | null | undefined): boolean {
  return /^https:\/\/chat\.whatsapp\.com\//i.test(String(value || '').trim());
}

export function whatsappGroupLinkByKey(records: WhatsappGrupoApp[], key: string): string {
  return records.find((record) => record.clave_grupo === key)?.enlace_whatsapp || '';
}

export function babyWhatsappContext(): WhatsappGroupContext {
  return { clave: 'GLOBAL:BABY', modalidad: 'BABY', referencia: 'BABY', nombre: 'WhatsApp familias · Baby' };
}

export function ocioWhatsappContext(): WhatsappGroupContext {
  return { clave: 'GLOBAL:OCIO', modalidad: 'OCIO', referencia: 'OCIO', nombre: 'WhatsApp familias · Ocio' };
}

export function intensiveWhatsappContext(id: string, name: string): WhatsappGroupContext {
  return { clave: `INTENSIVO:${id}`, modalidad: 'INTENSIVOS', referencia: id, nombre: name };
}

export function sessionWhatsappContext(input: {
  sessionId: string;
  modality: string;
  intensiveDays: { sesion_id: string | null; intensivo_id: string }[];
  intensives: { intensivo_id: string; intensivo: string }[];
}): WhatsappGroupContext {
  const modality = normalizeWhatsappGroupKey(input.modality);
  if (modality === 'INTENSIVOS') {
    const day = input.intensiveDays.find((item) => item.sesion_id === input.sessionId);
    if (day?.intensivo_id) {
      const intensive = input.intensives.find((item) => item.intensivo_id === day.intensivo_id);
      return intensiveWhatsappContext(day.intensivo_id, intensive?.intensivo || 'Intensivo');
    }
  }
  return modality === 'OCIO' ? ocioWhatsappContext() : babyWhatsappContext();
}

export function buildWhatsappPreview(input: {
  title: string;
  text: string;
  destinationPhone?: string;
  group?: WhatsappGroupContext & { enlace: string };
}): WhatsappPreviewState {
  if (!input.text.trim()) throw new Error('No hay mensaje de WhatsApp para revisar todavía.');
  return {
    titulo: input.title,
    texto: input.text,
    telefonoDestino: input.destinationPhone || undefined,
    claveGrupoWhatsapp: input.group?.clave,
    modalidadGrupoWhatsapp: input.group?.modalidad,
    referenciaGrupoWhatsapp: input.group?.referencia,
    enlaceGrupoWhatsapp: input.group?.enlace || '',
  };
}

export function cleanTrainerNameForWhatsapp(value: string | null | undefined): string {
  return String(value || '')
    .replace(/^\[TEST[^\]]*\]\s*/i, '')
    .replace(/^TEST\s+NUEVO\s*[·:\-]\s*/i, '')
    .replace(/\s+/g, ' ').trim();
}

export function cleanTrainerNamesForWhatsapp(value: string | null | undefined): string {
  return String(value || '').split('+').map(cleanTrainerNameForWhatsapp).filter(Boolean).join(' + ');
}

/**
 * WhatsApp de escritorio sin la página intermedia de api.whatsapp.com.
 * Convierte un enlace web de WhatsApp (wa.me, api.whatsapp.com/send,
 * chat.whatsapp.com) en el enlace que abre la aplicación directamente
 * (whatsapp://). Devuelve null si no es un enlace de WhatsApp.
 */
export function whatsappDesktopAppUrl(url: string | null | undefined): string | null {
  const texto = String(url || '').trim();
  let enlace: URL;
  try {
    enlace = new URL(texto);
  } catch {
    return null;
  }
  const host = enlace.hostname.toLowerCase();
  const textoMensaje = enlace.searchParams.get('text');
  const conTexto = (base: string) =>
    textoMensaje ? `${base}&text=${encodeURIComponent(textoMensaje)}` : base;

  if (host === 'wa.me' || host === 'www.wa.me') {
    const telefono = enlace.pathname.replace(/\D/g, '');
    if (!telefono) return textoMensaje ? `whatsapp://send?text=${encodeURIComponent(textoMensaje)}` : null;
    return conTexto(`whatsapp://send?phone=${telefono}`);
  }
  if ((host === 'api.whatsapp.com' || host === 'web.whatsapp.com') && /\/send\/?$/.test(enlace.pathname)) {
    const telefono = String(enlace.searchParams.get('phone') || '').replace(/\D/g, '');
    if (!telefono) return textoMensaje ? `whatsapp://send?text=${encodeURIComponent(textoMensaje)}` : null;
    return conTexto(`whatsapp://send?phone=${telefono}`);
  }
  if (host === 'chat.whatsapp.com') {
    const codigo = enlace.pathname.replace(/^\/+/, '').split('/')[0];
    return codigo ? `whatsapp://chat?code=${encodeURIComponent(codigo)}` : null;
  }
  return null;
}
