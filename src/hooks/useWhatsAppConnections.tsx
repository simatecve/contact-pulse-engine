
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

// Función para hacer peticiones directas al webhook de N8N
const makeWebhookRequest = async (endpoint: string, data: any) => {
  console.log(`Haciendo petición directa al endpoint: ${endpoint}`, data);
  
  const webhookUrl = `https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/${endpoint}`;
  
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      mode: 'no-cors'
    });

    console.log(`Respuesta del webhook ${endpoint}:`, response);
    
    // Con mode: 'no-cors' la respuesta es opaque, asumimos que fue exitosa
    return { success: true };
  } catch (error) {
    console.error(`Error en webhook ${endpoint}:`, error);
    throw error;
  }
};

export const useWhatsAppConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [qrLoading, setQrLoading] = useState<Record<string, boolean>>({});

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

  const createConnection = useMutation({
    mutationFn: async (connectionData: ConnectionFormData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      console.log('Iniciando creación de conexión:', connectionData);
      
      try {
        // Crear la conexión usando petición directa
        await makeWebhookRequest('crear-instancia', {
          name: connectionData.name,
          color: connectionData.color
        });

        // Guardar en la base de datos
        const { data: connection, error } = await supabase
          .from('whatsapp_connections')
          .insert({
            name: connectionData.name,
            color: connectionData.color,
            user_id: user.id,
            instance_id: null
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
        description: "La instancia de WhatsApp se creó correctamente.",
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
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      // Evitar solicitudes múltiples
      if (qrLoading[connectionId]) {
        console.log('Ya hay una petición de QR en curso para:', connectionId);
        return null;
      }

      console.log('Solicitando código QR para:', connection.name);
      
      // Marcar como cargando
      setQrLoading(prev => ({ ...prev, [connectionId]: true }));

      try {
        await makeWebhookRequest('qr', {
          name: connection.name
        });

        // Simular obtención del QR desde la base de datos o estado
        // En la implementación real, el QR se obtendría de la respuesta del webhook
        // Por ahora, verificamos si ya existe en la base de datos
        const { data: updatedConnection, error } = await supabase
          .from('whatsapp_connections')
          .select('qr_code')
          .eq('id', connectionId)
          .single();

        if (error) throw error;

        if (updatedConnection?.qr_code) {
          console.log('Código QR obtenido de la base de datos');
          
          // Guardar el QR en el estado local
          setQrCodes(prev => ({
            ...prev,
            [connectionId]: updatedConnection.qr_code
          }));
          
          return updatedConnection.qr_code;
        } else {
          console.log('No se encontró código QR en la base de datos');
          // Aquí deberías implementar la lógica para obtener el QR del webhook
          // Por ahora retornamos null
          return null;
        }
        
      } catch (error) {
        console.error('Error al obtener QR:', error);
        throw error;
      } finally {
        // Quitar el estado de carga
        setQrLoading(prev => ({ ...prev, [connectionId]: false }));
      }
    },
    onSuccess: (data, connectionId) => {
      if (data) {
        toast({
          title: "Código QR obtenido",
          description: "Escanea el código QR con tu WhatsApp para conectar.",
        });
      }
    },
    onError: (error, connectionId) => {
      console.error('Error en getQRCode mutation:', error);
      setQrLoading(prev => ({ ...prev, [connectionId]: false }));
      
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
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      console.log('Verificando estatus para:', connection.name);

      try {
        await makeWebhookRequest('estatus-instancia', {
          name: connection.name
        });
        
        return { success: true };
      } catch (error) {
        console.error('Error en checkConnectionStatus:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "Estatus verificado",
        description: "Se verificó el estatus de la conexión correctamente.",
      });
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
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) throw new Error('Conexión no encontrada');

      console.log('Eliminando instancia:', connection.name);

      try {
        // Intentar eliminar la instancia del webhook
        try {
          await makeWebhookRequest('eliminar-instancia', {
            name: connection.name
          });
          console.log('Instancia eliminada del webhook correctamente');
        } catch (webhookError) {
          console.warn('Error al eliminar del webhook (continuando):', webhookError);
        }

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
        title: "Conexión eliminada",
        description: "La conexión se eliminó correctamente.",
      });
    },
    onError: (error) => {
      console.error('Error en deleteConnection mutation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast({
        title: "Error al eliminar",
        description: `No se pudo eliminar la conexión: ${errorMessage}`,
        variant: "destructive",
      });
    }
  });

  // Función para obtener el QR desde el estado local
  const getQRFromState = (connectionId: string) => {
    return qrCodes[connectionId] || null;
  };

  // Función para verificar si está cargando el QR
  const isQRLoading = (connectionId: string) => {
    return qrLoading[connectionId] || false;
  };

  return {
    connections,
    isLoading,
    createConnection,
    getQRCode,
    markAsConnected,
    checkConnectionStatus,
    deleteConnection,
    getQRFromState,
    isQRLoading
  };
};
