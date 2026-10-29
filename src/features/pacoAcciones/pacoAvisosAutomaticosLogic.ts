// Avisos automáticos de Paco (29/10): botones que acompañan a un aviso cuando
// Jose lo abre en la conversación. Lógica pura (sin red).
//
// - Parte de la mañana con niños sin colocar → «Proponer dónde colocarlos»:
//   manda la petición al agente, que busca el mejor grupo de cada niño y
//   devuelve un botón Confirmar por niño (no se cambia nada sin pulsarlo).
// - Grupo sin confirmar → «¿Quién falta por confirmar?» (consulta).

export type AvisoPacoBasico = { tipo: string; cuerpo: string };

export type BotonAvisoPaco = {
  label: string;
  continuation: { kind: 'agente_texto'; texto: string };
};

export const TEXTO_PROPONER_COLOCAR =
  'Propón dónde colocar a los niños sin grupo de hoy y los dos días siguientes: usa ninos_sin_colocar y opciones_para_nino, y prepara cada uno con preparar_meter_en_grupo para que yo lo confirme.';

export const TEXTO_FALTAN_CONFIRMAR =
  '¿Qué grupos publicados de hoy, mañana y pasado siguen sin confirmar por el entrenador? Usa agenda.';

export function botonesDeAvisoPaco(aviso: AvisoPacoBasico): BotonAvisoPaco[] {
  const tipo = String(aviso.tipo || '').toUpperCase();
  if (tipo === 'PARTE_MANANA' && /sin colocar/i.test(aviso.cuerpo || '')) {
    return [{ label: 'Proponer dónde colocarlos', continuation: { kind: 'agente_texto', texto: TEXTO_PROPONER_COLOCAR } }];
  }
  if (tipo === 'CONFIRMACION_PENDIENTE') {
    return [{ label: '¿Quién falta por confirmar?', continuation: { kind: 'agente_texto', texto: TEXTO_FALTAN_CONFIRMAR } }];
  }
  return [];
}
