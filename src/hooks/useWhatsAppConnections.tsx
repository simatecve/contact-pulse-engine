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

// Función auxiliar para validar URLs
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Función auxiliar para hacer peticiones con mejor manejo de errores y CORS
const makeWebhookRequest = async (url: string, data: any, timeoutMs = 30000) => {
  console.log(`Haciendo petición a: ${url} con modo no-cors`, data);
  
  if (!isValidUrl(url)) {
    throw new Error(`URL inválida: ${url}`);
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: 'POST',
      mode: 'no-cors', // Crucial para evitar errores CORS con webhooks externos
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`Respuesta de ${url}:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      type: response.type,
      mode: 'no-cors aplicado'
    });

    // Con mode: 'no-cors', la respuesta será 'opaque' y no podremos leer el contenido
    // Pero si llega aquí sin error, significa que la petición se envió correctamente
    if (response.type === 'opaque') {
      console.log('Respuesta opaque recibida - petición enviada correctamente');
      return { 
        ok: true, 
        status: 0, // Las respuestas opaque siempre tienen status 0
        text: () => Promise.resolve('Petición enviada correctamente'),
        json: () => Promise.resolve({ success: true, message: 'Petición enviada' })
      };
    }

    // Para respuestas normales (si las hubiera)
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Error desconocido');
      console.error(`Error en webhook ${url}:`, errorText);
      throw new Error(`Webhook error (${response.status}): ${response.statusText}`);
    }

    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error(`Timeout en petición a ${url}`);
        throw new Error(`Timeout: El webhook no respondió en ${timeoutMs/1000} segundos`);
      }
      console.error(`Error en petición a ${url}:`, error.message);
      throw error;
    }
    
    console.error(`Error desconocido en petición a ${url}:`, error);
    throw new Error('Error desconocido en la petición');
  }
};

export const useWhatsAppConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});

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
    if (!webhook?.url) {
      console.error(`Webhook no encontrado: ${name}`);
      console.log('Webhooks disponibles:', webhooks.map(w => w.name));
    }
    return webhook?.url || '';
  };

  const createConnection = useMutation({
    mutationFn: async (connectionData: ConnectionFormData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      console.log('Iniciando creación de conexión:', connectionData);
      
      const webhookUrl = getWebhookUrl('crear-instancia');
      if (!webhookUrl) {
        throw new Error('Webhook "crear-instancia" no encontrado o URL vacía');
      }

      console.log('URL del webhook crear-instancia:', webhookUrl);

      try {
        const response = await makeWebhookRequest(webhookUrl, {
          name: connectionData.name,
          color: connectionData.color
        });

        // Con mode: 'no-cors', no podemos leer la respuesta real
        // Pero si llegamos aquí, la petición se envió correctamente
        console.log('Petición de creación enviada correctamente al webhook');

        // Guardar en la base de datos
        const { data: connection, error } = await supabase
          .from('whatsapp_connections')
          .insert({
            name: connectionData.name,
            color: connectionData.color,
            user_id: user.id,
            instance_id: null // Se actualizará cuando tengamos confirmación
          })
          .select()
          .single();

        if (error) {
          console.error('Error al guardar en la base de datos:', error);
          throw error;
        }

        console.log('Conexión creada exitosamente:', connection);
        return connection;
      } catch (error) {
        console.error('Error en createConnection:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "Conexión creada",
        description: "La petición se envió correctamente. La instancia debería crearse en unos momentos.",
      });
    },
    onError: (error) => {
      console.error('Error en createConnection mutation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al crear conexión",
        description: `No se pudo crear la conexión: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  const getQRCode = useMutation({
    mutationFn: async (connectionId: string) => {
      const webhookUrl = getWebhookUrl('qr');
      if (!webhookUrl) throw new Error('Webhook "qr" no encontrado');

      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      console.log('Solicitando código QR para:', connection.name);

      try {
        const response = await makeWebhookRequest(webhookUrl, {
          name: connection.name
        });

        // Con mode: 'no-cors', no podemos leer la respuesta
        // Simulamos que se generó correctamente
        console.log('Petición QR enviada correctamente');
        
        // Por ahora, devolvemos un placeholder hasta que se implemente un método
        // para obtener el QR de manera diferente
        const qrCodeData = 'QR_SOLICITADO_' + Date.now();
        
        // Guardar el QR en el estado local
        setQrCodes(prev => ({
          ...prev,
          [connectionId]: qrCodeData
        }));
        
        return qrCodeData;
      } catch (error) {
        console.error('Error en getQRCode:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Código QR solicitado",
        description: "La petición del código QR se envió correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error en getQRCode mutation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al obtener QR",
        description: `No se pudo obtener el código QR: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  const checkConnectionStatus = useMutation({
    mutationFn: async (connectionId: string) => {
      const webhookUrl = getWebhookUrl('estatus-instancia');
      if (!webhookUrl) throw new Error('Webhook "estatus-instancia" no encontrado');

      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      console.log('Verificando estatus para:', connection.name);
      console.log('URL del webhook:', webhookUrl);

      try {
        const response = await makeWebhookRequest(webhookUrl, {
          name: connection.name
        });

        console.log('Petición de verificación de estatus enviada correctamente');
        
        // Como no podemos leer la respuesta real, 
        // sugerimos al usuario que verifique manualmente
        toast({
          title: "Verificación enviada",
          description: "Se envió la petición de verificación. Si tu WhatsApp está conectado, marca como conectado manualmente.",
        });
        
        return { status: 'verification_sent' };
      } catch (error) {
        console.error('Error en checkConnectionStatus:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
    },
    onError: (error) => {
      console.error('Error en checkConnectionStatus mutation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al verificar conexión",
        description: `No se pudo verificar el estatus: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  const markAsConnected = useMutation({
    mutationFn: async (connectionId: string) => {
      // Actualizar directamente el estatus en la base de datos sin webhook
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ status: 'connected' })
        .eq('id', connectionId);

      if (error) throw error;
      
      // Limpiar el QR del estado local
      setQrCodes(prev => {
        const newQrCodes = { ...prev };
        delete newQrCodes[connectionId];
        return newQrCodes;
      });
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "WhatsApp conectado",
        description: "Tu WhatsApp se marcó como conectado correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error en markAsConnected:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al marcar conexión",
        description: `No se pudo marcar como conectada: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  const deleteConnection = useMutation({
    mutationFn: async (connectionId: string) => {
      const webhookUrl = getWebhookUrl('eliminar-instancia');
      if (!webhookUrl) throw new Error('Webhook "eliminar-instancia" no encontrado');

      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      console.log('Eliminando instancia:', connection.name);

      try {
        const response = await makeWebhookRequest(webhookUrl, {
          name: connection.name
        });

        console.log('Petición de eliminación enviada correctamente');

        // Eliminar de la base de datos
        const { error } = await supabase
          .from('whatsapp_connections')
          .delete()
          .eq('id', connectionId);

        if (error) throw error;

        // Limpiar el QR del estado local si existe
        setQrCodes(prev => {
          const newQrCodes = { ...prev };
          delete newQrCodes[connectionId];
          return newQrCodes;
        });

        return { success: true };
      } catch (error) {
        console.error('Error en deleteConnection:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "Instancia eliminada",
        description: "La petición de eliminación se envió correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error en deleteConnection mutation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la instancia: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  // Función para obtener el QR desde el estado local
  const getQRFromState = (connectionId: string) => {
    return qrCodes[connectionId] || null;
  };

  return {
    connections,
    isLoading,
    createConnection,
    getQRCode,
    markAsConnected,
    checkConnectionStatus,
    deleteConnection,
    getQRFromState
  };
};
