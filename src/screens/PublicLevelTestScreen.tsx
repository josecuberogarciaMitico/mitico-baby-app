import { useEffect, useState } from 'react';
import { FOTO_MITICO_HERO } from '../assets/imagenes';
import { testNivelPublicoRespuestasVaciasApp } from '../core/enrolment/enrolmentImport';
import type { TestNivelPublicoInfoApp, TestNivelPublicoRespuestasApp } from '../core/enrolment/enrolmentTypes';
import { ejecutarFuncionPublicaConRespuestaApp } from '../services/enrolment/publicEnrolmentService';
import { authCardApp, authShellApp } from './AuthScreens';

export function PantallaTestNivelPublicoApp({ token }: { token: string }) {
  const [info, setInfo] = useState<TestNivelPublicoInfoApp | null>(null);
  const [respuestas, setRespuestas] =
    useState<TestNivelPublicoRespuestasApp>(testNivelPublicoRespuestasVaciasApp());
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    async function cargar() {
      setCargando(true);
      setError('');
      try {
        const datos = await ejecutarFuncionPublicaConRespuestaApp<TestNivelPublicoInfoApp[]>(
          'obtener_test_nivel_publico_app',
          { p_token: token }
        );
        if (!activo) return;
        const registro = Array.isArray(datos) ? datos[0] : null;
        if (!registro) throw new Error('Este test no está disponible.');
        setInfo(registro);
      } catch (err: any) {
        if (activo) setError(err?.message || 'Este test no está disponible.');
      } finally {
        if (activo) setCargando(false);
      }
    }
    void cargar();
    return () => {
      activo = false;
    };
  }, [token]);

  const preguntas: Array<{
    clave: keyof Omit<TestNivelPublicoRespuestasApp, 'observaciones'>;
    titulo: string;
    ayuda: string;
    opciones: Array<[string, string]>;
  }> = [
    {
      clave: 'experiencia',
      titulo: '1. ¿Cuántos días aproximadamente ha esquiado?',
      ayuda: 'No hace falta recordar el número exacto.',
      opciones: [
        ['A', 'Nunca / será su primer día'],
        ['B', '1–3 días'],
        ['C', '4–10 días'],
        ['D', 'Más de 10 días'],
      ],
    },
    {
      clave: 'desplazamiento',
      titulo: '2. ¿Se desplaza solo con los esquís puestos?',
      ayuda: 'Piensa en terreno sencillo y sin que un adulto lo lleve.',
      opciones: [
        ['A', 'No, necesita ayuda'],
        ['B', 'Algo, pero necesita ayuda con frecuencia'],
        ['C', 'Sí, se desplaza solo'],
      ],
    },
    {
      clave: 'frenado',
      titulo: '3. ¿Puede frenar haciendo cuña?',
      ayuda: 'Nos interesa si puede controlar la velocidad por sí mismo.',
      opciones: [
        ['A', 'No'],
        ['B', 'A veces / necesita indicaciones'],
        ['C', 'Sí, frena con autonomía'],
      ],
    },
    {
      clave: 'giros',
      titulo: '4. ¿Cómo hace los giros para cambiar de dirección?',
      ayuda: 'Marca lo que haga de forma habitual, no algo que haya hecho una sola vez.',
      opciones: [
        ['A', 'Todavía no hace giros'],
        ['B', 'Está empezando a girar'],
        ['C', 'Hace giros en cuña de forma autónoma'],
        ['D', 'Hace algunos giros con los esquís en paralelo'],
        ['E', 'Hace giros paralelos fluidos y enlazados'],
      ],
    },
    {
      clave: 'remonte',
      titulo: '5. ¿Qué remontes utiliza sin ayuda?',
      ayuda: 'Marca la opción más completa que haga con autonomía.',
      opciones: [
        ['A', 'Ninguno'],
        ['B', 'Cinta transportadora'],
        ['C', 'Percha / telesquí'],
        ['D', 'Silla'],
        ['E', 'Todos: cinta, percha y silla'],
      ],
    },
    {
      clave: 'pista',
      titulo: '6. ¿Por dónde baja con seguridad sin que un adulto tenga que sujetarlo?',
      ayuda: 'En Madrid SnowZone diferenciamos pista pequeña y pista grande.',
      opciones: [
        ['A', 'Todavía no baja una pista con autonomía'],
        ['B', 'Pista pequeña'],
        ['C', 'Pista grande'],
      ],
    },
    {
      clave: 'controlVelocidad',
      titulo: '7. En pista, ¿cómo controla la velocidad y la dirección?',
      ayuda: 'Marca lo que haga de forma habitual. Ir rápido o bajar solo no significa tener un nivel técnico alto.',
      opciones: [
        ['0', 'Todavía no sabe frenar ni controlar la velocidad'],
        ['A', 'Necesita ayuda o recordatorios constantes para frenar'],
        ['B', 'Controla principalmente haciendo cuña'],
        ['C', 'Controla enlazando giros y elige por dónde bajar'],
        ['D', 'Mantiene paralelo consolidado y adapta radio y trayectoria sin perder control'],
      ],
    },
    {
      clave: 'tecnica',
      titulo: '8. Si el profesor le propone ejercicios mientras baja, ¿qué es capaz de hacer?',
      ayuda: 'No pasa nada si no lo sabes. Marca solo algo que le hayas visto hacer varias veces, no un gesto aislado.',
      opciones: [
        ['A', 'No lo sabemos / todavía no sigue ejercicios esquiando'],
        ['B', 'Sigue ejercicios sencillos mientras baja'],
        ['C', 'Puede hacer giros más cortos o más largos cuando se lo piden'],
        ['D', 'Resuelve ejercicios técnicos de paralelo/cantos y cambia radio o ritmo manteniendo calidad'],
      ],
    },
  ];

  const opcionesObservacionEntrenador = [
    ['MIEDO_INSEGURIDAD', 'Miedo o inseguridad'],
    ['BLOQUEO_LLANTO', 'Se bloquea o llora con facilidad'],
    ['DIFICULTAD_REMONTES', 'Dificultad o miedo con los remontes'],
    ['AYUDA_MATERIAL', 'Necesita ayuda con el material'],
    ['SEPARACION_FAMILIA', 'Le cuesta separarse de la familia'],
    ['LIMITACION_FISICA', 'Lesión o limitación física a tener en cuenta'],
    ['NECESIDAD_ESPECIAL', 'Necesidad especial comunicada por la familia'],
    ['OTRA', 'Otra observación importante para el profesor'],
    ['NINGUNA', 'Ninguna'],
  ] as const;

  function alternarObservacionEntrenador(codigo: string) {
    setRespuestas((actual) => {
      const seleccionadas = actual.observacionesEntrenador || [];

      if (codigo === 'NINGUNA') {
        return {
          ...actual,
          observacionesEntrenador: seleccionadas.includes('NINGUNA')
            ? []
            : ['NINGUNA'],
          observacionEntrenadorOtra: '',
        };
      }

      const sinNinguna = seleccionadas.filter(
        (item) => item !== 'NINGUNA'
      );
      const yaSeleccionada = sinNinguna.includes(codigo);
      const siguientes = yaSeleccionada
        ? sinNinguna.filter((item) => item !== codigo)
        : [...sinNinguna, codigo];

      return {
        ...actual,
        observacionesEntrenador: siguientes,
        observacionEntrenadorOtra:
          codigo === 'OTRA' && yaSeleccionada
            ? ''
            : actual.observacionEntrenadorOtra,
      };
    });
  }

  const completo = preguntas.every(({ clave }) => Boolean(respuestas[clave]));

  async function enviarTest() {
    if (!completo || enviando) return;
    setEnviando(true);
    setError('');
    try {
      await ejecutarFuncionPublicaConRespuestaApp<unknown>(
        'responder_test_nivel_publico_app',
        {
          p_token: token,
          p_experiencia: respuestas.experiencia,
          p_desplazamiento: respuestas.desplazamiento,
          p_frenado: respuestas.frenado,
          p_giros: respuestas.giros,
          p_remonte: respuestas.remonte,
          p_pista: respuestas.pista,
          p_control_velocidad: respuestas.controlVelocidad,
          p_tecnica: respuestas.tecnica,
          p_observaciones_entrenador:
            respuestas.observacionesEntrenador || [],
          p_observacion_entrenador_otra:
            respuestas.observacionEntrenadorOtra.trim() || null,
          p_observaciones:
            respuestas.observacionesCoordinacion.trim() || null,
        }
      );
      setEnviado(true);
    } catch (err: any) {
      setError(err?.message || 'No se ha podido enviar el test.');
    } finally {
      setEnviando(false);
    }
  }

  if (cargando) {
    return (
      <main style={authShellApp}>
        <section style={authCardApp}>
          <h1 style={{ marginTop: 0 }}>Preparando valoración...</h1>
          <p style={{ color: '#64748b' }}>Un momento, por favor.</p>
        </section>
      </main>
    );
  }

  if (error && !info) {
    return (
      <main style={authShellApp}>
        <section style={authCardApp}>
          <h1 style={{ marginTop: 0 }}>Test no disponible</h1>
          <p style={{ color: '#64748b', lineHeight: 1.5 }}>{error}</p>
        </section>
      </main>
    );
  }

  if (enviado) {
    return (
      <main style={authShellApp}>
        <section
          style={{
            ...authCardApp,
            border: '1px solid #bbf7d0',
            background: 'linear-gradient(135deg, #f0fdf4, #ffffff)',
          }}
        >
          <p style={{ margin: '0 0 5px', color: '#15803d', fontWeight: 900 }}>
            VALORACIÓN ENVIADA
          </p>
          <h1 style={{ margin: 0 }}>¡Gracias!</h1>
          <p style={{ color: '#475569', lineHeight: 1.55 }}>
            Hemos recibido las respuestas de {info?.nombre_completo}. El equipo
            de coordinación las revisará antes de asignar un nivel inicial.
          </p>
          <p style={{ marginBottom: 0, color: '#64748b', fontSize: 13 }}>
            Ya puedes cerrar esta página.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        ...authShellApp,
        alignItems: 'flex-start',
        padding: 'max(18px, env(safe-area-inset-top)) 14px max(28px, env(safe-area-inset-bottom))',
      }}
    >
      <section
        style={{
          width: 'min(720px, 100%)',
          margin: '0 auto',
          display: 'grid',
          gap: 14,
        }}
      >
        <article
          style={{
            ...authCardApp,
            width: '100%',
            maxWidth: 'none',
            padding: 0,
            overflow: 'hidden',
            border: '1px solid #dbeafe',
            boxShadow: '0 18px 42px rgba(15, 23, 42, 0.12)',
          }}
        >
          <div
            style={{
              position: 'relative',
              minHeight: 235,
              padding: '20px 18px 22px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.08) 0%, rgba(15, 23, 42, 0.30) 48%, rgba(15, 23, 42, 0.82) 100%), url(${FOTO_MITICO_HERO})`,
              backgroundSize: '118% auto',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            <img
              src="/logo-cabecera-mitico.png"
              alt="Mítico Club"
              style={{
                position: 'absolute',
                top: 16,
                left: 16,
                width: 70,
                height: 70,
                padding: 6,
                borderRadius: 18,
                objectFit: 'contain',
                background: 'rgba(255,255,255,.94)',
                border: '1px solid rgba(255,255,255,.75)',
                boxShadow: '0 8px 22px rgba(15,23,42,.18)',
              }}
            />

            <p
              style={{
                margin: '0 0 5px',
                color: '#dbeafe',
                fontSize: 11,
                fontWeight: 950,
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
              }}
            >
              MÍTICO · BABY · OCIO · INTENSIVOS · Test inicial
            </p>

            <h1
              style={{
                margin: 0,
                color: '#ffffff',
                fontSize: 'clamp(24px, 6vw, 32px)',
                lineHeight: 1.08,
                textShadow: '0 2px 12px rgba(15,23,42,.35)',
              }}
            >
              Queremos conocer un poquito mejor a {info?.nombre_completo}
            </h1>

            <p
              style={{
                margin: '8px 0 0',
                color: '#e2e8f0',
                fontSize: 14,
                fontWeight: 750,
              }}
            >
              Modalidad: <strong style={{ color: '#fff' }}>{info?.modalidad}</strong>
            </p>
          </div>

          <div
            style={{
              padding: '16px 18px 18px',
              background: 'linear-gradient(135deg, #f8fbff, #ffffff 58%, #f0fdf4)',
            }}
          >
            <p
              style={{
                margin: 0,
                color: '#334155',
                lineHeight: 1.55,
                fontSize: 14,
              }}
            >
              No hace falta que conozcas su nivel de esquí. Marca simplemente lo
              que le hayas visto hacer. Son <strong>8 preguntas rápidas</strong> y
              tardarás aproximadamente <strong>2 minutos</strong>.
            </p>

            <div
              style={{
                marginTop: 12,
                padding: '10px 12px',
                borderRadius: 14,
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                color: '#1e3a8a',
                fontSize: 13,
                lineHeight: 1.45,
                fontWeight: 750,
              }}
            >
              La propuesta de nivel será revisada por coordinación antes de
              incorporarlo a un grupo.
            </div>
          </div>
        </article>

        {preguntas.map((pregunta) => (
          <article
            key={pregunta.clave}
            style={{
              ...authCardApp,
              width: '100%',
              maxWidth: 'none',
              padding: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 18, lineHeight: 1.3 }}>
              {pregunta.titulo}
            </h2>
            <p style={{ margin: '5px 0 12px', color: '#64748b', fontSize: 13 }}>
              {pregunta.ayuda}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {pregunta.opciones.map(([codigo, texto]) => {
                const activo = respuestas[pregunta.clave] === codigo;
                const codigoVisible =
                  pregunta.clave === 'controlVelocidad'
                    ? ({
                        '0': 'A',
                        A: 'B',
                        B: 'C',
                        C: 'D',
                        D: 'E',
                      } as Record<string, string>)[codigo] || codigo
                    : codigo;
                return (
                  <button
                    key={codigo}
                    type="button"
                    onClick={() =>
                      setRespuestas({
                        ...respuestas,
                        [pregunta.clave]: codigo,
                      })
                    }
                    style={{
                      minHeight: 48,
                      padding: '10px 12px',
                      borderRadius: 14,
                      border: activo
                        ? '2px solid #2563eb'
                        : '1px solid #cbd5e1',
                      background: activo ? '#2563eb' : '#ffffff',
                      color: activo ? '#ffffff' : '#334155',
                      textAlign: 'left',
                      fontWeight: 850,
                      boxShadow: activo
                        ? '0 8px 18px rgba(37,99,235,.18)'
                        : 'none',
                    }}
                  >
                    <strong style={{ marginRight: 8 }}>{codigoVisible}.</strong>
                    {texto}
                  </button>
                );
              })}
            </div>
          </article>
        ))}

        <article
          style={{
            ...authCardApp,
            width: '100%',
            maxWidth: 'none',
            padding: 16,
          }}
        >
          <div style={{ display: 'grid', gap: 10 }}>
            <div>
              <strong style={{ fontSize: 16 }}>
                ¿Hay algo importante que deba saber el profesor? (opcional)
              </strong>
              <p
                style={{
                  margin: '5px 0 0',
                  color: '#64748b',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                Marca solo lo que sea útil durante la clase. Puedes elegir más
                de una opción.
              </p>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: 8,
                minWidth: 0,
              }}
            >
              {opcionesObservacionEntrenador.map(([codigo, texto]) => {
                const activa =
                  respuestas.observacionesEntrenador.includes(codigo);

                return (
                  <button
                    key={codigo}
                    type="button"
                    onClick={() => alternarObservacionEntrenador(codigo)}
                    style={{
                      minHeight: 46,
                      width: '100%',
                      minWidth: 0,
                      padding: '9px 11px',
                      borderRadius: 13,
                      border: activa
                        ? '2px solid #2563eb'
                        : '1px solid #cbd5e1',
                      background: activa ? '#eff6ff' : '#ffffff',
                      color: activa ? '#1d4ed8' : '#334155',
                      textAlign: 'left',
                      fontWeight: 800,
                      lineHeight: 1.3,
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {activa ? '✓ ' : ''}
                    {texto}
                  </button>
                );
              })}
            </div>

            {respuestas.observacionesEntrenador.includes('OTRA') && (
              <label
                style={{
                  display: 'grid',
                  gap: 6,
                  fontWeight: 850,
                  minWidth: 0,
                }}
              >
                Otra observación importante para el profesor
                <input
                  value={respuestas.observacionEntrenadorOtra}
                  maxLength={120}
                  onChange={(e) =>
                    setRespuestas({
                      ...respuestas,
                      observacionEntrenadorOtra: e.target.value,
                    })
                  }
                  placeholder="Ej.: se asusta al subir a la silla"
                  style={{
                    width: '100%',
                    minWidth: 0,
                    border: '1px solid #cbd5e1',
                    borderRadius: 13,
                    padding: 11,
                    fontSize: 16,
                  }}
                />
                <small style={{ color: '#64748b', fontWeight: 700 }}>
                  Máximo 120 caracteres.
                </small>
              </label>
            )}
          </div>
        </article>

        <article
          style={{
            ...authCardApp,
            width: '100%',
            maxWidth: 'none',
            padding: 16,
          }}
        >
          <label
            style={{
              display: 'grid',
              gap: 7,
              fontWeight: 900,
              minWidth: 0,
            }}
          >
            Comentario adicional (opcional)
            <span
              style={{
                color: '#64748b',
                fontSize: 13,
                fontWeight: 650,
                lineHeight: 1.45,
              }}
            >
              Si quieres contarnos algo más que pueda ayudarnos a organizar
              mejor su experiencia, puedes escribirlo aquí. Por ejemplo:
              “Me gustaría que estuviera con su hermanito”.
            </span>
            <textarea
              value={respuestas.observacionesCoordinacion}
              maxLength={350}
              onChange={(e) =>
                setRespuestas({
                  ...respuestas,
                  observacionesCoordinacion: e.target.value,
                })
              }
              rows={3}
              placeholder="Escribe aquí cualquier comentario adicional..."
              style={{
                width: '100%',
                minWidth: 0,
                border: '1px solid #cbd5e1',
                borderRadius: 14,
                padding: 12,
                resize: 'vertical',
                fontSize: 16,
              }}
            />
          </label>
        </article>

        {error && (
          <div
            style={{
              padding: 12,
              borderRadius: 14,
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#b91c1c',
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={!completo || enviando || !info?.puede_responder}
          onClick={enviarTest}
          style={{
            minHeight: 54,
            border: 0,
            borderRadius: 16,
            padding: '12px 16px',
            background:
              completo && !enviando && info?.puede_responder
                ? '#16a34a'
                : '#cbd5e1',
            color: '#ffffff',
            fontSize: 16,
            fontWeight: 950,
            cursor:
              completo && !enviando && info?.puede_responder
                ? 'pointer'
                : 'not-allowed',
          }}
        >
          {enviando ? 'Enviando...' : 'Enviar valoración'}
        </button>
      </section>
    </main>
  );
}

const opcionesNivel = [
  'INICIACION',
  'A',
  'A+',
  'B',
  'B+',
  'C',
  'C+',
  'D',
  'D+',
];

const nivelesDiplomaIntensivo = [
  { id: '', codigo: 'Sin seleccionar', orden: -1 },
  {
    id: '8b50fa47-80dc-4808-8606-922823b708dd',
    codigo: 'INICIACION',
    orden: 0,
  },
  { id: '9da86b75-7d1d-45ce-b331-6ed3c1989553', codigo: 'A', orden: 1 },
  { id: 'b4cc5c49-dcd6-4120-8c2d-ba657bb8dcdd', codigo: 'A+', orden: 2 },
  { id: '0b6e022a-6d6c-498e-9337-de3c67fdc207', codigo: 'B', orden: 3 },
  { id: 'ee0eacce-543c-48e5-baca-e0085f7768a5', codigo: 'B+', orden: 4 },
  { id: 'ec96cd14-556a-431f-846d-74223368388f', codigo: 'C', orden: 5 },
  { id: 'b0b4e211-71c4-4a55-84bf-351137c6cdbd', codigo: 'C+', orden: 6 },
  { id: 'b7a9fd7c-7d1d-4357-9bff-c557977db22c', codigo: 'D', orden: 7 },
  { id: '0f10c6da-f11f-46dd-8211-1d9e1240e161', codigo: 'D+', orden: 8 },
];

const opcionesPista = ['Pequeña', 'Grande', 'Pequeña/Grande'];

const opcionesRemontes = [
  'Cinta',
  'Percha',
  'Silla',
  'Cinta y percha',
  'Percha y silla',
];

const opcionesEstadoDiplomaIntensivo = ['Pendiente', 'Revisado'];

const opcionesOrigenNivelAlumno = [
  'Familia',
  'Jose / Coordinador',
  'Ventas / compañera',
  'Clase de prueba pendiente',
  'Desconocido',
];

const opcionesRecomendacionIntensivo = [
  '',
  'Seguir en Baby',
  'Pasar a Ocio',
  'Repetir Intensivo',
  'Continuar en Intensivos',
  'Recomendar Particular',
  'Revisar con coordinador',
];

const opcionesEstadoAsistenciaIntensivo = [
  'SIN_CONFIRMAR',
  'PRESENTE',
  'NO_PRESENTADO',
  'LLEGA_TARDE',
  'BAJA_AVISADA',
];

const opcionesEstadoRecuperacionIntensivo = [
  'Pendiente valorar',
  'Encaja en nuevo intensivo',
  'No encaja por nivel',
  'Sin hueco',
  'Aprobada',
  'Resuelta',
  'Descartada',
];

const opcionesPistaGrupoIntensivo = ['', 'Pequeña', 'Grande', 'Pequeña/Grande'];

