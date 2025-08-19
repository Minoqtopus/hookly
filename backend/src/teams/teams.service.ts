import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Generation } from '../entities/generation.entity';
import { SharedGeneration, Team, TeamActivity, TeamInvitation, TeamMember, TeamRole } from '../entities/team.entity';
import { User } from '../entities/user.entity';

export interface CreateTeamDto {
  name: string;
  description?: string;
  ownerId: string;
}

export interface InviteMemberDto {
  teamId: string;
  inviteeEmail: string;
  role: TeamRole;
  message?: string;
  invitedByUserId: string;
}

export interface UpdateMemberRoleDto {
  teamId: string;
  memberId: string;
  newRole: TeamRole;
  updatedByUserId: string;
}

export interface TeamStats {
  totalMembers: number;
  activeMembers: number;
  totalGenerations: number;
  sharedGenerations: number;
  pendingInvitations: number;
  recentActivity: TeamActivity[];
}

@Injectable()
export class TeamsService {
  private readonly logger = new Logger(TeamsService.name);

  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(TeamInvitation)
    private teamInvitationRepository: Repository<TeamInvitation>,
    @InjectRepository(TeamActivity)
    private teamActivityRepository: Repository<TeamActivity>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
  ) {}

  /**
   * Create a new team
   */
  async createTeam(createTeamDto: CreateTeamDto): Promise<Team> {
    const owner = await this.userRepository.findOne({ where: { id: createTeamDto.ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    // Check if user can create teams based on their plan
    const canCreateTeam = this.canUserCreateTeam(owner);
    if (!canCreateTeam.allowed) {
      throw new BadRequestException(canCreateTeam.reason);
    }

    // Create team with plan-based limits
    const team = this.teamRepository.create({
      name: createTeamDto.name,
      description: createTeamDto.description,
      owner_id: createTeamDto.ownerId,
      plan_tier: owner.plan,
      member_limit: this.getMemberLimitForPlan(owner.plan),
      current_member_count: 1, // Owner is the first member
      has_team_features: this.hasTeamFeatures(owner.plan),
    });

    const savedTeam = await this.teamRepository.save(team);

    // Add owner as team member
    await this.addTeamMember(savedTeam.id, createTeamDto.ownerId, TeamRole.OWNER);

    // Log team creation activity
    await this.logTeamActivity(savedTeam.id, createTeamDto.ownerId, 'team_created', {
      teamName: savedTeam.name,
    });

    this.logger.log(`Team '${savedTeam.name}' created by user ${createTeamDto.ownerId}`);
    return savedTeam;
  }

  /**
   * Get team by ID with members and basic info
   */
  async getTeamById(teamId: string, userId: string): Promise<Team> {
    const team = await this.teamRepository.findOne({
      where: { id: teamId },
      relations: ['members', 'members.user', 'owner'],
    });

    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is a member of the team
    const isMember = team.members.some(member => member.user_id === userId);
    if (!isMember) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return team;
  }

  /**
   * Get teams for a user
   */
  async getUserTeams(userId: string): Promise<Team[]> {
    const teamMemberships = await this.teamMemberRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['team', 'team.owner'],
    });

    return teamMemberships.map(membership => membership.team);
  }

  /**
   * Invite a new member to the team
   */
  async inviteMember(inviteMemberDto: InviteMemberDto): Promise<TeamInvitation> {
    const team = await this.teamRepository.findOne({ where: { id: inviteMemberDto.teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if inviter has permission
    const inviterMembership = await this.teamMemberRepository.findOne({
      where: { team_id: inviteMemberDto.teamId, user_id: inviteMemberDto.invitedByUserId },
    });

    if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
      throw new ForbiddenException('You do not have permission to invite members');
    }

    // Check if team has reached member limit
    if (team.current_member_count >= team.member_limit) {
      throw new BadRequestException(`Team has reached the maximum member limit of ${team.member_limit}`);
    }

    // Check if user is already a member
    const existingMember = await this.teamMemberRepository.findOne({
      where: { team_id: inviteMemberDto.teamId, user_id: inviteMemberDto.invitedByUserId },
    });

    if (existingMember) {
      throw new BadRequestException('User is already a member of this team');
    }

    // Create invitation
    const invitation = this.teamInvitationRepository.create({
      team_id: inviteMemberDto.teamId,
      invited_by_user_id: inviteMemberDto.invitedByUserId,
      invitee_email: inviteMemberDto.inviteeEmail,
      invited_role: inviteMemberDto.role,
      message: inviteMemberDto.message,
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    const savedInvitation = await this.teamInvitationRepository.save(invitation);

    // Log invitation activity
    await this.logTeamActivity(inviteMemberDto.teamId, inviteMemberDto.invitedByUserId, 'member_invited', {
      inviteeEmail: inviteMemberDto.inviteeEmail,
      role: inviteMemberDto.role,
    });

    this.logger.log(`Member invited to team ${inviteMemberDto.teamId}: ${inviteMemberDto.inviteeEmail}`);
    return savedInvitation;
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<TeamMember> {
    const invitation = await this.teamInvitationRepository.findOne({
      where: { id: invitationId, status: 'pending' },
      relations: ['team'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found or already processed');
    }

    if (invitation.invitee_email !== (await this.userRepository.findOne({ where: { id: userId } }))?.email) {
      throw new ForbiddenException('This invitation is not for you');
    }

    if (invitation.expires_at && invitation.expires_at < new Date()) {
      throw new BadRequestException('Invitation has expired');
    }

    // Check if team still has space
    if (invitation.team.current_member_count >= invitation.team.member_limit) {
      throw new BadRequestException('Team has reached the maximum member limit');
    }

    // Add user to team
    const teamMember = await this.addTeamMember(invitation.team_id, userId, invitation.invited_role);

    // Update invitation status
    invitation.status = 'accepted';
    await this.teamInvitationRepository.save(invitation);

    // Update team member count
    await this.updateTeamMemberCount(invitation.team_id);

    // Log acceptance activity
    await this.logTeamActivity(invitation.team_id, userId, 'member_added', {
      role: invitation.invited_role,
    });

    this.logger.log(`User ${userId} accepted invitation to team ${invitation.team_id}`);
    return teamMember;
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId: string, memberId: string, removedByUserId: string): Promise<void> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if remover has permission
    const removerMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: removedByUserId },
    });

    if (!removerMembership || !['owner', 'admin'].includes(removerMembership.role)) {
      throw new ForbiddenException('You do not have permission to remove members');
    }

    // Check if trying to remove owner
    if (team.owner_id === memberId) {
      throw new BadRequestException('Cannot remove team owner');
    }

    // Check if trying to remove self
    if (removedByUserId === memberId) {
      throw new BadRequestException('Cannot remove yourself from the team');
    }

    // Remove member
    await this.teamMemberRepository.update(
      { team_id: teamId, user_id: memberId },
      { is_active: false }
    );

    // Update team member count
    await this.updateTeamMemberCount(teamId);

    // Log removal activity
    await this.logTeamActivity(teamId, removedByUserId, 'member_removed', {
      removedMemberId: memberId,
    });

    this.logger.log(`Member ${memberId} removed from team ${teamId} by ${removedByUserId}`);
  }

  /**
   * Update member role
   */
  async updateMemberRole(updateMemberRoleDto: UpdateMemberRoleDto): Promise<TeamMember> {
    const team = await this.teamRepository.findOne({ where: { id: updateMemberRoleDto.teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if updater has permission
    const updaterMembership = await this.teamMemberRepository.findOne({
      where: { team_id: updateMemberRoleDto.teamId, user_id: updateMemberRoleDto.updatedByUserId },
    });

    if (!updaterMembership || updaterMembership.role !== TeamRole.OWNER) {
      throw new ForbiddenException('Only team owner can change member roles');
    }

    // Check if trying to change owner role
    if (team.owner_id === updateMemberRoleDto.memberId) {
      throw new BadRequestException('Cannot change owner role');
    }

    // Update role
    await this.teamMemberRepository.update(
      { team_id: updateMemberRoleDto.teamId, user_id: updateMemberRoleDto.memberId },
      { role: updateMemberRoleDto.newRole }
    );

    // Log role change activity
    await this.logTeamActivity(updateMemberRoleDto.teamId, updateMemberRoleDto.updatedByUserId, 'role_changed', {
      memberId: updateMemberRoleDto.memberId,
      newRole: updateMemberRoleDto.newRole,
    });

    this.logger.log(`Member ${updateMemberRoleDto.memberId} role updated to ${updateMemberRoleDto.newRole} in team ${updateMemberRoleDto.teamId}`);

    return this.teamMemberRepository.findOne({
      where: { team_id: updateMemberRoleDto.teamId, user_id: updateMemberRoleDto.memberId },
    });
  }

  /**
   * Share generation with team
   */
  async shareGenerationWithTeam(teamId: string, generationId: string, userId: string, title?: string, notes?: string): Promise<SharedGeneration> {
    const team = await this.teamRepository.findOne({ where: { id: teamId } });
    if (!team) {
      throw new NotFoundException('Team not found');
    }

    // Check if user is a member of the team
    const membership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: userId, is_active: true },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Get generation data
    const generation = await this.generationRepository.findOne({ where: { id: generationId } });
    if (!generation) {
      throw new NotFoundException('Generation not found');
    }

    // Create shared generation
    const sharedGeneration = this.teamRepository.manager.create(SharedGeneration, {
      team_id: teamId,
      generation_id: generationId,
      shared_by_user_id: userId,
      title: title || generation.title || 'Shared Generation',
      notes,
      ad_data: generation,
    });

    const savedSharedGeneration = await this.teamRepository.manager.save(sharedGeneration);

    // Log sharing activity
    await this.logTeamActivity(teamId, userId, 'generation_shared', {
      generationId,
      title: savedSharedGeneration.title,
    });

    this.logger.log(`Generation ${generationId} shared with team ${teamId} by user ${userId}`);
    return savedSharedGeneration;
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId: string, userId: string): Promise<TeamStats> {
    const team = await this.getTeamById(teamId, userId);

    const totalMembers = team.current_member_count;
    const activeMembers = team.members.filter(member => member.is_active).length;

    const totalGenerations = await this.generationRepository.count({
      where: { user_id: { $in: team.members.map(m => m.user_id) } as any },
    });

    const sharedGenerations = await this.teamRepository.manager.count(SharedGeneration, {
      where: { team_id: teamId, is_active: true },
    });

    const pendingInvitations = await this.teamInvitationRepository.count({
      where: { team_id: teamId, status: 'pending' },
    });

    const recentActivity = await this.teamActivityRepository.find({
      where: { team_id: teamId },
      order: { created_at: 'DESC' },
      take: 10,
      relations: ['user'],
    });

    return {
      totalMembers,
      activeMembers,
      totalGenerations,
      sharedGenerations,
      pendingInvitations,
      recentActivity,
    };
  }

  /**
   * Get pending invitations for a team
   */
  async getPendingInvitations(teamId: string, userId: string): Promise<TeamInvitation[]> {
    await this.getTeamById(teamId, userId); // Verify access

    return this.teamInvitationRepository.find({
      where: { team_id: teamId, status: 'pending' },
      relations: ['invited_by'],
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Check if user can create teams based on their plan
   */
  private canUserCreateTeam(user: User): { allowed: boolean; reason?: string } {
    if (user.plan === 'trial') {
      return { allowed: false, reason: 'Trial users cannot create teams. Upgrade to PRO or AGENCY to unlock team features.' };
    }

    if (user.plan === 'starter') {
      return { allowed: false, reason: 'STARTER users cannot create teams. Upgrade to PRO or AGENCY to unlock team features.' };
    }

    if (user.plan === 'pro') {
      return { allowed: true };
    }

    if (user.plan === 'agency') {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Unknown plan type' };
  }

  /**
   * Get member limit for user plan
   */
  private getMemberLimitForPlan(plan: string): number {
    switch (plan) {
      case 'pro':
        return 3;
      case 'agency':
        return 10;
      default:
        return 1; // No team features
    }
  }

  /**
   * Check if user plan has team features
   */
  private hasTeamFeatures(plan: string): boolean {
    return ['pro', 'agency'].includes(plan);
  }

  /**
   * Add member to team
   */
  private async addTeamMember(teamId: string, userId: string, role: TeamRole): Promise<TeamMember> {
    const teamMember = this.teamMemberRepository.create({
      team_id: teamId,
      user_id: userId,
      role,
      is_active: true,
      joined_at: new Date(),
    });

    return this.teamMemberRepository.save(teamMember);
  }

  /**
   * Update team member count
   */
  private async updateTeamMemberCount(teamId: string): Promise<void> {
    const activeMemberCount = await this.teamMemberRepository.count({
      where: { team_id: teamId, is_active: true },
    });

    await this.teamRepository.update(teamId, {
      current_member_count: activeMemberCount,
    });
  }

  /**
   * Log team activity
   */
  private async logTeamActivity(teamId: string, userId: string, activityType: string, activityData: any): Promise<void> {
    const activity = this.teamActivityRepository.create({
      team_id: teamId,
      user_id: userId,
      activity_type: activityType,
      activity_data: activityData,
      description: this.getActivityDescription(activityType, activityData),
    });

    await this.teamActivityRepository.save(activity);
  }

  /**
   * Get human-readable activity description
   */
  private getActivityDescription(activityType: string, activityData: any): string {
    switch (activityType) {
      case 'team_created':
        return `Team "${activityData.teamName}" created`;
      case 'member_invited':
        return `Invited ${activityData.inviteeEmail} as ${activityData.role}`;
      case 'member_added':
        return `Joined team as ${activityData.role}`;
      case 'member_removed':
        return 'Member removed from team';
      case 'role_changed':
        return `Role changed to ${activityData.newRole}`;
      case 'generation_shared':
        return `Shared generation: ${activityData.title}`;
      default:
        return 'Team activity';
    }
  }
}