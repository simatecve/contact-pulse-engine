import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWebhookUrls } from '@/hooks/useWebhookUrls';
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

// Circuit breaker state for preventing infinite retries
interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  isOpen: boolean;
}

const circuitBreakers: Record<string, CircuitBreakerState> = {};
const MAX_FAILURES = 3;
const RESET_TIMEOUT = 30000; // 30 seconds

const getCircuitBreaker = (key: string): CircuitBreakerState => {
  if (!circuitBreakers[key]) {
    circuitBreakers[key] = { failures: 0, lastFailure: 0, isOpen: false };
  }
  return circuitBreakers[key];
};

const canMakeRequest = (key: string): boolean => {
  const breaker = getCircuitBreaker(key);
  
  if (!breaker.isOpen) return true;
  
  // Check if we should reset the circuit breaker
  if (Date.now() - breaker.lastFailure > RESET_TIMEOUT) {
    console.log(`Circuit breaker reset for: ${key}`);
    breaker.failures = 0;
    breaker.isOpen = false;
    return true;
  }
  
  return false;
};

const recordFailure = (key: string) => {
  const breaker = getCircuitBreaker(key);
  breaker.failures++;
  breaker.lastFailure = Date.now();
  
  if (breaker.failures >= MAX_FAILURES) {
    breaker.isOpen = true;
    console.warn(`Circuit breaker opened for: ${key}. Too many failures.`);
  }
};

const recordSuccess = (key: string) => {
  const breaker = getCircuitBreaker(key);
  breaker.failures = 0;
  breaker.isOpen = false;
};

export const useWhatsAppConnections = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { getWebhookUrl } = useWebhookUrls();
  const [qrCodes, setQrCodes] = useState<Record<string, string>>({});
  const [qrLoading, setQrLoading] = useState<Record<string, boolean>>({});

  // Función para hacer peticiones a webhooks usando URLs de la base de datos
  const makeWebhookRequest = async (endpoint: string, data: any) => {
    const circuitKey = `webhook-${endpoint}`;
    
    if (!canMakeRequest(circuitKey)) {
      throw new Error(`Circuit breaker is open for ${endpoint}. Too many recent failures. Please wait.`);
    }

    const webhookUrl = getWebhookUrl(endpoint);
    
    if (!webhookUrl) {
      throw new Error(`Webhook URL not found for endpoint: ${endpoint}`);
    }

    console.log(`Making request to webhook: ${endpoint}`, { url: webhookUrl, data });
    
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      console.log(`Webhook ${endpoint} response status:`, response.status);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new Error(`Webhook ${endpoint} failed: ${response.status} - ${errorText}`);
      }

      // Try to parse JSON response
      const responseData = await response.json().catch(async () => {
        const text = await response.text().catch(() => '');
        return { message: text || 'Request processed successfully' };
      });

      console.log(`Webhook ${endpoint} response:`, responseData);
      recordSuccess(circuitKey);
      
      return responseData;
    } catch (error) {
      console.error(`Error in webhook ${endpoint}:`, error);
      recordFailure(circuitKey);
      throw error;
    }
  };

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
        // Crear la conexión usando la URL correcta desde la base de datos
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
        const response = await makeWebhookRequest('qr', {
          name: connection.name
        });

        console.log('Respuesta completa del webhook QR:', JSON.stringify(response, null, 2));

        let qrCode = null;
        
        // El webhook puede devolver diferentes formatos:
        // 1. Array con objetos que contienen data.base64
        // 2. Objeto directo con base64
        // 3. Solo mensaje de éxito (sin QR aún)
        
        if (Array.isArray(response)) {
          console.log('Respuesta es un array, buscando QR...');
          
          // Buscar en el array el objeto que contenga el QR
          for (const item of response) {
            if (item && item.data && item.data.base64) {
              qrCode = item.data.base64;
              console.log('QR encontrado en array:', qrCode.substring(0, 50) + '...');
              break;
            }
            
            // También verificar si el base64 está directamente en el item
            if (item && typeof item === 'string' && item.startsWith('data:image/')) {
              qrCode = item;
              console.log('QR encontrado como string directa en array');
              break;
            }
          }
        } else if (response && typeof response === 'object') {
          console.log('Respuesta es un objeto, buscando QR...');
          
          // Verificar si tiene data.base64
          if (response.data && response.data.base64) {
            qrCode = response.data.base64;
            console.log('QR encontrado en response.data.base64');
          }
          // Verificar si el base64 está directamente en el objeto
          else if (response.base64) {
            qrCode = response.base64;
            console.log('QR encontrado en response.base64');
          }
          // Verificar si toda la respuesta es el base64
          else if (typeof response === 'string' && response.startsWith('data:image/')) {
            qrCode = response;
            console.log('QR encontrado como string directa');
          }
        }

        if (qrCode && qrCode.startsWith('data:image/')) {
          console.log('✅ QR Code procesado exitosamente, longitud:', qrCode.length);

          // Guardar inmediatamente en el estado local
          setQrCodes(prev => {
            const updated = { ...prev, [connectionId]: qrCode };
            console.log('✅ Estado QR actualizado para conexión:', connectionId);
            return updated;
          });

          // Actualizar la base de datos
          const { error: updateError } = await supabase
            .from('whatsapp_connections')
            .update({ qr_code: qrCode })
            .eq('id', connectionId);

          if (updateError) {
            console.error('Error al actualizar QR en base de datos:', updateError);
          } else {
            console.log('✅ QR guardado en base de datos exitosamente para conexión:', connectionId);
          }

          // Forzar actualización del query client
          queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });

          return qrCode;
        } else {
          console.warn('❌ No se encontró código QR válido en la respuesta del webhook');
          console.log('Tipo de respuesta:', typeof response);
          console.log('Es array:', Array.isArray(response));
          console.log('Contenido:', response);
          
          // Si es solo un mensaje de éxito, el QR podría estar generándose aún
          if (response && response.message === 'Request processed successfully') {
            throw new Error('El código QR se está generando. Por favor intenta nuevamente en unos segundos.');
          }
          
          throw new Error('No se recibió código QR del webhook. Verifica la configuración.');
        }
        
      } catch (error) {
        console.error('❌ Error al obtener QR:', error);
        throw error;
      } finally {
        // Quitar el estado de carga
        setQrLoading(prev => ({ ...prev, [connectionId]: false }));
      }
    },
    onSuccess: (data, connectionId) => {
      if (data) {
        console.log('✅ QR obtenido exitosamente para conexión:', connectionId);
        
        toast({
          title: "Código QR obtenido",
          description: "Escanea el código QR con tu WhatsApp para conectar.",
        });
      }
    },
    onError: (error, connectionId) => {
      console.error('❌ Error en getQRCode mutation:', error);
      setQrLoading(prev => ({ ...prev, [connectionId]: false }));
      
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      
      // Check if it's a circuit breaker error
      if (errorMessage.includes('Circuit breaker is open')) {
        toast({
          title: "Demasiados intentos fallidos",
          description: "Por favor espera 30 segundos antes de intentar nuevamente.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('se está generando')) {
        toast({
          title: "QR en proceso",
          description: errorMessage,
          variant: "default",
        });
      } else {
        toast({
          title: "Error al obtener QR",
          description: `No se pudo obtener el código QR: ${errorMessage}`,
          variant: "destructive",
        });
      }
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
    const qr = qrCodes[connectionId];
    console.log('🔍 Obteniendo QR del estado para conexión:', connectionId, qr ? `QR disponible (${qr.length} chars)` : 'QR no disponible');
    return qr || null;
  };

  // Función para verificar si está cargando el QR
  const isQRLoading = (connectionId: string) => {
    const loading = qrLoading[connectionId] || false;
    console.log('⏳ Estado de carga QR para conexión:', connectionId, loading ? 'Cargando' : 'No cargando');
    return loading;
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
