import type { RolUsuarioApp } from '../../core/permissions/rolePermissions';

export type PerfilUsuarioApp = {
  id: string;
  auth_user_id: string;
  email: string;
  nombre: string;
  rol: RolUsuarioApp;
  entrenador_id: string | null;
  activo: boolean;
};

export type UsuarioOperativoGestionApp = {
  id: string;
  auth_user_id: string | null;
  email: string;
  nombre: string;
  rol: 'coordinador_jefe' | 'sub_coordinador' | 'administracion' | 'coordinador';
  activo: boolean;
  estado_acceso: 'activo' | 'invitacion_pendiente' | 'desactivado' | 'revisar';
  confirmado_at: string | null;
  ultimo_acceso_at: string | null;
};

export type SesionAuthApp = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user: { id: string; email?: string };
};
