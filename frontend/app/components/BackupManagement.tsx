'use client';

import { useState, useEffect } from 'react';
import { Download, Trash2, RefreshCw, Database, Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface BackupInfo {
  filename: string;
  size: number;
  created: string;
  type: 'full' | 'schema' | 'data';
  compressed: boolean;
}

interface BackupStats {
  totalBackups: number;
  totalSize: number;
  oldestBackup?: string;
  newestBackup?: string;
}

export default function BackupManagement() {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operationLoading, setOperationLoading] = useState<string | null>(null);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/backup', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch backups');
      }

      const data = await response.json();
      setBackups(data.backups || []);
      setStats(data.stats || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async (type: 'full' | 'schema' | 'data') => {
    try {
      setOperationLoading(`create-${type}`);
      setError(null);

      const response = await fetch(`/api/backup/create/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Backup creation failed');
      }

      await fetchBackups(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleDeleteBackup = async (filename: string) => {
    if (!confirm(`Are you sure you want to delete backup: ${filename}?`)) {
      return;
    }

    try {
      setOperationLoading(`delete-${filename}`);
      setError(null);

      const response = await fetch(`/api/backup/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Backup deletion failed');
      }

      await fetchBackups(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleTestBackup = async (filename: string) => {
    try {
      setOperationLoading(`test-${filename}`);
      setError(null);

      const response = await fetch(`/api/backup/test/${filename}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (result.valid) {
        alert(`Backup ${filename} is valid!`);
      } else {
        alert(`Backup ${filename} is invalid: ${result.error}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setOperationLoading(null);
    }
  };

  const handleRestoreBackup = async (filename: string) => {
    const confirmText = `RESTORE ${filename}`;
    const userInput = prompt(
      `⚠️ WARNING: This will restore the database from backup ${filename}. This action CANNOT be undone and will overwrite all current data.\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      return;
    }

    try {
      setOperationLoading(`restore-${filename}`);
      setError(null);

      const response = await fetch(`/api/backup/restore/${filename}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Backup restoration failed');
      }

      alert('Database restored successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setOperationLoading(null);
    }
  };

  const formatSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getBackupTypeColor = (type: string): string => {
    switch (type) {
      case 'full': return 'bg-green-100 text-green-800';
      case 'schema': return 'bg-blue-100 text-blue-800';
      case 'data': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading backup data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-800">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm text-red-600 hover:text-red-800"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Backup Stats */}
      {stats && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Backup Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.totalBackups}</div>
              <div className="text-sm text-gray-500">Total Backups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{formatSize(stats.totalSize)}</div>
              <div className="text-sm text-gray-500">Total Size</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-purple-600">
                {stats.newestBackup ? formatDate(stats.newestBackup) : 'None'}
              </div>
              <div className="text-sm text-gray-500">Latest Backup</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-orange-600">
                {stats.oldestBackup ? formatDate(stats.oldestBackup) : 'None'}
              </div>
              <div className="text-sm text-gray-500">Oldest Backup</div>
            </div>
          </div>
        </div>
      )}

      {/* Create Backup Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Create Backup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => handleCreateBackup('full')}
            disabled={operationLoading === 'create-full'}
            className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {operationLoading === 'create-full' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Full Backup
          </button>
          <button
            onClick={() => handleCreateBackup('schema')}
            disabled={operationLoading === 'create-schema'}
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {operationLoading === 'create-schema' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Schema Only
          </button>
          <button
            onClick={() => handleCreateBackup('data')}
            disabled={operationLoading === 'create-data'}
            className="flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {operationLoading === 'create-data' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Database className="h-4 w-4 mr-2" />
            )}
            Data Only
          </button>
        </div>
      </div>

      {/* Backup List */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Available Backups
          </h3>
          <button
            onClick={fetchBackups}
            disabled={loading}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {backups.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No backups available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Filename
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {backups.map((backup) => (
                  <tr key={backup.filename}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {backup.filename}
                      {backup.compressed && (
                        <span className="ml-2 text-xs text-green-600">(compressed)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getBackupTypeColor(backup.type)}`}>
                        {backup.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatSize(backup.size)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(backup.created)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleTestBackup(backup.filename)}
                        disabled={operationLoading === `test-${backup.filename}`}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      >
                        {operationLoading === `test-${backup.filename}` ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleRestoreBackup(backup.filename)}
                        disabled={operationLoading === `restore-${backup.filename}`}
                        className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      >
                        {operationLoading === `restore-${backup.filename}` ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteBackup(backup.filename)}
                        disabled={operationLoading === `delete-${backup.filename}`}
                        className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      >
                        {operationLoading === `delete-${backup.filename}` ? (
                          <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Warning Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-yellow-800 mb-1">Important Notes</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Backups are automatically created daily at 2 AM</li>
              <li>• Schema backups are created weekly on Sundays at 3 AM</li>
              <li>• Restoring a backup will overwrite all current data - this cannot be undone</li>
              <li>• Test backups before restoring to ensure they are valid</li>
              <li>• Old backups are automatically cleaned up to maintain disk space</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}