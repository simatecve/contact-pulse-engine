
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { NotificationPreferences, Notification } from '@/types/notifications';
import { playNotificationSound } from '@/utils/notificationUtils';

export const useNotificationRealtime = (preferences: NotificationPreferences | null, sounds: any[]) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
                new window.Notification(notification.title, {
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
                playNotificationSound(preferences.sound_type, sounds);
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
  }, [user, preferences, queryClient, sounds]);
};
