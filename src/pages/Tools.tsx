import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Index from './Index';

/**
 * /ferramentas — wrapper que reusa o componente Index existente.
 * Mantém todo o fluxo atual: catálogo, busca, prompts, modal de e-book,
 * Pro e Admin. Apenas garante navegação por rotas.
 */
export default function Tools() {
  const [params] = useSearchParams();

  const initialPage = params.get('page');
  const initialCategory = params.get('cat');

  return <Index initialPage={initialPage} initialCategory={initialCategory} />;
}
