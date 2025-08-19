'use client';

import { useAuth } from '@/app/lib/AppContext';
import { Team, TeamInvitation } from '@/app/types/team';
import { useEffect, useState } from 'react';
import CreateTeamModal from './CreateTeamModal';
import TeamAnalytics from './TeamAnalytics';
import TeamCard from './TeamCard';
import TeamInvitations from './TeamInvitations';

interface TeamDashboardProps {
  className?: string;
}

export default function TeamDashboard({ className = '' }: TeamDashboardProps) {
  const { user } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchUserTeams();
      fetchTeamInvitations();
    }
  }, [user]);

  const fetchUserTeams = async () => {
    try {
      const response = await fetch('/api/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      } else {
        setError('Failed to fetch teams');
      }
    } catch (err) {
      setError('Error fetching teams');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamInvitations = async () => {
    try {
      const response = await fetch('/api/teams/invitations', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
    }
  };

  const handleTeamCreated = (newTeam: Team) => {
    setTeams(prev => [...prev, newTeam]);
    setIsCreateModalOpen(false);
  };

  const handleTeamUpdated = (updatedTeam: Team) => {
    setTeams(prev => prev.map(team => 
      team.id === updatedTeam.id ? updatedTeam : team
    ));
  };

  const handleTeamDeleted = (teamId: string) => {
    setTeams(prev => prev.filter(team => team.id !== teamId));
  };

  const handleInvitationAccepted = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
    fetchUserTeams(); // Refresh teams to show new member
  };

  const handleInvitationDeclined = (invitationId: string) => {
    setInvitations(prev => prev.filter(inv => inv.id !== invitationId));
  };

  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-4">{error}</div>
        <button 
          onClick={fetchUserTeams}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const canCreateTeam = user?.plan === 'pro' || user?.plan === 'agency';
  const teamLimit = user?.plan === 'pro' ? 1 : user?.plan === 'agency' ? 3 : 0;
  const currentTeamCount = teams.length;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-1">
            Collaborate with your team on content creation and sharing
          </p>
        </div>
        
        {canCreateTeam && (
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              disabled={currentTeamCount >= teamLimit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create New Team
            </button>
            {teamLimit > 0 && (
              <p className="text-sm text-gray-500 mt-2 text-center">
                {currentTeamCount}/{teamLimit} teams
              </p>
            )}
          </div>
        )}
      </div>

      {/* Team Limit Warning */}
      {!canCreateTeam && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Team features require PRO or AGENCY plan
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                Upgrade your plan to create teams and collaborate with your colleagues.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Team Invitations */}
      {invitations.length > 0 && (
        <TeamInvitations
          invitations={invitations}
          onAccept={handleInvitationAccepted}
          onDecline={handleInvitationDeclined}
        />
      )}

      {/* Teams Grid */}
      {teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map(team => (
            <TeamCard
              key={team.id}
              team={team}
              onUpdate={handleTeamUpdated}
              onDelete={handleTeamDeleted}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No teams yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first team to collaborate with colleagues.
          </p>
          {canCreateTeam && (
            <div className="mt-6">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Create Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team Analytics */}
      {teams.length > 0 && (
        <TeamAnalytics teams={teams} />
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTeamCreated={handleTeamCreated}
        currentTeamCount={currentTeamCount}
        teamLimit={teamLimit}
      />
    </div>
  );
}
