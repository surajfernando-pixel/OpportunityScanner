# OpportunityScanner

AI-powered daily scanner for website design & redevelopment tenders. Built with Next.js, Claude API, and Resend.

---

## What it does

- Scans for website project opportunities (RFPs, tenders, EOIs, briefs) by sector and region
- Emails you results on demand
- Sends a daily digest at 8am automatically via Vercel Cron

---

## Setup (15 minutes)

### 1. Get your API keys

**Anthropic (Claude)**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key
3. Copy it

**Resend (email)**
1. Go to [resend.com](https://resend.com) and create a free account
2. Add and verify your sending domain (or use their test domain to start)
3. Create an API key
4. Copy it

---

### 2. Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import your repo
3. In the Vercel dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value |
|---|---|
| `ANTHROPIC_API_KEY` | Your Anthropic API key |
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | e.g. `scanner@yourdomain.com` |
| `NEXT_PUBLIC_APP_URL` | Your Vercel app URL e.g. `https://your-app.vercel.app` |
| `CRON_SECRET` | Any random string e.g. `abc123xyz` — used to secure the cron endpoint |
| `SUBSCRIBERS` | Start with `[]` — update after subscribing (see below) |

4. Deploy

---

### 3. Subscribe to the daily digest

1. Open your deployed app
2. Enter your sector, region, and email address
3. Click **Subscribe**
4. The app will return an `env_value` — copy it
5. Go to Vercel → Settings → Environment Variables → update `SUBSCRIBERS` with that value
6. Redeploy (or wait for next auto-deploy)

The daily cron runs at **8am UTC** every day (adjust in `vercel.json` if needed).

---

### 4. Local development

```bash
cp .env.local.example .env.local
# Fill in your keys in .env.local

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Cron schedule

Defined in `vercel.json`:
```json
{
  "crons": [{ "path": "/api/schedule", "schedule": "0 8 * * *" }]
}
```

Change `0 8 * * *` to any cron expression. Examples:
- `0 8 * * *` — 8am daily
- `0 8 * * 1` — 8am every Monday
- `0 8 1 * *` — 8am on the 1st of each month

---

## Scaling to a database

The subscriber list is currently stored as a JSON env var — fine for a few users. To scale:
1. Add [Supabase](https://supabase.com) (free tier)
2. Create a `subscribers` table with columns: `email`, `sector`, `region`, `type`, `created_at`
3. Replace the env var logic in `/api/subscribe/route.js` and `/api/schedule/route.js` with Supabase queries

---

## Stack

- **Next.js 14** (App Router)
- **Claude API** via `@anthropic-ai/sdk` — AI-powered opportunity research
- **Resend** — transactional email delivery
- **Vercel** — hosting + cron jobs
