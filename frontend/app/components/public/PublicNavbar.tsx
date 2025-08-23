'use client';

import AuthModal from '@/app/components/modals/AuthModal';
import { navbar } from '@/app/lib/copy/components/navbar';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function PublicNavbar() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTrigger, setAuthTrigger] = useState<'nav_signup' | 'login'>('nav_signup');
  const pathname = usePathname();

  // Hide navigation link on pricing and demo pages
  const shouldShowNavLink = pathname !== '/pricing' && pathname !== '/demo';

  return (
    <>
      <nav className="flex items-center justify-between mb-12">
        <Link href="/" className="flex items-center space-x-2">
          <Sparkles className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900">{navbar.brand}</span>
        </Link>
        <div className="hidden sm:flex items-center space-x-6">
          {shouldShowNavLink && (
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">
              {navbar.links.pricing}
            </Link>
          )}
          <button 
            onClick={() => {
              setAuthTrigger('login');
              setShowAuthModal(true);
            }}
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            {navbar.buttons.login}
          </button>
          <button 
            onClick={() => {
              setAuthTrigger('nav_signup');
              setShowAuthModal(true);
            }}
            className="btn-primary text-sm px-6 py-2"
          >
            {navbar.buttons.startTrial}
          </button>
        </div>
      </nav>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        triggerSource={authTrigger}
      />
    </>
  );
}