/**
 * Informe SnowZone (Pista pequeña / Pista grande) en PDF legible.
 *
 * Sustituye al antiguo CSV de «datos técnicos», que al abrirlo salía todo
 * apelotonado. Usa el mismo generador de PDF que los cobros (sin librerías).
 * Los datos son los mismos que muestra la pantalla: no recalcula nada.
 */
import { generarPdfSimple, type PdfBlock } from '../billing/simplePdf';

export type FilaSnowZone = {
  fecha: string;
  pista_pequena: number;
  pista_grande: number;
  total: number;
};

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

/** «sábado 04/10/2026» a partir de «2026-10-04». */
export function fechaConDiaSnowZone(fechaIso: string) {
  const [anio, mes, dia] = String(fechaIso || '').slice(0, 10).split('-').map(Number);
  if (!anio || !mes || !dia) return String(fechaIso || '');
  const fecha = new Date(anio, mes - 1, dia, 12);
  const dd = String(dia).padStart(2, '0');
  const mm = String(mes).padStart(2, '0');
  return `${DIAS[fecha.getDay()]} ${dd}/${mm}/${anio}`;
}

export function bloquesInformeSnowZone(
  filas: FilaSnowZone[],
  cabecera: { titulo: string; periodo: string }
): PdfBlock[] {
  const totalPequena = filas.reduce((t, f) => t + Number(f.pista_pequena || 0), 0);
  const totalGrande = filas.reduce((t, f) => t + Number(f.pista_grande || 0), 0);
  const total = totalPequena + totalGrande;

  return [
    { kind: 'heading', level: 1, text: `SnowZone · ${cabecera.titulo}` },
    {
      kind: 'paragraph',
      runs: [
        { text: 'Periodo: ', bold: true },
        { text: cabecera.periodo },
      ],
    },
    {
      kind: 'paragraph',
      size: 9,
      color: '#475569',
      runs: [
        {
          text: 'Solo Baby e Intensivos (Ocio no cuenta). Asistencia real por día. Un grupo Pequeña/Grande cuenta como Pista grande.',
        },
      ],
    },
    {
      kind: 'boxes',
      items: [
        { title: 'Pista pequeña', value: String(totalPequena) },
        { title: 'Pista grande', value: String(totalGrande) },
        { title: 'Total', value: String(total) },
      ],
    },
    {
      kind: 'table',
      header: ['Día', 'Pista pequeña', 'Pista grande', 'Total'],
      headerFill: '#dbeafe',
      rows: [
        ...filas.map((fila) => [
          { text: fechaConDiaSnowZone(fila.fecha) },
          { text: String(Number(fila.pista_pequena || 0)) },
          { text: String(Number(fila.pista_grande || 0)) },
          { text: String(Number(fila.total || 0)), bold: true },
        ]),
        [
          { text: 'TOTAL', bold: true },
          { text: String(totalPequena), bold: true },
          { text: String(totalGrande), bold: true },
          { text: String(total), bold: true },
        ],
      ],
    },
  ];
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

/** Genera y descarga el PDF (en móvil abre el menú de compartir si se puede). */
export async function descargarInformeSnowZonePdf(
  filas: FilaSnowZone[],
  cabecera: { titulo: string; periodo: string },
  nombreArchivo: string
) {
  const titulo = `SnowZone · ${cabecera.titulo}`;
  const bytes = generarPdfSimple(bloquesInformeSnowZone(filas, cabecera), {
    title: titulo,
    footerLeft: `${titulo} · generado el ${new Date().toLocaleDateString('es-ES')}`,
  });
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });

  const esTactil =
    typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
  if (esTactil && typeof navigator.share === 'function' && typeof File === 'function') {
    const archivo = new File([blob], nombreArchivo, { type: 'application/pdf' });
    if (!navigator.canShare || navigator.canShare({ files: [archivo] })) {
      try {
        await navigator.share({ files: [archivo], title: titulo });
        return;
      } catch (errorCompartir) {
        if ((errorCompartir as { name?: string })?.name === 'AbortError') return;
      }
    }
  }

  descargarBlob(blob, nombreArchivo);
}
