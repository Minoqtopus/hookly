"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/domains/auth";
import { Logo } from "@/components/layout";

export const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  
  const { forgotPassword, isLoading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) return;
    
    const result = await forgotPassword(email);
    if (result.success) {
      setSuccess(true);
      setEmail(""); // Clear the input field on success
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm p-8 bg-secondary/50 rounded-2xl"
      >
        <div className="text-center mb-8">
          <div className="inline-block">
            <Logo />
          </div>
          <h1 className="text-2xl font-bold mt-4">Forgot your password?</h1>
          <p className="text-muted-foreground text-sm">
            {success 
              ? "Check your email for a password reset link."
              : "Enter your email to receive a reset link."
            }
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-md text-sm">
            Password reset link sent successfully! Check your email.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              disabled={isLoading || success}
              className="w-full bg-background border border-border rounded-md px-4 py-2 text-sm disabled:opacity-50"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || success || !email}
            className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Sending..." : success ? "Email Sent" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <p className="text-muted-foreground">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Login
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
