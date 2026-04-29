-- Modules table
CREATE TABLE public.modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  cover_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro users and admins can view modules"
  ON public.modules FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
  ));

CREATE POLICY "Admins can insert modules"
  ON public.modules FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update modules"
  ON public.modules FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete modules"
  ON public.modules FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Lessons table
CREATE TABLE public.lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  kind TEXT NOT NULL DEFAULT 'video', -- 'video' | 'transcript' | 'both'
  video_url TEXT,
  pdf_path TEXT, -- path inside lesson-pdfs bucket
  duration_min INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pro users and admins can view lessons"
  ON public.lessons FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
    SELECT 1 FROM profiles WHERE profiles.user_id = auth.uid() AND profiles.plano = 'Pro'
  ));

CREATE POLICY "Admins can insert lessons"
  ON public.lessons FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lessons"
  ON public.lessons FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lessons"
  ON public.lessons FOR DELETE TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER trg_modules_updated BEFORE UPDATE ON public.modules
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_lessons_updated BEFORE UPDATE ON public.lessons
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE INDEX idx_lessons_module ON public.lessons(module_id, sort_order);

-- Private bucket for transcript PDFs
INSERT INTO storage.buckets (id, name, public) VALUES ('lesson-pdfs', 'lesson-pdfs', false);

-- Storage policies: Pro+Admin can read; Admin can write
CREATE POLICY "Pro and admins can read lesson pdfs"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'lesson-pdfs' AND (
      has_role(auth.uid(), 'admin'::app_role) OR EXISTS (
        SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND plano = 'Pro'
      )
    )
  );

CREATE POLICY "Admins can upload lesson pdfs"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'lesson-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update lesson pdfs"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'lesson-pdfs' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete lesson pdfs"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'lesson-pdfs' AND has_role(auth.uid(), 'admin'::app_role));