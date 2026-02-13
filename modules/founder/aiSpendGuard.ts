/**
 * AI Spend Guard
 * Monitors and controls AI spending to prevent budget overruns
 */

import { createClient } from '@/utils/supabase/server';

export interface AISpendCheckResult {
  allowed: boolean;
  reason?: string;
  currentSpend: number;
  limit: number;
  percentageUsed: number;
}

export interface AISpendStats {
  dailySpend: number;
  weeklySpend: number;
  monthlySpend: number;
  smoothedDailyAverage: number;
  projectedMonthlySpend: number;
}

const ART_IS_SAFE_PROJECT_ID = '00000000-0000-0000-0000-000000000002';

/**
 * Check if an AI operation is allowed based on current spend and limits
 */
export async function checkAISpendAllowed(
  amount: number,
  projectId: string = ART_IS_SAFE_PROJECT_ID
): Promise<AISpendCheckResult> {
  const supabase = await createClient();

  // Get settings
  const { data: settings } = await supabase
    .from('founder_settings')
    .select('*')
    .single();

  if (!settings) {
    return {
      allowed: false,
      reason: 'Settings not found',
      currentSpend: 0,
      limit: 0,
      percentageUsed: 0,
    };
  }

  // Get project allocation
  const { data: project } = await supabase
    .from('founder_projects')
    .select('ai_monthly_budget_allocation')
    .eq('id', projectId)
    .single();

  const projectBudget = project?.ai_monthly_budget_allocation || settings.ai_monthly_budget;

  // Get current spend stats
  const stats = await getAISpendStats(projectId);

  // Check daily cap
  if (stats.dailySpend + amount > settings.ai_daily_spend_cap) {
    return {
      allowed: false,
      reason: `Daily spend cap exceeded (${settings.ai_daily_spend_cap})`,
      currentSpend: stats.dailySpend,
      limit: settings.ai_daily_spend_cap,
      percentageUsed: (stats.dailySpend / settings.ai_daily_spend_cap) * 100,
    };
  }

  // Check weekly cap
  if (stats.weeklySpend + amount > settings.ai_weekly_spend_cap) {
    return {
      allowed: false,
      reason: `Weekly spend cap exceeded (${settings.ai_weekly_spend_cap})`,
      currentSpend: stats.weeklySpend,
      limit: settings.ai_weekly_spend_cap,
      percentageUsed: (stats.weeklySpend / settings.ai_weekly_spend_cap) * 100,
    };
  }

  // Check monthly budget with buffer
  const bufferMultiplier = 1 + (settings.ai_budget_buffer_percent / 100);
  const effectiveBudget = projectBudget * bufferMultiplier;

  if (settings.ai_spend_hard_limit_enabled && stats.monthlySpend + amount > effectiveBudget) {
    return {
      allowed: false,
      reason: `Monthly budget exceeded (${effectiveBudget.toFixed(2)} with ${settings.ai_budget_buffer_percent}% buffer)`,
      currentSpend: stats.monthlySpend,
      limit: effectiveBudget,
      percentageUsed: (stats.monthlySpend / effectiveBudget) * 100,
    };
  }

  // Check alert threshold
  const percentageUsed = (stats.monthlySpend / projectBudget) * 100;
  if (percentageUsed >= settings.ai_spend_alert_threshold_percentage) {
    // Create alert but allow operation
    await createAlert(
      projectId,
      'warning',
      `AI spend at ${percentageUsed.toFixed(1)}% of monthly budget`,
      'ai_budget'
    );
  }

  return {
    allowed: true,
    currentSpend: stats.monthlySpend,
    limit: effectiveBudget,
    percentageUsed,
  };
}

/**
 * Log an AI spend operation
 */
export async function logAISpend(
  amount: number,
  reason: string,
  projectId: string = ART_IS_SAFE_PROJECT_ID,
  metadata?: {
    provider?: string;
    model?: string;
    tokens_used?: number;
  }
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('ai_spend_logs').insert({
    project_id: projectId,
    amount,
    reason,
    provider: metadata?.provider,
    model: metadata?.model,
    tokens_used: metadata?.tokens_used,
  });
}

/**
 * Get AI spend statistics for a project
 */
export async function getAISpendStats(
  projectId: string = ART_IS_SAFE_PROJECT_ID
): Promise<AISpendStats> {
  const supabase = await createClient();

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get daily spend
  const { data: dailyData } = await supabase
    .from('ai_spend_logs')
    .select('amount')
    .eq('project_id', projectId)
    .gte('created_at', startOfDay.toISOString());

  const dailySpend = dailyData?.reduce((sum, log) => sum + Number(log.amount), 0) || 0;

  // Get weekly spend
  const { data: weeklyData } = await supabase
    .from('ai_spend_logs')
    .select('amount')
    .eq('project_id', projectId)
    .gte('created_at', startOfWeek.toISOString());

  const weeklySpend = weeklyData?.reduce((sum, log) => sum + Number(log.amount), 0) || 0;

  // Get monthly spend
  const { data: monthlyData } = await supabase
    .from('ai_spend_logs')
    .select('amount')
    .eq('project_id', projectId)
    .gte('created_at', startOfMonth.toISOString());

  const monthlySpend = monthlyData?.reduce((sum, log) => sum + Number(log.amount), 0) || 0;

  // Get smoothed daily average (7-day)
  const { data: settings } = await supabase
    .from('founder_settings')
    .select('ai_spend_smoothing_window_days')
    .single();

  const windowDays = settings?.ai_spend_smoothing_window_days || 7;
  const windowStart = new Date(now);
  windowStart.setDate(now.getDate() - windowDays);

  const { data: windowData } = await supabase
    .from('ai_spend_logs')
    .select('amount, created_at')
    .eq('project_id', projectId)
    .gte('created_at', windowStart.toISOString());

  // Group by day and calculate average
  const dailyTotals = new Map<string, number>();
  windowData?.forEach((log) => {
    const day = new Date(log.created_at).toISOString().split('T')[0];
    dailyTotals.set(day, (dailyTotals.get(day) || 0) + Number(log.amount));
  });

  const smoothedDailyAverage = dailyTotals.size > 0
    ? Array.from(dailyTotals.values()).reduce((sum, val) => sum + val, 0) / dailyTotals.size
    : 0;

  // Project monthly spend based on smoothed average
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthlySpend = smoothedDailyAverage * daysInMonth;

  return {
    dailySpend,
    weeklySpend,
    monthlySpend,
    smoothedDailyAverage,
    projectedMonthlySpend,
  };
}

/**
 * Create an alert
 */
async function createAlert(
  projectId: string,
  severity: 'info' | 'warning' | 'critical',
  message: string,
  alertType: string
): Promise<void> {
  const supabase = await createClient();

  await supabase.from('alerts').insert({
    project_id: projectId,
    severity,
    message,
    alert_type: alertType,
  });
}

/**
 * Get project economic metrics
 */
export async function getProjectEconomics(
  projectId: string = ART_IS_SAFE_PROJECT_ID
) {
  const supabase = await createClient();

  // Get settings and project
  const { data: settings } = await supabase
    .from('founder_settings')
    .select('*')
    .single();

  const { data: project } = await supabase
    .from('founder_projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (!settings || !project) {
    throw new Error('Settings or project not found');
  }

  // Get AI spend stats
  const aiStats = await getAISpendStats(projectId);

  // Get revenue (current month)
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const { data: revenueData } = await supabase
    .from('orders')
    .select('amount_cents')
    .in('status', ['completed', 'paid'])
    .gte('created_at', startOfMonth.toISOString());

  const monthlyRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.amount_cents) / 100), 0) || 0;
  const monthlyCommission = monthlyRevenue * 0.15; // 15% commission

  // Get expenses (current month)
  const { data: expensesData } = await supabase
    .from('project_expenses')
    .select('amount')
    .eq('project_id', projectId)
    .gte('created_at', startOfMonth.toISOString());

  const monthlyExpenses = expensesData?.reduce((sum, exp) => sum + Number(exp.amount), 0) || 0;

  // Calculate metrics
  const projectBudget = project.ai_monthly_budget_allocation || settings.ai_monthly_budget;
  const bufferMultiplier = 1 + (settings.ai_budget_buffer_percent / 100);
  const effectiveBudget = projectBudget * bufferMultiplier;
  const bufferRemaining = effectiveBudget - aiStats.monthlySpend;
  const budgetPercentageUsed = (aiStats.monthlySpend / projectBudget) * 100;

  // Calculate runway (simplified: based on current burn rate)
  const totalMonthlyBurn = aiStats.monthlySpend + monthlyExpenses;
  const netIncome = monthlyCommission - totalMonthlyBurn;
  
  // Assume we have some cash reserves (this should come from a real source)
  const cashReserves = 5000; // Placeholder
  const runway = netIncome < 0 ? cashReserves / Math.abs(netIncome) : Infinity;

  return {
    // AI Budget
    aiMonthlyBudget: projectBudget,
    aiMonthlySpend: aiStats.monthlySpend,
    aiDailySpend: aiStats.dailySpend,
    aiWeeklySpend: aiStats.weeklySpend,
    aiSmoothedDailyAverage: aiStats.smoothedDailyAverage,
    aiProjectedMonthlySpend: aiStats.projectedMonthlySpend,
    
    // Budget metrics
    aiBufferPercent: settings.ai_budget_buffer_percent,
    aiEffectiveBudget: effectiveBudget,
    aiBufferRemaining: bufferRemaining,
    aiBudgetPercentageUsed: budgetPercentageUsed,
    
    // Revenue & Expenses
    monthlyRevenue,
    monthlyCommission,
    monthlyExpenses,
    totalMonthlyBurn,
    netIncome,
    
    // Runway
    runway: runway === Infinity ? null : runway,
    runwayMonths: runway === Infinity ? null : Math.floor(runway),
    
    // Settings
    dailySpendCap: settings.ai_daily_spend_cap,
    weeklySpendCap: settings.ai_weekly_spend_cap,
    hardLimitEnabled: settings.ai_spend_hard_limit_enabled,
    alertThreshold: settings.ai_spend_alert_threshold_percentage,
  };
}
