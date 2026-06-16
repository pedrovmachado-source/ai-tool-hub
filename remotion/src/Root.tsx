import { Composition } from "remotion";
import { MainVideo, VIDEO_DURATION } from "./MainVideo";

export const RemotionRoot = () => (
  <Composition
    id="main"
    component={MainVideo}
    durationInFrames={VIDEO_DURATION}
    fps={30}
    width={1920}
    height={1080}
  />
);
