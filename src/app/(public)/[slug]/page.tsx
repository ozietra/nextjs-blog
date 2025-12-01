// Makale Detay Sayfası
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@/lib/db'
import { formatDate, timeAgo } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { PostCard } from '@/components/blog/post-card'
import {
  Calendar,
  Clock,
  Eye,
  Share2,
  ChevronRight,
} from 'lucide-react'
import { CommentSection } from '@/components/blog/comment-section'
import { ShareButtons } from '@/components/blog/share-buttons'

interface PostPageProps {
  params: Promise<{ slug: string }>
}

async function getPost(slug: string) {
  const post = await db.post.findUnique({
    where: { slug, published: true },
    include: {
      category: true,
      author: {
        select: { id: true, name: true, slug: true, avatar: true, bio: true },
      },
      tags: {
        include: { tag: true },
      },
    },
  })

  if (post) {
    // Görüntülenme sayısını artır
    await db.post.update({
      where: { id: post.id },
      data: { viewCount: { increment: 1 } },
    })
  }

  return post
}

// Statik sayfayı getir
async function getStaticPage(slug: string) {
  return db.page.findUnique({
    where: { slug, published: true },
  })
}

async function getRelatedPosts(postId: string, categoryId: string | null) {
  return db.post.findMany({
    where: {
      published: true,
      id: { not: postId },
      categoryId: categoryId || undefined,
    },
    orderBy: { createdAt: 'desc' },
    take: 3,
    include: {
      category: true,
      author: {
        select: { name: true, slug: true, avatar: true },
      },
    },
  })
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const { slug } = await params

  // Önce makale ara
  const post = await db.post.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  })

  if (post) {
    return {
      title: post.metaTitle || post.title,
      description: post.metaDesc || post.excerpt || undefined,
      authors: post.author.name ? [{ name: post.author.name }] : undefined,
      openGraph: {
        title: post.title,
        description: post.excerpt || undefined,
        type: 'article',
        publishedTime: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
        authors: post.author.name ? [post.author.name] : undefined,
        images: post.featuredImage ? [post.featuredImage] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt || undefined,
        images: post.featuredImage ? [post.featuredImage] : undefined,
      },
    }
  }

  // Statik sayfa ara
  const staticPage = await getStaticPage(slug)
  if (staticPage) {
    return {
      title: staticPage.metaTitle || staticPage.title,
      description: staticPage.metaDesc || undefined,
    }
  }

  return { title: 'Sayfa Bulunamadı' }
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params
  const post = await getPost(slug)

  // Eğer post yoksa, statik sayfa kontrol et
  if (!post) {
    const staticPage = await getStaticPage(slug)

    if (staticPage) {
      // Statik sayfa render et
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {staticPage.title}
              </h1>
            </header>
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: staticPage.content }}
            />
          </div>
        </div>
      )
    }

    notFound()
  }

  const relatedPosts = await getRelatedPosts(post.id, post.categoryId)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const postUrl = `${siteUrl}/${post.slug}`

  // Schema.org Article yapısı
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt?.toISOString() || post.createdAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `${siteUrl}/yazar/${post.author.slug}`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blog',
    },
    mainEntityOfPage: postUrl,
  }

  return (
    <>
      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">
            Ana Sayfa
          </Link>
          <ChevronRight className="h-4 w-4" />
          {post.category && (
            <>
              <Link
                href={`/kategori/${post.category.slug}`}
                className="hover:text-foreground"
              >
                {post.category.name}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-foreground truncate max-w-[200px]">
            {post.title}
          </span>
        </nav>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link href={`/kategori/${post.category.slug}`}>
                <Badge
                  className="mb-4"
                  style={{
                    backgroundColor: post.category.color || undefined,
                  }}
                >
                  {post.category.name}
                </Badge>
              </Link>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <Link
                href={`/yazar/${post.author.slug || post.author.id}`}
                className="flex items-center gap-2 hover:text-foreground"
              >
                <Avatar
                  src={post.author.avatar}
                  alt={post.author.name || 'Yazar'}
                  size="md"
                />
                <span className="font-medium">{post.author.name || 'Anonim'}</span>
              </Link>

              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatDate(post.createdAt)}
              </span>

              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {post.readingTime} dk okuma
              </span>

              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {post.viewCount} görüntülenme
              </span>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-video mb-8 rounded-xl overflow-hidden">
              <Image
                src={post.featuredImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 pt-6 border-t">
              {post.tags.map(({ tag }) => (
                <Link key={tag.id} href={`/etiket/${tag.slug}`}>
                  <Badge variant="outline" className="cursor-pointer">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex items-center gap-4 mb-8 pt-6 border-t">
            <span className="text-sm font-medium flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Paylaş:
            </span>
            <ShareButtons url={postUrl} title={post.title} />
          </div>

          {/* Author Card */}
          <div className="bg-muted/50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Avatar
                src={post.author.avatar}
                alt={post.author.name || 'Yazar'}
                size="xl"
              />
              <div>
                <Link
                  href={`/yazar/${post.author.slug || post.author.id}`}
                  className="font-semibold text-lg hover:text-primary"
                >
                  {post.author.name || 'Anonim'}
                </Link>
                {post.author.bio && (
                  <p className="text-muted-foreground mt-1">{post.author.bio}</p>
                )}
                <Link
                  href={`/yazar/${post.author.slug || post.author.id}`}
                  className="text-primary text-sm mt-2 inline-block"
                >
                  Tüm yazıları görüntüle →
                </Link>
              </div>
            </div>
          </div>

          {/* Comments */}
          <CommentSection postId={post.id} />
        </div>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="mt-12 pt-12 border-t">
            <h2 className="text-2xl font-bold mb-6">İlgili Yazılar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <PostCard key={relatedPost.id} post={relatedPost} />
              ))}
            </div>
          </section>
        )}
      </article>
    </>
  )
}
