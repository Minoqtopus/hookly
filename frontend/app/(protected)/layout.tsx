/**
 * Protected Layout - Private Route Layout
 * 
 * Staff Engineer Design: Clean, scalable foundation
 * Business Logic: Basic layout structure for authenticated users
 */

'use client';

import { ReactNode } from 'react';

// ================================
// Types
// ================================

interface ProtectedLayoutProps {
  children: ReactNode;
}

// ================================
// Component
// ================================

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Viral Content Generator
              </h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="/dashboard" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Dashboard
              </a>
              <a href="/generate" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Generate
              </a>
              <a href="/history" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                History
              </a>
              <a href="/verification" className="text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium">
                Verify Email
              </a>
              <a href="/settings" className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                Settings
              </a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}