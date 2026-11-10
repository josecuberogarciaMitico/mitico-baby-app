import React from 'react';
import { generarPdfSimple } from '../billing/simplePdf';
import { whatsappDirectUrl } from '../../core/communications/whatsappContract';
import {
  bloquesInformeIntensivo,
  bloquesInformesMaestro,
  nombreArchivoInforme,
  textoWhatsappInforme,
  type InformeIntensivoFamilia,
} from '../../core/evaluations/intensiveFamilyReport';
import {
  cargarTextosFamilia,
  guardarTextoFamilia,
  redactarConIA,
  subirPdfFamilia,
  type TextoFamilia,
} from '../../services/intensivos/evaluacionFamiliaService';

// Evaluación del Intensivo para la familia (10/11):
// - texto redactado por IA (se guarda y se puede retocar),
// - PDF por niño y PDF maestro con todos,
// - WhatsApp con el mensaje y un enlace para descargar el PDF.

const PIE = 'Mítico Club · Escuela de esquí';

// ---- Textos guardados: compartidos entre el panel y cada niño -----------------
const textosPorIntensivo = new Map<string, Map<string, TextoFamilia>>();
const cargando = new Map<string, Promise<void>>();
const oyentes = new Set<() => void>();
const avisar = () => oyentes.forEach((f) => f());

function cargar(intensivoId: string, forzar = false) {
  if (!intensivoId) return Promise.resolve();
  if (!forzar && (textosPorIntensivo.has(intensivoId) || cargando.has(intensivoId))) return cargando.get(intensivoId) || Promise.resolve();
  const p = cargarTextosFamilia(intensivoId)
    .then((filas) => {
      textosPorIntensivo.set(intensivoId, new Map(filas.map((f) => [f.intensivo_alumno_id, f])));
      avisar();
    })
    .catch((e) => console.error('textos familia intensivo', e))
    .finally(() => cargando.delete(intensivoId));
  cargando.set(intensivoId, p);
  return p;
}

function poner(intensivoId: string, intensivoAlumnoId: string, texto: string, mensaje: string) {
  const m = textosPorIntensivo.get(intensivoId) || new Map<string, TextoFamilia>();
  m.set(intensivoAlumnoId, { intensivo_alumno_id: intensivoAlumnoId, texto_familia: texto, mensaje_familia: mensaje, texto_familia_at: new Date().toISOString() });
  textosPorIntensivo.set(intensivoId, m);
  avisar();
}

function useTextosFamilia(intensivoId: string) {
  const [, refrescar] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => {
    oyentes.add(refrescar);
    void cargar(intensivoId);
    return () => {
      oyentes.delete(refrescar);
    };
  }, [intensivoId]);
  return textosPorIntensivo.get(intensivoId) || new Map<string, TextoFamilia>();
}

function conTextos(inf: InformeIntensivoFamilia, t: TextoFamilia | undefined): InformeIntensivoFamilia {
  return { ...inf, textoIA: String(t?.texto_familia || ''), mensajeIA: String(t?.mensaje_familia || '') };
}

// ---- PDF -----------------------------------------------------------------------
function fechaHoy() {
  return new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

function pdfDe(inf: InformeIntensivoFamilia) {
  return generarPdfSimple(bloquesInformeIntensivo(inf, fechaHoy()), { title: `Evaluación · ${inf.nombreCompleto}`, footerLeft: PIE });
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = 'noopener';
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

/** En el móvil abre «Compartir»; en el ordenador lo descarga. */
async function entregarPdf(bytes: Uint8Array, nombre: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const esTactil = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (esTactil && typeof navigator.share === 'function' && typeof File === 'function') {
    const archivo = new File([blob], nombre, { type: 'application/pdf' });
    if (!navigator.canShare || navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: nombre });
        return;
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') return;
      }
    }
  }
  descargarBlob(blob, nombre);
}

// ---- Estilos -------------------------------------------------------------------
const pildora = (color: string, fondo: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  minHeight: 36,
  padding: '6px 12px',
  borderRadius: 10,
  border: `1px solid ${color}`,
  background: fondo,
  color,
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
  textDecoration: 'none',
});
const area: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 120,
  padding: 10,
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  fontFamily: 'inherit',
  fontSize: 13.5,
  lineHeight: 1.45,
  resize: 'vertical',
};

// ---- Panel general (arriba de la evaluación) -------------------------------------
export function BotonPdfMaestroIntensivo(props: { intensivoId: string; intensivo: string; informes: InformeIntensivoFamilia[] }) {
  const textos = useTextosFamilia(props.intensivoId);
  const informes = props.informes.map((inf) => conTextos(inf, textos.get(inf.intensivoAlumnoId)));
  const sinTexto = informes.filter((inf) => !inf.textoIA);
  const [progreso, setProgreso] = React.useState('');
  const [aviso, setAviso] = React.useState('');

  async function redactarFaltan() {
    if (progreso || !sinTexto.length) return;
    if (!window.confirm(`¿Redactar con IA las ${sinTexto.length} evaluaciones que aún no tienen texto? Tarda unos segundos por niño.`)) return;
    let fallos = 0;
    for (let i = 0; i < sinTexto.length; i += 1) {
      setProgreso(`Redactando ${i + 1} de ${sinTexto.length}…`);
      try {
        const r = await redactarConIA(sinTexto[i]);
        poner(props.intensivoId, sinTexto[i].intensivoAlumnoId, r.texto, r.mensaje);
      } catch (e) {
        console.error('redactar evaluación', e);
        fallos += 1;
      }
    }
    setProgreso('');
    setAviso(fallos ? `${fallos} no se han podido redactar. Vuelve a pulsar para reintentarlo.` : '');
  }

  async function pdfMaestro() {
    if (!informes.length) return;
    const sinRevisar = informes.filter((i) => !i.revisado).length;
    if (sinRevisar && !window.confirm(`${sinRevisar} evaluación(es) todavía no están en «Revisado». ¿Generar el PDF igualmente?`)) return;
    try {
      const bytes = generarPdfSimple(bloquesInformesMaestro(informes, fechaHoy()), { title: `Evaluaciones · ${props.intensivo}`, footerLeft: PIE });
      await entregarPdf(bytes, nombreArchivoInforme('Todos', props.intensivo));
      setAviso('');
    } catch (error) {
      console.error('PDF maestro intensivo', error);
      setAviso('No se ha podido generar el PDF.');
    }
  }

  return (
    <>
      {sinTexto.length > 0 && (
        <button type="button" disabled={Boolean(progreso)} onClick={() => void redactarFaltan()} style={pildora('#6d28d9', '#f5f3ff')}>
          {progreso || `✨ Redactar con IA las que faltan (${sinTexto.length})`}
        </button>
      )}
      <button type="button" onClick={() => void pdfMaestro()} disabled={!informes.length} style={pildora('#0f766e', '#ecfdf5')}>
        📄 PDF de todas las evaluaciones ({informes.length})
      </button>
      {aviso && <span style={{ color: '#b91c1c', fontWeight: 700 }}>{aviso}</span>}
    </>
  );
}

// ---- Cada niño ----------------------------------------------------------------------
export function EnvioInformeIntensivo(props: { intensivoId: string; informe: InformeIntensivoFamilia; telefono: string | null | undefined }) {
  const textos = useTextosFamilia(props.intensivoId);
  const guardado = textos.get(props.informe.intensivoAlumnoId);
  const informe = conTextos(props.informe, guardado);
  const [texto, setTexto] = React.useState(informe.textoIA);
  const [mensaje, setMensaje] = React.useState(informe.mensajeIA);
  const [ocupado, setOcupado] = React.useState('');
  const [aviso, setAviso] = React.useState('');
  const [enlaceWa, setEnlaceWa] = React.useState('');

  // Si llega un texto nuevo (IA o recarga), se muestra.
  React.useEffect(() => {
    setTexto(informe.textoIA);
    setMensaje(informe.mensajeIA);
  }, [informe.textoIA, informe.mensajeIA]);

  const cambiado = texto.trim() !== informe.textoIA || mensaje.trim() !== informe.mensajeIA;
  const actual: InformeIntensivoFamilia = { ...informe, textoIA: texto.trim(), mensajeIA: mensaje.trim() };

  async function redactar() {
    if (ocupado) return;
    if (informe.textoIA && !window.confirm('¿Volver a redactar? Se sustituye el texto actual.')) return;
    setOcupado('Redactando con IA…');
    setAviso('');
    try {
      const r = await redactarConIA(props.informe);
      poner(props.intensivoId, props.informe.intensivoAlumnoId, r.texto, r.mensaje);
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se ha podido redactar.');
    } finally {
      setOcupado('');
    }
  }

  async function guardar() {
    setOcupado('Guardando…');
    setAviso('');
    try {
      await guardarTextoFamilia(props.informe.intensivoAlumnoId, texto, mensaje);
      poner(props.intensivoId, props.informe.intensivoAlumnoId, texto.trim(), mensaje.trim());
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se ha podido guardar.');
    } finally {
      setOcupado('');
    }
  }

  async function pdf() {
    try {
      await entregarPdf(pdfDe(actual), nombreArchivoInforme(actual.nombreCompleto, actual.intensivo));
      setAviso('');
    } catch (error) {
      console.error('PDF evaluación intensivo', error);
      setAviso('No se ha podido generar el PDF.');
    }
  }

  /** Sube el PDF, mete el enlace en el mensaje y abre el chat de la familia. */
  async function whatsapp() {
    if (ocupado) return;
    // La ventana se abre YA (si se abre después de esperar, el navegador la bloquea).
    const ventana = props.telefono ? window.open('about:blank', '_blank') : null;
    setOcupado('Preparando enlace del PDF…');
    setAviso('');
    setEnlaceWa('');
    try {
      const url = await subirPdfFamilia(actual.intensivoAlumnoId, nombreArchivoInforme(actual.nombreCompleto, actual.intensivo), pdfDe(actual));
      const textoFinal = textoWhatsappInforme(actual, url);
      const wa = whatsappDirectUrl(props.telefono, textoFinal);
      if (wa && ventana) ventana.location.href = wa;
      else if (wa) setEnlaceWa(wa);
      else {
        ventana?.close();
        await navigator.clipboard?.writeText(textoFinal).catch(() => undefined);
        setAviso('Sin teléfono en la ficha: el mensaje con el enlace se ha copiado para que lo pegues.');
      }
    } catch (e) {
      ventana?.close();
      setAviso(e instanceof Error ? e.message : 'No se ha podido preparar el enlace.');
    } finally {
      setOcupado('');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 10, marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
      <strong style={{ color: '#065f46' }}>
        Evaluación para la familia{!informe.revisado ? ' · todavía sin revisar' : ''}
      </strong>

      {informe.textoIA ? (
        <>
          <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 800, color: '#334155' }}>
            Texto del informe (PDF)
            <textarea value={texto} onChange={(e) => setTexto(e.target.value)} style={area} />
          </label>
          <label style={{ display: 'grid', gap: 4, fontSize: 12.5, fontWeight: 800, color: '#334155' }}>
            Mensaje de WhatsApp
            <textarea value={mensaje} onChange={(e) => setMensaje(e.target.value)} style={{ ...area, minHeight: 90 }} />
          </label>
        </>
      ) : (
        <span style={{ fontSize: 13, color: '#475569' }}>
          Todavía sin redactar: pulsa «Redactar con IA». Mientras tanto, el PDF usa el texto automático.
        </span>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" disabled={Boolean(ocupado)} onClick={() => void redactar()} style={pildora('#6d28d9', '#ffffff')}>
          ✨ {informe.textoIA ? 'Volver a redactar' : 'Redactar con IA'}
        </button>
        {cambiado && informe.textoIA && (
          <button type="button" disabled={Boolean(ocupado)} onClick={() => void guardar()} style={pildora('#1d4ed8', '#eff6ff')}>
            💾 Guardar cambios
          </button>
        )}
        <button type="button" disabled={Boolean(ocupado)} onClick={() => void pdf()} style={pildora('#0f766e', '#ffffff')}>
          📄 PDF
        </button>
        <button type="button" disabled={Boolean(ocupado)} onClick={() => void whatsapp()} style={pildora('#15803d', '#ffffff')}>
          📲 WhatsApp con enlace al PDF
        </button>
        {enlaceWa && (
          <a href={enlaceWa} target="_blank" rel="noreferrer" style={pildora('#ffffff', '#15803d')}>
            Abrir WhatsApp ✓
          </a>
        )}
        {!props.telefono && <span style={{ fontSize: 12.5, color: '#b45309', fontWeight: 700 }}>Sin teléfono en la ficha</span>}
        {ocupado && <span style={{ fontSize: 12.5, color: '#475569', fontWeight: 700 }}>{ocupado}</span>}
      </div>
      {aviso && <span style={{ color: '#b91c1c', fontWeight: 700, fontSize: 13 }}>{aviso}</span>}

      <details>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#065f46' }}>Ver mensaje completo</summary>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, margin: '8px 0 0' }}>
          {textoWhatsappInforme(actual, '(aquí irá el enlace al PDF)')}
        </pre>
      </details>
    </div>
  );
}
