# Day Trader Dashboard

NSE Intraday Simulation Dashboard built with Next.js 14 + Supabase.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.local.example .env.local
```
Edit `.env.local` and add your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Enable public read access in Supabase
Run this in your Supabase SQL editor:
```sql
alter table trades enable row level security;
alter table research_shortlist enable row level security;
alter table analysis_stocks enable row level security;
alter table strategy_plans enable row level security;
alter table daily_balance enable row level security;

create policy "Public read" on trades for select to anon using (true);
create policy "Public read" on research_shortlist for select to anon using (true);
create policy "Public read" on analysis_stocks for select to anon using (true);
create policy "Public read" on strategy_plans for select to anon using (true);
create policy "Public read" on daily_balance for select to anon using (true);
```

### 4. Run locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

```bash
# Push to GitHub first, then:
npx vercel
```

Or connect your GitHub repo in the Vercel dashboard and it will auto-deploy on every push.

Add your environment variables in Vercel: Settings → Environment Variables.

## Features
- Date picker with prev/next navigation (URL param: `/?date=2026-05-01`)
- Auto-refresh every 15 minutes when viewing today
- 6 metric cards: starting capital, deployed, closing balance, P&L, trade count, win rate
- Executed trades table with exit reason badges
- Research shortlist with sectors and trending reasons
- Analysis scores with intraday score bars
- Strategy plans with entry/target/stop-loss
- Equity curve (line chart) and daily P&L (bar chart) from balance history
- Balance ledger with debit/credit entries
