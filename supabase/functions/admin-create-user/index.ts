
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verificar que el usuario actual es admin
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Verificar permisos de admin
    const { data: hasPermission } = await supabaseClient
      .rpc('has_permission', { _user_id: user.id, _permission_name: 'users.create' })
    
    if (!hasPermission) {
      console.error('User lacks permission:', user.id)
      return new Response(
        JSON.stringify({ error: 'Sin permisos para crear usuarios' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const { email, password, firstName, lastName, phone, company, role, permissions = [] } = await req.json()

    // Validar datos requeridos
    if (!email || !password || !firstName || !lastName || !role) {
      return new Response(
        JSON.stringify({ error: 'Faltan campos requeridos: email, password, firstName, lastName, role' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log('Creating user with email:', email)

    // Verificar si el usuario ya existe
    const { data: existingUsers, error: checkError } = await supabaseClient.auth.admin.listUsers()
    if (checkError) {
      console.error('Error checking existing users:', checkError)
      return new Response(
        JSON.stringify({ error: 'Error verificando usuarios existentes' }),
        { status: 500, headers: corsHeaders }
      )
    }

    const userExists = existingUsers.users.some(u => u.email === email)
    if (userExists) {
      console.log('User already exists:', email)
      return new Response(
        JSON.stringify({ error: 'Ya existe un usuario con este email' }),
        { status: 409, headers: corsHeaders }
      )
    }

    // Crear usuario con auth admin
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        company: company || null
      },
      email_confirm: true
    })

    if (createError) {
      console.error('User creation error:', createError)
      if (createError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: 'Ya existe un usuario con este email' }),
          { status: 409, headers: corsHeaders }
        )
      }
      return new Response(
        JSON.stringify({ error: `Error creando usuario: ${createError.message}` }),
        { status: 400, headers: corsHeaders }
      )
    }

    if (!newUser.user) {
      console.error('No user returned from creation')
      return new Response(
        JSON.stringify({ error: 'Error: No se pudo crear el usuario' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log('User created successfully:', newUser.user.id)

    // Verificar si ya existe el perfil
    const { data: existingProfile } = await supabaseClient
      .from('profiles')
      .select('id')
      .eq('id', newUser.user.id)
      .single()

    // Crear perfil solo si no existe
    if (!existingProfile) {
      const { error: profileError } = await supabaseClient
        .from('profiles')
        .insert({
          id: newUser.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          company: company || null
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        // No es crítico, continuamos
      } else {
        console.log('Profile created successfully')
      }
    }

    // Verificar si ya existe el rol
    const { data: existingRole } = await supabaseClient
      .from('user_roles')
      .select('id')
      .eq('user_id', newUser.user.id)
      .single()

    // Asignar rol solo si no existe
    if (!existingRole) {
      const { error: roleError } = await supabaseClient
        .from('user_roles')
        .insert({
          user_id: newUser.user.id,
          role,
          assigned_by: user.id
        })

      if (roleError) {
        console.error('Role assignment error:', roleError)
        return new Response(
          JSON.stringify({ error: `Error asignando rol: ${roleError.message}` }),
          { status: 500, headers: corsHeaders }
        )
      }
      console.log('Role assigned successfully')
    }

    // Asignar permisos individuales si se especificaron
    if (permissions.length > 0) {
      const userPermissions = permissions.map((permissionId: string) => ({
        user_id: newUser.user.id,
        permission_id: permissionId,
        granted_by: user.id
      }))

      const { error: permissionsError } = await supabaseClient
        .from('user_permissions')
        .insert(userPermissions)

      if (permissionsError) {
        console.error('Permissions assignment error:', permissionsError)
        // No es crítico, continuamos
      } else {
        console.log('Permissions assigned successfully')
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          created_at: newUser.user.created_at
        },
        message: 'Usuario creado exitosamente'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201,
      },
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Error interno del servidor'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
