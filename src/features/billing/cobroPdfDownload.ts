/**
 * Descarga directa (sin diálogo de impresión) del PDF de cobros de
 * entrenadores a partir de la previsualización `#cobro-pdf-preview`.
 *
 * Lee el HTML ya generado para la previsualización (no recalcula importes),
 * lo convierte en bloques y genera un PDF real con `generarPdfSimple`.
 */
import { generarPdfSimple, type PdfBlock, type PdfRun } from './simplePdf';

const ID_PREVIEW = 'cobro-pdf-preview';
const CLASE_NO_IMPRIMIR = 'no-imprimir-cobro';

function textoLimpio(nodo: Node | null) {
  return (nodo?.textContent || '').replace(/\s+/g, ' ').trim();
}

/** Fragmentos de texto de un elemento respetando <strong>/<b> y <br>. */
function runsDe(elemento: Element): PdfRun[] {
  const runs: PdfRun[] = [];
  const recorrer = (nodo: Node, negrita: boolean) => {
    if (nodo.nodeType === 3) {
      const texto = (nodo.textContent || '').replace(/\s+/g, ' ');
      if (texto) runs.push({ text: texto, bold: negrita });
      return;
    }
    if (nodo.nodeType !== 1) return;
    const el = nodo as Element;
    const tag = el.tagName.toLowerCase();
    if (tag === 'br') {
      runs.push({ text: ' ', bold: negrita });
      return;
    }
    const esNegrita = negrita || tag === 'strong' || tag === 'b';
    el.childNodes.forEach((hijo) => recorrer(hijo, esNegrita));
  };
  recorrer(elemento, false);
  // Quita espacios sobrantes al principio y final.
  if (runs.length) {
    runs[0] = { ...runs[0], text: runs[0].text.replace(/^\s+/, '') };
    const ultimo = runs.length - 1;
    runs[ultimo] = { ...runs[ultimo], text: runs[ultimo].text.replace(/\s+$/, '') };
  }
  return runs.filter((run) => run.text !== '');
}

function tablaDe(tabla: HTMLTableElement, headerFill?: string): PdfBlock {
  const filasCabecera = Array.from(tabla.querySelectorAll('thead tr'));
  const cabecera = filasCabecera.length
    ? Array.from(filasCabecera[0].children).map((celda) => textoLimpio(celda))
    : [];
  const filasCuerpo = Array.from(tabla.querySelectorAll('tbody tr')).length
    ? Array.from(tabla.querySelectorAll('tbody tr'))
    : Array.from(tabla.querySelectorAll('tr')).filter((fila) => !fila.closest('thead'));
  const rows = filasCuerpo.map((fila) =>
    Array.from(fila.children).map((celda) => ({
      text: textoLimpio(celda),
      bold: Boolean(celda.querySelector('strong, b')) || celda.tagName.toLowerCase() === 'th',
    }))
  );
  return { kind: 'table', header: cabecera, rows, headerFill };
}

/** Convierte el contenido HTML de la previsualización en bloques de PDF. */
export function bloquesDesdeHtmlCobros(raiz: Element): PdfBlock[] {
  const bloques: PdfBlock[] = [];

  const convertir = (el: Element, destino: PdfBlock[]) => {
    const tag = el.tagName.toLowerCase();
    const clases = el.classList;
    if (clases.contains(CLASE_NO_IMPRIMIR) || tag === 'style' || tag === 'script') return;

    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4') {
      const texto = textoLimpio(el);
      if (texto) {
        destino.push({ kind: 'heading', level: tag === 'h1' ? 1 : tag === 'h2' ? 2 : 3, text: texto });
      }
      return;
    }

    if (tag === 'p') {
      const runs = runsDe(el);
      if (!runs.length) return;
      if (clases.contains('pie-efectivo')) {
        destino.push({ kind: 'paragraph', runs, size: 8, color: '#64748b' });
      } else if (clases.contains('kicker-efectivo')) {
        destino.push({ kind: 'paragraph', runs: runs.map((r) => ({ ...r, bold: true })), size: 8, color: '#0f766e' });
      } else if (clases.contains('subtitulo-efectivo')) {
        destino.push({ kind: 'paragraph', runs: runs.map((r) => ({ ...r, bold: true })), color: '#475569' });
      } else {
        destino.push({ kind: 'paragraph', runs });
      }
      return;
    }

    if (tag === 'table') {
      const cabeceraEfectivo = clases.contains('tabla-efectivo') ? '#ecfdf5' : undefined;
      destino.push(tablaDe(el as HTMLTableElement, cabeceraEfectivo));
      return;
    }

    if (tag === 'pre') {
      const texto = (el.textContent || '').trim();
      if (texto) destino.push({ kind: 'pre', text: texto });
      return;
    }

    if (clases.contains('resumen')) {
      const items = Array.from(el.children).map((celda) => {
        const titulo = textoLimpio(celda.querySelector('strong, b'));
        const total = textoLimpio(celda);
        const valor = titulo && total.startsWith(titulo) ? total.slice(titulo.length).trim() : total;
        return { title: titulo, value: valor };
      });
      if (items.length) destino.push({ kind: 'boxes', items });
      return;
    }

    if (clases.contains('efectivo-destacado')) {
      const hijos: PdfBlock[] = Array.from(el.children).map((hijo) => {
        const hijoTag = hijo.tagName.toLowerCase();
        const texto = textoLimpio(hijo);
        if (hijoTag === 'strong') return { kind: 'heading', level: 1, text: texto } as PdfBlock;
        if (hijoTag === 'small') {
          return { kind: 'paragraph', runs: [{ text: texto }], size: 9, color: '#64748b' } as PdfBlock;
        }
        return { kind: 'paragraph', runs: [{ text: texto.toUpperCase(), bold: true }], size: 8.5, color: '#475569' } as PdfBlock;
      });
      destino.push({ kind: 'box', blocks: hijos, borderColor: '#0f766e', fill: '#f0fdfa' });
      return;
    }

    if (clases.contains('nota-efectivo')) {
      destino.push({
        kind: 'box',
        blocks: [{ kind: 'paragraph', runs: runsDe(el), size: 9.5 }],
        borderColor: '#0f9f4d',
        fill: '#f8fafc',
      });
      return;
    }

    if (clases.contains('portada')) {
      const hijos: PdfBlock[] = [];
      Array.from(el.children).forEach((hijo) => convertir(hijo, hijos));
      destino.push({ kind: 'box', blocks: hijos, borderColor: '#111111' });
      return;
    }

    if (clases.contains('preparacion-efectivo')) {
      if (destino.length) destino.push({ kind: 'pageBreak' });
      Array.from(el.children).forEach((hijo) => convertir(hijo, destino));
      return;
    }

    if (clases.contains('cobro')) {
      // Cada entrenador se intenta mantener junto en una misma hoja.
      const hijos: PdfBlock[] = [];
      Array.from(el.children).forEach((hijo) => convertir(hijo, hijos));
      hijos.push({ kind: 'rule' });
      destino.push({ kind: 'group', blocks: hijos });
      return;
    }

    // Contenedor genérico: recorrer hijos; si solo tiene texto, párrafo.
    if (el.children.length === 0) {
      const runs = runsDe(el);
      if (runs.length) destino.push({ kind: 'paragraph', runs });
      return;
    }
    Array.from(el.children).forEach((hijo) => convertir(hijo, destino));
  };

  Array.from(raiz.children).forEach((hijo) => convertir(hijo, bloques));
  return bloques;
}

export function nombreArchivoPdfCobros(titulo: string) {
  const base = titulo
    .replace(/·/g, '-')
    .replace(/[\\/:*?"<>|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${base || 'Cobros entrenadores'}.pdf`;
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

/**
 * Genera el PDF de la previsualización abierta y lo descarga.
 * En móvil (pantalla táctil) abre el menú de compartir si el sistema lo
 * permite, para poder enviarlo directamente (WhatsApp, correo…).
 */
export async function descargarPdfCobroPreview(titulo: string) {
  const preview = document.getElementById(ID_PREVIEW);
  if (!preview) {
    alert('No encuentro la previsualización del PDF. Ciérrala y vuelve a abrirla.');
    return;
  }

  try {
    const bloques = bloquesDesdeHtmlCobros(preview);
    const bytes = generarPdfSimple(bloques, {
      title: titulo,
      footerLeft: `${titulo} · generado el ${new Date().toLocaleDateString('es-ES')}`,
    });
    const nombre = nombreArchivoPdfCobros(titulo);
    const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });

    const esTactil =
      typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
    if (esTactil && typeof navigator.share === 'function' && typeof File === 'function') {
      const archivo = new File([blob], nombre, { type: 'application/pdf' });
      if (!navigator.canShare || navigator.canShare({ files: [archivo] })) {
        try {
          await navigator.share({ files: [archivo], title: titulo });
          return;
        } catch (errorCompartir) {
          // El usuario canceló el menú de compartir: no hacemos nada más.
          if ((errorCompartir as { name?: string })?.name === 'AbortError') return;
        }
      }
    }

    descargarBlob(blob, nombre);
  } catch (error) {
    console.error('Error generando PDF de cobros', error);
    alert('No se pudo generar el PDF. Prueba con "Imprimir" y "Guardar como PDF".');
  }
}
