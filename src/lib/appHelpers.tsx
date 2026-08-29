import React from 'react';
import { FOTO_MITICO_HERO } from '../assets/imagenes';

export function AyudaReporteEntrenador({ nivel }: { nivel?: string | null }) {
  const nivelBase = (nivel || '').toUpperCase().trim() || 'A+';
  const perfil = perfilAyudaReporteEntrenador(nivelBase);

  const filas = [
    ['Nivel', perfil.nivel],
    ['Técnica', perfil.tecnica],
    ['Autonomía', perfil.autonomia],
    ['Remontes', perfil.remontes],
    ['Qué escribir', perfil.observacion],
    ['Siguiente paso', perfil.recomendacion],
  ];

  return (
    <div style={ayudaReporteEntrenadorContenido}>
      <p style={{ margin: '0 0 8px', color: '#475569' }}>
        Guía orientativa para no inventar el reporte. El entrenador ajusta según lo visto en pista.
      </p>
      <table style={tablaAyudaReporteEntrenador}>
        <tbody>
          {filas.map(([campo, criterio]) => (
            <tr key={campo}>
              <th style={celdaTituloAyudaReporte}>{campo}</th>
              <td style={celdaTextoAyudaReporte}>{criterio}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function perfilAyudaReporteEntrenador(nivel: string) {
  const limpio = nivel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase();

  if (limpio.includes('INICIACION') || limpio === 'A') {
    return {
      nivel: 'INICIACIÓN / A: confianza, deslizamiento y cuña básica.',
      tecnica: 'Primer contacto, deslizamiento directo, cuña de frenado o control básico en cuña.',
      autonomia: 'Necesita ayuda constante/puntual o empieza autonomía en pista pequeña.',
      remontes: 'Cinta. No forzar percha/silla.',
      observacion: 'Indicar si disfruta, si frena, si se bloquea, si sigue fila y si necesita ayuda con material/cinta.',
      recomendacion: 'Mantener en pista pequeña hasta frenar y girar con seguridad.',
    };
  }

  if (limpio.includes('A+')) {
    return {
      nivel: 'A+: cuña sólida, giros aislados o giros a un solo lado.',
      tecnica: 'Cuña sólida, giro a un lado, giro al otro lado, manos delante y mirada al giro.',
      autonomia: 'Autonomía básica en pista pequeña; todavía no pista grande automática.',
      remontes: 'Cinta segura; percha solo si Jose/entrenador lo ve claro.',
      observacion: 'Escribir si encadena o no encadena, lado de giro más débil, control de velocidad y actitud.',
      recomendacion: 'Pasar hacia B solo cuando haga giros continuados y controle velocidad.',
    };
  }

  if (limpio === 'B' || limpio.includes('B+')) {
    return {
      nivel: 'B / B+: buenos giros continuados, ritmo y control.',
      tecnica: 'Giros continuados, control de velocidad con giros, manos delante, avión/palmada exterior si procede.',
      autonomia: 'Transición a pista grande; mantener fila y distancia.',
      remontes: 'Cinta/percha/silla según seguridad y control emocional.',
      observacion: 'Indicar si baja recto, si acaba los giros, si respeta fila y si puede seguir ritmo de grupo.',
      recomendacion: 'Mantener/transicionar a pista grande; separar si hay mucha diferencia con C/D.',
    };
  }

  if (limpio === 'C' || limpio.includes('C+')) {
    return {
      nivel: 'C / C+: técnica limpia, autonomía y precisión.',
      tecnica: 'Giros redondos, presión exterior, mirada anticipada, brazos estables y ritmo constante.',
      autonomia: 'Autónomo en pista grande y remontes.',
      remontes: 'Percha/silla/cinta sin ayuda, manteniendo orden de grupo.',
      observacion: 'Escribir corrección técnica principal: brazos, exterior, rigidez, velocidad, mirada o ritmo.',
      recomendacion: 'Seguir precisión técnica y empezar tareas de ritmo/trazado suave.',
    };
  }

  return {
    nivel: 'D / D+: ritmo alto, trazado y precompetición suave.',
    tecnica: 'Trazado sencillo, cambios de ritmo, anticipación, presión exterior y precisión.',
    autonomia: 'Autonomía total.',
    remontes: 'Autónomo en todos los remontes permitidos.',
    observacion: 'Indicar ritmo, control, técnica principal a corregir y si acepta ejercicios exigentes.',
    recomendacion: 'Mantener trabajo de equipo/precompetición suave sin perder seguridad.',
  };
}

export function CampoSelect(props: {
  label: string;
  value: string;
  opciones: string[];
  onChange: (valor: string) => void;
}) {
  return (
    <label style={labelCampo}>
      {props.label}
      <select
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        style={selectCampo}
      >
        {props.opciones.map((opcion) => (
          <option key={opcion || 'sin-seleccionar'} value={opcion}>
            {opcion || 'Sin seleccionar'}
          </option>
        ))}
      </select>
    </label>
  );
}

export function agruparPorEntrenador(items: DisponibilidadEntrenador[]) {
  const mapa = new Map<
    string,
    {
      entrenador: string;
      semana: string;
      estadoDisponibilidad: string;
      turnos: DisponibilidadEntrenador[];
    }
  >();

  items.forEach((item) => {
    if (!mapa.has(item.entrenador)) {
      mapa.set(item.entrenador, {
        entrenador: item.entrenador,
        semana: item.semana,
        estadoDisponibilidad: item.estado_disponibilidad,
        turnos: [],
      });
    }

    mapa.get(item.entrenador)?.turnos.push(item);
  });

  return Array.from(mapa.values());
}

export function agruparReportesPorEntrenador(items: ReportePendiente[]) {
  const mapa = new Map<
    string,
    { entrenador: string; reportes: ReportePendiente[] }
  >();

  items.forEach((item) => {
    if (!mapa.has(item.entrenador)) {
      mapa.set(item.entrenador, {
        entrenador: item.entrenador,
        reportes: [],
      });
    }

    mapa.get(item.entrenador)?.reportes.push(item);
  });

  return Array.from(mapa.values());
}

export function agruparGruposPorEntrenador(items: GrupoEntrenadorApp[]) {
  const mapa = new Map<
    string,
    { entrenador: string; grupos: GrupoEntrenadorApp[] }
  >();

  items.forEach((item) => {
    if (!mapa.has(item.entrenador)) {
      mapa.set(item.entrenador, {
        entrenador: item.entrenador,
        grupos: [],
      });
    }

    mapa.get(item.entrenador)?.grupos.push(item);
  });

  return Array.from(mapa.values());
}

export function formatearAlumnosDetalle(texto: string | null) {
  if (!texto) {
    return <p style={{ margin: 0 }}>Sin alumnos en el grupo</p>;
  }

  const lineas = texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {lineas.map((linea, index) => {
        const partes = linea.split(' · ');
        const nombre = partes[0] || linea;
        const info = partes.slice(1).join(' · ');

        return (
          <div key={`${nombre}-${index}`} style={miniTarjeta}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>- {nombre}</p>
            {info && <p style={{ margin: '6px 0 0 14px' }}>{info}</p>}
          </div>
        );
      })}
    </div>
  );
}

export function formatearAlumnosPlanning(texto: string | null) {
  if (!texto) {
    return <p style={{ margin: 0 }}>Sin alumnos</p>;
  }

  const lineas = texto
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean);

  return (
    <ul style={{ margin: 0, paddingLeft: 22 }}>
      {lineas.map((linea, index) => (
        <li key={`${linea}-${index}`} style={{ marginBottom: 6 }}>
          {linea.replace(/^[-•]\s*/, '')}
        </li>
      ))}
    </ul>
  );
}

export function formatearTrabajoDiario(texto: string | null) {
  if (!texto) {
    return <p style={{ margin: 0 }}>Sin trabajo diario definido.</p>;
  }

  const limpio = texto.trim();

  const puntos = limpio
    .split(/(?=\d+\.\s)/g)
    .map((punto) => punto.trim())
    .filter(Boolean);

  if (puntos.length <= 1) {
    return <p style={{ margin: 0 }}>{limpio}</p>;
  }

  return (
    <ol style={{ margin: 0, paddingLeft: 22 }}>
      {puntos.map((punto, index) => (
        <li key={`${punto}-${index}`} style={{ marginBottom: 6 }}>
          {punto.replace(/^\d+\.\s*/, '')}
        </li>
      ))}
    </ol>
  );
}

export function formatearObservaciones(texto: string | null) {
  const lineas = extraerObservacionesVisualesGrupoApp(texto, 12);

  if (lineas.length === 0) {
    return <p style={{ margin: 0 }}>Sin observaciones relevantes.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {lineas.map((linea, index) => {
        const separador = linea.indexOf(':');
        const nombre = separador >= 0 ? linea.slice(0, separador).trim() : '';
        const detalle = separador >= 0 ? linea.slice(separador + 1).trim() : linea;

        return (
          <div
            key={`${linea}-${index}`}
            style={{
              display: 'grid',
              gap: 3,
              textAlign: 'left',
              padding: '9px 10px',
              borderRadius: 12,
              background: '#ffffff',
              border: '1px solid #e2e8f0',
            }}
          >
            {nombre && <strong style={{ color: '#0f172a' }}>{nombre}:</strong>}
            <span style={{ color: '#334155', lineHeight: 1.35 }}>{detalle}</span>
          </div>
        );
      })}
    </div>
  );
}

export function limpiarDetalleObservacionVisualGrupoApp(detalle: string | null | undefined) {
  if (!detalle) return '';

  let limpio = String(detalle)
    .replace(/\s+/g, ' ')
    .replace(/\s*·\s*/g, ' · ')
    .trim();

  const patronesRuido = [
    /\bAlumno nuevo\.?/gi,
    /\bAlumno conocido\.?/gi,
    /\bFicha pendiente\.?/gi,
    /\bOK\.?/gi,
    /\bPendiente de nivel:\s*Jose debe asignar nivel antes de generar grupos\.?/gi,
    /\bPendiente de nivel:\s*Jos[ée] debe asignar nivel antes de generar grupos\.?/gi,
    /\bJose debe asignar nivel antes de generar grupos\.?/gi,
    /\bJos[ée] debe asignar nivel antes de generar grupos\.?/gi,
    /\bNivel estimado\.?/gi,
    /\bNivel real de ficha\.?/gi,
    /\bpendiente completar\.?/gi,
    /\bcompleta\.?/gi,
  ];

  patronesRuido.forEach((patron) => {
    limpio = limpio.replace(patron, '');
  });

  return limpio
    .replace(/(?:\s*·\s*){2,}/g, ' · ')
    .replace(/^\s*[·.:;,-]+\s*/g, '')
    .replace(/\s*[·.:;,-]+\s*$/g, '')
    .trim();
}

export function extraerObservacionesVisualesGrupoApp(texto: string | null | undefined, maxLineas = 12) {
  if (!texto) return [] as string[];

  const limpio = String(texto)
    .replace(/OBSERVACIONES\s+AUTOM[ÁA]TICAS\s+PARA\s+ENTRENADOR/gi, '')
    .replace(/OBSERVACIONES\s+JOSE/gi, '')
    .replace(/OBSERVACIONES\s+JOS[ÉE]/gi, '')
    .replace(/Observaciones\s+autom[áa]ticas\s+para\s+el\s+entrenador/gi, '')
    .replace(/Observaciones\s+autom[áa]ticas\s+para\s+entrenador/gi, '')
    .replace(/Observaciones\s+de\s+Jose/gi, '')
    .replace(/Observaciones\s+de\s+Jos[ée]/gi, '')
    .replace(/[•]/g, '\n')
    .replace(/\s*·\s*(?=\[|[A-ZÁÉÍÓÚÑ][a-záéíóúñ])/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .split('\n')
    .map((linea) => linea.trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!limpio) return [];

  const lineas: string[] = [];

  limpio
    .split('\n')
    .map((linea) => linea.trim().replace(/^[-•]+\s*/, ''))
    .filter(Boolean)
    .forEach((linea) => {
      const separador = linea.indexOf(':');
      if (separador > 0) {
        const nombre = linea.slice(0, separador).replace(/\s+/g, ' ').trim();
        const detalle = limpiarDetalleObservacionVisualGrupoApp(linea.slice(separador + 1));
        if (nombre && detalle) lineas.push(`${nombre}: ${detalle}`);
        return;
      }

      const detalle = limpiarDetalleObservacionVisualGrupoApp(linea);
      if (detalle) lineas.push(detalle);
    });

  return Array.from(new Set(lineas)).slice(0, maxLineas);
}

export function grupoNivelAFormulario(nombreGrupo: string) {
  const texto = nombreGrupo.toUpperCase();

  if (texto.includes('D+')) return 'D+';
  if (texto.includes('D')) return 'D';
  if (texto.includes('C+')) return 'C+';
  if (texto.includes('C')) return 'C';
  if (texto.includes('B+')) return 'B+';
  if (texto.includes('B')) return 'B';
  if (texto.includes('A+')) return 'A+';
  if (texto.includes('A')) return 'A';

  return 'B';
}

export const layout: React.CSSProperties = {
  padding: 0,
  fontFamily: "'Inter', 'SF Pro Display', 'SF Pro Text', 'Aptos', 'Segoe UI', system-ui, -apple-system, sans-serif",
  background: '#f4f7fb',
  minHeight: '100vh',
  color: '#122033',
};

export const cabeceraPantalla: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
};

export const errorCaja: React.CSSProperties = {
  padding: 12,
  border: '1px solid red',
  marginBottom: 16,
  background: '#fff',
};

export function botonMenu(activo: boolean): React.CSSProperties {
  return botonMenuColor(activo, '#1d4ed8');
}

export function botonMenuColor(activo: boolean, color: string): React.CSSProperties {
  return {
    padding: '10px 14px',
    borderRadius: 14,
    border: activo ? `1px solid ${color}` : '1px solid rgba(148,163,184,0.35)',
    background: activo ? color : 'rgba(255,255,255,0.78)',
    color: activo ? '#fff' : '#172033',
    cursor: 'pointer',
    fontWeight: activo ? 800 : 650,
    boxShadow: activo ? `0 10px 24px ${color}33` : 'none',
    transition: 'all 0.15s ease',
  };
}

export const botonBaseApp: React.CSSProperties = {
  minHeight: 40,
  minWidth: 118,
  padding: '9px 14px',
  borderRadius: 12,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  fontWeight: 800,
  fontSize: 14,
  lineHeight: 1.15,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  boxSizing: 'border-box',
  transition: 'transform .12s ease, box-shadow .12s ease, background .12s ease',
};

export const botonPrincipal: React.CSSProperties = {
  ...botonBaseApp,
  border: '1px solid #1d4ed8',
  background: '#1d4ed8',
  color: '#fff',
  boxShadow: '0 8px 18px rgba(29,78,216,.18)',
};

export const botonPeligro: React.CSSProperties = {
  ...botonBaseApp,
  border: '1px solid #e11d48',
  background: '#fff',
  color: '#e11d48',
};

export const botonSecundario: React.CSSProperties = {
  ...botonBaseApp,
  border: '1px solid #dbe3ef',
  background: '#fff',
  color: '#172033',
};

export const barraPasosIntensivo: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 8,
  marginTop: 12,
};

export function botonPasoIntensivo(activo: boolean): React.CSSProperties {
  return {
    padding: '12px 12px',
    borderRadius: 14,
    border: activo ? '2px solid #f97316' : '1px solid rgba(148,163,184,.34)',
    background: activo ? 'linear-gradient(135deg, #fff7ed, #ffffff)' : '#ffffff',
    color: activo ? '#c2410c' : '#172033',
    cursor: 'pointer',
    fontWeight: 'bold',
    textAlign: 'left',
    boxShadow: activo ? '0 10px 22px rgba(249,115,22,.13)' : '0 6px 14px rgba(15,23,42,.04)',
  };
}

export const botonAsistenciaOk: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #1d4ed8',
  background: '#1d4ed8',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  lineHeight: 1,
};

export const botonAsistenciaAusente: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #9f1239',
  background: '#9f1239',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  lineHeight: 1,
};

export const botonAsistenciaPendiente: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #92400e',
  background: '#92400e',
  color: '#fff',
  cursor: 'pointer',
  fontSize: 13,
  lineHeight: 1,
};

export const botonAsistenciaOff: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 999,
  border: '1px solid #ccc',
  background: '#fff',
  color: '#333',
  cursor: 'pointer',
  fontSize: 13,
  lineHeight: 1,
};

export const tarjeta: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 12,
  padding: 16,
  background: '#fff',
};


export const gridResumenInicio: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: 12,
  marginTop: 12,
};

export const tarjetaInicioOk: React.CSSProperties = {
  border: '2px solid #166534',
  borderRadius: 12,
  padding: 16,
  background: '#f0fdf4',
  color: '#111',
};

export const tarjetaInicioAlerta: React.CSSProperties = {
  border: '2px solid #92400e',
  borderRadius: 12,
  padding: 16,
  background: '#fff7ed',
  color: '#111',
};

export const tarjetaInicioRojo: React.CSSProperties = {
  border: '2px solid #991b1b',
  borderRadius: 12,
  padding: 16,
  background: '#fef2f2',
  color: '#111',
};

export const miniTarjeta: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  padding: 10,
  background: '#fafafa',
};

export const miniTarjetaCompleta: React.CSSProperties = {
  border: '2px solid #166534',
  borderRadius: 8,
  padding: 10,
  background: '#f0fdf4',
};

export const miniTarjetaCerrada: React.CSSProperties = {
  border: '2px solid #166534',
  borderRadius: 8,
  padding: 10,
  background: '#f0fdf4',
};

export const miniTarjetaPendienteAsistencia: React.CSSProperties = {
  border: '2px solid #92400e',
  borderRadius: 8,
  padding: 10,
  background: '#fff7ed',
};

export const miniTarjetaPendienteReporte: React.CSSProperties = {
  border: '2px solid #b91c1c',
  borderRadius: 8,
  padding: 10,
  background: '#fef2f2',
};

export const miniTarjetaBlanca: React.CSSProperties = {
  border: '1px solid #e5e5e5',
  borderRadius: 8,
  padding: 10,
  background: '#fff',
};

export const avisoCompleto: React.CSSProperties = {
  margin: '10px 0',
  padding: '8px 10px',
  borderRadius: 8,
  background: '#dcfce7',
  border: '1px solid #166534',
  color: '#166534',
  fontWeight: 'bold',
};

export const avisoPendiente: React.CSSProperties = {
  margin: '10px 0',
  padding: '8px 10px',
  borderRadius: 8,
  background: '#fff7ed',
  border: '1px solid #92400e',
  color: '#92400e',
  fontWeight: 'bold',
};

export const avisoReportePendiente: React.CSSProperties = {
  margin: '10px 0',
  padding: '8px 10px',
  borderRadius: 8,
  background: '#fef2f2',
  border: '1px solid #b91c1c',
  color: '#b91c1c',
  fontWeight: 'bold',
};

export const avisoNeutral: React.CSSProperties = {
  margin: '10px 0',
  padding: '8px 10px',
  borderRadius: 8,
  background: '#f4f4f5',
  border: '1px solid #a1a1aa',
  color: '#3f3f46',
  fontWeight: 'bold',
};

export const avisoInline: React.CSSProperties = {
  margin: '8px 0 0 0',
  padding: '8px 10px',
  borderRadius: 8,
  background: '#fff7ed',
  border: '1px solid #92400e',
  color: '#92400e',
  fontWeight: 'bold',
};

export const formularioCaja: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 10,
  border: '1px solid #111',
  background: '#fff',
};

export const cierreJoseCaja: React.CSSProperties = {
  margin: '12px 0',
  padding: 12,
  borderRadius: 10,
  border: '1px solid #ddd',
  background: '#fafafa',
};

export const cierreJoseGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
  gap: 8,
  marginTop: 10,
};

export const cierreJoseItem: React.CSSProperties = {
  display: 'grid',
  gap: 4,
  padding: 10,
  borderRadius: 8,
  background: '#fff',
  border: '1px solid #e5e5e5',
};

export const cierreJoseLabel: React.CSSProperties = {
  fontSize: 12,
  color: '#555',
};

export const gridFormulario: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
  gap: 10,
};

export const labelCampo: React.CSSProperties = {
  display: 'grid',
  gap: 5,
  fontWeight: 'bold',
  fontSize: 14,
};

export const selectCampo: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  background: '#fff',
};

export const inputCampo: React.CSSProperties = {
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  background: '#fff',
  color: '#111',
};

export const textarea: React.CSSProperties = {
  minHeight: 90,
  padding: 10,
  borderRadius: 8,
  border: '1px solid #ccc',
  fontSize: 14,
  fontFamily: 'Arial, sans-serif',
  resize: 'vertical',
};

export const textareaCampo: React.CSSProperties = {
  ...textarea,
  width: '100%',
  background: '#fff',
  color: '#111',
  boxSizing: 'border-box',
};

export const bloqueTexto: React.CSSProperties = {
  whiteSpace: 'pre-wrap',
  background: '#f8fafc',
  padding: 12,
  borderRadius: 14,
  border: '1px solid #e2e8f0',
  fontFamily: 'inherit',
  lineHeight: 1.45,
  textAlign: 'left',
};

export const buscador: React.CSSProperties = {
  width: '100%',
  padding: 12,
  borderRadius: 8,
  border: '1px solid #ccc',
  marginBottom: 16,
  fontSize: 16,
};


export function esIntensivoGrupo(grupo: GrupoEntrenadorApp) {
  return (grupo.modalidad || '').toUpperCase().includes('INTENSIVO') ||
    (grupo.tipo_sesion || '').toUpperCase() === 'INTENSIVO';
}

export function etiquetaFechaHoraGrupo(grupo: GrupoEntrenadorApp) {
  return `${formatearFecha(grupo.fecha)} · ${grupo.hora_inicio.slice(0, 5)}–${grupo.hora_fin.slice(0, 5)}`;
}

export function formatearFecha(fecha: string) {
  const partes = fecha.split('-');
  if (partes.length !== 3) return fecha;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function capitalizarPrimera(texto: string) {
  if (!texto) return texto;
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function inicioSemanaGlobal(fechaIso: string) {
  const [anio, mes, dia] = fechaIso.split('-').map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const diaSemana = fecha.getDay() === 0 ? 7 : fecha.getDay();
  fecha.setDate(fecha.getDate() - diaSemana + 1);
  const mesTxt = `${fecha.getMonth() + 1}`.padStart(2, '0');
  const diaTxt = `${fecha.getDate()}`.padStart(2, '0');
  return `${fecha.getFullYear()}-${mesTxt}-${diaTxt}`;
}

export function emojiPuntoEncuentro(punto: string | null) {
  const limpio = String(punto || '').replace(/[^0-9]/g, '');
  const mapa: Record<string, string> = {
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣',
    '10': '🔟',
    '11': '1️⃣1️⃣',
    '12': '1️⃣2️⃣',
  };
  return mapa[limpio] || `Punto ${punto || '-'}`;
}

export function alumnosLimpiosWhatsapp(alumnosLista: string | null) {
  if (!alumnosLista) return [];
  return alumnosLista
    .split(' || ')
    .map((item) => item.split(' · ')[0].trim())
    .filter(Boolean);
}


export type GrupoVisualApp = {
  nombre_grupo?: string | null;
  nivel_grupo?: string | null;
  pista?: string | null;
};

export function nivelGeneralGrupoVisual(grupo: GrupoVisualApp) {
  const nivel = String(grupo.nivel_grupo || '').trim();
  if (!nivel || nivel === '-') return 'Sin nivel';
  return nivel.replace(/\s*\/\s*/g, ' / ');
}

export function nombreGrupoVisualApp(grupo: GrupoVisualApp, indice: number) {
  return `Grupo ${indice + 1} · Nivel ${nivelGeneralGrupoVisual(grupo)}`;
}

export function nombreGrupoPropuestaApp(alumnosGrupo: { nivel_resumen?: string | null; bloque_tecnico?: string | null }[], indice: number) {
  const niveles = Array.from(new Set(alumnosGrupo.map((alumno) => String(alumno.nivel_resumen || '').trim()).filter(Boolean))).join(' / ');
  const bloque = String(alumnosGrupo[0]?.bloque_tecnico || '').trim();
  return `Grupo ${indice + 1} · Nivel ${niveles || bloque || 'Sin nivel'}`;
}

export function etiquetaPistaVisualApp(pista: string | null | undefined) {
  const texto = String(pista || '').toLowerCase();
  if (texto.includes('grande')) return 'PISTA GRANDE';
  if (texto.includes('peque')) return 'PISTA PEQUEÑA';
  return 'PISTA POR DEFINIR';
}

export function estiloGrupoPorPistaApp(grupo: GrupoVisualApp): React.CSSProperties {
  const texto = String(grupo.pista || '').toLowerCase();
  if (texto.includes('grande')) {
    return {
      ...agendaGrupoResumen,
      background: 'linear-gradient(135deg, #eff6ff, #ffffff 72%)',
      border: '1px solid rgba(37,99,235,0.35)',
      boxShadow: '0 10px 24px rgba(37,99,235,0.08)',
    };
  }
  if (texto.includes('peque')) {
    return {
      ...agendaGrupoResumen,
      background: 'linear-gradient(135deg, #f0fdf4, #ffffff 72%)',
      border: '1px solid rgba(22,163,74,0.35)',
      boxShadow: '0 10px 24px rgba(22,163,74,0.08)',
    };
  }
  return agendaGrupoResumen;
}

export function estiloBadgePistaApp(pista: string | null | undefined): React.CSSProperties {
  const texto = String(pista || '').toLowerCase();
  if (texto.includes('grande')) return badgePistaGrandeApp;
  if (texto.includes('peque')) return badgePistaPequenaApp;
  return badgePistaNeutraApp;
}

export function agruparGruposEntrenadorSemanal(items: GrupoEntrenadorApp[]) {
  const mapa = new Map<string, {
    entrenador_id: string;
    entrenador: string;
    total_grupos: number;
    semanas: { inicio: string; grupos: GrupoEntrenadorApp[] }[];
  }>();

  items.forEach((grupo) => {
    const claveEntrenador = grupo.entrenador_id || grupo.entrenador || 'sin-entrenador';
    const semanaInicio = inicioSemanaGlobal(grupo.fecha);

    if (!mapa.has(claveEntrenador)) {
      mapa.set(claveEntrenador, {
        entrenador_id: grupo.entrenador_id,
        entrenador: grupo.entrenador,
        total_grupos: 0,
        semanas: [],
      });
    }

    const bloque = mapa.get(claveEntrenador)!;
    let semana = bloque.semanas.find((item) => item.inicio === semanaInicio);
    if (!semana) {
      semana = { inicio: semanaInicio, grupos: [] };
      bloque.semanas.push(semana);
    }

    semana.grupos.push(grupo);
    bloque.total_grupos += 1;
  });

  return Array.from(mapa.values()).map((bloque) => ({
    ...bloque,
    semanas: bloque.semanas
      .map((semana) => ({
        ...semana,
        grupos: semana.grupos.sort((a, b) => `${a.fecha} ${a.hora_inicio} ${a.nombre_grupo}`.localeCompare(`${b.fecha} ${b.hora_inicio} ${b.nombre_grupo}`)),
      }))
      .sort((a, b) => a.inicio.localeCompare(b.inicio)),
  }));
}

export function agruparDisponibilidadPorTurno(items: DisponibilidadEntrenador[]) {
  const mapa = new Map<string, {
    clave: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
    disponibles: string[];
    no_puedo: string[];
    pendientes: string[];
  }>();

  items.forEach((item) => {
    const clave = `${item.fecha}__${item.hora_inicio}__${item.hora_fin}`;
    if (!mapa.has(clave)) {
      mapa.set(clave, {
        clave,
        fecha: item.fecha,
        hora_inicio: item.hora_inicio,
        hora_fin: item.hora_fin,
        disponibles: [],
        no_puedo: [],
        pendientes: [],
      });
    }

    const bloque = mapa.get(clave)!;
    const respuesta = item.respuesta || 'Pendiente';
    if (respuesta === 'Disponible') bloque.disponibles.push(item.entrenador);
    else if (respuesta === 'No puedo') bloque.no_puedo.push(item.entrenador);
    else bloque.pendientes.push(item.entrenador);
  });

  return Array.from(mapa.values())
    .map((bloque) => ({
      ...bloque,
      disponibles: bloque.disponibles.sort((a, b) => a.localeCompare(b)),
      no_puedo: bloque.no_puedo.sort((a, b) => a.localeCompare(b)),
      pendientes: bloque.pendientes.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`));
}

export function agruparDisponibilidadSemanal(items: DisponibilidadEntrenador[]) {
  const mapa = new Map<string, {
    entrenador_id: string;
    entrenador: string;
    disponibles: number;
    no_puedo: number;
    pendientes: number;
    semanas: { inicio: string; turnos: DisponibilidadEntrenador[] }[];
  }>();

  items.forEach((item) => {
    const claveEntrenador = item.entrenador_id || item.entrenador;
    const semanaInicio = item.fecha_inicio || inicioSemanaGlobal(item.fecha);
    const respuesta = item.respuesta || 'Pendiente';

    if (!mapa.has(claveEntrenador)) {
      mapa.set(claveEntrenador, {
        entrenador_id: item.entrenador_id,
        entrenador: item.entrenador,
        disponibles: 0,
        no_puedo: 0,
        pendientes: 0,
        semanas: [],
      });
    }

    const bloque = mapa.get(claveEntrenador)!;
    if (respuesta === 'Disponible') bloque.disponibles += 1;
    else if (respuesta === 'No puedo') bloque.no_puedo += 1;
    else bloque.pendientes += 1;

    let semana = bloque.semanas.find((registro) => registro.inicio === semanaInicio);
    if (!semana) {
      semana = { inicio: semanaInicio, turnos: [] };
      bloque.semanas.push(semana);
    }
    semana.turnos.push(item);
  });

  return Array.from(mapa.values()).map((bloque) => ({
    ...bloque,
    semanas: bloque.semanas
      .map((semana) => ({
        ...semana,
        turnos: semana.turnos.sort((a, b) => `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`)),
      }))
      .sort((a, b) => a.inicio.localeCompare(b.inicio)),
  }));
}



export const cabeceraAppLimpia: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, rgba(255,255,255,0.96), rgba(255,255,255,0.86)), url(${FOTO_MITICO_HERO}) center/cover`,
  border: '1px solid rgba(148,163,184,0.28)',
  borderRadius: 28,
  padding: 22,
  marginBottom: 22,
  display: 'grid',
  gap: 18,
  boxShadow: '0 22px 60px rgba(15,23,42,0.10)',
};

export const cabeceraMarcaApp: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: 16,
  flexWrap: 'wrap',
};

export const marcaLogoTituloApp: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
};

export const logoMarcaApp: React.CSSProperties = {
  width: 70,
  height: 70,
  borderRadius: 20,
  objectFit: 'cover',
  background: '#fff',
  border: '1px solid rgba(15,23,42,0.10)',
  boxShadow: '0 12px 28px rgba(15,23,42,0.12)',
};

export const marcaKickerApp: React.CSSProperties = {
  margin: 0,
  fontSize: 12,
  letterSpacing: 1.8,
  textTransform: 'uppercase',
  color: '#16a34a',
  fontWeight: 900,
};

export const tituloMarcaApp: React.CSSProperties = {
  margin: '4px 0 0',
  fontSize: 'clamp(28px, 4vw, 46px)',
  letterSpacing: -1.2,
  lineHeight: 1,
};

export const chuletaGeneralApp: React.CSSProperties = {
  maxWidth: 560,
  padding: '10px 12px',
  borderRadius: 16,
  background: 'rgba(255,255,255,0.78)',
  border: '1px solid rgba(148,163,184,0.30)',
  backdropFilter: 'blur(10px)',
};

export const summaryChuletaApp: React.CSSProperties = {
  cursor: 'pointer',
  fontWeight: 900,
  color: '#172033',
};

export const chuletaGridApp: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
  gap: 10,
  marginTop: 10,
  color: '#475569',
  fontSize: 13,
  lineHeight: 1.35,
};

export function menuBloqueColor(color: string, fondo: string): React.CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    width: '100%',
    boxSizing: 'border-box',
    padding: 10,
    border: `1px solid ${color}26`,
    borderRadius: 18,
    background: fondo,
  };
}

export function menuTituloColor(color: string): React.CSSProperties {
  return {
    fontSize: 12,
    fontWeight: 900,
    color,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginRight: 4,
  };
}

export const menuBloqueApp: React.CSSProperties = menuBloqueColor('#64748b', '#f8fafc');

export const menuTituloApp: React.CSSProperties = menuTituloColor('#64748b');

export const cabeceraPantallaMovil: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'flex-start',
  background: 'rgba(255,255,255,0.88)',
  border: '1px solid rgba(148,163,184,0.28)',
  borderRadius: 22,
  padding: 18,
  boxShadow: '0 12px 35px rgba(15,23,42,0.06)',
};

export const tarjetaMovilVacia: React.CSSProperties = {
  background: '#fafafa',
  border: '1px dashed #cccccc',
  borderRadius: 18,
  padding: 18,
};

export const tarjetaEntrenadorMovil: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  borderRadius: 18,
  padding: 14,
  display: 'grid',
  gap: 12,
  boxShadow: '0 8px 24px rgba(15,23,42,0.045)',
};

export const cabeceraEntrenadorMovil: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const etiquetaSuperior: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 'bold',
  color: '#777777',
  letterSpacing: 0.8,
};

export const contadorGrandeMovil: React.CSSProperties = {
  minWidth: 82,
  borderRadius: 18,
  background: 'linear-gradient(135deg, #0f172a, #2563eb)',
  color: '#ffffff',
  padding: 10,
  textAlign: 'center',
  display: 'grid',
  boxShadow: '0 10px 22px rgba(37,99,235,0.18)',
};

export const bloqueSemanaMovil: React.CSSProperties = {
  border: '1px solid #e5eaf0',
  borderRadius: 16,
  padding: 10,
  background: '#fbfcfe',
  display: 'grid',
  gap: 9,
};

export const cabeceraSemanaMovil: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const resumenChipsMovil: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const diaEntrenadorCard: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #dde5ee',
  borderRadius: 14,
  overflow: 'hidden',
};

export const diaEntrenadorCardLibre: React.CSSProperties = {
  background: '#f7f7f7',
  border: '1px dashed #cccccc',
  borderRadius: 16,
  padding: 12,
};

export const diaEntrenadorHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const miniBadge: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '6px 10px',
  borderRadius: 999,
  background: '#eff6ff',
  color: '#1d4ed8',
  border: '1px solid #bfdbfe',
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: 'nowrap',
};

export const miniBadgeVerde: React.CSSProperties = {
  ...miniBadge,
  background: '#dcfce7',
  color: '#166534',
  border: '1px solid #86efac',
};

export const badgeTrabaja: React.CSSProperties = {
  background: '#e6f6ec',
  color: '#137333',
  border: '1px solid #137333',
  borderRadius: 999,
  padding: '5px 10px',
  fontWeight: 'bold',
  fontSize: 12,
};

export const badgeNoTrabaja: React.CSSProperties = {
  background: '#f1f1f1',
  color: '#555555',
  border: '1px solid #dddddd',
  borderRadius: 999,
  padding: '5px 10px',
  fontWeight: 'bold',
  fontSize: 12,
};


export const badgePendiente: React.CSSProperties = {
  background: '#fff8e6',
  color: '#9a4b00',
  border: '1px solid #c97a1d',
  borderRadius: 999,
  padding: '5px 10px',
  fontWeight: 'bold',
  fontSize: 12,
};

export const turnoEntrenadorBox: React.CSSProperties = {
  border: '1px solid #e3e8ef',
  borderRadius: 14,
  padding: 10,
  background: '#f8fafc',
  display: 'grid',
  gap: 9,
};

export const grupoEntrenadorCardMovil: React.CSSProperties = {
  border: '1px solid #e0e7ef',
  borderRadius: 16,
  padding: 13,
  background: '#ffffff',
  display: 'grid',
  gap: 11,
  boxShadow: '0 7px 20px rgba(15,23,42,0.04)',
};

export const grupoEntrenadorTopMovil: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
};

export const badgeModalidadMovil: React.CSSProperties = {
  display: 'inline-block',
  margin: 0,
  background: '#111111',
  color: '#ffffff',
  borderRadius: 999,
  padding: '4px 9px',
  fontSize: 12,
  fontWeight: 'bold',
};

export const contadorNinosMovil: React.CSSProperties = {
  minWidth: 64,
  textAlign: 'center',
  border: '1px solid #e5e5e5',
  borderRadius: 14,
  padding: 8,
  display: 'grid',
};

export const bloqueInfoEntrenador: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 16,
  padding: 12,
  background: '#ffffff',
  display: 'grid',
  gap: 8,
  boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
};


export const filaAlumnoAsistencia: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  flexWrap: 'wrap',
  border: '1px solid #e6ebf1',
  borderRadius: 12,
  padding: 10,
  background: '#ffffff',
};

export const filaAlumnoEntrenadorMovil: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 8,
  alignItems: 'start',
};

export const botonesAsistenciaMovil: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
};

export const badgeIntensivoEntrenador: React.CSSProperties = {
  display: 'inline-block',
  background: '#111111',
  color: '#ffffff',
  padding: '6px 10px',
  borderRadius: 999,
  fontWeight: 'bold',
  fontSize: 13,
  marginBottom: 8,
};


export const semanaTrabajoActivaApp: React.CSSProperties = {
  marginTop: 10,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 12px',
  borderRadius: 999,
  background: 'rgba(15,118,110,0.10)',
  color: '#0f766e',
  border: '1px solid rgba(15,118,110,0.18)',
  fontSize: 13,
  fontWeight: 800,
};

export const vistaEntrenadorShell: React.CSSProperties = {
  display: 'grid',
  gap: 14,
  maxWidth: 1040,
  margin: '0 auto',
};

export const entrenadorHeroApp: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 14,
  flexWrap: 'wrap',
  borderRadius: 20,
  padding: 18,
  background: 'linear-gradient(135deg, #082638 0%, #0b3549 70%, #0c6245 130%)',
  color: '#ffffff',
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 16px 40px rgba(5,27,45,0.16)',
};

export const entrenadorHeroChips: React.CSSProperties = {
  display: 'flex',
  gap: 6,
  flexWrap: 'wrap',
  marginTop: 10,
  color: '#d6e4ed',
  fontSize: 12,
  fontWeight: 800,
};

export const panelEntrenadorFiltroApp: React.CSSProperties = {
  display: 'grid',
  gap: 9,
  padding: 8,
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 8px 24px rgba(15,23,42,0.045)',
};

export const inputEntrenadorBusqueda: React.CSSProperties = {
  ...buscador,
  borderRadius: 11,
  padding: '12px 14px',
  background: '#f8fafc',
  border: '1px solid #dce4ed',
};

export const tabBarEntrenadorModerno: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 6,
  padding: 5,
  borderRadius: 13,
  background: '#f1f5f9',
  border: '1px solid #e2e8f0',
};

export function tabEntrenadorModerno(activo: boolean, color: string): React.CSSProperties {
  return {
    padding: '13px 14px',
    borderRadius: 14,
    border: activo ? `1px solid ${color}` : '1px solid rgba(148,163,184,0.30)',
    background: activo ? color : '#ffffff',
    color: activo ? '#ffffff' : '#172033',
    fontWeight: 900,
    cursor: 'pointer',
    boxShadow: activo ? `0 12px 28px ${color}33` : 'none',
  };
}

export const chuletaEntrenadorMini: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 16,
  border: '1px solid rgba(15,118,110,0.18)',
  background: 'rgba(236,253,245,0.70)',
  color: '#334155',
  fontSize: 13,
};

export function formatearEuros(valor: number | string | null | undefined) {
  const numero = Number(valor || 0);
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(numero) ? numero : 0);
}

export function escaparHtml(valor: string | number | null | undefined) {
  return String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function tarjetaInicioEstado(valor: number): React.CSSProperties {
  if (valor === 0) return tarjetaInicioOk;
  if (valor <= 3) return tarjetaInicioAlerta;
  return tarjetaInicioRojo;
}

export function nombreMes(mes: number) {
  const meses = [
    '',
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ];

  return meses[mes] || `Mes ${mes}`;
}




export const botonMini: React.CSSProperties = {
  ...botonBaseApp,
  width: 128,
  minWidth: 128,
  minHeight: 38,
  padding: '8px 10px',
  border: '1px solid #cbd5e1',
  borderRadius: 12,
  background: '#fff',
  color: '#172033',
  boxShadow: '0 4px 10px rgba(15,23,42,.05)',
  flex: '0 0 128px',
};

export const botonPeligroMini: React.CSSProperties = {
  ...botonBaseApp,
  width: 128,
  minWidth: 128,
  minHeight: 38,
  padding: '8px 10px',
  border: '1px solid #e11d48',
  borderRadius: 12,
  background: '#fff',
  color: '#e11d48',
  flex: '0 0 128px',
};

export const panelTrabajoGrupo: React.CSSProperties = {
  marginTop: 12,
  padding: 12,
  borderRadius: 16,
  border: '1px solid rgba(148,163,184,.38)',
  background: 'rgba(255,255,255,.72)',
};

export const summaryTrabajoGrupo: React.CSSProperties = {
  cursor: 'pointer',
  fontWeight: 900,
  color: '#172033',
  listStyle: 'none',
};

export const tarjetaResaltada: React.CSSProperties = {
  border: '2px solid #111',
  borderRadius: 16,
  padding: 18,
  background: '#fff',
};

export const gridMiniMetricas: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
  gap: 10,
  marginBottom: 16,
};

export const miniMetrica: React.CSSProperties = {
  border: '1px solid #ddd',
  borderRadius: 12,
  padding: 12,
  background: '#fafafa',
  display: 'grid',
  gap: 4,
};


export const ayudaReporteEntrenadorCaja: React.CSSProperties = {
  marginBottom: 12,
  border: '1px solid rgba(37,99,235,0.20)',
  borderRadius: 14,
  background: 'linear-gradient(135deg, rgba(239,246,255,0.95), #ffffff 70%)',
  padding: 10,
};

export const summaryAyudaReporteEntrenador: React.CSSProperties = {
  listStyle: 'none',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '9px 13px',
  borderRadius: 12,
  border: '1px solid rgba(37,99,235,0.25)',
  background: '#ffffff',
  color: '#1d4ed8',
  fontWeight: 800,
};

export const ayudaReporteEntrenadorContenido: React.CSSProperties = {
  marginTop: 10,
  display: 'grid',
  gap: 8,
};

export const tablaAyudaReporteEntrenador: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'separate',
  borderSpacing: 0,
  overflow: 'hidden',
  borderRadius: 12,
  border: '1px solid #dbeafe',
  background: '#fff',
  fontSize: 13,
};

export const celdaTituloAyudaReporte: React.CSSProperties = {
  width: 130,
  padding: '9px 10px',
  textAlign: 'left',
  verticalAlign: 'top',
  background: '#eff6ff',
  color: '#1e3a8a',
  borderBottom: '1px solid #dbeafe',
  fontWeight: 800,
};

export const celdaTextoAyudaReporte: React.CSSProperties = {
  padding: '9px 10px',
  textAlign: 'left',
  verticalAlign: 'top',
  color: '#334155',
  borderBottom: '1px solid #e2e8f0',
  lineHeight: 1.35,
};


export const agendaAlumnoLinea: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  border: '1px solid #ddd',
  borderRadius: 12,
  padding: 12,
  background: '#fff',
};

export const agendaGrupoPropuesta: React.CSSProperties = {
  border: '1px solid #ccc',
  borderRadius: 14,
  padding: 14,
  background: '#fff',
};

export const agendaHero: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 18,
  alignItems: 'center',
  padding: 22,
  borderRadius: 22,
  background: 'linear-gradient(135deg, rgba(37,99,235,0.09), #ffffff 72%)',
  border: '1px solid rgba(148,163,184,0.28)',
  boxShadow: '0 12px 35px rgba(15,23,42,0.06)',
  flexWrap: 'wrap',
};

export const agendaHeroOcio: React.CSSProperties = {
  ...agendaHero,
  background: 'linear-gradient(135deg, rgba(22,163,74,0.13), #ffffff 72%)',
};


export const tarjetaIntensivoCurso: React.CSSProperties = {
  ...tarjeta,
  border: '1px solid rgba(249,115,22,0.26)',
  background: 'linear-gradient(135deg, rgba(255,247,237,0.96), #ffffff 58%, rgba(239,246,255,0.72))',
  boxShadow: '0 16px 36px rgba(15,23,42,0.06)',
};

export const resumenCursoIntensivoGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 10,
  margin: '14px 0',
};

export const chipResumenCursoIntensivo: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: 16,
  background: '#ffffff',
  border: '1px solid rgba(148,163,184,0.24)',
  display: 'grid',
  gap: 4,
  boxShadow: '0 8px 18px rgba(15,23,42,0.04)',
};

export const franjaFechasIntensivo: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 14,
  background: 'rgba(255,255,255,0.72)',
  border: '1px solid rgba(249,115,22,0.18)',
  color: '#475569',
  marginBottom: 12,
};

export const lineaDiasIntensivo: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginBottom: 12,
};

export const chipDiaIntensivo: React.CSSProperties = {
  ...botonBaseApp,
  minWidth: 126,
  padding: '9px 12px',
  borderRadius: 14,
  border: '1px solid rgba(249,115,22,0.28)',
  background: 'linear-gradient(135deg, #fff7ed, #ffffff)',
  color: '#9a3412',
  boxShadow: '0 8px 18px rgba(249,115,22,0.10)',
  display: 'grid',
  gap: 2,
  textAlign: 'left',
};

export const chipDiaIntensivoVacio: React.CSSProperties = {
  padding: '10px 12px',
  borderRadius: 14,
  background: '#fff1f2',
  border: '1px solid rgba(239,68,68,0.25)',
  color: '#991b1b',
  fontWeight: 900,
};

export function metricCardIntensivo(tipo: 'azul' | 'verde' | 'ambar' | 'naranja'): React.CSSProperties {
  const mapa = {
    azul: { fondo: '#eff6ff', borde: 'rgba(37,99,235,0.24)', texto: '#1d4ed8' },
    verde: { fondo: '#f0fdf4', borde: 'rgba(22,163,74,0.24)', texto: '#166534' },
    ambar: { fondo: '#fffbeb', borde: 'rgba(245,158,11,0.26)', texto: '#92400e' },
    naranja: { fondo: '#fff7ed', borde: 'rgba(249,115,22,0.30)', texto: '#9a3412' },
  }[tipo];
  return {
    padding: '14px 16px',
    borderRadius: 16,
    background: mapa.fondo,
    border: `1px solid ${mapa.borde}`,
    color: mapa.texto,
    display: 'grid',
    gap: 4,
    boxShadow: '0 10px 22px rgba(15,23,42,0.04)',
  };
}

export const tarjetaModernaIntensivos: React.CSSProperties = {
  ...tarjeta,
  border: '1px solid rgba(249,115,22,0.35)',
  background: 'linear-gradient(135deg, rgba(255,247,237,0.95), #ffffff 70%)',
};

export const ayudaDesplegableCompacta: React.CSSProperties = {
  marginTop: 8,
  color: '#475569',
  fontSize: 13,
};

export const panelRevisionIntegradaOcio: React.CSSProperties = {
  padding: 18,
  borderRadius: 18,
  border: '1px solid rgba(22,163,74,0.25)',
  background: 'linear-gradient(135deg, rgba(240,253,244,0.9), #ffffff 70%)',
};

export const agendaBloqueBlanco: React.CSSProperties = {
  padding: 18,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.92)',
  border: '1px solid rgba(148,163,184,0.24)',
  boxShadow: '0 12px 30px rgba(15,23,42,0.05)',
};

export const agendaCabeceraLinea: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'center',
  marginBottom: 14,
};

export const agendaMesesGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: 10,
};

export const agendaSemanasGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
  gap: 10,
};


export const menuPrincipalApp: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr',
  gap: 10,
  alignItems: 'stretch',
  padding: 12,
  borderRadius: 22,
  background: 'rgba(255,255,255,0.78)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8), 0 12px 30px rgba(15,23,42,0.07)',
  border: '1px solid rgba(148,163,184,0.24)',
  backdropFilter: 'blur(12px)',
};

export const agendaDiasGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))',
  gap: 14,
};

export function agendaBotonMes(activo: boolean): React.CSSProperties {
  return {
    display: 'grid',
    gap: 6,
    textAlign: 'left',
    padding: 14,
    borderRadius: 14,
    border: activo ? '2px solid #111' : '1px solid #ddd',
    background: activo ? '#111' : '#fafafa',
    color: activo ? '#fff' : '#111',
    cursor: 'pointer',
  };
}

export function agendaBotonSemana(activo: boolean): React.CSSProperties {
  return {
    display: 'grid',
    gap: 6,
    textAlign: 'left',
    padding: 14,
    borderRadius: 14,
    border: activo ? '2px solid #111' : '1px solid #ddd',
    background: activo ? '#f0f0f0' : '#fff',
    color: '#111',
    cursor: 'pointer',
  };
}

export const agendaDiaCard: React.CSSProperties = {
  border: '1px solid rgba(37,99,235,0.16)',
  borderRadius: 20,
  padding: 16,
  background: 'linear-gradient(135deg, rgba(248,250,252,0.98), #ffffff 70%)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
};

export const agendaDiaHeader: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
  marginBottom: 12,
};


export function normalizarModalidadAgenda(valor?: string) {
  const texto = String(valor || '').toUpperCase();
  if (texto.includes('OCIO')) return 'OCIO';
  if (texto.includes('INTENS')) return 'INTENSIVOS';
  if (texto.includes('PARTIC')) return 'PARTICULAR';
  return 'BABY';
}

export function coloresModalidadAgenda(valor?: string) {
  const codigo = normalizarModalidadAgenda(valor);
  if (codigo === 'OCIO') {
    return {
      color: '#16a34a',
      texto: '#166534',
      fondo: 'linear-gradient(135deg, rgba(240,253,244,0.98), #ffffff)',
      suave: '#dcfce7',
      borde: 'rgba(22,163,74,0.34)',
      sombra: 'rgba(22,163,74,0.14)',
    };
  }
  if (codigo === 'INTENSIVOS') {
    return {
      color: '#f97316',
      texto: '#9a3412',
      fondo: 'linear-gradient(135deg, rgba(255,247,237,0.98), #ffffff)',
      suave: '#ffedd5',
      borde: 'rgba(249,115,22,0.34)',
      sombra: 'rgba(249,115,22,0.15)',
    };
  }
  if (codigo === 'PARTICULAR') {
    return {
      color: '#7c3aed',
      texto: '#5b21b6',
      fondo: 'linear-gradient(135deg, rgba(245,243,255,0.98), #ffffff)',
      suave: '#ede9fe',
      borde: 'rgba(124,58,237,0.30)',
      sombra: 'rgba(124,58,237,0.13)',
    };
  }
  return {
    color: '#2563eb',
    texto: '#1d4ed8',
    fondo: 'linear-gradient(135deg, rgba(239,246,255,0.98), #ffffff)',
    suave: '#dbeafe',
    borde: 'rgba(37,99,235,0.32)',
    sombra: 'rgba(37,99,235,0.13)',
  };
}

export function botonModalidadAgenda(modalidad?: string): React.CSSProperties {
  const colores = coloresModalidadAgenda(modalidad);
  return {
    ...botonBaseApp,
    minWidth: 128,
    minHeight: 40,
    padding: '8px 12px',
    border: `1px solid ${colores.borde}`,
    borderRadius: 14,
    background: colores.fondo,
    color: colores.texto,
    boxShadow: `0 8px 18px ${colores.sombra}`,
    flex: '0 0 128px',
  };
}

export function agendaBadgeModalidadColor(modalidad?: string): React.CSSProperties {
  const colores = coloresModalidadAgenda(modalidad);
  return {
    display: 'inline-block',
    padding: '5px 10px',
    borderRadius: 999,
    background: colores.suave,
    color: colores.texto,
    border: `1px solid ${colores.borde}`,
    fontSize: 12,
    fontWeight: 900,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  };
}

export function agendaSesionCardModalidad(modalidad?: string): React.CSSProperties {
  const colores = coloresModalidadAgenda(modalidad);
  return {
    ...agendaSesionCard,
    border: `1px solid ${colores.borde}`,
    background: colores.fondo,
    boxShadow: `0 10px 22px ${colores.sombra}`,
  };
}

export const agendaSesionCard: React.CSSProperties = {
  padding: 14,
  borderRadius: 18,
  border: '1px solid rgba(148,163,184,0.28)',
  background: '#fff',
  boxShadow: '0 10px 22px rgba(15,23,42,0.05)',
};

export const agendaSesionTop: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 12,
  alignItems: 'flex-start',
};

export const agendaBadgeModalidad: React.CSSProperties = {
  display: 'inline-block',
  padding: '5px 10px',
  borderRadius: 999,
  background: '#0f172a',
  color: '#fff',
  fontSize: 12,
  fontWeight: 900,
  letterSpacing: 0.4,
  textTransform: 'uppercase',
};

export const agendaAccionesSesion: React.CSSProperties = {
  display: 'flex',
  gap: 8,
  flexWrap: 'wrap',
  marginTop: 12,
};

export const agendaGrupoResumen: React.CSSProperties = {
  padding: 10,
  borderRadius: 12,
  background: '#f7f7f7',
  border: '1px solid #e3e3e3',
};


export const badgePistaPequenaApp: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 9px',
  borderRadius: 999,
  background: '#dcfce7',
  color: '#166534',
  border: '1px solid rgba(22,101,52,0.22)',
  fontWeight: 900,
  fontSize: 11,
  letterSpacing: 0.3,
};

export const badgePistaGrandeApp: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 9px',
  borderRadius: 999,
  background: '#dbeafe',
  color: '#1d4ed8',
  border: '1px solid rgba(29,78,216,0.22)',
  fontWeight: 900,
  fontSize: 11,
  letterSpacing: 0.3,
};

export const badgePistaNeutraApp: React.CSSProperties = {
  display: 'inline-block',
  padding: '4px 9px',
  borderRadius: 999,
  background: '#f1f5f9',
  color: '#475569',
  border: '1px solid rgba(71,85,105,0.18)',
  fontWeight: 900,
  fontSize: 11,
  letterSpacing: 0.3,
};

export const listaAlumnosGrupoCompacta: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 6,
  marginTop: 8,
  color: '#172033',
  fontSize: 14,
};

export const agendaGrupoLinea: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 10,
  flexWrap: 'wrap',
};

export const agendaTurnoFila: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
  padding: 12,
  borderRadius: 16,
  background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
  border: '1px solid rgba(148,163,184,0.28)',
  flexWrap: 'wrap',
};

export const agendaVacio: React.CSSProperties = {
  padding: 18,
  borderRadius: 14,
  background: '#fafafa',
  border: '1px dashed #ccc',
  color: '#555',
};

export const agendaVacioMini: React.CSSProperties = {
  padding: 12,
  borderRadius: 12,
  background: '#fff',
  border: '1px dashed #ccc',
  color: '#555',
};


export const agendaShellCompacto: React.CSSProperties = {
  display: 'grid',
  gap: 14,
};

export const agendaHeroTrabajoSemanal: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 22,
  alignItems: 'center',
  padding: '4px 0 10px',
  borderRadius: 0,
  background: 'transparent',
  border: 0,
  boxShadow: 'none',
  flexWrap: 'wrap',
};

export const agendaPanelRangoSemana: React.CSSProperties = {
  minWidth: 270,
  padding: '13px 15px',
  borderRadius: 15,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 7px 22px rgba(15,23,42,0.05)',
  display: 'grid',
  gap: 4,
};

export const agendaPanelControles: React.CSSProperties = {
  padding: 16,
  borderRadius: 18,
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  boxShadow: '0 10px 30px rgba(15,23,42,0.05)',
  display: 'grid',
  gap: 15,
};

export const agendaControlesGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(190px, 1fr))',
  gap: 12,
  alignItems: 'end',
};

export const selectCampoAgenda: React.CSSProperties = {
  ...selectCampo,
  minHeight: 44,
  borderRadius: 11,
  border: '1px solid #d8e0ea',
  background: '#fbfcfe',
  boxShadow: 'none',
  fontWeight: 750,
};

export const agendaMiniLabel: React.CSSProperties = {
  margin: 0,
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: '#64748b',
};

export const agendaMiniTexto: React.CSSProperties = {
  fontSize: 13,
  color: '#475569',
};

export const agendaDiasSelectorCompacto: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(5, minmax(135px, 1fr))',
  gap: 9,
};

export const agendaMiniContador: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 900,
  color: '#475569',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  padding: '5px 8px',
  borderRadius: 999,
};

export function agendaMiniContadorDiaCompacto(activo: boolean, alumnos: number, grupos: number): React.CSSProperties {
  const tieneActividad = alumnos > 0 || grupos > 0;
  return {
    ...agendaMiniContador,
    color: activo ? '#0b5f35' : tieneActividad ? '#166534' : '#66758a',
    background: activo ? '#eaf8ef' : tieneActividad ? '#f0fdf4' : '#f4f7fa',
    border: activo
      ? '1px solid #b9e7c9'
      : tieneActividad
        ? '1px solid #c8ecd4'
        : '1px solid #e1e7ee',
  };
}

export function agendaBotonDiaCompacto(activo: boolean, alumnos: number, grupos: number): React.CSSProperties {
  const tieneActividad = alumnos > 0 || grupos > 0;
  return {
    border: activo
      ? '1px solid #0f9f4d'
      : '1px solid #e1e7ee',
    background: activo
      ? 'linear-gradient(180deg, #f4fcf7 0%, #ffffff 100%)'
      : '#ffffff',
    color: '#122033',
    minHeight: 72,
    padding: '12px 13px',
    borderRadius: 14,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    boxShadow: activo
      ? '0 8px 22px rgba(15,159,77,0.10)'
      : tieneActividad
        ? '0 5px 15px rgba(15,23,42,0.04)'
        : 'none',
  };
}

export const agendaSesionContadores: React.CSSProperties = {
  display: 'grid',
  gap: 6,
  textAlign: 'right',
  color: '#172033',
};


export class PantallaSegura extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
          <section style={{ maxWidth: 760, margin: '0 auto', border: '2px solid #b42318', borderRadius: 18, padding: 20, background: '#fff5f5' }}>
            <h1 style={{ marginTop: 0 }}>La app ha evitado quedarse en blanco</h1>
            <p>Ha saltado un error visual. Copia este mensaje si vuelve a pasar.</p>
            <pre style={{ whiteSpace: 'pre-wrap', background: '#fff', border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>{this.state.error.message}</pre>
            <button onClick={() => window.location.reload()} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #111', background: '#111', color: '#fff', fontWeight: 'bold' }}>
              Recargar app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

