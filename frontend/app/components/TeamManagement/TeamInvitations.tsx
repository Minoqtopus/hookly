'use client';

import { TeamInvitation } from '@/app/types/team';

interface TeamInvitationsProps {
  invitations: TeamInvitation[];
  onAccept: (invitationId: string) => void;
  onDecline: (invitationId: string) => void;
}

export default function TeamInvitations({ invitations, onAccept, onDecline }: TeamInvitationsProps) {
  if (invitations.length === 0) return null;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Team Invitations</h3>
        <p className="text-sm text-gray-600 mt-1">
          You have {invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {invitations.map(invitation => (
          <div key={invitation.id} className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      Invitation to join {invitation.team?.name || 'Team'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Invited by {invitation.invited_by?.name || invitation.invited_by?.email}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Role: {invitation.invited_role} • Sent {new Date(invitation.created_at).toLocaleDateString()}
                    </p>
                    {invitation.message && (
                      <p className="text-sm text-gray-600 mt-2 italic">"{invitation.message}"</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2 ml-4">
                <button
                  onClick={() => onAccept(invitation.id)}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Accept
                </button>
                <button
                  onClick={() => onDecline(invitation.id)}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Decline
                </button>
              </div>
            </div>
            
            {invitation.expires_at && (
              <div className="mt-3 text-xs text-gray-500">
                Expires: {new Date(invitation.expires_at).toLocaleDateString()}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
