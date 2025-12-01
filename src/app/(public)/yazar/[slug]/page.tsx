// Yazar Sayfası
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/db'
import { PostCard } from '@/components/blog/post-card'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { ChevronRight, Mail, Calendar } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface AuthorPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ sayfa?: string }>
}

async function getAuthor(slugOrId: string) {
  // Önce slug ile ara
  let author = await db.user.findUnique({
    where: { slug: slugOrId },
    select: {
      id: true,
      name: true,
      slug: true,
      bio: true,
      avatar: true,
      createdAt: true,
      _count: {
        select: { posts: { where: { published: true } } },
      },
    },
  })

  // Bulunamazsa ID ile ara
  if (!author) {
    author = await db.user.findUnique({
      where: { id: slugOrId },
      select: {
        id: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
    })
  }

  return author
}

async function getAuthorPosts(authorId: string, page: number = 1, limit: number = 9) {
  const skip = (page - 1) * limit

  const [posts, total] = await Promise.all([
    db.post.findMany({
      where: { published: true, authorId },
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
    db.post.count({ where: { published: true, authorId } }),
  ])

  return { posts, total, totalPages: Math.ceil(total / limit) }
}

export async function generateMetadata({
  params,
}: AuthorPageProps): Promise<Metadata> {
  const { slug } = await params
  const author = await getAuthor(slug)

  if (!author) {
    return { title: 'Yazar Bulunamadı' }
  }

  return {
    title: author.name || 'Yazar',
    description: author.bio || `${author.name || 'Yazar'} tarafından yazılan makaleler`,
    openGraph: {
      title: author.name || 'Yazar',
      description: author.bio || undefined,
      images: author.avatar ? [author.avatar] : undefined,
      type: 'profile',
    },
  }
}

export default async function AuthorPage({
  params,
  searchParams,
}: AuthorPageProps) {
  const { slug } = await params
  const { sayfa } = await searchParams
  const page = parseInt(sayfa || '1')

  const author = await getAuthor(slug)

  if (!author) {
    notFound()
  }

  const { posts, total, totalPages } = await getAuthorPosts(author.id, page)

  // Schema.org Person yapısı
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    image: author.avatar,
    url: `${process.env.NEXT_PUBLIC_SITE_URL}/yazar/${author.slug}`,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">{author.name || 'Yazar'}</span>
        </nav>

        {/* Author Header */}
        <header className="mb-8 p-8 bg-muted/50 rounded-2xl">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <Avatar
              src={author.avatar}
              alt={author.name || 'Yazar'}
              className="w-32 h-32 text-3xl"
            />
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold mb-2">{author.name || 'Anonim'}</h1>
              {author.bio && (
                <p className="text-muted-foreground mb-4 max-w-2xl">
                  {author.bio}
                </p>
              )}
              <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDate(author.createdAt)} tarihinden beri üye
                </span>
                <span>
                  {author._count.posts} makale yazdı
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Posts Section */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Yazıları</h2>

          {posts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Bu yazarın henüz yayınlanmış yazısı bulunmuyor.
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {page > 1 && (
                <Link href={`/yazar/${slug}?sayfa=${page - 1}`}>
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
                      <Link href={`/yazar/${slug}?sayfa=${p}`}>
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
                <Link href={`/yazar/${slug}?sayfa=${page + 1}`}>
                  <Button variant="outline">Sonraki</Button>
                </Link>
              )}
            </div>
          )}
        </section>
      </div>
    </>
  )
}
