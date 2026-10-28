import { useEffect, useState } from 'react';
import { ejecutarFuncionPublicaConRespuestaApp } from '../services/enrolment/publicEnrolmentService';
import { authCardApp, authShellApp } from './AuthScreens';

/**
 * Página pública para que la familia elija turno desde el enlace del WhatsApp
 * (?confirmar_turno=<código>&o=<n>). Mismo patrón que el test de nivel: sin
 * login, solo puede ver y responder ESA propuesta con ese código.
 */

type Opcion = { sesionId: string; etiqueta: string };
type Info = {
  nombres: string[];
  origen: { fecha: string; hora_inicio: string; hora_fin: string } | null;
  opciones: Opcion[];
  estado: 'ENVIADO' | 'ACEPTADO' | 'RECHAZADO';
  opcion_aceptada: Opcion | null;
};

const NUMEROS = ['1️⃣', '2️⃣', '3️⃣'];

function unirNombres(nombres: string[]) {
  return nombres.length > 1 ? `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}` : nombres[0] || '';
}

function etiquetaOrigen(o: Info['origen']) {
  if (!o) return '';
  const d = new Date(`${String(o.fecha).slice(0, 10)}T12:00:00`);
  return `${d.toLocaleDateString('es-ES', { weekday: 'long', day: '2-digit', month: '2-digit' })} de ${String(o.hora_inicio).slice(0, 5)} a ${String(o.hora_fin).slice(0, 5)}`;
}

export function PantallaCambioTurnoPublicoApp({ token, opcionInicial }: { token: string; opcionInicial: string }) {
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
        if (!datos || !Array.isArray(datos.opciones)) throw new Error('Esta propuesta ya no está disponible.');
        setInfo(datos);
        const n = Number(opcionInicial);
        if (opcionInicial === '0') setElegida('NINGUNA');
        else if (n >= 1 && n <= datos.opciones.length) setElegida(datos.opciones[n - 1].sesionId);
      } catch (e: any) {
        if (activo) setError(e?.message || 'Esta propuesta ya no está disponible.');
      } finally {
        if (activo) setCargando(false);
      }
    })();
    return () => {
      activo = false;
    };
  }, [token, opcionInicial]);

  async function confirmar() {
    if (!elegida || enviando) return;
    setEnviando(true);
    setError('');
    try {
      const r = await ejecutarFuncionPublicaConRespuestaApp<{ estado: 'ACEPTADO' | 'RECHAZADO' }>(
        'responder_propuesta_cambio_turno_publico_app',
        { p_token: token, p_sesion_id: elegida }
      );
      setHecho(r?.estado || (elegida === 'NINGUNA' ? 'RECHAZADO' : 'ACEPTADO'));
    } catch (e: any) {
      setError(e?.message || 'No se ha podido enviar. Probad de nuevo o escribidnos por WhatsApp.');
    } finally {
      setEnviando(false);
    }
  }

  const tarjeta = { ...authCardApp, width: 'min(560px, 100%)', maxWidth: 'none' };
  const logo = (
    <img
      src="/logo-cabecera-mitico.png"
      alt="Mítico Club"
      style={{ width: 60, height: 60, borderRadius: 16, objectFit: 'contain', background: '#fff', border: '1px solid #e5e7eb' }}
    />
  );

  if (cargando) {
    return (
      <main style={authShellApp}>
        <section style={tarjeta}>
          {logo}
          <h1 style={{ margin: '14px 0 0' }}>Un momento…</h1>
        </section>
      </main>
    );
  }

  if (!info) {
    return (
      <main style={authShellApp}>
        <section style={tarjeta}>
          {logo}
          <h1 style={{ margin: '14px 0 6px' }}>Propuesta no disponible</h1>
          <p style={{ color: '#64748b', lineHeight: 1.5 }}>{error || 'Escribidnos por WhatsApp y lo vemos.'}</p>
        </section>
      </main>
    );
  }

  const quien = unirNombres(info.nombres);

  if (hecho) {
    const op = info.opciones.find((o) => o.sesionId === elegida);
    return (
      <main style={authShellApp}>
        <section style={{ ...tarjeta, border: '1px solid #bbf7d0', background: 'linear-gradient(135deg, #f0fdf4, #ffffff)' }}>
          {logo}
          <p style={{ margin: '14px 0 4px', color: '#15803d', fontWeight: 900 }}>RESPUESTA ENVIADA</p>
          <h1 style={{ margin: 0 }}>¡Gracias!</h1>
          <p style={{ color: '#475569', lineHeight: 1.55 }}>
            {hecho === 'ACEPTADO'
              ? `Hemos apuntado ${op?.etiqueta || 'el turno elegido'} para ${quien}. En breve os confirmamos el grupo.`
              : `Hemos visto que no os viene bien ninguno. Os escribimos para buscar otra opción para ${quien}.`}
          </p>
          <p style={{ marginBottom: 0, color: '#64748b', fontSize: 13 }}>Ya podéis cerrar esta página.</p>
        </section>
      </main>
    );
  }

  const boton = (activo: boolean) => ({
    display: 'block',
    width: '100%',
    textAlign: 'left' as const,
    padding: '14px 16px',
    borderRadius: 14,
    border: activo ? '2px solid #16a34a' : '1px solid #cbd5e1',
    background: activo ? '#f0fdf4' : '#fff',
    fontSize: 16,
    fontWeight: 800,
    color: '#0f172a',
    cursor: 'pointer',
  });

  return (
    <main style={{ ...authShellApp, alignItems: 'flex-start', padding: 'max(18px, env(safe-area-inset-top)) 14px 28px' }}>
      <section style={{ ...tarjeta, margin: '0 auto' }}>
        {logo}
        <p style={{ margin: '14px 0 4px', color: '#2563eb', fontWeight: 900, fontSize: 12, letterSpacing: 1 }}>MÍTICO BABY · CAMBIO DE TURNO</p>
        <h1 style={{ margin: '0 0 6px', fontSize: 24 }}>¿Qué turno os viene mejor para {quien}?</h1>
        {info.origen && (
          <p style={{ color: '#475569', lineHeight: 1.5, marginTop: 0 }}>
            Para el {etiquetaOrigen(info.origen)} no tenemos hueco en un grupo de su nivel.
          </p>
        )}
        {info.estado !== 'ENVIADO' && (
          <p style={{ padding: '8px 10px', borderRadius: 10, background: '#eff6ff', color: '#1e3a8a', fontSize: 13, fontWeight: 700 }}>
            Ya nos habíais contestado
            {info.estado === 'ACEPTADO' && info.opcion_aceptada ? `: ${info.opcion_aceptada.etiqueta}` : ': ninguno os venía bien'}. Podéis cambiarlo aquí.
          </p>
        )}
        <div style={{ display: 'grid', gap: 10, margin: '14px 0' }}>
          {info.opciones.map((o, i) => (
            <button key={o.sesionId} type="button" style={boton(elegida === o.sesionId)} onClick={() => setElegida(o.sesionId)}>
              {NUMEROS[i] || `${i + 1}.`} {o.etiqueta.charAt(0).toUpperCase() + o.etiqueta.slice(1)}
              {elegida === o.sesionId ? '  ✓' : ''}
            </button>
          ))}
          <button type="button" style={boton(elegida === 'NINGUNA')} onClick={() => setElegida('NINGUNA')}>
            ❌ No nos viene bien ninguno{elegida === 'NINGUNA' ? '  ✓' : ''}
          </button>
        </div>
        {error && <p style={{ color: '#be123c', fontWeight: 800 }}>{error}</p>}
        <button
          type="button"
          disabled={!elegida || enviando}
          onClick={() => void confirmar()}
          style={{
            width: '100%',
            padding: '16px',
            borderRadius: 14,
            border: 0,
            background: elegida ? '#16a34a' : '#94a3b8',
            color: '#fff',
            fontSize: 17,
            fontWeight: 900,
            cursor: elegida ? 'pointer' : 'default',
          }}
        >
          {enviando ? 'Enviando…' : 'Confirmar'}
        </button>
      </section>
    </main>
  );
}
