import { InvestmentCalculatorWidget } from '@/components/investment-calculator-widget';

export const metadata = {
  title: 'Investeringsberegner - Kunst & Møbelkunst',
  description: 'Sammenlign Køb, Leasing og Leje af kunst og møbelkunst. Beregn skattefordele og ROI.',
  robots: 'noindex, nofollow', // Widget page should not be indexed
};

export default function InvestmentCalculatorWidgetPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8 px-4">
      <InvestmentCalculatorWidget />
    </div>
  );
}
