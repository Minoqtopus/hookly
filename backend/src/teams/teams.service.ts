import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserPlan } from '../entities/user.entity';
import { Team, TeamMember, SharedGeneration, TeamRole } from '../entities/team.entity';
import { Generation } from '../entities/generation.entity';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(SharedGeneration)
    private sharedGenerationRepository: Repository<SharedGeneration>,
    @InjectRepository(Generation)
    private generationRepository: Repository<Generation>,
  ) {}

  async createTeam(userId: string, name: string, description?: string): Promise<Team> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Only Agency plan users can create teams
    if (user.plan !== UserPlan.AGENCY) {
      throw new ForbiddenException('Team creation is an Agency feature. Upgrade to Agency plan to create teams.');
    }

    // Check if user already owns a team (limit 1 team per Agency user for now)
    const existingTeam = await this.teamRepository.findOne({
      where: { owner_id: userId, is_active: true }
    });

    if (existingTeam) {
      throw new BadRequestException('You already have an active team. Contact support to create additional teams.');
    }

    const team = this.teamRepository.create({
      name,
      description,
      owner_id: userId,
      member_limit: 10 // Agency plan gets 10 team members
    });

    const savedTeam = await this.teamRepository.save(team);

    // Add owner as team member with owner role
    const ownerMember = this.teamMemberRepository.create({
      team_id: savedTeam.id,
      user_id: userId,
      role: TeamRole.OWNER,
      joined_at: new Date()
    });

    await this.teamMemberRepository.save(ownerMember);

    return savedTeam;
  }

  async inviteUserToTeam(teamId: string, inviterUserId: string, inviteEmail: string, role: TeamRole = TeamRole.MEMBER): Promise<{ success: boolean; message: string }> {
    // Verify inviter has permission
    const inviterMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: inviterUserId, is_active: true },
      relations: ['team']
    });

    if (!inviterMembership || !['owner', 'admin'].includes(inviterMembership.role)) {
      throw new ForbiddenException('You do not have permission to invite users to this team');
    }

    // Check if user to invite exists
    const inviteeUser = await this.userRepository.findOne({ where: { email: inviteEmail } });
    if (!inviteeUser) {
      return { success: false, message: 'User with this email does not exist. They need to sign up first.' };
    }

    // Check if user is already a team member
    const existingMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: inviteeUser.id }
    });

    if (existingMembership) {
      return { success: false, message: 'User is already a member of this team' };
    }

    // Check team member limit
    const currentMemberCount = await this.teamMemberRepository.count({
      where: { team_id: teamId, is_active: true }
    });

    if (currentMemberCount >= inviterMembership.team.member_limit) {
      return { success: false, message: 'Team has reached its member limit' };
    }

    // Create team member invitation
    const teamMember = this.teamMemberRepository.create({
      team_id: teamId,
      user_id: inviteeUser.id,
      role,
      invited_at: new Date(),
      joined_at: new Date(), // Auto-accept for now, could add invitation flow later
      is_active: true
    });

    await this.teamMemberRepository.save(teamMember);

    return { success: true, message: `Successfully added ${inviteEmail} to the team` };
  }

  async getUserTeams(userId: string): Promise<Team[]> {
    const memberships = await this.teamMemberRepository.find({
      where: { user_id: userId, is_active: true },
      relations: ['team', 'team.owner'],
    });

    return memberships.map(membership => membership.team);
  }

  async getTeamMembers(teamId: string, userId: string): Promise<TeamMember[]> {
    // Verify user is a team member
    const userMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: userId, is_active: true }
    });

    if (!userMembership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return this.teamMemberRepository.find({
      where: { team_id: teamId, is_active: true },
      relations: ['user'],
      order: { created_at: 'ASC' }
    });
  }

  async shareGenerationWithTeam(userId: string, generationId: string, teamId: string, title?: string, notes?: string): Promise<SharedGeneration> {
    // Verify user is a team member
    const userMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: userId, is_active: true }
    });

    if (!userMembership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    // Verify generation belongs to user
    const generation = await this.generationRepository.findOne({
      where: { id: generationId, user_id: userId }
    });

    if (!generation) {
      throw new NotFoundException('Generation not found or you do not have permission to share it');
    }

    // Check if generation is already shared with this team
    const existingShare = await this.sharedGenerationRepository.findOne({
      where: { generation_id: generationId, team_id: teamId, is_active: true }
    });

    if (existingShare) {
      throw new BadRequestException('This generation is already shared with the team');
    }

    const sharedGeneration = this.sharedGenerationRepository.create({
      generation_id: generationId,
      team_id: teamId,
      shared_by_user_id: userId,
      title: title || `Ad by ${userMembership.user?.email || 'Team Member'}`,
      notes,
      ad_data: {
        hook: generation.hook,
        script: generation.script,
        visuals: generation.visuals
      }
    });

    return this.sharedGenerationRepository.save(sharedGeneration);
  }

  async getTeamSharedGenerations(teamId: string, userId: string): Promise<SharedGeneration[]> {
    // Verify user is a team member
    const userMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: userId, is_active: true }
    });

    if (!userMembership) {
      throw new ForbiddenException('You are not a member of this team');
    }

    return this.sharedGenerationRepository.find({
      where: { team_id: teamId, is_active: true },
      relations: ['shared_by'],
      order: { created_at: 'DESC' }
    });
  }

  async removeTeamMember(teamId: string, removerId: string, memberIdToRemove: string): Promise<{ success: boolean; message: string }> {
    // Verify remover has permission
    const removerMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: removerId, is_active: true }
    });

    if (!removerMembership || !['owner', 'admin'].includes(removerMembership.role)) {
      throw new ForbiddenException('You do not have permission to remove team members');
    }

    // Cannot remove the team owner
    const memberToRemove = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: memberIdToRemove, is_active: true }
    });

    if (!memberToRemove) {
      throw new NotFoundException('Team member not found');
    }

    if (memberToRemove.role === TeamRole.OWNER) {
      throw new ForbiddenException('Cannot remove the team owner');
    }

    // Deactivate membership
    memberToRemove.is_active = false;
    await this.teamMemberRepository.save(memberToRemove);

    return { success: true, message: 'Team member removed successfully' };
  }

  async updateTeamMemberRole(teamId: string, updaterId: string, memberIdToUpdate: string, newRole: TeamRole): Promise<{ success: boolean; message: string }> {
    // Verify updater has permission (only owner can change roles)
    const updaterMembership = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: updaterId, is_active: true }
    });

    if (!updaterMembership || updaterMembership.role !== TeamRole.OWNER) {
      throw new ForbiddenException('Only team owners can update member roles');
    }

    // Cannot change owner role
    if (newRole === TeamRole.OWNER) {
      throw new ForbiddenException('Cannot assign owner role to another member');
    }

    const memberToUpdate = await this.teamMemberRepository.findOne({
      where: { team_id: teamId, user_id: memberIdToUpdate, is_active: true }
    });

    if (!memberToUpdate) {
      throw new NotFoundException('Team member not found');
    }

    if (memberToUpdate.role === TeamRole.OWNER) {
      throw new ForbiddenException('Cannot change the role of the team owner');
    }

    memberToUpdate.role = newRole;
    await this.teamMemberRepository.save(memberToUpdate);

    return { success: true, message: `Member role updated to ${newRole}` };
  }
}