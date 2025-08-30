/**
 * Register Page - Public Route
 * 
 * Staff Engineer Design: Clean UI with integrated auth use-cases
 * Business Logic: Uses useAuth hook with real backend integration
 * No Mock Data: Real authentication through clean architecture
 */

'use client';

import { AuthForm } from "@/components/feature/auth";

export default function RegisterPage() {
  return <AuthForm mode="register" />;
}