
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

  const createConnection = useMutation({
    mutationFn: async (connectionData: ConnectionFormData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      // Llamar al webhook para crear la instancia
      const response = await fetch('https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/crear-instancia', {
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
      const response = await fetch('https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: connectionId
        }),
      });

      if (!response.ok) {
        throw new Error('Error al obtener el código QR');
      }

      const result = await response.json();
      
      // Actualizar la conexión con el código QR
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ qr_code: result.qr_code })
        .eq('id', connectionId);

      if (error) throw error;
      
      return result.qr_code;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo obtener el código QR.",
        variant: "destructive",
      });
    }
  });

  const markAsConnected = useMutation({
    mutationFn: async (connectionId: string) => {
      const { error } = await supabase
        .from('whatsapp_connections')
        .update({ status: 'connected', qr_code: null })
        .eq('id', connectionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsapp-connections'] });
      toast({
        title: "WhatsApp conectado",
        description: "Tu WhatsApp se conectó exitosamente.",
      });
    }
  });

  return {
    connections,
    isLoading,
    createConnection,
    getQRCode,
    markAsConnected
  };
};
