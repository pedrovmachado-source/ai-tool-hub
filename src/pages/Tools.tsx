import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Index from './Index';

/**
 * /ferramentas — wrapper que reusa o componente Index existente.
 * Mantém todo o fluxo atual: catálogo, busca, prompts, modal de e-book,
 * Pro e Admin. Apenas garante navegação por rotas.
 */
export default function Tools({ page: propPage }: { page?: string }) {
  const [params] = useSearchParams();

  useEffect(() => {
    document.title = 'Ferramentas de IA | Convert Club';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', 'O maior guia de Inteligência Artificial para empreendedores. Encontre as melhores IAs para seu negócio.');
    }
  }, []);

  const initialPage = propPage || params.get('page');
  const initialCategory = params.get('cat');

  return <Index initialPage={initialPage} initialCategory={initialCategory} />;
}
