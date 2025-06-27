
-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  message TEXT NOT NULL,
  contact_list_id UUID REFERENCES contact_lists(id) NOT NULL,
  max_delay_seconds INTEGER DEFAULT 0,
  ai_enabled BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign_attachments table for file attachments
CREATE TABLE public.campaign_attachments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campaign_messages table to track sent messages
CREATE TABLE public.campaign_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE NOT NULL,
  contact_id UUID REFERENCES contacts(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for campaigns
CREATE POLICY "Users can view their own campaigns" 
  ON public.campaigns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
  ON public.campaigns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
  ON public.campaigns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
  ON public.campaigns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS policies for campaign_attachments
CREATE POLICY "Users can view attachments of their campaigns" 
  ON public.campaign_attachments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_attachments.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create attachments for their campaigns" 
  ON public.campaign_attachments 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_attachments.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete attachments of their campaigns" 
  ON public.campaign_attachments 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_attachments.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- RLS policies for campaign_messages
CREATE POLICY "Users can view messages of their campaigns" 
  ON public.campaign_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages for their campaigns" 
  ON public.campaign_messages 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages of their campaigns" 
  ON public.campaign_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM campaigns 
      WHERE campaigns.id = campaign_messages.campaign_id 
      AND campaigns.user_id = auth.uid()
    )
  );

-- Create storage bucket for campaign attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-attachments', 'campaign-attachments', false);

-- Storage policy for campaign attachments
CREATE POLICY "Users can upload campaign attachments" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their campaign attachments" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their campaign attachments" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'campaign-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
