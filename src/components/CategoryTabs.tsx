import { useRef, useEffect, useCallback, useState } from 'react';
import { CATEGORIES, type Category } from '@/data/tools-data';

interface CategoryTabsProps {
  activeCategory: string;
  onSelect: (key: string) => void;
  categories?: Category[];
}

export default function CategoryTabs({ activeCategory, onSelect, categories: cats }: CategoryTabsProps) {
  const categories = cats || CATEGORIES;
  const tabsRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState({ width: '100%', left: '0%' });

  const updateThumb = useCallback(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    const ratio = tabs.clientWidth / tabs.scrollWidth;
    const thumbW = Math.max(ratio * 100, 8);
    const scrollRatio = tabs.scrollWidth > tabs.clientWidth
      ? tabs.scrollLeft / (tabs.scrollWidth - tabs.clientWidth)
      : 0;
    const maxLeft = 100 - thumbW;
    setThumbStyle({ width: thumbW + '%', left: (scrollRatio * maxLeft) + '%' });
  }, []);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;
    updateThumb();
    tabs.addEventListener('scroll', updateThumb);
    window.addEventListener('resize', updateThumb);
    return () => {
      tabs.removeEventListener('scroll', updateThumb);
      window.removeEventListener('resize', updateThumb);
    };
  }, [updateThumb]);

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === thumbRef.current) return;
    const bar = barRef.current;
    const tabs = tabsRef.current;
    if (!bar || !tabs) return;
    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = clickX / rect.width;
    tabs.scrollLeft = ratio * (tabs.scrollWidth - tabs.clientWidth);
  };

  // Drag support
  const handleThumbMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const tabs = tabsRef.current;
    const bar = barRef.current;
    if (!tabs || !bar) return;
    const startX = e.clientX;
    const startScroll = tabs.scrollLeft;

    const onMouseMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const barW = bar.clientWidth;
      const ratio = (tabs.scrollWidth - tabs.clientWidth) / barW;
      tabs.scrollLeft = startScroll + dx * ratio;
    };
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="bg-black/60 backdrop-blur-xl border-b border-white/5 sticky top-[64px] sm:top-[72px] z-[90]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-hide" ref={tabsRef}>
        <div className="flex gap-2 py-3">
          {categories.map(cat => (
            <button
              key={cat.key}
              onClick={() => onSelect(cat.key)}
              aria-label={`Ver categoria ${cat.label}`}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap border transition-all duration-500 ${
                activeCategory === cat.key
                  ? 'bg-white text-black border-white'
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'
              }`}
            >
              <span className={`w-[5px] h-[5px] rounded-full ${activeCategory === cat.key ? 'bg-black' : 'bg-white/30'}`} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>

  );
}
