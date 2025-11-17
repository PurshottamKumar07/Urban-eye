export type UserRole = 'citizen' | 'admin' | 'employee';

export type IssueCategory = 
  | 'infrastructure' 
  | 'sanitation' 
  | 'traffic' 
  | 'environment' 
  | 'utilities' 
  | 'safety' 
  | 'other';

export type IssueStatus = 
  | 'pending' 
  | 'in_progress' 
  | 'resolved' 
  | 'rejected' 
  | 'escalated';

export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  department?: string;
  created_at: string;
  updated_at: string;
}

export interface CivicIssue {
  id: string;
  reporter_id: string;
  title: string;
  description: string;
  category: IssueCategory;
  priority: IssuePriority;
  status: IssueStatus;
  latitude?: number;
  longitude?: number;
  address?: string;
  image_urls?: string[];
  assigned_to?: string;
  department?: string;
  votes_count: number;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  reporter?: Partial<UserProfile>;
  assignee?: Partial<UserProfile>;
}

export interface IssueVote {
  id: string;
  issue_id: string;
  voter_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  commenter_id: string;
  comment: string;
  is_official: boolean;
  created_at: string;
  commenter?: UserProfile;
}

export interface IssueStatusHistory {
  id: string;
  issue_id: string;
  changed_by: string;
  old_status?: IssueStatus;
  new_status: IssueStatus;
  notes?: string;
  created_at: string;
  changed_by_profile?: UserProfile;
}