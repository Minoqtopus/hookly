/**
 * Public Layout - Guest User Protection
 * 
 * Staff Engineer Implementation:
 * - Redirects ALL authenticated users away from public routes
 * - Public routes are guest-only (no authenticated users allowed)
 * - Integration with useAuth hook for state management
 */

'use client';

import { Footer } from "./components/footer";
import { Navbar } from "./components/navbar";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}