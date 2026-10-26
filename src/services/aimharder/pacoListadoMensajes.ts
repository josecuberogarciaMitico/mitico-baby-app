// Mensajes de los botones Baby de AimHarder («Traer listado» y «Refrescar
// listado») contados por Paco, en frases cortas y una idea por línea.
// Lógica pura (sin red ni React) para poder probarla en test:core.
//
// Lo importante que tienen que dejar claro:
//   - cuántos niños tengo ahora y qué ha cambiado;
//   - si la lista puede estar incompleta (AimHarder no tiene «quién va a esta
//     clase»: hay que repasar niño a niño) y cuánto falta para terminar;
//   - qué hacer si hace falta YA (Pegar listado).
import type { BabyAimHarderSafetyApp } from './aimHarderContract';
import type { BabyAddOnlyResult } from './aimHarderOperations';

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const hora = (h: string) => String(h || '').slice(0, 5).replace(/^0(\d)/, '$1');

export function tituloTurnoPaco(fecha: string, inicio: string, fin: string): string {
  const f = String(fecha || '').slice(0, 10);
  const d = new Date(`${f}T12:00:00Z`);
  const dia = Number.isNaN(d.getTime())
    ? f
    : `${DIAS[d.getUTCDay()]} ${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  const horas = inicio ? ` · ${hora(inicio)}${fin ? `–${hora(fin)}` : ''}` : '';
  return `Paco · Baby ${dia}${horas}`;
}

const ninos = (n: number) => `${n} ${n === 1 ? 'niño' : 'niños'}`;
const lista = (nombres: string[]) => nombres.join(', ');

function haceMin(iso: string | null | undefined, ahora: number): number | null {
  if (!iso) return null;
  const t = new Date(String(iso)).getTime();
  if (Number.isNaN(t)) return null;
  return Math.max(0, Math.round((ahora - t) / 60000));
}

function textoHace(min: number): string {
  if (min < 1) return 'hace un momento';
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.round(h / 24)} día(s)`;
}

/** ¿Sigue repasando niños de este turno? */
export function repasoEnCurso(safety: BabyAimHarderSafetyApp | null | undefined): boolean {
  return Number(safety?.repaso?.pendientes) > 0;
}

/**
 * Líneas sobre lo completa que está la lista. `conocidos` = niños activos que
 * tengo ahora mismo para ese turno.
 */
export function lineasFiabilidadPaco(
  safety: BabyAimHarderSafetyApp | null | undefined,
  conocidos: number,
  ahora: number = Date.now()
): string[] {
  if (!safety || safety.sourceKey === 'manual-paste') return [];
  const lineas: string[] = [];

  const reservadas = typeof safety.reservadasAimHarder === 'number' ? safety.reservadasAimHarder : null;
  if (reservadas !== null) {
    if (reservadas > conocidos) {
      lineas.push(`AimHarder dice ${reservadas} reservas y yo tengo ${conocidos}: me faltan ${reservadas - conocidos} por encontrar.`);
    } else if (reservadas === conocidos) {
      lineas.push(`Cuadra con AimHarder: ${reservadas} reservas.`);
    }
  }

  const repaso = safety.repaso;
  if (repaso && repaso.pendientes > 0) {
    const eta = Math.max(1, repaso.etaMin);
    lineas.push(
      `⏳ Estoy comprobando a ${ninos(repaso.pendientes)} que suelen venir a este turno, por si han reservado. ` +
        `Termino en unos ${eta} min y lo actualizo solo (no hace falta que pulses nada).`
    );
  } else if (repaso && repaso.revisar > 0) {
    const min = haceMin(safety.reservasActualizadasAt, ahora);
    lineas.push(
      `✔ He comprobado a todos los que suelen venir (${repaso.revisar})${min !== null ? `, el más antiguo ${textoHace(min)}` : ''}.`
    );
  } else {
    const min = haceMin(safety.reservasActualizadasAt, ahora);
    if (min !== null) lineas.push(`Reservas comprobadas ${textoHace(min)}.`);
  }

  if (!repaso || repaso.pendientes === 0 || (reservadas !== null && reservadas > conocidos)) {
    lineas.push('Si alguien reservó por primera vez hoy y no sale, usa «Pegar listado».');
  }
  return lineas;
}

/** «Traer listado»: solo rellena el cuadro de texto, no toca la sesión. */
export function mensajePacoTraerListado(input: {
  fecha: string;
  inicio: string;
  fin: string;
  activos: number;
  safety: BabyAimHarderSafetyApp | null | undefined;
  ahora?: number;
}): string {
  const lineas = [tituloTurnoPaco(input.fecha, input.inicio, input.fin)];
  if (input.activos > 0) {
    lineas.push(`Tengo ${ninos(input.activos)} apuntados en AimHarder. Ya están en el listado (la sesión no la he tocado).`);
  } else {
    lineas.push('De momento no tengo a nadie apuntado en AimHarder para este turno.');
  }
  const cancelados = input.safety?.cancelledNames || [];
  if (cancelados.length > 0) lineas.push(`Cancelaron (no los pongo): ${lista(cancelados)}.`);
  lineas.push(...lineasFiabilidadPaco(input.safety, input.activos, input.ahora));
  return lineas.join('\n');
}

/** «Refrescar listado» con cambios aplicados a la sesión. */
export function mensajePacoRefresco(input: {
  fecha: string;
  inicio: string;
  fin: string;
  activos: number;
  totalFinal: number;
  anadidos: string[];
  retirados: string[];
  protegidos: string[];
  noEncontrados?: string[];
  safety: BabyAimHarderSafetyApp | null | undefined;
  ahora?: number;
}): string {
  const lineas = [tituloTurnoPaco(input.fecha, input.inicio, input.fin)];
  const hayCambios = input.anadidos.length + input.retirados.length + input.protegidos.length > 0;
  lineas.push(
    hayCambios
      ? `✔ Sesión actualizada: ahora hay ${ninos(input.totalFinal)}.`
      : `✔ Sin cambios: la sesión ya tenía a los ${ninos(input.activos)} de AimHarder.`
  );
  if (input.anadidos.length > 0) lineas.push(`Entran: ${lista(input.anadidos)}.`);
  if (input.retirados.length > 0) lineas.push(`Salen (cancelaron en AimHarder): ${lista(input.retirados)}.`);
  if (input.protegidos.length > 0) {
    lineas.push(`Cancelaron pero NO los quito porque ya tienen asistencia o reporte: ${lista(input.protegidos)}.`);
  }
  if (input.noEncontrados && input.noEncontrados.length > 0) {
    lineas.push(`No encuentro en AimHarder a: ${lista(input.noEncontrados)}. Revisa cómo está escrito el nombre.`);
  }
  lineas.push(...lineasFiabilidadPaco(input.safety, input.activos, input.ahora));
  return lineas.join('\n');
}

/** «Refrescar listado» en modo solo añadir (sesión con grupos ya hechos). */
export function mensajePacoSoloAnadir(input: {
  fecha: string;
  inicio: string;
  fin: string;
  activos: number;
  result: BabyAddOnlyResult;
  noEncontrados?: string[];
  safety: BabyAimHarderSafetyApp | null | undefined;
  ahora?: number;
}): string {
  const r = input.result;
  const lineas = [tituloTurnoPaco(input.fecha, input.inicio, input.fin)];
  lineas.push('Los grupos ya están hechos, así que solo añado a los nuevos y no muevo a nadie de su grupo.');
  if (r.anadidos.length > 0) {
    const sinFicha = r.anadidos.filter((a) => String(a.estado || '').toUpperCase() === 'PENDIENTE_TEST');
    const conFicha = r.anadidos.filter((a) => String(a.estado || '').toUpperCase() !== 'PENDIENTE_TEST');
    if (conFicha.length > 0) {
      lineas.push(
        `Entran en «Pendientes de colocar»: ${conFicha
          .map((a) => `${a.nombre} (nivel ${a.nivel || 'sin nivel: revisa su ficha'})`)
          .join(', ')}.`
      );
    }
    if (sinFicha.length > 0) {
      lineas.push(`Nuevos sin ficha (les falta Alta/Test): ${lista(sinFicha.map((a) => a.nombre))}.`);
    }
  } else {
    lineas.push('No hay nadie nuevo que añadir.');
  }
  if (r.cancelacionesRetiradas.length > 0) lineas.push(`Salen (cancelaron en AimHarder): ${lista(r.cancelacionesRetiradas)}.`);
  if (r.protegidos.length > 0) {
    lineas.push(`Cancelaron pero NO los quito porque ya tienen asistencia o reporte: ${lista(r.protegidos)}.`);
  }
  if (r.siguenSinSalir.length > 0) {
    lineas.push(
      `Siguen en la sesión aunque ahora no me salen en AimHarder (no los quito; ${
        repasoEnCurso(input.safety) ? 'los estoy comprobando' : 'revísalos'
      }): ${lista(r.siguenSinSalir)}.`
    );
  }
  if (r.noAnadidos.length > 0) lineas.push(`No los he podido añadir yo (usa «+ Alumno fuera de plazo»): ${lista(r.noAnadidos)}.`);
  if (r.nivelesRecalculados.length > 0) {
    lineas.push(
      `He puesto el nivel de su ficha: ${r.nivelesRecalculados
        .map((x) => `${x.nombre} (${x.antes || '-'} → ${x.despues || '-'})`)
        .join(', ')}.`
    );
  }
  if (input.noEncontrados && input.noEncontrados.length > 0) {
    lineas.push(`No encuentro en AimHarder a: ${lista(input.noEncontrados)}. Revisa cómo está escrito el nombre.`);
  }
  lineas.push(...lineasFiabilidadPaco(input.safety, input.activos, input.ahora));
  return lineas.join('\n');
}

/** Error del refresco, contado igual de claro. */
export function mensajePacoError(fecha: string, inicio: string, fin: string, detalle: string): string {
  return `${tituloTurnoPaco(fecha, inicio, fin)}\n✖ No he cambiado nada. ${detalle}`;
}
