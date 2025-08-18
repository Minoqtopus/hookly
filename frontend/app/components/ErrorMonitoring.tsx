'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Activity, Clock, TrendingUp } from 'lucide-react';

interface ErrorStats {
  total: number;
  byLevel: Record<string, number>;
  byMessage: Record<string, number>;
  recent: Array<{
    id: string;
    timestamp: string;
    level: string;
    message: string;
    userId?: string;
    url?: string;
  }>;
}

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    used: number;
    total: number;
  };
  errorStats: ErrorStats;
}

export default function ErrorMonitoring() {
  const [errorStats, setErrorStats] = useState<ErrorStats | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [timeWindow, setTimeWindow] = useState(60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [errorsResponse, healthResponse] = await Promise.all([
        fetch(`/api/monitoring/errors?timeWindow=${timeWindow}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
        fetch('/api/monitoring/health', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        }),
      ]);

      if (!errorsResponse.ok || !healthResponse.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const [errors, health] = await Promise.all([
        errorsResponse.json(),
        healthResponse.json(),
      ]);

      setErrorStats(errors);
      setHealthStatus(health);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [timeWindow]);

  const formatUptime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getErrorLevelColor = (level: string): string => {
    switch (level) {
      case 'fatal': return 'text-red-600 bg-red-50';
      case 'error': return 'text-orange-600 bg-orange-50';
      case 'warn': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading monitoring data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center">
          <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
          <span className="text-red-800">Failed to load monitoring data: {error}</span>
        </div>
        <button
          onClick={fetchData}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Time Window Selector */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">Time Window:</label>
        <select
          value={timeWindow}
          onChange={(e) => setTimeWindow(Number(e.target.value))}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm"
        >
          <option value={15}>Last 15 minutes</option>
          <option value={60}>Last hour</option>
          <option value={240}>Last 4 hours</option>
          <option value={1440}>Last 24 hours</option>
        </select>
        <button
          onClick={fetchData}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Health Status */}
      {healthStatus && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{healthStatus.status}</div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{formatUptime(healthStatus.uptime)}</div>
              <div className="text-sm text-gray-500">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {healthStatus.memory.used}/{healthStatus.memory.total}MB
              </div>
              <div className="text-sm text-gray-500">Memory</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{errorStats?.total || 0}</div>
              <div className="text-sm text-gray-500">Errors ({timeWindow}m)</div>
            </div>
          </div>
        </div>
      )}

      {/* Error Statistics */}
      {errorStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Error Levels */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Error Levels
            </h3>
            {Object.keys(errorStats.byLevel).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(errorStats.byLevel).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getErrorLevelColor(level)}`}>
                      {level.toUpperCase()}
                    </span>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No errors in this time window</p>
            )}
          </div>

          {/* Recent Errors */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Recent Errors
            </h3>
            {errorStats.recent.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {errorStats.recent.map((error) => (
                  <div key={error.id} className="border-l-4 border-red-500 pl-3 py-2 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getErrorLevelColor(error.level)}`}>
                        {error.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(error.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mt-1 font-medium">{error.message}</p>
                    {error.url && (
                      <p className="text-xs text-gray-500 mt-1">{error.url}</p>
                    )}
                    {error.userId && (
                      <p className="text-xs text-blue-600 mt-1">User: {error.userId}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent errors</p>
            )}
          </div>
        </div>
      )}

      {/* Common Error Messages */}
      {errorStats && Object.keys(errorStats.byMessage).length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Common Error Messages</h3>
          <div className="space-y-2">
            {Object.entries(errorStats.byMessage)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 10)
              .map(([message, count]) => (
                <div key={message} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-800 flex-1 mr-4">{message}</span>
                  <span className="text-sm font-medium text-red-600">{count}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}