import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { closeArtBrief, createNotification, getArtBriefById, getBriefMatches } from '@/lib/supabase/art-briefs-queries';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const briefId = params.id;

    // Verify the brief belongs to the user or user is admin
    const brief = await getArtBriefById(briefId);
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (brief.created_by !== user.id && profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Close the brief
    const closedBrief = await closeArtBrief(briefId);

    // Create notification for the brief creator
    await createNotification(
      briefId,
      brief.created_by,
      'brief_closed',
      'Kunstbrief lukket',
      'Din kunstbrief er blevet lukket.'
    );

    // Notify all matched artists/galleries
    const matches = await getBriefMatches(briefId);
    for (const match of matches) {
      const recipientId = match.artist_id || match.gallery_id;
      if (recipientId) {
        await createNotification(
          briefId,
          recipientId,
          'brief_closed',
          'Kunstforespørgsel lukket',
          'En kunstforespørgsel du var matchet med er blevet lukket.'
        );
      }
    }

    return NextResponse.json({
      success: true,
      brief: closedBrief,
    });
  } catch (error) {
    console.error('Error closing brief:', error);
    return NextResponse.json(
      { error: 'Failed to close brief' },
      { status: 500 }
    );
  }
}
