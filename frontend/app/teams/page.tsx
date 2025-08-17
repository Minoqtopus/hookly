'use client';

import AuthModal from '@/app/components/AuthModal';
import { useAuth } from '@/app/lib/AppContext';
import { AuthService } from '@/app/lib/auth';
import { toast } from '../lib/toast';
import {
  ArrowLeft,
  Crown,
  Eye,
  Plus,
  Share2,
  Shield,
  Trash2,
  UserPlus,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Team {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  member_limit: number;
  is_active: boolean;
  created_at: string;
  owner: {
    email: string;
  };
}

interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  is_active: boolean;
  user: {
    email: string;
  };
}

interface SharedGeneration {
  id: string;
  title: string;
  notes: string;
  ad_data: any;
  created_at: string;
  shared_by: {
    email: string;
  };
}

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [sharedGenerations, setSharedGenerations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  
  const { user, isAuthenticated } = useAuth();

  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'admin' | 'viewer'>('member');

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    if (user?.plan !== 'agency') {
      router.push('/dashboard?upgrade=agency');
      return;
    }

    loadTeams();
  }, [isAuthenticated, user, router]);

  const loadTeams = async () => {
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) {
        setError('No authentication tokens found');
        return;
      }

      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load teams');

      const data = await response.json();
      setTeams(data.teams);
      
      if (data.teams.length > 0) {
        setSelectedTeam(data.teams[0]);
        loadTeamMembers(data.teams[0].id);
        loadSharedGenerations(data.teams[0].id);
      }
    } catch (error) {
      setError('Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) return;

      const response = await fetch(`/api/teams/${teamId}/members`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load team members');

      const data = await response.json();
      setTeamMembers(data.members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    }
  };

  const loadSharedGenerations = async (teamId: string) => {
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) return;

      const response = await fetch(`/api/teams/${teamId}/shared`, {
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load shared generations');

      const data = await response.json();
      setSharedGenerations(data.sharedGenerations);
    } catch (error) {
      console.error('Failed to load shared generations:', error);
    }
  };

  const createTeam = async () => {
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) {
        setError('No authentication tokens found');
        return;
      }

      const response = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          name: teamName,
          description: teamDescription,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create team');
      }

      const data = await response.json();
      setTeams([...teams, data.team]);
      setTeamName('');
      setTeamDescription('');
      setShowCreateTeam(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create team');
    }
  };

  const inviteUser = async () => {
    try {
      const tokens = AuthService.getStoredTokens();
      if (!tokens) {
        setError('No authentication tokens found');
        return;
      }

      const response = await fetch(`/api/teams/${selectedTeam.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to invite user');
      }

      toast.success('Invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteRole('member');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite user');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'viewer':
        return <Eye className="h-4 w-4 text-gray-500" />;
      default:
        return <Users className="h-4 w-4 text-green-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (user?.plan !== 'agency') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Crown className="h-16 w-16 text-primary-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agency Feature</h1>
          <p className="text-gray-600 mb-4">Team collaboration is available with Agency plan</p>
          <Link href="/dashboard?upgrade=agency" className="btn-primary">
            Upgrade to Agency
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div className="flex items-center space-x-2">
                <Users className="h-6 w-6 text-primary-600" />
                <span className="font-bold text-gray-900">Team Collaboration</span>
              </div>
            </div>
            
            {teams.length === 0 && (
              <button
                onClick={() => setShowCreateTeam(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Team
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {teams.length === 0 ? (
          // No teams state
          <div className="text-center py-12">
            <Users className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Create Your First Team</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Collaborate with your team members, share ad generations, and manage projects together.
            </p>
            
            {showCreateTeam ? (
              <div className="max-w-md mx-auto card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Team</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Team name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="input-field"
                  />
                  <textarea
                    placeholder="Team description (optional)"
                    value={teamDescription}
                    onChange={(e) => setTeamDescription(e.target.value)}
                    className="input-field"
                    rows={3}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={createTeam}
                      disabled={!teamName.trim()}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Create Team
                    </button>
                    <button
                      onClick={() => setShowCreateTeam(false)}
                      className="btn-secondary flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowCreateTeam(true)}
                className="btn-primary text-lg px-8 py-4"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your Team
              </button>
            )}
          </div>
        ) : (
          // Teams dashboard
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Team Sidebar */}
            <div className="lg:col-span-1">
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Your Teams</h3>
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                    title="Invite member"
                  >
                    <UserPlus className="h-4 w-4" />
                  </button>
                </div>
                
                {teams.map((team) => (
                  <div
                    key={team.id}
                    onClick={() => {
                      setSelectedTeam(team);
                      loadTeamMembers(team.id);
                      loadSharedGenerations(team.id);
                    }}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedTeam?.id === team.id ? 'bg-primary-50 border-primary-200' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{team.name}</h4>
                        <p className="text-sm text-gray-600">{team.description}</p>
                      </div>
                      <Crown className="h-4 w-4 text-yellow-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {selectedTeam && (
                <>
                  {/* Team Header */}
                  <div className="card">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">{selectedTeam.name}</h2>
                        <p className="text-gray-600">{selectedTeam.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {teamMembers.length}/{selectedTeam.member_limit} members
                        </span>
                        <button
                          onClick={() => setShowInviteModal(true)}
                          className="btn-primary"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-4">Team Members</h3>
                    <div className="space-y-2">
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getRoleIcon(member.role)}
                            <div>
                              <p className="font-medium text-gray-900">{member.user.email}</p>
                              <p className="text-sm text-gray-600 capitalize">{member.role}</p>
                            </div>
                          </div>
                          {member.role !== 'owner' && (
                            <button className="text-gray-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shared Generations */}
                  <div className="card">
                    <h3 className="font-semibold text-gray-900 mb-4">Shared Ads</h3>
                    {sharedGenerations.length === 0 ? (
                      <div className="text-center py-8">
                        <Share2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No shared ads yet</p>
                        <p className="text-sm text-gray-500">Team members can share their generated ads here</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {sharedGenerations.map((generation) => (
                          <div key={generation.id} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium text-gray-900">{generation.title}</h4>
                              <span className="text-sm text-gray-600">
                                by {generation.shared_by.email}
                              </span>
                            </div>
                            {generation.notes && (
                              <p className="text-sm text-gray-600 mb-2">{generation.notes}</p>
                            )}
                            <div className="text-xs text-gray-500">
                              Shared {new Date(generation.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invite Team Member</h3>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="input-field"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as 'member' | 'admin' | 'viewer')}
                className="input-field"
              >
                <option value="viewer">Viewer - Can view shared content</option>
                <option value="member">Member - Can share and view content</option>
                <option value="admin">Admin - Can manage team and content</option>
              </select>
              <div className="flex space-x-3">
                <button
                  onClick={inviteUser}
                  disabled={!inviteEmail.trim()}
                  className="btn-primary flex-1 disabled:opacity-50"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteEmail('');
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource="login"
      />
    </div>
  );
}