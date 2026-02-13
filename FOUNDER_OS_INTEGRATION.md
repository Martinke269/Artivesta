# Founder-OS Economic Integration

Art Is Safe has been successfully integrated into Founder-OS as a fully tracked economic project.

## Overview

Founder-OS is an internal economic management system that tracks AI spending, revenue, expenses, and provides intelligent budget management with smoothing algorithms to prevent reactionary decisions based on daily spending spikes.

## Database Schema

### Tables Created

1. **founder_settings** - Global AI budget and economic settings
   - AI monthly budget, daily/weekly caps
   - Alert thresholds and hard limits
   - Smoothing engine configuration

2. **founder_projects** - Projects tracked in Founder-OS
   - Art Is Safe registered with ID: `00000000-0000-0000-0000-000000000002`
   - Project-specific AI budget allocation: $500/month

3. **project_expenses** - Track all project expenses
   - Categories: hosting, tools, marketing, other
   - Linked to projects via foreign key

4. **ai_spend_logs** - Track all AI-related spending
   - Amount, reason, provider, model, tokens used
   - Indexed for fast queries by project and date

5. **alerts** - System alerts and notifications
   - Severity levels: info, warning, critical
   - Alert types: ai_budget, revenue, expense, system

6. **project_revenue** (VIEW) - Aggregated revenue from orders
   - Calculates total revenue, commission (15%), and artist payout (85%)
   - Grouped by day for trend analysis

### Security (RLS)

All tables have Row Level Security enabled with admin-only access policies:
- Only users with `role = 'admin'` can view/manage Founder-OS data
- System can insert AI spend logs (for automated tracking)
- Ensures data protection and prevents unauthorized access

## Core Modules

### 1. AI Spend Guard (`modules/founder/aiSpendGuard.ts`)

**Purpose**: Monitors and controls AI spending to prevent budget overruns

**Key Functions**:
- `checkAISpendAllowed(amount, projectId)` - Validates if an AI operation is allowed
- `logAISpend(amount, reason, projectId, metadata)` - Records AI spending
- `getAISpendStats(projectId)` - Returns daily/weekly/monthly spend statistics
- `getProjectEconomics(projectId)` - Comprehensive economic metrics

**Features**:
- Daily, weekly, and monthly spend caps
- Budget buffer system (default 20%)
- Hard limit enforcement
- Automatic alert generation at threshold (default 80%)

### 2. AI Spend Smoothing Engine (`modules/founder/aiSpendSmoothingEngine.ts`)

**Purpose**: Provides smoothed spending metrics to avoid reactionary decisions

**Key Functions**:
- `getSmoothedMetrics(projectId, windowDays)` - Returns smoothed averages
- `getSmoothedBudgetRecommendation(projectId)` - Suggests optimal budget
- `detectSpendingAnomalies(projectId)` - Identifies unusual patterns
- `getForecast(projectId, days)` - Predicts future spending

**Features**:
- 7-day rolling average (configurable)
- Trend detection (increasing/decreasing/stable)
- Volatility calculation
- Confidence scoring based on data availability
- Anomaly detection (spikes, sustained increases, unusual patterns)

## API Endpoints

### GET /api/founder/project-economics

Returns comprehensive economic data for Art Is Safe:

```typescript
{
  success: true,
  data: {
    economics: {
      // AI Budget
      aiMonthlyBudget: number,
      aiMonthlySpend: number,
      aiDailySpend: number,
      aiWeeklySpend: number,
      aiSmoothedDailyAverage: number,
      aiProjectedMonthlySpend: number,
      
      // Budget metrics
      aiBufferPercent: number,
      aiEffectiveBudget: number,
      aiBufferRemaining: number,
      aiBudgetPercentageUsed: number,
      
      // Revenue & Expenses
      monthlyRevenue: number,
      monthlyCommission: number,
      monthlyExpenses: number,
      totalMonthlyBurn: number,
      netIncome: number,
      
      // Runway
      runway: number | null,
      runwayMonths: number | null,
      
      // Settings
      dailySpendCap: number,
      weeklySpendCap: number,
      hardLimitEnabled: boolean,
      alertThreshold: number
    },
    
    smoothedMetrics: {
      dailyAverage: number,
      weeklyAverage: number,
      trend: 'increasing' | 'decreasing' | 'stable',
      volatility: number,
      projectedMonthlySpend: number,
      confidence: number
    },
    
    anomalies: {
      hasAnomaly: boolean,
      anomalyType?: 'spike' | 'sustained_increase' | 'unusual_pattern',
      severity: 'low' | 'medium' | 'high',
      message: string
    },
    
    forecast: {
      forecast: Array<{
        date: string,
        predictedSpend: number,
        confidence: number
      }>,
      totalPredicted: number
    },
    
    summary: {
      aiSpendStatus: 'healthy' | 'warning' | 'critical',
      bufferStatus: 'healthy' | 'warning' | 'critical',
      runwayStatus: 'healthy' | 'warning' | 'critical',
      trendStatus: 'increasing' | 'decreasing' | 'stable',
      hasAnomalies: boolean
    }
  }
}
```

## Integration with Existing Systems

### Revenue Tracking
- Automatically aggregates revenue from `orders` table
- Calculates 15% commission for Art Is Safe
- Tracks completed and paid orders only

### AI Operations
Before any AI operation (price suggestions, description generation, etc.):

```typescript
import { checkAISpendAllowed, logAISpend } from '@/modules/founder/aiSpendGuard';

// Check if operation is allowed
const estimatedCost = 0.05; // $0.05
const check = await checkAISpendAllowed(estimatedCost);

if (!check.allowed) {
  throw new Error(`AI operation blocked: ${check.reason}`);
}

// Perform AI operation...
const result = await performAIOperation();

// Log the actual cost
await logAISpend(
  actualCost,
  'price_suggestion',
  undefined, // uses default Art Is Safe project ID
  {
    provider: 'openai',
    model: 'gpt-4',
    tokens_used: 150
  }
);
```

## Default Configuration

- **Monthly AI Budget**: $500 (Art Is Safe allocation)
- **Daily Spend Cap**: $50
- **Weekly Spend Cap**: $250
- **Buffer**: 20% (effective budget: $600)
- **Alert Threshold**: 80% of budget
- **Hard Limit**: Enabled
- **Smoothing Window**: 7 days
- **Commission Rate**: 15%

## Economic Calculations

### AI Budget Status
- **Healthy**: < 70% of budget used
- **Warning**: 70-90% of budget used
- **Critical**: > 90% of budget used

### Buffer Status
- **Healthy**: > 15% buffer remaining
- **Warning**: 5-15% buffer remaining
- **Critical**: < 5% buffer remaining

### Runway Calculation
```
Monthly Burn = AI Spend + Expenses
Net Income = Commission Revenue - Monthly Burn
Runway (months) = Cash Reserves / |Net Income| (if negative)
```

### Runway Status
- **Healthy**: > 6 months or positive net income
- **Warning**: 3-6 months
- **Critical**: < 3 months

## Database Functions

Three PostgreSQL functions for quick queries:

1. `get_project_monthly_ai_spend(project_id, month)` - Monthly AI spend
2. `get_project_daily_ai_spend(project_id, date)` - Daily AI spend
3. `get_smoothed_ai_spend(project_id, window_days)` - Smoothed average

## Future Enhancements

1. **Multi-project Support**: Track multiple projects beyond Art Is Safe
2. **Cash Reserves Tracking**: Real cash balance instead of placeholder
3. **Budget Recommendations**: AI-powered budget optimization
4. **Cost Attribution**: Link AI costs to specific features/users
5. **Predictive Alerts**: Warn before hitting limits based on trends
6. **Dashboard UI**: Visual representation of all metrics
7. **Expense Categories**: More granular expense tracking
8. **Revenue Forecasting**: Predict future revenue based on trends

## Monitoring & Alerts

The system automatically creates alerts when:
- AI spend reaches 80% of monthly budget (configurable)
- Daily/weekly caps are exceeded
- Spending anomalies are detected
- Budget recommendations change significantly

Alerts are stored in the `alerts` table and can be queried by admins.

## Compliance

- All financial data is admin-only (RLS enforced)
- AI spend logs include provider/model for audit trails
- Timestamps on all records for historical analysis
- Immutable logs (no UPDATE policies on spend logs)

## Testing

To test the integration:

1. Call the API endpoint: `GET /api/founder/project-economics`
2. Log some test AI spend: Use `logAISpend()` function
3. Check alerts: Query the `alerts` table
4. Verify RLS: Try accessing as non-admin user (should fail)

## Support

For issues or questions about Founder-OS integration:
- Check the API response for detailed error messages
- Review RLS policies if access is denied
- Verify project ID matches: `00000000-0000-0000-0000-000000000002`
- Ensure user has admin role for management operations
