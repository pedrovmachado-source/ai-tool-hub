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
    <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4" style={{ background: 'rgba(10,10,30,0.7)' }} onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-[520px] animate-slide-up overflow-hidden" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-brand-blue-medium" />
            <h2 className="text-lg font-medium">
              {showResult ? 'Sua recomendação personalizada' : 'Descubra a IA ideal para você'}
            </h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary">
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {!showResult ? (
            <>
              {/* Progress */}
              <div className="flex gap-1.5 mb-6">
                {QUIZ_QUESTIONS.map((_, i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? 'bg-brand-blue' : 'bg-border'}`} />
                ))}
              </div>

              {/* Question */}
              <p className="text-[15px] font-medium mb-5">{currentQuestion.question}</p>

              {/* Options */}
              <div className="space-y-2.5">
                {currentQuestion.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-4 py-3.5 rounded-xl border transition-all flex items-center gap-3 hover:border-brand-blue hover:bg-brand-blue/5 ${
                      answers[currentQuestion.id] === opt.value
                        ? 'border-brand-blue bg-brand-blue/10'
                        : 'border-border'
                    }`}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                    <ArrowRight size={14} className="ml-auto text-muted-foreground" />
                  </button>
                ))}
              </div>

              {/* Back button */}
              {step > 0 && (
                <button onClick={handleBack} className="flex items-center gap-1.5 mt-4 text-sm text-muted-foreground hover:text-foreground">
                  <ArrowLeft size={14} /> Voltar
                </button>
              )}

              <p className="text-[11px] text-muted-foreground/50 mt-4 text-center">
                Pergunta {step + 1} de {totalSteps}
              </p>
            </>
          ) : (
            <>
              {/* Results */}
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-full bg-brand-blue/15 flex items-center justify-center mx-auto mb-3">
                  <Target size={24} className="text-brand-blue-medium" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Com base nas suas respostas, recomendamos:
                </p>
              </div>

              <div className="space-y-3">
                {recommendations.map((rec, i) => (
                  <button
                    key={rec.toolKey}
                    onClick={() => handleGoToTool(rec.toolKey, rec.categoryKey)}
                    className="w-full text-left px-4 py-4 rounded-xl border border-border hover:border-brand-blue hover:bg-brand-blue/5 transition-all"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-semibold">{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'} Recomendação #{i + 1}</span>
                      <ArrowRight size={14} className="text-brand-blue-medium" />
                    </div>
                    <p className="text-[13px] text-muted-foreground">{rec.reason}</p>
                  </button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={reset} className="flex-1 py-2.5 rounded-lg text-sm font-medium border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                  Refazer quiz
                </button>
                <button onClick={onClose} className="flex-1 py-2.5 rounded-lg text-sm font-medium bg-navy text-primary-foreground hover:opacity-90 transition-opacity">
                  Explorar todas as IAs
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
