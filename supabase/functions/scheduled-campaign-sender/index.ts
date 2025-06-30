
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

    console.log('Processing scheduled campaigns...')

    // Get campaigns scheduled for now or past due
    const now = new Date().toISOString()
    const { data: scheduledCampaigns, error: scheduledError } = await supabase
      .from('campaign_schedules')
      .select(`
        *,
        campaigns!inner(
          id,
          name,
          message,
          contact_list_id,
          user_id,
          ai_enabled,
          max_delay_seconds
        )
      `)
      .eq('status', 'scheduled')
      .lte('scheduled_at', now)

    if (scheduledError) {
      console.error('Error fetching scheduled campaigns:', scheduledError)
      throw scheduledError
    }

    console.log(`Found ${scheduledCampaigns?.length || 0} campaigns to process`)

    for (const schedule of scheduledCampaigns || []) {
      try {
        console.log(`Processing campaign: ${schedule.campaigns.name}`)

        // Mark schedule as being processed
        await supabase
          .from('campaign_schedules')
          .update({ status: 'processing' })
          .eq('id', schedule.id)

        // Get contacts from the campaign's contact list
        const { data: contacts, error: contactsError } = await supabase
          .from('contact_list_members')
          .select(`
            contacts!inner(
              id,
              email,
              first_name,
              last_name,
              phone
            )
          `)
          .eq('list_id', schedule.campaigns.contact_list_id)

        if (contactsError) {
          console.error('Error fetching contacts:', contactsError)
          throw contactsError
        }

        console.log(`Found ${contacts?.length || 0} contacts for campaign`)

        // Process each contact
        let successCount = 0
        let errorCount = 0

        for (const contact of contacts || []) {
          try {
            // Here you would implement the actual message sending logic
            // This could involve calling WhatsApp API, email service, etc.
            
            // For now, we'll just create a campaign message record
            const { error: messageError } = await supabase
              .from('campaign_messages')
              .insert({
                campaign_id: schedule.campaigns.id,
                contact_id: contact.contacts.id,
                status: 'sent',
                sent_at: new Date().toISOString()
              })

            if (messageError) {
              console.error('Error creating campaign message:', messageError)
              errorCount++
            } else {
              successCount++
              
              // Track analytics
              await supabase
                .from('campaign_analytics')
                .insert({
                  campaign_id: schedule.campaigns.id,
                  contact_id: contact.contacts.id,
                  event_type: 'sent',
                  event_timestamp: new Date().toISOString()
                })
            }

            // Add delay if specified
            if (schedule.campaigns.max_delay_seconds && schedule.campaigns.max_delay_seconds > 0) {
              const delay = Math.random() * schedule.campaigns.max_delay_seconds * 1000
              await new Promise(resolve => setTimeout(resolve, delay))
            }

          } catch (contactError) {
            console.error(`Error processing contact ${contact.contacts.id}:`, contactError)
            errorCount++
          }
        }

        // Update schedule status
        await supabase
          .from('campaign_schedules')
          .update({
            status: errorCount > 0 ? 'failed' : 'sent',
            sent_at: new Date().toISOString(),
            error_message: errorCount > 0 ? `${errorCount} messages failed to send` : null
          })
          .eq('id', schedule.id)

        // Send notification to campaign owner
        await supabase.functions.invoke('send-email-notification', {
          body: {
            user_id: schedule.campaigns.user_id,
            title: 'Campaña Enviada',
            message: `La campaña "${schedule.campaigns.name}" ha sido enviada. ${successCount} mensajes enviados exitosamente${errorCount > 0 ? `, ${errorCount} fallaron` : ''}.`,
            type: errorCount > 0 ? 'warning' : 'success',
            category: 'campaign'
          }
        })

        console.log(`Campaign completed: ${successCount} sent, ${errorCount} failed`)

      } catch (campaignError) {
        console.error(`Error processing campaign ${schedule.id}:`, campaignError)
        
        // Mark as failed
        await supabase
          .from('campaign_schedules')
          .update({
            status: 'failed',
            error_message: campaignError.message
          })
          .eq('id', schedule.id)
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Processed ${scheduledCampaigns?.length || 0} scheduled campaigns` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in scheduled-campaign-sender:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
