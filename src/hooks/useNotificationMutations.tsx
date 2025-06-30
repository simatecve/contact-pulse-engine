
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { NotificationPreferences } from '@/types/notifications';

export const useNotificationMutations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      console.error('Error marking notification as read:', error);
    }
  });

  // Mark all as read
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast({
        title: "Notificaciones marcadas como leídas",
        description: "Todas las notificaciones han sido marcadas como leídas.",
      });
    },
    onError: (error) => {
      console.error('Error marking all as read:', error);
      toast({
        title: "Error",
        description: "No se pudieron marcar las notificaciones como leídas.",
        variant: "destructive",
      });
    }
  });

  // Update preferences
  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: user.id,
          ...newPreferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferencias actualizadas",
        description: "Tus preferencias de notificación han sido guardadas.",
      });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "No se pudieron actualizar las preferencias.",
        variant: "destructive",
      });
    }
  });

  return {
    markAsRead,
    markAllAsRead,
    updatePreferences
  };
};
