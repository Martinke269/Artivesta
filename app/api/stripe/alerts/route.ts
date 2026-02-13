import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { alertListQuerySchema, alertUpdateSchema } from '@/lib/validation/stripe-schemas';
import { ZodError } from 'zod';

export const dynamic = 'force-dynamic';

/**
 * GET /api/stripe/alerts
 * Returns alerts for a gallery
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
      severity: searchParams.get('severity'),
      resolved: searchParams.get('resolved'),
    };

    const validatedParams = alertListQuerySchema.parse(queryParams);

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
      .from('stripe_alerts')
      .select('*', { count: 'exact' })
      .eq('gallery_id', validatedParams.galleryId)
      .order('created_at', { ascending: false })
      .range(validatedParams.offset, validatedParams.offset + validatedParams.limit - 1);

    // Apply filters
    if (validatedParams.severity) {
      query = query.eq('severity', validatedParams.severity);
    }

    if (validatedParams.resolved !== undefined) {
      query = query.eq('resolved', validatedParams.resolved);
    }

    const { data: alerts, error: alertsError, count } = await query;

    if (alertsError) {
      throw alertsError;
    }

    return NextResponse.json({
      success: true,
      data: alerts || [],
      pagination: {
        total: count || 0,
        limit: validatedParams.limit,
        offset: validatedParams.offset,
        hasMore: (count || 0) > validatedParams.offset + validatedParams.limit,
      },
    });
  } catch (error) {
    console.error('Alerts fetch error:', error);

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
        error: 'Failed to fetch alerts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/alerts
 * Updates an alert (mark as resolved, add notes)
 */
export async function POST(request: NextRequest) {
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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = alertUpdateSchema.parse(body);

    // Fetch alert and verify access
    const { data: alert, error: alertError } = await supabase
      .from('stripe_alerts')
      .select('*, galleries!inner(id, owner_id)')
      .eq('id', validatedData.alertId)
      .single();

    if (alertError || !alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    // Verify user has access to this gallery
    if (alert.galleries.owner_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update alert
    const updates: any = {};

    if (validatedData.resolved !== undefined) {
      updates.resolved = validatedData.resolved;
      if (validatedData.resolved) {
        updates.resolved_at = new Date().toISOString();
      }
    }

    if (validatedData.resolvedNote) {
      updates.resolved_note = validatedData.resolvedNote;
    }

    const { data: updatedAlert, error: updateError } = await supabase
      .from('stripe_alerts')
      .update(updates)
      .eq('id', validatedData.alertId)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: updatedAlert,
    });
  } catch (error) {
    console.error('Alert update error:', error);

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
        error: 'Failed to update alert',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
