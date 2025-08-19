'use client';

import { Team, TeamRole } from '@/app/types/team';
import { useState } from 'react';
import InviteMemberModal from './InviteMemberModal';
import TeamMemberModal from './TeamMemberModal';

interface TeamCardProps {
  team: Team;
  onUpdate: (team: Team) => void;
  onDelete: (teamId: string) => void;
}

export default function TeamCard({ team, onUpdate, onDelete }: TeamCardProps) {
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${team.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/teams/${team.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        onDelete(team.id);
      } else {
        alert('Failed to delete team');
      }
    } catch (err) {
      alert('Error deleting team');
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleColor = (role: TeamRole) => {
    switch (role) {
      case TeamRole.OWNER:
        return 'bg-purple-100 text-purple-800';
      case TeamRole.ADMIN:
        return 'bg-red-100 text-red-800';
      case TeamRole.MEMBER:
        return 'bg-blue-100 text-blue-800';
      case TeamRole.VIEWER:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberLimit = () => {
    switch (team.plan_tier) {
      case 'pro':
        return 3;
      case 'agency':
        return 10;
      default:
        return 0;
    }
  };

  const memberLimit = getMemberLimit();
  const canInvite = team.current_member_count < memberLimit;

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{team.name}</h3>
              {team.description && (
                <p className="text-sm text-gray-600 mb-3">{team.description}</p>
              )}
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  {team.current_member_count} / {memberLimit} members
                </span>
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                  </svg>
                  {new Date(team.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getRoleColor(TeamRole.OWNER)}`}>
                {team.plan_tier}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-3">
          <div className="flex space-x-2">
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Members
            </button>
            <button
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!canInvite}
              className="flex-1 px-3 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Invite Member
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => {/* TODO: Implement team settings */}}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Settings
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1 px-3 py-2 text-sm font-medium text-red-700 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {isDeleting ? 'Deleting...' : 'Delete Team'}
            </button>
          </div>
        </div>

        {/* Member Limit Warning */}
        {!canInvite && (
          <div className="px-6 pb-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <svg className="h-5 w-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Member limit reached</p>
                  <p>Upgrade your plan to add more team members</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TeamMemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        team={team}
        onUpdate={onUpdate}
      />

      <InviteMemberModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        team={team}
        onUpdate={onUpdate}
      />
    </>
  );
}
