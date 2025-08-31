import { cn } from "@/lib/cn";
import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/contexts/theme-context";
import { AuthProvider } from "@/domains/auth";
import "./globals.css";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.hookly.xyz'),
  title: "Hookly - AI UGC Script Generator for Creators",
  description:
    "AI-powered UGC scripts for TikTok & Instagram creators. Build your personal brand and convert viewers into customers. Perfect for individual creators.",
  keywords: [
    "UGC scripts", 
    "AI content creation", 
    "TikTok creator tools", 
    "Instagram content", 
    "viral content generator", 
    "creator economy", 
    "social media scripts",
    "content marketing",
    "AI writing assistant"
  ],
  authors: [{ name: "Hookly Team" }],
  creator: "Hookly",
  publisher: "Hookly",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" }
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/favicon.ico",
        color: "#1E40AF",
      },
    ],
  },
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Hookly - AI UGC Script Generator for Creators",
    description: "AI-powered UGC scripts for TikTok & Instagram creators. Build your personal brand and convert viewers into customers.",
    siteName: "Hookly",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Hookly - AI UGC Script Generator",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hookly - AI UGC Script Generator for Creators",
    description: "AI-powered UGC scripts for TikTok & Instagram creators. Build your personal brand and convert viewers into customers.",
    images: ["/android-chrome-512x512.png"],
    creator: "@hookly",
  },
  alternates: {
    canonical: "/",
  },
  category: "Business",
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: "#ffffff" },
      { media: "(prefers-color-scheme: dark)", color: "#0F172A" },
    ],
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('hookly-theme') || 'dark';
                  const resolvedTheme = theme === 'system' 
                    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                    : theme;
                  document.documentElement.classList.add(resolvedTheme);
                  document.documentElement.style.colorScheme = resolvedTheme;
                } catch (e) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.style.colorScheme = 'dark';
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
        suppressHydrationWarning
      >
        <ThemeProvider defaultTheme="dark" storageKey="hookly-theme">
          <AuthProvider>
            {children}
            <Toaster
              position="bottom-right"
              toastOptions={{
                className: "bg-card text-card-foreground border border-border",
                duration: 4000,
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
