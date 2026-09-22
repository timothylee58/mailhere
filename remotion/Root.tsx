import { Composition } from "remotion";
import { MailHereDemo, MailHereIntro, MailHereOutro } from "./MailHereDemo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="MailHereDemo"
      component={MailHereDemo}
      durationInFrames={5100}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="MailHereIntro"
      component={MailHereIntro}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="MailHereOutro"
      component={MailHereOutro}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
