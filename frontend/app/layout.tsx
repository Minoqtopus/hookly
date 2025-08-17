import type { Metadata } from 'next'
import './globals.css'
import { AppProvider } from './lib/AppContext'

export const metadata: Metadata = {
  title: 'AI UGC Ad Generator - Create Viral TikTok Ads in 30 Seconds',
  description: 'Generate high-converting UGC ad scripts, hooks, and visual prompts for TikTok with AI. Try free - no signup required!',
  keywords: 'AI UGC ads, TikTok ad generator, viral content, ad scripts, marketing automation',
  openGraph: {
    title: 'AI UGC Ad Generator - Create Viral TikTok Ads in 30 Seconds',
    description: 'Generate high-converting UGC ad scripts with AI. Free trial, no signup required!',
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