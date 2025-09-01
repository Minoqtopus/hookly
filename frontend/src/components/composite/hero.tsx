"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import { InfiniteMovingCards } from "@/components/ui";

const scriptIdeas = [
  {
    quote: "You won't believe what this AI can do for your videos.",
    name: "Tech Unboxing",
    title: "Viral Hook",
  },
  {
    quote: "3 productivity hacks that actually work.",
    name: "Life Hacks",
    title: "Educational Content",
  },
  {
    quote: "POV: You're a developer discovering the perfect tool.",
    name: "Relatable Content",
    title: "Community Trend",
  },
  {
    quote: "The secret to getting 1M views on TikTok.",
    name: "Growth Hacking",
    title: "Expert Advice",
  },
  {
    quote: "GRWM while I plan my next viral video.",
    name: "Creator Life",
    title: "Behind the Scenes",
  },
];

export const Hero = () => {
  return (
    <div className="relative min-h-screen h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8">
      {/* Background Animation */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-background" />
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]">
          <InfiniteMovingCards
            items={scriptIdeas}
            direction="right"
            speed="slow"
          />
          <InfiniteMovingCards
            items={scriptIdeas}
            direction="left"
            speed="normal"
          />
          <InfiniteMovingCards
            items={scriptIdeas}
            direction="right"
            speed="fast"
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent,hsl(var(--background)))]" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeInOut", delay: 0.5 }}
        className="text-center z-10 w-full max-w-5xl mx-auto"
      >
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70 px-2">
          Create Viral UGC That <br className="hidden sm:block" />
          Builds Your Brand
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-8 md:mb-10 max-w-2xl mx-auto">
          AI-powered UGC scripts for TikTok & Instagram. Perfect for creators
          building their personal brand and converting viewers into customers.
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full max-w-md mx-auto sm:max-w-none">
          <Link
            href="/demo"
            className="bg-primary text-primary-foreground px-8 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg w-full sm:w-auto hover:opacity-90 transition-opacity"
          >
            Try the Demo
          </Link>
          <Link
            href="/pricing"
            className="border border-border px-8 py-3 sm:px-8 sm:py-4 rounded-full font-semibold text-base sm:text-lg w-full sm:w-auto hover:bg-accent transition-colors"
          >
            View Pricing
          </Link>
        </div>
      </motion.div>

      {/* Scroll Down Indicator - More visible on mobile */}
      <motion.button
        className="absolute bottom-20 cursor-pointer z-10 p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        onClick={() => {
          window.scrollTo({
            top: window.innerHeight,
            behavior: "smooth",
          });
        }}
        aria-label="Scroll to next section"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ArrowDown className="text-muted-foreground hover:text-foreground transition-colors" />
        </motion.div>
      </motion.button>
    </div>
  );
};
