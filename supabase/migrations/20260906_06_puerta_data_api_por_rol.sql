-- Mítico Baby App · Commit final PR 64
-- Segunda barrera de la Data API: limita recursos por rol antes de que PostgREST
-- ejecute la consulta. Complementa RLS y los filtros de las vistas.
--
-- Debe probarse en staging con las cinco identidades de la matriz de roles antes
-- de instalarse en producción. El rollback está documentado al final.

begin;

create or replace function public.autorizar_peticion_data_api_app()
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_path text := lower(ltrim(coalesce(current_setting('request.path', true), ''), '/'));
  v_jwt_role text := coalesce(
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
    ''
  );
  v_app_role text;
begin
  -- Las llamadas internas de Edge Functions conservan el acceso de servicio.
  if v_jwt_role = 'service_role' then
    return;
  end if;

  -- Superficie pública mínima: solo las tres RPC del test por token.
  if v_jwt_role = 'anon' then
    if v_path = any (array[
      'rpc/evaluar_test_nivel_inicial_app',
      'rpc/obtener_test_nivel_publico_app',
      'rpc/responder_test_nivel_publico_app'
    ]::text[]) then
      return;
    end if;

    raise insufficient_privilege
      using message = 'Este recurso no es público.';
  end if;

  if v_jwt_role <> 'authenticated' or auth.uid() is null then
    raise insufficient_privilege
      using message = 'Sesión no válida.';
  end if;

  select u.rol
  into v_app_role
  from public.usuarios_app u
  where u.auth_user_id = auth.uid()
    and u.activo = true
  limit 1;

  if v_app_role is null then
    raise insufficient_privilege
      using message = 'Usuario sin perfil operativo activo.';
  end if;

  -- Dirección conserva toda la operativa.
  if v_app_role = 'coordinador_jefe' then
    return;
  end if;

  -- Sub-coordinación trabaja con la operativa, pero no con dirección económica,
  -- backups, gestión de temporada ni accesos del equipo.
  if v_app_role in ('sub_coordinador', 'coordinador') then
    if v_path ~ 'cobro'
       or v_path ~ 'analisis'
       or v_path ~ '^rpc/.*backup'
       or v_path ~ '^rpc/.*(activar_temporada|cerrar_temporada|iniciar_nueva_temporada|copia_maestra)'
       or v_path ~ '^rpc/.*(usuario|acceso_operativo)'
    then
      raise insufficient_privilege
        using message = 'Este recurso está reservado a coordinación jefe.';
    end if;
    return;
  end if;

  -- Administración: perfil propio, altas/test y catálogo mínimo de Intensivos.
  if v_app_role = 'administracion' then
    if v_path = any (array[
      'usuarios_app',
      'v_intensivos_app',
      'v_resumen_alumno_v2',
      'rpc/anadir_alta_nivel_inicial_resuelta_app',
      'rpc/comprobar_posibles_alumnos_nueva_alta_app',
      'rpc/crear_alta_nivel_inicial_app',
      'rpc/descartar_alta_nivel_inicial_app',
      'rpc/eliminar_alta_nivel_inicial_app',
      'rpc/eliminar_registro_temporal_alta_nivel_app',
      'rpc/marcar_alta_nivel_enviada_app',
      'rpc/obtener_altas_nivel_inicial_app',
      'rpc/obtener_coincidencias_alta_nivel_inicial_app',
      'rpc/validar_alta_nivel_inicial_app',
      'rpc/evaluar_test_nivel_inicial_app',
      'rpc/obtener_test_nivel_publico_app',
      'rpc/responder_test_nivel_publico_app'
    ]::text[]) then
      return;
    end if;

    raise insufficient_privilege
      using message = 'Administración solo puede acceder a Altas/Test.';
  end if;

  -- Entrenador: sus tres vistas ya filtradas por identidad y las RPC necesarias
  -- para confirmar, marcar asistencia, reportar y responder disponibilidad.
  if v_app_role = 'entrenador' then
    if v_path = any (array[
      'usuarios_app',
      'v_grupos_entrenador_app_dos_entrenadores',
      'v_alumnos_reporte_entrenador_app_dos_entrenadores',
      'v_reportes_pendientes_entrenador_dos_entrenadores',
      'rpc/confirmar_grupo_entrenador_app',
      'rpc/marcar_asistencia_alumno_app',
      'rpc/obtener_nivel_partida_reporte_app',
      'rpc/crear_reporte_alumno_app',
      'rpc/guardar_ritmo_ultimo_reporte_app',
      'rpc/guardar_progresion_inicial_reporte_app',
      'rpc/obtener_semana_disponibilidad_objetivo_entrenador_app',
      'rpc/obtener_disponibilidad_publicada_entrenadores_editor_app',
      'rpc/responder_disponibilidad_editor_app',
      'rpc/evaluar_test_nivel_inicial_app',
      'rpc/obtener_test_nivel_publico_app',
      'rpc/responder_test_nivel_publico_app'
    ]::text[]) then
      return;
    end if;

    raise insufficient_privilege
      using message = 'El recurso no pertenece a la vista de entrenador.';
  end if;

  raise insufficient_privilege
    using message = 'Rol operativo no reconocido.';
end;
$function$;

revoke all on function public.autorizar_peticion_data_api_app()
  from public;
grant execute on function public.autorizar_peticion_data_api_app()
  to anon, authenticated, service_role;

alter role authenticator
  set pgrst.db_pre_request = 'public.autorizar_peticion_data_api_app';

notify pgrst, 'reload config';

commit;

-- ROLLBACK DE EMERGENCIA (ejecutar como una migración separada si fuera preciso):
-- alter role authenticator reset pgrst.db_pre_request;
-- notify pgrst, 'reload config';
