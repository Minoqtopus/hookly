import { Controller, Post, Get, Put, Delete, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeamRole } from '../entities/team.entity';

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
    const team = await this.teamsService.createTeam(req.user.userId, name, description);
    return { success: true, team };
  }

  @Get()
  async getUserTeams(@Request() req: any) {
    const teams = await this.teamsService.getUserTeams(req.user.userId);
    return { teams };
  }

  @Get(':teamId/members')
  async getTeamMembers(@Request() req: any, @Param('teamId') teamId: string) {
    const members = await this.teamsService.getTeamMembers(teamId, req.user.userId);
    return { members };
  }

  @Post(':teamId/invite')
  async inviteUser(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Body() body: { email: string; role?: TeamRole }
  ) {
    const { email, role = TeamRole.MEMBER } = body;
    const result = await this.teamsService.inviteUserToTeam(teamId, req.user.userId, email, role);
    return result;
  }

  @Delete(':teamId/members/:memberId')
  async removeTeamMember(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string
  ) {
    const result = await this.teamsService.removeTeamMember(teamId, req.user.userId, memberId);
    return result;
  }

  @Put(':teamId/members/:memberId/role')
  async updateMemberRole(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Param('memberId') memberId: string,
    @Body() body: { role: TeamRole }
  ) {
    const { role } = body;
    const result = await this.teamsService.updateTeamMemberRole(teamId, req.user.userId, memberId, role);
    return result;
  }

  @Post(':teamId/share')
  async shareGeneration(
    @Request() req: any,
    @Param('teamId') teamId: string,
    @Body() body: { generationId: string; title?: string; notes?: string }
  ) {
    const { generationId, title, notes } = body;
    const sharedGeneration = await this.teamsService.shareGenerationWithTeam(
      req.user.userId,
      generationId,
      teamId,
      title,
      notes
    );
    return { success: true, sharedGeneration };
  }

  @Get(':teamId/shared')
  async getTeamSharedGenerations(@Request() req: any, @Param('teamId') teamId: string) {
    const sharedGenerations = await this.teamsService.getTeamSharedGenerations(teamId, req.user.userId);
    return { sharedGenerations };
  }
}