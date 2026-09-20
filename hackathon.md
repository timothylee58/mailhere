# Hackathon log

- **Project:** MailHere
- **Event:** Convex All Gas Hackathon
- **What it does:** Compliance inbox for Malaysian MSMEs. Owners forward regulator notices (SSM, LHDN, KWSP, SOCSO) to a dedicated email address; an agent extracts the deadline, agency, and required action, replies in plain language, and tracks it on a live dashboard. The inbox also emails businesses when a newly crawled circular matches their registered category.
- **Live app:** https://healthy-owl-64.convex.site
- **Repo:** https://github.com/timothylee58/mailhere
- **Frontend:** Convex static hosting
- **Convex deployment:** prod `healthy-owl-64` (project `mailhere`, team `timothy-lee-dcf7f`); local anonymous deployment used for dev
- **Components:** AgentMail (`@agentmail/convex`), Firecrawl (`@firecrawl/firecrawl-convex`), static hosting (`@convex-dev/static-hosting`) — all registered in `convex/convex.config.ts`
- **Convex features:** queries, mutations, actions, internal functions, indexes, scheduled crons, HTTP routes (AgentMail webhook), reactive component queries
- **Auth:** Convex Auth, password provider
- **AI models:** gpt-4o-mini (default, configurable via `OPENAI_MODEL`)
- **Started:** 2026-09-18T07:23:43Z
- **Last updated:** 2026-09-20T03:47:03Z

## Log

### 2026-09-18 - working tree
Environment setup for the hackathon. Created the project folder and a fresh
Git repository (moved to `C:\Users\ASUS\MailHere`), installed the 33 official
Convex agent skills globally (`~/.agents/skills/convex-*`), registered the
Convex MCP server at user scope (`npx convex@latest mcp start`, connection
pending Devin restart), installed the convex-hackathon-skill
(`.agents/skills/convex-hackathon-skill/`), and selected Convex static hosting
as the frontend target. Product scope defined: Convex backend with
@agentmail/convex and @firecrawl/firecrawl-convex components, OpenAI
extraction and drafting in actions, Next.js static frontend, Convex Auth.
No application code or deployments yet.

### 2026-09-18 - working tree
Built the full MVP backend and frontend. Backend (`convex/`): schema with
businesses, notices, circulars, notifications, regulatorSources, appSettings;
AgentMail + Firecrawl + static-hosting components registered; inbound email
webhook in `http.ts`; `pipeline.ts` action extracts agency/deadline/action via
OpenAI and sends a plain-language reply through AgentMail; `crawler.ts` crawls
SSM/LHDN/KWSP via Firecrawl, classifies with OpenAI, and emails matching
businesses; `reminders.ts` daily cron emails 7-day deadline reminders. Convex
Auth (password provider) wired; JWT keys generated headlessly and set on the
deployment. Frontend: Next.js 15 static export with Tailwind v4, live
dashboard (notices, circulars, inbox address, deadline badge), business
registration, and a demo panel that pushes a sample notice through the real
pipeline. Verified: `tsc --noEmit` clean, `convex dev --once` push succeeded on
a local anonymous deployment, `next build` static export produced and served.
Not yet run end-to-end: needs OpenAI/AgentMail/Firecrawl API keys.

### 2026-09-19 - commit `initial` on master
Phase upgrades + production deploy. Added multilingual replies — inbound
notices are language-detected (English / Bahasa Malaysia / Mandarin) and the
AgentMail reply is drafted in the same language. Dashboard regrouped into
Overdue / Upcoming / Done columns with a "Mark done" toggle
(`notices.setResolved`, owner-checked mutation) and demo-vs-email source
badges. Sponsor API keys (`OPENAI_API_KEY`, `AGENTMAIL_API_KEY`,
`FIRECRAWL_API_KEY`, `FIRECRAWL_WEBHOOK_SECRET`) set on the deployment via
stdin piping — never printed or committed. Created Convex project `mailhere`
and prod deployment `healthy-owl-64`; set fresh auth keys + `SITE_URL` on
prod; deployed functions with `npx convex deploy` (schema, indexes, components
all applied). Published the Next.js static export through
`@convex-dev/static-hosting` — live at the `convex.site` URL above. Pushed the
initial commit to the public repo above. Remaining: end-to-end smoke test of
real inbound email (needs AgentMail webhook pointed at
`<site>/agentmail/webhook`), submission.

### 2026-09-20 - working tree
UI upgraded to real shadcn/ui (`shadcn init` + `add` for button, card, input,
label, badge, textarea, separator, skeleton; custom success/warning badge
variants kept). Redeployed static hosting — live bundle now uses shadcn
components and Inter. Added Remotion for the submission video:
`remotion/MailHereDemo.tsx` is a 72-second 1080p composition (title → forward
flow → OpenAI extraction → live board → proactive digest → sponsor stack →
URL card), rendered to `video/mailhere-demo.mp4` via `npm run video`.

### 2026-09-20 - 01ffb61
Split the Remotion demo into `video/intro.mp4` (10s title/sponsor bridge) and
`video/outro.mp4` (16s stack/URL card) so the middle of the submission video can
be a real screen recording (`remotion/Root.tsx`, `remotion/MailHereDemo.tsx`,
`package.json`). Verified the inbound webhook path is mounted at
`/agentmail/webhook` on the live site; the handler requires a valid
`AGENTMAIL_WEBHOOK_SECRET` set from the AgentMail dashboard before real inbound
email can be processed. The local key file had `AGENTMAIL_WEBHOOK_SECRET`
concatenated onto the `AGENTMAIL_API_KEY` line, so both values need to be
re-piped to the deployment via `scripts/setEnvKeys.mjs` once the dashboard secret
is available.
