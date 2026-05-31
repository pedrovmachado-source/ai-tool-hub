import { useLocation } from 'react-router-dom';

export default function BetaBanner() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-brand-red text-white text-[9px] sm:text-[10px] font-bold py-1.5 text-center uppercase tracking-[0.2em] border-b border-white/10 shadow-lg flex items-center justify-center gap-3 px-4">
      <span>Versão Beta 0.1v - Este site pode conter bugs</span>
      <a 
        href="https://wa.me/5521965248844?text=encontrei%20um%20bug" 
        target="_blank" 
        rel="noopener noreferrer"
        className="bg-white text-brand-red px-2 py-0.5 rounded hover:bg-white/90 transition-colors"
      >
        Reportar Bug
      </a>
    </div>
  );
}
