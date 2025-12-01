// Gizlilik Politikası Sayfası
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Gizlilik Politikası',
  description: 'Gizlilik politikamız hakkında bilgi edinin',
}

async function getPage() {
  return db.page.findUnique({
    where: { slug: 'gizlilik-politikasi' },
  })
}

export default async function PrivacyPage() {
  const page = await getPage()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Gizlilik Politikası</span>
      </nav>

      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          {page?.title || 'Gizlilik Politikası'}
        </h1>

        {page?.content ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground text-sm mb-6">
              Son güncelleme: {new Date().toLocaleDateString('tr-TR')}
            </p>

            <h2>1. Giriş</h2>
            <p>
              Bu gizlilik politikası, web sitemizi ziyaret ettiğinizde kişisel
              bilgilerinizi nasıl topladığımızı, kullandığımızı ve koruduğumuzu
              açıklamaktadır.
            </p>

            <h2>2. Toplanan Bilgiler</h2>
            <p>Aşağıdaki bilgileri toplayabiliriz:</p>
            <ul>
              <li>İsim ve e-posta adresi (iletişim formu aracılığıyla)</li>
              <li>Yorum bıraktığınızda sağladığınız bilgiler</li>
              <li>IP adresi ve tarayıcı bilgileri</li>
              <li>Çerezler aracılığıyla toplanan bilgiler</li>
            </ul>

            <h2>3. Bilgilerin Kullanımı</h2>
            <p>Topladığımız bilgileri şu amaçlarla kullanırız:</p>
            <ul>
              <li>Size daha iyi hizmet sunmak</li>
              <li>İletişim taleplerinize yanıt vermek</li>
              <li>Web sitemizi geliştirmek</li>
              <li>Yasal yükümlülüklerimizi yerine getirmek</li>
            </ul>

            <h2>4. Bilgi Güvenliği</h2>
            <p>
              Kişisel bilgilerinizi korumak için uygun güvenlik önlemleri
              alıyoruz. Ancak, internet üzerinden veri iletiminin %100 güvenli
              olmadığını belirtmek isteriz.
            </p>

            <h2>5. Üçüncü Taraflarla Paylaşım</h2>
            <p>
              Kişisel bilgilerinizi yasal gereklilikler dışında üçüncü taraflarla
              paylaşmayız. Google Analytics gibi analiz araçları kullanmaktayız.
            </p>

            <h2>6. Çerezler</h2>
            <p>
              Web sitemiz çerez kullanmaktadır. Çerezler hakkında daha fazla bilgi
              için{' '}
              <Link href="/cerez-politikasi" className="text-primary">
                Çerez Politikamızı
              </Link>{' '}
              inceleyebilirsiniz.
            </p>

            <h2>7. Haklarınız</h2>
            <p>KVKK kapsamında aşağıdaki haklara sahipsiniz:</p>
            <ul>
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
              <li>Verilerinize erişim talep etme</li>
              <li>Verilerinizin düzeltilmesini isteme</li>
              <li>Verilerinizin silinmesini talep etme</li>
            </ul>

            <h2>8. İletişim</h2>
            <p>
              Gizlilik politikamız hakkında sorularınız için{' '}
              <Link href="/iletisim" className="text-primary">
                iletişim sayfamızdan
              </Link>{' '}
              bize ulaşabilirsiniz.
            </p>
          </div>
        )}
      </article>
    </div>
  )
}
