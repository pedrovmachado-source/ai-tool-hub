import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  X, 
  Loader2, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  CheckCircle2, 
  ChevronLeft,
  ShieldCheck,
  Zap,
  Sparkles,
  Rocket
} from 'lucide-react';
import { lovable } from '@/integrations/lovable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import logoAdai from '@/assets/logo.png';

export default function Auth() {
  const { login, register, resetPassword, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialMode = queryParams.get('mode') as 'login' | 'register' | 'forgot' | 'reset' || 'login';
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  
  // UI states
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && !authLoading && mode !== 'reset') {
      navigate('/menu');
    }
  }, [user, authLoading, navigate, mode]);

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setError('');
    try {
      const result = await lovable.auth.signInWithOAuth('google');
      if (result.error) {
        setError(result.error.message);
        setSubmitting(false);
      }
    } catch (err) {
      setError('Erro ao conectar com Google. Tente novamente.');
      setSubmitting(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    
    setSubmitting(true);
    setError('');
    try {
      const err = await login(email, password);
      if (err) {
        setError(err);
        setSubmitting(false);
      }
    } catch (err) {
      setError('Erro inesperado. Tente novamente.');
      setSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !sobrenome || !email || !password || !confirmPassword) { setError('Preencha todos os campos.'); return; }
    if (!lgpdAccepted) { setError('Você deve aceitar os termos da LGPD.'); return; }
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    
    setSubmitting(true);
    setError('');
    try {
      const err = await register(nome, sobrenome, email, password, lgpdAccepted);
      if (err) {
        if (err.toLowerCase().includes('disabled')) {
          setError('O registro de novas contas por e-mail está temporariamente desativado. Por favor, use o login com Google.');
        } else {
          setError(err);
        }
        setSubmitting(false);
      } else {
        setSuccess('Conta criada com sucesso! Redirecionando...');
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.');
      setSubmitting(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Digite seu e-mail.'); return; }
    
    setSubmitting(true);
    setError('');
    try {
      const err = await resetPassword(email);
      if (err) {
        setError(err);
      } else {
        setSuccess('Se o e-mail estiver correto, você receberá um link de recuperação.');
      }
    } catch (err) {
      setError('Erro ao solicitar recuperação.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Digite a nova senha.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem.'); return; }
    
    setSubmitting(true);
    setError('');
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(error.message);
      } else {
        setSuccess('Senha atualizada com sucesso! Você já pode entrar.');
        setTimeout(() => setMode('login'), 2000);
      }
    } catch (err) {
      setError('Erro ao atualizar senha.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col lg:flex-row font-sans selection:bg-white/20">
      {/* Left side - Brand/Marketing (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[80%] h-[80%] rounded-full bg-white/[0.03] blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[80%] rounded-full bg-white/[0.03] blur-[120px]" />
        </div>
        
        <div className="relative z-10">
          <button onClick={() => navigate('/')} className="flex items-center gap-4 group">
            <div className="w-14 h-14 rounded-2xl overflow-hidden glass-smooth border border-white/10 p-1 group-hover:scale-110 transition-transform">
              <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover rounded-xl" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-serif-display text-white tracking-tight">CONVERT CLUB</span>
              <span className="text-[10px] font-bold text-white/40 tracking-[0.3em] uppercase">Elite Community</span>
            </div>
          </button>
        </div>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-6xl font-serif-display text-white leading-[1.1] mb-8 tracking-tighter">
            Onde a <em className="italic font-normal">Escala</em> se torna inevitável.
          </h2>
          <div className="space-y-6">
            {[
              { icon: Zap, text: "Acesso a ferramentas exclusivas de IA" },
              { icon: Sparkles, text: "Networking com os 1% do mercado" },
              { icon: Rocket, text: "Estratégias validadas de alta conversão" }
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 text-white/50">
                <div className="w-10 h-10 rounded-xl glass-smooth border border-white/5 flex items-center justify-center shrink-0">
                  <item.icon size={18} />
                </div>
                <span className="font-light">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-8 text-white/20 text-[10px] font-bold uppercase tracking-[0.3em]">
          <span>© 2026 Convert Club</span>
          <span>Privacidade</span>
          <span>Termos</span>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative overflow-hidden">
        <div className="lg:hidden absolute top-8 left-8">
           <button onClick={() => navigate('/')} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden glass-smooth border border-white/10 p-1">
              <img src={logoAdai} alt="AdAI" className="w-full h-full object-cover rounded-lg" />
            </div>
          </button>
        </div>

        <div className="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-serif-display text-white mb-3">
              {mode === 'login' ? 'Bem-vindo de volta' : mode === 'register' ? 'Comece sua jornada' : mode === 'forgot' ? 'Recuperar senha' : 'Nova senha'}
            </h1>
            <p className="text-white/40 font-light">
              {mode === 'login' ? 'Entre com suas credenciais para acessar o club.' : 
               mode === 'register' ? 'Junte-se a maior comunidade de infoprodutores.' : 
               mode === 'forgot' ? 'Digite seu e-mail para receber as instruções.' :
               'Escolha uma nova senha forte para sua conta.'}
            </p>
          </div>

          <div className="glass-smooth border border-white/10 rounded-[2.5rem] p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6 animate-in fade-in zoom-in-95">
                <p className="text-xs text-red-500 font-medium leading-relaxed">{error}</p>
              </div>
            )}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 mb-6 animate-in fade-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                  <p className="text-xs text-green-500 font-medium leading-relaxed">{success}</p>
                </div>
              </div>
            )}

            {(mode === 'login' || mode === 'register') && (
              <>
                <Button 
                  onClick={handleGoogleSignIn}
                  disabled={submitting}
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white gap-3 mb-6 transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {mode === 'login' ? 'Entrar com Google' : 'Cadastrar com Google'}
                </Button>

                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 border-t border-white/5" />
                  <span className="text-[10px] font-bold text-white/10 uppercase tracking-[0.2em]">ou</span>
                  <div className="flex-1 border-t border-white/5" />
                </div>
              </>
            )}

            <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : mode === 'forgot' ? handleForgot : handleReset} className="space-y-5">
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Nome</Label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                      <Input 
                        value={nome}
                        onChange={e => setNome(e.target.value)}
                        placeholder="Nome"
                        className="h-13 pl-11 bg-white/5 border-white/10 rounded-2xl focus:border-white/30 transition-all text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">Sobrenome</Label>
                    <Input 
                      value={sobrenome}
                      onChange={e => setSobrenome(e.target.value)}
                      placeholder="Sobrenome"
                      className="h-13 bg-white/5 border-white/10 rounded-2xl focus:border-white/30 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">E-mail</Label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input 
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="h-13 pl-11 bg-white/5 border-white/10 rounded-2xl focus:border-white/30 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {(mode === 'login' || mode === 'reset') && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Senha</Label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => setMode('forgot')} className="text-[10px] font-medium text-white/40 hover:text-white transition-colors uppercase tracking-wider">Esqueceu a senha?</button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                    <Input 
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="h-13 pl-11 bg-white/5 border-white/10 rounded-2xl focus:border-white/30 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {(mode === 'register' || mode === 'reset') && (
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] ml-1">{mode === 'reset' ? 'Confirmar Nova Senha' : 'Confirmar Senha'}</Label>
                  <Input 
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`h-13 bg-white/5 border rounded-2xl focus:outline-none transition-all text-sm ${confirmPassword && password !== confirmPassword ? 'border-red-500/50' : 'border-white/10 focus:border-white/30'}`}
                  />
                </div>
              )}

              {mode === 'register' && (
                <div className="flex items-start gap-3 pt-2">
                  <Checkbox 
                    id="lgpd" 
                    checked={lgpdAccepted}
                    onCheckedChange={(checked) => setLgpdAccepted(checked === true)}
                    className="mt-1 border-white/20 data-[state=checked]:bg-white data-[state=checked]:text-black"
                  />
                  <label htmlFor="lgpd" className="text-[11px] text-white/50 leading-relaxed cursor-pointer select-none">
                    Concordo com os <button type="button" className="text-white underline underline-offset-4 font-medium hover:text-white/80 transition-colors">Termos e Serviços</button> e a política de privacidade.
                  </label>
                </div>
              )}

              <Button 
                type="submit"
                disabled={submitting || (mode === 'register' && !lgpdAccepted)}
                className="w-full h-14 rounded-2xl bg-white text-black font-bold text-sm hover:bg-white/90 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.1)] group active:scale-[0.98]"
              >
                {submitting ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    {mode === 'login' ? 'Entrar no Club' : mode === 'register' ? 'Criar Conta' : mode === 'forgot' ? 'Enviar Link' : 'Redefinir Senha'}
                    <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-10 text-center">
              {mode === 'login' ? (
                <p className="text-xs text-white/40 font-light">
                  Não tem conta? <button onClick={() => { setMode('register'); setError(''); }} className="text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors">Cadastre-se grátis</button>
                </p>
              ) : mode === 'register' ? (
                <p className="text-xs text-white/40 font-light">
                  Já possui conta? <button onClick={() => { setMode('login'); setError(''); }} className="text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors">Faça login</button>
                </p>
              ) : (
                <button onClick={() => setMode('login')} className="flex items-center gap-2 text-xs text-white/40 hover:text-white transition-colors mx-auto group">
                  <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                  Voltar para login
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-8 flex items-center justify-center gap-2 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
            <ShieldCheck size={12} />
            <span>Ambiente 100% Seguro</span>
          </div>
        </div>
      </div>
    </div>
  );
}
