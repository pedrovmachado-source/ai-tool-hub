import { useState } from 'react';
import { X, ArrowRight, ArrowLeft, Sparkles, Target } from 'lucide-react';

interface QuizQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; icon: string }[];
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'goal',
    question: 'Qual é o seu principal objetivo com IA?',
    options: [
      { label: 'Criar textos e copies', value: 'texto', icon: '✍️' },
      { label: 'Gerar imagens e design', value: 'imagens', icon: '🎨' },
      { label: 'Criar vídeos e apresentações', value: 'video', icon: '🎬' },
      { label: 'Aumentar produtividade', value: 'produtividade', icon: '⚡' },
      { label: 'Pesquisa e análise de dados', value: 'dados', icon: '📊' },
      { label: 'Melhorar tráfego e SEO', value: 'trafego', icon: '🔍' },
    ],
  },
  {
    id: 'experience',
    question: 'Qual seu nível de experiência com IA?',
    options: [
      { label: 'Nunca usei', value: 'beginner', icon: '🌱' },
      { label: 'Já testei algumas', value: 'intermediate', icon: '🌿' },
      { label: 'Uso regularmente', value: 'advanced', icon: '🌳' },
    ],
  },
  {
    id: 'business',
    question: 'Qual tipo de negócio você tem?',
    options: [
      { label: 'E-commerce / Loja online', value: 'ecommerce', icon: '🛒' },
      { label: 'Agência / Freelancer', value: 'agency', icon: '💼' },
      { label: 'Infoprodutos / Cursos', value: 'infoproduct', icon: '📚' },
      { label: 'Empresa / Startup', value: 'company', icon: '🏢' },
      { label: 'Criador de conteúdo', value: 'creator', icon: '📱' },
      { label: 'Ainda estou começando', value: 'starting', icon: '🚀' },
    ],
  },
];

// Maps goal + business to recommended tool keys
const RECOMMENDATIONS: Record<string, { toolKey: string; categoryKey: string; reason: string }[]> = {
  texto: [
    { toolKey: 'chatgpt', categoryKey: 'texto', reason: 'Ideal para criar copies, e-mails e conteúdo escrito' },
    { toolKey: 'claude', categoryKey: 'texto', reason: 'Melhor para textos longos e análises profundas' },
  ],
  imagens: [
    { toolKey: 'midjourney', categoryKey: 'imagens', reason: 'Gera imagens artísticas de altíssima qualidade' },
    { toolKey: 'grok', categoryKey: 'imagens', reason: 'Geração de imagens rápida e criativa com a IA da xAI' },
    { toolKey: 'dalle', categoryKey: 'imagens', reason: 'Integrado ao ChatGPT, ótimo para design rápido' },
  ],
  video: [
    { toolKey: 'gamma', categoryKey: 'video', reason: 'Cria apresentações profissionais com IA em minutos' },
  ],
  produtividade: [
    { toolKey: 'chatgpt', categoryKey: 'texto', reason: 'Automatize tarefas repetitivas e ganhe tempo' },
  ],
  dados: [
    { toolKey: 'perplexity', categoryKey: 'dados', reason: 'Pesquisa com fontes verificadas em tempo real' },
  ],
  trafego: [
    { toolKey: 'chatgpt', categoryKey: 'texto', reason: 'Crie conteúdo SEO otimizado para seu site' },
  ],
};

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommend: (toolKey: string, categoryKey: string) => void;
}

export default function QuizModal({ isOpen, onClose, onRecommend }: QuizModalProps) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResult, setShowResult] = useState(false);

  if (!isOpen) return null;

  const currentQuestion = QUIZ_QUESTIONS[step];
  const totalSteps = QUIZ_QUESTIONS.length;

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (step < totalSteps - 1) {
      setStep(step + 1);
    } else {
      setShowResult(true);
    }
  };

  const recommendations = RECOMMENDATIONS[answers.goal || 'texto'] || RECOMMENDATIONS.texto;

  const handleGoToTool = (toolKey: string, categoryKey: string) => {
    onRecommend(toolKey, categoryKey);
    onClose();
  };

  const handleBack = () => {
    if (showResult) {
      setShowResult(false);
    } else if (step > 0) {
      setStep(step - 1);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setShowResult(false);
  };

  return (
  return (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] w-full max-w-[520px] animate-slide-up overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Sparkles size={22} className="text-white" />
            <h2 className="text-2xl font-serif-display text-white tracking-tight">
              {showResult ? 'Sua recomendação' : 'Descubra a IA ideal'}
            </h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-8">
          {!showResult ? (
            <>
              {/* Progress */}
              <div className="flex gap-2 mb-8">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-white' : 'bg-white/10'}`} />
                ))}
              </div>

              {/* Question */}
              <p className="text-lg font-medium text-white mb-6">{currentQuestion.question}</p>

              {/* Options */}
              <div className="space-y-3">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all flex items-center gap-4 hover:border-white/30 hover:bg-white/5 group ${
                      answers[currentQuestion.id] === opt.value
                        ? 'border-white/40 bg-white/10'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <span className="text-2xl group-hover:scale-110 transition-transform">{opt.icon}</span>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{opt.label}</span>
                    <ArrowRight size={16} className="ml-auto text-white/20 group-hover:text-white/60 transition-all group-hover:translate-x-1" />
                  </button>
                ))}
              </div>

              {/* Back button */}
              {step > 0 && (
                <button onClick={handleBack} className="flex items-center gap-2 mt-6 text-xs font-bold text-white/30 hover:text-white/60 uppercase tracking-widest transition-colors">
                  <ArrowLeft size={14} /> Voltar
                </button>
              )}

              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em] mt-8 text-center">
                Etapa {step + 1} de {totalSteps}
              </p>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4 shadow-xl">
                  <Target size={28} className="text-white" />
                </div>
                <p className="text-sm text-white/40 font-light leading-relaxed">
                  Com base no seu perfil e objetivos,<br />estas são as ferramentas ideais para você:
                </p>
              </div>

              <div className="space-y-4">
                {recommendations.map((rec, i) => (
                  <button
                    key={rec.toolKey}
                    onClick={() => handleGoToTool(rec.toolKey, rec.categoryKey)}
                    className="w-full text-left px-6 py-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:border-white/20 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-white/60 uppercase tracking-widest flex items-center gap-2">
                        {i === 0 ? '🥇 Principal' : '🥈 Alternativa'}
                      </span>
                      <ArrowRight size={16} className="text-white/20 group-hover:text-white/60 transition-all group-hover:translate-x-1" />
                    </div>
                    <p className="text-sm text-white/40 font-light group-hover:text-white/60 transition-colors leading-relaxed">{rec.reason}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-4 mt-8">
                <button onClick={reset} className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest border border-white/5 text-white/40 hover:text-white hover:bg-white/5 transition-all active:scale-[0.98]">
                  Refazer
                </button>
                <button onClick={onClose} className="flex-1 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-white/90 transition-all active:scale-[0.98] shadow-lg">
                  Explorar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>

        </div>
      </div>
    </div>
  );
}
