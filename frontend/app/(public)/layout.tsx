'use client';

import PublicNavbar from "@/app/components/PublicNavbar";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  // Auth routing is now handled by middleware
  const pathname = usePathname();
  const isLandingPage = pathname === '/';
  
  return (
    <div className={isLandingPage ? 'hero-gradient-bg' : ''}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <PublicNavbar />
        {children}
      </div>
    </div>
  );
}