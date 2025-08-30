"use client";

import { motion } from "framer-motion";
import { Copy, Film, TrendingUp } from "lucide-react";

const features = [
  {
    title: "1. Tell Us About Your Brand",
    description:
      "Describe your product, your niche, and your audience. Whether you're promoting a product or building your personal brand, our AI understands your creator goals.",
    icon: Copy,
  },
  {
    title: "2. AI Creates Your UGC Script",
    description:
      "Our AI generates authentic UGC scripts for TikTok & Instagram that feel natural and convert viewers into followers and customers.",
    icon: Film,
  },
  {
    title: "3. Build Your Creator Empire",
    description:
      "Copy your viral script and create content that builds your personal brand, grows your audience, and converts viewers into loyal customers.",
    icon: TrendingUp,
  },
];

export const Features = () => {
  return (
    <div className="py-24 bg-background">
      <div className="container">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">
            Transform Your Ideas Into Viral UGC
          </h2>
          <p className="text-muted-foreground mb-16">
            In three simple steps, Hookly turns your ideas into
            authentic UGC scripts that build your personal brand on TikTok & Instagram.
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
