# Hackathon log

- **Project:** MailHere
- **Event:** Convex All Gas Hackathon
- **What it does:** Compliance inbox for Malaysian MSMEs. Owners forward regulator notices (SSM, LHDN, KWSP, SOCSO) to a dedicated email address; an agent extracts the deadline, agency, and required action, replies in plain language, and tracks it on a live dashboard. The inbox also emails businesses when a newly crawled circular matches their registered category.
- **Live app:** not deployed
- **Repo:** none
- **Frontend:** Convex static hosting
- **Convex deployment:** local anonymous dev deployment; production not deployed
- **Components:** AgentMail (`@agentmail/convex`), Firecrawl (`@firecrawl/firecrawl-convex`), static hosting (`@convex-dev/static-hosting`) — all registered in `convex/convex.config.ts`
- **Convex features:** queries, mutations, actions, internal functions, indexes, scheduled crons, HTTP routes (AgentMail webhook), reactive component queries
- **Auth:** Convex Auth, password provider
- **AI models:** gpt-4o-mini (default, configurable via `OPENAI_MODEL`)
- **Started:** 2026-09-18T07:23:43Z
- **Last updated:** 2026-09-18T18:00:00Z

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
