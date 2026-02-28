import { Metadata } from 'next';
import { HeroSection } from '@/components/oppmysales/hero-section';
import { HeatmapSection } from '@/components/oppmysales/heatmap-section';
import { PipelineSection } from '@/components/oppmysales/pipeline-section';
import { LiveLeadsSection } from '@/components/oppmysales/live-leads-section';
import { ExpertToolsSection } from '@/components/oppmysales/expert-tools-section';
import { CTASection } from '@/components/oppmysales/cta-section';

export const metadata: Metadata = {
  title: 'OppMySales - Intelligent Lead Management & Pipeline Optimization',
  description: 'Transform your sales process with AI-powered heatmaps, pipeline visualization, and real-time lead intelligence from 874,000+ data points.',
  keywords: 'sales optimization, lead management, pipeline visualization, sales heatmap, CRM, sales intelligence',
  openGraph: {
    title: 'OppMySales - Intelligent Lead Management',
    description: 'AI-powered sales optimization with real-time lead intelligence',
    type: 'website',
  },
};

export default function OppMySalesPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <HeroSection />
      <HeatmapSection />
      <PipelineSection />
      <LiveLeadsSection />
      <ExpertToolsSection />
      <CTASection />
    </main>
  );
}
