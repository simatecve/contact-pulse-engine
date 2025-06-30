
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { user_id, title, message, type = 'info', category = 'general', action_url, metadata } = await req.json()

    console.log('Sending email notification:', { user_id, title, type, category })

    // Get user email from profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, first_name, last_name')
      .eq('id', user_id)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      throw profileError
    }

    // Get user notification preferences
    const { data: preferences, error: preferencesError } = await supabase
      .from('notification_preferences')
      .select('email_notifications, notification_categories')
      .eq('user_id', user_id)
      .single()

    if (preferencesError) {
      console.log('No preferences found, using defaults')
    }

    // Check if user wants email notifications for this category
    const emailEnabled = preferences?.email_notifications !== false
    const categoryEnabled = preferences?.notification_categories?.[category] !== false

    if (!emailEnabled || !categoryEnabled) {
      console.log('Email notifications disabled for user or category')
      return new Response(
        JSON.stringify({ success: true, message: 'Email notifications disabled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create notification in database
    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id,
        title,
        message,
        type,
        category,
        action_url,
        metadata
      })

    if (notificationError) {
      console.error('Error creating notification:', notificationError)
      throw notificationError
    }

    // Send email using Resend (you would need to add Resend API key as secret)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (resendApiKey && profile.email) {
      const emailResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'noreply@tudominio.com',
          to: [profile.email],
          subject: title,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #333;">${title}</h2>
              <p style="color: #666; line-height: 1.6;">${message}</p>
              ${action_url ? `<a href="${action_url}" style="background: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">Ver más</a>` : ''}
              <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 12px;">
                Este es un mensaje automático. Si no deseas recibir estos correos, puedes actualizar tus preferencias en la aplicación.
              </p>
            </div>
          `
        }),
      })

      if (!emailResponse.ok) {
        console.error('Error sending email:', await emailResponse.text())
      } else {
        console.log('Email sent successfully')
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-email-notification:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
