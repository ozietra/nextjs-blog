// robots.txt Generator
import { MetadataRoute } from 'next'
import { getSiteUrl } from '@/lib/utils'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/giris', '/kayit'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
