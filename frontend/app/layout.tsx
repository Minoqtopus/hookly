import ConditionalProviders from '@/app/components/providers/ConditionalProviders';
import { generateMetadata as getMetadata } from '@/app/lib/copy/brand/meta';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = getMetadata();

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