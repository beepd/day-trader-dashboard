# The Nifty Experiment: dashboard

The public Next.js 14 dashboard for **The Nifty Experiment**, an AI (LangGraph) paper-trading experiment on NSE stocks.
The site's name lives in one place, `lib/site.js`: the header, the browser tab title and the CSV file name follow it.
The trading app lives in its own repo and writes everything to **Supabase**. This site only **reads** it, and only
through read-only `public_*` views.

**Live at** [niftyexperiment.com](https://niftyexperiment.com) (also [trader.niftyexperiment.com](https://trader.niftyexperiment.com)).
The blog is a separate site: [blog.niftyexperiment.com](https://blog.niftyexperiment.com).

> A simulation with fake money. Not investment advice. Results are gross (before brokerage, taxes and slippage).

## What it shows

Five sections, chosen with `?tab=` in the address so every view is a shareable link:

| Section | Address | Reads |
|---|---|---|
| Overview: balance, return, win rate, worst drop; charts for balance over time, strategy vs the Nifty, drop from the peak, profit/loss per day, how trades ended, result by kind of news, headline-to-trade funnel, day-by-day calendar | `/` | `public_daily_equity`, `public_trades`, and row counts from `public_candidates`, `public_verdicts`, `public_plans` (for the funnel) |
| Day by day: what the app looked at, the verdict and headlines for each stock, the plan and its result | `/?tab=days&date=2026-10-09` | `public_runs`, `public_daily_equity`, `public_candidates`, `public_headlines`, `public_verdicts`, `public_plans` |
| All trades: filter by outcome, download CSV | `/?tab=trades` | `public_trades` |
| Blog: the **BLOG** tab opens the blog site directly. The old `/?tab=blog` address still shows a short page with the link, plus any posts marked published | `/?tab=blog` | `public_blog_posts` |
| About | `/?tab=about` | nothing |

A day appears only after 3:35 PM India time (the views enforce this, not this site). Without a date, *Day by day*
opens the newest published day.

## Setup

```bash
npm install
cp .env.local.example .env.local   # then fill it in (Windows: copy .env.local.example .env.local)
npm run dev                         # http://localhost:3000
```

Settings (in `.env.local`, and in Vercel under Settings → Environment Variables):

| Name | Needed | What |
|---|---|---|
| `SUPABASE_URL` | yes | the project address |
| `SUPABASE_PUBLISHABLE_KEY` | yes | the **publishable** key |
| `BLOG_URL` | no | blog address. Default `https://blog.niftyexperiment.com`. Used by the BLOG tab, the About text, the footer and the button on the old blog page |
| `DASHBOARD_CACHE_SECONDS` | no | how long an answer from Supabase may be reused. Default `300`. `0` = no cache. When an answer expires, one visitor may still see the old one while a fresh one is fetched in the background |
| `DASHBOARD_DEMO` | no | `1` shows made-up sample data, to preview the layout without Supabase |

The older names `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` still work. Prefer the new names:
nothing here needs to reach the browser, because the pages are fetched on the server.

## Security model

- The site reads **only** the `public_*` views, with the **publishable** key. The base tables stay locked (row-level
  security on, no policies). **Do not add "public read" policies to base tables.** The old setup that did that is gone.
- The dashboard **refuses to start with a secret / service-role key** (`sb_secret_...` or a JWT with role `service_role`).
- Error text is never shown to visitors. A failed load shows a friendly message, and only the error code is logged on the server.
- Text from the model and the news is shown as plain text (React escapes it). Headline links are only made for
  `http(s)` addresses, and open with `rel="noopener noreferrer nofollow"`.
- CSV cells that start with `=`, `+`, `-` or `@` are protected, so a spreadsheet never runs them as a formula.
- No secrets and no server addresses belong in this repo. `.env.local` is git-ignored.

The views come from the trading app's SQL migrations (`migration_002`, `003`, `007` and later). Run those on the
Supabase project this site points at.

## Tests

```bash
npm test
```

Runs offline in plain Node (20.19+ or 22.12+). It checks the calculations, the helpers, the demo data, and the queries against a
small stand-in Supabase server, including that only `public_*` views are ever requested and that errors do not leak.

## Deploy to Vercel

Connect this GitHub repo in the Vercel dashboard (it deploys on every push), add the settings above, and deploy.
Changing the Supabase project means changing `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`, then redeploying.

### Domains

Both `niftyexperiment.com` and `trader.niftyexperiment.com` point at this one Vercel project (Vercel → Settings → Domains → add both, then
add the DNS records Vercel shows at the domain registrar). Make `niftyexperiment.com` the primary and let the other redirect to it, or serve both.
Either way the page tells search engines that `niftyexperiment.com` is the main address. The main address lives in `lib/site.js` (`SITE_URL`),
next to the default blog address (`BLOG_URL`).
The blog is hosted on Blogger, so `blog.niftyexperiment.com` is set up there: in Blogger settings add it as a custom domain and create the
CNAME record Blogger shows. The trading app's `BLOGGER_*` settings are not affected by the custom domain.

## Look and feel

Dark theme with the colours in `app/globals.css`. Charts use Chart.js, loaded once from a script tag in `app/layout.jsx`.
