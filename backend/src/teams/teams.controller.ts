import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRole } from '../entities/team.entity';
import { TeamsService } from './teams.service';

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
  constructor(private teamsService: TeamsService) {}

  @Post()
  async createTeam(
    @Request() req: any,
    @Body() body: { name: string; description?: string }
  ) {
    const { name, description } = body;
    const team = await this.teamsService.createTeam({
      name,
      description,
      ownerId: req.user.userId,
    });
    return { success: true, team };
  }

  @Get()
  async getUserTeams(@Request() req: any) {
    const teams = await this.teamsService.getUserTeams(req.user.userId);
    return { teams };
  }

  @Get(':teamId')
  async getTeam(@Request() req: any, @Param('teamId') teamId: string) {
    const team = await this.teamsService.getTeamById(teamId, req.user.userId);
    return { team };
  }

  @Post(':teamId/invite')
  async inviteUser(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Body() body: { email: string; role?: TeamRole; message?: string }
  ) {
    const { email, role = TeamRole.MEMBER, message } = body;
    const invitation = await this.teamsService.inviteMember({
      teamId,
      inviteeEmail: email,
      role,
      message,
      invitedByUserId: req.user.userId,
    });
    return { success: true, invitation };
  }

  @Delete(':teamId/members/:memberId')
  async removeMember(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    await this.teamsService.removeMember(teamId, memberId, req.user.userId);
    return { success: true, message: 'Member removed successfully' };
  }

  @Put(':teamId/members/:memberId/role')
  async updateMemberRole(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: TeamRole }
  ) {
    const { role } = body;
    const updatedMember = await this.teamsService.updateMemberRole({
      teamId,
      memberId,
      newRole: role,
      updatedByUserId: req.user.userId,
    });
    return { success: true, member: updatedMember };
  }

  @Post(':teamId/share')
  async shareGeneration(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Body() body: { generationId: string; title?: string; notes?: string }
  ) {
    const { generationId, title, notes } = body;
    const sharedGeneration = await this.teamsService.shareGenerationWithTeam(
      teamId,
      generationId,
      req.user.userId,
      title,
      notes
    );
    return { success: true, sharedGeneration };
  }

  @Get(':teamId/stats')
  async getTeamStats(@Request() req: any, @Param('teamId') teamId: string) {
    const stats = await this.teamsService.getTeamStats(teamId, req.user.userId);
    return { stats };
  }

  @Get(':teamId/invitations')
  async getPendingInvitations(@Request() req: any, @Param('teamId') teamId: string) {
    const invitations = await this.teamsService.getPendingInvitations(teamId, req.user.userId);
    return { invitations };
  }
}