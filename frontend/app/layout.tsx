import { cn } from "@/lib/cn";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Hookly - AI-Powered Viral Content Generation",
  description: "Transform your business into a viral content creator with AI-powered UGC ads for TikTok, Instagram, and YouTube.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body 
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}