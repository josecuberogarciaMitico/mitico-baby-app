// WhatsApp a familias desde «Niños sin colocar» (28/10), lógica pura.
// Igual que Paco con las Altas/Test: la app abre WhatsApp con el número y el
// texto ya escritos (con los turnos propuestos) y Jose solo pulsa Enviar.
// Después se apunta la respuesta (aceptan una opción / no pueden) para
// colocar al niño en cuanto confirmen.

import { normalizeWhatsappPhone } from '../../core/communications/whatsappContract';
import { normalizarTelefono, type AlumnoPlan, type OpcionPlan, type UnidadPlan } from './sinColocarPlanner';

export type OpcionEnviada = { sesionId: string; etiqueta: string; familia?: boolean };

export type EstadoPropuesta = 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO' | 'COLOCADO' | 'DESCARTADO';

export type PropuestaGuardada = {
  sesion_alumno_id: string;
  estado: EstadoPropuesta;
  opciones: OpcionEnviada[];
  opcion_aceptada: OpcionEnviada | null;
  updated_at: string;
  /** La familia contestó desde el enlace (no lo apuntó coordinación). */
  respondido_familia_at?: string | null;
  /** La app ya lo pasó sola al día elegido por la familia (sin grupo). */
  movido_at?: string | null;
  token_publico?: string | null;
};

const NUMEROS = ['1️⃣', '2️⃣', '3️⃣'];
const hhmm = (x: string) => String(x || '').slice(0, 5);

export function etiquetaTurnoFamilia(fecha: string, inicio: string, fin: string) {
  const d = new Date(`${fecha}T12:00:00`);
  const dia = d.toLocaleDateString('es-ES', { weekday: 'long' });
  const fechaCorta = d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
  return `${dia} ${fechaCorta} de ${hhmm(inicio)} a ${hhmm(fin)}`;
}

/**
 * Turnos a ofrecer a la familia: otros turnos (nunca el suyo) donde encajan
 * todos los hermanos, sin «No encaja», uno por turno y como mucho 3. El orden
 * ya viene del planificador (mismo día y fin de semana primero).
 */
export function opcionesParaFamilia(u: UnidadPlan, maximo = 3, primera?: OpcionPlan | null): OpcionPlan[] {
  const vistas = new Set<string>();
  const lista: OpcionPlan[] = [];
  // La opción que ha elegido coordinación (si es otro turno) va la primera.
  const orden = primera && !primera.mismoTurno ? [primera, ...u.opciones] : u.opciones;
  for (const o of orden) {
    if (o.mismoTurno || o.estado === 'NO_ENCAJA' || vistas.has(o.sesion.sesionId)) continue;
    // Una opción que separa a los hermanos no se ofrece a la familia.
    if (o.avisos.some((a) => a.startsWith('Separa de su hermano'))) continue;
    vistas.add(o.sesion.sesionId);
    lista.push(o);
    if (lista.length >= maximo) break;
  }
  return lista;
}

/**
 * Todos los turnos que se le podrían ofrecer a la familia (otro turno, sin
 * «No encaja»), también los que separan de un hermano (marcados con aviso):
 * coordinación elige cuáles van en el mensaje.
 */
export function turnosOfrecibles(u: UnidadPlan, maximo = 6): OpcionPlan[] {
  const vistas = new Set<string>();
  const lista: OpcionPlan[] = [];
  for (const o of u.opciones) {
    if (o.mismoTurno || o.estado === 'NO_ENCAJA' || vistas.has(o.sesion.sesionId)) continue;
    vistas.add(o.sesion.sesionId);
    lista.push(o);
    if (lista.length >= maximo) break;
  }
  return lista;
}

/** ¿Hace falta escribir a la familia? Solo si no hay sitio bueno en su turno. */
export function necesitaMensaje(u: UnidadPlan) {
  if (u.bloqueo) return false;
  const enSuTurno = u.opciones.some((o) => o.mismoTurno && o.estado === 'RECOMENDADO');
  return !enSuTurno && opcionesParaFamilia(u).length > 0;
}

/** Niños a los que afecta la propuesta: los sin colocar y, si alguna opción
 * mueve a toda la familia, también sus hermanos ya colocados. */
export function ninosDePropuesta(u: UnidadPlan, opciones: OpcionPlan[] = u.opciones): AlumnoPlan[] {
  const vistos = new Set(u.miembros.map((m) => m.sesionAlumnoId));
  const extra: AlumnoPlan[] = [];
  opciones
    .filter((o) => o.familia)
    .forEach((o) =>
      o.colocaciones.forEach((c) => {
        if (!vistos.has(c.alumno.sesionAlumnoId)) {
          vistos.add(c.alumno.sesionAlumnoId);
          extra.push(c.alumno);
        }
      })
    );
  return [...u.miembros, ...extra];
}

function nombresPila(lista: AlumnoPlan[]) {
  const nombres = lista.map((m) => {
    const p = String(m.alumno || '').trim().toLowerCase().split(/\s+/)[0] || '';
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0];
}

// Código corto para el enlace: el uuid de la propuesta en base64url (22
// letras en vez de 36), para que el WhatsApp lleve un solo enlace corto.
const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export function uuidACorto(uuid: string) {
  const hex = String(uuid || '').replace(/-/g, '').toLowerCase();
  if (!/^[0-9a-f]{32}$/.test(hex)) return '';
  let bits = '';
  for (const c of hex) bits += parseInt(c, 16).toString(2).padStart(4, '0');
  bits += '0000'; // 128 bits → 22 grupos de 6
  let out = '';
  for (let i = 0; i < 132; i += 6) out += B64[parseInt(bits.slice(i, i + 6), 2)];
  return out;
}

export function cortoAUuid(corto: string) {
  const c = String(corto || '').trim();
  if (!/^[A-Za-z0-9_-]{22}$/.test(c)) return '';
  let bits = '';
  for (const ch of c) bits += B64.indexOf(ch).toString(2).padStart(6, '0');
  let hex = '';
  for (let i = 0; i < 128; i += 4) hex += parseInt(bits.slice(i, i + 4), 2).toString(16);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

/** Enlace único de la página pública para elegir turno. */
export function enlaceElegirTurno(base: string, token: string) {
  return `${base.replace(/\/$/, '')}/?t=${uuidACorto(token)}`;
}

function etiquetaCorta(fecha: string, inicio: string, fin: string) {
  const d = new Date(`${fecha}T12:00:00`);
  const dia = d.toLocaleDateString('es-ES', { weekday: 'long' });
  const f = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${f} · ${hhmm(inicio)}–${hhmm(fin)}`;
}

export function textoPropuestaFamilia(u: UnidadPlan, opciones: OpcionPlan[], enlace?: string) {
  const ninos = ninosDePropuesta(u, opciones);
  const quien = nombresPila(ninos);
  const varios = ninos.length > 1;
  const o = u.origen;
  const lineas = opciones.map(
    (op, i) => `${NUMEROS[i] || `${i + 1}.`} ${etiquetaCorta(op.sesion.fecha, op.sesion.hora_inicio, op.sesion.hora_fin)}`
  );
  return (
    `Hola familia 👋 Soy Jose de Mítico\n\n` +
    `El ${etiquetaCorta(o.fecha, o.hora_inicio, o.hora_fin)} no tenemos hueco en un grupo del nivel de ${quien}${varios ? ' (juntos)' : ''}. Os proponemos:\n\n` +
    `${lineas.join('\n')}\n\n` +
    (enlace
      ? `👉 Elegid aquí con un toque:\n${enlace}\n\n(Cualquier cosa que necesitéis me decís 🙂)`
      : `Contestadme con el número y os confirmo el grupo.\n\n(Cualquier cosa que necesitéis me decís 🙂)`)
  );
}

/** Teléfono de la familia: el de la ficha de cualquiera de los hermanos. */
export function telefonoFamilia(u: UnidadPlan, telefonos: Record<string, string | null | undefined>) {
  for (const m of u.miembros) {
    const t = normalizarTelefono(telefonos[m.alumnoId]);
    if (t) return t;
  }
  return '';
}

export function urlWhatsappFamilia(telefono: string, texto: string) {
  const numero = normalizeWhatsappPhone(telefono);
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` : '';
}

/** Propuesta vigente de la familia (la más reciente de cualquiera de los hermanos). */
export function propuestaDeUnidad(u: UnidadPlan, propuestas: PropuestaGuardada[]): PropuestaGuardada | null {
  const ids = new Set(u.miembros.map((m) => m.sesionAlumnoId));
  return (
    propuestas
      .filter((p) => ids.has(p.sesion_alumno_id) && p.estado !== 'DESCARTADO' && p.estado !== 'COLOCADO')
      .sort((a, b) => String(b.updated_at).localeCompare(String(a.updated_at)))[0] || null
  );
}
