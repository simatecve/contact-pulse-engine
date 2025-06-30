
import { useState, useEffect } from 'react';
import { useNotificationQueries } from './useNotificationQueries';
import { useNotificationMutations } from './useNotificationMutations';
import { useNotificationRealtime } from './useNotificationRealtime';
import { playNotificationSound, requestNotificationPermission } from '@/utils/notificationUtils';

export const useNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  const {
    notifications,
    preferences,
    sounds,
    isLoading,
    error
  } = useNotificationQueries();

  const {
    markAsRead,
    markAllAsRead,
    updatePreferences
  } = useNotificationMutations();

  // Set up real-time subscription
  useNotificationRealtime(preferences, sounds);

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

  // Wrapper function for playing notification sound
  const playSound = (soundType: string) => {
    playNotificationSound(soundType, sounds);
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
    playNotificationSound: playSound,
    requestNotificationPermission
  };
};

// Re-export types for backward compatibility
export type {
  Notification,
  NotificationPreferences,
  NotificationSound
} from '@/types/notifications';
