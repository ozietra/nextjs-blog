// Kategori Sayfası
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { PostCard } from '@/components/blog/post-card'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sayfa?: string }>
}

async function getCategory(slug: string) {
  return db.category.findUnique({
    where: { slug },
  })
}

async function getCategoryPosts(categoryId: string, page: number = 1, limit: number = 9) {
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { published: true, categoryId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        category: true,
        author: {
          select: { name: true, slug: true, avatar: true },
        },
      },
    }),
    db.post.count({ where: { published: true, categoryId } }),
  ])

  return { posts, total, totalPages: Math.ceil(total / limit) }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return { title: 'Kategori Bulunamadı' }
  }

  return {
    title: category.name,
    description: category.description || `${category.name} kategorisindeki yazılar`,
    openGraph: {
      title: category.name,
      description: category.description || undefined,
      images: category.image ? [category.image] : undefined,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { sayfa } = await searchParams
  const page = parseInt(sayfa || '1')

  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  const { posts, total, totalPages } = await getCategoryPosts(category.id, page)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/kategori" className="hover:text-foreground">
          Kategoriler
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category Header */}
      <header className="mb-8">
        <div className="flex items-start gap-6">
          {category.image && (
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground">{category.description}</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              {total} makale bulundu
            </p>
          </div>
        </div>
      </header>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Bu kategoride henüz yazı bulunmuyor.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/kategori/${slug}?sayfa=${page - 1}`}>
              <Button variant="outline">Önceki</Button>
            </Link>
          )}

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === totalPages ||
                  (p >= page - 1 && p <= page + 1)
              )
              .map((p, idx, arr) => (
                <span key={p}>
                  {idx > 0 && arr[idx - 1] !== p - 1 && (
                    <span className="px-2">...</span>
                  )}
                  <Link href={`/kategori/${slug}?sayfa=${p}`}>
                    <Button
                      variant={p === page ? 'default' : 'outline'}
                      size="icon"
                    >
                      {p}
                    </Button>
                  </Link>
                </span>
              ))}
          </div>

          {page < totalPages && (
            <Link href={`/kategori/${slug}?sayfa=${page + 1}`}>
              <Button variant="outline">Sonraki</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
