import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { AppHeader } from '@/components/app-header'
import { AppFooter } from '@/components/app-footer'
import { Suspense } from 'react'
import { PageLoader } from '@/components/loading-spinner'

export const metadata: Metadata = {
  title: 'EventFlow Pro - Smart Event Management',
  description: 'Streamline your events with QR code check-ins, automated attendance tracking, and real-time analytics. The ultimate event management platform for organizers.',
  generator: 'EventFlow Pro',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="min-h-screen bg-indigo-50 dark:bg-[#0b0f1a] bg-[radial-gradient(1200px_600px_at_100%_-100px,rgba(99,102,241,0.18),transparent_55%),radial-gradient(1200px_600px_at_-100px_100%,rgba(129,140,248,0.18),transparent_55%)]">
            <Suspense fallback={<PageLoader text="Loading EventFlow Pro..." />}>
              <AppHeader />
            </Suspense>
            <main className="mx-auto max-w-7xl px-4 py-6">
              <Suspense fallback={<PageLoader text="Loading page..." />}>
                {children}
              </Suspense>
            </main>
            <Suspense fallback={<div className="h-20" />}>
              <AppFooter />
            </Suspense>
            <Analytics />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
