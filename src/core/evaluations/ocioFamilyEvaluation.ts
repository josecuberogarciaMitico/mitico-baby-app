import { technicalLevelOrder } from '../levels/levelContract';
import type { EvaluacionAnualOcioApp } from './evaluationTypes';

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function compactLevelJourney(value: string | null | undefined) {
  const changes = String(value || '')
    .split('→')
    .map((level) => level.trim())
    .filter(Boolean)
    .filter((level, index, all) => index === 0 || level !== all[index - 1]);
  if (changes.length <= 6) return changes.join(' → ');
  return [...changes.slice(0, 3), '…', ...changes.slice(-2)].join(' → ');
}

export function levelEvolutionText(row: EvaluacionAnualOcioApp) {
  const initial = row.nivel_inicial || '';
  const final = row.nivel_final || '';
  if (!initial && !final) return 'Todavía no hay suficiente información de nivel para describir una evolución.';
  if (!initial || !final) return `El nivel registrado actualmente es ${final || initial}.`;
  const initialOrder = technicalLevelOrder(initial);
  const finalOrder = technicalLevelOrder(final);
  if (initialOrder !== null && finalOrder !== null && finalOrder > initialOrder) {
    return `Durante la temporada ha progresado desde el nivel ${initial} hasta el nivel ${final}.`;
  }
  if (initialOrder !== null && finalOrder !== null && finalOrder === initialOrder) {
    return `Durante la temporada ha consolidado el nivel ${final}, reforzando las habilidades trabajadas dentro de ese nivel.`;
  }
  if (initialOrder !== null && finalOrder !== null && finalOrder < initialOrder) {
    return `El último reporte sitúa su nivel en ${final}. Coordinación puede usar este dato junto con el historial completo para ajustar el siguiente paso.`;
  }
  return `Su recorrido de nivel esta temporada ha sido ${initial} → ${final}.`;
}

export function metricComparisonText(
  label: string,
  initial: string | null | undefined,
  final: string | null | undefined
) {
  const start = String(initial || '').trim();
  const end = String(final || '').trim();
  if (!start && !end) return `No hay información suficiente de ${label.toLowerCase()} en los reportes disponibles.`;
  if (start && end && start === end) return `Ha consolidado ${end.toLowerCase()} como referencia principal de ${label.toLowerCase()}.`;
  if (start && end) return `Al comienzo se registró “${start}” y en el último reporte “${end}”.`;
  return `La referencia disponible de ${label.toLowerCase()} es “${end || start}”.`;
}

export function dailyWorkObjectives(value: string | null | undefined) {
  return Array.from(
    new Set(
      String(value || '')
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => /^OBJETIVO\s*·/i.test(line))
        .map((line) => line.replace(/^OBJETIVO\s*·\s*/i, '').trim())
        .filter(Boolean)
    )
  ).slice(0, 5);
}

export function reportedImprovements(value: string | null | undefined) {
  return Array.from(
    new Set(
      String(value || '')
        .split(/\s*[·|→|\n]\s*/g)
        .map((item) => item.trim())
        .filter(Boolean)
        .filter((item) => !/nada destacable|sesión de consolidación/i.test(item))
    )
  ).slice(0, 4);
}

export function christmasComparison(row: EvaluacionAnualOcioApp) {
  if (!row.navidad_guardada) return '';
  const parts = [
    metricComparisonText('Nivel', row.nivel_navidad, row.nivel_final),
    metricComparisonText('Técnica', row.tecnica_navidad, row.tecnica_final),
    metricComparisonText('Autonomía', row.autonomia_navidad, row.autonomia_final),
  ];
  const christmasLifts = (row.remontes_navidad || []).join(', ');
  const finalLifts = (row.remontes_finales || []).join(', ');
  if (christmasLifts || finalLifts) {
    parts.push(
      christmasLifts && finalLifts && christmasLifts !== finalLifts
        ? `En Navidad constaban ${christmasLifts}; actualmente constan ${finalLifts}.`
        : `Los remontes registrados se mantienen en ${finalLifts || christmasLifts}.`
    );
  }
  return parts.join(' ');
}

export function evaluationStrengths(row: EvaluacionAnualOcioApp) {
  const strengths = reportedImprovements(row.mejoras_reportadas);
  if (/muy buena|buena/i.test(String(row.actitud_final || ''))) strengths.push('Buena actitud y disposición durante las sesiones');
  if (/autónomo total|autónomo en pista grande/i.test(String(row.autonomia_final || ''))) strengths.push('Autonomía sólida en pista');
  return Array.from(new Set(strengths)).slice(0, 4);
}

export function nextStepObjectives(row: EvaluacionAnualOcioApp) {
  const recommendation = String(row.recomendacion_final || '').trim();
  if (!recommendation) return [];
  const map: Array<[RegExp, string]> = [
    [/consolidar/i, 'Consolidar lo aprendido hasta que aparezca de forma estable y natural'],
    [/progresar/i, 'Avanzar un paso técnico manteniendo el control y la calidad del movimiento'],
    [/revisar nivel/i, 'Revisar el nivel en pista antes de realizar un cambio definitivo'],
    [/autonom/i, 'Ganar autonomía y necesitar cada vez menos ayuda del entrenador'],
    [/control de velocidad/i, 'Mejorar el control de velocidad mediante trayectoria y frenada'],
    [/trabajar giro/i, 'Mejorar la forma, continuidad y control de los giros'],
    [/trabajar paralelo/i, 'Consolidar el paralelo y mantenerlo con mayor continuidad'],
    [/apoyo exterior/i, 'Reforzar el apoyo sobre el esquí exterior durante el giro'],
    [/cantos|conducción/i, 'Mejorar el uso de cantos y la conducción de los esquís'],
    [/remontes/i, 'Ganar seguridad y autonomía en los remontes'],
    [/seguimiento especial/i, 'Mantener un seguimiento individual durante las próximas sesiones'],
  ];
  return [map.find(([pattern]) => pattern.test(recommendation))?.[1] || recommendation];
}

export function continuityText(row: EvaluacionAnualOcioApp) {
  const scheduled = Number(row.sesiones_ocio_programadas || 0);
  const attended = Number(row.entrenamientos_ocio || 0);
  if (scheduled > 0 && row.asistencia_ocio_pct !== null && row.asistencia_ocio_pct !== undefined) {
    return `Ha asistido a ${attended} de ${scheduled} sesiones de Ocio registradas (${Math.round(Number(row.asistencia_ocio_pct))}%).`;
  }
  if (attended > 0) return `Constan ${attended} sesiones de Ocio realizadas durante el periodo evaluado.`;
  return 'Todavía no hay suficientes registros de asistencia para resumir la continuidad.';
}

export function buildOcioFamilyEvaluationHtml(
  row: EvaluacionAnualOcioApp,
  options: { age: number | null; formatDate: (date: string) => string }
) {
  const safe = escapeHtml;
  const season = row.temporada || '-';
  const period = row.primer_reporte_fecha && row.ultimo_reporte_fecha
    ? `${options.formatDate(row.primer_reporte_fecha)} — ${options.formatDate(row.ultimo_reporte_fecha)}`
    : row.ultimo_reporte_fecha ? `Hasta ${options.formatDate(row.ultimo_reporte_fecha)}` : 'Temporada actual';
  const initialLifts = (row.remontes_iniciales || []).join(', ');
  const finalLifts = (row.remontes_finales || []).join(', ');
  const worked = dailyWorkObjectives(row.trabajos_realizados);
  const christmas = christmasComparison(row);
  const strengths = evaluationStrengths(row);
  const nextSteps = nextStepObjectives(row);
  const liftsText = initialLifts || finalLifts
    ? initialLifts && finalLifts && initialLifts !== finalLifts
      ? `Al inicio constaban ${initialLifts}. En el último reporte constan ${finalLifts}.`
      : `Los remontes registrados actualmente son: ${finalLifts || initialLifts}.`
    : 'No hay información específica de remontes en los reportes disponibles.';
  const coverage = row.reportes_ocio >= 2
    ? `Este informe resume ${row.reportes_ocio} reportes técnicos y ${row.entrenamientos_ocio} entrenamientos de Ocio registrados.`
    : `Informe parcial basado en ${row.reportes_ocio} reporte técnico y ${row.entrenamientos_ocio} entrenamientos de Ocio registrados. Con más reportes la comparación anual será más completa.`;

  return `<!doctype html>
<html lang="es"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Informe Ocio · ${safe(row.alumno)}</title><style>
*{box-sizing:border-box}body{margin:0;background:#eef4f7;color:#0f172a;font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.page{width:min(920px,calc(100% - 28px));margin:28px auto;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 24px 70px rgba(15,23,42,.15)}.hero{padding:34px;background:linear-gradient(135deg,#062d3f 0%,#083b4d 58%,#0b5d4f 100%);color:#fff}.brand{font-size:12px;font-weight:900;letter-spacing:.14em;color:#86efac;text-transform:uppercase}.hero h1{font-size:34px;margin:8px 0 6px}.hero p{margin:0;color:#dbe7ee}.content{padding:30px}.intro{font-size:17px;line-height:1.65;color:#334155}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(135px,1fr));gap:10px;margin:0 0 24px}.metric,.section{border:1px solid #dbeafe;border-radius:16px;padding:14px;background:#f8fbff}.metric span{display:block;font-size:10px;color:#64748b;font-weight:900}.metric strong{display:block;font-size:21px;margin-top:4px}.section{border-color:#e2e8f0;background:#fff;margin-top:12px}.section h2{font-size:18px;margin:0 0 8px}.section p,.section ul{color:#475569;line-height:1.6}.accent{border-color:#bbf7d0;background:#f0fdf4}.note{margin-top:10px;padding:11px;background:#f8fafc;border-radius:12px}.footer{padding:0 30px 30px;color:#64748b;font-size:12px}.actions{display:flex;gap:10px;justify-content:center;padding:0 30px 30px}.actions button{border:0;border-radius:14px;padding:12px 18px;font-weight:900}.print{background:#0f9f4d;color:#fff}.close{background:#e2e8f0}@media print{body{background:#fff}.page{width:100%;margin:0;box-shadow:none}.actions{display:none}}
</style></head><body><main class="page"><header class="hero"><div class="brand">Mítico Club · Ocio</div><h1>Informe de evolución · ${safe(row.alumno)}</h1><p>Temporada ${safe(season)} · ${safe(period)}</p></header><div class="content">
<p class="intro">${safe(coverage)} El objetivo es mostrar de forma clara la evolución observada durante las sesiones y orientar el siguiente paso.</p><div class="metrics">${options.age !== null ? `<div class="metric"><span>EDAD</span><strong>${options.age}</strong></div>` : ''}<div class="metric"><span>ENTRENAMIENTOS</span><strong>${row.entrenamientos_ocio}</strong></div><div class="metric"><span>REPORTES</span><strong>${row.reportes_ocio}</strong></div><div class="metric"><span>NIVEL INICIAL</span><strong>${safe(row.nivel_inicial || '—')}</strong></div><div class="metric"><span>NIVEL ACTUAL</span><strong>${safe(row.nivel_final || '—')}</strong></div></div>
<section class="section accent"><h2>Su evolución esta temporada</h2><p>${safe(levelEvolutionText(row))}</p>${row.niveles_reportados ? `<div class="note"><strong>Cambios de nivel registrados:</strong> ${safe(compactLevelJourney(row.niveles_reportados))}</div>` : ''}</section>${christmas ? `<section class="section accent"><h2>De Navidad a final de temporada</h2><p>${safe(christmas)}</p></section>` : ''}<section class="section"><h2>Asistencia y continuidad</h2><p>${safe(continuityText(row))}</p></section>${worked.length ? `<section class="section"><h2>Habilidades trabajadas</h2><p>${safe(worked.join(' · '))}</p></section>` : ''}${strengths.length ? `<section class="section accent"><h2>Fortalezas actuales</h2><ul>${strengths.map((item) => `<li>${safe(item)}</li>`).join('')}</ul></section>` : ''}<section class="section"><h2>Técnica</h2><p>${safe(metricComparisonText('Técnica', row.tecnica_inicial, row.tecnica_final))}</p>${row.comentario_tecnica_final ? `<div class="note">${safe(row.comentario_tecnica_final)}</div>` : ''}</section><section class="section"><h2>Autonomía</h2><p>${safe(metricComparisonText('Autonomía', row.autonomia_inicial, row.autonomia_final))}</p>${row.comentario_autonomia_final ? `<div class="note">${safe(row.comentario_autonomia_final)}</div>` : ''}</section><section class="section"><h2>Remontes y entorno de pista</h2><p>${safe(liftsText)}</p></section><section class="section accent"><h2>Próximos objetivos</h2>${nextSteps.length ? `<ul>${nextSteps.map((item) => `<li>${safe(item)}</li>`).join('')}</ul>` : '<p>Sin objetivo siguiente registrado.</p>'}</section></div><div class="footer">Informe elaborado a partir de registros reales de Mítico Club.</div><div class="actions"><button class="print" onclick="window.print()">Imprimir / guardar PDF</button><button class="close" onclick="window.close()">Cerrar</button></div></main></body></html>`;
}
