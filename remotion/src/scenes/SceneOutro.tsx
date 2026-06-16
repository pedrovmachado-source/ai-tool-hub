import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { serif, sans } from "../fonts";

export const SceneOutro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const kicker = interpolate(f, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const titleS = spring({ frame: f - 10, fps, config: { damping: 16 } });
  const subO = interpolate(f, [30, 55], [0, 1], { extrapolateRight: "clamp" });
  const lineW = interpolate(f, [40, 80], [0, 600], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div
        style={{
          opacity: kicker,
          fontFamily: sans,
          color: "rgba(245,158,11,0.9)",
          letterSpacing: 8,
          fontSize: 18,
          textTransform: "uppercase",
          fontWeight: 700,
          marginBottom: 36,
        }}
      >
        Sua jornada começa agora
      </div>
      <div
        style={{
          fontFamily: serif,
          color: "#fff",
          fontSize: 160,
          textAlign: "center",
          lineHeight: 1,
          transform: `translateY(${interpolate(titleS, [0, 1], [40, 0])}px)`,
          opacity: titleS,
        }}
      >
        Bem-vindo <em style={{ color: "#f59e0b" }}>ao clube.</em>
      </div>
      <div style={{ height: 2, background: "rgba(255,255,255,0.2)", width: lineW, marginTop: 50 }} />
      <div
        style={{
          opacity: subO,
          fontFamily: sans,
          color: "rgba(255,255,255,0.45)",
          fontSize: 24,
          marginTop: 40,
          fontWeight: 400,
        }}
      >
        Explore o menu e descubra cada vertical.
      </div>
    </AbsoluteFill>
  );
};
