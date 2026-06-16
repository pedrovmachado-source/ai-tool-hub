import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { serif, sans } from "../fonts";

type Props = {
  number: string;
  kicker: string;
  title: string;
  description: string;
  highlights: string[];
};

export const SceneFeature = ({ number, kicker, title, description, highlights }: Props) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const numS = spring({ frame: f, fps, config: { damping: 14 } });
  const kickerO = interpolate(f, [6, 22], [0, 1], { extrapolateRight: "clamp" });
  const titleS = spring({ frame: f - 10, fps, config: { damping: 18 } });
  const titleO = interpolate(f, [10, 32], [0, 1], { extrapolateRight: "clamp" });
  const descO = interpolate(f, [28, 48], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "120px 140px", justifyContent: "center" }}>
      <div style={{ display: "flex", gap: 80, alignItems: "flex-start" }}>
        <div
          style={{
            fontFamily: serif,
            fontSize: 240,
            color: "rgba(245,158,11,0.85)",
            lineHeight: 0.9,
            transform: `translateY(${interpolate(numS, [0, 1], [40, 0])}px) scale(${interpolate(numS, [0, 1], [0.85, 1])})`,
            opacity: numS,
          }}
        >
          {number}
        </div>

        <div style={{ flex: 1, paddingTop: 30 }}>
          <div
            style={{
              opacity: kickerO,
              fontFamily: sans,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              letterSpacing: 6,
              fontSize: 16,
              textTransform: "uppercase",
              marginBottom: 28,
            }}
          >
            {kicker}
          </div>
          <div
            style={{
              transform: `translateX(${interpolate(titleS, [0, 1], [-50, 0])}px)`,
              opacity: titleO,
              fontFamily: serif,
              color: "#fff",
              fontSize: 110,
              lineHeight: 1.05,
              marginBottom: 36,
            }}
          >
            {title}
          </div>
          <div
            style={{
              opacity: descO,
              fontFamily: sans,
              color: "rgba(255,255,255,0.55)",
              fontSize: 30,
              lineHeight: 1.4,
              maxWidth: 1000,
              fontWeight: 400,
              marginBottom: 50,
            }}
          >
            {description}
          </div>

          <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
            {highlights.map((h, i) => {
              const tagS = spring({ frame: f - (45 + i * 6), fps, config: { damping: 18 } });
              return (
                <div
                  key={h}
                  style={{
                    opacity: tagS,
                    transform: `translateY(${interpolate(tagS, [0, 1], [20, 0])}px)`,
                    fontFamily: sans,
                    fontSize: 18,
                    fontWeight: 500,
                    color: "rgba(255,255,255,0.85)",
                    padding: "12px 22px",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.04)",
                  }}
                >
                  {h}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
