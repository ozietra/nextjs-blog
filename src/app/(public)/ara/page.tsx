// Arama Sayfası
import { Metadata } from 'next'
import Link from 'next/link'
import { db } from '@/lib/db'
import { PostCard } from '@/components/blog/post-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, ChevronRight } from 'lucide-react'

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sayfa?: string }>
}

async function searchPosts(query: string, page: number = 1, limit: number = 9) {
  const skip = (page - 1) * limit

  const where = {
    published: true,
    OR: [
      { title: { contains: query, mode: 'insensitive' as const } },
      { content: { contains: query, mode: 'insensitive' as const } },
      { excerpt: { contains: query, mode: 'insensitive' as const } },
    ],
  }

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where,
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
    db.post.count({ where }),
  ])

  return { posts, total, totalPages: Math.ceil(total / limit) }
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams

  return {
    title: q ? `"${q}" için arama sonuçları` : 'Ara',
    description: q ? `${q} ile ilgili makaleler` : 'Blog içerisinde ara',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const query = params.q || ''
  const page = parseInt(params.sayfa || '1')

  let posts: any[] = []
  let total = 0
  let totalPages = 0

  if (query) {
    const result = await searchPosts(query, page)
    posts = result.posts
    total = result.total
    totalPages = result.totalPages
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/" className="hover:text-foreground">
          Ana Sayfa
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">Ara</span>
      </nav>

      {/* Search Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Arama</h1>

        {/* Search Form */}
        <form method="GET" className="max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Başlık, içerik veya anahtar kelime ile ara..."
              className="pl-12 h-12 text-lg"
            />
            <Button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              Ara
            </Button>
          </div>
        </form>

        {query && (
          <p className="text-muted-foreground mt-4">
            &quot;{query}&quot; için {total} sonuç bulundu
          </p>
        )}
      </header>

      {/* Search Results */}
      {query ? (
        posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link href={`/ara?q=${query}&sayfa=${page - 1}`}>
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
                        <Link href={`/ara?q=${query}&sayfa=${p}`}>
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
                  <Link href={`/ara?q=${query}&sayfa=${page + 1}`}>
                    <Button variant="outline">Sonraki</Button>
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              &quot;{query}&quot; ile eşleşen sonuç bulunamadı.
            </p>
            <p className="text-sm text-muted-foreground">
              Farklı anahtar kelimeler deneyin veya daha genel terimler kullanın.
            </p>
          </div>
        )
      ) : (
        <div className="text-center py-12">
          <Search className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Aramak istediğiniz kelimeyi yazın
          </p>
        </div>
      )}
    </div>
  )
}
