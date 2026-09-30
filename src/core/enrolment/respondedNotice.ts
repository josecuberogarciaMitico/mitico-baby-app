import type { AltaNivelInicialApp } from './enrolmentTypes';

// Aviso "test respondido" (solo Coordinador jefe).
// Lógica pura: qué altas cuentan como pendientes de revisar y cuáles
// todavía no se han avisado en este dispositivo.

export type AltaRespondidaAvisoApp = Pick<
  AltaNivelInicialApp,
  'id' | 'nombre_completo' | 'modalidad' | 'estado' | 'respondido_at'
>;

// Mismo criterio que el filtro "Respondido · revisar" de Altas / Test,
// para que el número del menú coincida con el del filtro.
export function altaPendienteRevisarApp(alta: Pick<AltaNivelInicialApp, 'estado'>) {
  return alta.estado === 'RESPONDIDO' || alta.estado === 'VALIDADO';
}

export function contarAltasPendientesRevisarApp(
  altas: ReadonlyArray<Pick<AltaNivelInicialApp, 'estado'>>
) {
  return altas.filter(altaPendienteRevisarApp).length;
}

// Solo avisamos de tests recién respondidos (estado RESPONDIDO) que aún
// no se hayan avisado. Una vez validado el nivel ya no hace falta aviso.
export function altasRespondidasSinAvisarApp<T extends AltaRespondidaAvisoApp>(
  altas: ReadonlyArray<T>,
  avisadas: ReadonlySet<string>
): T[] {
  return altas
    .filter((alta) => alta.estado === 'RESPONDIDO' && !avisadas.has(alta.id))
    .sort((a, b) =>
      String(b.respondido_at || '').localeCompare(String(a.respondido_at || ''))
    );
}

// Guardamos solo ids que siguen existiendo como RESPONDIDO/VALIDADO para que
// la lista de "ya avisadas" no crezca sin límite.
export function depurarAvisadasApp(
  avisadas: ReadonlyArray<string>,
  altas: ReadonlyArray<AltaRespondidaAvisoApp>
): string[] {
  const vigentes = new Set(
    altas.filter(altaPendienteRevisarApp).map((alta) => alta.id)
  );
  return Array.from(new Set(avisadas)).filter((id) => vigentes.has(id));
}

export function textoAvisoAltasRespondidasApp(
  altas: ReadonlyArray<Pick<AltaNivelInicialApp, 'nombre_completo'>>
): { titulo: string; detalle: string } {
  const nombres = altas
    .map((alta) => String(alta.nombre_completo || '').trim())
    .filter(Boolean);
  if (altas.length <= 1) {
    return {
      titulo: 'Test de nivel respondido',
      detalle: `${nombres[0] || 'Una familia'} ya ha respondido. Pendiente de revisar.`,
    };
  }
  const visibles = nombres.slice(0, 3).join(', ');
  const resto = altas.length - Math.min(nombres.length, 3);
  return {
    titulo: `${altas.length} tests de nivel respondidos`,
    detalle: resto > 0 ? `${visibles} y ${resto} más.` : `${visibles}.`,
  };
}
