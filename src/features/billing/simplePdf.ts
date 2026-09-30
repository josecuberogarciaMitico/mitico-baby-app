/**
 * Generador de PDF mínimo y sin dependencias para documentos de texto con
 * títulos, párrafos, cajas y tablas (resumen de cobros de entrenadores).
 *
 * Produce un PDF 1.4 real (vectorial, texto seleccionable) con las fuentes
 * estándar Helvetica / Helvetica-Bold y codificación WinAnsi (cubre tildes,
 * ñ, € y ·). No usa el DOM: se puede probar en Node.
 */

export type PdfRun = { text: string; bold?: boolean };

export type PdfBlock =
  | { kind: 'heading'; level: 1 | 2 | 3; text: string }
  | { kind: 'paragraph'; runs: PdfRun[]; size?: number; color?: string }
  | { kind: 'boxes'; items: { title: string; value: string }[] }
  | {
      kind: 'box';
      blocks: PdfBlock[];
      borderColor?: string;
      fill?: string;
    }
  | {
      kind: 'table';
      header: string[];
      rows: { text: string; bold?: boolean }[][];
      headerFill?: string;
    }
  | { kind: 'pre'; text: string }
  | { kind: 'rule' }
  | { kind: 'pageBreak' }
  | { kind: 'group'; blocks: PdfBlock[] };

export type SimplePdfOptions = {
  title?: string;
  footerLeft?: string;
};

// Anchos AFM (1/1000 em) para los códigos WinAnsi 32..255.
const ANCHOS_HELVETICA = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584,0,556,0,222,556,333,1000,556,556,333,1000,667,333,1000,0,611,0,0,222,222,333,333,350,556,1000,333,1000,500,333,944,0,500,500,278,333,556,556,556,556,260,556,333,737,370,556,584,333,737,333,400,584,333,333,333,556,537,278,333,333,365,556,834,834,834,611,667,667,667,667,667,667,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,500,556,556,556,556,278,278,278,278,556,556,556,556,556,556,556,584,611,556,556,556,556,500,556,500];
const ANCHOS_HELVETICA_BOLD = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584,0,556,0,278,556,500,1000,556,556,333,1000,667,333,1000,0,611,0,0,278,278,500,500,350,556,1000,333,1000,556,333,944,0,500,556,278,333,556,556,556,556,280,556,333,737,370,556,584,333,737,333,400,584,333,333,333,611,556,278,333,333,365,556,834,834,834,611,722,722,722,722,722,722,1000,722,667,667,667,667,278,278,278,278,722,722,778,778,778,778,778,584,778,722,722,722,722,667,667,611,556,556,556,556,556,556,889,556,556,556,556,556,278,278,278,278,611,611,611,611,611,611,611,584,611,611,611,611,611,556,611,556];

// Caracteres Unicode que en WinAnsi ocupan 0x80..0x9F.
const WIN_ANSI_EXTRA: Record<number, number> = {
  0x20ac: 0x80, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84, 0x2026: 0x85,
  0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89, 0x0160: 0x8a,
  0x2039: 0x8b, 0x0152: 0x8c, 0x017d: 0x8e, 0x2018: 0x91, 0x2019: 0x92,
  0x201c: 0x93, 0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97,
  0x02dc: 0x98, 0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c,
  0x017e: 0x9e, 0x0178: 0x9f,
};

/** Convierte texto Unicode a bytes WinAnsi (lo no representable pasa a "?"). */
export function codificarWinAnsi(texto: string): number[] {
  const bytes: number[] = [];
  for (const caracter of texto.normalize('NFC')) {
    const cp = caracter.codePointAt(0) ?? 63;
    if (cp === 0x202f || cp === 0x2009 || cp === 0x2007) bytes.push(0x20);
    else if (cp === 0x2212) bytes.push(0x2d);
    else if (cp >= 0x20 && cp <= 0x7e) bytes.push(cp);
    else if (cp >= 0xa0 && cp <= 0xff) bytes.push(cp);
    else if (WIN_ANSI_EXTRA[cp] !== undefined) bytes.push(WIN_ANSI_EXTRA[cp]);
    else if (cp === 0x09 || cp === 0x0a || cp === 0x0d) bytes.push(0x20);
    else bytes.push(0x3f);
  }
  return bytes;
}

export function anchoTexto(texto: string, tamano: number, negrita = false) {
  const tabla = negrita ? ANCHOS_HELVETICA_BOLD : ANCHOS_HELVETICA;
  let total = 0;
  for (const byte of codificarWinAnsi(texto)) {
    total += byte >= 32 ? tabla[byte - 32] || 556 : 0;
  }
  return (total * tamano) / 1000;
}

function literalPdf(texto: string) {
  let salida = '(';
  for (const byte of codificarWinAnsi(texto)) {
    if (byte === 0x28 || byte === 0x29 || byte === 0x5c) {
      salida += '\\' + String.fromCharCode(byte);
    } else if (byte < 0x20 || byte > 0x7e) {
      salida += '\\' + byte.toString(8).padStart(3, '0');
    } else {
      salida += String.fromCharCode(byte);
    }
  }
  return salida + ')';
}

function colorPdf(hex: string | undefined, fallback = '#111111') {
  const limpio = (hex || fallback).replace('#', '');
  const valor =
    limpio.length === 3
      ? limpio.split('').map((c) => c + c).join('')
      : limpio.padEnd(6, '0').slice(0, 6);
  const r = parseInt(valor.slice(0, 2), 16) / 255;
  const g = parseInt(valor.slice(2, 4), 16) / 255;
  const b = parseInt(valor.slice(4, 6), 16) / 255;
  return [r, g, b].map((n) => (Number.isFinite(n) ? n.toFixed(3) : '0')).join(' ');
}

const n2 = (valor: number) => Number(valor.toFixed(2)).toString();

type Palabra = { text: string; bold: boolean };
type Linea = Palabra[];

/** Parte un conjunto de fragmentos (con negrita) en líneas que caben en `ancho`. */
export function partirEnLineas(runs: PdfRun[], tamano: number, ancho: number): Linea[] {
  const palabras: Palabra[] = [];
  for (const run of runs) {
    const partes = run.text.replace(/\s+/g, ' ').split(' ');
    partes.forEach((parte, indice) => {
      if (indice > 0) palabras.push({ text: ' ', bold: Boolean(run.bold) });
      if (parte) palabras.push({ text: parte, bold: Boolean(run.bold) });
    });
  }

  const lineas: Linea[] = [];
  let actual: Linea = [];
  let anchoActual = 0;
  for (const palabra of palabras) {
    const w = anchoTexto(palabra.text, tamano, palabra.bold);
    if (palabra.text === ' ') {
      if (actual.length === 0) continue;
      actual.push(palabra);
      anchoActual += w;
      continue;
    }
    if (anchoActual + w > ancho && actual.length > 0) {
      while (actual.length && actual[actual.length - 1].text === ' ') actual.pop();
      lineas.push(actual);
      actual = [];
      anchoActual = 0;
    }
    // Palabra más larga que la línea: se corta por caracteres.
    if (w > ancho) {
      let trozo = '';
      for (const caracter of palabra.text) {
        if (anchoTexto(trozo + caracter, tamano, palabra.bold) > ancho && trozo) {
          lineas.push([{ text: trozo, bold: palabra.bold }]);
          trozo = '';
        }
        trozo += caracter;
      }
      actual = [{ text: trozo, bold: palabra.bold }];
      anchoActual = anchoTexto(trozo, tamano, palabra.bold);
      continue;
    }
    actual.push(palabra);
    anchoActual += w;
  }
  while (actual.length && actual[actual.length - 1].text === ' ') actual.pop();
  if (actual.length) lineas.push(actual);
  return lineas.length ? lineas : [[]];
}

/** Une palabras consecutivas con el mismo estilo para dibujarlas de una vez. */
function segmentos(linea: Linea): Linea {
  const salida: Linea = [];
  for (const palabra of linea) {
    const ultimo = salida[salida.length - 1];
    if (ultimo && ultimo.bold === palabra.bold) ultimo.text += palabra.text;
    else salida.push({ ...palabra });
  }
  return salida;
}

const PAGINA_ANCHO = 595.28;
const PAGINA_ALTO = 841.89;
const MARGEN_X = 40;
const MARGEN_SUPERIOR = 42;
const MARGEN_INFERIOR = 50;
const ANCHO_UTIL = PAGINA_ANCHO - MARGEN_X * 2;
const ALTO_UTIL = PAGINA_ALTO - MARGEN_SUPERIOR - MARGEN_INFERIOR;

const TAMANO_TITULO: Record<1 | 2 | 3, number> = { 1: 19, 2: 15, 3: 12 };
const TAMANO_PARRAFO = 10;
const INTERLINEADO = 1.3;
const TAMANO_TABLA = 8.5;
const PADDING_CELDA = 4;

class Maquetador {
  paginas: string[][] = [];
  y = 0; // distancia desde el borde superior del área útil

  constructor() {
    this.nuevaPagina();
  }

  get ops() {
    return this.paginas[this.paginas.length - 1];
  }

  nuevaPagina() {
    this.paginas.push([]);
    this.y = 0;
  }

  restante() {
    return ALTO_UTIL - this.y;
  }

  asegurar(alto: number) {
    if (alto > this.restante() && this.y > 0) this.nuevaPagina();
  }

  // Convierte "y desde arriba del área útil" a coordenada PDF.
  yPdf(y: number) {
    return PAGINA_ALTO - MARGEN_SUPERIOR - y;
  }

  texto(x: number, yLinea: number, texto: string, tamano: number, negrita: boolean, color?: string) {
    if (!texto) return;
    this.ops.push(
      `BT ${colorPdf(color)} rg /${negrita ? 'F2' : 'F1'} ${n2(tamano)} Tf 1 0 0 1 ${n2(x)} ${n2(
        this.yPdf(yLinea)
      )} Tm ${literalPdf(texto)} Tj ET`
    );
  }

  rect(x: number, yTop: number, w: number, h: number, borde?: string, relleno?: string, grosor = 0.6) {
    this.ops.push(this.rectOp(x, yTop, w, h, borde, relleno, grosor));
  }

  rectOp(x: number, yTop: number, w: number, h: number, borde?: string, relleno?: string, grosor = 0.6) {
    const partes: string[] = ['q'];
    if (relleno) partes.push(`${colorPdf(relleno)} rg`);
    if (borde) partes.push(`${colorPdf(borde)} RG ${n2(grosor)} w`);
    partes.push(`${n2(x)} ${n2(this.yPdf(yTop + h))} ${n2(w)} ${n2(h)} re`);
    partes.push(relleno && borde ? 'B' : relleno ? 'f' : 'S');
    partes.push('Q');
    return partes.join(' ');
  }

  linea(x1: number, y: number, x2: number, color = '#dddddd') {
    this.ops.push(
      `q ${colorPdf(color)} RG 0.6 w ${n2(x1)} ${n2(this.yPdf(y))} m ${n2(x2)} ${n2(this.yPdf(y))} l S Q`
    );
  }

  lineasTexto(x: number, lineas: Linea[], tamano: number, color?: string) {
    const alto = tamano * INTERLINEADO;
    for (const linea of lineas) {
      let cursor = x;
      const base = this.y + tamano * 0.95;
      for (const palabra of segmentos(linea)) {
        this.texto(cursor, base, palabra.text, tamano, palabra.bold, color);
        cursor += anchoTexto(palabra.text, tamano, palabra.bold);
      }
      this.y += alto;
    }
  }
}

function tamanoParrafo(bloque: Extract<PdfBlock, { kind: 'paragraph' }>) {
  return bloque.size || TAMANO_PARRAFO;
}

/** Alto aproximado de un bloque con un ancho disponible dado. */
function medir(bloque: PdfBlock, ancho: number): number {
  switch (bloque.kind) {
    case 'heading': {
      const t = TAMANO_TITULO[bloque.level];
      return partirEnLineas([{ text: bloque.text, bold: true }], t, ancho).length * t * 1.2 + t * 0.55 + 4;
    }
    case 'paragraph': {
      const t = tamanoParrafo(bloque);
      return partirEnLineas(bloque.runs, t, ancho).length * t * INTERLINEADO + 5;
    }
    case 'boxes': {
      const filas = Math.ceil(bloque.items.length / 4);
      return filas * 36 + (filas - 1) * 6 + 10;
    }
    case 'box':
      return bloque.blocks.reduce((t, b) => t + medir(b, ancho - 24), 0) + 20 + 12;
    case 'pre':
      return bloque.text.split('\n').length * 9 * INTERLINEADO + 14;
    case 'rule':
      return 16;
    case 'pageBreak':
      return 0;
    case 'group':
      return bloque.blocks.reduce((t, b) => t + medir(b, ancho), 0);
    case 'table': {
      const anchos = anchosColumnas(bloque, ancho);
      const altoFila = (celdas: string[], negrita: boolean) =>
        Math.max(
          ...celdas.map(
            (c, i) => partirEnLineas([{ text: c, bold: negrita }], TAMANO_TABLA, anchos[i] - PADDING_CELDA * 2).length
          ),
          1
        ) * TAMANO_TABLA * 1.25 + PADDING_CELDA * 2;
      return (
        altoFila(bloque.header, true) +
        bloque.rows.reduce((t, fila) => t + altoFila(fila.map((c) => c.text), false), 0) +
        10
      );
    }
  }
}

function anchosColumnas(tabla: Extract<PdfBlock, { kind: 'table' }>, ancho: number) {
  const columnas = Math.max(tabla.header.length, ...tabla.rows.map((f) => f.length), 1);
  const naturales: number[] = [];
  for (let i = 0; i < columnas; i += 1) {
    const textos = [tabla.header[i] || '', ...tabla.rows.map((f) => f[i]?.text || '')];
    const maximo = Math.max(
      ...textos.map((t, j) => anchoTexto(t, TAMANO_TABLA, j === 0 || Boolean(tabla.rows[j - 1]?.[i]?.bold)))
    );
    naturales.push(Math.min(Math.max(maximo + PADDING_CELDA * 2 + 2, 34), ancho * 0.6));
  }
  const suma = naturales.reduce((a, b) => a + b, 0);
  if (suma <= ancho) {
    // Reparte el sobrante proporcionalmente para ocupar todo el ancho.
    return naturales.map((w) => w + ((ancho - suma) * w) / suma);
  }
  return naturales.map((w) => (w * ancho) / suma);
}

function pintarBloque(m: Maquetador, bloque: PdfBlock, x: number, ancho: number) {
  switch (bloque.kind) {
    case 'pageBreak':
      if (m.y > 0) m.nuevaPagina();
      return;
    case 'group': {
      const alto = medir(bloque, ancho);
      if (alto <= ALTO_UTIL) m.asegurar(alto);
      for (const hijo of bloque.blocks) pintarBloque(m, hijo, x, ancho);
      return;
    }
    case 'heading': {
      const t = TAMANO_TITULO[bloque.level];
      // Mantener el título con al menos un poco de contenido debajo.
      m.asegurar(medir(bloque, ancho) + 50);
      m.y += t * 0.35;
      const lineas = partirEnLineas([{ text: bloque.text, bold: true }], t, ancho);
      for (const linea of lineas) {
        m.texto(x, m.y + t * 0.95, linea.map((p) => p.text).join(''), t, true);
        m.y += t * 1.2;
      }
      m.y += t * 0.2 + 4;
      return;
    }
    case 'paragraph': {
      const t = tamanoParrafo(bloque);
      const lineas = partirEnLineas(bloque.runs, t, ancho);
      for (const linea of lineas) {
        m.asegurar(t * INTERLINEADO);
        m.lineasTexto(x, [linea], t, bloque.color);
      }
      m.y += 5;
      return;
    }
    case 'boxes': {
      const hueco = 6;
      const w = (ancho - hueco * 3) / 4;
      const h = 36;
      const filas = Math.ceil(bloque.items.length / 4);
      m.asegurar(filas * (h + hueco) + 4);
      m.y += 4;
      for (let f = 0; f < filas; f += 1) {
        bloque.items.slice(f * 4, f * 4 + 4).forEach((item, c) => {
          const bx = x + c * (w + hueco);
          m.rect(bx, m.y, w, h, '#d6d6d6');
          m.texto(bx + 7, m.y + 14, item.title, 9.5, true);
          m.texto(bx + 7, m.y + 28, item.value, 9.5, false);
        });
        m.y += h + (f < filas - 1 ? hueco : 0);
      }
      m.y += 8;
      return;
    }
    case 'box': {
      const alto = medir(bloque, ancho) - 12;
      if (alto <= ALTO_UTIL) m.asegurar(alto + 12);
      const inicio = m.y;
      const paginaInicio = m.ops;
      const indiceInicio = paginaInicio.length;
      m.y += 10;
      for (const hijo of bloque.blocks) pintarBloque(m, hijo, x + 12, ancho - 24);
      m.y += 6;
      // El marco se inserta antes del texto para que el relleno quede debajo.
      // Si el contenido no cupo en la página, el marco llega hasta el final de esa hoja.
      const altoReal = paginaInicio === m.ops ? m.y - inicio : ALTO_UTIL - inicio;
      paginaInicio.splice(
        indiceInicio,
        0,
        m.rectOp(x, inicio, ancho, altoReal, bloque.borderColor || '#111111', bloque.fill, 1.2)
      );
      m.y += 12;
      return;
    }
    case 'pre': {
      const lineas = bloque.text.split('\n');
      m.y += 3;
      for (const linea of lineas) {
        m.asegurar(9 * INTERLINEADO);
        m.lineasTexto(x + 6, partirEnLineas([{ text: linea }], 9, ancho - 12), 9, '#333333');
      }
      m.y += 8;
      return;
    }
    case 'rule':
      m.y += 8;
      if (m.y < ALTO_UTIL) m.linea(x, m.y, x + ancho);
      m.y += 8;
      return;
    case 'table':
      pintarTabla(m, bloque, x, ancho);
      return;
  }
}

function pintarTabla(m: Maquetador, tabla: Extract<PdfBlock, { kind: 'table' }>, x: number, ancho: number) {
  const anchos = anchosColumnas(tabla, ancho);
  const preparar = (celdas: { text: string; bold?: boolean }[]) => {
    const lineas = celdas.map((c, i) =>
      partirEnLineas([{ text: c.text, bold: c.bold }], TAMANO_TABLA, (anchos[i] || 40) - PADDING_CELDA * 2)
    );
    const alto = Math.max(...lineas.map((l) => l.length), 1) * TAMANO_TABLA * 1.25 + PADDING_CELDA * 2;
    return { lineas, alto };
  };

  const cabecera = preparar(tabla.header.map((text) => ({ text, bold: true })));
  const pintarFila = (fila: { lineas: Linea[][]; alto: number }, relleno?: string) => {
    let cx = x;
    fila.lineas.forEach((lineasCelda, i) => {
      const w = anchos[i] || 40;
      m.rect(cx, m.y, w, fila.alto, '#d6d6d6', relleno);
      let ly = m.y + PADDING_CELDA;
      for (const linea of lineasCelda) {
        let lx = cx + PADDING_CELDA;
        for (const palabra of segmentos(linea)) {
          m.texto(lx, ly + TAMANO_TABLA * 0.95, palabra.text, TAMANO_TABLA, palabra.bold);
          lx += anchoTexto(palabra.text, TAMANO_TABLA, palabra.bold);
        }
        ly += TAMANO_TABLA * 1.25;
      }
      cx += w;
    });
    m.y += fila.alto;
  };

  const filas = tabla.rows.map((f) => preparar(f));
  m.asegurar(cabecera.alto + (filas[0]?.alto || 0));
  m.y += 2;
  pintarFila(cabecera, tabla.headerFill || '#f2f2f2');
  for (const fila of filas) {
    if (fila.alto > m.restante()) {
      m.nuevaPagina();
      pintarFila(cabecera, tabla.headerFill || '#f2f2f2');
    }
    pintarFila(fila);
  }
  m.y += 10;
}

/** Genera los bytes de un PDF A4 vertical a partir de bloques. */
export function generarPdfSimple(bloques: PdfBlock[], opciones: SimplePdfOptions = {}): Uint8Array {
  const m = new Maquetador();
  for (const bloque of bloques) pintarBloque(m, bloque, MARGEN_X, ANCHO_UTIL);
  if (m.paginas.length > 1 && m.paginas[m.paginas.length - 1].length === 0) m.paginas.pop();

  const total = m.paginas.length;
  m.paginas.forEach((ops, indice) => {
    const pie = `Página ${indice + 1} de ${total}`;
    const yPie = PAGINA_ALTO - 28;
    if (opciones.footerLeft) {
      ops.push(
        `BT ${colorPdf('#777777')} rg /F1 7.5 Tf 1 0 0 1 ${n2(MARGEN_X)} ${n2(PAGINA_ALTO - yPie)} Tm ${literalPdf(
          opciones.footerLeft
        )} Tj ET`
      );
    }
    ops.push(
      `BT ${colorPdf('#777777')} rg /F1 7.5 Tf 1 0 0 1 ${n2(
        PAGINA_ANCHO - MARGEN_X - anchoTexto(pie, 7.5)
      )} ${n2(PAGINA_ALTO - yPie)} Tm ${literalPdf(pie)} Tj ET`
    );
  });

  // Objetos: 1 catálogo, 2 páginas, 3 F1, 4 F2, 5 info, luego (página, contenido) por hoja.
  const objetos: string[] = [];
  const idsPaginas = m.paginas.map((_, i) => 6 + i * 2);
  objetos[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objetos[2] = `<< /Type /Pages /Kids [${idsPaginas.map((id) => `${id} 0 R`).join(' ')}] /Count ${total} >>`;
  objetos[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objetos[4] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';
  objetos[5] = `<< /Producer (Mitico Baby App) /Title ${literalPdf(opciones.title || 'Documento')} >>`;
  m.paginas.forEach((ops, i) => {
    const contenido = ops.join('\n');
    objetos[6 + i * 2] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGINA_ANCHO} ${PAGINA_ALTO}] ` +
      `/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${7 + i * 2} 0 R >>`;
    objetos[7 + i * 2] = `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`;
  });

  // Todo el contenido es ASCII (los bytes > 127 van como escapes octales),
  // así que longitud en caracteres = longitud en bytes.
  let salida = '%PDF-1.4\n%âãÏÓ\n';
  const offsets: number[] = [];
  for (let id = 1; id < objetos.length; id += 1) {
    offsets[id] = salida.length;
    salida += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
  }
  const inicioXref = salida.length;
  salida += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objetos.length; id += 1) {
    salida += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
  }
  salida += `trailer\n<< /Size ${objetos.length} /Root 1 0 R /Info 5 0 R >>\nstartxref\n${inicioXref}\n%%EOF\n`;

  const bytes = new Uint8Array(salida.length);
  for (let i = 0; i < salida.length; i += 1) bytes[i] = salida.charCodeAt(i) & 0xff;
  return bytes;
}
