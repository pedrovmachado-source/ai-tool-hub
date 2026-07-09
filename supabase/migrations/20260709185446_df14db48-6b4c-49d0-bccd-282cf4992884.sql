
CREATE TABLE public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  endpoint text NOT NULL,
  window_start timestamptz NOT NULL DEFAULT date_trunc('minute', now()),
  count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(key, endpoint, window_start)
);

GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies: only service_role (bypasses RLS) may access. Blocks anon/authenticated by default.

CREATE INDEX idx_rate_limits_window ON public.rate_limits(window_start);

CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key text,
  p_endpoint text,
  p_max integer DEFAULT 30
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window timestamptz := date_trunc('minute', now());
  v_count integer;
BEGIN
  -- Cleanup old windows opportunistically (>10 min old)
  DELETE FROM public.rate_limits WHERE window_start < now() - interval '10 minutes';

  INSERT INTO public.rate_limits (key, endpoint, window_start, count)
  VALUES (p_key, p_endpoint, v_window, 1)
  ON CONFLICT (key, endpoint, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  IF v_count > p_max THEN
    RETURN jsonb_build_object('allowed', false, 'count', v_count, 'max', p_max);
  END IF;

  RETURN jsonb_build_object('allowed', true, 'count', v_count, 'max', p_max);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(text, text, integer) TO service_role;
