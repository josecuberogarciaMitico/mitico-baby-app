import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';
import { comprobarAccesoPaco, tokenSesionPacoActual } from './pacoClient';

// Cliente de la seccion "Respuestas" de Paco. Habla solo con la funcion
// mitico-paco-padres (que redacta y guarda lo que Paco aprende de Jose).
// Paco NUNCA envia nada: solo deja el texto listo para copiar.

const ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-padres`;

export type RespModo = 'respuesta' | 'notas';
export type RespDestino = 'familias' | 'entrenadores';

// Borrador tal y como lo devuelve el servidor; se reenvia para pedir cambios.
export type RespBorrador = {
  mensaje: string;
  respuesta: string;
  hechos: string;
  nino: string | null;
  instruccion: string | null;
  modo: RespModo;
  destino: RespDestino;
};

export type RespOpcion = { label: string; continuation: unknown };

export type RespRedaccion = {
  // Texto listo para copiar (null si Paco necesita que elijas un nino).
  texto: string | null;
  // Lo que Paco dice: avisos, tema delicado, pregunta...
  mensajePaco: string;
  borrador: RespBorrador | null;
  opciones: RespOpcion[];
};

export type RespEjemplo = {
  id: string;
  mensaje_familia: string;
  borrador_paco: string | null;
  respuesta_final: string;
  tipo: 'aprobada' | 'corregida' | 'manual';
  modo: RespModo;
  destino: RespDestino;
  created_at: string;
};

export type RespRegla = {
  id: string;
  regla: string;
  origen: 'detectada' | 'manual';
  activa: boolean;
  destino: 'todos' | RespDestino;
  created_at: string;
};

export type RespAprendizaje = { reglas: RespRegla[]; ejemplos: RespEjemplo[] };

export type RespGuardado = {
  tipo: 'aprobada' | 'corregida';
  regla: { id: string; regla: string } | null;
};

async function llamar(payload: Record<string, unknown>) {
  await comprobarAccesoPaco();
  const token = tokenSesionPacoActual();
  if (!token) throw new Error('Tu sesión ha caducado. Vuelve a entrar.');

  const respuesta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const texto = await respuesta.text();
  let datos: any = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  if (!respuesta.ok || datos?.ok === false) {
    throw new Error(
      String(
        datos?.error ||
          (respuesta.status === 403
            ? 'Acceso restringido a coordinador jefe.'
            : 'Paco no ha podido responder ahora mismo. Inténtalo de nuevo.')
      )
    );
  }
  return datos;
}

function aRedaccion(datos: any): RespRedaccion {
  if (!datos || datos.handled === false) {
    throw new Error('Paco no ha entendido el mensaje. Inténtalo de nuevo.');
  }
  const opciones: RespOpcion[] = Array.isArray(datos.choices)
    ? datos.choices
        .filter((c: any) => c && typeof c.label === 'string' && c.continuation)
        .map((c: any) => ({ label: c.label, continuation: c.continuation }))
    : [];
  const borrador =
    datos.padre_draft && typeof datos.padre_draft === 'object'
      ? (datos.padre_draft as RespBorrador)
      : null;
  return {
    texto: typeof datos.respuesta_familia?.texto === 'string' ? datos.respuesta_familia.texto : null,
    mensajePaco: typeof datos.answer === 'string' ? datos.answer : '',
    borrador,
    opciones,
  };
}

// Pegar un mensaje de una familia (modo "respuesta") o tus notas sueltas (modo "notas").
export async function redactarMensaje(entrada: {
  texto: string;
  modo: RespModo;
  destino: RespDestino;
}) {
  return aRedaccion(
    await llamar({
      message: entrada.texto,
      modo: entrada.modo,
      destino: entrada.modo === 'notas' ? entrada.destino : 'familias',
      forzar: true,
    })
  );
}

// "Dile que sí", "más corto", "quita lo del seguro"...
export async function pedirCambio(borrador: RespBorrador, peticion: string) {
  return aRedaccion(await llamar({ message: peticion, padre_draft: borrador, revision: true }));
}

// Botones que devuelve Paco (elegir nino, mas corta/calida/firme).
export async function elegirOpcion(opcion: RespOpcion) {
  return aRedaccion(await llamar({ continuation: opcion.continuation }));
}

// "Esta bien" o "esta es mi version": Paco guarda el ejemplo y, si cambiaste
// algo, intenta sacar una regla de estilo.
export async function guardarVersionFinal(entrada: {
  borrador: RespBorrador;
  textoFinal: string;
}): Promise<RespGuardado> {
  const datos = await llamar({
    action: 'feedback',
    mensaje: entrada.borrador.mensaje,
    borrador: entrada.borrador.respuesta,
    final: entrada.textoFinal,
    modo: entrada.borrador.modo,
    destino: entrada.borrador.destino,
  });
  return { tipo: datos.tipo === 'aprobada' ? 'aprobada' : 'corregida', regla: datos.regla || null };
}

export async function listarAprendizaje(): Promise<RespAprendizaje> {
  const datos = await llamar({ action: 'aprendizaje_listar' });
  return {
    reglas: Array.isArray(datos.reglas) ? datos.reglas : [],
    ejemplos: Array.isArray(datos.ejemplos) ? datos.ejemplos : [],
  };
}

export async function guardarEjemploManual(entrada: {
  mensaje: string;
  final: string;
  modo: RespModo;
  destino: RespDestino;
}) {
  await llamar({ action: 'ejemplo_guardar', ...entrada });
}

export async function borrarEjemplo(id: string) {
  await llamar({ action: 'ejemplo_borrar', id });
}

export async function guardarReglaManual(regla: string, destino: 'todos' | RespDestino) {
  await llamar({ action: 'regla_guardar', regla, destino });
}

export async function activarRegla(id: string, activa: boolean) {
  await llamar({ action: 'regla_estado', id, activa });
}

export async function borrarRegla(id: string) {
  await llamar({ action: 'regla_borrar', id });
}
