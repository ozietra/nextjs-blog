// Ana Sayfa - Blog Listesi
import { Suspense } from 'react'
import Link from 'next/link'
import { db } from '@/lib/db'
import { PostCard } from '@/components/blog/post-card'
import { FeaturedSlider } from '@/components/blog/featured-slider'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

async function getFeaturedPosts() {
  return db.post.findMany({
    where: {
      published: true,
      featured: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      category: true,
      author: {
        select: { name: true, slug: true, avatar: true },
      },
    },
  })
}

async function getPosts(page: number = 1, limit: number = 9) {
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { published: true },
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
    db.post.count({ where: { published: true } }),
  ])

  return { posts, total, totalPages: Math.ceil(total / limit) }
}

async function getCategories() {
  return db.category.findMany({
    orderBy: { order: 'asc' },
    take: 10,
  })
}

function PostCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="aspect-video" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </div>
  )
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sayfa?: string; kategori?: string }>
}) {
  const params = await searchParams
  const page = parseInt(params.sayfa || '1')
  const categorySlug = params.kategori

  const [featuredPosts, { posts, total, totalPages }, categories] =
    await Promise.all([getFeaturedPosts(), getPosts(page), getCategories()])

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Featured Posts Slider */}
      {featuredPosts.length > 0 && page === 1 && !categorySlug && (
        <section className="mb-12">
          <FeaturedSlider posts={featuredPosts} />
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <section className="mb-8">
          <div className="flex flex-wrap gap-2">
            <Link href="/">
              <Badge
                variant={!categorySlug ? 'default' : 'outline'}
                className="cursor-pointer"
              >
                Tümü
              </Badge>
            </Link>
            {categories.map((category) => (
              <Link key={category.id} href={`/kategori/${category.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  style={{
                    borderColor: category.color || undefined,
                    color: category.color || undefined,
                  }}
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Posts Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Son Yazılar</h2>
          <p className="text-sm text-muted-foreground">
            {total} makale bulundu
          </p>
        </div>

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Henüz yazı bulunmuyor.</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {page > 1 && (
              <Link href={`/?sayfa=${page - 1}`}>
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
                    <Link href={`/?sayfa=${p}`}>
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
              <Link href={`/?sayfa=${page + 1}`}>
                <Button variant="outline">Sonraki</Button>
              </Link>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
