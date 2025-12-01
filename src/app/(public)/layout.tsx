// Public Layout - Header ve Footer ile
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getSettings } from '@/lib/settings'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        siteName={settings.siteName}
        logo={settings.logo || null}
      />
      <main className="flex-1">{children}</main>
      <Footer
        siteName={settings.siteName}
        description={settings.footerText || settings.siteDescription}
        socialLinks={{
          facebook: settings.facebook || undefined,
          twitter: settings.twitter || undefined,
          instagram: settings.instagram || undefined,
          linkedin: settings.linkedin || undefined,
          youtube: settings.youtube || undefined,
        }}
        quickLinks={settings.footerQuickLinks}
        legalLinks={settings.footerLegalLinks}
        copyright={settings.footerCopyright}
        developer={settings.footerDeveloper}
      />
    </div>
  )
}
