# Hackathon log

- **Project:** MailHere
- **Event:** Convex All Gas Hackathon
- **What it does:** Compliance inbox for small businesses in Malaysia, the US, the UK, or Singapore. Owners forward regulator notices to a dedicated email address; an agent extracts the deadline, agency, and required action, replies in plain language (in whatever language the notice arrived in), and tracks it on a live dashboard. The inbox also emails businesses when a newly crawled circular matches their registered category. The country/regulator set is a registry (`convex/agencyRegistry.ts`), not hardcoded.
- **Live app:** https://healthy-owl-64.convex.site
- **Repo:** https://github.com/timothylee58/mailhere
- **Frontend:** Convex static hosting
- **Convex deployment:** prod `healthy-owl-64` (project `mailhere`, team `timothy-lee-dcf7f`); local anonymous deployment used for dev
- **Components:** AgentMail (`@agentmail/convex`), Firecrawl (`@firecrawl/firecrawl-convex`), static hosting (`@convex-dev/static-hosting`), Migrations (`@convex-dev/migrations`) — all registered in `convex/convex.config.ts`
- **Convex features:** queries, mutations, actions, internal functions, indexes, scheduled crons, HTTP routes (AgentMail webhook), reactive component queries, batched/resumable data migrations
- **Auth:** Convex Auth, password provider
- **AI models:** gpt-4o-mini (default, configurable via `OPENAI_MODEL`)
- **Started:** 2026-09-18T07:23:43Z
- **Last updated:** 2026-09-22T07:43:50Z

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

### 2026-09-21 - 2f82b7e
Implemented the approved Framer Motion animation plan across the frontend.
Installed `framer-motion` and added shared motion primitives in `lib/motion.ts`
plus a reduced-motion-aware `components/motion-provider.tsx`. Animated the
landing/auth transitions (`app/page.tsx`), dashboard entrance
(`components/dashboard.tsx`), notice board layout with cross-column movement
(`components/notice-list.tsx`), demo button and crawl-spinner feedback
(`components/demo-panel.tsx`, `components/circular-list.tsx`), regulator chip
selection (`components/business-setup.tsx`), and sign-in card transitions
(`components/sign-in-form.tsx`). Also fixed `scripts/setEnvKeys.mjs` (`d43ea1b`)
to target the `healthy-owl-64` production deployment. Verified `npm run typecheck`
and `npm run build` clean; redeployed to the `healthy-owl-64` convex.site
deployment by targeting the prod deployment (`CONVEX_DEPLOYMENT=healthy-owl-64`)
so the new animation bundle is live. Remaining: set `AGENTMAIL_WEBHOOK_SECRET`
from the AgentMail dashboard and run an end-to-end forwarded notice test.

### 2026-09-21 - working tree
Set `AGENTMAIL_WEBHOOK_SECRET` on the `healthy-owl-64` production deployment via
`scripts/setEnvKeys.mjs` (values piped through stdin, never printed). A direct
unsigned POST to `/agentmail/webhook` now returns HTTP 401, confirming the
AgentMail handler is verifying signatures instead of failing on a missing secret.
Next step is a real forwarded regulator notice end-to-end test once the webhook
URL is configured in the AgentMail dashboard.

### 2026-09-21 - working tree
Fixed AgentMail component environment binding in `convex/convex.config.ts`:
declared `AGENTMAIL_API_KEY`, `AGENTMAIL_WEBHOOK_SECRET`, and optional
`AGENTMAIL_BASE_URL` at the app level and passed them into
`app.use(agentmail, { env: ... })`, matching the Firecrawl component pattern.
Updated `convex/http.ts` to register `internal.email.onMessageReceived` via the
`AgentMail` client so inbound webhooks dispatch into the app. Rewrote
`convex/setup.ts` to provision (or reuse) the shared inbox through the AgentMail
REST API directly, with scope detection via `GET /v0/auth/me` so the same code
works with organization-level and inbox-scoped keys. Deployed to prod
`healthy-owl-64` (`tsc` clean). The stored `AGENTMAIL_API_KEY` is rejected by
AgentMail's `/v0/auth/me` endpoint with HTTP 403, so the key value in
`scripts/.env.keys` needs to be verified/replaced with the full, unrevoked key
from console.agentmail.to and re-piped with `node scripts/setEnvKeys.mjs` before
inbox provisioning and end-to-end email flow can succeed.

### 2026-09-22 - af661ea
Patched the published `@agentmail/convex` component: its `convex.config.js`
didn't declare an `env` schema, so `app.use(agentmail, { env })` in
`convex/convex.config.ts` had no real effect on the component. Wired the fix
through `patch-package` (`patches/@agentmail+convex+0.1.0.patch`, `postinstall`
script) so it survives every `npm install` instead of needing a manual
`node_modules` edit.

### 2026-09-22 - 150a49e
Design pass on theme and motion. Replaced the stock shadcn palette/type with a
token system grounded in the product itself — forwarded official mail — plus
one signature motion moment: a postmark stamp that lands on a notice when it's
marked done (`components/postmark-stamp.tsx`, `lib/motion.ts`,
`app/globals.css`, `app/layout.tsx`). Also moved the hackathon skill to
`.claude/skills/convex-hackathon-skill/`, the path Claude Code expects.

### 2026-09-22 - 35ea866
Generalized the compliance model from Malaysia-only to a curated preset per
country (MY, US, UK, SG), on a separate branch so the working submission
stayed untouched during the change. Added `convex/agencyRegistry.ts` as the
single source of truth for countries and their regulators (code, label, crawl
source URL) that both backend and frontend read from; `convex/pipeline.ts`'s
extraction/reply prompts no longer assume Malaysian SMEs or a fixed 3-language
set; `convex/crawler.ts`'s crawl sources are now generated from the registry
across all four countries; the business-registration form gained a country
selector that filters the regulator checklist.

### 2026-09-22 - 55a37e0
Deepened the visual identity with texture rather than new color or motion: a
subtle dot-grid paper background, an ink-tinted card shadow, dashed
ledger-style dividers between the Overdue/Upcoming/Done columns, and a large,
near-invisible postmark watermark behind the landing hero echoing the one
signature element. Verified live against the real dev account, including the
real postmark stamp rendering on an actual notice.

### 2026-09-22 - 9008584 / 604c15b
Merged the multi-country branch into `master` and migrated the real production
data to match: `businesses.country` backfilled, MY-only agency codes remapped
to the registry's country-prefixed codes across businesses/notices/circulars/
regulatorSources, and the renamed registration-number field copied over. Added
`@convex-dev/migrations` and `convex/migrations.ts` for the backfill, rehearsed
on a throwaway deployment seeded from a real production snapshot before
running it against production for real — both runs verified by reading the
migrated rows back. Also picked up a pending fix to `convex/setup.ts` adding
pod-scoped AgentMail API key support to inbox provisioning, and regenerated
the `patch-package` patch from the canonical hand-edited source after a
whitespace mismatch made it fail to apply on a fresh install.

### 2026-09-22 - ae002fb
Added a project README: what the app does, how the extraction/reply/crawl
pipeline works, the tech stack, project structure, required environment
variables, and run/deploy instructions.
