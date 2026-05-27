-- Deletar duplicatas mantendo apenas a mais recente (baseado no created_at se existir, senão id)
DELETE FROM public.validated_offers a
USING public.validated_offers b
WHERE a.id < b.id
AND a.link = b.link;

-- Adicionar restrição de unicidade no link
ALTER TABLE public.validated_offers ADD CONSTRAINT unique_offer_link UNIQUE (link);
