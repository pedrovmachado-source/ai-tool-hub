-- 1. Limpeza de políticas antigas para evitar conflitos ou sobreposições
DROP POLICY IF EXISTS "Max and admins can read lesson pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Max, Elite Plus and Elite Vitalício can read lesson pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload lesson pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update lesson pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete lesson pdfs" ON storage.objects;

-- 2. Política de LEITURA (SELECT)
-- Permite leitura apenas para:
-- - Administradores (app_role = 'admin')
-- - Usuários autenticados que possuam um perfil com plano 'Max', 'Elite Plus' ou 'Elite Vitalício'
CREATE POLICY "Authorized plans and admins can read lesson pdfs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'lesson-pdfs' 
  AND (
    -- Verificação de Administrador
    private.has_role(auth.uid(), 'admin'::app_role) 
    OR 
    -- Verificação de Plano Autorizado
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE (profiles.user_id = auth.uid() OR profiles.id = auth.uid())
      AND profiles.plano IN ('Max', 'Elite Plus', 'Elite Vitalício')
    )
  )
);

-- 3. Políticas de GERENCIAMENTO (INSERT, UPDATE, DELETE)
-- Restringe modificações apenas para administradores no bucket de PDFs

CREATE POLICY "Admins can insert lesson pdfs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'lesson-pdfs' 
  AND private.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can update lesson pdfs"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'lesson-pdfs' 
  AND private.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can delete lesson pdfs"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'lesson-pdfs' 
  AND private.has_role(auth.uid(), 'admin'::app_role)
);