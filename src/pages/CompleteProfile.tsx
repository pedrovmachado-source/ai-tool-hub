import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export default function CompleteProfile() {
  const { user, updateUser, loading } = useAuth();
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (user.nome && user.sobrenome) {
        navigate('/menu');
      } else {
        setNome(user.nome || '');
        setSobrenome(user.sobrenome || '');
      }
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim() || !sobrenome.trim()) {
      setError('Por favor, preencha seu nome e sobrenome.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Update metadata as well
      await supabase.auth.updateUser({
        data: { nome, sobrenome }
      });
      
      await updateUser({ nome, sobrenome });
      navigate('/menu');
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060608] flex items-center justify-center">
        <Loader2 className="animate-spin text-white/20" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060608] flex items-center justify-center p-4">
      <div className="w-full max-w-[440px] animate-slide-up">
        <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl p-8">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
              <User size={36} className="text-white" />
            </div>
            <h1 className="text-3xl font-serif-display text-white mb-2 tracking-tight">Complete seu perfil</h1>
            <p className="text-sm text-white/40 font-light max-w-[280px]">
              Precisamos de apenas mais algumas informações para você começar.
            </p>
          </div>

          {error && (
            <div className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-3 mb-6 animate-fade-in">
              <p className="text-xs text-brand-red font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Nome</label>
              <input 
                value={nome} 
                onChange={e => setNome(e.target.value)} 
                placeholder="Seu nome" 
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
              />
            </div>
            
            <div className="mb-8">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Sobrenome</label>
              <input 
                value={sobrenome} 
                onChange={e => setSobrenome(e.target.value)} 
                placeholder="Seu sobrenome" 
                className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
              />
            </div>

            <button 
              type="submit"
              disabled={submitting} 
              className="w-full py-4 bg-white text-black rounded-2xl text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  Concluir cadastro
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
