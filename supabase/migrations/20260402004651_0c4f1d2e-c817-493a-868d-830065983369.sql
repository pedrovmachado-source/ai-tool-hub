
-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  accent TEXT NOT NULL DEFAULT '#378ADD',
  accent_light TEXT NOT NULL DEFAULT '#E6F1FB',
  accent_dark TEXT NOT NULL DEFAULT '#185FA5',
  intro_title TEXT NOT NULL DEFAULT '',
  intro_text TEXT NOT NULL DEFAULT '',
  when_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  stats JSONB NOT NULL DEFAULT '[]'::jsonb,
  prompts_extra JSONB DEFAULT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tools table
CREATE TABLE public.tools (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_key TEXT NOT NULL REFERENCES public.categories(key) ON DELETE CASCADE,
  key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  url TEXT NOT NULL DEFAULT '',
  url_label TEXT NOT NULL DEFAULT 'Acessar',
  badge TEXT NOT NULL DEFAULT 'Grátis',
  description TEXT NOT NULL DEFAULT '',
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tools ENABLE ROW LEVEL SECURITY;

-- Categories: public read, admin write (for now everyone can read)
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Anyone can view tools" ON public.tools FOR SELECT USING (true);

-- Admin write policies (using authenticated for now, will refine with admin roles)
CREATE POLICY "Authenticated users can insert categories" ON public.categories FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update categories" ON public.categories FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete categories" ON public.categories FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert tools" ON public.tools FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update tools" ON public.tools FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete tools" ON public.tools FOR DELETE TO authenticated USING (true);

-- Admin policy for profiles: allow admins to read all profiles
-- For now, allow all authenticated users to read all profiles (admin panel needs this)
CREATE POLICY "Authenticated users can read all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
