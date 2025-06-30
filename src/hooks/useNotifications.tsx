
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  category: 'general' | 'message' | 'campaign' | 'system';
  is_read: boolean;
  action_url?: string;
  metadata?: any;
  created_at: string;
  read_at?: string;
}

export interface NotificationPreferences {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  sound_enabled: boolean;
  sound_type: string;
  notification_categories: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export interface NotificationSound {
  id: string;
  name: string;
  file_path: string;
  description?: string;
  is_default: boolean;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications with error handling
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return [];
        }
        
        return data as Notification[];
      } catch (err) {
        console.error('Unexpected error fetching notifications:', err);
        return [];
      }
    },
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch notification preferences with error handling
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching preferences:', error);
          return null;
        }
        
        return data as NotificationPreferences;
      } catch (err) {
        console.error('Unexpected error fetching preferences:', err);
        return null;
      }
    },
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch notification sounds with error handling
  const { data: sounds = [] } = useQuery({
    queryKey: ['notification-sounds'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('notification_sounds')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching sounds:', error);
          return [];
        }
        
        return data as NotificationSound[];
      } catch (err) {
        console.error('Unexpected error fetching sounds:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Update unread count
  useEffect(() => {
    if (notifications && Array.isArray(notifications)) {
      try {
        const count = notifications.filter(n => !n.is_read).length;
        setUnreadCount(count);
      } catch (err) {
        console.error('Error calculating unread count:', err);
        setUnreadCount(0);
      }
    }
  }, [notifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

    try {
      const channel = supabase
        .channel('notifications-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            console.log('New notification:', payload);
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            
            // Show browser notification if enabled
            if (preferences?.push_notifications && 'Notification' in window) {
              try {
                const notification = payload.new as Notification;
                new Notification(notification.title, {
                  body: notification.message,
                  icon: '/favicon.ico'
                });
              } catch (err) {
                console.error('Error showing browser notification:', err);
              }
            }
            
            // Play sound if enabled
            if (preferences?.sound_enabled) {
              try {
                playNotificationSound(preferences.sound_type);
              } catch (err) {
                console.error('Error playing notification sound:', err);
              }
            }
          }
        )
        .subscribe();

      return () => {
        try {
          supabase.removeChannel(channel);
        } catch (err) {
          console.error('Error removing channel:', err);
        }
      };
    } catch (err) {
      console.error('Error setting up real-time subscription:', err);
    }
  }, [user, preferences, queryClient]);

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

  // Play notification sound
  const playNotificationSound = (soundType: string) => {
    try {
      const sound = sounds.find(s => s.name?.toLowerCase() === soundType?.toLowerCase()) || 
                   sounds.find(s => s.is_default);
      
      if (sound && sound.file_path) {
        const audio = new Audio(sound.file_path);
        audio.play().catch(err => console.error('Error playing sound:', err));
      }
    } catch (err) {
      console.error('Error in playNotificationSound:', err);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    try {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      return false;
    }
  };

  return {
    notifications: notifications || [],
    preferences: preferences || null,
    sounds: sounds || [],
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    playNotificationSound,
    requestNotificationPermission
  };
};
