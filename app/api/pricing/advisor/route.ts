import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getPricingRecommendation } from '@/lib/pricing-advisor';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pricing/advisor
 * Get pricing recommendation for a new artwork
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user profile to get artist name
    const { data: profile } = await supabase
      .from('profiles')
      .select('name, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'artist') {
      return NextResponse.json(
        { error: 'Only artists can get pricing recommendations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { medium, dimensions, year_created } = body;

    // Get pricing recommendation
    const recommendation = await getPricingRecommendation(
      profile.name,
      medium,
      dimensions,
      year_created
    );

    if (!recommendation) {
      return NextResponse.json({
        message: 'No market data available',
        recommendation: null
      });
    }

    return NextResponse.json({
      message: 'Pricing recommendation generated',
      recommendation
    });
  } catch (error) {
    console.error('Error in pricing advisor endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
