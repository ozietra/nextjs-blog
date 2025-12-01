// Blog Post Card Component
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, Clock, User } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { formatDate } from '@/lib/utils'

interface PostCardProps {
  post: {
    id: string
    title: string
    slug: string
    excerpt?: string | null
    featuredImage?: string | null
    readingTime: number
    createdAt: Date | string
    category?: {
      name: string
      slug: string
      color?: string | null
    } | null
    author: {
      name?: string | null
      slug?: string | null
      avatar?: string | null
    }
  }
  variant?: 'default' | 'horizontal' | 'featured'
}

export function PostCard({ post, variant = 'default' }: PostCardProps) {
  if (variant === 'horizontal') {
    return (
      <article className="group flex gap-4 p-4 rounded-xl border bg-card hover:shadow-lg transition-all duration-300">
        {/* Thumbnail */}
        <Link href={`/${post.slug}`} className="relative flex-shrink-0 w-32 h-24 overflow-hidden rounded-lg">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">📝</span>
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {post.category && (
            <Link href={`/kategori/${post.category.slug}`}>
              <Badge
                variant="secondary"
                className="mb-2"
                style={{
                  backgroundColor: post.category.color || undefined,
                  color: post.category.color ? 'white' : undefined
                }}
              >
                {post.category.name}
              </Badge>
            </Link>
          )}

          <Link href={`/${post.slug}`}>
            <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h3>
          </Link>

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} dk
            </span>
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'featured') {
    return (
      <article className="group relative h-80 rounded-2xl overflow-hidden">
        {/* Background Image */}
        <Link href={`/${post.slug}`} className="absolute inset-0">
          {post.featuredImage ? (
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/40" />
          )}
        </Link>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {post.category && (
            <Link href={`/kategori/${post.category.slug}`}>
              <Badge
                className="mb-3"
                style={{
                  backgroundColor: post.category.color || 'hsl(var(--primary))',
                }}
              >
                {post.category.name}
              </Badge>
            </Link>
          )}

          <Link href={`/${post.slug}`}>
            <h2 className="text-2xl font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
          </Link>

          {post.excerpt && (
            <p className="text-sm text-gray-300 line-clamp-2 mb-3">
              {post.excerpt}
            </p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-300">
            <Link
              href={`/yazar/${post.author.slug || post.id}`}
              className="flex items-center gap-2 hover:text-white"
            >
              <Avatar src={post.author.avatar} alt={post.author.name || 'Yazar'} size="sm" />
              <span>{post.author.name || 'Anonim'}</span>
            </Link>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readingTime} dk
            </span>
          </div>
        </div>
      </article>
    )
  }

  // Default variant
  return (
    <article className="group rounded-xl border bg-card overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      {/* Image */}
      <Link href={`/${post.slug}`} className="relative block aspect-video overflow-hidden">
        {post.featuredImage ? (
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-4xl text-muted-foreground">📝</span>
          </div>
        )}
        {post.category && (
          <Link
            href={`/kategori/${post.category.slug}`}
            className="absolute top-3 left-3"
          >
            <Badge
              style={{
                backgroundColor: post.category.color || 'hsl(var(--primary))',
                color: 'white'
              }}
            >
              {post.category.name}
            </Badge>
          </Link>
        )}
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link href={`/${post.slug}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>

        {post.excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {post.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Link
            href={`/yazar/${post.author.slug || post.id}`}
            className="flex items-center gap-2 text-sm hover:text-primary transition-colors"
          >
            <Avatar src={post.author.avatar} alt={post.author.name || 'Yazar'} size="sm" />
            <span className="font-medium">{post.author.name || 'Anonim'}</span>
          </Link>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} dk
            </span>
          </div>
        </div>
      </div>
    </article>
  )
}
