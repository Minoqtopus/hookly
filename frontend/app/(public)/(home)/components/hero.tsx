"use client";

import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import Link from "next/link";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";

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
    <div className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
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
        className="text-center z-10 p-4"
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
          The AI Scriptwriter for Viral Content
        </h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
          Hookly generates high-converting scripts, hooks, and ideas for your
          social media content.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/demo"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg"
          >
            Try the Demo
          </Link>
          <Link
            href="/pricing"
            className="border px-8 py-4 rounded-full font-semibold text-lg"
          >
            View Pricing
          </Link>
        </div>
      </motion.div>

      {/* Scroll Down Indicator */}
      <motion.div
        className="absolute bottom-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ArrowDown className="text-muted-foreground" />
        </motion.div>
      </motion.div>
    </div>
  );
};
