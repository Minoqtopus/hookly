import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from './lib/AppContext'

export const metadata: Metadata = {
  title: 'Hookly - Create Viral TikTok Ads in 30 Seconds',
  description: 'Generate high-converting UGC ad scripts, hooks, and visual prompts for TikTok with AI. Start your 7-day free trial today!',
  keywords: 'Hookly ads, TikTok ad generator, viral content, ad scripts, marketing automation, Hookly',
  openGraph: {
    title: 'Hookly - Create Viral TikTok Ads in 30 Seconds',
    description: 'Generate high-converting UGC ad scripts with AI. Start your 7-day free trial today!',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  )
}