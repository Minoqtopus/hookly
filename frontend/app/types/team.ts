export interface Team {
  id: string;
  name: string;
  description?: string;
  plan_tier: 'starter' | 'pro' | 'agency';
  current_member_count: number;
  has_team_features: boolean;
  created_at: Date;
  updated_at: Date;
  owner_id: string;
  members?: TeamMember[];
  invitations?: TeamInvitation[];
  activities?: TeamActivity[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: Date;
  user?: {
    id: string;
    email: string;
    name?: string;
    avatar_url?: string;
  };
}

export interface TeamInvitation {
  id: string;
  team_id: string;
  invited_by_user_id: string;
  invitee_email: string;
  invited_role: TeamRole;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  expires_at?: Date;
  message?: string;
  created_at: Date;
  updated_at: Date;
  team?: {
    id: string;
    name: string;
  };
  invited_by?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface TeamActivity {
  id: string;
  team_id: string;
  user_id: string;
  activity_type: 'generation_created' | 'generation_shared' | 'member_added' | 'member_removed' | 'role_changed' | 'generation_favorited';
  activity_data?: any;
  description?: string;
  created_at: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
  VIEWER = 'viewer'
}

export interface SharedGeneration {
  id: string;
  team_id: string;
  generation_id: string;
  shared_by_user_id: string;
  title?: string;
  notes?: string;
  created_at: Date;
  generation?: {
    id: string;
    title?: string;
    content?: string;
    niche?: string;
  };
  shared_by?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface CreateTeamDto {
  name: string;
  description?: string;
}

export interface InviteMemberDto {
  teamId: string;
  email: string;
  role?: TeamRole;
  message?: string;
}

export interface UpdateMemberRoleDto {
  teamId: string;
  memberId: string;
  role: TeamRole;
}

export interface TeamStats {
  totalMembers: number;
  totalGenerations: number;
  activeMembers: number;
  recentActivity: TeamActivity[];
}
