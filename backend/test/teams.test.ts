import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Generation } from '../src/entities/generation.entity';
import { SharedGeneration, Team, TeamMember, TeamRole } from '../src/entities/team.entity';
import { User, UserPlan } from '../src/entities/user.entity';
import { TeamsService } from '../src/teams/teams.service';

describe('TeamsService', () => {
  let service: TeamsService;
  let userRepository: Repository<User>;
  let teamRepository: Repository<Team>;
  let teamMemberRepository: Repository<TeamMember>;
  let sharedGenerationRepository: Repository<SharedGeneration>;
  let generationRepository: Repository<Generation>;

  const mockAgencyUser = {
    id: 'user-1',
    email: 'agency@test.com',
    plan: UserPlan.AGENCY,
  };

  const mockProUser = {
    id: 'user-2',
    email: 'pro@test.com',
    plan: UserPlan.PRO,
  };

  const mockTeam = {
    id: 'team-1',
    name: 'Test Team',
    description: 'Test Description',
    owner_id: 'user-1',
    member_limit: 10,
    is_active: true,
  };

  const mockTeamMember = {
    id: 'member-1',
    team_id: 'team-1',
    user_id: 'user-1',
    role: TeamRole.OWNER,
    is_active: true,
  };

  const mockGeneration = {
    id: 'gen-1',
    user_id: 'user-1',
    output: {
      hook: 'Test hook',
      script: 'Test script',
      visuals: ['Test visual'],
    },
  };

  const mockRepositories = {
    userRepository: {
      findOne: jest.fn(),
    },
    teamRepository: {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
    teamMemberRepository: {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn(),
    },
    sharedGenerationRepository: {
      findOne: jest.fn(),
      find: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    },
    generationRepository: {
      findOne: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeamsService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepositories.userRepository,
        },
        {
          provide: getRepositoryToken(Team),
          useValue: mockRepositories.teamRepository,
        },
        {
          provide: getRepositoryToken(TeamMember),
          useValue: mockRepositories.teamMemberRepository,
        },
        {
          provide: getRepositoryToken(SharedGeneration),
          useValue: mockRepositories.sharedGenerationRepository,
        },
        {
          provide: getRepositoryToken(Generation),
          useValue: mockRepositories.generationRepository,
        },
      ],
    }).compile();

    service = module.get<TeamsService>(TeamsService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    teamRepository = module.get<Repository<Team>>(getRepositoryToken(Team));
    teamMemberRepository = module.get<Repository<TeamMember>>(getRepositoryToken(TeamMember));
    sharedGenerationRepository = module.get<Repository<SharedGeneration>>(getRepositoryToken(SharedGeneration));
    generationRepository = module.get<Repository<Generation>>(getRepositoryToken(Generation));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Team Creation', () => {
    test('should create team for agency user', async () => {
      mockRepositories.userRepository.findOne.mockResolvedValue(mockAgencyUser);
      mockRepositories.teamRepository.findOne.mockResolvedValue(null); // No existing team
      mockRepositories.teamRepository.create.mockReturnValue(mockTeam);
      mockRepositories.teamRepository.save.mockResolvedValue(mockTeam);
      mockRepositories.teamMemberRepository.create.mockReturnValue(mockTeamMember);
      mockRepositories.teamMemberRepository.save.mockResolvedValue(mockTeamMember);

      const result = await service.createTeam('user-1', 'Test Team', 'Test Description');

      expect(result).toEqual(mockTeam);
      expect(mockRepositories.teamRepository.create).toHaveBeenCalledWith({
        name: 'Test Team',
        description: 'Test Description',
        owner_id: 'user-1',
        member_limit: 10,
      });
    });

    test('should reject team creation for non-agency user', async () => {
      mockRepositories.userRepository.findOne.mockResolvedValue(mockProUser);

      await expect(
        service.createTeam('user-2', 'Test Team', 'Test Description')
      ).rejects.toThrow(ForbiddenException);
    });

    test('should reject team creation if user already has team', async () => {
      mockRepositories.userRepository.findOne.mockResolvedValue(mockAgencyUser);
      mockRepositories.teamRepository.findOne.mockResolvedValue(mockTeam); // Existing team

      await expect(
        service.createTeam('user-1', 'Test Team', 'Test Description')
      ).rejects.toThrow(BadRequestException);
    });

    test('should reject team creation for non-existent user', async () => {
      mockRepositories.userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.createTeam('user-1', 'Test Team', 'Test Description')
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('Team Invitations', () => {
    test('should invite user to team', async () => {
      const inviterMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
        team: mockTeam,
      };
      const inviteeUser = {
        id: 'user-3',
        email: 'invitee@test.com',
        plan: UserPlan.TRIAL,
      };

      mockRepositories.teamMemberRepository.findOne
        .mockResolvedValueOnce(inviterMembership) // Inviter check
        .mockResolvedValueOnce(null); // No existing membership
      mockRepositories.userRepository.findOne.mockResolvedValue(inviteeUser);
      mockRepositories.teamMemberRepository.count.mockResolvedValue(5); // Under limit
      mockRepositories.teamMemberRepository.create.mockReturnValue({
        team_id: 'team-1',
        user_id: 'user-3',
        role: TeamRole.MEMBER,
      });
      mockRepositories.teamMemberRepository.save.mockResolvedValue({});

      const result = await service.inviteUserToTeam(
        'team-1',
        'user-1',
        'invitee@test.com',
        TeamRole.MEMBER
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('Successfully added');
    });

    test('should reject invitation from non-admin', async () => {
      const memberMembership = {
        ...mockTeamMember,
        role: TeamRole.MEMBER,
      };

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(memberMembership);

      await expect(
        service.inviteUserToTeam('team-1', 'user-2', 'invitee@test.com')
      ).rejects.toThrow(ForbiddenException);
    });

    test('should reject invitation for non-existent user', async () => {
      const inviterMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
        team: mockTeam,
      };

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(inviterMembership);
      mockRepositories.userRepository.findOne.mockResolvedValue(null);

      const result = await service.inviteUserToTeam(
        'team-1',
        'user-1',
        'nonexistent@test.com'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('does not exist');
    });

    test('should reject invitation for existing member', async () => {
      const inviterMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
        team: mockTeam,
      };
      const inviteeUser = {
        id: 'user-3',
        email: 'invitee@test.com',
      };
      const existingMembership = {
        id: 'member-2',
        team_id: 'team-1',
        user_id: 'user-3',
      };

      mockRepositories.teamMemberRepository.findOne
        .mockResolvedValueOnce(inviterMembership)
        .mockResolvedValueOnce(existingMembership);
      mockRepositories.userRepository.findOne.mockResolvedValue(inviteeUser);

      const result = await service.inviteUserToTeam(
        'team-1',
        'user-1',
        'invitee@test.com'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('already a member');
    });

    test('should reject invitation when team is full', async () => {
      const inviterMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
        team: mockTeam,
      };
      const inviteeUser = {
        id: 'user-3',
        email: 'invitee@test.com',
      };

      mockRepositories.teamMemberRepository.findOne
        .mockResolvedValueOnce(inviterMembership)
        .mockResolvedValueOnce(null);
      mockRepositories.userRepository.findOne.mockResolvedValue(inviteeUser);
      mockRepositories.teamMemberRepository.count.mockResolvedValue(10); // At limit

      const result = await service.inviteUserToTeam(
        'team-1',
        'user-1',
        'invitee@test.com'
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('member limit');
    });
  });

  describe('Team Access Control', () => {
    test('should allow team member to view team members', async () => {
      const userMembership = {
        ...mockTeamMember,
        team_id: 'team-1',
        user_id: 'user-1',
        is_active: true,
      };
      const teamMembers = [userMembership];

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(userMembership);
      mockRepositories.teamMemberRepository.find.mockResolvedValue(teamMembers);

      const result = await service.getTeamMembers('team-1', 'user-1');

      expect(result).toEqual(teamMembers);
    });

    test('should reject non-member from viewing team members', async () => {
      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getTeamMembers('team-1', 'user-2')
      ).rejects.toThrow(ForbiddenException);
    });

    test('should return user teams', async () => {
      const memberships = [
        {
          team: mockTeam,
          user_id: 'user-1',
          is_active: true,
        },
      ];

      mockRepositories.teamMemberRepository.find.mockResolvedValue(memberships);

      const result = await service.getUserTeams('user-1');

      expect(result).toEqual([mockTeam]);
    });
  });

  describe('Generation Sharing', () => {
    test('should share generation with team', async () => {
      const userMembership = {
        ...mockTeamMember,
        user: { email: 'test@test.com' },
      };
      const sharedGeneration = {
        id: 'shared-1',
        generation_id: 'gen-1',
        team_id: 'team-1',
        shared_by_user_id: 'user-1',
        title: 'Shared Ad',
        ad_data: mockGeneration.output,
      };

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(userMembership);
      mockRepositories.generationRepository.findOne.mockResolvedValue(mockGeneration);
      mockRepositories.sharedGenerationRepository.findOne.mockResolvedValue(null);
      mockRepositories.sharedGenerationRepository.create.mockReturnValue(sharedGeneration);
      mockRepositories.sharedGenerationRepository.save.mockResolvedValue(sharedGeneration);

      const result = await service.shareGenerationWithTeam(
        'user-1',
        'gen-1',
        'team-1',
        'Shared Ad',
        'Test notes'
      );

      expect(result).toEqual(sharedGeneration);
    });

    test('should reject sharing from non-team member', async () => {
      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(null);

      await expect(
        service.shareGenerationWithTeam('user-2', 'gen-1', 'team-1')
      ).rejects.toThrow(ForbiddenException);
    });

    test('should reject sharing non-owned generation', async () => {
      const userMembership = { ...mockTeamMember };
      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(userMembership);
      mockRepositories.generationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.shareGenerationWithTeam('user-1', 'gen-1', 'team-1')
      ).rejects.toThrow(NotFoundException);
    });

    test('should reject duplicate sharing', async () => {
      const userMembership = { ...mockTeamMember };
      const existingShare = {
        id: 'shared-1',
        generation_id: 'gen-1',
        team_id: 'team-1',
      };

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(userMembership);
      mockRepositories.generationRepository.findOne.mockResolvedValue(mockGeneration);
      mockRepositories.sharedGenerationRepository.findOne.mockResolvedValue(existingShare);

      await expect(
        service.shareGenerationWithTeam('user-1', 'gen-1', 'team-1')
      ).rejects.toThrow(BadRequestException);
    });

    test('should get team shared generations', async () => {
      const userMembership = { ...mockTeamMember };
      const sharedGenerations = [
        {
          id: 'shared-1',
          title: 'Shared Ad 1',
          shared_by: { email: 'user1@test.com' },
        },
        {
          id: 'shared-2',
          title: 'Shared Ad 2',
          shared_by: { email: 'user2@test.com' },
        },
      ];

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(userMembership);
      mockRepositories.sharedGenerationRepository.find.mockResolvedValue(sharedGenerations);

      const result = await service.getTeamSharedGenerations('team-1', 'user-1');

      expect(result).toEqual(sharedGenerations);
    });
  });

  describe('Member Management', () => {
    test('should remove team member', async () => {
      const ownerMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
      };
      const memberToRemove = {
        id: 'member-2',
        team_id: 'team-1',
        user_id: 'user-3',
        role: TeamRole.MEMBER,
        is_active: true,
      };

      mockRepositories.teamMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce(memberToRemove);
      mockRepositories.teamMemberRepository.save.mockResolvedValue({
        ...memberToRemove,
        is_active: false,
      });

      const result = await service.removeTeamMember('team-1', 'user-1', 'user-3');

      expect(result.success).toBe(true);
      expect(mockRepositories.teamMemberRepository.save).toHaveBeenCalledWith({
        ...memberToRemove,
        is_active: false,
      });
    });

    test('should reject removing team owner', async () => {
      const ownerMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
      };
      const ownerToRemove = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
      };

      mockRepositories.teamMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce(ownerToRemove);

      await expect(
        service.removeTeamMember('team-1', 'user-1', 'user-1')
      ).rejects.toThrow(ForbiddenException);
    });

    test('should update member role', async () => {
      const ownerMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
      };
      const memberToUpdate = {
        id: 'member-2',
        team_id: 'team-1',
        user_id: 'user-3',
        role: TeamRole.MEMBER,
        is_active: true,
      };

      mockRepositories.teamMemberRepository.findOne
        .mockResolvedValueOnce(ownerMembership)
        .mockResolvedValueOnce(memberToUpdate);
      mockRepositories.teamMemberRepository.save.mockResolvedValue({
        ...memberToUpdate,
        role: TeamRole.ADMIN,
      });

      const result = await service.updateTeamMemberRole(
        'team-1',
        'user-1',
        'user-3',
        TeamRole.ADMIN
      );

      expect(result.success).toBe(true);
      expect(mockRepositories.teamMemberRepository.save).toHaveBeenCalledWith({
        ...memberToUpdate,
        role: TeamRole.ADMIN,
      });
    });

    test('should reject role update from non-owner', async () => {
      const adminMembership = {
        ...mockTeamMember,
        role: TeamRole.ADMIN,
      };

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(adminMembership);

      await expect(
        service.updateTeamMemberRole('team-1', 'user-2', 'user-3', TeamRole.ADMIN)
      ).rejects.toThrow(ForbiddenException);
    });

    test('should reject assigning owner role', async () => {
      const ownerMembership = {
        ...mockTeamMember,
        role: TeamRole.OWNER,
      };

      mockRepositories.teamMemberRepository.findOne.mockResolvedValue(ownerMembership);

      await expect(
        service.updateTeamMemberRole('team-1', 'user-1', 'user-3', TeamRole.OWNER)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});