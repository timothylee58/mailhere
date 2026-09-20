import { Composition } from "remotion";
import { MailHereDemo } from "./MailHereDemo";

export const RemotionRoot = () => (
  <Composition
    id="MailHereDemo"
    component={MailHereDemo}
    durationInFrames={2160}
    fps={30}
    width={1920}
    height={1080}
  />
);
