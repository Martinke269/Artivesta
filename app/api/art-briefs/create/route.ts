import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createArtBrief, createNotification } from '@/lib/supabase/art-briefs-queries';
import type { CreateArtBriefData } from '@/lib/supabase/art-briefs-types';

export const dynamic = 'force-dynamic';

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

    // Parse request body
    const body = await request.json();

    // Validate required fields
    if (!body.role || !['buyer', 'interior_designer'].includes(body.role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "buyer" or "interior_designer"' },
        { status: 400 }
      );
    }

    // Create the art brief
    const briefData: CreateArtBriefData = {
      role: body.role,
      art_type: body.art_type,
      style: body.style,
      size_min_cm: body.size_min_cm,
      size_max_cm: body.size_max_cm,
      colors: body.colors,
      description: body.description,
      budget_min_dkk: body.budget_min_dkk,
      budget_max_dkk: body.budget_max_dkk,
      wall_image_url: body.wall_image_url,
    };

    const brief = await createArtBrief(briefData, user.id);

    // Create notification for the user
    await createNotification(
      brief.id,
      user.id,
      'brief_created',
      'Kunstbrief oprettet',
      'Din kunstbrief er blevet oprettet. Vi finder nu relevante kunstnere og gallerier.'
    );

    return NextResponse.json({
      success: true,
      brief_id: brief.id,
      brief,
    });
  } catch (error) {
    console.error('Error creating art brief:', error);
    return NextResponse.json(
      { error: 'Failed to create art brief' },
      { status: 500 }
    );
  }
}
