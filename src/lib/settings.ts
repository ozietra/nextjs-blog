// Site Settings Helper
import { db } from '@/lib/db'
import { cache } from 'react'

export interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string
  favicon: string

  // Social
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
  github: string

  // Footer
  footerText: string
  footerCopyright: string
  footerDeveloper: string
  footerQuickLinks: { label: string; url: string }[]
  footerLegalLinks: { label: string; url: string }[]

  // AI
  openaiApiKey: string
  openaiModel: string
}

const defaultSettings: SiteSettings = {
  siteName: 'Blog',
  siteDescription: 'Modern ve profesyonel blog platformu.',
  siteUrl: '',
  logo: '',
  favicon: '',
  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  github: '',
  footerText: 'Modern ve profesyonel blog platformu.',
  footerCopyright: '',
  footerDeveloper: 'Next.js ile geliştirildi',
  footerQuickLinks: [
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Hakkımızda', url: '/hakkimizda' },
    { label: 'İletişim', url: '/iletisim' },
  ],
  footerLegalLinks: [
    { label: 'Gizlilik Politikası', url: '/gizlilik-politikasi' },
    { label: 'Çerez Politikası', url: '/cerez-politikasi' },
  ],
  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',
}

// Cache settings for performance
export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const settings = await db.setting.findMany()

    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    // Parse JSON fields safely
    let footerQuickLinks = defaultSettings.footerQuickLinks
    let footerLegalLinks = defaultSettings.footerLegalLinks

    try {
      if (settingsMap.footerQuickLinks) {
        footerQuickLinks = JSON.parse(settingsMap.footerQuickLinks)
      }
    } catch {}

    try {
      if (settingsMap.footerLegalLinks) {
        footerLegalLinks = JSON.parse(settingsMap.footerLegalLinks)
      }
    } catch {}

    return {
      siteName: settingsMap.siteName || defaultSettings.siteName,
      siteDescription: settingsMap.siteDescription || defaultSettings.siteDescription,
      siteUrl: settingsMap.siteUrl || defaultSettings.siteUrl,
      logo: settingsMap.logo || defaultSettings.logo,
      favicon: settingsMap.favicon || defaultSettings.favicon,
      facebook: settingsMap.facebook || '',
      twitter: settingsMap.twitter || '',
      instagram: settingsMap.instagram || '',
      linkedin: settingsMap.linkedin || '',
      youtube: settingsMap.youtube || '',
      github: settingsMap.github || '',
      footerText: settingsMap.footerText || defaultSettings.footerText,
      footerCopyright: settingsMap.footerCopyright || '',
      footerDeveloper: settingsMap.footerDeveloper || defaultSettings.footerDeveloper,
      footerQuickLinks,
      footerLegalLinks,
      openaiApiKey: settingsMap.openaiApiKey || '',
      openaiModel: settingsMap.openaiModel || 'gpt-4o-mini',
    }
  } catch (error) {
    console.error('Failed to load settings:', error)
    return defaultSettings
  }
})

// Get single setting
export async function getSetting(key: string): Promise<string | null> {
  try {
    const setting = await db.setting.findUnique({
      where: { key },
    })
    return setting?.value || null
  } catch {
    return null
  }
}
