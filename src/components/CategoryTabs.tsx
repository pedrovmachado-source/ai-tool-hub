import { CATEGORIES } from '@/data/tools-data';

interface CategoryTabsProps {
  activeCategory: string;
  onSelect: (key: string) => void;
}

export default function CategoryTabs({ activeCategory, onSelect }: CategoryTabsProps) {
  return (
    <div className="bg-card border-b border-border sticky top-[72px] z-[90]">
      <div className="max-w-[1100px] mx-auto px-6 overflow-x-auto">
        <div className="flex gap-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              onClick={() => onSelect(cat.key)}
              className={`flex items-center gap-2 px-4 py-3.5 text-[13.5px] whitespace-nowrap border-b-2 transition-colors ${
                activeCategory === cat.key
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              }`}
              style={{ borderBottomColor: activeCategory === cat.key ? cat.accent : 'transparent' }}
            >
              <span className="w-[7px] h-[7px] rounded-full" style={{ background: cat.accent }} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
