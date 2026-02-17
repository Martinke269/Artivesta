import { createClient } from '@/utils/supabase/server';
import type {
  ArtBrief,
  ArtBriefMatch,
  ArtBriefResponse,
  ArtBriefNotification,
  ArtBriefWithCreator,
  ArtBriefMatchWithDetails,
  CreateArtBriefData,
  UpdateArtBriefData,
  CreateResponseData,
  MatchResult,
  ArtBriefStats,
} from './art-briefs-types';

// Create a new art brief
export async function createArtBrief(data: CreateArtBriefData, userId: string) {
  const supabase = await createClient();

  const { data: brief, error } = await supabase
    .from('art_briefs')
    .insert({
      created_by: userId,
      ...data,
    })
    .select()
    .single();

  if (error) throw error;
  return brief as ArtBrief;
}

// Get all briefs for a user
export async function getUserBriefs(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_briefs')
    .select(`
      *,
      creator:profiles!art_briefs_created_by_fkey(id, name, email)
    `)
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ArtBriefWithCreator[];
}

// Get a single brief by ID
export async function getArtBriefById(briefId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_briefs')
    .select(`
      *,
      creator:profiles!art_briefs_created_by_fkey(id, name, email)
    `)
    .eq('id', briefId)
    .single();

  if (error) throw error;
  return data as ArtBriefWithCreator;
}

// Update an art brief
export async function updateArtBrief(briefId: string, data: UpdateArtBriefData) {
  const supabase = await createClient();

  const { data: brief, error } = await supabase
    .from('art_briefs')
    .update(data)
    .eq('id', briefId)
    .select()
    .single();

  if (error) throw error;
  return brief as ArtBrief;
}

// Close an art brief
export async function closeArtBrief(briefId: string) {
  return updateArtBrief(briefId, { status: 'closed' });
}

// Find matches for a brief using the database function
export async function findMatchesForBrief(briefId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('find_matches_for_brief', {
    p_brief_id: briefId,
  });

  if (error) throw error;
  return data as MatchResult[];
}

// Create matches in the database
export async function createMatches(briefId: string, matches: MatchResult[]) {
  const supabase = await createClient();

  const matchRecords = matches.map((match) => ({
    brief_id: briefId,
    artist_id: match.artist_id,
    gallery_id: match.gallery_id,
    match_score: match.match_score,
  }));

  const { data, error } = await supabase
    .from('art_brief_matches')
    .insert(matchRecords)
    .select();

  if (error) throw error;
  return data as ArtBriefMatch[];
}

// Get matches for a brief
export async function getBriefMatches(briefId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_brief_matches')
    .select(`
      *,
      brief:art_briefs(*)
    `)
    .eq('brief_id', briefId)
    .order('match_score', { ascending: false });

  if (error) throw error;

  // Fetch artist/gallery details separately to avoid RLS issues
  const matchesWithDetails = await Promise.all(
    data.map(async (match) => {
      let artist = null;
      let gallery = null;

      if (match.artist_id) {
        const { data: artistData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', match.artist_id)
          .single();
        artist = artistData;
      }

      if (match.gallery_id) {
        const { data: galleryData } = await supabase
          .from('profiles')
          .select('id, name, email')
          .eq('id', match.gallery_id)
          .single();
        gallery = galleryData;
      }

      return {
        ...match,
        artist,
        gallery,
      };
    })
  );

  return matchesWithDetails as ArtBriefMatchWithDetails[];
}

// Get matches for an artist/gallery
export async function getMatchesForProvider(userId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_brief_matches')
    .select(`
      *,
      brief:art_briefs(
        *,
        creator:profiles!art_briefs_created_by_fkey(id, name, email)
      )
    `)
    .or(`artist_id.eq.${userId},gallery_id.eq.${userId}`)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ArtBriefMatchWithDetails[];
}

// Update match (mark as contacted/responded)
export async function updateMatch(
  matchId: string,
  data: {
    contacted?: boolean;
    responded?: boolean;
    response_message?: string;
    response_attachment_url?: string;
  }
) {
  const supabase = await createClient();

  const { data: match, error } = await supabase
    .from('art_brief_matches')
    .update(data)
    .eq('id', matchId)
    .select()
    .single();

  if (error) throw error;
  return match as ArtBriefMatch;
}

// Create a response to a match
export async function createResponse(data: CreateResponseData, senderId: string) {
  const supabase = await createClient();

  const { data: response, error } = await supabase
    .from('art_brief_responses')
    .insert({
      ...data,
      sender_id: senderId,
    })
    .select()
    .single();

  if (error) throw error;

  // Update match as responded
  await updateMatch(data.match_id, { responded: true });

  return response as ArtBriefResponse;
}

// Get responses for a match
export async function getMatchResponses(matchId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_brief_responses')
    .select(`
      *,
      sender:profiles!art_brief_responses_sender_id_fkey(id, name, email)
    `)
    .eq('match_id', matchId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// Create a notification
export async function createNotification(
  briefId: string,
  userId: string,
  type: string,
  title: string,
  message: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('create_art_brief_notification', {
    p_brief_id: briefId,
    p_user_id: userId,
    p_notification_type: type,
    p_title: title,
    p_message: message,
  });

  if (error) throw error;
  return data;
}

// Get notifications for a user
export async function getUserNotifications(userId: string, unreadOnly = false) {
  const supabase = await createClient();

  let query = supabase
    .from('art_brief_notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (unreadOnly) {
    query = query.eq('read', false);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as ArtBriefNotification[];
}

// Mark notification as read
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('art_brief_notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

// Mark all notifications as read for a user
export async function markAllNotificationsAsRead(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('art_brief_notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

// Get statistics for admin dashboard
export async function getArtBriefStats(): Promise<ArtBriefStats> {
  const supabase = await createClient();

  const [briefsResult, matchesResult] = await Promise.all([
    supabase.from('art_briefs').select('status', { count: 'exact' }),
    supabase.from('art_brief_matches').select('responded, match_score', { count: 'exact' }),
  ]);

  if (briefsResult.error) throw briefsResult.error;
  if (matchesResult.error) throw matchesResult.error;

  const briefs = briefsResult.data || [];
  const matches = matchesResult.data || [];

  const stats: ArtBriefStats = {
    total_briefs: briefs.length,
    open_briefs: briefs.filter((b) => b.status === 'open').length,
    matched_briefs: briefs.filter((b) => b.status === 'matched').length,
    closed_briefs: briefs.filter((b) => b.status === 'closed').length,
    total_matches: matches.length,
    responded_matches: matches.filter((m) => m.responded).length,
    average_match_score:
      matches.length > 0
        ? matches.reduce((sum, m) => sum + m.match_score, 0) / matches.length
        : 0,
  };

  return stats;
}

// Get all briefs for admin
export async function getAllBriefs() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_briefs')
    .select(`
      *,
      creator:profiles!art_briefs_created_by_fkey(id, name, email)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ArtBriefWithCreator[];
}

// Get pending email notifications
export async function getPendingEmailNotifications() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('art_brief_notifications')
    .select(`
      *,
      user:profiles!art_brief_notifications_user_id_fkey(id, name, email),
      brief:art_briefs(*)
    `)
    .eq('email_sent', false)
    .order('created_at', { ascending: true })
    .limit(50);

  if (error) throw error;
  return data;
}

// Mark notification email as sent
export async function markNotificationEmailSent(notificationId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('art_brief_notifications')
    .update({ email_sent: true })
    .eq('id', notificationId);

  if (error) throw error;
}
