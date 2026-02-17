import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { createResponse, createNotification, getArtBriefById } from '@/lib/supabase/art-briefs-queries';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { briefId: string } }
) {
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

    const body = await request.json();
    const { match_id, message, attachment_url } = body;

    if (!match_id || !message) {
      return NextResponse.json(
        { error: 'match_id and message are required' },
        { status: 400 }
      );
    }

    // Create the response
    const response = await createResponse(
      {
        match_id,
        message,
        attachment_url,
      },
      user.id
    );

    // Get brief details to notify the creator
    const brief = await getArtBriefById(params.briefId);

    // Create notification for the brief creator
    await createNotification(
      params.briefId,
      brief.created_by,
      'new_response',
      'Nyt svar fra kunstner/galleri',
      'En kunstner/galleri har svaret på din forespørgsel.'
    );

    return NextResponse.json({
      success: true,
      response,
    });
  } catch (error) {
    console.error('Error creating response:', error);
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    );
  }
}
