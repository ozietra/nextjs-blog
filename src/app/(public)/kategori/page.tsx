// Kategoriler Listesi Sayfası
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { ChevronRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kategoriler',
  description: 'Tüm blog kategorileri',
}

async function getCategories() {
  return db.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { posts: { where: { published: true } } },
      },
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Kategoriler</span>
      </nav>

      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kategoriler</h1>
        <p className="text-muted-foreground">
          Tüm blog kategorilerini keşfedin
        </p>
      </header>

      {categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kategori/${category.slug}`}
              className="group block"
            >
              <div className="rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-shadow">
                {category.image ? (
                  <div className="relative aspect-video">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
                  </div>
                ) : (
                  <div
                    className="aspect-video flex items-center justify-center"
                    style={{
                      backgroundColor: category.color || 'hsl(var(--primary))',
                    }}
                  >
                    <span className="text-4xl font-bold text-white/80">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {category.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {category._count.posts} makale
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Henüz kategori bulunmuyor.</p>
        </div>
      )}
    </div>
  )
}
