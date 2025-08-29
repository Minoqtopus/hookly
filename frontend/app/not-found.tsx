/**
 * 404 Not Found Page
 * 
 * Staff Engineer Design: Clean 404 page without dependencies
 * Works for both authenticated and unauthenticated users
 */

'use client';

import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600 mb-6">
          404
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Page Not Found
        </h1>
        
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors inline-flex items-center justify-center"
          >
            <Home className="h-4 w-4 mr-2" />
            Go Home
          </Link>

          <div className="flex gap-3">
            <button
              onClick={() => router.back()}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2 inline" />
              Back
            </button>

            <Link
              href="/demo"
              className="flex-1 border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors text-center"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}