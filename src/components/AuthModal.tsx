import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { X, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { lovable } from '@/integrations/lovable';

interface AuthModalProps {
  mode: 'login' | 'register';
  isOpen: boolean;
  onClose: () => void;
  onSwitch: (mode: 'login' | 'register') => void;
  onRegistered?: () => void;
}

export default function AuthModal({ mode, isOpen, onClose, onSwitch, onRegistered }: AuthModalProps) {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [lgpdAccepted, setLgpdAccepted] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [showTerms, setShowTerms] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setError('');
    const result = await lovable.auth.signInWithOAuth('google');
    if (result.error) {
      setError(result.error.message);
      setSubmitting(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) { setError('Preencha todos os campos.'); return; }
    setSubmitting(true);
    setError('');
    const err = await login(email, password);
    setSubmitting(false);
    if (err) { setError(err); } else { onClose(); }
  };

  const handleRegister = async () => {
    if (!nome || !sobrenome || !email || !password || !confirmPassword) { setError('Preencha todos os campos.'); return; }
    if (!lgpdAccepted) { setError('Você deve aceitar os termos da LGPD para continuar.'); return; }
    if (password.length < 8) { setError('Senha deve ter no mínimo 8 caracteres.'); return; }
    if (password !== confirmPassword) { setError('As senhas não coincidem. Verifique e tente novamente.'); return; }
    
    setSubmitting(true);
    setError('');
    const err = await register(nome, sobrenome, email, password, lgpdAccepted);
    setSubmitting(false);
    
    if (err) {
      setError(err);
    } else {
      // With auto-confirm, the session might be established immediately.
      // If we're not redirected automatically by AuthProvider, we show a success or close.
      setSuccess('Conta criada com sucesso!');
      onRegistered?.();
      
      // Give a small delay to show success before closing/redirecting
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={onClose}>
      <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] w-full max-w-[440px] animate-slide-up overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-serif-display text-white tracking-tight">
            {mode === 'login' ? 'Entrar na sua conta' : 'Criar conta gratuita'}
          </h2>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"><X size={20} /></button>
        </div>
        <div className="p-8">
          {error && (
            <div className="bg-brand-red/10 border border-brand-red/20 rounded-xl p-3 mb-4 animate-fade-in">
              <p className="text-xs text-brand-red font-medium">{error}</p>
            </div>
          )}
          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-4 animate-fade-in">
              <p className="text-xs text-green-500 font-medium">{success}</p>
            </div>
          )}

          {mode === 'login' && (
            <>
              <div className="mb-5">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="seu@email.com" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Senha</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>
              <button 
                onClick={handleLogin} 
                disabled={submitting} 
                className="w-full py-4 bg-white text-black rounded-2xl text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Entrar'}
              </button>
              
              <div className="flex items-center gap-3 my-6 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="flex-1 border-t border-white/5" />
                <span>ou</span>
                <div className="flex-1 border-t border-white/5" />
              </div>
              
              <button 
                onClick={handleGoogleSignIn} 
                disabled={submitting} 
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50 flex items-center justify-center gap-3 mb-6 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Continuar com Google
              </button>
              <p className="text-center text-xs text-white/40 font-light">
                Não tem conta? <button onClick={() => { setError(''); setSuccess(''); onSwitch('register'); }} className="text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors">Cadastre-se grátis</button>
              </p>
            </>
          )}

          {mode === 'register' && !success && (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Nome</label>
                  <input 
                    value={nome} 
                    onChange={e => setNome(e.target.value)} 
                    placeholder="Seu nome" 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Sobrenome</label>
                  <input 
                    value={sobrenome} 
                    onChange={e => setSobrenome(e.target.value)} 
                    placeholder="Seu sobrenome" 
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">E-mail</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  placeholder="seu@email.com" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>
              <div className="mb-4">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Senha</label>
                <input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Mínimo 8 caracteres" 
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-all" 
                />
              </div>
              <div className="mb-6">
                <label className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] mb-2 block ml-1">Confirmar senha</label>
                <input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Digite a senha novamente" 
                  className={`w-full px-4 py-3 bg-white/5 border rounded-2xl text-sm text-white placeholder:text-white/20 focus:outline-none transition-all ${confirmPassword && password !== confirmPassword ? 'border-brand-red' : 'border-white/10 focus:border-white/30'}`} 
                />
              </div>

              <div className="mb-6 flex items-start gap-3 px-1">
                <input 
                  type="checkbox" 
                  id="lgpd"
                  checked={lgpdAccepted}
                  onChange={e => setLgpdAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-white focus:ring-white/30"
                />
                <label htmlFor="lgpd" className="text-[11px] text-white/60 leading-relaxed cursor-pointer select-none">
                  Estou de acordo com os <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTerms(true); }} className="text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors">termos e serviços</button>
                </label>
              </div>

              {showTerms && (
                <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-black/90 animate-fade-in" onClick={() => setShowTerms(false)}>
                  <div className="bg-[#0D0D0F] border border-white/10 rounded-[2rem] w-full max-w-[500px] max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b border-white/5 flex items-center justify-between">
                      <h3 className="text-xl font-serif-display text-white">Termos e Serviços</h3>
                      <button onClick={() => setShowTerms(false)} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors"><X size={20} /></button>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar text-white/60 text-sm space-y-4 font-light leading-relaxed">
                      <p className="font-medium text-white">1. Coleta de Informações e Uso de Dados</p>
                      <p>
                        Ao utilizar nossa plataforma, você concorda expressamente com a coleta, processamento e armazenamento de seus dados pessoais e de navegação. 
                        Este site utiliza tecnologias de rastreamento avançadas para monitorar seu comportamento, interesses e padrões de interação.
                      </p>
                      <p className="font-medium text-white">2. Compartilhamento com Terceiros (Meta e Google Ads)</p>
                      <p>
                        <span className="text-brand-red font-medium">IMPORTANTE:</span> Você declara estar ciente de que seus dados, incluindo mas não se limitando a: 
                        endereço de e-mail, identificadores de dispositivos, histórico de cliques e preferências de conteúdo, <span className="text-white font-medium">serão comercializados e compartilhados</span> com plataformas de publicidade externas, 
                        especialmente <span className="text-white font-medium">Meta Ads (Facebook e Instagram)</span> e <span className="text-white font-medium">Google Ads</span>.
                      </p>
                      <p>
                        Esse compartilhamento tem como objetivo a criação de perfis psicológicos e comportamentais para fins de remarketing, 
                        direcionamento de anúncios altamente específicos e otimização de campanhas de conversão de terceiros.
                      </p>
                      <p className="font-medium text-white">3. Finalidades Adicionais</p>
                      <p>
                        Os dados coletados também serão utilizados para:
                        <br />• Análise estatística profunda de mercado;
                        <br />• Desenvolvimento de novos produtos baseados no seu perfil;
                        <br />• Comunicações persistentes de marketing via e-mail e outros canais;
                        <br />• Transferência internacional de dados para servidores localizados em diversas jurisdições.
                      </p>
                      <p className="font-medium text-white">4. Consentimento e LGPD</p>
                      <p>
                        De acordo com a Lei Geral de Proteção de Dados (LGPD), ao marcar a caixa de seleção, você fornece seu consentimento livre, informado e inequívoco 
                        para todos os tratamentos de dados descritos nestes termos, reconhecendo que a venda de dados é parte integrante do modelo de operação deste serviço gratuito.
                      </p>
                      <p>
                        Este documento pode ser alterado a qualquer momento sem aviso prévio, e a continuidade do uso da plataforma após alterações constitui aceitação dos novos termos. 
                        A leitura completa destes termos é de responsabilidade do usuário, sendo este um texto extenso e detalhado para garantir a total conformidade legal das operações de monetização de dados aqui praticadas.
                      </p>
                    </div>
                    <div className="p-6 border-t border-white/5">
                      <button 
                        onClick={() => setShowTerms(false)} 
                        className="w-full py-3 bg-white/10 text-white rounded-xl text-sm font-bold hover:bg-white/20 transition-all border border-white/10"
                      >
                        Entendi e Fechar
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <button 
                onClick={handleRegister} 
                disabled={submitting || !lgpdAccepted} 
                className="w-full py-4 bg-white text-black rounded-2xl text-sm font-bold hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : 'Criar conta grátis'}
              </button>
              
              <div className="flex items-center gap-3 my-6 text-white/20 text-[10px] font-bold uppercase tracking-[0.2em]">
                <div className="flex-1 border-t border-white/5" />
                <span>ou</span>
                <div className="flex-1 border-t border-white/5" />
              </div>
              
              <button 
                onClick={handleGoogleSignIn} 
                disabled={submitting || !lgpdAccepted} 
                className="w-full py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-sm font-medium hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 mb-6 active:scale-[0.98]"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Cadastrar com Google
              </button>
              <p className="text-center text-xs text-white/40 font-light">
                Já tem conta? <button onClick={() => { setError(''); setSuccess(''); onSwitch('login'); }} className="text-white font-medium underline underline-offset-4 hover:text-white/80 transition-colors">Entrar</button>
              </p>
            </>
          )}

          {mode === 'register' && success && (
            <div className="flex flex-col items-center text-center py-6 px-2 animate-fade-in">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mb-6 shadow-xl">
                <Mail size={36} className="text-white" />
              </div>
              <h3 className="text-3xl font-serif-display text-white mb-3 tracking-tight">Verifique seu e-mail</h3>
              <p className="text-sm text-white/40 mb-6 font-light">
                Enviamos um link de confirmação para o seu endereço de e-mail.
              </p>
              <div className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 mb-8">
                <p className="text-xs font-bold text-white/20 uppercase tracking-[0.2em] mb-1">E-mail enviado para</p>
                <p className="text-sm font-medium text-white break-all">{email}</p>
              </div>
              
              <div className="flex items-start gap-3 bg-white/5 rounded-2xl p-4 mb-8 w-full border border-white/5">
                <CheckCircle2 size={18} className="text-green-500 mt-0.5 shrink-0" />
                <p className="text-xs text-white/40 text-left font-light leading-relaxed">
                  Clique no link enviado para ativar sua conta. Verifique também a <span className="text-white font-medium">caixa de spam</span> caso não encontre o e-mail em alguns minutos.
                </p>
              </div>
              
              <button
                onClick={() => { setError(''); setSuccess(''); onSwitch('login'); }}
                className="w-full py-4 bg-white/10 text-white rounded-2xl text-sm font-bold hover:bg-white/20 transition-all border border-white/10 active:scale-[0.98]"
              >
                Ir para login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
