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

// Evaluación del Intensivo para la familia (10/11): PDF por niño, PDF maestro
// con todos y WhatsApp con el mensaje ya escrito.

const PIE = 'Mítico Club · Escuela de esquí';

function fechaHoy() {
  return new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
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

/** En el móvil abre «Compartir» (WhatsApp, Mail…); en el ordenador lo descarga. */
async function entregarPdf(bytes: Uint8Array, nombre: string, texto?: string) {
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
  const esTactil = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (esTactil && typeof navigator.share === 'function' && typeof File === 'function') {
    const archivo = new File([blob], nombre, { type: 'application/pdf' });
    if (!navigator.canShare || navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: nombre, ...(texto ? { text: texto } : {}) });
        return;
      } catch (error) {
        if ((error as { name?: string })?.name === 'AbortError') return;
      }
    }
  }
  descargarBlob(blob, nombre);
}

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

export function BotonPdfMaestroIntensivo(props: { intensivo: string; informes: InformeIntensivoFamilia[] }) {
  const [aviso, setAviso] = React.useState('');
  const sinRevisar = props.informes.filter((i) => !i.revisado).length;
  async function generar() {
    if (!props.informes.length) return;
    if (sinRevisar && !window.confirm(`${sinRevisar} evaluación(es) todavía no están en «Revisado». ¿Generar el PDF igualmente?`)) return;
    try {
      const bytes = generarPdfSimple(bloquesInformesMaestro(props.informes, fechaHoy()), {
        title: `Evaluaciones · ${props.intensivo}`,
        footerLeft: PIE,
      });
      await entregarPdf(bytes, nombreArchivoInforme('Todos', props.intensivo));
      setAviso('');
    } catch (error) {
      console.error('PDF maestro intensivo', error);
      setAviso('No se ha podido generar el PDF.');
    }
  }
  return (
    <>
      <button type="button" onClick={() => void generar()} disabled={!props.informes.length} style={pildora('#0f766e', '#ecfdf5')}>
        📄 PDF de todas las evaluaciones ({props.informes.length})
      </button>
      {aviso && <span style={{ color: '#b91c1c', fontWeight: 700 }}>{aviso}</span>}
    </>
  );
}

export function EnvioInformeIntensivo(props: { informe: InformeIntensivoFamilia; telefono: string | null | undefined }) {
  const { informe } = props;
  const texto = textoWhatsappInforme(informe);
  const enlace = whatsappDirectUrl(props.telefono, texto);
  const [aviso, setAviso] = React.useState('');

  async function pdf() {
    try {
      const bytes = generarPdfSimple(bloquesInformeIntensivo(informe, fechaHoy()), {
        title: `Evaluación · ${informe.nombreCompleto}`,
        footerLeft: PIE,
      });
      await entregarPdf(bytes, nombreArchivoInforme(informe.nombreCompleto, informe.intensivo));
      setAviso('');
    } catch (error) {
      console.error('PDF evaluación intensivo', error);
      setAviso('No se ha podido generar el PDF.');
    }
  }

  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 12, padding: 12, borderRadius: 12, border: '1px solid #bbf7d0', background: '#f0fdf4' }}>
      <strong style={{ color: '#065f46' }}>
        Evaluación para la familia{!informe.revisado ? ' · todavía sin revisar' : ''}
      </strong>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <button type="button" onClick={() => void pdf()} style={pildora('#0f766e', '#ffffff')}>
          📄 PDF
        </button>
        {enlace ? (
          <a href={enlace} target="_blank" rel="noreferrer" style={pildora('#15803d', '#ffffff')}>
            📲 WhatsApp
          </a>
        ) : (
          <span style={{ fontSize: 12.5, color: '#b45309', fontWeight: 700 }}>Sin teléfono en la ficha</span>
        )}
        {aviso && <span style={{ color: '#b91c1c', fontWeight: 700 }}>{aviso}</span>}
      </div>
      <details>
        <summary style={{ cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#065f46' }}>Ver mensaje</summary>
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, margin: '8px 0 0' }}>{texto}</pre>
      </details>
    </div>
  );
}
