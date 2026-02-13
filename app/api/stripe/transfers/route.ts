import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { transferListQuerySchema } from '@/lib/validation/stripe-schemas';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stripe/transfers
 * Returns transfer history for a gallery
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      galleryId: searchParams.get('galleryId'),
      limit: searchParams.get('limit'),
      offset: searchParams.get('offset'),
      status: searchParams.get('status'),
      startDate: searchParams.get('startDate'),
      endDate: searchParams.get('endDate'),
    };

    const validatedParams = transferListQuerySchema.parse(queryParams);

    // Verify user has access to this gallery
    const { data: gallery, error: galleryError } = await supabase
      .from('galleries')
      .select('id, owner_id')
      .eq('id', validatedParams.galleryId)
      .single();

    if (galleryError || !gallery) {
      return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });
    }

    if (gallery.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Build query
    let query = supabase
      .from('stripe_transfers')
      .select('*', { count: 'exact' })
      .eq('gallery_id', validatedParams.galleryId)
      .order('created_at', { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    // Apply filters
    if (validatedParams.status) {
      query = query.eq('status', validatedParams.status);
    }

    if (validatedParams.startDate) {
      query = query.gte('created_at', validatedParams.startDate);
    }

    if (validatedParams.endDate) {
      query = query.lte('created_at', validatedParams.endDate);
    }

    const { data: transfers, error: transfersError, count } = await query;

    if (transfersError) {
      throw transfersError;
    }

    return NextResponse.json({
      success: true,
      data: transfers || [],
      pagination: {
        total: count || 0,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: (count || 0) > validatedParams.offset + validatedParams.limit,
      },
    });
  } catch (error) {
    console.error('Transfers fetch error:', error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch transfers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
