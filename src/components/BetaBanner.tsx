import { useLocation } from 'react-router-dom';

export default function BetaBanner() {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  if (isHomePage) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[1000] bg-brand-red text-white text-[9px] sm:text-[10px] font-bold py-1.5 text-center uppercase tracking-[0.2em] border-b border-white/10 shadow-lg">
      Versão Beta 0.1v - Este site pode conter bugs
    </div>
  );
}
