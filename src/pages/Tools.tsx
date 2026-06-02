import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Meta from '@/components/Meta';
import Index from './Index';

/**
 * /ferramentas — wrapper que reusa o componente Index existente.
 * Mantém todo o fluxo atual: catálogo, busca, prompts, modal de e-book,
 * Pro e Admin. Apenas garante navegação por rotas.
 */
export default function Tools({ page: propPage }: { page?: string }) {
  const [params] = useSearchParams();

  const initialPage = propPage || params.get('page');
  const initialCategory = params.get('cat');

  // Pre-warming the Index component by rendering it directly
  return (
    <>
      <Meta title="Ferramentas de IA | Convert Club" description="O maior guia de Inteligência Artificial para empreendedores. Encontre as melhores IAs para seu negócio." />
      <Index initialPage={initialPage} initialCategory={initialCategory} />
    </>
  );
}
