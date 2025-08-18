'use client';

import { Activity, Book, Code, Database, ExternalLink, Shield } from 'lucide-react';
import { useState } from 'react';

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
  rateLimit: string;
  admin?: boolean;
}

export default function ApiDocumentation() {
  const [activeSection, setActiveSection] = useState('overview');

  const sections = [
    { id: 'overview', title: 'Overview', icon: Book },
    { id: 'authentication', title: 'Authentication', icon: Shield },
    { id: 'generation', title: 'Generation API', icon: Code },
    { id: 'monitoring', title: 'Monitoring', icon: Activity },
    { id: 'backup', title: 'Backup Management', icon: Database },
  ];

  const apiEndpoints: Record<string, ApiEndpoint[]> = {
    generation: [
      {
        method: 'POST',
        path: '/api/generate',
        description: 'Generate AI-powered ad content',
        auth: true,
        rateLimit: '10 req/min',
      },
      {
        method: 'POST',
        path: '/api/generate/variations',
        description: 'Generate content variations',
        auth: true,
        rateLimit: '10 req/min',
      },
      {
        method: 'POST',
        path: '/api/generate/guest',
        description: 'Generate content as guest user',
        auth: false,
        rateLimit: '3 req/5min',
      },
      {
        method: 'GET',
        path: '/api/generate/history',
        description: 'Get user generation history',
        auth: true,
        rateLimit: '100 req/min',
      },
    ],
    monitoring: [
      {
        method: 'GET',
        path: '/api/monitoring/errors',
        description: 'Get error statistics',
        auth: true,
        rateLimit: '200 req/min',
        admin: true,
      },
      {
        method: 'GET',
        path: '/api/monitoring/health',
        description: 'Get system health status',
        auth: true,
        rateLimit: '200 req/min',
        admin: true,
      },
      {
        method: 'GET',
        path: '/api/monitoring/logs',
        description: 'View system logs',
        auth: true,
        rateLimit: '200 req/min',
        admin: true,
      },
    ],
    backup: [
      {
        method: 'GET',
        path: '/api/backup',
        description: 'List all available backups',
        auth: true,
        rateLimit: '200 req/min',
        admin: true,
      },
      {
        method: 'POST',
        path: '/api/backup/create/full',
        description: 'Create full database backup',
        auth: true,
        rateLimit: '200 req/min',
        admin: true,
      },
      {
        method: 'POST',
        path: '/api/backup/restore/:filename',
        description: 'Restore database from backup',
        auth: true,
        rateLimit: '200 req/min',
        admin: true,
      },
    ],
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">API Overview</h2>
              <p className="text-gray-600 mb-4">
                The Hookly API provides comprehensive access to our AI-powered ad generation platform. 
                This RESTful API allows you to integrate Hookly's features into your applications.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Base URL</h3>
              <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">
                {typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.com'}/api
              </code>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-green-900 mb-2">Interactive Documentation</h3>
              <p className="text-green-700 mb-3">
                Access our interactive Swagger/OpenAPI documentation for detailed endpoint information and testing.
              </p>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Swagger Documentation
              </a>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Key Features</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• AI-powered ad content generation</li>
                <li>• Rate limiting and throttling for API protection</li>
                <li>• Comprehensive error monitoring and logging</li>
                <li>• Automated database backup and recovery</li>
                <li>• Real-time analytics and usage tracking</li>
                <li>• Team collaboration and sharing features</li>
              </ul>
            </div>
          </div>
        );

      case 'authentication':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
              <p className="text-gray-600 mb-4">
                The Hookly API uses JWT (JSON Web Tokens) for authentication. Include your token in the Authorization header.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Header Format</h3>
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                <code>Authorization: Bearer YOUR_JWT_TOKEN</code>
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Authentication Endpoints</h3>
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Login</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">POST</span>
                  </div>
                  <code className="text-sm text-gray-600">/api/auth/login</code>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Register</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">POST</span>
                  </div>
                  <code className="text-sm text-gray-600">/api/auth/register</code>
                </div>
                <div className="border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Refresh Token</span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">POST</span>
                  </div>
                  <code className="text-sm text-gray-600">/api/auth/refresh</code>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-yellow-900 mb-2">Rate Limiting</h3>
              <p className="text-yellow-700">
                Authentication endpoints have rate limiting to prevent abuse:
              </p>
              <ul className="text-yellow-700 mt-2 space-y-1">
                <li>• Login: 5 attempts per 5 minutes</li>
                <li>• Register: 3 registrations per hour</li>
                <li>• Email verification: 3 requests per 5 minutes</li>
              </ul>
            </div>
          </div>
        );

      case 'generation':
      case 'monitoring':
      case 'backup':
        const endpoints = apiEndpoints[activeSection as keyof typeof apiEndpoints] || [];
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {sections.find(s => s.id === activeSection)?.title} API
              </h2>
              <p className="text-gray-600 mb-4">
                {activeSection === 'generation' && 'Generate AI-powered ad content and manage generation history.'}
                {activeSection === 'monitoring' && 'Monitor system health, errors, and performance metrics.'}
                {activeSection === 'backup' && 'Manage database backups and recovery operations.'}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Available Endpoints</h3>
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <code className="text-sm font-mono text-gray-800">{endpoint.path}</code>
                    </div>
                    <div className="flex items-center space-x-2">
                      {endpoint.auth && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Auth Required</span>
                      )}
                      {endpoint.admin && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Admin Only</span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 mb-2">{endpoint.description}</p>
                  <div className="text-xs text-gray-500">
                    Rate limit: {endpoint.rateLimit}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-blue-900 mb-2">Need More Details?</h3>
              <p className="text-blue-700 mb-3">
                For complete request/response schemas, parameter details, and interactive testing, 
                visit our Swagger documentation.
              </p>
              <a
                href="/api/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View in Swagger
              </a>
            </div>
          </div>
        );

      default:
        return <div>Section not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h1 className="text-xl font-bold text-gray-900 mb-6">API Documentation</h1>
        <nav className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {section.title}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-8">
          {renderSection()}
        </div>
      </div>
    </div>
  );
}