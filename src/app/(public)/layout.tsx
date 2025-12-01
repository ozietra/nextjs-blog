// Public Layout - Header ve Footer ile
import Script from 'next/script'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { getSettings } from '@/lib/settings'
import { AdSenseScript } from '@/components/ads/adsense'
import { WebsiteSchema, OrganizationSchema } from '@/components/seo/schema-org'

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSettings()
  const { getSiteUrl } = await import('@/lib/utils')
  const siteUrl = settings.siteUrl || getSiteUrl()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Schema.org Structured Data */}
      <WebsiteSchema
        name={settings.siteName}
        url={siteUrl}
        description={settings.siteDescription}
        searchUrl={siteUrl ? `${siteUrl}/arama` : undefined}
      />
      <OrganizationSchema
        name={settings.siteName}
        url={siteUrl}
        logo={settings.logo || undefined}
        description={settings.siteDescription}
        sameAs={[
          settings.facebook,
          settings.twitter,
          settings.instagram,
          settings.linkedin,
          settings.youtube,
          settings.github,
        ].filter(Boolean)}
      />

      {/* Google Analytics */}
      {settings.googleAnalyticsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAnalyticsId}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.googleAnalyticsId}');
            `}
          </Script>
        </>
      )}

      {/* Google AdSense */}
      {settings.adsenseEnabled && settings.adsenseClientId && (
        <AdSenseScript clientId={settings.adsenseClientId} />
      )}

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
