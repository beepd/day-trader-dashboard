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

export async function getBalanceHistory() {
  const { data, error } = await supabase
    .from('daily_balance')
    .select('*')
    .order('date', { ascending: true })
    .limit(90)
  if (error) console.error('balance history error:', error)
  return data || []
}

export async function getBalanceForDate(date) {
  const { data, error } = await supabase
    .from('daily_balance')
    .select('*')
    .eq('date', date)
    .limit(1)
  if (error) console.error('balance for date error:', error)
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

export async function getAllDashboardData(date) {
  const [trades, research, analysis, strategy, balHistory, todayBal, prevBal] = await Promise.all([
    getTradesForDate(date),
    getResearchForDate(date),
    getAnalysisForDate(date),
    getStrategyForDate(date),
    getBalanceHistory(),
    getBalanceForDate(date),
    getPrevBalance(date),
  ])
  return { trades, research, analysis, strategy, balHistory, todayBal, prevBal }
}
