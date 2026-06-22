
-- 1 & 3: site_orders DELETE must be admin-only
DROP POLICY IF EXISTS "Admins can delete site_orders" ON public.site_orders;
CREATE POLICY "Admins can delete site_orders"
ON public.site_orders FOR DELETE
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 4: student_areas SELECT - compare directly to auth.uid()
DROP POLICY IF EXISTS "Users can view their own student area" ON public.student_areas;
CREATE POLICY "Users can view their own student area"
ON public.student_areas FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 5: user_offers admin SELECT - use private.has_role
DROP POLICY IF EXISTS "Admins can view all offers" ON public.user_offers;
CREATE POLICY "Admins can view all offers"
ON public.user_offers FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));

-- 2: purchased_accounts - add explicit admin SELECT policy
CREATE POLICY "Admins can view all purchased accounts"
ON public.purchased_accounts FOR SELECT
TO authenticated
USING (private.has_role(auth.uid(), 'admin'::public.app_role));
