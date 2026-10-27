export type RolUsuarioApp =
  | 'coordinador_jefe'
  | 'sub_coordinador'
  | 'administracion'
  | 'coordinador'
  | 'entrenador'
  | 'consulta';

export function rolUsuarioTextoApp(rol?: string): string {
  if (rol === 'coordinador_jefe') return 'Coordinador jefe';
  if (rol === 'sub_coordinador' || rol === 'coordinador') return 'Sub-coordinador';
  if (rol === 'administracion') return 'Administración';
  if (rol === 'consulta') return 'Solo consulta';
  return 'Entrenador';
}

export function esRolCoordinacionApp(rol?: string): boolean {
  return rol === 'coordinador_jefe' || rol === 'sub_coordinador' || rol === 'administracion' || rol === 'coordinador' || rol === 'consulta';
}

/**
 * Usuario «Solo consulta»: ve la coordinación (y Cobros) pero no puede cambiar
 * nada. El bloqueo de verdad está en Supabase (solo pasa en lecturas); esto es
 * para la pantalla.
 */
export function esSoloConsultaApp(rol?: string): boolean {
  return rol === 'consulta';
}

export function puedeVerCobrosApp(rol?: string): boolean {
  return rol === 'coordinador_jefe' || rol === 'consulta';
}

export function puedeVerDireccionApp(rol?: string): boolean {
  return rol === 'coordinador_jefe';
}

export function puedeGestionarAccesosApp(rol?: string): boolean {
  return rol === 'coordinador_jefe';
}

export function puedeVerAdministracionAltasApp(rol?: string): boolean {
  return rol === 'coordinador_jefe' || rol === 'sub_coordinador' || rol === 'administracion';
}
