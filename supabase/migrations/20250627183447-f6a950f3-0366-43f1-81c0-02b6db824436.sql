
-- Enable RLS on existing leads table
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for leads
CREATE POLICY "Users can view their own leads" 
  ON public.leads 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own leads" 
  ON public.leads 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own leads" 
  ON public.leads 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own leads" 
  ON public.leads 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on existing lead_tags table
ALTER TABLE public.lead_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_tags
CREATE POLICY "Users can view their own lead tags" 
  ON public.lead_tags 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead tags" 
  ON public.lead_tags 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead tags" 
  ON public.lead_tags 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead tags" 
  ON public.lead_tags 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enable RLS on existing lead_tag_assignments table
ALTER TABLE public.lead_tag_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_tag_assignments
CREATE POLICY "Users can view their own lead tag assignments" 
  ON public.lead_tag_assignments 
  FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_tag_assignments.lead_id AND leads.user_id = auth.uid()));

CREATE POLICY "Users can create their own lead tag assignments" 
  ON public.lead_tag_assignments 
  FOR INSERT 
  WITH CHECK (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_tag_assignments.lead_id AND leads.user_id = auth.uid()));

CREATE POLICY "Users can update their own lead tag assignments" 
  ON public.lead_tag_assignments 
  FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_tag_assignments.lead_id AND leads.user_id = auth.uid()));

CREATE POLICY "Users can delete their own lead tag assignments" 
  ON public.lead_tag_assignments 
  FOR DELETE 
  USING (EXISTS (SELECT 1 FROM public.leads WHERE leads.id = lead_tag_assignments.lead_id AND leads.user_id = auth.uid()));

-- Create table for kanban columns
CREATE TABLE public.lead_columns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#3B82F6',
  position INTEGER NOT NULL DEFAULT 0,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on lead_columns
ALTER TABLE public.lead_columns ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for lead_columns
CREATE POLICY "Users can view their own lead columns" 
  ON public.lead_columns 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lead columns" 
  ON public.lead_columns 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lead columns" 
  ON public.lead_columns 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lead columns" 
  ON public.lead_columns 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Add column_id to leads table to reference the kanban column
ALTER TABLE public.leads ADD COLUMN column_id UUID REFERENCES public.lead_columns(id);

-- Create default "Nuevos" column for existing users (this will be handled in the app)
-- Update leads table to use column_id instead of status for kanban positioning
