import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";

const { fontFamily: fraunces } = loadFraunces("normal", {
  weights: ["500", "600"],
});
const { fontFamily: geist } = loadGeist("normal", {
  weights: ["400", "500", "600"],
});
const { fontFamily: plexMono } = loadPlexMono("normal", {
  weights: ["400", "500"],
});

// Real MailHere brand tokens — see app/globals.css. Registered-mail world:
// ink on paper, a rubber-stamp red for overdue/signature, ochre for
// upcoming, moss for done.
export const C = {
  ink: "#1B2A4A",
  paper: "#FBF8F2",
  paperDeep: "#F0EBDC",
  card: "#FFFFFF",
  stamp: "#C0392B",
  sun: "#D98E2B",
  moss: "#3F6B4A",
  line: "#D8D2C2",
  muted: "#6B6355",
};

export const FONT = {
  display: fraunces,
  sans: geist,
  mono: plexMono,
};
