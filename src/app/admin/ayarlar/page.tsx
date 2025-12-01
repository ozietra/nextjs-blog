'use client'

// Ayarlar Sayfası - Güncellenmiş
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Globe,
  Palette,
  Bell,
  Shield,
  Mail,
  Save,
  FileText,
  Bot,
  Layout,
  Phone,
} from 'lucide-react'

interface SettingsData {
  // Genel
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string
  favicon: string
  language: string
  timezone: string

  // SEO
  metaTitle: string
  metaDescription: string
  metaKeywords: string
  googleAnalyticsId: string
  googleSearchConsole: string

  // Sosyal Medya
  facebook: string
  twitter: string
  instagram: string
  linkedin: string
  youtube: string
  github: string

  // AdSense
  adsenseEnabled: boolean
  adsenseClientId: string
  adsenseSlotHeader: string
  adsenseSlotSidebar: string
  adsenseSlotInArticle: string
  adsenseSlotFooter: string

  // E-posta
  smtpHost: string
  smtpPort: string
  smtpUser: string
  smtpFrom: string
  contactEmail: string

  // İletişim Bilgileri
  contactAddress: string
  contactPhone: string
  contactMapEmbed: string

  // AI / OpenAI
  openaiApiKey: string
  openaiModel: string

  // Footer
  footerText: string
  footerCopyright: string
  footerDeveloper: string
  footerQuickLinks: string
  footerLegalLinks: string

  // Diğer
  postsPerPage: string
  commentsEnabled: boolean
  commentsModeration: boolean
  maintenanceMode: boolean
}

const defaultSettings: SettingsData = {
  siteName: 'Blog',
  siteDescription: 'Modern ve profesyonel blog platformu.',
  siteUrl: '',
  logo: '',
  favicon: '',
  language: 'tr',
  timezone: 'Europe/Istanbul',

  metaTitle: '',
  metaDescription: '',
  metaKeywords: '',
  googleAnalyticsId: '',
  googleSearchConsole: '',

  facebook: '',
  twitter: '',
  instagram: '',
  linkedin: '',
  youtube: '',
  github: '',

  adsenseEnabled: false,
  adsenseClientId: '',
  adsenseSlotHeader: '',
  adsenseSlotSidebar: '',
  adsenseSlotInArticle: '',
  adsenseSlotFooter: '',

  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpFrom: '',
  contactEmail: '',

  contactAddress: '',
  contactPhone: '',
  contactMapEmbed: '',

  openaiApiKey: '',
  openaiModel: 'gpt-4o-mini',

  footerText: 'Modern ve profesyonel blog platformu.',
  footerCopyright: '',
  footerDeveloper: 'Next.js ile geliştirildi',
  footerQuickLinks: JSON.stringify([
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Hakkımızda', url: '/hakkimizda' },
    { label: 'İletişim', url: '/iletisim' },
  ]),
  footerLegalLinks: JSON.stringify([
    { label: 'Gizlilik Politikası', url: '/gizlilik-politikasi' },
    { label: 'Çerez Politikası', url: '/cerez-politikasi' },
  ]),

  postsPerPage: '10',
  commentsEnabled: true,
  commentsModeration: true,
  maintenanceMode: false,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings')
      if (res.ok) {
        const data = await res.json()
        // Gelen veriyi settings objesine dönüştür
        const settingsObj: SettingsData = { ...defaultSettings }
        data.forEach((item: { key: string; value: string }) => {
          if (item.key in settingsObj) {
            const key = item.key as keyof SettingsData
            if (typeof settingsObj[key] === 'boolean') {
              ;(settingsObj as unknown as Record<string, unknown>)[key] = item.value === 'true'
            } else {
              ;(settingsObj as unknown as Record<string, unknown>)[key] = item.value
            }
          }
        })
        setSettings(settingsObj)
      }
    } catch (err) {
      setError('Ayarlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Settings objesini key-value array'e dönüştür
      const settingsArray = Object.entries(settings).map(([key, value]) => ({
        key,
        value: String(value),
      }))

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: settingsArray }),
      })

      if (res.ok) {
        setSuccess('Ayarlar başarıyla kaydedildi!')
        // Sayfayı yenile
        await fetchSettings()
      } else {
        const data = await res.json()
        setError(data.error || 'Ayarlar kaydedilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key: keyof SettingsData, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Ayarlar</h1>
            <p className="text-muted-foreground">Site ayarlarını yönetin</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Kaydet
            </>
          )}
        </Button>
      </div>

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            Genel
          </TabsTrigger>
          <TabsTrigger value="seo" className="gap-2">
            <Palette className="h-4 w-4" />
            SEO
          </TabsTrigger>
          <TabsTrigger value="social" className="gap-2">
            <Bell className="h-4 w-4" />
            Sosyal
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2">
            <Layout className="h-4 w-4" />
            Footer
          </TabsTrigger>
          <TabsTrigger value="contact" className="gap-2">
            <Phone className="h-4 w-4" />
            İletişim
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Bot className="h-4 w-4" />
            AI
          </TabsTrigger>
          <TabsTrigger value="adsense" className="gap-2">
            <Shield className="h-4 w-4" />
            AdSense
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            E-posta
          </TabsTrigger>
        </TabsList>

        {/* Genel Ayarlar */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Genel Ayarlar</CardTitle>
              <CardDescription>
                Temel site bilgilerini ayarlayın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Site Adı (Logo Yazısı)</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => updateSetting('siteName', e.target.value)}
                    placeholder="Blog Adım"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Header ve Footer'da görünecek site adı
                  </p>
                </div>
                <div>
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => updateSetting('siteUrl', e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Açıklaması</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) =>
                    updateSetting('siteDescription', e.target.value)
                  }
                  placeholder="Sitenizin kısa açıklaması"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Footer ve meta açıklamasında kullanılır
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="logo">Logo URL</Label>
                  <Input
                    id="logo"
                    value={settings.logo}
                    onChange={(e) => updateSetting('logo', e.target.value)}
                    placeholder="/images/logo.png veya https://..."
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Boş bırakırsanız site adı gösterilir
                  </p>
                </div>
                <div>
                  <Label htmlFor="favicon">Favicon URL</Label>
                  <Input
                    id="favicon"
                    value={settings.favicon}
                    onChange={(e) => updateSetting('favicon', e.target.value)}
                    placeholder="/favicon.ico"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postsPerPage">Sayfa Başına Makale</Label>
                  <Input
                    id="postsPerPage"
                    type="number"
                    value={settings.postsPerPage}
                    onChange={(e) =>
                      updateSetting('postsPerPage', e.target.value)
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="language">Dil</Label>
                  <Input
                    id="language"
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Yorumlar Aktif</Label>
                    <p className="text-sm text-muted-foreground">
                      Kullanıcıların yorum yapmasına izin ver
                    </p>
                  </div>
                  <Switch
                    checked={settings.commentsEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting('commentsEnabled', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Yorum Moderasyonu</Label>
                    <p className="text-sm text-muted-foreground">
                      Yorumlar yayınlanmadan önce onay gerektirsin
                    </p>
                  </div>
                  <Switch
                    checked={settings.commentsModeration}
                    onCheckedChange={(checked) =>
                      updateSetting('commentsModeration', checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Bakım Modu</Label>
                    <p className="text-sm text-muted-foreground">
                      Siteyi geçici olarak bakım moduna al
                    </p>
                  </div>
                  <Switch
                    checked={settings.maintenanceMode}
                    onCheckedChange={(checked) =>
                      updateSetting('maintenanceMode', checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Ayarları */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>SEO Ayarları</CardTitle>
              <CardDescription>
                Arama motoru optimizasyonu ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Başlık</Label>
                <Input
                  id="metaTitle"
                  value={settings.metaTitle}
                  onChange={(e) => updateSetting('metaTitle', e.target.value)}
                  placeholder="Site Başlığı | Slogan"
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Açıklama</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.metaDescription}
                  onChange={(e) =>
                    updateSetting('metaDescription', e.target.value)
                  }
                  placeholder="Sitenizin 155 karakterlik açıklaması"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">Meta Anahtar Kelimeler</Label>
                <Input
                  id="metaKeywords"
                  value={settings.metaKeywords}
                  onChange={(e) => updateSetting('metaKeywords', e.target.value)}
                  placeholder="kelime1, kelime2, kelime3"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="googleAnalyticsId">Google Analytics ID</Label>
                  <Input
                    id="googleAnalyticsId"
                    value={settings.googleAnalyticsId}
                    onChange={(e) =>
                      updateSetting('googleAnalyticsId', e.target.value)
                    }
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <Label htmlFor="googleSearchConsole">
                    Google Search Console
                  </Label>
                  <Input
                    id="googleSearchConsole"
                    value={settings.googleSearchConsole}
                    onChange={(e) =>
                      updateSetting('googleSearchConsole', e.target.value)
                    }
                    placeholder="Doğrulama kodu"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sosyal Medya Ayarları */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Sosyal Medya</CardTitle>
              <CardDescription>
                Sosyal medya bağlantılarınız - Footer'da görünür
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.facebook}
                    onChange={(e) => updateSetting('facebook', e.target.value)}
                    placeholder="https://facebook.com/sayfaniz"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter / X</Label>
                  <Input
                    id="twitter"
                    value={settings.twitter}
                    onChange={(e) => updateSetting('twitter', e.target.value)}
                    placeholder="https://twitter.com/hesabiniz"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.instagram}
                    onChange={(e) => updateSetting('instagram', e.target.value)}
                    placeholder="https://instagram.com/hesabiniz"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.linkedin}
                    onChange={(e) => updateSetting('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/profiliniz"
                  />
                </div>
                <div>
                  <Label htmlFor="youtube">YouTube</Label>
                  <Input
                    id="youtube"
                    value={settings.youtube}
                    onChange={(e) => updateSetting('youtube', e.target.value)}
                    placeholder="https://youtube.com/@kanaliniz"
                  />
                </div>
                <div>
                  <Label htmlFor="github">GitHub</Label>
                  <Input
                    id="github"
                    value={settings.github}
                    onChange={(e) => updateSetting('github', e.target.value)}
                    placeholder="https://github.com/kullaniciadiniz"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer Ayarları */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Ayarları</CardTitle>
              <CardDescription>
                Site alt kısmının içeriğini özelleştirin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="footerText">Footer Açıklama Metni</Label>
                <Textarea
                  id="footerText"
                  value={settings.footerText}
                  onChange={(e) => updateSetting('footerText', e.target.value)}
                  placeholder="Modern ve profesyonel blog platformu."
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Footer'da site adının altında görünür
                </p>
              </div>
              <div>
                <Label htmlFor="footerCopyright">Özel Telif Hakkı Metni</Label>
                <Input
                  id="footerCopyright"
                  value={settings.footerCopyright}
                  onChange={(e) =>
                    updateSetting('footerCopyright', e.target.value)
                  }
                  placeholder="Boş bırakırsanız otomatik oluşturulur"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Örn: © 2024 Şirket Adı. Tüm hakları saklıdır.
                </p>
              </div>
              <div>
                <Label htmlFor="footerDeveloper">Geliştirici Metni (Sağ Alt)</Label>
                <Input
                  id="footerDeveloper"
                  value={settings.footerDeveloper}
                  onChange={(e) =>
                    updateSetting('footerDeveloper', e.target.value)
                  }
                  placeholder="Next.js ile geliştirildi"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Boş bırakırsanız gizlenir
                </p>
              </div>
              <div>
                <Label htmlFor="footerQuickLinks">Hızlı Bağlantılar (JSON)</Label>
                <Textarea
                  id="footerQuickLinks"
                  value={settings.footerQuickLinks}
                  onChange={(e) =>
                    updateSetting('footerQuickLinks', e.target.value)
                  }
                  placeholder='[{"label": "Ana Sayfa", "url": "/"}]'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Format: {`[{"label": "Metin", "url": "/link"}]`}
                </p>
              </div>
              <div>
                <Label htmlFor="footerLegalLinks">Yasal Bağlantılar (JSON)</Label>
                <Textarea
                  id="footerLegalLinks"
                  value={settings.footerLegalLinks}
                  onChange={(e) =>
                    updateSetting('footerLegalLinks', e.target.value)
                  }
                  placeholder='[{"label": "Gizlilik", "url": "/gizlilik"}]'
                  rows={3}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* İletişim Bilgileri Ayarları */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>
                İletişim sayfasında gösterilecek bilgiler
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="contactEmail">İletişim E-postası</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    updateSetting('contactEmail', e.target.value)
                  }
                  placeholder="info@example.com"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  İletişim sayfasında ve form mesajlarının gönderileceği adres
                </p>
              </div>
              <div>
                <Label htmlFor="contactPhone">Telefon Numarası</Label>
                <Input
                  id="contactPhone"
                  value={settings.contactPhone}
                  onChange={(e) =>
                    updateSetting('contactPhone', e.target.value)
                  }
                  placeholder="+90 212 123 45 67"
                />
              </div>
              <div>
                <Label htmlFor="contactAddress">Adres</Label>
                <Textarea
                  id="contactAddress"
                  value={settings.contactAddress}
                  onChange={(e) =>
                    updateSetting('contactAddress', e.target.value)
                  }
                  placeholder="Örnek Mah. Test Sk. No:1&#10;İstanbul, Türkiye"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="contactMapEmbed">Harita Embed Kodu</Label>
                <Textarea
                  id="contactMapEmbed"
                  value={settings.contactMapEmbed}
                  onChange={(e) =>
                    updateSetting('contactMapEmbed', e.target.value)
                  }
                  placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Google Maps veya başka bir harita sağlayıcısından embed kodu
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Ayarları */}
        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI / OpenAI Ayarları</CardTitle>
              <CardDescription>
                AI içerik üretici için OpenAI API ayarları
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="openaiApiKey">OpenAI API Key</Label>
                <Input
                  id="openaiApiKey"
                  type="password"
                  value={settings.openaiApiKey}
                  onChange={(e) =>
                    updateSetting('openaiApiKey', e.target.value)
                  }
                  placeholder="sk-..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  OpenAI API anahtarınız. https://platform.openai.com/api-keys adresinden alabilirsiniz.
                </p>
              </div>
              <div>
                <Label htmlFor="openaiModel">Varsayılan Model</Label>
                <select
                  id="openaiModel"
                  value={settings.openaiModel}
                  onChange={(e) => updateSetting('openaiModel', e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="gpt-4o">GPT-4o (Güçlü)</option>
                  <option value="gpt-4o-mini">GPT-4o Mini (Hızlı ve Ucuz)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AdSense Ayarları */}
        <TabsContent value="adsense">
          <Card>
            <CardHeader>
              <CardTitle>Google AdSense</CardTitle>
              <CardDescription>
                Reklam alanlarını yapılandırın
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>AdSense Aktif</Label>
                  <p className="text-sm text-muted-foreground">
                    Google AdSense reklamlarını etkinleştir
                  </p>
                </div>
                <Switch
                  checked={settings.adsenseEnabled}
                  onCheckedChange={(checked) =>
                    updateSetting('adsenseEnabled', checked)
                  }
                />
              </div>
              <div>
                <Label htmlFor="adsenseClientId">AdSense Client ID</Label>
                <Input
                  id="adsenseClientId"
                  value={settings.adsenseClientId}
                  onChange={(e) =>
                    updateSetting('adsenseClientId', e.target.value)
                  }
                  placeholder="ca-pub-XXXXXXXXXX"
                  disabled={!settings.adsenseEnabled}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adsenseSlotHeader">Header Slot ID</Label>
                  <Input
                    id="adsenseSlotHeader"
                    value={settings.adsenseSlotHeader}
                    onChange={(e) =>
                      updateSetting('adsenseSlotHeader', e.target.value)
                    }
                    placeholder="XXXXXXXXXX"
                    disabled={!settings.adsenseEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="adsenseSlotSidebar">Sidebar Slot ID</Label>
                  <Input
                    id="adsenseSlotSidebar"
                    value={settings.adsenseSlotSidebar}
                    onChange={(e) =>
                      updateSetting('adsenseSlotSidebar', e.target.value)
                    }
                    placeholder="XXXXXXXXXX"
                    disabled={!settings.adsenseEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="adsenseSlotInArticle">In-Article Slot ID</Label>
                  <Input
                    id="adsenseSlotInArticle"
                    value={settings.adsenseSlotInArticle}
                    onChange={(e) =>
                      updateSetting('adsenseSlotInArticle', e.target.value)
                    }
                    placeholder="XXXXXXXXXX"
                    disabled={!settings.adsenseEnabled}
                  />
                </div>
                <div>
                  <Label htmlFor="adsenseSlotFooter">Footer Slot ID</Label>
                  <Input
                    id="adsenseSlotFooter"
                    value={settings.adsenseSlotFooter}
                    onChange={(e) =>
                      updateSetting('adsenseSlotFooter', e.target.value)
                    }
                    placeholder="XXXXXXXXXX"
                    disabled={!settings.adsenseEnabled}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* E-posta Ayarları */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>E-posta Ayarları</CardTitle>
              <CardDescription>SMTP ve iletişim ayarları</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    value={settings.smtpHost}
                    onChange={(e) => updateSetting('smtpHost', e.target.value)}
                    placeholder="smtp.gmail.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    value={settings.smtpPort}
                    onChange={(e) => updateSetting('smtpPort', e.target.value)}
                    placeholder="587"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpUser">SMTP Kullanıcı</Label>
                  <Input
                    id="smtpUser"
                    value={settings.smtpUser}
                    onChange={(e) => updateSetting('smtpUser', e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="smtpFrom">Gönderen Adres</Label>
                  <Input
                    id="smtpFrom"
                    value={settings.smtpFrom}
                    onChange={(e) => updateSetting('smtpFrom', e.target.value)}
                    placeholder="noreply@example.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
