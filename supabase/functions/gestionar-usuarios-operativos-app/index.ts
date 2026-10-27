import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

// 'consulta' (27/10/2026): usuario «Solo consulta», ve la coordinación y Cobros
// sin poder cambiar nada (el bloqueo está en la base de datos).
const ROLES_CREABLES = new Set(['sub_coordinador', 'administracion', 'consulta'])
const ROLES_GESTIONABLES = new Set([
  'sub_coordinador',
  'administracion',
  'coordinador',
  'consulta',
])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ message: 'Método no permitido.' }, 405)
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ message: 'Faltan variables seguras de Supabase.' }, 500)
    }

    const authorization = req.headers.get('Authorization') || ''
    const token = authorization.replace(/^Bearer\s+/i, '').trim()

    if (!token) {
      return json({ message: 'Sesión no válida.' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const {
      data: { user: caller },
      error: callerError,
    } = await userClient.auth.getUser(token)

    if (callerError || !caller) {
      return json({ message: 'No se ha podido validar tu sesión.' }, 401)
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

    const { data: callerProfile, error: callerProfileError } = await admin
      .from('usuarios_app')
      .select('id, rol, activo')
      .eq('auth_user_id', caller.id)
      .eq('activo', true)
      .maybeSingle()

    if (callerProfileError) {
      return json({ message: 'No se pudo comprobar tu perfil.' }, 500)
    }

    const body = await req.json()
    const accion = String(body?.accion || '').trim()

    // «Solo consulta» puede VER la lista de accesos; nada más.
    const esJefe = callerProfile?.rol === 'coordinador_jefe'
    const esConsultaListando =
      callerProfile?.rol === 'consulta' && accion === 'listar'

    if (!callerProfile || (!esJefe && !esConsultaListando)) {
      return json(
        { message: 'Solo el coordinador jefe puede gestionar estos accesos.' },
        403,
      )
    }

    if (accion === 'listar') {
      const { data: perfiles, error: perfilesError } = await admin
        .from('usuarios_app')
        .select(
          'id, auth_user_id, email, nombre, rol, entrenador_id, activo',
        )
        .in('rol', [
          'coordinador_jefe',
          'sub_coordinador',
          'administracion',
          'coordinador',
          'consulta',
        ])
        .order('nombre', { ascending: true })

      if (perfilesError) {
        return json(
          { message: 'No se pudieron leer los usuarios operativos.' },
          500,
        )
      }

      const {
        data: { users },
        error: usersError,
      } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })

      if (usersError) {
        return json(
          { message: 'No se pudieron leer los usuarios de Authentication.' },
          500,
        )
      }

      const authById = new Map(users.map((user) => [user.id, user]))

      const usuarios = (perfiles || []).map((perfil) => {
        const authUser = perfil.auth_user_id
          ? authById.get(perfil.auth_user_id)
          : null

        let estado = 'revisar'

        if (!perfil.activo) {
          estado = 'desactivado'
        } else if (authUser?.confirmed_at) {
          estado = 'activo'
        } else if (authUser) {
          estado = 'invitacion_pendiente'
        }

        return {
          id: perfil.id,
          auth_user_id: perfil.auth_user_id,
          email: perfil.email,
          nombre: perfil.nombre,
          rol: perfil.rol,
          activo: perfil.activo,
          estado_acceso: estado,
          confirmado_at: authUser?.confirmed_at || null,
          ultimo_acceso_at: authUser?.last_sign_in_at || null,
        }
      })

      return json({ usuarios })
    }

    if (accion === 'crear') {
      const nombre = String(body?.nombre || '').trim()
      const email = String(body?.email || '').trim().toLowerCase()
      const rol = String(body?.rol || '').trim()
      const redirectTo = String(body?.redirect_to || '').trim()

      if (!nombre || !email || !email.includes('@')) {
        return json({ message: 'Nombre o email no válidos.' }, 400)
      }

      if (!ROLES_CREABLES.has(rol)) {
        return json(
          {
            message:
              'Desde esta pantalla solo se puede crear Sub-coordinador, Administración o Solo consulta.',
          },
          400,
        )
      }

      const { data: perfilExistente } = await admin
        .from('usuarios_app')
        .select('id, rol')
        .eq('email', email)
        .maybeSingle()

      if (perfilExistente) {
        return json(
          {
            message:
              'Ya existe un usuario de la app con ese email. Revísalo antes de crear otro.',
          },
          409,
        )
      }

      const {
        data: { users: authUsers },
      } = await admin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      })

      const authExistente = authUsers.find(
        (u) => String(u.email || '').toLowerCase() === email,
      )

      if (authExistente) {
        return json(
          {
            message:
              'Ese email ya existe en Authentication. Revísalo antes de crear el acceso.',
          },
          409,
        )
      }

      const { data: invitacion, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: redirectTo || undefined,
          data: {
            nombre,
            rol,
          },
        })

      if (inviteError || !invitacion?.user?.id) {
        return json(
          {
            message:
              inviteError?.message || 'No se pudo enviar la invitación.',
          },
          500,
        )
      }

      const { error: insertError } = await admin.from('usuarios_app').insert({
        auth_user_id: invitacion.user.id,
        email,
        nombre,
        rol,
        entrenador_id: null,
        activo: true,
      })

      if (insertError) {
        await admin.auth.admin.deleteUser(invitacion.user.id)

        return json(
          {
            message:
              'No se pudo crear el perfil de la app. La invitación se ha revertido.',
          },
          500,
        )
      }

      return json({
        ok: true,
        message: 'Acceso creado e invitación enviada.',
      })
    }

    const usuarioId = String(body?.usuario_id || '').trim()

    if (!usuarioId) {
      return json({ message: 'Falta usuario_id.' }, 400)
    }

    const { data: perfil, error: perfilError } = await admin
      .from('usuarios_app')
      .select('id, auth_user_id, email, nombre, rol, activo')
      .eq('id', usuarioId)
      .maybeSingle()

    if (perfilError || !perfil) {
      return json({ message: 'No se ha encontrado ese usuario.' }, 404)
    }

    if (perfil.rol === 'coordinador_jefe') {
      return json(
        {
          message:
            'La cuenta de coordinador jefe está protegida y no se puede modificar desde esta función.',
        },
        403,
      )
    }

    if (!ROLES_GESTIONABLES.has(perfil.rol)) {
      return json({ message: 'Ese rol no se puede gestionar aquí.' }, 403)
    }

    if (accion === 'desactivar') {
      const { error } = await admin
        .from('usuarios_app')
        .update({ activo: false })
        .eq('id', perfil.id)

      if (error) {
        return json({ message: 'No se pudo desactivar el acceso.' }, 500)
      }

      return json({ ok: true, message: 'Acceso desactivado.' })
    }

    if (accion === 'activar') {
      if (!perfil.auth_user_id) {
        return json(
          { message: 'El perfil no tiene usuario Auth vinculado.' },
          409,
        )
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.getUserById(perfil.auth_user_id)

      if (authError || !authData?.user) {
        return json(
          { message: 'El usuario de Authentication ya no existe.' },
          409,
        )
      }

      const { error } = await admin
        .from('usuarios_app')
        .update({ activo: true })
        .eq('id', perfil.id)

      if (error) {
        return json({ message: 'No se pudo activar el acceso.' }, 500)
      }

      return json({ ok: true, message: 'Acceso activado.' })
    }

    if (accion === 'enviar_recuperacion') {
      if (!perfil.activo) {
        return json(
          { message: 'Activa primero este acceso.' },
          409,
        )
      }

      if (!perfil.auth_user_id || !perfil.email) {
        return json(
          { message: 'Falta usuario Auth o email.' },
          409,
        )
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.getUserById(perfil.auth_user_id)

      if (authError || !authData?.user) {
        return json(
          { message: 'El usuario de Authentication ya no existe.' },
          409,
        )
      }

      if (!authData.user.confirmed_at) {
        return json(
          { message: 'La invitación todavía está pendiente.' },
          409,
        )
      }

      const redirectTo = String(body?.redirect_to || '').trim()
      const recoverUrl = new URL(`${supabaseUrl}/auth/v1/recover`)

      if (redirectTo) {
        recoverUrl.searchParams.set('redirect_to', redirectTo)
      }

      const recoverResponse = await fetch(recoverUrl.toString(), {
        method: 'POST',
        headers: {
          apikey: anonKey,
          Authorization: `Bearer ${anonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: perfil.email.trim().toLowerCase(),
        }),
      })

      if (!recoverResponse.ok) {
        const recoverError = await recoverResponse.json().catch(() => ({}))

        return json(
          {
            message:
              recoverError?.msg ||
              recoverError?.message ||
              'No se pudo enviar la recuperación.',
          },
          recoverResponse.status,
        )
      }

      return json({ ok: true, message: 'Recuperación enviada.' })
    }

    if (accion === 'reenviar_invitacion') {
      if (!perfil.auth_user_id || !perfil.email) {
        return json({ message: 'Falta usuario Auth o email.' }, 409)
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.getUserById(perfil.auth_user_id)

      if (authError || !authData?.user) {
        return json(
          { message: 'No existe el usuario pendiente en Authentication.' },
          409,
        )
      }

      if (authData.user.confirmed_at) {
        return json(
          {
            message:
              'La cuenta ya está confirmada. Usa Recuperar contraseña.',
          },
          409,
        )
      }

      const redirectTo = String(body?.redirect_to || '').trim()

      const { error: deleteError } = await admin.auth.admin.deleteUser(
        perfil.auth_user_id,
      )

      if (deleteError) {
        return json(
          { message: 'No se pudo preparar el reenvío.' },
          500,
        )
      }

      const { data: invitacion, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(perfil.email, {
          redirectTo: redirectTo || undefined,
          data: {
            nombre: perfil.nombre,
            rol: perfil.rol,
          },
        })

      if (inviteError || !invitacion?.user?.id) {
        return json(
          {
            message:
              inviteError?.message || 'No se pudo reenviar la invitación.',
          },
          500,
        )
      }

      const { error: updateError } = await admin
        .from('usuarios_app')
        .update({
          auth_user_id: invitacion.user.id,
          activo: true,
        })
        .eq('id', perfil.id)

      if (updateError) {
        return json(
          {
            message:
              'La invitación se ha reenviado, pero no se pudo actualizar el vínculo. Revisa este caso antes de repetir.',
          },
          500,
        )
      }

      return json({ ok: true, message: 'Invitación reenviada.' })
    }

    return json({ message: 'Acción no reconocida.' }, 400)
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Error inesperado gestionando usuarios.',
      },
      500,
    )
  }
})
