import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { X, Loader2, Upload, Camera } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ValidatedOffer {
  id: string;
  title: string;
  description: string | null;
  price: string | null;
  link: string;
  image_url: string | null;
  category: string | null;
}

interface InlineOfferEditorProps {
  offer: ValidatedOffer;
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function InlineOfferEditor({ offer, isOpen, onClose, onSave }: InlineOfferEditorProps) {
  const [editingOffer, setEditingOffer] = useState<ValidatedOffer>({ ...offer });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `offers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('content-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('content-images')
        .getPublicUrl(filePath);

      setEditingOffer(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: 'Imagem enviada com sucesso' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: error.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const { id, ...data } = editingOffer;
      const { error } = await supabase
        .from('validated_offers')
        .update(data)
        .eq('id', id);

      if (error) throw error;
      
      toast({ title: 'Oferta atualizada com sucesso' });
      onSave();
      onClose();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-md p-4" onClick={onClose}>
      <div 
        className="glass-smooth border border-white/10 rounded-[2.5rem] p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-300" 
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-serif-display text-white">Editar Oferta</h3>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-48 h-32 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative">
                {editingOffer.image_url ? (
                  <img src={editingOffer.image_url} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/10">
                    <Camera size={32} />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Upload size={20} className="text-white" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Trocar Imagem</span>
                </div>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={24} className="text-brand-amber animate-spin" />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Título</label>
              <input 
                required
                value={editingOffer.title || ''} 
                onChange={e => setEditingOffer({ ...editingOffer, title: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Categoria</label>
                <input 
                  value={editingOffer.category || ''} 
                  onChange={e => setEditingOffer({ ...editingOffer, category: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Investimento</label>
                <input 
                  value={editingOffer.price || ''} 
                  onChange={e => setEditingOffer({ ...editingOffer, price: e.target.value })} 
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Descrição</label>
              <textarea 
                rows={3}
                value={editingOffer.description || ''} 
                onChange={e => setEditingOffer({ ...editingOffer, description: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20 resize-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-1.5 block">Link</label>
              <input 
                required
                value={editingOffer.link || ''} 
                onChange={e => setEditingOffer({ ...editingOffer, link: e.target.value })} 
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-white text-sm focus:outline-none focus:border-white/20"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-full text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white">Cancelar</button>
            <button 
              type="submit" 
              disabled={isUploading || isSaving}
              className="flex-1 px-8 py-4 bg-white text-black rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}