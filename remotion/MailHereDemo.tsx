import {
  AbsoluteFill,
  Sequence,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { C, FONT } from "./theme";

const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200 } });

const fadeUp = (frame: number, fps: number, delay = 0, distance = 24) => ({
  opacity: pop(frame, fps, delay),
  transform: `translateY(${interpolate(pop(frame, fps, delay), [0, 1], [distance, 0])}px)`,
});

const PAPER_GRAIN = {
  backgroundColor: C.paper,
  backgroundImage: `radial-gradient(circle at 1px 1px, ${C.ink}12 1px, transparent 0)`,
  backgroundSize: "26px 26px",
};

const Chip = ({ label, color }: { label: string; color: string }) => (
  <span
    style={{
      background: `${color}1a`,
      color,
      border: `1px solid ${color}55`,
      borderRadius: 999,
      padding: "6px 18px",
      fontSize: 22,
      fontWeight: 600,
      fontFamily: FONT.sans,
    }}
  >
    {label}
  </span>
);

const Scene = ({
  children,
  align = "center",
}: {
  children: React.ReactNode;
  align?: "center" | "flex-start";
}) => (
  <AbsoluteFill
    style={{
      ...PAPER_GRAIN,
      fontFamily: FONT.sans,
      color: C.ink,
      display: "flex",
      alignItems: align,
      justifyContent: "center",
      flexDirection: "column",
      padding: 90,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Wordmark = ({ size = 64 }: { size?: number }) => (
  <div
    style={{
      fontFamily: FONT.display,
      fontStyle: "italic",
      fontWeight: 600,
      fontSize: size,
      color: C.stamp,
      letterSpacing: -1,
    }}
  >
    MailHere
  </div>
);

// The signature motif, redrawn for video at whatever scale a scene needs.
const PostmarkStamp = ({
  size = 160,
  label = "DONE",
  tone = C.moss,
  rotate = -8,
  opacity = 1,
}: {
  size?: number;
  label?: string;
  tone?: string;
  rotate?: number;
  opacity?: number;
}) => (
  <svg
    viewBox="0 0 72 72"
    width={size}
    height={size}
    style={{ transform: `rotate(${rotate}deg)`, opacity }}
  >
    <circle cx="36" cy="36" r="33" fill="none" stroke={tone} strokeWidth="2.2" opacity={0.9} />
    <circle cx="36" cy="36" r="27" fill="none" stroke={tone} strokeWidth="1.1" opacity={0.7} />
    <text
      x="36"
      y="33"
      textAnchor="middle"
      fontSize="9"
      fontFamily={FONT.mono}
      letterSpacing="1"
      fill={tone}
      opacity={0.95}
    >
      {label}
    </text>
    <line x1="18" y1="42" x2="54" y2="42" stroke={tone} strokeWidth="1" opacity={0.6} />
    <text
      x="36"
      y="52"
      textAnchor="middle"
      fontSize="6.5"
      fontFamily={FONT.mono}
      letterSpacing="1"
      fill={tone}
      opacity={0.8}
    >
      MAILHERE
    </text>
  </svg>
);

// ---------- Scene 1: Hook ----------

const Hook = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={fadeUp(f, fps)}>
        <Wordmark size={96} />
      </div>
      <div
        style={{
          ...fadeUp(f, fps, 14),
          fontFamily: FONT.display,
          fontSize: 56,
          fontWeight: 600,
          marginTop: 22,
          maxWidth: 1200,
          textAlign: "center",
          lineHeight: 1.15,
        }}
      >
        Never miss a regulator deadline again.
      </div>
      <div style={{ ...fadeUp(f, fps, 30), marginTop: 30, fontSize: 26, color: C.muted }}>
        A compliance inbox for small businesses — anywhere.
      </div>
    </Scene>
  );
};

// ---------- Scene 2: Problem ----------

const PileRow = ({
  text,
  delay,
  strike,
}: {
  text: string;
  delay: number;
  strike?: boolean;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-24, 0])}px)`,
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 8,
        padding: "14px 22px",
        marginBottom: 12,
        width: 620,
        fontSize: 22,
        color: strike ? C.muted : C.ink,
        textDecoration: strike ? "line-through" : "none",
      }}
    >
      {text}
    </div>
  );
};

const Problem = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div
        style={{
          ...fadeUp(f, fps),
          fontFamily: FONT.display,
          fontSize: 44,
          fontWeight: 600,
          marginBottom: 40,
          textAlign: "center",
        }}
      >
        Regulator mail piles up. Deadlines slip through the cracks.
      </div>
      <PileRow text="Fwd: SSM — Annual Return reminder" delay={16} />
      <PileRow text="Fwd: HMRC — Corporation Tax notice" delay={26} strike />
      <PileRow text="Fwd: IRAS — Filing deadline approaching" delay={36} />
      <div
        style={{
          ...fadeUp(f, fps, 60),
          marginTop: 30,
          fontSize: 26,
          color: C.stamp,
          fontWeight: 600,
        }}
      >
        One missed thread. One real penalty.
      </div>
    </Scene>
  );
};

// ---------- Scene 3: Forward flow ----------

const EmailCard = ({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) => (
  <div
    style={{
      background: C.card,
      color: C.ink,
      borderRadius: 12,
      padding: 30,
      width: 900,
      boxShadow: "0 1px 2px rgba(27,42,74,0.06), 0 20px 50px -20px rgba(27,42,74,0.25)",
      border: `1px solid ${C.line}`,
      ...style,
    }}
  >
    {children}
  </div>
);

const EmailRow = ({ k, v, mono }: { k: string; v: string; mono?: boolean }) => (
  <div style={{ display: "flex", gap: 14, fontSize: 21, marginBottom: 7 }}>
    <span style={{ color: C.muted, width: 90 }}>{k}</span>
    <span style={{ fontFamily: mono ? FONT.mono : FONT.sans, fontWeight: 500 }}>{v}</span>
  </div>
);

const ForwardFlow = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div
        style={{
          ...fadeUp(f, fps),
          fontFamily: FONT.display,
          fontSize: 42,
          fontWeight: 600,
          marginBottom: 40,
        }}
      >
        Forward a regulator notice — that&apos;s it.
      </div>
      <EmailCard style={fadeUp(f, fps, 12)}>
        <EmailRow k="From" v="Companies Registry" />
        <EmailRow k="To" v="owner@yourcompany.com" />
        <EmailRow k="Fwd to" v="yourinbox@agentmail.to" mono />
        <div
          style={{
            marginTop: 18,
            borderTop: `1px solid ${C.line}`,
            paddingTop: 18,
            fontSize: 22,
            color: C.ink,
            lineHeight: 1.55,
          }}
        >
          Reminder: your company&apos;s Annual Return must be lodged within
          30 days. Please submit via the online portal by{" "}
          <b>15 October 2026</b>. Late lodgement penalties may apply.
        </div>
      </EmailCard>
      <div style={{ ...fadeUp(f, fps, 46), marginTop: 40, fontSize: 24, color: C.muted }}>
        Malaysia, the US, the UK, or Singapore — forward any of them.
      </div>
    </Scene>
  );
};

// ---------- Scene 4: Extraction pipeline ----------

const ExtractRow = ({ label, value, delay }: { label: string; value: string; delay: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateX(${interpolate(p, [0, 1], [-30, 0])}px)`,
        display: "flex",
        gap: 18,
        alignItems: "baseline",
        marginBottom: 20,
      }}
    >
      <span style={{ color: C.muted, fontSize: 22, width: 220 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 600, fontFamily: FONT.mono, color: C.ink }}>
        {value}
      </span>
    </div>
  );
};

const Pipeline = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div
        style={{
          ...fadeUp(f, fps),
          fontFamily: FONT.display,
          fontSize: 42,
          fontWeight: 600,
          marginBottom: 14,
        }}
      >
        OpenAI reads it like a compliance officer.
      </div>
      <div style={{ ...fadeUp(f, fps, 8), fontSize: 24, color: C.muted, marginBottom: 46 }}>
        Extraction runs in a Convex action on every inbound message.
      </div>
      <div
        style={{
          ...fadeUp(f, fps, 16),
          background: C.card,
          border: `1px solid ${C.line}`,
          borderRadius: 12,
          padding: "42px 50px",
          width: 900,
          boxShadow: "0 1px 2px rgba(27,42,74,0.06), 0 20px 50px -20px rgba(27,42,74,0.2)",
        }}
      >
        <ExtractRow label="Agency" value="Companies Registry" delay={32} />
        <ExtractRow label="Deadline" value="2026-10-15" delay={48} />
        <ExtractRow label="Required action" value="Lodge annual return" delay={64} />
        <ExtractRow label="Language" value="EN" delay={80} />
      </div>
      <div style={{ ...fadeUp(f, fps, 110), marginTop: 34, fontSize: 24, color: C.muted }}>
        Then it replies — in plain language, in the language it arrived in.
      </div>
    </Scene>
  );
};

// ---------- Scene 5: Dashboard + the stamp ----------

const BoardCard = ({
  title,
  meta,
  color,
  delay,
  done,
}: {
  title: string;
  meta: string;
  color: string;
  delay: number;
  done?: boolean;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay);
  const stampP = done ? pop(f, fps, delay + 30) : 0;
  return (
    <div
      style={{
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.85, 1])})`,
        background: C.card,
        color: C.ink,
        borderRadius: 8,
        padding: "18px 20px",
        marginBottom: 16,
        borderLeft: `5px solid ${color}`,
        position: "relative",
        boxShadow: "0 1px 2px rgba(27,42,74,0.06)",
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: 16, color: C.muted, marginTop: 4 }}>{meta}</div>
      {done && (
        <div
          style={{
            position: "absolute",
            right: 10,
            top: 10,
            opacity: stampP,
            transform: `scale(${interpolate(stampP, [0, 1], [1.7, 1])}) rotate(${interpolate(stampP, [0, 1], [-24, -8])}deg)`,
          }}
        >
          <PostmarkStamp size={64} tone={C.moss} rotate={0} />
        </div>
      )}
    </div>
  );
};

const Column = ({
  title,
  n,
  children,
  delay,
}: {
  title: string;
  n: number;
  children: React.ReactNode;
  delay: number;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div
      style={{
        ...fadeUp(f, fps, delay),
        flex: 1,
        background: `${C.paperDeep}88`,
        border: `1px dashed ${C.line}`,
        borderRadius: 12,
        padding: 22,
      }}
    >
      <div
        style={{
          fontSize: 21,
          fontWeight: 600,
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {title}
        <span style={{ color: C.muted }}>{n}</span>
      </div>
      {children}
    </div>
  );
};

const Dashboard = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const glow = interpolate(f % 60, [0, 30, 60], [0.3, 0.9, 0.3]);
  return (
    <Scene>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40, ...fadeUp(f, fps) }}>
        <div style={{ fontFamily: FONT.display, fontSize: 38, fontWeight: 600 }}>
          One live dashboard.
        </div>
        <span
          style={{
            width: 13,
            height: 13,
            borderRadius: 7,
            background: C.moss,
            boxShadow: `0 0 ${16 * glow}px ${C.moss}`,
          }}
        />
        <span style={{ fontSize: 20, color: C.moss, fontFamily: FONT.mono }}>LIVE</span>
      </div>
      <div style={{ display: "flex", gap: 22, width: 1420 }}>
        <Column title="Overdue" n={1} delay={10}>
          <BoardCard title="SOCSO contribution — August" meta="due 31 Aug" color={C.stamp} delay={22} />
        </Column>
        <Column title="Upcoming" n={1} delay={26}>
          <BoardCard title="KWSP rate update" meta="1 Jan 2027" color={C.sun} delay={38} />
        </Column>
        <Column title="Done" n={1} delay={42}>
          <BoardCard
            title="Annual Return — lodged"
            meta="Companies Registry · replied"
            color={C.moss}
            delay={70}
            done
          />
        </Column>
      </div>
      <div style={{ ...fadeUp(f, fps, 130), marginTop: 34, fontSize: 24, color: C.muted }}>
        A postmark lands the moment a notice is handled — Convex live queries, no refresh.
      </div>
    </Scene>
  );
};

// ---------- Scene 6: Proactive digest ----------

const Digest = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div
        style={{
          ...fadeUp(f, fps),
          fontFamily: FONT.display,
          fontSize: 42,
          fontWeight: 600,
          marginBottom: 40,
        }}
      >
        It watches the regulators for you.
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div
          style={{
            ...fadeUp(f, fps, 15),
            background: C.card,
            border: `1px solid ${C.line}`,
            borderRadius: 12,
            padding: 30,
            width: 560,
          }}
        >
          <div style={{ fontSize: 19, color: C.muted, marginBottom: 12, fontFamily: FONT.mono }}>
            Firecrawl · daily
          </div>
          <div style={{ fontSize: 25, fontWeight: 600, marginBottom: 6 }}>
            gov.uk/companies-house
          </div>
          <div style={{ fontSize: 19, color: C.moss }}>+1 new circular detected</div>
        </div>
        <div style={{ ...fadeUp(f, fps, 45), fontSize: 42, color: C.muted }}>→</div>
        <EmailCard style={{ ...fadeUp(f, fps, 60), width: 660 }}>
          <EmailRow k="From" v="yourinbox@agentmail.to" mono />
          <EmailRow k="Subject" v="[Companies House] New filing guideline" />
          <div style={{ marginTop: 14, fontSize: 19, color: C.ink, lineHeight: 1.5 }}>
            A new publication may affect your business — it matches your
            registered categories.
          </div>
        </EmailCard>
      </div>
      <div style={{ ...fadeUp(f, fps, 90), marginTop: 38, fontSize: 24, color: C.muted }}>
        Deadline reminders go out automatically, 7 days before due dates.
      </div>
    </Scene>
  );
};

// ---------- Scene 7: Multi-country registry ----------

const CountryCard = ({
  country,
  agencies,
  delay,
}: {
  country: string;
  agencies: string[];
  delay: number;
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `translateY(${interpolate(p, [0, 1], [20, 0])}px)`,
        background: C.card,
        border: `1px solid ${C.line}`,
        borderRadius: 12,
        padding: "24px 28px",
        width: 560,
      }}
    >
      <div style={{ fontFamily: FONT.display, fontSize: 26, fontWeight: 600, marginBottom: 10 }}>
        {country}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {agencies.map((a) => (
          <span
            key={a}
            style={{
              fontFamily: FONT.mono,
              fontSize: 15,
              color: C.ink,
              background: `${C.paperDeep}`,
              border: `1px solid ${C.line}`,
              borderRadius: 999,
              padding: "5px 12px",
            }}
          >
            {a}
          </span>
        ))}
      </div>
    </div>
  );
};

const Registry = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div
        style={{
          ...fadeUp(f, fps),
          fontFamily: FONT.display,
          fontSize: 42,
          fontWeight: 600,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        One registry. Any country&apos;s regulators.
      </div>
      <div style={{ ...fadeUp(f, fps, 10), fontSize: 22, color: C.muted, marginBottom: 40 }}>
        Adding a country is a registry entry, not a rewrite.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <CountryCard country="Malaysia" agencies={["SSM", "LHDN", "KWSP", "SOCSO"]} delay={20} />
        <CountryCard country="United States" agencies={["IRS", "SEC"]} delay={32} />
        <CountryCard country="United Kingdom" agencies={["HMRC", "Companies House"]} delay={44} />
        <CountryCard country="Singapore" agencies={["ACRA", "IRAS"]} delay={56} />
      </div>
    </Scene>
  );
};

// ---------- Scene 8: Stack ----------

const Stack = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    ["Convex", "live queries · actions · crons · auth · migrations", C.ink],
    ["OpenAI", "extraction · classification · drafting", C.moss],
    ["Firecrawl", "scheduled regulator crawls", C.sun],
    ["AgentMail", "real inbound + outbound email", C.stamp],
  ] as const;
  return (
    <Scene>
      <div
        style={{
          ...fadeUp(f, fps),
          fontFamily: FONT.display,
          fontSize: 42,
          fontWeight: 600,
          marginBottom: 50,
        }}
      >
        Real integrations, end to end.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {items.map(([name, desc, color], i) => (
          <div
            key={name}
            style={{
              ...fadeUp(f, fps, 15 + i * 12),
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 12,
              padding: "28px 34px",
              width: 560,
            }}
          >
            <div style={{ fontFamily: FONT.display, fontSize: 28, fontWeight: 600, color }}>
              {name}
            </div>
            <div style={{ fontSize: 19, color: C.muted, marginTop: 8 }}>{desc}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

// ---------- Scene 9: Outro ----------

const Outro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={fadeUp(f, fps)}>
        <Wordmark size={80} />
      </div>
      <div style={{ ...fadeUp(f, fps, 12), fontSize: 28, color: C.muted, marginTop: 20 }}>
        Forward. Understand. Never miss a deadline.
      </div>
      <div
        style={{
          ...fadeUp(f, fps, 30),
          marginTop: 46,
          fontSize: 26,
          fontFamily: FONT.mono,
          color: C.moss,
        }}
      >
        healthy-owl-64.convex.site
      </div>
      <div style={{ ...fadeUp(f, fps, 46), marginTop: 30, display: "flex", gap: 12 }}>
        <Chip label="Convex" color={C.ink} />
        <Chip label="OpenAI" color={C.moss} />
        <Chip label="Firecrawl" color={C.sun} />
        <Chip label="AgentMail" color={C.stamp} />
      </div>
    </Scene>
  );
};

// ---------- Full 3-minute composition (30fps, 5400 frames) ----------

export const MailHereDemo = () => (
  <>
    <Sequence durationInFrames={360}>
      <Hook />
    </Sequence>
    <Sequence from={360} durationInFrames={540}>
      <Problem />
    </Sequence>
    <Sequence from={900} durationInFrames={750}>
      <ForwardFlow />
    </Sequence>
    <Sequence from={1650} durationInFrames={750}>
      <Pipeline />
    </Sequence>
    <Sequence from={2400} durationInFrames={1050}>
      <Dashboard />
    </Sequence>
    <Sequence from={3450} durationInFrames={750}>
      <Digest />
    </Sequence>
    <Sequence from={4200} durationInFrames={600}>
      <Registry />
    </Sequence>
    <Sequence from={4800} durationInFrames={450}>
      <Stack />
    </Sequence>
    <Sequence from={5250} durationInFrames={150}>
      <Outro />
    </Sequence>
  </>
);

// Shorter cuts kept for reuse (e.g. social teasers).
export const MailHereIntro = () => (
  <>
    <Sequence durationInFrames={360}>
      <Hook />
    </Sequence>
    <Sequence from={360} durationInFrames={540}>
      <Problem />
    </Sequence>
  </>
);

export const MailHereOutro = () => (
  <>
    <Sequence durationInFrames={450}>
      <Stack />
    </Sequence>
    <Sequence from={450} durationInFrames={150}>
      <Outro />
    </Sequence>
  </>
);
