import ConditionalProviders from '@/app/components/ConditionalProviders';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hookly - AI-Powered Viral Social Ads',
  description: 'Create viral UGC content for TikTok, Instagram, and X in 30 seconds',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ConditionalProviders>
          {children}
        </ConditionalProviders>
      </body>
    </html>
  );
}