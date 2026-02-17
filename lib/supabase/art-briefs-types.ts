// Art Briefs System Types

export type ArtBriefRole = 'buyer' | 'interior_designer';
export type ArtBriefStatus = 'open' | 'matched' | 'closed';
export type NotificationType = 
  | 'brief_created'
  | 'matches_found'
  | 'new_response'
  | 'brief_updated'
  | 'brief_closed'
  | 'new_match_opportunity';

export interface ArtBrief {
  id: string;
  created_by: string;
  role: ArtBriefRole;
  art_type: string | null;
  style: string | null;
  size_min_cm: number | null;
  size_max_cm: number | null;
  colors: string[] | null;
  description: string | null;
  budget_min_dkk: number | null;
  budget_max_dkk: number | null;
  wall_image_url: string | null;
  status: ArtBriefStatus;
  created_at: string;
  updated_at: string;
}

export interface ArtBriefMatch {
  id: string;
  brief_id: string;
  artist_id: string | null;
  gallery_id: string | null;
  match_score: number;
  contacted: boolean;
  responded: boolean;
  response_message: string | null;
  response_attachment_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtBriefResponse {
  id: string;
  match_id: string;
  sender_id: string;
  message: string;
  attachment_url: string | null;
  created_at: string;
}

export interface ArtBriefNotification {
  id: string;
  brief_id: string;
  user_id: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  email_sent: boolean;
  created_at: string;
}

// Extended types with joined data
export interface ArtBriefWithCreator extends ArtBrief {
  creator: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ArtBriefMatchWithDetails extends ArtBriefMatch {
  brief: ArtBrief;
  artist?: {
    id: string;
    name: string;
    email: string;
  };
  gallery?: {
    id: string;
    name: string;
    email: string;
  };
  artwork_count?: number;
}

export interface ArtBriefResponseWithSender extends ArtBriefResponse {
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

// Form data types
export interface CreateArtBriefData {
  role: ArtBriefRole;
  art_type?: string;
  style?: string;
  size_min_cm?: number;
  size_max_cm?: number;
  colors?: string[];
  description?: string;
  budget_min_dkk?: number;
  budget_max_dkk?: number;
  wall_image_url?: string;
}

export interface UpdateArtBriefData {
  art_type?: string;
  style?: string;
  size_min_cm?: number;
  size_max_cm?: number;
  colors?: string[];
  description?: string;
  budget_min_dkk?: number;
  budget_max_dkk?: number;
  wall_image_url?: string;
  status?: ArtBriefStatus;
}

export interface CreateResponseData {
  match_id: string;
  message: string;
  attachment_url?: string;
}

// Match result from database function
export interface MatchResult {
  artist_id: string | null;
  gallery_id: string | null;
  match_score: number;
  artwork_count: number;
}

// Statistics types
export interface ArtBriefStats {
  total_briefs: number;
  open_briefs: number;
  matched_briefs: number;
  closed_briefs: number;
  total_matches: number;
  responded_matches: number;
  average_match_score: number;
}
