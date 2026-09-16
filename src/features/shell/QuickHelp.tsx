import React from 'react';

type QuickHelpProps = {
  pantalla: string;
};

export function QuickHelp({ pantalla }: QuickHelpProps) {
    if (pantalla === 'inicio' || pantalla === 'disponibilidad') return null;

    const ayudas: Partial<
      Record<
        string,
        {
          titulo: string;
          descripcion: string;
          pasos: string[];
          aviso?: string;
        }
      >
    > = {
      resumenDia: {
        titulo: 'Trabajo en pista',
        descripcion:
          'Orden recomendado para preparar y revisar el trabajo real del día.',
        pasos: [
          'Comprueba fecha, turnos, grupos, alumnos y entrenadores antes de tocar nada.',
          'Resuelve primero alumnos sin grupo, ratios, entrenador pendiente y cualquier incidencia operativa.',
          'Si la realidad cambia en pista, usa “Mover alumno” o “Añadir alumno hoy”: el listado del entrenador y el responsable del reporte se actualizan con el cambio.',
          'Revisa que el trabajo diario de cada grupo encaje con nivel, pista y evolución reciente.',
          'Deja la información visible para el entrenador preparada antes de dar la jornada por lista.',
        ],
      },
      agenda: {
        titulo: 'Entrenamientos',
        descripcion:
          'Flujo para pasar del listado recibido a una sesión operativa y publicable.',
        pasos: [
          'Abre o crea la sesión con fecha, turno y modalidad correctos.',
          'Carga el listado y resuelve nombres, altas y niveles dudosos.',
          'Revisa la recomendación de grupos: nivel, pista, ratios y compatibilidades.',
          'Ajusta alumnos, entrenadores, punto de encuentro o composición cuando la realidad lo pida.',
          'Publica únicamente cuando grupos, entrenadores y alumnos estén revisados.',
        ],
        aviso: 'Publicar es el último paso, no el primero.',
      },
      ocioGrupos: {
        titulo: 'Ocio · grupos estables',
        descripcion:
          'Flujo para mantener grupos estables coherentes y preparar su operativa.',
        pasos: [
          'Comprueba alumnos, nivel real y día fijo antes de modificar grupos.',
          'Revisa horario, pista, punto de encuentro, nivel y número de alumnos de cada grupo estable.',
          'Usa la propuesta como apoyo y corrige según nivel, edad y ritmo real.',
          'Guarda solo el grupo correcto y evita duplicados innecesarios.',
        ],
      },
      ocioCambios: {
        titulo: 'Ocio · cambios puntuales',
        descripcion:
          'Flujo para recolocar a un alumno un día concreto sin romper su grupo estable.',
        pasos: [
          'Selecciona el alumno y confirma la fecha concreta del cambio.',
          'Revisa destinos compatibles por nivel, horario, pista, ratio y plazas.',
          'Guarda el cambio puntual sin modificar el grupo estable del alumno.',
          'Comprueba después que el alumno aparece una sola vez y en el grupo correcto.',
        ],
      },
      ocioSemana: {
        titulo: 'Ocio · semana',
        descripcion:
          'Flujo para convertir grupos estables y cambios puntuales en la semana real.',
        pasos: [
          'Selecciona la semana correcta de temporada.',
          'Prepara las sesiones previstas para cada día.',
          'Aplica cambios puntuales, ausencias y altas antes de publicar.',
          'Revisa entrenador, ratio y composición de cada grupo.',
          'Publica solo cuando la semana coincida con lo que se ejecutará en pista.',
        ],
      },
      ocioAlumnos: {
        titulo: 'Ocio · alumnos',
        descripcion:
          'Flujo para mantener la ficha operativa de los alumnos de Ocio.',
        pasos: [
          'Localiza al alumno y comprueba nombre, nivel y grupo estable.',
          'Revisa el nivel real confirmado y posibles discrepancias con reportes recientes.',
          'Modifica solo los datos necesarios para que el alumno quede correctamente agrupable.',
          'Comprueba que el cambio se refleja correctamente en grupos y recomendaciones.',
        ],
      },
      revisionOcio: {
        titulo: 'Ocio · revisión de evolución',
        descripcion:
          'Flujo para decidir cambios de nivel o grupo con evidencia suficiente.',
        pasos: [
          'Revisa reportes, nivel usado, técnica, autonomía y ritmo.',
          'Detecta alumnos cuyo nivel o grupo ya no encaja con lo observado.',
          'Mantén, sube, baja o revisa manualmente sin decidir por un único dato aislado.',
          'Comprueba que el grupo final siga siendo compatible con pista, edad, ritmo y ratio.',
        ],
      },
      intensivos: {
        titulo: 'Intensivos',
        descripcion:
          'Flujo desde la creación del curso hasta su cierre.',
        pasos: [
          'Crea o abre el intensivo y comprueba fechas, lugar, estado y alumnos inscritos.',
          'Prepara las sesiones y revisa horarios de cada día.',
          'Forma grupos por nivel, edad, pista, compatibilidad pedagógica y ratio.',
          'Asigna entrenadores y revisa cualquier grupo que necesite apoyo.',
          'Publica únicamente cuando la operativa del día esté cerrada.',
          'Entre sesiones, revisa evolución y ajusta solo cuando los reportes o la pista lo justifiquen.',
          'Completa asistencias, reportes, recuperaciones, nivel final y diploma antes de cerrar.',
        ],
      },
      entrenadores: {
        titulo: 'Entrenadores',
        descripcion:
          'Flujo para dar de alta, mantener documentación y preparar el acceso del entrenador.',
        pasos: [
          'Busca por nombre, teléfono o email antes de crear una ficha nueva.',
          'Completa contacto, tarifa, especialidades, documentación y observaciones internas.',
          'Usa “Pedir datos” cuando falte documentación o información.',
          'Comprueba el estado de acceso: sin acceso, invitación pendiente, activo o desactivado.',
          'Mantén la ficha actualizada para cuadrantes, disponibilidad y cobros.',
        ],
      },
      entrenador: {
        titulo: 'Vista entrenador',
        descripcion:
          'Flujo de trabajo del entrenador desde que abre su jornada hasta que deja el grupo cerrado.',
        pasos: [
          'Revisa día, hora, pista, punto de encuentro y alumnos asignados.',
          'Confirma la asignación cuando corresponda.',
          'Usa el trabajo diario y los avisos del grupo como referencia en pista.',
          'Marca la asistencia real de cada alumno.',
          'Completa los reportes con lo observado durante la sesión.',
        ],
      },
      reportes: {
        titulo: 'Cierre semanal',
        descripcion:
          'Flujo para dejar la semana sin asistencias, reportes o confirmaciones pendientes.',
        pasos: [
          'Empieza por asistencias sin confirmar y reportes que faltan.',
          'Comprueba entrenador, grupo, alumno y fecha de cada pendiente.',
          'Resuelve lo que corresponda o reclama la información al entrenador.',
          'Da la semana por cerrada solo cuando no queden pendientes reales.',
        ],
      },
      alumnos: {
        titulo: 'Fichas',
        descripcion:
          'Flujo para consultar y mantener la ficha maestra sin perder historial técnico.',
        pasos: [
          'Busca antes de crear para evitar duplicados.',
          'Comprueba nivel real, estimado, origen y último reporte.',
          'Edita únicamente los datos que realmente hayan cambiado.',
          'Revisa cualquier contradicción entre ficha y reportes antes de usar al alumno en recomendaciones.',
        ],
      },
      administracion: {
        titulo: 'Altas / Test de nivel',
        descripcion:
          'Flujo para convertir una nueva alta en una ficha útil y revisada.',
        pasos: [
          'Comprueba duplicados por nombre y fecha de nacimiento.',
          'Envía el test cuando corresponda.',
          'Revisa respuestas, nivel sugerido y avisos.',
          'Valida o corrige el nivel antes de incorporar al alumno.',
          'Añade al flujo real de Baby, Ocio o Intensivos.',
        ],
      },
      cobros: {
        titulo: 'Cobros',
        descripcion:
          'Flujo para revisar turnos computables y cerrar el mes de cada entrenador.',
        pasos: [
          'Selecciona temporada, año y mes correctos.',
          'Revisa sesiones computables, modalidad y entrenador.',
          'Añade o corrige únicamente ajustes justificados.',
          'Resuelve sesiones dudosas o pendientes antes de cerrar.',
          'Cierra el mes cuando el total coincida con la operativa real.',
        ],
      },
      analisis: {
        titulo: 'Análisis',
        descripcion:
          'Flujo para leer indicadores sin confundir volumen, continuidad y evolución técnica.',
        pasos: [
          'Selecciona modalidad y temporada.',
          'Lee primero el resumen general.',
          'Baja después al detalle mensual para localizar tendencias.',
          'Contrasta resultados con niveles y progresiones antes de sacar conclusiones.',
        ],
      },
      informes: {
        titulo: 'Informes y listados',
        descripcion:
          'Flujo para generar listados útiles sin modificar datos operativos.',
        pasos: [
          'Selecciona el informe que necesitas.',
          'Comprueba modalidad, filtros y temporada.',
          'Genera y revisa el resultado.',
          'Descarga o comparte únicamente después de verificarlo.',
        ],
      },
      temporadas: {
        titulo: 'Temporadas',
        descripcion:
          'Flujo para preparar el cambio de temporada sin perder información histórica.',
        pasos: [
          'Comprueba cuál es la temporada activa.',
          'Revisa el cierre de la temporada anterior y los alumnos que deben conservarse.',
          'Prepara la siguiente temporada solo cuando el cierre esté revisado.',
          'Comprueba la semilla y los niveles trasladados antes de confirmar.',
        ],
        aviso:
          'El cambio de temporada afecta a toda la operativa: revisa antes de confirmar.',
      },
      usuarios: {
        titulo: 'Accesos equipo',
        descripcion:
          'Flujo para dar acceso a coordinación o administración con el rol correcto.',
        pasos: [
          'Comprueba email, nombre y función de la persona.',
          'Asigna únicamente el rol que necesita.',
          'Revisa la invitación hasta que el acceso quede activo.',
          'Desactiva el acceso cuando deje de ser necesario.',
        ],
      },
      planning: {
        titulo: 'Planning',
        descripcion:
          'Flujo para revisar el cuadrante antes de usarlo como referencia operativa.',
        pasos: [
          'Selecciona la semana correcta.',
          'Revisa grupos, turnos, alumnos, pista, entrenador y publicación.',
          'Resuelve huecos, ratios o datos incompletos antes de darlo por válido.',
        ],
      },
      listados: {
        titulo: 'Listados',
        descripcion:
          'Flujo para revisar importaciones y resolver incidencias del listado.',
        pasos: [
          'Comprueba fecha, turno, modalidad y número de nombres detectados.',
          'Resuelve no encontrados y duplicados antes de continuar.',
          'Revisa las altas nuevas y sus datos mínimos.',
          'Confirma que la sesión final contiene exactamente los alumnos reales.',
        ],
      },
    };

    const ayuda = ayudas[pantalla];
    if (!ayuda) return null;

    const ayudaEnCabeceraOscura = [
      'resumenDia',
      'agenda',
      'ocioGrupos',
      'entrenadores',
      'intensivos',
      'administracion',
      'temporadas',
      'usuarios',
    ].includes(pantalla);

    return (
      <details
        style={{
          width: 'fit-content',
          maxWidth: '100%',
          boxSizing: 'border-box',
          marginTop: 10,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <summary
          style={{
            cursor: 'pointer',
            listStyle: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            minHeight: 36,
            padding: '7px 11px',
            border: ayudaEnCabeceraOscura
              ? '1px solid rgba(255,255,255,.24)'
              : '1px solid #cbd5e1',
            borderRadius: 999,
            background: ayudaEnCabeceraOscura
              ? 'rgba(255,255,255,.10)'
              : '#ffffff',
            color: ayudaEnCabeceraOscura ? '#ffffff' : '#334155',
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '0.01em',
            userSelect: 'none',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 23,
              height: 23,
              borderRadius: 999,
              display: 'inline-grid',
              placeItems: 'center',
              flex: '0 0 auto',
              background: '#eaf8ef',
              color: '#0f9f4d',
              fontSize: 13,
              fontWeight: 950,
            }}
          >
            ?
          </span>
          <span>Ayuda rápida · ver flujo</span>
        </summary>

        <div
          style={{
            borderTop: '1px solid #e3efe7',
            padding: '13px 14px 15px',
            background:
              'linear-gradient(180deg, #fbfefc 0%, #ffffff 100%)',
          }}
        >
          <div style={{ marginBottom: 11 }}>
            <strong
              style={{
                display: 'block',
                color: '#122033',
                fontSize: 14,
              }}
            >
              {ayuda.titulo}
            </strong>
            <span
              style={{
                color: '#64748b',
                fontSize: 12,
                lineHeight: 1.45,
              }}
            >
              {ayuda.descripcion}
            </span>
          </div>

          <ol
            style={{
              margin: 0,
              paddingLeft: 21,
              display: 'grid',
              gap: 8,
              color: '#334155',
              fontSize: 12,
              lineHeight: 1.45,
            }}
          >
            {ayuda.pasos.map((paso, indice) => (
              <li key={`${pantalla}-ayuda-${indice}`}>{paso}</li>
            ))}
          </ol>

          {ayuda.aviso && (
            <div
              style={{
                marginTop: 11,
                padding: '9px 10px',
                borderRadius: 10,
                border: '1px solid #fde68a',
                background: '#fffbeb',
                color: '#92400e',
                fontSize: 11,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              {ayuda.aviso}
            </div>
          )}
        </div>
      </details>
    );
  }
