import { supabase } from './supabase'

export async function getTradesForDate(date) {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('trade_date', date)
    .order('opened_at', { ascending: true })
  if (error) console.error('trades error:', error)
  return data || []
}

export async function getResearchForDate(date) {
  const { data, error } = await supabase
    .from('research_shortlist')
    .select('*')
    .eq('trade_date', date)
    .order('rank_no', { ascending: true })
  if (error) console.error('research error:', error)
  return data || []
}

export async function getAnalysisForDate(date) {
  const { data, error } = await supabase
    .from('analysis_stocks')
    .select('*')
    .eq('trade_date', date)
    .order('rank_no', { ascending: true })
  if (error) console.error('analysis error:', error)
  return data || []
}

export async function getStrategyForDate(date) {
  const { data, error } = await supabase
    .from('strategy_plans')
    .select('*')
    .eq('trade_date', date)
    .order('id', { ascending: true })
  if (error) console.error('strategy error:', error)
  return data || []
}

/** End-of-day style points for equity + P&L charts (avoids intraday zig-zag from purchase debits). */
export async function getBalanceForCharts() {
  const { data, error } = await supabase
    .from('daily_balance')
    .select('*')
    .gt('debit_credit', 0)
    .order('date', { ascending: true })
    .limit(90)
  if (error) console.error('balance chart error:', error)
  return data || []
}

/** Full ledger: credits and debits, ordered by day then time. */
export async function getBalanceLedgerEntries() {
  const { data, error } = await supabase
    .from('daily_balance')
    .select('*')
    .order('date', { ascending: true })
    .order('created_at', { ascending: true })
    .limit(500)
  if (error) console.error('balance ledger error:', error)
  return data || []
}

/** Latest snapshot for a calendar day (multiple intraday rows may share the same `date`). */
export async function getLatestClosingBalanceForDate(date) {
  const { data, error } = await supabase
    .from('daily_balance')
    .select('*')
    .eq('date', date)
    .order('updated_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)
  if (error) console.error('latest closing balance error:', error)
  return data?.[0] || null
}

export async function getPrevBalance(date) {
  const { data, error } = await supabase
    .from('daily_balance')
    .select('balance_amount')
    .lt('date', date)
    .order('date', { ascending: false })
    .limit(1)
  if (error) console.error('prev balance error:', error)
  return data?.[0] || null
}

export async function getHolidayForDate(date) {
  const { data, error } = await supabase
    .from('market_holidays')
    .select('description')
    .eq('holiday_date', date)
    .limit(1)
  if (error) console.error('market_holidays error:', error)
  return data?.[0] || null
}

export async function getAllDashboardData(date) {
  const [trades, research, analysis, strategy, balChart, balLedger, latestDayBal, prevBal, holiday] = await Promise.all([
    getTradesForDate(date),
    getResearchForDate(date),
    getAnalysisForDate(date),
    getStrategyForDate(date),
    getBalanceForCharts(),
    getBalanceLedgerEntries(),
    getLatestClosingBalanceForDate(date),
    getPrevBalance(date),
    getHolidayForDate(date),
  ])
  return { trades, research, analysis, strategy, balChart, balLedger, todayBal: latestDayBal, prevBal, holiday }
}
