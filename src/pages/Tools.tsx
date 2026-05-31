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

  useEffect(() => {
    // Meta tags are handled by the component in the return
  }, []);

  const initialPage = propPage || params.get('page');
  const initialCategory = params.get('cat');

  return (
    <>
      <Meta title="Ferramentas de IA | Convert Club" description="O maior guia de Inteligência Artificial para empreendedores. Encontre as melhores IAs para seu negócio." />
      <Index initialPage={initialPage} initialCategory={initialCategory} />
    </>
  );
}
