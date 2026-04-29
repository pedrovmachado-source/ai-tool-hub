
-- Activity log table for admin actions
CREATE TABLE public.activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id UUID NOT NULL,
  actor_email TEXT NOT NULL DEFAULT '',
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  entity_label TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_activity_logs_created_at ON public.activity_logs (created_at DESC);
CREATE INDEX idx_activity_logs_entity ON public.activity_logs (entity_type, entity_id);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can read logs
CREATE POLICY "Admins can read activity logs"
ON public.activity_logs FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can insert their own log entries (so admins logging their own actions works)
-- The actor_id is forced to auth.uid() via the with check
CREATE POLICY "Authenticated can insert own log"
ON public.activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = actor_id);

-- No updates / deletes: logs are append-only (no policies = denied by default with RLS on)
