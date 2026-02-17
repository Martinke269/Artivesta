import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  findMatchesForBrief,
  createMatches,
  updateArtBrief,
  createNotification,
  getArtBriefById,
} from '@/lib/supabase/art-briefs-queries';

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

    // Find matches using the database function
    const matchResults = await findMatchesForBrief(briefId);

    if (matchResults.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No matches found',
        matches: [],
      });
    }

    // Create match records in the database
    const matches = await createMatches(briefId, matchResults);

    // Update brief status to 'matched'
    await updateArtBrief(briefId, { status: 'matched' });

    // Create notification for the brief creator
    await createNotification(
      briefId,
      brief.created_by,
      'matches_found',
      'Matches fundet!',
      `Vi har fundet ${matches.length} kunstnere/gallerier der matcher dine ønsker.`
    );

    // Create notifications for matched artists/galleries
    for (const match of matches) {
      const recipientId = match.artist_id || match.gallery_id;
      if (recipientId) {
        await createNotification(
          briefId,
          recipientId,
          'new_match_opportunity',
          'Ny kunstforespørgsel',
          'En køber/indretningsarkitekt søger kunst der matcher dine værker.'
        );
      }
    }

    return NextResponse.json({
      success: true,
      matches_count: matches.length,
      matches,
    });
  } catch (error) {
    console.error('Error finding matches:', error);
    return NextResponse.json(
      { error: 'Failed to find matches' },
      { status: 500 }
    );
  }
}
