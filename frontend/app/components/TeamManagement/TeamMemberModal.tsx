'use client';

import { Team, TeamMember, TeamRole } from '@/app/types/team';
import { useEffect, useState } from 'react';

interface TeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team;
  onUpdate: (team: Team) => void;
}

export default function TeamMemberModal({ isOpen, onClose, team, onUpdate }: TeamMemberModalProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && team) {
      fetchTeamMembers();
    }
  }, [isOpen, team]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const teamData = await response.json();
        setMembers(teamData.members || []);
      } else {
        setError('Failed to fetch team members');
      }
    } catch (err) {
      setError('Error fetching team members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: TeamRole) => {
    try {
      const response = await fetch(`/api/teams/${team.id}/members/${memberId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        onUpdate(updatedTeam);
        fetchTeamMembers(); // Refresh members
      } else {
        alert('Failed to update member role');
      }
    } catch (err) {
      alert('Error updating member role');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teams/${team.id}/members/${memberId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const updatedTeam = await response.json();
        onUpdate(updatedTeam);
        fetchTeamMembers(); // Refresh members
      } else {
        alert('Failed to remove member');
      }
    } catch (err) {
      alert('Error removing member');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Manage Team Members - {team.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading members...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="text-red-600 mb-4">{error}</div>
              <button 
                onClick={fetchTeamMembers}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {members.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No team members found</p>
                </div>
              ) : (
                members.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-gray-300 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {member.user?.name?.[0] || member.user?.email?.[0] || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {member.user?.name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-gray-500">{member.user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <select
                        value={member.role}
                        onChange={(e) => handleRoleChange(member.id, e.target.value as TeamRole)}
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        disabled={member.role === TeamRole.OWNER}
                      >
                        <option value={TeamRole.OWNER}>Owner</option>
                        <option value={TeamRole.ADMIN}>Admin</option>
                        <option value={TeamRole.MEMBER}>Member</option>
                        <option value={TeamRole.VIEWER}>Viewer</option>
                      </select>
                      
                      {member.role !== TeamRole.OWNER && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
