import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface WhatsAppConnection {
  id: string;
  name: string;
  color: string;
  status: string;
  instance_id: string | null;
  qr_code: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectionFormData {
  name: string;
  color: string;
}

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  description: string | null;
}

export const useWhatsAppConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['whatsapp-connections', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhook-endpoints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('*');

      if (error) throw error;
      return data as WebhookEndpoint[];
    }
  });

  const getWebhookUrl = (name: string) => {
    const webhook = webhooks.find(w => w.name === name);
    return webhook?.url || '';
  };

  const createConnection = useMutation({
    mutationFn: async (connectionData: ConnectionFormData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const webhookUrl = getWebhookUrl('crear-instancia');
      if (!webhookUrl) throw new Error('Webhook URL no encontrada');
      
      // Llamar al webhook para crear la instancia
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connectionData.name,
          color: connectionData.color
        }),
      });

      if (!response.ok) {
        throw new Error('Error al crear la instancia en el webhook');
      }

      const webhookResult = await response.json();
      
      // Si el webhook responde positivo, guardar en la base de datos
      const { data: connection, error } = await supabase
        .from('whatsapp_connections')
        .insert({
          name: connectionData.name,
          color: connectionData.color,
          user_id: user.id,
          instance_id: webhookResult.instance_id || null
        })
        .select()
        .single();

      if (error) throw error;
      return connection;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "Conexión creada",
        description: "La conexión de WhatsApp se creó exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la conexión de WhatsApp.",
        variant: "destructive",
      });
    }
  });

  const getQRCode = useMutation({
    mutationFn: async (connectionId: string) => {
      const webhookUrl = getWebhookUrl('qr');
      if (!webhookUrl) throw new Error('Webhook URL no encontrada');

      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      console.log('Solicitando código QR para:', connection.name);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connection.name
        }),
      });

      if (!response.ok) {
        console.error('Error en respuesta del webhook:', response.status, response.statusText);
        throw new Error(`Error al obtener el código QR: ${response.status}`);
      }

      // Obtener la respuesta como texto primero
      const responseText = await response.text();
      console.log('Respuesta del webhook QR:', responseText);

      let qrCodeData;
      
      try {
        // Intentar parsear como JSON primero
        const jsonResponse = JSON.parse(responseText);
        console.log('Respuesta parseada como JSON:', jsonResponse);
        
        // Si es un array con estructura { data: { base64: "..." } }
        if (Array.isArray(jsonResponse) && jsonResponse[0] && jsonResponse[0].data && jsonResponse[0].data.base64) {
          qrCodeData = jsonResponse[0].data.base64;
        }
        // Si tiene la propiedad qr_code directamente
        else if (jsonResponse.qr_code) {
          qrCodeData = jsonResponse.qr_code;
        }
        // Si es un objeto con base64
        else if (jsonResponse.base64) {
          qrCodeData = jsonResponse.base64;
        }
        // Si es la respuesta directa
        else {
          qrCodeData = responseText;
        }
      } catch (parseError) {
        // Si no es JSON válido, usar la respuesta directa
        console.log('Respuesta no es JSON válido, usando respuesta directa');
        qrCodeData = responseText;
      }

      console.log('Datos del QR procesados:', qrCodeData ? qrCodeData.substring(0, 50) + '...' : 'null');
      
      // Actualizar la conexión con el código QR
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ qr_code: qrCodeData })
        .eq('id', connectionId);

      if (error) {
        console.error('Error al actualizar QR en base de datos:', error);
        throw error;
      }
      
      return qrCodeData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "Código QR generado",
        description: "El código QR se generó correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error en getQRCode:', error);
      toast({
        title: "Error",
        description: "No se pudo obtener el código QR.",
        variant: "destructive",
      });
    }
  });

  const checkConnectionStatus = useMutation({
    mutationFn: async (connectionId: string) => {
      const webhookUrl = getWebhookUrl('estatus-instancia');
      if (!webhookUrl) throw new Error('Webhook URL no encontrada');

      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: connection.name
        }),
      });

      if (!response.ok) {
        throw new Error('Error al verificar el estatus de la conexión');
      }

      const result = await response.json();
      
      // Si el estatus es "conectado" o "correcto", actualizar en la base de datos
      if (result.status === 'conectado' || result.status === 'correcto') {
        const { error } = await supabase
          .from('whatsapp_connections')
          .update({ status: 'connected', qr_code: null })
          .eq('id', connectionId);

        if (error) throw error;
        
        toast({
          title: "WhatsApp conectado",
          description: "Tu WhatsApp se verificó y está conectado correctamente.",
        });
      } else {
        toast({
          title: "WhatsApp no conectado",
          description: "Tu WhatsApp aún no está conectado. Intenta conectar con código QR.",
          variant: "destructive",
        });
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo verificar el estatus de la conexión.",
        variant: "destructive",
      });
    }
  });

  const markAsConnected = useMutation({
    mutationFn: async (connectionId: string) => {
      // Primero verificar el estatus con el webhook
      await checkConnectionStatus.mutateAsync(connectionId);
    }
  });

  return {
    connections,
    isLoading,
    createConnection,
    getQRCode,
    markAsConnected,
    checkConnectionStatus
  };
};
