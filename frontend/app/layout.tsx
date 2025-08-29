import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Viral Content Generator - Create Viral Social Media Content with AI',
  description: 'Generate high-converting viral content for TikTok, Instagram, and YouTube. AI-powered social media content creation platform for creators and businesses.',
  keywords: ['viral content', 'social media', 'AI content generator', 'TikTok', 'Instagram', 'YouTube'],
  authors: [{ name: 'Viral Content Generator' }],
  creator: 'Viral Content Generator',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://viralcontentgenerator.com',
    title: 'Viral Content Generator - AI-Powered Social Media Content',
    description: 'Create viral social media content that converts. Generate TikTok, Instagram, and YouTube content with AI.',
    siteName: 'Viral Content Generator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Viral Content Generator - AI-Powered Social Media Content',
    description: 'Create viral social media content that converts. Generate TikTok, Instagram, and YouTube content with AI.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}