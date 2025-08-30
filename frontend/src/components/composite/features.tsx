"use client";

import { motion } from "framer-motion";
import { Copy, Film, TrendingUp } from "lucide-react";

const features = [
  {
    title: "1. Describe Your Idea",
    description:
      "Start by providing a simple description of your product, service, or content idea. The more context you give the AI, the better the results.",
    icon: Copy,
  },
  {
    title: "2. Let the AI Work Its Magic",
    description:
      "Our AI analyzes your input and generates a variety of hooks, scripts, and calls-to-action optimized for different platforms.",
    icon: Film,
  },
  {
    title: "3. Go Viral",
    description:
      "Choose the best-performing script, export it with a single click, and post it to your social media. It's that simple.",
    icon: TrendingUp,
  },
];

export const Features = () => {
  return (
    <div className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Ideas Into Viral Scripts
          </h2>
          <p className="text-muted-foreground mb-16">
            In three simple steps, Hookly turns your concepts into
            high-converting content ready for TikTok, Instagram, and YouTube.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="bg-primary/10 p-2 rounded-full border border-primary/20">
                    <feature.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground pl-14">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="hidden md:block">
            {/* Placeholder for sticky visual */}
            <div className="h-[500px] bg-secondary/30 rounded-2xl border border-border sticky top-24" />
          </div>
        </div>
      </div>
    </div>
  );
};
