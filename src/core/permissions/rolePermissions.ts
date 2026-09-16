export type RolUsuarioApp =
  | 'coordinador_jefe'
  | 'sub_coordinador'
  | 'administracion'
  | 'coordinador'
  | 'entrenador';

export function rolUsuarioTextoApp(rol?: string): string {
  if (rol === 'coordinador_jefe') return 'Coordinador jefe';
  if (rol === 'sub_coordinador' || rol === 'coordinador') return 'Sub-coordinador';
  if (rol === 'administracion') return 'Administración';
  return 'Entrenador';
}

export function esRolCoordinacionApp(rol?: string): boolean {
  return rol === 'coordinador_jefe' || rol === 'sub_coordinador' || rol === 'administracion' || rol === 'coordinador';
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
