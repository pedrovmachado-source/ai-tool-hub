import { AbsoluteFill, useCurrentFrame } from "remotion";

export const Background = () => {
  const f = useCurrentFrame();
  const x1 = Math.sin(f / 80) * 80;
  const y1 = Math.cos(f / 70) * 60;
  const x2 = Math.cos(f / 90) * 100;
  const y2 = Math.sin(f / 60) * 70;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          left: -200 + x1,
          top: -200 + y1,
          background: "rgba(255,255,255,0.06)",
          filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 1000,
          height: 1000,
          borderRadius: "50%",
          right: -200 + x2,
          bottom: -200 + y2,
          background: "rgba(245,158,11,0.10)",
          filter: "blur(140px)",
        }}
      />
      {/* subtle grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          opacity: 0.4,
        }}
      />
    </AbsoluteFill>
  );
};
