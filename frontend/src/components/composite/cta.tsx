"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export const CTA = () => {
  return (
    <div className="py-24 relative overflow-hidden bg-background">
      <div className="container text-center relative z-10">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.5 }}
          className="bg-secondary/30 border border-border rounded-2xl p-8 md:p-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Build Your Creator Brand?
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Try the demo and see how Hookly creates viral UGC scripts that build your personal brand on TikTok & Instagram. No credit card required.
          </p>
          <Link
            href="/demo"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-semibold text-lg inline-block"
          >
            Try the Demo for Free
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
