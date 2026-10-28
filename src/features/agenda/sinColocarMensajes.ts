// WhatsApp a familias desde «Niños sin colocar» (28/10), lógica pura.
// Igual que Paco con las Altas/Test: la app abre WhatsApp con el número y el
// texto ya escritos (con los turnos propuestos) y Jose solo pulsa Enviar.
// Después se apunta la respuesta (aceptan una opción / no pueden) para
// colocar al niño en cuanto confirmen.

import { normalizeWhatsappPhone } from '../../core/communications/whatsappContract';
import { normalizarTelefono, type OpcionPlan, type UnidadPlan } from './sinColocarPlanner';

export type OpcionEnviada = { sesionId: string; etiqueta: string };

export type EstadoPropuesta = 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO' | 'COLOCADO' | 'DESCARTADO';

export type PropuestaGuardada = {
  sesion_alumno_id: string;
  estado: EstadoPropuesta;
  opciones: OpcionEnviada[];
  opcion_aceptada: OpcionEnviada | null;
  updated_at: string;
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
export function opcionesParaFamilia(u: UnidadPlan, maximo = 3): OpcionPlan[] {
  const vistas = new Set<string>();
  const lista: OpcionPlan[] = [];
  for (const o of u.opciones) {
    if (o.mismoTurno || o.estado === 'NO_ENCAJA' || vistas.has(o.sesion.sesionId)) continue;
    // Una opción que separa a los hermanos no se ofrece a la familia.
    if (o.avisos.some((a) => a.startsWith('Separa de su hermano'))) continue;
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

function nombresPila(u: UnidadPlan) {
  const nombres = u.miembros.map((m) => {
    const p = String(m.alumno || '').trim().toLowerCase().split(/\s+/)[0] || '';
    return p.charAt(0).toUpperCase() + p.slice(1);
  });
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0];
}

export function textoPropuestaFamilia(u: UnidadPlan, opciones: OpcionPlan[]) {
  const quien = nombresPila(u);
  const varios = u.miembros.length > 1;
  const origen = etiquetaTurnoFamilia(u.origen.fecha, u.origen.hora_inicio, u.origen.hora_fin);
  const lineas = opciones.map(
    (o, i) => `${NUMEROS[i] || `${i + 1}.`} ${etiquetaTurnoFamilia(o.sesion.fecha, o.sesion.hora_inicio, o.sesion.hora_fin)}`
  );
  return (
    `Hola familia 👋 Os escribimos de Mítico Baby.\n\n` +
    `Para el ${origen} no tenemos hueco en un grupo del nivel de ${quien}` +
    `${varios ? ' (juntos)' : ''}. Para que ${varios ? 'puedan entrenar' : 'pueda entrenar'} bien esta semana os proponemos:\n\n` +
    `${lineas.join('\n')}\n\n` +
    `¿Os viene bien alguna? Contestadnos con el número y os confirmamos el grupo. ¡Gracias!`
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
