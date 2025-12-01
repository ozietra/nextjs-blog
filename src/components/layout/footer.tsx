'use client'

// Footer Component - Site alt kısmı
import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Github, Mail } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useToast } from '@/components/ui/toast'

interface SocialLinks {
  facebook?: string
  twitter?: string
  instagram?: string
  linkedin?: string
  youtube?: string
  github?: string
}

interface FooterLink {
  label: string
  url: string
}

interface FooterProps {
  siteName?: string
  description?: string
  socialLinks?: SocialLinks
  quickLinks?: FooterLink[]
  legalLinks?: FooterLink[]
  showNewsletter?: boolean
  copyright?: string
  developer?: string
}

export function Footer({
  siteName = 'Blog',
  description = 'Modern ve profesyonel blog platformu.',
  socialLinks = {},
  quickLinks = [
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Hakkımızda', url: '/hakkimizda' },
    { label: 'İletişim', url: '/iletisim' },
  ],
  legalLinks = [
    { label: 'Gizlilik Politikası', url: '/gizlilik-politikasi' },
    { label: 'Çerez Politikası', url: '/cerez-politikasi' },
  ],
  showNewsletter = true,
  copyright,
  developer = 'Next.js ile geliştirildi',
}: FooterProps) {
  const currentYear = new Date().getFullYear()
  const { addToast } = useToast()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const socialIcons = [
    { key: 'facebook', icon: Facebook, url: socialLinks.facebook },
    { key: 'twitter', icon: Twitter, url: socialLinks.twitter },
    { key: 'instagram', icon: Instagram, url: socialLinks.instagram },
    { key: 'linkedin', icon: Linkedin, url: socialLinks.linkedin },
    { key: 'youtube', icon: Youtube, url: socialLinks.youtube },
    { key: 'github', icon: Github, url: socialLinks.github },
  ].filter(social => social.url)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      addToast({
        title: 'Hata',
        description: 'Lütfen e-posta adresinizi girin.',
        variant: 'destructive',
      })
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        addToast({
          title: 'Başarılı!',
          description: 'Bültene başarıyla abone oldunuz.',
          variant: 'success',
        })
        setEmail('')
      } else {
        const data = await res.json()
        addToast({
          title: 'Hata',
          description: data.error || 'Abone olurken bir hata oluştu.',
          variant: 'destructive',
        })
      }
    } catch {
      addToast({
        title: 'Hata',
        description: 'Bir hata oluştu. Lütfen tekrar deneyin.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Site Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-primary">{siteName}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>

            {/* Social Links */}
            {socialIcons.length > 0 && (
              <div className="flex space-x-3">
                {socialIcons.map(({ key, icon: Icon, url }) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-background hover:bg-primary hover:text-primary-foreground transition-colors"
                    aria-label={key}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Yasal</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          {showNewsletter && (
            <div>
              <h4 className="text-sm font-semibold mb-4">Bülten</h4>
              <p className="text-sm text-muted-foreground mb-3">
                En son haberler ve makaleler için abone olun.
              </p>
              <form onSubmit={handleSubscribe} className="flex space-x-2">
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="flex-1"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
                <Button type="submit" size="icon" disabled={loading}>
                  <Mail className="h-4 w-4" />
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              {copyright || `© ${currentYear} ${siteName}. Tüm hakları saklıdır.`}
            </p>
            {developer && (
              <p className="text-xs text-muted-foreground">
                {developer}
              </p>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
