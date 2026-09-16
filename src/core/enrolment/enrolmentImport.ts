import type {
  AltaImportadaIncompletaApp,
  AltaImportadaPegadoApp,
  AltaNivelInicialApp,
  AltaNivelInicialFormApp,
  EnrolmentModality,
  OcioFixedDay,
  ParsedEnrolmentList,
  TestNivelPublicoRespuestasApp,
} from './enrolmentTypes';

export const VERSION_PARSER_ALTAS_IMPORT_APP = '2026-09-12-v5';

export function altaNivelInicialFormVacioApp(): AltaNivelInicialFormApp {
  return {
    nombre: '',
    fechaNacimiento: '',
    modalidad: 'BABY',
    telefono: '',
    ocioDiaFijo: '',
  };
}

export function normalizarIdentidadAltaImportadaApp(
  valor: string | null | undefined
): string {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizarTelefonoAltaImportadaApp(
  valor: string | null | undefined
): string {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length === 11 && digitos.startsWith('34')) return digitos.slice(2);
  return digitos;
}

export function normalizarModalidadAltaImportadaApp(
  valor: string | null | undefined
): EnrolmentModality | '' {
  const tokens = normalizarIdentidadAltaImportadaApp(valor)
    .split(/[^A-Z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.includes('BABY')) return 'BABY';
  if (tokens.includes('OCIO')) return 'OCIO';
  if (tokens.includes('INTENSIVO') || tokens.includes('INTENSIVOS')) return 'INTENSIVOS';
  return '';
}

export function normalizarDiaOcioAltaImportadaApp(
  valor: string | null | undefined
): OcioFixedDay {
  const limpia = normalizarIdentidadAltaImportadaApp(valor);
  if (limpia.includes('JUEVES')) return 'Jueves';
  if (limpia.includes('SABADO')) return 'Sábado';
  if (limpia.includes('DOMINGO')) return 'Domingo';
  return '';
}

export function normalizarFechaAltaImportadaApp(
  valor: string | null | undefined
): string {
  const limpia = String(valor || '').trim();
  if (!limpia) return '';

  const iso = limpia.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (iso) {
    const [, anio, mes, dia] = iso;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  const europea = limpia.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
  if (europea) {
    const [, dia, mes, anio] = europea;
    return `${anio}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;
  }

  const serialExcel = Number(limpia.replace(',', '.'));
  if (Number.isFinite(serialExcel) && serialExcel >= 20000 && serialExcel <= 80000) {
    const fecha = new Date(Date.UTC(1899, 11, 30) + Math.round(serialExcel) * 86400000);
    return fecha.toISOString().slice(0, 10);
  }

  return '';
}

export function normalizarTelefonoFormularioAltaImportadaApp(
  valor: string | null | undefined
): string {
  const texto = String(valor || '').trim().replace(/^'+/, '').replace(/\.0$/, '');
  const soloTelefono = texto.replace(/[^\d+]/g, '');
  if (soloTelefono.startsWith('+34') && soloTelefono.length === 12) return soloTelefono.slice(3);
  if (soloTelefono.startsWith('34') && soloTelefono.length === 11) return soloTelefono.slice(2);
  return soloTelefono;
}

export function esCabeceraListadoAltasPegadoApp(celdas: string[]): boolean {
  const cabeceras = celdas.map(normalizarIdentidadAltaImportadaApp);
  return (
    cabeceras.some((item) => item.includes('NOMBRE')) &&
    cabeceras.some((item) => item.includes('MODALIDAD'))
  );
}

export function parsearListadoAltasPegadoApp(texto: string): ParsedEnrolmentList {
  const lineas = String(texto || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((linea) => linea.trimEnd())
    .filter((linea) => linea.trim().length > 0);

  if (lineas.length === 0) return { filas: [], invalidas: 0, filasInvalidas: [] };

  const filasCeldas = lineas.map((linea) => linea.split('\t').map((celda) => celda.trim()));
  const hayCabecera = esCabeceraListadoAltasPegadoApp(filasCeldas[0]);
  const cabeceras = hayCabecera
    ? filasCeldas[0].map(normalizarIdentidadAltaImportadaApp)
    : [];
  const indiceCabecera = (predicado: (valor: string) => boolean) => cabeceras.findIndex(predicado);

  const indiceNombre = hayCabecera
    ? indiceCabecera((valor) => valor === 'NOMBRE' || valor === 'NOMBRES' || valor.includes('NOMBRE COMPLETO'))
    : -1;
  const indiceApellido1 = hayCabecera
    ? indiceCabecera((valor) => valor.includes('APELLIDO') && (/^1\b/.test(valor) || valor.includes('1ER') || valor.includes('PRIMER')))
    : -1;
  const indiceApellido2 = hayCabecera
    ? indiceCabecera((valor) => valor.includes('APELLIDO') && (/^2\b/.test(valor) || valor.includes('2O') || valor.includes('SEGUNDO')))
    : -1;
  const indiceFecha = hayCabecera
    ? indiceCabecera((valor) => valor.includes('FECHA') && (valor.includes('NAC') || valor.includes('NACIMIENTO')))
    : -1;
  const indiceTelefono = hayCabecera
    ? indiceCabecera((valor) => valor === 'TEL' || valor.startsWith('TEL ') || valor.includes('TELEFONO') || valor.includes('MOVIL'))
    : -1;
  const indiceModalidad = hayCabecera ? indiceCabecera((valor) => valor.includes('MODALIDAD')) : -1;
  const indiceDiaOcio = hayCabecera
    ? indiceCabecera((valor) => valor === 'DIA' || (valor.includes('DIA') && (valor.includes('OCIO') || valor.includes('FIJO'))))
    : -1;

  const datos = hayCabecera ? filasCeldas.slice(1) : filasCeldas;
  const clavesVistas = new Set<string>();
  const filas: AltaImportadaPegadoApp[] = [];
  const filasInvalidas: AltaImportadaIncompletaApp[] = [];

  datos.forEach((celdas, indice) => {
    const filaOrigen = indice + (hayCabecera ? 2 : 1);
    let nombre = '';
    let fechaNacimiento = '';
    let telefono = '';
    let modalidad: EnrolmentModality | '' = '';
    let ocioDiaFijo: OcioFixedDay = '';

    if (hayCabecera) {
      nombre = [indiceNombre, indiceApellido1, indiceApellido2]
        .filter((posicion) => posicion >= 0)
        .map((posicion) => celdas[posicion] || '')
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      fechaNacimiento = indiceFecha >= 0 ? normalizarFechaAltaImportadaApp(celdas[indiceFecha]) : '';
      telefono = indiceTelefono >= 0 ? normalizarTelefonoFormularioAltaImportadaApp(celdas[indiceTelefono]) : '';
      modalidad = indiceModalidad >= 0 ? normalizarModalidadAltaImportadaApp(celdas[indiceModalidad]) : '';
      ocioDiaFijo = indiceDiaOcio >= 0 ? normalizarDiaOcioAltaImportadaApp(celdas[indiceDiaOcio]) : '';
    } else {
      const indiceFechaDetectada = celdas.findIndex((celda) => Boolean(normalizarFechaAltaImportadaApp(celda)));
      const modalidadesDetectadas = Array.from(new Set(celdas.map(normalizarModalidadAltaImportadaApp).filter(Boolean))) as EnrolmentModality[];
      const indiceModalidadDetectada = modalidadesDetectadas.length === 1
        ? celdas.findIndex((celda) => normalizarModalidadAltaImportadaApp(celda) === modalidadesDetectadas[0])
        : -1;
      const indiceTelefonoDetectado = celdas.findIndex((celda, posicion) => {
        if (posicion === indiceFechaDetectada) return false;
        const digitos = normalizarTelefonoAltaImportadaApp(celda);
        return digitos.length >= 9 && digitos.length <= 12;
      });

      fechaNacimiento = indiceFechaDetectada >= 0 ? normalizarFechaAltaImportadaApp(celdas[indiceFechaDetectada]) : '';
      telefono = indiceTelefonoDetectado >= 0 ? normalizarTelefonoFormularioAltaImportadaApp(celdas[indiceTelefonoDetectado]) : '';
      modalidad = indiceModalidadDetectada >= 0 ? normalizarModalidadAltaImportadaApp(celdas[indiceModalidadDetectada]) : '';
      ocioDiaFijo = celdas.map(normalizarDiaOcioAltaImportadaApp).find(Boolean) || '';
      const finNombre = indiceFechaDetectada > 0 ? indiceFechaDetectada : Math.min(3, celdas.length);
      nombre = celdas.slice(0, finNombre).filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
    }

    const modalidadesFila = Array.from(new Set(celdas.map(normalizarModalidadAltaImportadaApp).filter(Boolean))) as EnrolmentModality[];
    if (modalidadesFila.length > 1) {
      filasInvalidas.push({
        filaOrigen,
        texto: celdas.filter(Boolean).join(' · ') || '(fila vacía)',
        motivo: `Modalidad ambigua: aparecen ${modalidadesFila.join(' y ')}.`,
      });
      return;
    }
    if (modalidadesFila.length === 1) modalidad = modalidadesFila[0];

    if (!nombre || !fechaNacimiento || !telefono || !modalidad) {
      const faltan = [
        !nombre ? 'nombre' : '',
        !fechaNacimiento ? 'fecha de nacimiento' : '',
        !telefono ? 'teléfono' : '',
        !modalidad ? 'modalidad' : '',
      ].filter(Boolean);
      filasInvalidas.push({
        filaOrigen,
        texto: celdas.filter(Boolean).join(' · ') || '(fila vacía)',
        motivo: `Falta ${faltan.join(', ')}.`,
      });
      return;
    }

    const nombreNormalizado = normalizarIdentidadAltaImportadaApp(nombre);
    const clave = `${nombreNormalizado}|${fechaNacimiento}|${normalizarTelefonoAltaImportadaApp(telefono)}`;
    if (!nombreNormalizado) {
      filasInvalidas.push({ filaOrigen, texto: celdas.filter(Boolean).join(' · ') || '(sin nombre)', motivo: 'El nombre no se puede interpretar.' });
      return;
    }
    if (clavesVistas.has(clave)) {
      filasInvalidas.push({ filaOrigen, texto: celdas.filter(Boolean).join(' · ') || nombre, motivo: 'Fila duplicada dentro del listado pegado.' });
      return;
    }

    clavesVistas.add(clave);
    filas.push({ clave, nombre, fechaNacimiento, modalidad, telefono, ocioDiaFijo: modalidad === 'OCIO' ? ocioDiaFijo : '', filaOrigen });
  });

  return { filas, invalidas: filasInvalidas.length, filasInvalidas };
}

export function coincideAltaImportadaConAltaExistenteApp(
  fila: AltaImportadaPegadoApp,
  alta: AltaNivelInicialApp
): boolean {
  const nombreImportado = normalizarIdentidadAltaImportadaApp(fila.nombre);
  const nombreExistente = normalizarIdentidadAltaImportadaApp(alta.nombre_completo);
  const telefonoImportado = normalizarTelefonoAltaImportadaApp(fila.telefono);
  const telefonoExistente = normalizarTelefonoAltaImportadaApp(alta.telefono);
  const mismaFecha = Boolean(fila.fechaNacimiento) && Boolean(alta.fecha_nacimiento) && fila.fechaNacimiento === alta.fecha_nacimiento;
  const mismoNombre = Boolean(nombreImportado) && nombreImportado === nombreExistente;
  const mismoTelefono = Boolean(telefonoImportado) && telefonoImportado === telefonoExistente;
  return (mismoNombre && mismaFecha) || (mismoNombre && mismoTelefono) || (mismaFecha && mismoTelefono);
}

export function testNivelPublicoRespuestasVaciasApp(): TestNivelPublicoRespuestasApp {
  return {
    experiencia: '',
    desplazamiento: '',
    frenado: '',
    giros: '',
    remonte: '',
    pista: '',
    controlVelocidad: '',
    tecnica: '',
    observacionesEntrenador: [],
    observacionEntrenadorOtra: '',
    observacionesCoordinacion: '',
  };
}
