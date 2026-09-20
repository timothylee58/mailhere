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

const fadeUp = (frame: number, fps: number, delay = 0) => ({
  opacity: pop(frame, fps, delay),
  transform: `translateY(${interpolate(pop(frame, fps, delay), [0, 1], [24, 0])}px)`,
});

const Chip = ({ label, color }: { label: string; color: string }) => (
  <span
    style={{
      background: `${color}22`,
      color,
      border: `1px solid ${color}55`,
      borderRadius: 999,
      padding: "4px 14px",
      fontSize: 22,
      fontWeight: 600,
    }}
  >
    {label}
  </span>
);

const Scene = ({ children }: { children: React.ReactNode }) => (
  <AbsoluteFill
    style={{
      background: C.bg,
      fontFamily: FONT,
      color: C.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      padding: 80,
    }}
  >
    {children}
  </AbsoluteFill>
);

const Title = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={fadeUp(f, fps)}>
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            letterSpacing: -3,
            color: "#fff",
          }}
        >
          Mail<span style={{ color: C.primary }}>Here</span>
        </div>
      </div>
      <div style={{ ...fadeUp(f, fps, 12), fontSize: 36, color: C.muted, marginTop: 8 }}>
        The compliance inbox for Malaysian SMEs
      </div>
      <div style={{ ...fadeUp(f, fps, 26), display: "flex", gap: 14, marginTop: 44 }}>
        <Chip label="Convex" color="#f59e0b" />
        <Chip label="OpenAI" color="#10b981" />
        <Chip label="Firecrawl" color="#f97316" />
        <Chip label="AgentMail" color="#818cf8" />
      </div>
    </Scene>
  );
};

const EmailCard = ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div
    style={{
      background: C.card,
      color: C.cardText,
      borderRadius: 16,
      padding: 28,
      width: 860,
      boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
      ...style,
    }}
  >
    {children}
  </div>
);

const EmailRow = ({ k, v, mono }: { k: string; v: string; mono?: boolean }) => (
  <div style={{ display: "flex", gap: 12, fontSize: 21, marginBottom: 6 }}>
    <span style={{ color: "#64748b", width: 90 }}>{k}</span>
    <span style={{ fontFamily: mono ? "monospace" : FONT, fontWeight: 500 }}>{v}</span>
  </div>
);

const ForwardEmail = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={{ ...fadeUp(f, fps), fontSize: 40, fontWeight: 700, marginBottom: 40 }}>
        Forward a regulator notice — that&apos;s it.
      </div>
      <EmailCard style={fadeUp(f, fps, 10)}>
        <EmailRow k="From" v="SSM e-Notification" />
        <EmailRow k="To" v="owner@kedai.com" />
        <EmailRow k="Fwd to" v="inbox@mailhere.agentmail.to" mono />
        <div
          style={{
            marginTop: 16,
            borderTop: "1px solid #e2e8f0",
            paddingTop: 16,
            fontSize: 21,
            color: "#334155",
            lineHeight: 1.55,
          }}
        >
          Reminder: your company&apos;s Annual Return must be lodged within 30
          days. Please submit via the MBRS portal by{" "}
          <b>15 October 2026</b>. Late lodgement compounds may apply under the
          Companies Act 2016.
        </div>
      </EmailCard>
      <div style={{ ...fadeUp(f, fps, 40), marginTop: 36, fontSize: 24, color: C.muted }}>
        SSM · LHDN · KWSP · SOCSO — forward any of them
      </div>
    </Scene>
  );
};

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
        gap: 16,
        alignItems: "baseline",
        marginBottom: 18,
      }}
    >
      <span style={{ color: C.muted, fontSize: 24, width: 190 }}>{label}</span>
      <span style={{ fontSize: 30, fontWeight: 700, color: "#fff" }}>{value}</span>
    </div>
  );
};

const Pipeline = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={{ ...fadeUp(f, fps), fontSize: 40, fontWeight: 700, marginBottom: 14 }}>
        OpenAI reads it like a compliance officer.
      </div>
      <div style={{ ...fadeUp(f, fps, 8), fontSize: 24, color: C.muted, marginBottom: 44 }}>
        Extraction runs in a Convex action on every inbound message
      </div>
      <div
        style={{
          ...fadeUp(f, fps, 15),
          background: C.panel,
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          padding: "40px 48px",
          width: 860,
        }}
      >
        <ExtractRow label="Agency" value="SSM" delay={30} />
        <ExtractRow label="Deadline" value="15 October 2026" delay={45} />
        <ExtractRow label="Required action" value="Lodge annual return via MBRS" delay={60} />
        <ExtractRow label="Summary" value="Annual return due within 30 days of anniversary" delay={75} />
      </div>
    </Scene>
  );
};

const BoardCard = ({ title, meta, color, delay }: { title: string; meta: string; color: string; delay: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(f, fps, delay);
  return (
    <div
      style={{
        opacity: p,
        transform: `scale(${interpolate(p, [0, 1], [0.8, 1])})`,
        background: C.card,
        color: C.cardText,
        borderRadius: 12,
        padding: "16px 18px",
        marginBottom: 14,
        borderLeft: `5px solid ${color}`,
      }}
    >
      <div style={{ fontSize: 20, fontWeight: 700 }}>{title}</div>
      <div style={{ fontSize: 16, color: "#64748b", marginTop: 4 }}>{meta}</div>
    </div>
  );
};

const Column = ({ title, n, children, delay }: { title: string; n: number; children: React.ReactNode; delay: number }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ ...fadeUp(f, fps, delay), flex: 1, background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
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
        <div style={{ fontSize: 40, fontWeight: 700 }}>One live dashboard.</div>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 7,
            background: C.green,
            boxShadow: `0 0 ${18 * glow}px ${C.green}`,
          }}
        />
        <span style={{ fontSize: 22, color: C.green }}>live</span>
      </div>
      <div style={{ display: "flex", gap: 22, width: 1400 }}>
        <Column title="Overdue" n={1} delay={10}>
          <BoardCard title="SOCSO contribution — August" meta="PERKESO · was due 31 Aug" color={C.red} delay={20} />
        </Column>
        <Column title="Upcoming" n={2} delay={25}>
          <BoardCard title="SSM Annual Return" meta="SSM · 15 Oct 2026 · replied ✓" color={C.primary} delay={35} />
          <BoardCard title="KWSP EPF rate update" meta="KWSP · 1 Jan 2027" color={C.amber} delay={50} />
        </Column>
        <Column title="Done" n={1} delay={40}>
          <BoardCard title="LHDN e-invoice onboarding" meta="LHDN · completed" color={C.green} delay={55} />
        </Column>
      </div>
      <div style={{ ...fadeUp(f, fps, 70), marginTop: 36, fontSize: 24, color: C.muted }}>
        Updates stream in over Convex live queries — no refresh, no polling.
      </div>
    </Scene>
  );
};

const Digest = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={{ ...fadeUp(f, fps), fontSize: 40, fontWeight: 700, marginBottom: 40 }}>
        It watches the regulators for you.
      </div>
      <div style={{ display: "flex", gap: 40, alignItems: "center" }}>
        <div style={{ ...fadeUp(f, fps, 15), background: C.panel, border: `1px solid ${C.border}`, borderRadius: 16, padding: 28, width: 560 }}>
          <div style={{ fontSize: 20, color: C.muted, marginBottom: 12 }}>Firecrawl · daily</div>
          <div style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>hasil.gov.my</div>
          <div style={{ fontSize: 20, color: C.green }}>+1 new circular detected</div>
        </div>
        <div style={{ ...fadeUp(f, fps, 45), fontSize: 44, color: C.muted }}>→</div>
        <EmailCard style={{ ...fadeUp(f, fps, 60), width: 640 }}>
          <EmailRow k="From" v="inbox@mailhere.agentmail.to" mono />
          <EmailRow k="Subject" v="[LHDN] New e-Invoicing guideline" />
          <div style={{ marginTop: 12, fontSize: 19, color: "#334155", lineHeight: 1.5 }}>
            A new LHDN publication may affect your business — it matches your
            registered categories.
          </div>
        </EmailCard>
      </div>
      <div style={{ ...fadeUp(f, fps, 90), marginTop: 40, fontSize: 24, color: C.muted }}>
        Deadline reminders go out automatically 7 days before due dates.
      </div>
    </Scene>
  );
};

const Stack = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const items = [
    ["Convex", "live queries · actions · crons · auth", C.amber],
    ["OpenAI", "extraction · classification · drafting", C.green],
    ["Firecrawl", "scheduled regulator crawls", "#f97316"],
    ["AgentMail", "real inbound + outbound email", "#818cf8"],
  ] as const;
  return (
    <Scene>
      <div style={{ ...fadeUp(f, fps), fontSize: 40, fontWeight: 700, marginBottom: 50 }}>
        Real integrations, end to end.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {items.map(([name, desc, color], i) => (
          <div
            key={name}
            style={{
              ...fadeUp(f, fps, 15 + i * 12),
              background: C.panel,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              padding: "26px 34px",
              width: 560,
            }}
          >
            <div style={{ fontSize: 30, fontWeight: 800, color }}>{name}</div>
            <div style={{ fontSize: 20, color: C.muted, marginTop: 6 }}>{desc}</div>
          </div>
        ))}
      </div>
    </Scene>
  );
};

const Outro = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Scene>
      <div style={{ ...fadeUp(f, fps), fontSize: 76, fontWeight: 800, letterSpacing: -2, color: "#fff" }}>
        Mail<span style={{ color: C.primary }}>Here</span>
      </div>
      <div style={{ ...fadeUp(f, fps, 12), fontSize: 30, color: C.muted, marginTop: 18 }}>
        Forward. Understand. Never miss a deadline.
      </div>
      <div style={{ ...fadeUp(f, fps, 30), marginTop: 50, fontSize: 26, fontFamily: "monospace", color: C.green }}>
        healthy-owl-64.convex.site
      </div>
    </Scene>
  );
};

export const MailHereDemo = () => (
  <>
    <Sequence durationInFrames={150}>
      <Title />
    </Sequence>
    <Sequence from={150} durationInFrames={240}>
      <ForwardEmail />
    </Sequence>
    <Sequence from={390} durationInFrames={300}>
      <Pipeline />
    </Sequence>
    <Sequence from={690} durationInFrames={570}>
      <Dashboard />
    </Sequence>
    <Sequence from={1260} durationInFrames={390}>
      <Digest />
    </Sequence>
    <Sequence from={1650} durationInFrames={270}>
      <Stack />
    </Sequence>
    <Sequence from={1920} durationInFrames={240}>
      <Outro />
    </Sequence>
  </>
);
