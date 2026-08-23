-- device_logs
DROP POLICY IF EXISTS "Users can insert their own device logs" ON public.device_logs;
CREATE POLICY "Users can insert their own device logs" ON public.device_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own device logs" ON public.device_logs;
CREATE POLICY "Users can view their own device logs" ON public.device_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- invite_codes
DROP POLICY IF EXISTS "Users can view their own codes" ON public.invite_codes;
CREATE POLICY "Users can view their own codes" ON public.invite_codes FOR SELECT TO authenticated USING ((auth.uid() = owner_id) OR (auth.uid() = used_by));

-- purchased_accounts
DROP POLICY IF EXISTS "Users can view their own purchased accounts" ON public.purchased_accounts;
CREATE POLICY "Users can view their own purchased accounts" ON public.purchased_accounts FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- purchases
DROP POLICY IF EXISTS "Users can view their own purchases" ON public.purchases;
CREATE POLICY "Users can view their own purchases" ON public.purchases FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- transactions
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions" ON public.transactions FOR SELECT TO authenticated USING (user_id IN (SELECT p.id FROM public.profiles p WHERE p.user_id = auth.uid()));

-- saved_ebooks
DROP POLICY IF EXISTS "Users can save ebooks" ON public.saved_ebooks;
CREATE POLICY "Users can save ebooks" ON public.saved_ebooks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can unsave ebooks" ON public.saved_ebooks;
CREATE POLICY "Users can unsave ebooks" ON public.saved_ebooks FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view own saved ebooks" ON public.saved_ebooks;
CREATE POLICY "Users can view own saved ebooks" ON public.saved_ebooks FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- revoke anon/public execute on security definer trigger function
REVOKE ALL ON FUNCTION public.sync_plano_from_subscription() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.sync_plano_from_subscription() FROM anon;
REVOKE ALL ON FUNCTION public.sync_plano_from_subscription() FROM authenticated;