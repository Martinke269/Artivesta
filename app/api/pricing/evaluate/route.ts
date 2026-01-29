import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { evaluateArtworkPrice, evaluateAllArtworks } from '@/lib/pricing-evaluation';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pricing/evaluate
 * Evaluate artwork price(s) against market data
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

    const body = await request.json();
    const { artwork_id, evaluate_all } = body;

    // Evaluate all artworks
    if (evaluate_all) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profile?.role !== 'admin') {
        return NextResponse.json(
          { error: 'Only admins can evaluate all artworks' },
          { status: 403 }
        );
      }

      const result = await evaluateAllArtworks();
      return NextResponse.json({
        message: 'Bulk evaluation completed',
        ...result
      });
    }

    // Evaluate single artwork
    if (!artwork_id) {
      return NextResponse.json(
        { error: 'artwork_id is required' },
        { status: 400 }
      );
    }

    // Check if user owns the artwork or is admin
    const { data: artwork } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artwork_id)
      .single();

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (artwork.artist_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only evaluate your own artworks' },
        { status: 403 }
      );
    }

    const evaluation = await evaluateArtworkPrice(artwork_id);

    if (!evaluation) {
      return NextResponse.json(
        { error: 'Failed to evaluate artwork' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Evaluation completed',
      evaluation
    });
  } catch (error) {
    console.error('Error in evaluate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing/evaluate?artwork_id=xxx
 * Get latest evaluation for an artwork
 */
export async function GET(request: NextRequest) {
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

    const searchParams = request.nextUrl.searchParams;
    const artwork_id = searchParams.get('artwork_id');

    if (!artwork_id) {
      return NextResponse.json(
        { error: 'artwork_id is required' },
        { status: 400 }
      );
    }

    // Check if user owns the artwork or is admin
    const { data: artwork } = await supabase
      .from('artworks')
      .select('artist_id')
      .eq('id', artwork_id)
      .single();

    if (!artwork) {
      return NextResponse.json(
        { error: 'Artwork not found' },
        { status: 404 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (artwork.artist_id !== user.id && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'You can only view evaluations for your own artworks' },
        { status: 403 }
      );
    }

    // Fetch latest evaluation
    const { data: evaluation, error } = await supabase
      .from('price_evaluations')
      .select('*')
      .eq('artwork_id', artwork_id)
      .order('evaluated_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !evaluation) {
      return NextResponse.json(
        { error: 'No evaluation found for this artwork' },
        { status: 404 }
      );
    }

    return NextResponse.json({ evaluation });
  } catch (error) {
    console.error('Error in GET evaluate endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
