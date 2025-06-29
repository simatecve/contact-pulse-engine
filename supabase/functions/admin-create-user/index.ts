
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
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Verificar permisos de admin
    const { data: hasPermission } = await supabaseClient
      .rpc('has_permission', { _user_id: user.id, _permission_name: 'users.create' })
    
    if (!hasPermission) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    const { email, password, firstName, lastName, phone, company, role, permissions = [] } = await req.json()

    // Crear usuario con auth admin
    const { data: newUser, error: createError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        phone,
        company
      },
      email_confirm: true
    })

    if (createError) {
      throw createError
    }

    // Crear perfil
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        company
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // Asignar rol
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role,
        assigned_by: user.id
      })

    if (roleError) {
      throw roleError
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
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: newUser.user,
        message: 'Usuario creado exitosamente'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error creating user:', error)
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
