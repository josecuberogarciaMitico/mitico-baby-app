import { useEffect, useState } from 'react';
import { FOTO_MITICO_HERO } from '../assets/imagenes';
import { ejecutarFuncionPublicaConRespuestaApp } from '../services/enrolment/publicEnrolmentService';
import './PublicTurnChangeScreen.css';

/**
 * Página pública para que la familia elija turno desde el WhatsApp
 * (?turno=<código corto>). Mismo patrón que el test de nivel: sin login, solo
 * puede ver y responder ESA propuesta con ese código. Un toque en el día y
 * «Confirmar».
 */

type Opcion = { sesionId: string; etiqueta: string };
type Info = {
  nombres: string[];
  origen: { fecha: string; hora_inicio: string; hora_fin: string } | null;
  opciones: Opcion[];
  estado: 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
  opcion_aceptada: Opcion | null;
};

function unirNombres(nombres: string[]) {
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0] || '';
}

// «sábado 31/10 de 09:45 a 11:45» → partes para la tarjeta.
function partes(etiqueta: string) {
  const m = String(etiqueta || '').match(/^(\S+)\s+(\S+)\s+de\s+(\d{1,2}:\d{2})\s+a\s+(\d{1,2}:\d{2})/i);
  if (!m) return { dia: etiqueta, fecha: '', hora: '' };
  return {
    dia: m[1].charAt(0).toUpperCase() + m[1].slice(1),
    fecha: m[2],
    hora: `${m[3]} – ${m[4]}`,
  };
}

function etiquetaOrigen(o: Info['origen']) {
  if (!o) return '';
  const d = new Date(`${String(o.fecha).slice(0, 10)}T12:00:00`);
  const dia = d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'numeric' });
  return `${dia} (${String(o.hora_inicio).slice(0, 5)}–${String(o.hora_fin).slice(0, 5)})`;
}

export function PantallaCambioTurnoPublicoApp({ token }: { token: string; opcionInicial?: string }) {
  const [info, setInfo] = useState<Info | null>(null);
  const [cargando, setCargando] = useState(true);
  const [elegida, setElegida] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [hecho, setHecho] = useState<'' | 'ACEPTADO' | 'RECHAZADO'>('');
  const [error, setError] = useState('');

  useEffect(() => {
    let activo = true;
    (async () => {
      try {
        const datos = await ejecutarFuncionPublicaConRespuestaApp<Info | null>('obtener_propuesta_cambio_turno_publico_app', {
          p_token: token,
        });
        if (!activo) return;
        if (!datos || !Array.isArray(datos.opciones)) throw new Error('Este enlace ya no está activo.');
        setInfo(datos);
      } catch (e: any) {
        if (activo) setError(e?.message || 'Este enlace ya no está activo.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token]);

  async function confirmar(eleccion: string) {
    if (!eleccion || enviando) return;
    setEnviando(true);
    setError('');
    try {
      const r = await ejecutarFuncionPublicaConRespuestaApp<{ estado: 'ACEPTADO' | 'RECHAZADO' }>(
        'responder_propuesta_cambio_turno_publico_app',
        { p_token: token, p_sesion_id: eleccion }
      );
      setElegida(eleccion);
      setHecho(r?.estado || (eleccion === 'NINGUNA' ? 'RECHAZADO' : 'ACEPTADO'));
    } catch (e: any) {
      setError(e?.message || 'No se ha podido enviar. Probad de nuevo o contestadnos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  }

  const cabecera = (
    <div className="ct-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,.05), rgba(15,23,42,.75)), url(${FOTO_MITICO_HERO})` }}>
      <img src="/logo-cabecera-mitico.png" alt="Mítico Club" className="ct-logo" />
      <span className="ct-marca">MÍTICO BABY</span>
    </div>
  );

  if (cargando) {
    return (
      <main className="ct-pagina">
        <section className="ct-tarjeta">
          {cabecera}
          <div className="ct-cuerpo">
            <p className="ct-texto">Un momento…</p>
          </div>
        </section>
      </main>
    );
  }

  if (!info) {
    return (
      <main className="ct-pagina">
        <section className="ct-tarjeta">
          {cabecera}
          <div className="ct-cuerpo">
            <h1 className="ct-titulo">Enlace no activo</h1>
            <p className="ct-texto">{error || 'Contestadnos por WhatsApp con el número del día y lo apuntamos.'}</p>
          </div>
        </section>
      </main>
    );
  }

  const quien = unirNombres(info.nombres);

  if (hecho) {
    const op = info.opciones.find((o) => o.sesionId === elegida);
    const p = op ? partes(op.etiqueta) : null;
    return (
      <main className="ct-pagina">
        <section className="ct-tarjeta">
          {cabecera}
          <div className="ct-cuerpo ct-hecho">
            <div className="ct-check">{hecho === 'ACEPTADO' ? '✓' : '👍'}</div>
            <h1 className="ct-titulo">{hecho === 'ACEPTADO' ? '¡Apuntado!' : 'Recibido'}</h1>
            {hecho === 'ACEPTADO' && p ? (
              <div className="ct-resumen">
                <div>
                  <strong>
                    {p.dia} {p.fecha}
                  </strong>
                  <span>{p.hora}</span>
                </div>
              </div>
            ) : null}
            <p className="ct-texto">
              {hecho === 'ACEPTADO'
                ? `${quien} entrena ese día. Os confirmamos el grupo en breve.`
                : `Os escribimos para buscar otra opción para ${quien}.`}
            </p>
            <p className="ct-pie">Ya podéis cerrar esta página.</p>
          </div>
        </section>
      </main>
    );
  }

  const seleccion = info.opciones.find((o) => o.sesionId === elegida);

  return (
    <main className="ct-pagina">
      <section className="ct-tarjeta">
        {cabecera}
        <div className="ct-cuerpo">
          <h1 className="ct-titulo">¿Qué día le viene mejor a {quien}?</h1>
          {info.origen && (
            <p className="ct-texto">
              El {etiquetaOrigen(info.origen)} no tenemos hueco en un grupo de su nivel. Toca el día que prefiráis:
            </p>
          )}
          {info.estado === 'ACEPTADO' && info.opcion_aceptada && (
            <p className="ct-aviso">Ya habíais elegido {info.opcion_aceptada.etiqueta}. Podéis cambiarlo aquí.</p>
          )}

          <div className="ct-opciones">
            {info.opciones.map((o) => {
              const p = partes(o.etiqueta);
              const activa = elegida === o.sesionId;
              return (
                <button
                  key={o.sesionId}
                  type="button"
                  className={`ct-opcion${activa ? ' is-activa' : ''}`}
                  onClick={() => setElegida(o.sesionId)}
                  aria-pressed={activa}
                >
                  <span className="ct-opcion-texto">
                    <strong>{p.dia}</strong>
                    <span>
                      {p.fecha} · {p.hora}
                    </span>
                  </span>
                  <span className="ct-opcion-marca">{activa ? '✓' : ''}</span>
                </button>
              );
            })}
          </div>

          {error && <p className="ct-error">{error}</p>}

          <button
            type="button"
            className="ct-confirmar"
            disabled={!seleccion || enviando}
            onClick={() => void confirmar(elegida)}
          >
            {enviando
              ? 'Enviando…'
              : seleccion
              ? `Confirmar ${partes(seleccion.etiqueta).dia.toLowerCase()} ${partes(seleccion.etiqueta).hora.split(' –')[0]}`
              : 'Elige un día'}
          </button>

          <button type="button" className="ct-ninguno" disabled={enviando} onClick={() => void confirmar('NINGUNA')}>
            Ninguno nos viene bien
          </button>
        </div>
      </section>
    </main>
  );
}
