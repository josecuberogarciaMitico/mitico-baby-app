// Paco · «¿qué puedes hacer?» (lógica pura, sin red).
//
// Antes, preguntas como «¿puedes mover a algún niño?» o «cárgame AimHarder»
// caían en el Paco general, que contestaba «no tengo permisos» aunque la
// acción existiera (o inventaba que no podía algo que simplemente aún no está
// construido). Aquí se contesta con la verdad: qué sabe hacer hoy, y qué NO.
import { sinTildes } from './pacoAccionesLogic';

const LISTA_SABE = [
  '· Decirle qué niños de Baby están sin grupo o sin nivel: «niños sin grupo».',
  '· Pasar a un niño de turno: «pasa a Lucía García al jueves a las 17:00».',
  '· Preparar y enviar la disponibilidad de la semana: «prepara la disponibilidad quitando el domingo de las 12» y «manda la disponibilidad».',
  '· Traer de AimHarder los turnos y niños de Baby de una semana: «carga la semana que viene de AimHarder». Primero le enseño qué turnos crearía y a quién añadiría; no quito a nadie nunca.',
  '· Altas de test, Secretaría, consultas de la semana y redactar mensajes, como hasta ahora.',
].join('\n');

const LISTA_NO_SABE =
  'Todavía NO sé: cargar AimHarder de Ocio, crear grupos, ni mover niños de Ocio. Está en preparación y prefiero decírselo antes que fingir que puedo.';

// Peticiones de volcado de AimHarder: aún no existen, y no deben acabar en «no tengo permisos».
export function parecePeticionAimHarder(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase();
  if (n.length > 300) return false;
  const aim = /\b(aim ?harder|aimhander|aimarder|aim harder)\b/.test(n);
  const verbo = /\b(carga|cargar|cargame|cargalo|vuelca|volcar|volcado|importa|importar|trae|traer|sube|subir|copia|copiar|actualiza|actualizar)\b/.test(n);
  return aim && verbo;
}

// Preguntas sobre sus capacidades: «¿qué puedes hacer?», «¿puedes mover a algún niño?».
export function parecePreguntaCapacidades(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase().trim();
  if (n.length > 140) return false;
  if (/\b(que|qué)\s+(puedes|sabes|eres capaz de|haces|sabes hacer)\b/.test(n)) return true;
  if (/\bque puedes hacer\b|\bque sabes hacer\b|\bpara que sirves\b|\bayuda\b\s*$/.test(n)) return true;
  // «¿puedes mover a algún niño?» sin decir a quién ni adónde: es una pregunta, no una orden.
  return (
    /\b(puedes|sabes|podrias|eres capaz de)\b/.test(n) &&
    /\b(mover|pasar|cambiar|colocar|cargar|crear|enviar|mandar|publicar|preparar)\b/.test(n) &&
    !/\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|\d{1,2}[:.]\d{2}|a las \d{1,2})\b/.test(n)
  );
}

export function respuestaCapacidades(mensaje: string): string {
  const n = sinTildes(mensaje).toLowerCase();
  if (/\b(mover|pasar|cambiar|colocar)\b/.test(n) && /\b(nino|ninos|alumno|alumnos|alguien|crio)\b/.test(n)) {
    return 'Sí, señor Cubero: puedo pasar a un niño de Baby a otro turno de la misma semana, pero necesito saber a quién y adónde. Dígame, por ejemplo: «pasa a Lucía García al jueves a las 17:00». Antes de tocar nada le enseño lo que voy a hacer y espero su confirmación.\n\nPor ahora solo muevo de turno a niños que están sin grupo (para sacar a alguien de un grupo, hágalo desde la Agenda), y solo en Baby. Los de Ocio todavía no.';
  }
  return `Esto es lo que sé hacer sobre la app, señor Cubero (siempre le pido confirmación antes de cambiar nada):\n${LISTA_SABE}\n\n${LISTA_NO_SABE}`;
}

export function respuestaAimHarderNoDisponible(): string {
  return 'Cargar los listados de AimHarder de Ocio desde aquí todavía no lo sé hacer, señor Cubero; no es un tema de permisos, es que aún no está construido. Lo de Baby sí: dígame «carga la semana que viene de AimHarder». De momento Ocio se hace como siempre desde la Agenda / Ocio. No he tocado nada.';
}

// Una orden de cambiar datos que Paco aún no sabe hacer: se dice claro, sin «no tengo permisos».
export function respuestaOrdenNoSoportada(): string {
  return `Eso todavía no sé hacerlo desde aquí, señor Cubero, y no he cambiado nada. No es un tema de permisos: simplemente aún no está construido. Lo he apuntado para tenerlo en cuenta.\n\nLo que sí sé hacer (siempre con su confirmación antes de tocar nada):\n${LISTA_SABE}\n\n${LISTA_NO_SABE}`;
}
