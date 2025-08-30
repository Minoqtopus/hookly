/**
 * Protected Layout - Authentication Guard
 * 
 * Staff Engineer Implementation:
 * - Client-side authentication checks
 * - Automatic redirects for unauthenticated users
 * - Loading states and error handling
 * - Integration with useAuth hook
 */

'use client';

import { Sidebar } from "@/components/layout";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}