import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { serif, sans } from "../fonts";

export const SceneIntro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kicker = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleY = spring({ frame: f - 8, fps, config: { damping: 18 } });
  const titleOpacity = interpolate(f, [8, 28], [0, 1], { extrapolateRight: "clamp" });
  const subY = spring({ frame: f - 28, fps, config: { damping: 20 } });
  const subOpacity = interpolate(f, [28, 50], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 80 }}>
      <div
        style={{
          opacity: kicker,
          fontFamily: sans,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 8,
          fontSize: 18,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 36,
        }}
      >
        · Bem-vindo ao Ecossistema ·
      </div>
      <div
        style={{
          transform: `translateY(${interpolate(titleY, [0, 1], [60, 0])}px)`,
          opacity: titleOpacity,
          fontFamily: serif,
          color: "#fff",
          fontSize: 200,
          lineHeight: 1,
          textAlign: "center",
        }}
      >
        Convert <em style={{ color: "#f59e0b" }}>Club</em>
      </div>
      <div
        style={{
          transform: `translateY(${interpolate(subY, [0, 1], [40, 0])}px)`,
          opacity: subOpacity,
          fontFamily: sans,
          color: "rgba(255,255,255,0.55)",
          fontSize: 28,
          marginTop: 40,
          fontWeight: 400,
        }}
      >
        Tudo que você precisa para escalar seu negócio.
      </div>
    </AbsoluteFill>
  );
};
