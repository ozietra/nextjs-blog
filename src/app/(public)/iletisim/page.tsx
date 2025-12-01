// İletişim Sayfası
import { Metadata } from 'next'
import { db } from '@/lib/db'
import ContactForm from './contact-form'
import { Mail, MapPin, Phone } from 'lucide-react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'İletişim',
  description: 'Bizimle iletişime geçin',
}

async function getContactSettings() {
  try {
    const settings = await db.setting.findMany({
      where: {
        key: {
          in: ['contactEmail', 'contactPhone', 'contactAddress', 'contactMapEmbed'],
        },
      },
    })

    const settingsMap: Record<string, string> = {}
    settings.forEach((s) => {
      // Boş string kontrolü - sadece gerçek değerleri al
      if (s.value && s.value.trim() !== '') {
        settingsMap[s.key] = s.value.trim()
      }
    })

    return {
      email: settingsMap.contactEmail || 'info@example.com',
      phone: settingsMap.contactPhone || '',
      address: settingsMap.contactAddress || '',
      mapEmbed: settingsMap.contactMapEmbed || '',
    }
  } catch (error) {
    console.error('Failed to load contact settings:', error)
    return {
      email: 'info@example.com',
      phone: '',
      address: '',
      mapEmbed: '',
    }
  }
}

export default async function ContactPage() {
  const contactInfo = await getContactSettings()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">İletişim</span>
      </nav>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">İletişim</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-6">
            {contactInfo.email && (
              <div className="p-6 bg-muted/50 rounded-xl">
                <Mail className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">E-posta</h3>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {contactInfo.email}
                </a>
              </div>
            )}

            {contactInfo.phone && (
              <div className="p-6 bg-muted/50 rounded-xl">
                <Phone className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Telefon</h3>
                <a
                  href={`tel:${contactInfo.phone.replace(/\s/g, '')}`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {contactInfo.phone}
                </a>
              </div>
            )}

            {contactInfo.address && (
              <div className="p-6 bg-muted/50 rounded-xl">
                <MapPin className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Adres</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {contactInfo.address}
                </p>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>

        {/* Map Embed */}
        {contactInfo.mapEmbed && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 text-center">Konum</h2>
            <div
              className="w-full h-[400px] rounded-xl overflow-hidden border"
              dangerouslySetInnerHTML={{ __html: contactInfo.mapEmbed }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
