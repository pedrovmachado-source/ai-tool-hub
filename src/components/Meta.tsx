import { useEffect } from 'react';

interface MetaProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const Meta = ({ 
  title = "Convert Club — Comunidade de Alta Conversão", 
  description = "Acesse a Convert Club: A comunidade definitiva para infoprodutores e empreendedores que buscam alta conversão e escala.",
  image = "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/d71fa02f-ce09-4044-8202-3afeded364b1/id-preview-c34ad648--ae4e0d0a-37db-4e91-bdd1-c2701d692e1d.lovable.app-1776207839560.png",
  url = "https://convertclub.com/"
}: MetaProps) => {
  useEffect(() => {
    document.title = title;
    
    const updateMeta = (selector: string, content: string) => {
      let element = document.querySelector(selector);
      if (element) {
        element.setAttribute('content', content);
      } else {
        // Create if missing
        if (selector.startsWith('meta[name')) {
          const name = selector.match(/name="([^"]+)"/)?.[1];
          if (name) {
            const meta = document.createElement('meta');
            meta.setAttribute('name', name);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
          }
        } else if (selector.startsWith('meta[property')) {
          const property = selector.match(/property="([^"]+)"/)?.[1];
          if (property) {
            const meta = document.createElement('meta');
            meta.setAttribute('property', property);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
          }
        }
      }
    };

    updateMeta('meta[name="description"]', description);
    updateMeta('meta[property="og:title"]', title);
    updateMeta('meta[property="og:description"]', description);
    updateMeta('meta[property="og:image"]', image);
    updateMeta('meta[property="og:url"]', url);
    updateMeta('meta[name="twitter:title"]', title);
    updateMeta('meta[name="twitter:description"]', description);
    updateMeta('meta[name="twitter:image"]', image);
  }, [title, description, image, url]);

  return null;
};

export default Meta;
