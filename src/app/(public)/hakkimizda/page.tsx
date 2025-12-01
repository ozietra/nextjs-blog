// Hakkımızda Sayfası
import { Metadata } from 'next'
import { db } from '@/lib/db'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Hakkımızda',
  description: 'Blog hakkında bilgi edinin',
}

async function getPage() {
  return db.page.findUnique({
    where: { slug: 'hakkimizda' },
  })
}

export default async function AboutPage() {
  const page = await getPage()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Hakkımızda</span>
      </nav>

      <article className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">
          {page?.title || 'Hakkımızda'}
        </h1>

        {page?.content ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="prose prose-lg max-w-none">
            <p>
              Hoş geldiniz! Bu blog, teknoloji, yazılım geliştirme ve güncel konular
              hakkında kaliteli içerikler sunmak amacıyla oluşturulmuştur.
            </p>

            <h2>Misyonumuz</h2>
            <p>
              Bilgiyi erişilebilir kılmak ve okuyucularımıza değerli içerikler sunmak
              temel hedefimizdir. Her makalemizde doğru, güncel ve faydalı bilgiler
              paylaşmaya özen gösteriyoruz.
            </p>

            <h2>Vizyonumuz</h2>
            <p>
              Türkiye&apos;nin en güvenilir ve en çok tercih edilen blog platformlarından
              biri olmak istiyoruz. Okuyucularımızın güvenini kazanmak ve korumak
              en büyük önceliğimizdir.
            </p>

            <h2>İletişim</h2>
            <p>
              Sorularınız, önerileriniz veya işbirliği talepleriniz için{' '}
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
