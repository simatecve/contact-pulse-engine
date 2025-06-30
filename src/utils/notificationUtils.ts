
import { NotificationSound } from '@/types/notifications';

// Play notification sound
export const playNotificationSound = (soundType: string, sounds: NotificationSound[]) => {
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
export const requestNotificationPermission = async (): Promise<boolean> => {
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
