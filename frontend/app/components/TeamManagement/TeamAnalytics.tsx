'use client';

import { Team } from '@/app/types/team';

interface TeamAnalyticsProps {
  teams: Team[];
}

export default function TeamAnalytics({ teams }: TeamAnalyticsProps) {
  const totalMembers = teams.reduce((sum, team) => sum + team.current_member_count, 0);
  const totalTeams = teams.length;
  
  const getPlanDistribution = () => {
    const distribution = teams.reduce((acc, team) => {
      acc[team.plan_tier] = (acc[team.plan_tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(distribution).map(([plan, count]) => ({
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      count,
      percentage: Math.round((count / totalTeams) * 100)
    }));
  };

  const planDistribution = getPlanDistribution();

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Team Analytics</h3>
        <p className="text-sm text-gray-600 mt-1">
          Overview of your team collaboration
        </p>
      </div>
      
      <div className="p-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-blue-600">Total Teams</p>
                <p className="text-2xl font-semibold text-blue-900">{totalTeams}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-600">Total Members</p>
                <p className="text-2xl font-semibold text-green-900">{totalMembers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-purple-600">Avg Team Size</p>
                <p className="text-2xl font-semibold text-purple-900">
                  {totalTeams > 0 ? Math.round(totalMembers / totalTeams) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Plan Distribution */}
        <div className="mb-8">
          <h4 className="text-md font-medium text-gray-900 mb-4">Plan Distribution</h4>
          <div className="space-y-3">
            {planDistribution.map(({ plan, count, percentage }) => (
              <div key={plan} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">{plan}</span>
                  <span className="ml-2 text-sm text-gray-500">({count} teams)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team List */}
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-4">Team Overview</h4>
          <div className="space-y-3">
            {teams.map(team => (
              <div key={team.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {team.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{team.name}</p>
                    <p className="text-xs text-gray-500">
                      {team.current_member_count} members • {team.plan_tier} plan
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {team.current_member_count} / {team.plan_tier === 'pro' ? 3 : team.plan_tier === 'agency' ? 10 : 0}
                  </p>
                  <p className="text-xs text-gray-500">members</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
