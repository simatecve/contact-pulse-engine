
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

  // Fetch notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user
  });

  // Fetch notification preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as NotificationPreferences;
    },
    enabled: !!user
  });

  // Fetch notification sounds
  const { data: sounds = [] } = useQuery({
    queryKey: ['notification-sounds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notification_sounds')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as NotificationSound[];
    }
  });

  // Update unread count
  useEffect(() => {
    if (notifications) {
      const count = notifications.filter(n => !n.is_read).length;
      setUnreadCount(count);
    }
  }, [notifications]);

  // Real-time subscription for new notifications
  useEffect(() => {
    if (!user) return;

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
            const notification = payload.new as Notification;
            new Notification(notification.title, {
              body: notification.message,
              icon: '/favicon.ico'
            });
          }
          
          // Play sound if enabled
          if (preferences?.sound_enabled) {
            playNotificationSound(preferences.sound_type);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    }
  });

  // Play notification sound
  const playNotificationSound = (soundType: string) => {
    const sound = sounds.find(s => s.name.toLowerCase() === soundType.toLowerCase()) || 
                 sounds.find(s => s.is_default);
    
    if (sound) {
      const audio = new Audio(sound.file_path);
      audio.play().catch(console.error);
    }
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  };

  return {
    notifications,
    preferences,
    sounds,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    updatePreferences,
    playNotificationSound,
    requestNotificationPermission
  };
};
