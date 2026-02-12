
-- Create generation history table (public, no auth required for this app)
CREATE TABLE public.generation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_data TEXT NOT NULL,
  prompt TEXT NOT NULL,
  characters JSONB NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generation_history ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read/insert/delete (no auth in this app)
CREATE POLICY "Anyone can view generation history"
  ON public.generation_history FOR SELECT USING (true);

CREATE POLICY "Anyone can insert generation history"
  ON public.generation_history FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete generation history"
  ON public.generation_history FOR DELETE USING (true);
