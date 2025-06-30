
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
