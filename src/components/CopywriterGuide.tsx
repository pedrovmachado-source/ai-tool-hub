import { useState } from 'react';
import { ArrowLeft, Check, FileCheck2, Layers3, PenLine, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';

type CopySection = 'humanizada' | 'angulo-formato' | 'validacao';

const copySections = [
  { id: 'humanizada' as const, label: 'Copy Humanizada', icon: PenLine },
  { id: 'angulo-formato' as const, label: 'Copy, Ângulo e Formato', icon: Layers3 },
  { id: 'validacao' as const, label: 'Validação prática', icon: FileCheck2 },
];

const sections = [
  {
    title: '1. Primeiro: use a IA como rascunho, não como copy final',
    paragraphs: [
      'O método mostrado no vídeo começa com a utilização do ChatGPT para estruturar a copy.',
      'O processo é:',
    ],
    bullets: [
      'Você ensina à IA uma estrutura de copy.',
      'Mostra exemplos de copies que você mesmo escreveu.',
      'Explica como aquela estrutura funciona.',
      'Pede para a IA criar uma nova copy seguindo aquela estrutura.',
      'Recebe o primeiro rascunho.',
      'Não publica imediatamente.',
      'Você começa a reescrever manualmente.',
    ],
    highlight: 'IA → estrutura/ideias → humano → refinamento → copy final',
    after: 'O próprio autor deixa claro que não é contra IA. Ele considera a ferramenta excelente para ideias, estruturas e primeiros rascunhos. O problema começa quando o copywriter simplesmente aceita o texto gerado como se estivesse pronto.',
  },
  {
    title: '2. A estrutura utilizada: BALACLAVA',
    paragraphs: ['Na transcrição, a estrutura apresentada é:'],
    definitions: [
      ['B — Gancho', 'Chamar atenção e quebrar o padrão.'],
      ['A — Exposição', 'Mostrar a situação/problema que a pessoa vive.'],
      ['L — Realidade', 'Apresentar uma percepção, verdade ou mudança de perspectiva.'],
      ['Solução/conclusão', 'Conectar essa nova percepção ao mecanismo/produto e apresentar o próximo passo.'],
    ],
    highlight: 'GANCHO → EXPOSIÇÃO → REALIDADE → SOLUÇÃO → CTA',
    after: 'Essa estrutura serve como o esqueleto. Mas o ponto mais importante do vídeo é: ter uma estrutura correta não significa ter uma copy boa. A IA consegue seguir a estrutura e ainda produzir um texto artificial, genérico ou pouco convincente.',
  },
  {
    title: '3. O primeiro grande princípio: a IA escreve algo que "parece certo"',
    paragraphs: [
      'Esse é um dos conceitos mais importantes da transcrição.',
      'O autor diz que a IA é muito boa em fazer você olhar para uma copy e pensar: “Está decente.” Só que “estar correto” não significa necessariamente conectar.',
      'A IA tende a produzir frases que parecem bem escritas, possuem lógica, seguem a estrutura, explicam o problema, utilizam palavras de copywriting e parecem profissionais.',
      'Porém, podem faltar naturalidade, intensidade, especificidade, linguagem cotidiana, sensação, personalidade, imagens mentais, ritmo e espontaneidade.',
    ],
    highlight: 'A diferença está entre uma copy que explica uma situação e uma copy que faz a pessoa pensar: “Caralho, parece que ele está falando de mim.”',
  },
  {
    title: '4. O que significa “humanizar” uma copy?',
    paragraphs: [
      'Humanizar não significa simplesmente colocar gírias.',
      'O processo mostrado consiste em reescrever a maneira como a pessoa realmente pensaria, falaria e sentiria aquela situação.',
      'Você pega: “Você decide comer só um prato pequeno, mas quando vê, está repetindo.” E pergunta: como essa pessoa realmente vivenciaria isso?',
      'Em vez de apenas descrever: “Você come um prato pequeno e depois repete.” Você pode aumentar a sensação: “Toda hora que você tenta emagrecer, parece que sua fome aumenta 10 vezes mais só por causa disso.”',
      'A segunda versão não necessariamente traz uma informação completamente diferente. O que muda é a experiência transmitida. O autor inclusive destaca que a segunda versão parece estar “vivendo dentro do corpo da pessoa”.',
    ],
  },
  {
    title: '5. Técnica nº 1 — Troque frases “certinhas” por frases que uma pessoa realmente falaria',
    paragraphs: [
      'Um dos problemas encontrados na copy de IA foi: “Você engorda porque sua fome não tem botão de desligar.”',
      'O autor considera essa frase estranha porque ela cria uma contradição com a frase anterior e utiliza uma metáfora pouco natural.',
      'A primeira coisa a fazer é perguntar: “Uma pessoa realmente falaria isso?” Não: “A frase parece inteligente?” Mas: “Eu ouviria alguém falando isso em uma conversa?”',
    ],
    subheading: 'Teste da conversa',
    after: 'Leia sua copy em voz alta. Se parecer que um robô escreveu, um professor está dando aula, um anúncio corporativo está falando ou alguém está tentando parecer inteligente, reescreva.',
  },
  {
    title: '6. Técnica nº 2 — Simplifique',
    paragraphs: [
      'Outro problema recorrente na copy gerada foi o excesso de palavras.',
      'Por exemplo, a IA escreveu uma ideia equivalente a: “Esse apetite incontrolável faz o seu corpo pedir comida mesmo quando não precisa.”',
      'O autor simplifica para algo como: “É essa fome que te faz errar toda hora.”',
      'Isso é muito importante. A copy não precisa demonstrar que você conhece palavras sofisticadas. Ela precisa ser fácil de consumir.',
    ],
    highlight: 'Regra prática: se você consegue transmitir a mesma ideia com 12 palavras em vez de 25, teste as 12.',
    after: 'Não significa transformar tudo em frases curtas. Significa eliminar gordura verbal.',
  },
  {
    title: '7. Técnica nº 3 — Troque abstração por algo palpável',
    paragraphs: [
      'Esse talvez seja um dos princípios mais importantes da transcrição.',
      'Compare: “Você não tem força de vontade.” com: “Você nunca vai conquistar o corpo que deseja.”',
      'O segundo é mais concreto para a pessoa porque cria uma imagem de um resultado desejado. A pergunta que você deve fazer é: “A pessoa consegue visualizar isso?”',
      'Palavras abstratas como disciplina, força de vontade, controle, mudança, transformação, liberdade e resultado não são necessariamente ruins. Mas, isoladas, podem ser genéricas.',
      'Você pode transformá-las em experiências concretas. Abstrato: “Você precisa ter mais disciplina.” Palpável: “Você promete que hoje vai comer direito. Aí chega a noite e está atacando a geladeira.”',
      'A segunda frase cria uma cena.',
    ],
  },
  {
    title: '8. Técnica nº 4 — Faça a pessoa se enxergar na situação',
    paragraphs: [
      'A exposição da copy precisa representar momentos que o público reconhece.',
      'Na versão inicial aparecem situações como comer um prato, repetir, comer chocolate, sentir culpa e pensar que não tem disciplina.',
      'O conceito é bom. O problema é que a execução pode parecer uma descrição genérica. Para humanizar, você precisa entrar mais profundamente na experiência.',
    ],
    bullets: [
      'O que essa pessoa pensa nesse momento?',
      'O que ela fala para si mesma?',
      'O que ela faz escondido?',
      'Qual é o pequeno comportamento que ninguém percebe?',
      'O que acontece às 23h?',
      'O que ela sente depois?',
    ],
    after: 'É aí que a copy começa a ganhar vida.',
  },
  {
    title: '9. Técnica nº 5 — Use intensidade quando ela fizer sentido',
    paragraphs: [
      'O autor aumenta a intensidade da exposição: “Toda hora que você tenta emagrecer, parece que sua fome aumenta 10 vezes mais...”',
      'Isso transmite uma sensação muito mais forte do que: “Você decide comer um prato pequeno, mas acaba repetindo.” O objetivo é fazer a pessoa sentir a situação.',
    ],
    highlight: 'Intensidade ≠ exagero aleatório',
    after: 'Você não deve colocar: “Sua fome é literalmente um monstro intergaláctico devorando sua alma.” Isso pode chamar atenção, mas pode destruir credibilidade. A intensidade precisa parecer compatível com como o público realmente descreve aquela experiência.',
  },
  {
    title: '10. Técnica nº 6 — Use linguagem cotidiana',
    paragraphs: [
      'Na transcrição, o autor critica expressões como: “o estômago gritando o dia inteiro.” A crítica dele é baseada na naturalidade: ninguém fala normalmente dessa maneira.',
      'Ele prefere algo mais próximo de: “o estômago implorando por comida.”',
    ],
    highlight: 'Escreva como o público fala. Não necessariamente como você gostaria que o público falasse.',
    after: 'Isso significa pesquisar comentários, reviews, grupos, WhatsApp, Reddit, Instagram, TikTok, avaliações de produtos, reclamações e conversas reais — e capturar as palavras que as próprias pessoas usam.',
  },
  {
    title: '11. Técnica nº 7 — Não tente “parecer copywriter”',
    paragraphs: [
      'Esse é um erro comum. O copywriter sabe que está escrevendo uma copy. O consumidor não deveria sentir isso.',
      'Frases como “Isso vai mudar o jogo”, “Você finalmente terá liberdade”, “Chegou a hora da transformação” e “Descubra o segredo” podem funcionar em determinados contextos, mas são facilmente percebidas como linguagem publicitária quando usadas sem contexto.',
      'O objetivo é reduzir a sensação de “estão tentando me vender alguma coisa” e aumentar: “essa pessoa entende exatamente o que eu passo.”',
    ],
  },
  {
    title: '12. Técnica nº 8 — Crie frases com ritmo',
    paragraphs: ['Uma copy humanizada não precisa ter todas as frases do mesmo tamanho. Você pode alternar frase longa, frase curta, uma pergunta e outra frase curta. Isso cria ritmo de conversa.'],
    highlight: 'Você tenta fazer dieta.\nAguenta dois dias.\nNo terceiro, a fome bate.\nE aí já era.',
    after: 'Perceba que não é apenas a informação. É o ritmo da leitura.',
  },
  {
    title: '13. Técnica nº 9 — Evite explicar demais',
    paragraphs: [
      'A IA frequentemente tenta completar o raciocínio. Isso pode gerar parágrafos grandes e excessivamente explicativos.',
      'O autor demonstra isso diversas vezes ao comparar uma versão extensa da IA com uma versão reduzida manualmente.',
    ],
    highlight: 'Não explique aquilo que o leitor já consegue entender.',
    after: 'Se você escreve: “Você está com fome porque seu corpo está sinalizando fisiologicamente uma necessidade de ingestão alimentar...”, provavelmente está explicando demais para uma copy. Você poderia dizer: “A fome bateu. E você sabe o que acontece depois.” Menos explicação. Mais comunicação.',
  },
  {
    title: '14. Técnica nº 10 — Use o mecanismo para conectar a realidade ao produto',
    paragraphs: [
      'Na etapa da solução, o autor mostra uma mudança importante.',
      'Em vez de simplesmente dizer: “O produto reduz o apetite, aumenta a saciedade...”, ele tenta criar uma comparação que torne o mecanismo mais compreensível.',
      'Na transcrição, ele utiliza a referência a “canetinhas de farmácia” como uma maneira de tornar a ideia mais palpável.',
    ],
    highlight: 'Como posso explicar o mecanismo de uma maneira que a pessoa já consiga entender?',
    after: 'Você pode utilizar analogias, comparações, situações conhecidas, exemplos e metáforas simples. Mas a comparação precisa ser compreensível e coerente com o produto.',
  },
];

const transformation = [
  ['ETAPA 1 — Gere', 'Peça para a IA criar uma primeira versão seguindo a estrutura.'],
  ['ETAPA 2 — Leia criticamente', 'Não aceite a primeira versão. Procure: genérico, estranho, artificial, longo, abstrato, pouco palpável, frases de efeito, contradições e linguagem que ninguém usa.'],
  ['ETAPA 3 — Marque as partes ruins', 'Pegue cada frase e pergunte: “Eu falaria isso?”, “Meu público falaria isso?”, “Isso parece uma conversa?”, “Consigo visualizar essa situação?” e “Isso gera alguma sensação?”'],
  ['ETAPA 4 — Reescreva manualmente', 'Não apenas peça: “ChatGPT, humanize essa copy.” O autor enfatiza que esse processo deve ser feito pela mão humana, porque outro prompt pode gerar outra versão igualmente artificial.'],
  ['ETAPA 5 — Simplifique', 'Corte palavras desnecessárias.'],
  ['ETAPA 6 — Torne palpável', 'Troque conceitos abstratos por situações concretas.'],
  ['ETAPA 7 — Aumente a sensação', 'Faça o leitor sentir que você conhece aquela experiência.'],
  ['ETAPA 8 — Leia em voz alta', 'Se não parecer uma conversa, reescreva.'],
  ['ETAPA 9 — Conecte ao mecanismo', 'Mostre como o mecanismo/produto resolve especificamente o problema apresentado.'],
  ['ETAPA 10 — CTA', 'Faça o próximo passo parecer uma continuação natural da história.'],
];

const checklist = [
  ['Naturalidade', ['Eu realmente falaria isso?', 'Meu público falaria isso?', 'Parece conversa ou anúncio?']],
  ['Especificidade', ['Estou falando de uma situação específica?', 'A pessoa consegue imaginar a cena?', 'Estou descrevendo comportamentos reais?']],
  ['Palpabilidade', ['Existe uma imagem mental?', 'Estou usando conceitos concretos?', 'Posso substituir alguma abstração por uma situação?']],
  ['Emoção', ['A pessoa sente alguma coisa?', 'Existe identificação?', 'A situação parece familiar?']],
  ['Simplicidade', ['Posso cortar palavras?', 'Alguma frase está tentando parecer inteligente?', 'Existe explicação desnecessária?']],
  ['Conversação', ['Se eu ler em voz alta, parece natural?', 'Tem ritmo?', 'As frases possuem variação?', 'Parece que alguém está falando comigo?']],
  ['Persuasão', ['O gancho cria curiosidade?', 'A exposição mostra um problema real?', 'A realidade muda a percepção?', 'O produto aparece como consequência lógica?', 'O CTA faz sentido depois de tudo que foi apresentado?']],
] as const;

export default function CopywriterGuide({ onBack }: { onBack: () => void }) {
  const [activeSection, setActiveSection] = useState<CopySection>('humanizada');

  return (
    <main className="min-h-screen bg-black text-white selection:bg-brand-blue/30">
      <header className="border-b border-white/[0.08] px-5 pb-16 pt-28 sm:px-8 sm:pb-24 sm:pt-36">
        <div className="mx-auto max-w-4xl">
          <Button variant="outline" size="sm" onClick={onBack} className="mb-12 gap-2 rounded-full border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/10 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar ao menu
          </Button>
          <div className="mb-6 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">
            <PenLine className="h-4 w-4" /> Guia prático de copywriting
          </div>
          <h1 className="max-w-3xl font-serif-display text-4xl leading-tight sm:text-6xl">Como construir uma copy <em className="font-normal text-brand-blue-medium">humanizada</em></h1>
          <p className="mt-8 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">A transcrição apresenta um método prático para pegar uma copy gerada por IA e transformá-la em uma copy mais humana, natural, palpável e conectada com a experiência real do público. O ponto central é: a IA pode ajudar a criar o rascunho e a estrutura, mas a humanização precisa passar pelo olhar e pela escrita do copywriter.</p>
        </div>
      </header>

      <nav aria-label="Seções de copywriting" className="border-b border-white/[0.08] bg-white/[0.02] px-5 py-5 sm:px-8">
        <div className="mx-auto grid max-w-4xl gap-2 sm:grid-cols-3">
          {copySections.map(({ id, label, icon: Icon }) => {
            const isActive = activeSection === id;
            return (
              <Button
                key={id}
                type="button"
                variant="outline"
                aria-pressed={isActive}
                onClick={() => setActiveSection(id)}
                className={`h-auto min-h-12 justify-start gap-3 rounded-lg px-4 py-3 text-left whitespace-normal transition-colors sm:justify-center ${
                  isActive
                    ? 'border-brand-blue bg-brand-blue/20 text-white hover:bg-brand-blue/25 hover:text-white'
                    : 'border-white/10 bg-white/[0.03] text-white/55 hover:border-white/20 hover:bg-white/[0.07] hover:text-white'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-brand-blue-medium' : ''}`} />
                <span>{label}</span>
              </Button>
            );
          })}
        </div>
      </nav>

      {activeSection === 'humanizada' ? (
      <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <h2 className="mb-12 font-serif-display text-3xl sm:text-4xl">Guia detalhado</h2>
        <div className="space-y-16">
          {sections.map((section) => (
            <section key={section.title} className="border-l-2 border-brand-blue/50 pl-5 sm:pl-8">
              <h2 className="font-serif-display text-2xl leading-snug sm:text-3xl">{section.title}</h2>
              <div className="mt-6 space-y-4 text-[15px] leading-8 text-white/65 sm:text-base">
                {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.bullets && <ul className="space-y-2">{section.bullets.map((item) => <li key={item} className="flex gap-3"><Check className="mt-1.5 h-4 w-4 shrink-0 text-brand-teal" /><span>{item}</span></li>)}</ul>}
                {section.definitions && <div className="grid gap-3 sm:grid-cols-2">{section.definitions.map(([term, detail]) => <div key={term} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-4"><strong className="text-white">{term}</strong><p className="mt-1 text-sm leading-6">{detail}</p></div>)}</div>}
                {section.subheading && <h3 className="pt-2 text-lg font-semibold text-white">{section.subheading}</h3>}
                {section.highlight && <blockquote className="my-6 whitespace-pre-line rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-5 font-medium leading-7 text-white/90"><Quote className="mb-3 h-4 w-4 text-brand-blue-medium" />{section.highlight}</blockquote>}
                {section.after && <p>{section.after}</p>}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-24 border-t border-white/10 pt-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">15. A transformação completa</p>
          <h2 className="mt-3 font-serif-display text-3xl sm:text-4xl">Do rascunho à copy final</h2>
          <p className="mt-5 text-white/60">O processo mostrado no vídeo pode ser resumido assim:</p>
          <div className="mt-10 space-y-0">
            {transformation.map(([title, text], index) => (
              <div key={title} className="relative grid gap-3 border-l border-white/10 pb-9 pl-8 sm:grid-cols-[12rem_1fr] sm:gap-8">
                <span className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue text-xs font-bold text-white">{index + 1}</span>
                <h3 className="font-semibold text-white">{title}</h3><p className="leading-7 text-white/55">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-20">
          <h2 className="font-serif-display text-3xl sm:text-4xl">Checklist definitivo para humanizar uma copy</h2>
          <p className="mt-4 text-white/55">Antes de publicar, passe cada trecho por estas perguntas:</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {checklist.map(([title, items]) => (
              <article key={title} className="rounded-lg border border-white/[0.08] bg-white/[0.03] p-6">
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-white/55">{items.map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-brand-teal" />{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-lg border border-brand-blue/30 bg-brand-blue/10 p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-blue-medium">O princípio central da aula</p>
          <h2 className="mt-5 font-serif-display text-2xl leading-snug sm:text-4xl">Não tente fazer a IA escrever como um humano. Use a IA para chegar até uma boa matéria-prima e depois escreva como um humano.</h2>
          <p className="mt-6 leading-8 text-white/65">A IA fornece velocidade e estrutura. Você fornece: experiência + percepção + linguagem + contexto + julgamento + emoção.</p>
          <p className="mt-4 leading-8 text-white/65">É justamente essa etapa manual que, segundo o autor, transforma uma copy “correta” em uma copy que parece ter sido escrita por alguém que realmente conhece aquela pessoa e o problema que ela vive.</p>
        </section>

        <section className="mt-10 rounded-lg border border-white/10 bg-white/[0.03] p-7 sm:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Fórmula prática para guardar</p>
          <h2 className="mt-4 font-serif-display text-3xl">COPY HUMANIZADA =</h2>
          <p className="mt-6 whitespace-pre-line font-medium leading-8 text-white/75">{`Estrutura da IA\n+ linguagem do público\n+ situações específicas\n+ sensação\n+ simplicidade\n+ ritmo de conversa\n+ especificidade\n− frases genéricas\n− palavras desnecessárias\n− “frases de copywriter”\n− explicações excessivas`}</p>
          <p className="mt-8 border-t border-white/10 pt-6 leading-8 text-white/60">E o ponto mais importante: não confunda “copy bonita” com “copy humana”. Uma copy pode estar gramaticalmente perfeita, estruturada e lógica e ainda assim não fazer o leitor sentir absolutamente nada.</p>
        </section>
      </div>
      ) : (
        <div className="mx-auto flex min-h-[420px] max-w-4xl items-center px-5 py-16 sm:px-8 sm:py-24">
          <section className="w-full rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center sm:p-14">
            {activeSection === 'angulo-formato' ? (
              <Layers3 className="mx-auto h-8 w-8 text-brand-blue-medium" />
            ) : (
              <FileCheck2 className="mx-auto h-8 w-8 text-brand-teal" />
            )}
            <h2 className="mt-5 font-serif-display text-3xl text-white sm:text-4xl">
              {activeSection === 'angulo-formato' ? 'Copy, Ângulo e Formato' : 'Validação prática'}
            </h2>
            <p className="mx-auto mt-4 max-w-lg leading-7 text-white/55">O conteúdo desta seção será adicionado em breve.</p>
          </section>
        </div>
      )}
    </main>
  );
}
