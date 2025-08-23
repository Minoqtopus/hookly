'use client';

import { PrivateNavbar } from "@/app/components";
import { useApp } from "@/app/lib/context";
import { ReactNode } from "react";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { actions } = useApp();
  
  const handleLogout = async () => {
    await actions.logout();
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <PrivateNavbar onLogout={handleLogout} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
}