export type DisponibilidadEntrenador = {
  id: string;
  semana: string;
  fecha_inicio: string;
  fecha_fin: string;
  entrenador_id: string;
  entrenador: string;
  estado_disponibilidad: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_turno: string;
  respuesta: string | null;
  comentario: string | null;
  aviso_enviado: boolean;
  aviso_enviado_at: string | null;
  fecha_limite: string | null;
  especialidades: string[] | null;
  fuente?: 'editor';
};


export type ModalidadDisponibilidadEditor = 'Baby' | 'Ocio' | 'Intensivos';

export type TurnoDisponibilidadEditor = {
  id: string;
  hora_inicio: string;
  hora_fin: string;
  modalidades: ModalidadDisponibilidadEditor[];
  nota: string;
};

export type DiaDisponibilidadEditor = {
  fecha: string;
  nombre: string;
  activo: boolean;
  turnos: TurnoDisponibilidadEditor[];
};

export type BorradorDisponibilidadEditor = {
  version: 1;
  semana_inicio: string;
  fecha_limite: string;
  fecha_limite_manual?: boolean;
  estado: 'Borrador';
  actualizado_en: string | null;
  dias: DiaDisponibilidadEditor[];
};

export type EstadoServidorDisponibilidadEditor =
  | 'sin_preparar'
  | 'borrador'
  | 'publicado';

export type RespuestaDisponibilidadEditorServidor = {
  existe: boolean;
  semana_inicio: string;
  estado: EstadoServidorDisponibilidadEditor;
  fuente: 'plantilla' | 'borrador' | 'publicado';
  fecha_limite: string | null;
  publicada_at: string | null;
  version_publicada: number;
  actualizado_en?: string | null;
  dias: DiaDisponibilidadEditor[];
};

export type RespuestaDisponibilidadPublicadaEntrenadoresEditor = {
  gestionada: boolean;
  existe: boolean;
  semana_inicio: string;
  estado: 'sin_preparar' | 'sin_publicar' | 'publicado';
  fecha_limite?: string | null;
  publicada_at: string | null;
  version_publicada: number;
  turnos: DisponibilidadEntrenador[];
};

export function idTurnoDisponibilidadEditor() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `turno-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function fechaIsoEditor(fecha: Date) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function sumarDiasEditor(fechaIso: string, dias: number) {
  const fecha = new Date(`${fechaIso}T12:00:00`);
  fecha.setDate(fecha.getDate() + dias);
  return fechaIsoEditor(fecha);
}

export function fechaLimiteAutomaticaDisponibilidadEditor(semanaInicio: string) {
  // Las semanas del calendario de temporada comienzan siempre en lunes.
  // La disponibilidad se cierra automáticamente el martes de esa semana a las 13:00.
  return `${sumarDiasEditor(semanaInicio, 1)}T13:00`;
}

export function turnoEditor(
  hora_inicio: string,
  hora_fin: string,
  modalidades: ModalidadDisponibilidadEditor[]
): TurnoDisponibilidadEditor {
  return {
    id: idTurnoDisponibilidadEditor(),
    hora_inicio,
    hora_fin,
    modalidades,
    nota: '',
  };
}

export function diaPermiteVariosTurnosDisponibilidadEditor(nombre: string) {
  const dia = nombre.trim().toLowerCase();
  return dia === 'sábado' || dia === 'domingo';
}

export function turnoInicialDisponibilidadEditor(
  nombreDia: string
): TurnoDisponibilidadEditor {
  const dia = nombreDia.trim().toLowerCase();
  if (dia === 'sábado' || dia === 'domingo') {
    return turnoEditor('09:45', '11:45', ['Baby', 'Ocio']);
  }
  return turnoEditor('18:00', '20:00', ['Baby']);
}

export function crearBorradorDisponibilidadEditor(
  semanaInicio: string
): BorradorDisponibilidadEditor {
  const diasConfigurados: Array<{
    nombre: string;
    offset: number;
    turnos: TurnoDisponibilidadEditor[];
  }> = [
    {
      nombre: 'miércoles',
      offset: 2,
      turnos: [turnoEditor('18:00', '20:00', ['Baby'])],
    },
    {
      nombre: 'jueves',
      offset: 3,
      turnos: [turnoEditor('18:00', '20:00', ['Baby'])],
    },
    {
      nombre: 'viernes',
      offset: 4,
      turnos: [turnoEditor('18:00', '20:00', ['Baby'])],
    },
    {
      nombre: 'sábado',
      offset: 5,
      turnos: [
        turnoEditor('09:45', '11:45', ['Baby', 'Ocio']),
        turnoEditor('12:00', '14:00', ['Baby', 'Ocio']),
        turnoEditor('14:30', '16:30', ['Intensivos']),
      ],
    },
    {
      nombre: 'domingo',
      offset: 6,
      turnos: [
        turnoEditor('09:45', '11:45', ['Baby', 'Ocio']),
        turnoEditor('12:00', '14:00', ['Baby', 'Ocio']),
      ],
    },
  ];

  return {
    version: 1,
    semana_inicio: semanaInicio,
    fecha_limite: fechaLimiteAutomaticaDisponibilidadEditor(semanaInicio),
    fecha_limite_manual: false,
    estado: 'Borrador',
    actualizado_en: null,
    dias: diasConfigurados.map((dia) => ({
      fecha: sumarDiasEditor(semanaInicio, dia.offset),
      nombre: dia.nombre,
      activo: true,
      turnos: dia.turnos,
    })),
  };
}

export function normalizarBorradorDisponibilidadEditor(
  borrador: BorradorDisponibilidadEditor
): BorradorDisponibilidadEditor {
  const plantilla = crearBorradorDisponibilidadEditor(borrador.semana_inicio);
  const guardadosPorNombre = new Map(
    (borrador.dias || []).map((dia) => [dia.nombre.toLowerCase(), dia])
  );

  const fechaLimiteManual = borrador.fecha_limite_manual === true;

  return {
    ...borrador,
    fecha_limite:
      fechaLimiteManual && borrador.fecha_limite
        ? borrador.fecha_limite
        : fechaLimiteAutomaticaDisponibilidadEditor(borrador.semana_inicio),
    fecha_limite_manual: fechaLimiteManual,
    dias: plantilla.dias.map((diaPlantilla) => {
      const guardado = guardadosPorNombre.get(diaPlantilla.nombre);
      if (!guardado) return diaPlantilla;

      const turnosGuardados = Array.isArray(guardado.turnos)
        ? guardado.turnos
        : [];
      const turnosNormalizados =
        turnosGuardados.length > 0
          ? diaPermiteVariosTurnosDisponibilidadEditor(diaPlantilla.nombre)
            ? turnosGuardados
            : turnosGuardados.slice(0, 1)
          : [];

      return {
        ...diaPlantilla,
        activo: Boolean(guardado.activo),
        turnos: turnosNormalizados,
      };
    }),
  };
}

export function normalizarBorradorDisponibilidadEditorServidor(
  respuesta: RespuestaDisponibilidadEditorServidor
): BorradorDisponibilidadEditor {
  const plantilla = crearBorradorDisponibilidadEditor(respuesta.semana_inicio);
  const diasServidor = new Map(
    (respuesta.dias || []).map((dia) => [dia.fecha, dia])
  );

  return {
    ...plantilla,
    fecha_limite:
      respuesta.fecha_limite ||
      fechaLimiteAutomaticaDisponibilidadEditor(respuesta.semana_inicio),
    fecha_limite_manual:
      Boolean(respuesta.fecha_limite) &&
      respuesta.fecha_limite !==
        fechaLimiteAutomaticaDisponibilidadEditor(respuesta.semana_inicio),
    actualizado_en: respuesta.actualizado_en || respuesta.publicada_at || null,
    dias: plantilla.dias.map((diaPlantilla) => {
      const diaServidor = diasServidor.get(diaPlantilla.fecha);
      if (!diaServidor) {
        return { ...diaPlantilla, activo: false, turnos: [] };
      }

      const turnos = Array.isArray(diaServidor.turnos)
        ? diaServidor.turnos
        : [];

      return {
        ...diaPlantilla,
        activo: Boolean(diaServidor.activo),
        turnos: diaPermiteVariosTurnosDisponibilidadEditor(
          diaPlantilla.nombre
        )
          ? turnos
          : turnos.slice(0, 1),
      };
    }),
  };
}

export function claveStorageDisponibilidadEditor(semanaInicio: string) {
  return `mitico_disponibilidad_editor_v1_${semanaInicio}`;
}

function capitalized(value: string): string {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;
}

export function validarBorradorDisponibilidadEditor(
  borrador: BorradorDisponibilidadEditor
): string | null {
  const diasActivos = borrador.dias.filter((dia) => dia.activo);
  if (diasActivos.length === 0) return 'Activa al menos un día antes de guardar.';

  for (const dia of diasActivos) {
    if (dia.turnos.length === 0) return `${capitalized(dia.nombre)} está activo pero no tiene turnos.`;
    if (!diaPermiteVariosTurnosDisponibilidadEditor(dia.nombre) && dia.turnos.length > 1) {
      return `${capitalized(dia.nombre)} solo puede tener un turno.`;
    }
    for (const turno of dia.turnos) {
      if (!turno.hora_inicio || !turno.hora_fin) return `Completa el horario de ${dia.nombre}.`;
      if (turno.hora_fin <= turno.hora_inicio) return `La hora final de ${dia.nombre} debe ser posterior a la inicial.`;
      if (turno.modalidades.length === 0) return `Selecciona al menos una modalidad en ${dia.nombre}.`;
    }
  }
  if (!borrador.fecha_limite) return 'La fecha límite para responder es obligatoria.';
  return null;
}
