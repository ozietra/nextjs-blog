import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { db } from '@/lib/db'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// Dinamik metadata
export async function generateMetadata(): Promise<Metadata> {
  let siteName = 'Blog'
  let siteDescription = 'Modern ve profesyonel blog platformu'

  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['siteName', 'siteDescription', 'metaTitle', 'metaDescription'],
        },
      },
    })

    settings.forEach((s) => {
      if (s.key === 'siteName' && s.value) siteName = s.value
      if (s.key === 'siteDescription' && s.value) siteDescription = s.value
      if (s.key === 'metaDescription' && s.value) siteDescription = s.value
    })
  } catch (error) {
    console.error('Failed to load metadata settings:', error)
  }

  return {
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: ['blog', 'makale', 'yazı', 'haberler'],
    authors: [{ name: siteName }],
    creator: siteName,
    openGraph: {
      type: 'website',
      locale: 'tr_TR',
      siteName: siteName,
    },
    twitter: {
      card: 'summary_large_image',
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <SessionProvider>
          <ThemeProvider defaultTheme="system">
            <ToastProvider>{children}</ToastProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
