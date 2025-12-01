// Etiket Sayfası
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { PostCard } from '@/components/blog/post-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, Hash } from 'lucide-react'

interface TagPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sayfa?: string }>
}

async function getTag(slug: string) {
  return db.tag.findUnique({
    where: { slug },
  })
}

async function getTagPosts(tagId: string, page: number = 1, limit: number = 9) {
  const skip = (page - 1) * limit

  const [postTags, total] = await Promise.all([
    db.postTag.findMany({
      where: {
        tagId,
        post: { published: true },
      },
      skip,
      take: limit,
      include: {
        post: {
          include: {
            category: true,
            author: {
              select: { name: true, slug: true, avatar: true },
            },
          },
        },
      },
      orderBy: { post: { createdAt: 'desc' } },
    }),
    db.postTag.count({
      where: { tagId, post: { published: true } },
    }),
  ])

  const posts = postTags.map((pt) => pt.post)

  return { posts, total, totalPages: Math.ceil(total / limit) }
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const { slug } = await params
  const tag = await getTag(slug)

  if (!tag) {
    return { title: 'Etiket Bulunamadı' }
  }

  return {
    title: `#${tag.name}`,
    description: `${tag.name} etiketli yazılar`,
  }
}

export default async function TagPage({ params, searchParams }: TagPageProps) {
  const { slug } = await params
  const { sayfa } = await searchParams
  const page = parseInt(sayfa || '1')

  const tag = await getTag(slug)

  if (!tag) {
    notFound()
  }

  const { posts, total, totalPages } = await getTagPosts(tag.id, page)

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">#{tag.name}</span>
      </nav>

      {/* Tag Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-full bg-primary/10">
            <Hash className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{tag.name}</h1>
        </div>
        <p className="text-muted-foreground">
          {total} makale bulundu
        </p>
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
          <p className="text-muted-foreground">Bu etikette henüz yazı bulunmuyor.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {page > 1 && (
            <Link href={`/etiket/${slug}?sayfa=${page - 1}`}>
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
                  <Link href={`/etiket/${slug}?sayfa=${p}`}>
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
            <Link href={`/etiket/${slug}?sayfa=${page + 1}`}>
              <Button variant="outline">Sonraki</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
