
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookRequest {
  endpoint: string;
  data: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, data }: WebhookRequest = await req.json();
    
    console.log(`Proxy request to endpoint: ${endpoint}`, data);

    // Validate endpoint
    const allowedEndpoints = [
      'crear-instancia',
      'qr',
      'estatus-instancia',
      'eliminar-instancia'
    ];

    if (!allowedEndpoints.includes(endpoint)) {
      return new Response(
        JSON.stringify({ error: 'Endpoint no permitido' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Construct webhook URL
    const webhookUrl = `https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/${endpoint}`;
    
    console.log(`Making request to: ${webhookUrl}`);

    // Make request to N8N webhook with extended timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Error desconocido');
        console.error(`Webhook error: ${errorText}`);
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Webhook error (${response.status}): ${response.statusText}`,
            details: errorText
          }),
          { 
            status: response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      // Try to get response data
      const responseData = await response.json().catch(async () => {
        const text = await response.text().catch(() => '');
        return { message: text || 'Petición procesada correctamente' };
      });

      console.log('Webhook response:', responseData);

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: responseData 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('Request timeout');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Timeout: El webhook no respondió en 30 segundos' 
          }),
          { 
            status: 408,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      console.error('Fetch error:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Error de conexión: ${fetchError instanceof Error ? fetchError.message : 'Error desconocido'}` 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

  } catch (error) {
    console.error('Error in webhook proxy:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error interno del servidor' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
