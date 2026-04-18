import { X, Copy, Check, ExternalLink, Zap, DollarSign, CheckSquare, Image, Lightbulb, Play, Bookmark, BookmarkCheck, FileText } from 'lucide-react';
import { useState, useEffect } from 'react';
import type { Tool, Category } from '@/data/tools-data';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
    <button onClick={copy} className="text-[11px] font-semibold border rounded px-2 py-0.5 flex items-center gap-1 transition-colors hover:bg-secondary" style={{ borderColor: 'currentColor' }}>
      {copied ? <><Check size={11} /> Copiado!</> : <><Copy size={11} /> Copiar</>}
    </button>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold pb-2 border-b-2 border-border mb-3">{icon} {children}</h3>;
}

function PromptCard({ prompt, accentLight, accentDark }: { prompt: { label: string; text: string }; accentLight: string; accentDark: string }) {
  const level = prompt.label.startsWith('🟢') ? 'beginner' : prompt.label.startsWith('🟡') ? 'intermediate' : prompt.label.startsWith('🔴') ? 'advanced' : 'default';
  const levelColors = {
    beginner: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32' },
    intermediate: { bg: '#FFF8E1', border: '#FFC107', text: '#F57F17' },
    advanced: { bg: '#FFEBEE', border: '#F44336', text: '#C62828' },
    default: { bg: accentLight, border: accentDark, text: accentDark },
  };
  const colors = levelColors[level];

  return (
    <div className="border rounded-lg overflow-hidden mb-3" style={{ borderColor: colors.border + '40' }}>
      <div className="flex items-center justify-between px-4 py-2" style={{ background: colors.bg, color: colors.text }}>
        <span className="text-[11px] font-bold uppercase tracking-wider">{prompt.label}</span>
        <CopyButton text={prompt.text} />
      </div>
      <div className="px-4 py-3 text-[13px] leading-7 italic bg-card">{prompt.text}</div>
    </div>
  );
}

function getEmbedUrl(url: string): string | null {
  // YouTube
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (loomMatch) return `https://www.loom.com/embed/${loomMatch[1]}`;
  return null;
}

export default function EbookModal({ tool, category, isOpen, onClose }: EbookModalProps) {
  const [activeTab, setActiveTab] = useState<'ebook' | 'videos' | 'pdf'>(tool.pdfDataUrl ? 'pdf' : 'ebook');
  const { user, isAdmin, saveEbook, unsaveEbook, isEbookSaved } = useAuth();
  const saved = isEbookSaved(tool.key);
  if (!isOpen) return null;

  // Security: double-check access - only Pro users and admins can view ebook content
  const canAccess = isAdmin || (user && user.plano === 'Pro');
  if (!canAccess) {
    return (
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(10,10,30,0.65)' }} onClick={onClose}>
        <div className="bg-card rounded-2xl w-full max-w-[400px] p-8 text-center animate-slide-up" onClick={e => e.stopPropagation()}>
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold mb-2">Conteúdo exclusivo Pro</h2>
          <p className="text-sm text-muted-foreground mb-6">Assine o plano Pro para acessar os e-books completos, prompts avançados e guias passo a passo.</p>
          <button onClick={onClose} className="px-6 py-2 rounded-lg text-sm font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors">Fechar</button>
        </div>
      </div>
    );
  }

  const beginnerPrompts = tool.prompts || [];
  const intermediatePrompts = tool.extraPrompts || [];
  const advancedPrompts = tool.promptsAdvanced || [];
  const allPrompts = [...beginnerPrompts, ...intermediatePrompts, ...advancedPrompts];

  const handleToggleSave = () => {
    if (saved) unsaveEbook(tool.key);
    else saveEbook(tool.key, tool.name, category.key);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ background: 'rgba(10,10,30,0.65)' }} onClick={onClose}>
      <div className="bg-card rounded-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden animate-slide-up flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="border-b border-border shrink-0">
          <div className="flex items-center justify-between p-6 pb-3">
            <h2 className="text-lg font-medium">📘 {tool.name}</h2>
            <div className="flex items-center gap-2">
              {user && (
                <button
                  onClick={handleToggleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-colors ${saved ? 'bg-brand-amber/15 text-brand-amber' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                  title={saved ? 'Remover dos salvos' : 'Salvar e-book'}
                >
                  {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  {saved ? 'Salvo' : 'Salvar'}
                </button>
              )}
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-secondary"><X size={18} /></button>
            </div>
          </div>
          <div className="flex gap-1 px-6 pb-0">
            <button onClick={() => setActiveTab('ebook')} className={`px-4 py-2 text-[13px] font-medium rounded-t-lg transition-colors ${activeTab === 'ebook' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              📖 E-Book
            </button>
            {tool.pdfDataUrl && (
              <button onClick={() => setActiveTab('pdf')} className={`px-4 py-2 text-[13px] font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${activeTab === 'pdf' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <FileText size={13} /> PDF
              </button>
            )}
            <button onClick={() => setActiveTab('videos')} className={`px-4 py-2 text-[13px] font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${activeTab === 'videos' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
              <Play size={13} /> Vídeos {tool.videos && tool.videos.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-blue/20 text-brand-blue-medium">{tool.videos.length}</span>}
            </button>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

        {activeTab === 'pdf' && tool.pdfDataUrl && (
          <div className="h-[70vh] -m-6 -mb-6">
            <iframe
              src={`${tool.pdfDataUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`}
              className="w-full h-full border-0"
              title={`PDF - ${tool.name}`}
              style={{ pointerEvents: 'auto' }}
            />
            <style>{`
              iframe[title="PDF - ${tool.name}"] {
                -webkit-user-select: none;
                user-select: none;
              }
            `}</style>
          </div>
        )}

        {activeTab === 'videos' && (
          <div className="space-y-6">
            {(!tool.videos || tool.videos.length === 0) ? (
              <div className="text-center py-16">
                <Play size={40} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">Nenhum vídeo disponível para esta ferramenta ainda.</p>
              </div>
            ) : (
              tool.videos.map((v, i) => {
                const embedUrl = getEmbedUrl(v.url);
                return (
                  <div key={i} className="rounded-xl border border-border overflow-hidden">
                    {embedUrl ? (
                      <div className="aspect-video">
                        <iframe src={embedUrl} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title={v.title} />
                      </div>
                    ) : (
                      <div className="aspect-video bg-secondary flex items-center justify-center">
                        <a href={v.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-primary-foreground rounded-lg text-sm hover:opacity-90">
                          <Play size={14} /> Assistir vídeo
                        </a>
                      </div>
                    )}
                    <div className="p-4">
                      <h4 className="text-sm font-semibold mb-1">{v.title}</h4>
                      {v.desc && <p className="text-[13px] text-muted-foreground">{v.desc}</p>}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {activeTab === 'ebook' && (<>
          {/* Cover */}
          <div className="rounded-2xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${category.accentDark}, ${category.accent})` }}>
            <div className="text-[11px] font-semibold opacity-70 uppercase tracking-wider text-primary-foreground mb-2">📘 E-Book Completo · AdAI Pro</div>
            <h1 className="font-serif-display text-3xl text-primary-foreground mb-2">{tool.name}</h1>
            <p className="text-[13.5px] opacity-85 text-primary-foreground max-w-[560px] mx-auto">{tool.desc}</p>
            <div className="flex gap-2 justify-center mt-4 flex-wrap">
              {['Guia Completo', 'Prompts Prontos', 'Monetização', 'Automações', 'Checklist'].map(t => (
                <span key={t} className="text-[11px] px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground">{t}</span>
              ))}
            </div>
          </div>

          {/* Stats */}
          {tool.stats && (
            <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(tool.stats.length, 4)}, 1fr)` }}>
              {tool.stats.map((s, i) => (
                <div key={i} className="rounded-xl p-4 text-center" style={{ background: category.accentLight }}>
                  <div className="text-2xl font-bold" style={{ color: category.accentDark }}>{s.num}</div>
                  <div className="text-[11.5px] mt-1 opacity-80" style={{ color: category.accentDark }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <section>
            <SectionTitle icon="📖">O que é e para que serve</SectionTitle>
            <p className="text-sm text-muted-foreground leading-7">{tool.fullDesc || tool.desc}</p>
          </section>

          {/* When to use */}
          {tool.whenToUse && tool.whenToUse.length > 0 && (
            <section>
              <SectionTitle icon="✅">Quando usar no seu negócio</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {tool.whenToUse.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 bg-secondary rounded-lg p-3">
                    <Check size={14} className="shrink-0 mt-0.5" style={{ color: category.accent }} />
                    <span className="text-[13px] leading-relaxed">{w}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Steps */}
          {tool.steps && tool.steps.length > 0 && (
            <section>
              <SectionTitle icon="🚀">Guia passo a passo</SectionTitle>
              {tool.steps.map((s, i) => (
                <div key={i} className="flex gap-3.5 mb-5">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold text-primary-foreground shrink-0" style={{ background: `linear-gradient(135deg, ${category.accentDark}, ${category.accent})` }}>{i + 1}</div>
                  <div>
                    <div className="text-sm font-semibold mb-1">{s.title}</div>
                    <div className="text-[13.5px] text-muted-foreground leading-7">{s.text}</div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Tip */}
          {tool.tip && (
            <div className="rounded-r-lg p-5" style={{ background: `linear-gradient(135deg, ${category.accentLight}, transparent)`, borderLeft: `4px solid ${category.accent}` }}>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: category.accentDark }}><Lightbulb size={13} /> Dica de ouro</div>
              <p className="text-[13.5px] leading-7" style={{ color: category.accentDark }}>{tool.tip}</p>
            </div>
          )}

          {/* Prompts */}
          {allPrompts.length > 0 && (
            <section>
              <SectionTitle icon="📋">Prompts prontos para copiar</SectionTitle>
              <p className="text-[13px] text-muted-foreground mb-4">Substitua os itens entre <strong>[colchetes]</strong> com as informações do seu negócio.</p>
              
              {beginnerPrompts.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-green-700 bg-green-50 dark:bg-green-950 dark:text-green-400 px-3 py-1.5 rounded-t-lg border border-green-200 dark:border-green-800">🟢 NÍVEL INICIANTE</div>
                  {beginnerPrompts.map((pr, i) => (
                    <PromptCard key={`b-${i}`} prompt={pr} accentLight={category.accentLight} accentDark={category.accentDark} />
                  ))}
                </div>
              )}

              {intermediatePrompts.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-yellow-700 bg-yellow-50 dark:bg-yellow-950 dark:text-yellow-400 px-3 py-1.5 rounded-t-lg border border-yellow-200 dark:border-yellow-800">🟡 NÍVEL INTERMEDIÁRIO</div>
                  {intermediatePrompts.map((pr, i) => (
                    <PromptCard key={`m-${i}`} prompt={pr} accentLight={category.accentLight} accentDark={category.accentDark} />
                  ))}
                </div>
              )}

              {advancedPrompts.length > 0 && (
                <div className="mb-4">
                  <div className="text-xs font-bold text-red-700 bg-red-50 dark:bg-red-950 dark:text-red-400 px-3 py-1.5 rounded-t-lg border border-red-200 dark:border-red-800">🔴 NÍVEL AVANÇADO</div>
                  {advancedPrompts.map((pr, i) => (
                    <PromptCard key={`a-${i}`} prompt={pr} accentLight={category.accentLight} accentDark={category.accentDark} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Use Cases */}
          {tool.useCases && tool.useCases.length > 0 && (
            <section>
              <SectionTitle icon="💼">Casos de uso reais</SectionTitle>
              {tool.useCases.map((uc, i) => (
                <div key={i} className="bg-secondary rounded-r-lg p-4 mb-3" style={{ borderLeft: `3px solid ${category.accent}` }}>
                  <div className="text-[13.5px] font-semibold mb-1">💼 {uc.title}</div>
                  <div className="text-[13px] text-muted-foreground leading-relaxed">{uc.text}</div>
                  {uc.result && <div className="mt-2 text-xs font-semibold" style={{ color: category.accent }}>📈 Resultado: {uc.result}</div>}
                </div>
              ))}
            </section>
          )}

          {/* Common Errors */}
          {tool.commonErrors && tool.commonErrors.length > 0 && (
            <section>
              <SectionTitle icon="⚠️">Erros comuns e como evitar</SectionTitle>
              {tool.commonErrors.map((e, i) => (
                <div key={i} className="flex gap-3 mb-3 rounded-lg p-3.5 bg-red-50/50 dark:bg-red-950/20">
                  <span className="text-lg shrink-0">❌</span>
                  <div>
                    <div className="text-[13.5px] font-semibold text-red-600 dark:text-red-400 mb-1">{e.erro}</div>
                    <div className="text-[13px] text-muted-foreground leading-relaxed">✅ {e.fix}</div>
                  </div>
                </div>
              ))}
            </section>
          )}

          {/* Monetization */}
          {tool.monetization && tool.monetization.length > 0 && (
            <section>
              <SectionTitle icon="💰">Formas de monetização</SectionTitle>
              <div className="rounded-xl p-4" style={{ background: `linear-gradient(135deg, ${category.accentLight}, transparent)` }}>
                {tool.monetization.map((m, i) => (
                  <div key={i} className="flex items-start gap-2.5 mb-2.5 last:mb-0">
                    <DollarSign size={14} className="shrink-0 mt-0.5" style={{ color: category.accent }} />
                    <span className="text-[13px] leading-relaxed">{m}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Automations */}
          {tool.automations && tool.automations.length > 0 && (
            <section>
              <SectionTitle icon="⚡">Automações e combinações com outras IAs</SectionTitle>
              <div className="grid gap-2">
                {tool.automations.map((a, i) => (
                  <div key={i} className="flex items-start gap-2.5 bg-secondary rounded-lg p-3">
                    <Zap size={14} className="shrink-0 mt-0.5" style={{ color: category.accent }} />
                    <span className="text-[13px] leading-relaxed">{a}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Image Descriptions */}
          {tool.imageDescriptions && tool.imageDescriptions.length > 0 && (
            <section>
              <SectionTitle icon="🖼️">Imagens do e-book</SectionTitle>
              <div className="grid gap-2">
                {tool.imageDescriptions.map((img, i) => (
                  <div key={i} className="flex items-start gap-2.5 border border-dashed rounded-lg p-3" style={{ borderColor: category.accent + '40' }}>
                    <Image size={14} className="shrink-0 mt-0.5" style={{ color: category.accent }} />
                    <div>
                      <div className="text-[12px] font-semibold mb-0.5">{img.title}</div>
                      <div className="text-[12px] text-muted-foreground leading-relaxed">{img.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Checklist */}
          {tool.checklist && tool.checklist.length > 0 && (
            <section>
              <SectionTitle icon="✅">Checklist final</SectionTitle>
              <div className="rounded-xl border-2 p-4" style={{ borderColor: category.accent + '30' }}>
                {tool.checklist.map((item, i) => (
                  <div key={i} className="flex items-center gap-2.5 mb-2 last:mb-0">
                    <CheckSquare size={14} style={{ color: category.accent }} />
                    <span className="text-[13px]">{item}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pricing */}
          {tool.pricing && (
            <section>
              <SectionTitle icon="💰">Planos e preços</SectionTitle>
              <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${tool.pricing.length}, 1fr)` }}>
                {tool.pricing.map((p, i) => (
                  <div key={i} className="border-2 rounded-xl p-4 text-center relative" style={{ borderColor: p.destaque ? category.accent : 'hsl(var(--border))', background: p.destaque ? category.accentLight : 'hsl(var(--card))' }}>
                    {p.destaque && <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-3 py-0.5 rounded-full text-primary-foreground whitespace-nowrap" style={{ background: category.accent }}>Recomendado</div>}
                    <div className="text-xs font-medium text-muted-foreground mb-1">{p.name}</div>
                    <div className="text-xl font-bold" style={{ color: category.accentDark }}>{p.price}</div>
                    <div className="text-[11px] text-muted-foreground mt-1 mb-3">{p.period}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{p.features.join(' · ')}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <div className="rounded-xl p-8 text-center" style={{ background: `linear-gradient(135deg, ${category.accentDark}, ${category.accent})` }}>
            <div className="text-2xl mb-2">🚀</div>
            <div className="text-base font-semibold text-primary-foreground mb-1">Pronto para começar com {tool.name}?</div>
            <div className="text-[13px] text-primary-foreground/80 mb-4">Acesse agora e comece gratuitamente</div>
            <a href={tool.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-foreground text-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
              Acessar {tool.name} <ExternalLink size={14} />
            </a>
          </div>
        </>)}
        </div>
      </div>
    </div>
  );
}
