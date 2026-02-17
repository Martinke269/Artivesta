import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { getUserBriefs } from '@/lib/supabase/art-briefs-queries';

export const dynamic = 'force-dynamic';

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

    // Get user's briefs
    const briefs = await getUserBriefs(user.id);

    return NextResponse.json({
      success: true,
      briefs,
    });
  } catch (error) {
    console.error('Error fetching user briefs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch briefs' },
      { status: 500 }
    );
  }
}
