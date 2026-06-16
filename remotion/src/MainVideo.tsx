import { AbsoluteFill } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Background } from "./components/Background";
import { SceneIntro } from "./scenes/SceneIntro";
import { SceneFeature } from "./scenes/SceneFeature";
import { SceneOutro } from "./scenes/SceneOutro";

const SCENE = 110;
const TRANSITION = 18;
// 7 scenes: 7 * 110 = 770, minus 6 transition overlaps (6 * 18 = 108) = 662
export const VIDEO_DURATION = 7 * SCENE - 6 * TRANSITION;

const transition = (
  <TransitionSeries.Transition
    presentation={fade()}
    timing={linearTiming({ durationInFrames: TRANSITION })}
  />
);

export const MainVideo = () => (
  <AbsoluteFill>
    <Background />
    <TransitionSeries>
      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneIntro />
      </TransitionSeries.Sequence>
      {transition}

      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneFeature
          number="01"
          kicker="Ferramentas de IA"
          title="O arsenal completo."
          description="Centenas de IAs, prompts e utilitários organizados para você produzir mais rápido e com mais qualidade."
          highlights={["Curadoria semanal", "Prompts prontos", "Categorias por nicho"]}
        />
      </TransitionSeries.Sequence>
      {transition}

      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneFeature
          number="02"
          kicker="Ofertas Validadas"
          title="Produtos que já vendem."
          description="Infoprodutos e ofertas minerados pela nossa equipe, com alto potencial de escala e prontos para modelar."
          highlights={["Mineração ativa", "Análise de oferta", "Modelagem rápida"]}
        />
      </TransitionSeries.Sequence>
      {transition}

      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneFeature
          number="03"
          kicker="Área do Mentorado"
          title="Aulas e mentorias ao vivo."
          description="Gravações, transcrições, materiais de apoio e mentorias exclusivas para quem quer escalar de verdade."
          highlights={["Aulas gravadas", "Transcrições em PDF", "Comunidade elite"]}
        />
      </TransitionSeries.Sequence>
      {transition}

      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneFeature
          number="04"
          kicker="Criativo & Copy"
          title="Anúncios que convertem."
          description="Criativos validados para parar o scroll e copies de alta conversão prontas para suas campanhas."
          highlights={["Criativos prontos", "Copywriting premium", "Headlines testadas"]}
        />
      </TransitionSeries.Sequence>
      {transition}

      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneFeature
          number="05"
          kicker="Estrutura & Tráfego"
          title="Sites, contas e funis."
          description="Landing pages, quizzes, contas de Facebook Ads e BMs prontas para você rodar sem fricção."
          highlights={["Contas FB Ads", "Landing pages", "Funis prontos"]}
        />
      </TransitionSeries.Sequence>
      {transition}

      <TransitionSeries.Sequence durationInFrames={SCENE}>
        <SceneOutro />
      </TransitionSeries.Sequence>
    </TransitionSeries>
  </AbsoluteFill>
);
