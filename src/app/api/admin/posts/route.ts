// Admin Posts API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  readingTime: z.number().default(0),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET - Tüm makaleleri getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const posts = await db.post.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error('Posts GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni makale oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const data = postSchema.parse(body)

    // Slug kontrolü
    const existingPost = await db.post.findUnique({
      where: { slug: data.slug },
    })

    if (existingPost) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Makale oluştur
    const post = await db.post.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt || null,
        featuredImage: data.featuredImage || null,
        categoryId: data.categoryId || null,
        published: data.published,
        featured: data.featured,
        readingTime: data.readingTime,
        metaTitle: data.metaTitle || null,
        metaDesc: data.metaDesc || null,
        authorId: session.user.id,
        publishedAt: data.published ? new Date() : null,
      },
    })

    // Etiketleri ekle
    if (data.tags && data.tags.length > 0) {
      await db.postTag.createMany({
        data: data.tags.map((tagId) => ({
          postId: post.id,
          tagId,
        })),
      })
    }

    return NextResponse.json(post, { status: 201 })
  } catch (error) {
    console.error('Posts POST Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
