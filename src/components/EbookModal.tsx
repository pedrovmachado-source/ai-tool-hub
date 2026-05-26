import { X, Copy, Check, ExternalLink, Zap, DollarSign, CheckSquare, Lightbulb, Play, Bookmark, BookmarkCheck, FileText, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Tool, Category } from '@/data/tools-data';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { isPaid } from '@/lib/plan';

interface EbookModalProps {
  tool: Tool;
  category: Category;
  isOpen: boolean;
  onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <button onClick={copy} className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white hover:bg-white/10 transition-all">
      {copied ? <Check size={12} className="text-green-500" /> : 'Copiar'}
    </button>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-xl">{icon}</span>
      <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">{children}</h3>
      <div className="flex-1 border-t border-white/5" />
    </div>
  );
}

function PromptCard({ prompt }: { prompt: { label: string; text: string } }) {
  const label = prompt?.label ?? '';
  const level = label.startsWith('🟢') ? 'beginner' : label.startsWith('🟡') ? 'intermediate' : label.startsWith('🔴') ? 'advanced' : 'default';
  const levelColors = {
    beginner: 'border-green-500/20 text-green-400 bg-green-500/5',
    intermediate: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5',
    advanced: 'border-red-500/20 text-red-400 bg-red-500/5',
    default: 'border-white/10 text-white/40 bg-white/5',
  };

  return (
    <div className="glass-smooth border border-white/5 rounded-2xl overflow-hidden mb-4">
      <div className={`flex items-center justify-between px-5 py-3 border-b border-white/5 ${levelColors[level]}`}>
        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">{prompt.label}</span>
        <CopyButton text={prompt.text} />
      </div>
      <div className="p-6">
        <p className="text-sm text-white/60 font-light leading-relaxed italic">"{prompt.text}"</p>
      </div>
    </div>
  );
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  return null;
}

export default function EbookModal({ tool, category, isOpen, onClose }: EbookModalProps) {
  const { user, isAdmin, saveEbook, unsaveEbook, isEbookSaved } = useAuth();
  const canAccess = isAdmin || isPaid(user?.plano);
  const [premium, setPremium] = useState<Partial<Tool> | null>(null);
  const [loadingPremium, setLoadingPremium] = useState(false);
  const [activeTab, setActiveTab] = useState<'ebook' | 'videos' | 'pdf'>('ebook');

  useEffect(() => {
    if (!isOpen || !canAccess) return;
    let cancelled = false;
    setLoadingPremium(true);
    (async () => {
      const { data, error } = await (supabase as any).rpc('get_tool_premium', { _tool_key: tool.key });
      if (cancelled) return;
      if (error) {
        console.error('Failed to load premium content', error);
        setPremium({});
      } else {
        setPremium((data as any) || {});
      }
      setLoadingPremium(false);
    })();
    return () => { cancelled = true; };
  }, [isOpen, canAccess, tool.key]);

  const fullTool: Tool = { ...tool, ...(premium || {}) } as Tool;
  useEffect(() => {
    if (premium?.pdfDataUrl) setActiveTab('pdf');
  }, [premium]);

  const saved = isEbookSaved(tool.key);
  if (!isOpen) return null;

  if (!canAccess) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
        <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] w-full max-w-[400px] p-10 text-center animate-slide-up shadow-2xl" onClick={e => e.stopPropagation()}>
          <div className="w-20 h-20 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border border-white/10 shadow-xl">
            <Lock size={32} className="text-white" />
          </div>
          <h2 className="text-3xl font-serif-display text-white mb-4 tracking-tight">Conteúdo de Elite</h2>
          <p className="text-sm text-white/40 font-light leading-relaxed mb-10">Este arsenal é exclusivo para membros Pro. Assine agora para liberar e-books, prompts e guias de escala.</p>
          <button onClick={onClose} className="w-full py-4 rounded-2xl bg-white text-black text-xs font-bold uppercase tracking-widest hover:bg-white/90 transition-all shadow-lg active:scale-[0.98]">Conhecer Planos</button>
        </div>
      </div>
    );
  }

  const beginnerPrompts = fullTool.prompts || [];
  const intermediatePrompts = fullTool.extraPrompts || [];
  const advancedPrompts = fullTool.promptsAdvanced || [];
  const allPrompts = [...beginnerPrompts, ...intermediatePrompts, ...advancedPrompts];

  const handleToggleSave = () => {
    if (saved) unsaveEbook(tool.key);
    else saveEbook(tool.key, tool.name, category.key);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 backdrop-blur-md" style={{ background: 'rgba(0,0,0,0.85)' }} onClick={onClose}>
      <div className="bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] w-full max-w-[900px] max-h-[90vh] overflow-hidden animate-slide-up flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="border-b border-white/5 shrink-0 bg-white/[0.01]">
          <div className="flex items-center justify-between p-8 pb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-serif-display text-white tracking-tight">{tool.name}</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/10 text-white/40 uppercase tracking-widest">{tool.badge}</span>
            </div>
            <div className="flex items-center gap-3">
              {user && (
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${saved ? 'bg-white text-black' : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10 hover:text-white'}`}
                  title={saved ? 'Remover dos salvos' : 'Salvar e-book'}
                >
                  {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  {saved ? 'Salvo' : 'Salvar'}
                </button>
              )}
              <button onClick={onClose} className="text-white/40 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all"><X size={20} /></button>
            </div>
          </div>
          <div className="flex gap-2 px-8 pb-0 overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('ebook')} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 transition-all ${activeTab === 'ebook' ? 'text-white border-white' : 'text-white/20 hover:text-white/60 border-transparent'}`}>
              📖 Guia
            </button>
            {fullTool.pdfDataUrl && (
              <button onClick={() => setActiveTab('pdf')} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 flex items-center gap-2 transition-all ${activeTab === 'pdf' ? 'text-white border-white' : 'text-white/20 hover:text-white/60 border-transparent'}`}>
                <FileText size={14} /> PDF
              </button>
            )}
            <button onClick={() => setActiveTab('videos')} className={`px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] border-b-2 flex items-center gap-2 transition-all ${activeTab === 'videos' ? 'text-white border-white' : 'text-white/20 hover:text-white/60 border-transparent'}`}>
              <Play size={14} /> Vídeos {fullTool.videos && fullTool.videos.length > 0 && <span className="ml-1 opacity-40">({fullTool.videos.length})</span>}
            </button>
          </div>
        </div>
        <div className="p-8 overflow-y-auto flex-1 space-y-12">

        {activeTab === 'pdf' && fullTool.pdfDataUrl && (
          <div className="h-[70vh] -m-8">
            <iframe
              src={`${fullTool.pdfDataUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={`PDF - ${tool.name}`}
              style={{ pointerEvents: 'auto' }}
            />
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 gap-8">
            {(!fullTool.videos || fullTool.videos.length === 0) ? (
              <div className="text-center py-20">
                <Play size={48} className="mx-auto mb-6 text-white/5" />
                <p className="text-sm text-white/20 font-bold uppercase tracking-widest">Aulas em breve</p>
              </div>
            ) : (
              fullTool.videos.map((v, i) => {
                const embedUrl = getEmbedUrl(v.url);
                return (
                  <div key={i} className="glass-smooth border border-white/5 rounded-[2rem] overflow-hidden group">
                    {embedUrl ? (
                      <div className="aspect-video">
                        <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={v.title} />
                      </div>
                    ) : (
                      <div className="aspect-video bg-white/5 flex items-center justify-center">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="h-14 px-8 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs flex items-center gap-3 hover:scale-[1.05] transition-all">
                          <Play size={16} fill="currentColor" /> Assistir agora
                        </a>
                      </div>
                    )}
                    <div className="p-8">
                      <h4 className="text-xl font-serif-display text-white mb-2">{v.title}</h4>
                      {v.desc && <p className="text-sm text-white/40 font-light leading-relaxed">{v.desc}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'ebook' && (<>
          {/* Cover */}
          <div className="glass-smooth border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.3em] mb-4">Guia Completo · Edição 2026</div>
              <h1 className="font-serif-display text-5xl text-white mb-6 tracking-tight">{tool.name}</h1>
              <p className="text-base text-white/40 font-light max-w-xl mx-auto leading-relaxed">{tool.desc}</p>
              <div className="flex gap-3 justify-center mt-8 flex-wrap">
                {['Arsenal Estratégico', 'Prompts Elite', 'Escala Brutal'].map(t => (
                  <span key={t} className="text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/5 border border-white/5 text-white/30">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          {tool.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tool.stats.map((s, i) => (
                <div key={i} className="glass-smooth border border-white/5 rounded-[2rem] p-8 text-center hover:bg-white/[0.02] transition-colors">
                  <div className="text-3xl font-serif-display text-white mb-1">{s.num}</div>
                  <div className="text-[9px] font-bold text-white/20 uppercase tracking-[0.2em]">{s.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <section>
            <SectionTitle icon="📖">Arquitetura da IA</SectionTitle>
            <p className="text-base text-white/50 font-light leading-loose">{tool.fullDesc || tool.desc}</p>
          </section>

          {/* When to use */}
          {tool.whenToUse && tool.whenToUse.length > 0 && (
            <section>
              <SectionTitle icon="⚡">Casos de Sucesso</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {tool.whenToUse.map((w, i) => (
                  <div key={i} className="flex items-start gap-4 glass-smooth border border-white/5 p-6 rounded-2xl">
                    <Check size={18} className="shrink-0 mt-0.5 text-white/20" />
                    <span className="text-sm text-white/60 font-light leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Steps */}
          {fullTool.steps && fullTool.steps.length > 0 && (
            <section>
              <SectionTitle icon="🚀">Plano de Execução</SectionTitle>
              <div className="space-y-8">
                {fullTool.steps.map((s, i) => (
                  <div key={i} className="flex gap-8 group">
                    <div className="w-14 h-14 rounded-2xl glass-smooth border border-white/5 flex items-center justify-center text-xl font-serif-display text-white shrink-0 group-hover:bg-white group-hover:text-black transition-all duration-500">{i + 1}</div>
                    <div className="pt-2">
                      <div className="text-xl font-serif-display text-white mb-2">{s.title}</div>
                      <div className="text-sm text-white/40 font-light leading-relaxed">{s.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Tip */}
          {tool.tip && (
            <div className="glass-smooth border border-white/10 rounded-[2.5rem] p-10 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-amber/10 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <div className="text-[9px] font-bold uppercase tracking-[0.3em] mb-4 flex items-center gap-2 text-brand-amber"><Lightbulb size={14} /> Segredo Industrial</div>
                <p className="text-lg text-white/80 font-light italic leading-relaxed">"{tool.tip}"</p>
              </div>
            </div>
          )}

          {/* Prompts */}
          {allPrompts.length > 0 && (
            <section>
              <SectionTitle icon="📋">Arsenal de Prompts</SectionTitle>
              <p className="text-sm text-white/30 font-light uppercase tracking-widest mb-8">Copie e adapte os modelos abaixo</p>
              
              <div className="space-y-8">
                {beginnerPrompts.length > 0 && (
                  <div>
                    {beginnerPrompts.map((pr, i) => (
                      <PromptCard key={`b-${i}`} prompt={pr} />
                    ))}
                  </div>
                )}

                {intermediatePrompts.length > 0 && (
                  <div>
                    {intermediatePrompts.map((pr, i) => (
                      <PromptCard key={`m-${i}`} prompt={pr} />
                    ))}
                  </div>
                )}

                {advancedPrompts.length > 0 && (
                  <div>
                    {advancedPrompts.map((pr, i) => (
                      <PromptCard key={`a-${i}`} prompt={pr} />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Use Cases */}
          {fullTool.useCases && fullTool.useCases.length > 0 && (
            <section>
              <SectionTitle icon="💼">Campo de Batalha</SectionTitle>
              <div className="grid grid-cols-1 gap-4">
                {fullTool.useCases.map((uc: any, i) => {
                  const item = typeof uc === 'string' ? { title: uc, text: '', result: undefined } : (uc || {});
                  const title = item.title || item.name || '';
                  const text = item.text || item.description || item.desc || '';
                  const result = item.result;
                  if (!title && !text) return null;
                  return (
                    <div key={i} className="glass-smooth border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.02] transition-colors">
                      {title && <div className="text-lg font-serif-display text-white mb-2">💼 {title}</div>}
                      {text && <div className="text-sm text-white/40 font-light leading-relaxed">{text}</div>}
                      {result && (
                        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-white/60 uppercase tracking-widest">
                          📈 ROI: {result}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Common Errors */}
          {fullTool.commonErrors && fullTool.commonErrors.length > 0 && (
            <section>
              <SectionTitle icon="⚠️">Blindagem de Erros</SectionTitle>
              <div className="space-y-4">
                {fullTool.commonErrors.map((e, i) => (
                  <div key={i} className="flex gap-6 p-8 glass-smooth border border-red-500/10 rounded-2xl bg-red-500/[0.02]">
                    <span className="text-2xl shrink-0">⚠️</span>
                    <div>
                      <div className="text-lg font-serif-display text-red-400 mb-2">{e.erro}</div>
                      <div className="text-sm text-white/40 font-light leading-relaxed">Solução: {e.fix}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Monetization */}
          {fullTool.monetization && fullTool.monetization.length > 0 && (
            <section>
              <SectionTitle icon="💰">Maquinaria de Lucro</SectionTitle>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fullTool.monetization.map((m, i) => (
                  <div key={i} className="flex items-center gap-4 glass-smooth border border-white/5 p-6 rounded-2xl">
                    <DollarSign size={18} className="text-white/20" />
                    <span className="text-sm text-white/60 font-light">{m}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Checklist */}
          {fullTool.checklist && fullTool.checklist.length > 0 && (
            <section>
              <SectionTitle icon="✅">Checklist de Escala</SectionTitle>
              <div className="glass-smooth border border-white/5 p-8 rounded-[2rem] space-y-4">
                {fullTool.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 group">
                    <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center group-hover:border-white/40 transition-colors">
                      <CheckSquare size={12} className="text-white/0 group-hover:text-white/40 transition-all" />
                    </div>
                    <span className="text-sm text-white/40 font-light group-hover:text-white/80 transition-colors">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pricing */}
          {tool.pricing && (
            <section>
              <SectionTitle icon="💰">Investimento Requerido</SectionTitle>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tool.pricing.map((p, i) => (
                  <div key={i} className={`glass-smooth border p-8 rounded-[2rem] text-center relative flex flex-col ${p.destaque ? 'border-white/30 bg-white/[0.02] scale-105 z-10' : 'border-white/5'}`}>
                    {p.destaque && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-[9px] font-bold px-4 py-1 rounded-full bg-white text-black uppercase tracking-widest whitespace-nowrap">Recomendado</div>}
                    <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-4">{p.name}</div>
                    <div className="text-4xl font-serif-display text-white mb-1">{p.price}</div>
                    <div className="text-[10px] text-white/20 uppercase tracking-widest mb-8">{p.period}</div>
                    <div className="space-y-3 mt-auto">
                      {p.features.map((f, idx) => (
                        <div key={idx} className="text-xs text-white/40 font-light">{f}</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="glass-smooth border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden group mt-12">
            <div className="absolute inset-0 bg-gradient-to-t from-white/[0.05] to-transparent pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-serif-display text-white mb-2 tracking-tight">Pronto para a Escala Brutal?</h2>
              <p className="text-sm text-white/40 font-light uppercase tracking-widest mb-10">Acesse {tool.name} e comece hoje mesmo</p>
              <a href={tool.url} target="_blank" rel="noopener noreferrer" className="h-16 px-12 rounded-full bg-white text-black font-bold uppercase tracking-widest text-xs inline-flex items-center gap-3 hover:scale-[1.05] transition-all shadow-xl">
                Link Oficial da Plataforma <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </>)}
        </div>
      </div>
    </div>
  );
}
