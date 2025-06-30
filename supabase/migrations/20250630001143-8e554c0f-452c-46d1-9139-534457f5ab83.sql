
-- Tabla para notificaciones del sistema
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info', -- info, success, warning, error
  category TEXT NOT NULL DEFAULT 'general', -- general, message, campaign, system
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para preferencias de notificaciones
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  push_notifications BOOLEAN NOT NULL DEFAULT true,
  sound_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_type TEXT NOT NULL DEFAULT 'default',
  notification_categories JSONB NOT NULL DEFAULT '{"general": true, "message": true, "campaign": true, "system": true}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabla para sonidos personalizables
CREATE TABLE public.notification_sounds (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para programación de campañas
CREATE TABLE public.campaign_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, sent, cancelled, failed
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para segmentación avanzada
CREATE TABLE public.campaign_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL, -- filtros como location, behavior, tags, etc.
  contact_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para A/B Testing
CREATE TABLE public.campaign_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- draft, running, completed, paused
  test_percentage INTEGER NOT NULL DEFAULT 50, -- porcentaje para variante A
  winner_variant TEXT, -- 'A' o 'B'
  confidence_level NUMERIC(5,2),
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para variantes de campañas (A/B Testing)
CREATE TABLE public.campaign_variants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ab_test_id UUID NOT NULL REFERENCES campaign_ab_tests(id) ON DELETE CASCADE,
  variant_name TEXT NOT NULL, -- 'A' o 'B'
  message TEXT NOT NULL,
  subject_line TEXT,
  attachments JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabla para analytics detallado
CREATE TABLE public.campaign_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id),
  event_type TEXT NOT NULL, -- sent, delivered, opened, clicked, replied, converted
  event_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB, -- datos adicionales como device, location, etc.
  variant_id UUID REFERENCES campaign_variants(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX idx_notifications_user_id_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_campaign_schedules_scheduled_at ON campaign_schedules(scheduled_at) WHERE status = 'scheduled';
CREATE INDEX idx_campaign_analytics_campaign_event ON campaign_analytics(campaign_id, event_type);
CREATE INDEX idx_campaign_analytics_timestamp ON campaign_analytics(event_timestamp DESC);

-- RLS Policies para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies para notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their notification preferences" ON notification_preferences FOR ALL USING (auth.uid() = user_id);

-- RLS Policies para notification_sounds (público para lectura)
ALTER TABLE public.notification_sounds ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view notification sounds" ON notification_sounds FOR SELECT USING (true);

-- RLS Policies para campaign_schedules
ALTER TABLE public.campaign_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage schedules for their campaigns" ON campaign_schedules FOR ALL USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_schedules.campaign_id AND campaigns.user_id = auth.uid())
);

-- RLS Policies para campaign_segments
ALTER TABLE public.campaign_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage segments for their campaigns" ON campaign_segments FOR ALL USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_segments.campaign_id AND campaigns.user_id = auth.uid())
);

-- RLS Policies para campaign_ab_tests
ALTER TABLE public.campaign_ab_tests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage AB tests for their campaigns" ON campaign_ab_tests FOR ALL USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_ab_tests.campaign_id AND campaigns.user_id = auth.uid())
);

-- RLS Policies para campaign_variants
ALTER TABLE public.campaign_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage variants for their AB tests" ON campaign_variants FOR ALL USING (
  EXISTS (
    SELECT 1 FROM campaign_ab_tests 
    JOIN campaigns ON campaigns.id = campaign_ab_tests.campaign_id 
    WHERE campaign_ab_tests.id = campaign_variants.ab_test_id AND campaigns.user_id = auth.uid()
  )
);

-- RLS Policies para campaign_analytics
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view analytics for their campaigns" ON campaign_analytics FOR SELECT USING (
  EXISTS (SELECT 1 FROM campaigns WHERE campaigns.id = campaign_analytics.campaign_id AND campaigns.user_id = auth.uid())
);
CREATE POLICY "System can insert analytics" ON campaign_analytics FOR INSERT WITH CHECK (true);

-- Insertar sonidos por defecto
INSERT INTO public.notification_sounds (name, file_path, description, is_default) VALUES
('Default', '/sounds/notification-default.mp3', 'Sonido de notificación por defecto', true),
('Message', '/sounds/notification-message.mp3', 'Sonido para nuevos mensajes', false),
('Campaign', '/sounds/notification-campaign.mp3', 'Sonido para eventos de campañas', false),
('Success', '/sounds/notification-success.mp3', 'Sonido para eventos exitosos', false),
('Alert', '/sounds/notification-alert.mp3', 'Sonido para alertas importantes', false);

-- Función para crear preferencias por defecto
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear preferencias automáticamente
CREATE TRIGGER on_auth_user_created_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE create_default_notification_preferences();
