import { Composition } from "remotion";
import { MailHereDemo, MailHereIntro, MailHereOutro } from "./MailHereDemo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="MailHereDemo"
      component={MailHereDemo}
      durationInFrames={2160}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="MailHereIntro"
      component={MailHereIntro}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="MailHereOutro"
      component={MailHereOutro}
      durationInFrames={480}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
