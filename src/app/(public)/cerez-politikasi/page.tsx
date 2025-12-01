// Çerez Politikası Sayfası
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Çerez Politikası',
  description: 'Çerez politikamız hakkında bilgi edinin',
}

async function getPage() {
  return db.page.findUnique({
    where: { slug: 'cerez-politikasi' },
  })
}

export default async function CookiePolicyPage() {
  const page = await getPage()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Çerez Politikası</span>
      </nav>

      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          {page?.title || 'Çerez Politikası'}
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

            <h2>1. Çerez Nedir?</h2>
            <p>
              Çerezler, web sitemizi ziyaret ettiğinizde tarayıcınız tarafından
              cihazınıza kaydedilen küçük metin dosyalarıdır. Bu dosyalar,
              ziyaretlerinizi hatırlamamıza ve deneyiminizi iyileştirmemize
              yardımcı olur.
            </p>

            <h2>2. Kullandığımız Çerez Türleri</h2>

            <h3>Zorunlu Çerezler</h3>
            <p>
              Bu çerezler web sitesinin düzgün çalışması için gereklidir.
              Oturum yönetimi ve güvenlik gibi temel işlevleri sağlarlar.
            </p>

            <h3>Performans Çerezleri</h3>
            <p>
              Bu çerezler, ziyaretçilerin web sitesini nasıl kullandığı hakkında
              bilgi toplar. Sayfa görüntülemeleri ve hata mesajları gibi
              verileri anonim olarak kaydederler.
            </p>

            <h3>İşlevsellik Çerezleri</h3>
            <p>
              Bu çerezler, tercihlerinizi (tema, dil vb.) hatırlamamızı sağlar
              ve kişiselleştirilmiş bir deneyim sunar.
            </p>

            <h3>Reklam Çerezleri</h3>
            <p>
              Google AdSense gibi üçüncü taraf reklam sağlayıcıları tarafından
              kullanılır. İlgi alanlarınıza göre reklamlar gösterilmesini sağlar.
            </p>

            <h2>3. Üçüncü Taraf Çerezleri</h2>
            <p>Web sitemizde aşağıdaki üçüncü taraf hizmetlerinin çerezleri kullanılabilir:</p>
            <ul>
              <li><strong>Google Analytics:</strong> Web sitesi trafiğini analiz etmek için</li>
              <li><strong>Google AdSense:</strong> Kişiselleştirilmiş reklamlar için</li>
              <li><strong>YouTube:</strong> Gömülü videolar için</li>
            </ul>

            <h2>4. Çerezleri Yönetme</h2>
            <p>
              Çoğu web tarayıcısı, çerezleri otomatik olarak kabul eder. Ancak
              tarayıcı ayarlarınızdan çerezleri devre dışı bırakabilir veya
              silebilirsiniz. Çerezleri devre dışı bırakmanın bazı site
              işlevlerini etkileyebileceğini unutmayın.
            </p>

            <h3>Tarayıcılarda Çerez Ayarları</h3>
            <ul>
              <li><strong>Chrome:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler</li>
              <li><strong>Firefox:</strong> Ayarlar &gt; Gizlilik ve Güvenlik &gt; Çerezler</li>
              <li><strong>Safari:</strong> Tercihler &gt; Gizlilik &gt; Çerezler</li>
              <li><strong>Edge:</strong> Ayarlar &gt; Gizlilik &gt; Çerezler</li>
            </ul>

            <h2>5. Çerez Tercihlerini Güncelleme</h2>
            <p>
              Çerez tercihlerinizi istediğiniz zaman tarayıcı ayarlarınızdan
              güncelleyebilirsiniz. Ayrıca Google&apos;ın reklam ayarlarını
              <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-primary">
                {' '}buradan{' '}
              </a>
              yönetebilirsiniz.
            </p>

            <h2>6. İletişim</h2>
            <p>
              Çerez politikamız hakkında sorularınız için{' '}
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
