-- Permite que usuários autenticados (admins) excluam registros da tabela site_orders
CREATE POLICY "Admins can delete site_orders" ON public.site_orders FOR DELETE TO authenticated USING (true);
