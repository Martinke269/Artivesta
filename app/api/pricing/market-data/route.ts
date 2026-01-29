import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/pricing/market-data
 * Import market sales data from public art databases
 * Only imports actual sale prices, not listing prices
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication and admin role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can import market data' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { source_name, sales_data } = body;

    if (!source_name || !sales_data || !Array.isArray(sales_data)) {
      return NextResponse.json(
        { error: 'source_name and sales_data array are required' },
        { status: 400 }
      );
    }

    // Get or create data source
    let { data: source } = await supabase
      .from('market_data_sources')
      .select('id')
      .eq('name', source_name)
      .single();

    if (!source) {
      const { data: newSource, error: sourceError } = await supabase
        .from('market_data_sources')
        .insert({ name: source_name })
        .select('id')
        .single();

      if (sourceError) {
        return NextResponse.json(
          { error: 'Failed to create data source' },
          { status: 500 }
        );
      }
      source = newSource;
    }

    // Validate and insert sales data
    const validSales = sales_data.filter(sale => 
      sale.artist_name && 
      sale.sale_price_cents && 
      sale.sale_date &&
      typeof sale.sale_price_cents === 'number' &&
      sale.sale_price_cents > 0
    );

    if (validSales.length === 0) {
      return NextResponse.json(
        { error: 'No valid sales data provided' },
        { status: 400 }
      );
    }

    // Add source_id to each sale
    const salesWithSource = validSales.map(sale => ({
      ...sale,
      source_id: source.id,
      currency: sale.currency || 'DKK'
    }));

    const { data: insertedSales, error: insertError } = await supabase
      .from('market_sales')
      .insert(salesWithSource)
      .select();

    if (insertError) {
      console.error('Error inserting market sales:', insertError);
      return NextResponse.json(
        { error: 'Failed to import market data' },
        { status: 500 }
      );
    }

    // Update last sync time
    await supabase
      .from('market_data_sources')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('id', source.id);

    return NextResponse.json({
      message: 'Market data imported successfully',
      imported_count: insertedSales?.length || 0,
      skipped_count: sales_data.length - validSales.length
    });
  } catch (error) {
    console.error('Error in market-data endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/pricing/market-data?artist_name=xxx
 * Get market sales data for an artist
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
    const artist_name = searchParams.get('artist_name');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!artist_name) {
      return NextResponse.json(
        { error: 'artist_name is required' },
        { status: 400 }
      );
    }

    const { data: sales, error } = await supabase
      .from('market_sales')
      .select(`
        *,
        market_data_sources (
          name,
          description
        )
      `)
      .ilike('artist_name', `%${artist_name}%`)
      .order('sale_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching market sales:', error);
      return NextResponse.json(
        { error: 'Failed to fetch market data' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sales: sales || [],
      count: sales?.length || 0
    });
  } catch (error) {
    console.error('Error in GET market-data endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
