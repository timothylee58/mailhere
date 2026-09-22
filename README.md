# MailHere

A compliance inbox for small businesses. Forward a notice from your tax
office, companies registry, or social security authority to a dedicated
inbox address, and MailHere extracts the deadline and required action,
replies in plain language, and tracks everything on a live dashboard —
plus emails you proactively when a newly crawled regulator circular
matches your registered categories.

Built for the [Convex All Gas Hackathon](https://vibeapps.dev/judging/convex-all-gas-hackathon-openai)
— sponsored by OpenAI, Firecrawl, and AgentMail. See [hackathon.md](hackathon.md)
for the build log.

## How it works

1. **Forward a notice.** A business owner forwards a regulator email
   (or any PDF/text notice) to their MailHere inbox address.
2. **Extract.** An OpenAI call reads the forwarded message, identifies
   the regulator, deadline, required action, and language, and
   classifies it against the business's registered categories.
3. **Reply.** MailHere sends a plain-language reply — in the same
   language the notice arrived in — through the same AgentMail thread.
   Automated guidance, not legal advice.
4. **Track.** The notice lands on a live dashboard, grouped into
   Overdue / Upcoming / Done.
5. **Watch proactively.** A cron crawls each registered regulator's
   announcements page (via Firecrawl), classifies new items with
   OpenAI, and emails matching businesses automatically.

Supported countries and regulators live in one place:
[`convex/agencyRegistry.ts`](convex/agencyRegistry.ts). Currently Malaysia,
the United States, the United Kingdom, and Singapore — adding a country
is a registry entry, not a rewrite.

## Tech stack

- **Backend**: [Convex](https://convex.dev) — database, server functions,
  scheduling (crons), file/email components, all in one deployment.
- **Email**: [`@agentmail/convex`](https://www.npmjs.com/package/@agentmail/convex) —
  provisions the shared inbox, receives forwarded notices, sends replies.
- **Web crawling**: [`@firecrawl/firecrawl-convex`](https://www.npmjs.com/package/@firecrawl/firecrawl-convex) —
  scrapes regulator announcement pages for the proactive-alert pipeline.
- **AI**: OpenAI (`gpt-4o-mini` by default) for extraction, classification,
  and plain-language reply drafting.
- **Auth**: [`@convex-dev/auth`](https://labs.convex.dev/auth) (password provider).
- **Migrations**: [`@convex-dev/migrations`](https://www.npmjs.com/package/@convex-dev/migrations) —
  batched, resumable backfills for schema changes (see
  [`convex/migrations.ts`](convex/migrations.ts)).
- **Frontend**: Next.js 15 (App Router, static export), Tailwind CSS v4,
  Framer Motion, Fraunces + Geist + IBM Plex Mono.
- **Hosting**: [`@convex-dev/static-hosting`](https://www.convex.dev/components/static-hosting) —
  the Next.js static export is served directly from the Convex deployment
  at `https://<deployment>.convex.site`.

## Project structure

```
app/                     Next.js App Router pages (landing, dashboard shell)
components/               UI: dashboard, notice list, business setup, ui/ primitives
lib/                       Frontend helpers (agency/country re-exports, motion variants)
convex/
  schema.ts                Table definitions + shared validators
  agencyRegistry.ts         Country → regulator-agency registry (single source of truth)
  pipeline.ts               Inbound notice extraction → classify → draft → reply
  crawler.ts                Regulator-site crawl → classify → proactive email
  businesses.ts             Business profile CRUD
  notices.ts                Notice queries + resolve/reopen
  email.ts                  AgentMail webhook wiring, inbox/thread queries
  setup.ts                  One-time shared inbox provisioning
  migrations.ts              Schema-migration backfills (@convex-dev/migrations)
  convex.config.ts           Component registration (agentmail, firecrawl,
                              static-hosting, migrations)
patches/                  patch-package patch for @agentmail/convex (see below)
```

## Getting started

```bash
npm install
```

`postinstall` runs `patch-package`, which patches `@agentmail/convex`'s
component definition to accept `env` config (its published `convex.config.js`
doesn't declare an env schema, so `app.use(agentmail, { env })` in
`convex/convex.config.ts` would otherwise have no effect). See
[`patches/@agentmail+convex+0.1.0.patch`](patches/@agentmail+convex+0.1.0.patch).

### Environment variables

Set these on your Convex deployment (`npx convex env set NAME value`), not
in a frontend `.env` file — they're read server-side in `convex/`:

| Variable | Required | Notes |
|---|---|---|
| `OPENAI_API_KEY` | yes | extraction, classification, reply drafting |
| `OPENAI_MODEL` | no | defaults to `gpt-4o-mini` |
| `AGENTMAIL_API_KEY` | yes | organization-, pod-, or inbox-scoped key |
| `AGENTMAIL_WEBHOOK_SECRET` | recommended | verifies inbound webhook signatures |
| `AGENTMAIL_BASE_URL` | no | defaults to `https://api.agentmail.to/v0` |
| `FIRECRAWL_API_KEY` | yes | regulator-site crawling |
| `FIRECRAWL_WEBHOOK_SECRET` | no | only needed if running Firecrawl in webhook mode |

The frontend needs one local var, in `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
```

### Run it

```bash
npx convex dev        # backend: pushes functions/schema, watches for changes
npm run dev            # frontend: Next.js dev server
```

On first sign-in, the dashboard calls `setup.ensureSetup`, which
provisions the shared inbox and seeds `regulatorSources` from the agency
registry.

### Deploy

```bash
npm run build           # next build -> out/
npm run deploy           # @convex-dev/static-hosting deploy -d out
```

For a schema change that isn't backward-compatible with existing data,
don't push it directly — see the optional-field → backfill →
tighten-to-strict pattern in `convex/migrations.ts`, and rehearse it on a
snapshot-seeded deployment before running it against production.

### Checks

```bash
npm run typecheck
```
