"use client";

import { motion } from "framer-motion";
import { Link2, Sparkles, Zap } from "lucide-react";

const features = [
  {
    title: "1. Paste Your Product URL",
    description:
      "Simply paste your product URL and let our AI analyze your product details, features, and target audience to understand what makes it special.",
    icon: Link2,
  },
  {
    title: "2. AI Generates Viral Content",
    description:
      "Our advanced AI creates compelling hooks, engaging descriptions, and platform-optimized content for TikTok, Instagram, Twitter, and more.",
    icon: Sparkles,
  },
  {
    title: "3. Launch Your Viral Campaign",
    description:
      "Copy your viral-ready content and watch your product gain traction across social platforms, turning views into sales.",
    icon: Zap,
  },
];

export const Features = () => {
  return (
    <div className="py-12 sm:py-16 md:py-24 bg-background">
      <div className="container px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">
            Turn Any Product Into Viral Content
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mb-8 sm:mb-12 md:mb-16 px-2">
            In three simple steps, Hookly transforms your product into
            viral-worthy content that drives engagement and sales across all
            social platforms.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <div className="space-y-8 sm:space-y-10 md:space-y-12">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2, duration: 0.5 }}
                viewport={{ once: true, amount: 0.5 }}
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-2">
                  <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full border border-primary/20 flex-shrink-0">
                    <feature.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold leading-tight">{feature.title}</h3>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground pl-0 sm:pl-14">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="hidden md:block">
            <div className="sticky top-24">
              <img
                src="https://res.cloudinary.com/farooq-storage/image/upload/v1756631705/hookly-generate_hocczm.png"
                alt="Hookly content generation interface"
                className="w-full h-[400px] object-contain rounded-2xl border border-border shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
