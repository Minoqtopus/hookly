"use client";

import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, Sparkles, TrendingUp, Users, X } from "lucide-react";
import Link from "next/link";
import { useAnalytics } from "@/shared/services";
import { useEffect } from "react";

interface DemoLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastGeneratedContent?: {
    title?: string;
    hook?: string;
    script?: string;
    platform?: string;
  };
}

export const DemoLimitModal: React.FC<DemoLimitModalProps> = ({
  isOpen,
  onClose,
  lastGeneratedContent,
}) => {
  const analytics = useAnalytics();

  // Track upgrade modal shown when modal opens
  useEffect(() => {
    if (isOpen) {
      analytics.trackUpgradeModalShown('demo_limit_reached', 'trial');
    }
  }, [isOpen, analytics]);
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="relative w-full max-w-2xl bg-background border border-border rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
            >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 p-2 rounded-lg hover:bg-secondary transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-2">
                  You've Experienced the Magic! 🎉
                </h2>
                <p className="text-lg text-muted-foreground">
                  Ready to create unlimited viral scripts?
                </p>
              </div>

              {/* Value proposition */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center mt-0.5">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Join 10,000+ Creators</p>
                    <p className="text-sm text-muted-foreground">
                      Making viral content that builds their personal brand
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center mt-0.5">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-semibold">5 Free Scripts to Start</p>
                    <p className="text-sm text-muted-foreground">
                      Test our AI with real content for your brand
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-500/10 flex items-center justify-center mt-0.5">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-semibold">Proven Results</p>
                    <p className="text-sm text-muted-foreground">
                      Our creators see 3x more engagement on average
                    </p>
                  </div>
                </div>
              </div>

              {/* Pricing preview */}
              <div className="bg-secondary/20 border border-border rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Creator Plan</span>
                  <span className="text-2xl font-bold">$15<span className="text-sm font-normal text-muted-foreground">/mo</span></span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• 50 UGC scripts per month</li>
                  <li>• TikTok & Instagram optimization</li>
                  <li>• Real-time AI generation</li>
                  <li>• Performance predictions</li>
                </ul>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link 
                  href="/register" 
                  className="flex-1"
                  onClick={() => analytics.trackUpgradeInitiated('trial', 'monthly')}
                >
                  <Button className="w-full" size="lg">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Start Free Trial
                  </Button>
                </Link>
                <Link 
                  href="/pricing" 
                  className="flex-1"
                  onClick={() => analytics.trackPricingPageViewed('demo_limit_modal')}
                >
                  <Button variant="outline" className="w-full" size="lg">
                    View All Plans
                  </Button>
                </Link>
              </div>

              {/* Trust text */}
              <p className="text-xs text-center text-muted-foreground mt-4">
                No credit card required • Cancel anytime • 5 free scripts
              </p>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};