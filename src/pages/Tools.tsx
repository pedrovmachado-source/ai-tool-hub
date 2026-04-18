import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Index from './Index';

/**
 * /ferramentas — wrapper que reusa o componente Index existente.
 * Mantém todo o fluxo atual: catálogo, busca, prompts, modal de e-book,
 * Pro e Admin. Apenas garante navegação por rotas.
 */
export default function Tools() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Se vier ?cat= ou ?tool=, repassamos via storage simples para o Index pegar.
  useEffect(() => {
    const cat = params.get('cat');
    if (cat) sessionStorage.setItem('adai:initialCategory', cat);
    document.title = 'Ferramentas — AdAI';
  }, [params]);

  // O Index já controla seu próprio estado interno. Aqui só o renderizamos.
  return <Index />;
}
