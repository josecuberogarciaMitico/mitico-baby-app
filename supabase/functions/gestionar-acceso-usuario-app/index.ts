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

    if (!callerProfile || callerProfile.rol !== 'coordinador_jefe') {
      return json(
        { message: 'Solo el coordinador jefe puede gestionar accesos.' },
        403,
      )
    }

    const body = await req.json()
    const accion = String(body?.accion || '').trim()

    if (accion === 'listar_estados') {
      const entrenadorIds = Array.isArray(body?.entrenador_ids)
        ? body.entrenador_ids.map((id: unknown) => String(id)).filter(Boolean)
        : []

      if (entrenadorIds.length === 0) {
        return json({ estados: [] })
      }

      const { data: perfiles, error: perfilesError } = await admin
        .from('usuarios_app')
        .select(
          'id, auth_user_id, email, nombre, rol, entrenador_id, activo',
        )
        .eq('rol', 'entrenador')
        .in('entrenador_id', entrenadorIds)

      if (perfilesError) {
        return json(
          { message: 'No se pudieron leer los perfiles de acceso.' },
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

      const usersById = new Map(users.map((user) => [user.id, user]))
      const profilesByTrainer = new Map(
        (perfiles || []).map((perfil) => [perfil.entrenador_id, perfil]),
      )

      const estados = entrenadorIds.map((entrenadorId: string) => {
        const perfil = profilesByTrainer.get(entrenadorId)

        if (!perfil) {
          return {
            entrenador_id: entrenadorId,
            estado: 'sin_acceso',
            email: null,
            auth_user_id: null,
            confirmado_at: null,
            ultimo_acceso_at: null,
          }
        }

        const authUser = perfil.auth_user_id
          ? usersById.get(perfil.auth_user_id)
          : null

        if (!perfil.activo) {
          return {
            entrenador_id: entrenadorId,
            estado: 'desactivado',
            email: perfil.email || authUser?.email || null,
            auth_user_id: perfil.auth_user_id || null,
            confirmado_at: authUser?.confirmed_at || null,
            ultimo_acceso_at: authUser?.last_sign_in_at || null,
          }
        }

        if (!authUser) {
          return {
            entrenador_id: entrenadorId,
            estado: 'revisar',
            email: perfil.email || null,
            auth_user_id: perfil.auth_user_id || null,
            confirmado_at: null,
            ultimo_acceso_at: null,
          }
        }

        return {
          entrenador_id: entrenadorId,
          estado: authUser.confirmed_at
            ? 'activo'
            : 'invitacion_pendiente',
          email: perfil.email || authUser.email || null,
          auth_user_id: authUser.id,
          confirmado_at: authUser.confirmed_at || null,
          ultimo_acceso_at: authUser.last_sign_in_at || null,
        }
      })

      return json({ estados })
    }

    const entrenadorId = String(body?.entrenador_id || '').trim()

    if (!entrenadorId) {
      return json({ message: 'Falta entrenador_id.' }, 400)
    }

    const { data: perfil, error: perfilError } = await admin
      .from('usuarios_app')
      .select(
        'id, auth_user_id, email, nombre, rol, entrenador_id, activo',
      )
      .eq('entrenador_id', entrenadorId)
      .eq('rol', 'entrenador')
      .maybeSingle()

    if (perfilError) {
      return json({ message: 'No se pudo leer el acceso del entrenador.' }, 500)
    }

    if (!perfil) {
      return json(
        { message: 'Ese entrenador todavía no tiene acceso creado.' },
        404,
      )
    }

    if (accion === 'enviar_recuperacion') {
      if (!perfil.email) {
        return json(
          { message: 'La ficha de acceso no tiene email.' },
          409,
        )
      }

      if (!perfil.activo) {
        return json(
          {
            message:
              'El acceso está desactivado. Actívalo antes de enviar una recuperación.',
          },
          409,
        )
      }

      if (!perfil.auth_user_id) {
        return json(
          {
            message:
              'El perfil no tiene usuario Auth vinculado. Hay que revisar el acceso.',
          },
          409,
        )
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.getUserById(perfil.auth_user_id)

      if (authError || !authData?.user) {
        return json(
          {
            message:
              'El usuario de Authentication ya no existe. Hay que revisar el acceso.',
          },
          409,
        )
      }

      if (!authData.user.confirmed_at) {
        return json(
          {
            message:
              'La cuenta todavía no está activa. Usa Reenviar invitación.',
          },
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
        const recoverError = await recoverResponse
          .json()
          .catch(() => ({}))

        return json(
          {
            message:
              recoverError?.msg ||
              recoverError?.message ||
              'No se pudo enviar el email de recuperación.',
          },
          recoverResponse.status,
        )
      }

      return json({
        ok: true,
        estado: 'activo',
        message: 'Email de recuperación enviado.',
      })
    }

    if (accion === 'desactivar') {
      const { error } = await admin
        .from('usuarios_app')
        .update({ activo: false })
        .eq('id', perfil.id)

      if (error) {
        return json({ message: 'No se pudo desactivar el acceso.' }, 500)
      }

      return json({
        ok: true,
        estado: 'desactivado',
        message: 'Acceso desactivado.',
      })
    }

    if (accion === 'activar') {
      if (!perfil.auth_user_id) {
        return json(
          {
            message:
              'El perfil no tiene usuario Auth vinculado. Hay que revisar el acceso.',
          },
          409,
        )
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.getUserById(perfil.auth_user_id)

      if (authError || !authData?.user) {
        return json(
          {
            message:
              'El usuario de Authentication ya no existe. Hay que revisar el acceso.',
          },
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

      return json({
        ok: true,
        estado: authData.user.confirmed_at
          ? 'activo'
          : 'invitacion_pendiente',
        message: 'Acceso activado.',
      })
    }

    if (accion === 'reenviar_invitacion') {
      if (!perfil.auth_user_id || !perfil.email) {
        return json(
          { message: 'Falta usuario Auth o email para reenviar.' },
          409,
        )
      }

      const { data: authData, error: authError } =
        await admin.auth.admin.getUserById(perfil.auth_user_id)

      if (authError || !authData?.user) {
        return json(
          { message: 'No se ha encontrado el usuario pendiente.' },
          409,
        )
      }

      if (authData.user.confirmed_at) {
        return json(
          {
            message:
              'La cuenta ya está activa. Si olvidó la contraseña, debe usar Recuperar contraseña en el login.',
          },
          409,
        )
      }

      const email = perfil.email.trim().toLowerCase()
      const redirectTo = String(body?.redirect_to || '').trim()

      const { error: deleteError } = await admin.auth.admin.deleteUser(
        perfil.auth_user_id,
      )

      if (deleteError) {
        return json(
          { message: 'No se pudo preparar el reenvío de la invitación.' },
          500,
        )
      }

      const { data: invitacion, error: inviteError } =
        await admin.auth.admin.inviteUserByEmail(email, {
          redirectTo: redirectTo || undefined,
          data: {
            nombre: perfil.nombre,
            rol: 'entrenador',
            entrenador_id: entrenadorId,
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

      // 18/11 (caso Julia Fernández): usuarios_app.auth_user_id tiene ON DELETE
      // CASCADE, así que borrar la cuenta de Authentication borra también el
      // perfil del entrenador y el update de antes no encontraba la fila (sin
      // dar error): el entrenador se quedaba sin acceso. Se vuelve a escribir
      // el perfil entero (upsert por id), como en gestionar-usuarios-operativos-app.
      const { error: updateError } = await admin.from('usuarios_app').upsert(
        {
          id: perfil.id,
          auth_user_id: invitacion.user.id,
          email: perfil.email,
          nombre: perfil.nombre,
          rol: 'entrenador',
          entrenador_id: entrenadorId,
          activo: true,
        },
        { onConflict: 'id' },
      )

      if (updateError) {
        return json(
          {
            message:
              'La invitación se ha reenviado, pero no se pudo actualizar el vínculo. No vuelvas a reenviar hasta revisar este caso.',
          },
          500,
        )
      }

      return json({
        ok: true,
        estado: 'invitacion_pendiente',
        message: 'Invitación reenviada.',
      })
    }

    return json({ message: 'Acción no reconocida.' }, 400)
  } catch (error) {
    return json(
      {
        message:
          error instanceof Error
            ? error.message
            : 'Error inesperado gestionando el acceso.',
      },
      500,
    )
  }
})
