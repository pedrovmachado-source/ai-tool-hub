import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useIsMobile } from '@/hooks/use-mobile';

interface BannerData {
  enabled?: boolean;
  desktop_url?: string;
  mobile_url?: string;
  link?: string;
  alt?: string;
}

export default function DashboardBanner() {
  const [banner, setBanner] = useState<BannerData | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'dashboard_banner')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) setBanner(data.value as BannerData);
      });
  }, []);

  if (!banner?.enabled) return null;
  const src = isMobile ? (banner.mobile_url || banner.desktop_url) : (banner.desktop_url || banner.mobile_url);
  if (!src) return null;

  const img = (
    <img
      src={src}
      alt={banner.alt || 'Banner de atualizações'}
      className="w-full h-auto object-cover block"
      loading="eager"
    />
  );

  return (
    <div className="mb-12">
      <div className="rounded-[2rem] overflow-hidden border border-white/5 glass-smooth">
        {banner.link ? (
          <a href={banner.link} target="_blank" rel="noopener noreferrer" className="block">
            {img}
          </a>
        ) : img}
      </div>
      {banner.alt && (
        <p className="mt-4 text-center text-sm font-light text-white/40 leading-relaxed max-w-3xl mx-auto">
          {banner.alt}
        </p>
      )}
    </div>
  );
}
