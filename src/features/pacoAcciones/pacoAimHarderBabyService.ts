// Paco · volcar AimHarder en Baby (acceso a datos).
//
// LECTURA de AimHarder: la misma función segura que usa la Agenda
// (mitico-aimharder-baby-read), con la sesión de Jose y los mismos pasos:
// centro → clases de la semana → asistentes de cada turno.
// ESCRITURA: solo las dos funciones que ya usa «Cargar semana Baby» de la Agenda
// (cargar_sesion_baby_aimharder_inicial_app y refrescar_sesion_baby_aimharder_app).
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { normalizeRosterName } from '../../core/sessions/rosterSync';
import { obtenerAccessTokenSupabaseApp } from '../../services/auth/authService';
import {
  babyClassHours,
  normalizeBabyAttendees,
  selectMiticoBox,
  uniqueBabyClasses,
  type AimHarderBox,
  type BabyAimHarderClaseApp,
  type BabyAimHarderSafetyApp,
} from '../../services/aimharder/aimHarderContract';
import { planBabyWeekSlots } from '../../services/aimharder/aimHarderOperations';
import { createSupabaseRestClient } from '../../services/supabase/restClient';
import { addIsoDays, isBabyAgendaSession } from '../agenda/agendaRelocation';
import type { AgendaAlumnoSesionApp, AgendaSesionDirectaApp } from '../agenda/agendaTypes';
import type { ConocimientoAlumno, SesionExistente, TurnoAimHarder } from './pacoAimHarderBabyLogic';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

const FUNCION_LECTURA = 'mitico-aimharder-baby-read';

function hora(valor: unknown) {
  return String(valor ?? '').slice(0, 5);
}

type LecturaAim = {
  turnos: TurnoAimHarder[];
  incidencias: string[];
  consultas: number;
};

// Lee de AimHarder los turnos Baby de la semana y sus niños activos. Un turno que
// falla o es ambiguo NO se vuelca: se anota como incidencia y se sigue con los demás.
export async function leerSemanaBabyAimHarder(semanaInicio: string): Promise<LecturaAim> {
  let consultas = 0;
  const llamar = async <T>(cuerpo: Record<string, unknown>) => {
    consultas += 1;
    return supabase.edgeJson<T>(FUNCION_LECTURA, cuerpo);
  };

  const boxes = await llamar<{ boxes?: AimHarderBox[] }>({ action: 'boxes' });
  const box = selectMiticoBox(Array.isArray(boxes?.boxes) ? boxes.boxes : []);
  const semana = await llamar<{ classes?: BabyAimHarderClaseApp[] }>({
    action: 'week',
    weekStart: semanaInicio,
    boxId: Number(box.boid),
  });
  const clases = uniqueBabyClasses(Array.isArray(semana?.classes) ? semana.classes : []);
  const plan = planBabyWeekSlots(clases);
  const incidencias = [...plan.issues];
  const turnos: TurnoAimHarder[] = [];

  for (const slot of plan.slots) {
    // Solo los turnos de ESTA semana (AimHarder a veces devuelve días de más).
    if (slot.date < semanaInicio || slot.date > addIsoDays(semanaInicio, 6)) continue;
    const clase = slot.classData;
    try {
      const horas = babyClassHours(clase);
      const detalle = await llamar<{
        attendees?: unknown;
        total?: unknown;
        safety?: BabyAimHarderSafetyApp;
      }>({
        action: 'attendees',
        date: String(clase.date || '').slice(0, 10),
        classId: Number(clase.id),
        className: String(clase.className || ''),
        time: String(clase.time || ''),
        timeid: String(clase.timeid || ''),
        boxId: Number(box.boid),
      });
      const asistentes = normalizeBabyAttendees(detalle?.attendees, detalle?.total);
      const safety = detalle?.safety && typeof detalle.safety === 'object' ? detalle.safety : {};
      turnos.push({
        fecha: slot.date,
        inicio: horas.inicio,
        fin: horas.fin,
        nombres: asistentes.map((a) => a.name),
        cancelados: Array.isArray(safety.cancelledNames) ? safety.cancelledNames : [],
        safeZero: safety.safeZero === true,
      });
    } catch (error) {
      const status = (error as { status?: number } | null)?.status;
      if (status === 401 || status === 403) throw error;
      incidencias.push(
        `${slot.date} ${slot.start}: ${error instanceof Error ? error.message : 'No se pudo leer este turno.'}`
      );
    }
  }
  turnos.sort((a, b) => `${a.fecha} ${a.inicio}`.localeCompare(`${b.fecha} ${b.inicio}`));
  return { turnos, incidencias, consultas };
}

// Turnos Baby que ya tiene la app esa semana, con su lista de niños.
export async function leerSesionesBabySemana(semanaInicio: string): Promise<SesionExistente[]> {
  const hasta = addIsoDays(semanaInicio, 6);
  const sesiones = (
    await supabase.query<AgendaSesionDirectaApp>(
      'v_agenda_sesiones_operativa_app',
      `select=*&fecha=gte.${semanaInicio}&fecha=lte.${hasta}&order=fecha.asc,hora_inicio.asc`
    )
  ).filter((s) => isBabyAgendaSession(s));
  if (!sesiones.length) return [];
  const ids = sesiones.map((s) => s.sesion_id);
  const alumnos = await supabase.query<AgendaAlumnoSesionApp>(
    'v_sesion_alumnos_operativa_app',
    `select=*&sesion_id=${encodeURIComponent(`in.(${ids.join(',')})`)}&order=orden.asc`
  );
  return sesiones.map((s) => ({
    sesion_id: s.sesion_id,
    fecha: String(s.fecha).slice(0, 10),
    inicio: hora(s.hora_inicio),
    fin: hora(s.hora_fin),
    roster: alumnos
      .filter((a) => a.sesion_id === s.sesion_id)
      .map((a) => ({ id: a.sesion_alumno_id, name: a.alumno })),
  }));
}

export async function leerRosterSesion(sesionId: string): Promise<{ id: string; name: string }[]> {
  const filas = await supabase.query<AgendaAlumnoSesionApp>(
    'v_sesion_alumnos_operativa_app',
    `select=*&sesion_id=${encodeURIComponent(`eq.${sesionId}`)}&order=orden.asc`
  );
  return filas.map((a) => ({ id: a.sesion_alumno_id, name: a.alumno }));
}

// Qué nombres de AimHarder ya son alumnos de la app (mismo criterio que la base de
// datos al cargar el listado: nombre normalizado; los «pendiente de test» cuentan como nuevos).
export async function leerConocimientoAlumnos(): Promise<ConocimientoAlumno> {
  const filas = await supabase.query<{
    nombre_normalizado: string | null;
    activo: boolean | null;
    estado_ficha: string | null;
    semilla_temporada_origen: unknown;
  }>('alumnos', 'select=nombre_normalizado,activo,estado_ficha,semilla_temporada_origen&limit=5000');
  const mapa: ConocimientoAlumno = new Map();
  for (const f of filas) {
    const clave = normalizeRosterName(f.nombre_normalizado);
    if (!clave) continue;
    const pendiente = f.activo === false && f.estado_ficha === 'revisar' && f.semilla_temporada_origen == null;
    // Si hay dos fichas con el mismo nombre, una conocida basta (la base prefiere las activas).
    if (!pendiente) mapa.set(clave, 'conocido');
    else if (!mapa.has(clave)) mapa.set(clave, 'pendiente_test');
  }
  return mapa;
}

export type ResultadoCrear = {
  sesion_id?: string | null;
  creada?: boolean;
  ya_existia?: boolean;
  sin_reservas?: boolean;
  total_actual?: number;
};

export async function crearTurnoDesdeAimHarder(input: {
  fecha: string;
  inicio: string;
  fin: string;
  nombres: string[];
}): Promise<ResultadoCrear> {
  return supabase.rpcJson<ResultadoCrear>('cargar_sesion_baby_aimharder_inicial_app', {
    p_fecha: input.fecha,
    p_hora_inicio: input.inicio,
    p_hora_fin: input.fin,
    p_lugar: 'Madrid SnowZone',
    p_texto_listado: input.nombres.join('\n'),
  });
}

export type ResultadoRefresco = {
  nuevos?: number;
  retirados?: number;
  protegidos?: number;
  nombres_nuevos?: string[];
  nombres_retirados?: string[];
  total_actual?: number;
};

export async function anadirNinosATurno(sesionId: string, nombres: string[]): Promise<ResultadoRefresco> {
  return supabase.rpcJson<ResultadoRefresco>('refrescar_sesion_baby_aimharder_app', {
    p_sesion_id: sesionId,
    p_texto_listado: nombres.join('\n'),
  });
}
