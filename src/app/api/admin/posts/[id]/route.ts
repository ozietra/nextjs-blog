// Admin Single Post API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const updatePostSchema = z.object({
  title: z.string().min(3).optional(),
  slug: z.string().min(3).optional(),
  content: z.string().optional(),
  excerpt: z.string().optional(),
  featuredImage: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  published: z.boolean().optional(),
  featured: z.boolean().optional(),
  readingTime: z.number().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

// GET - Tek makale getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { id } = await params

    const post = await db.post.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { name: true, email: true } },
        tags: { include: { tag: true } },
      },
    })

    if (!post) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Post GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Makale güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const data = updatePostSchema.parse(body)

    // Mevcut makale kontrolü
    const existingPost = await db.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 })
    }

    // Slug değiştiyse benzersizlik kontrolü
    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await db.post.findUnique({
        where: { slug: data.slug },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Makale güncelle
    const post = await db.post.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        featuredImage: data.featuredImage,
        categoryId: data.categoryId,
        published: data.published,
        featured: data.featured,
        readingTime: data.readingTime,
        metaTitle: data.metaTitle,
        metaDesc: data.metaDesc,
        publishedAt:
          data.published && !existingPost.published ? new Date() : undefined,
      },
    })

    // Etiketleri güncelle
    if (data.tags !== undefined) {
      // Mevcut etiketleri sil
      await db.postTag.deleteMany({
        where: { postId: id },
      })

      // Yeni etiketleri ekle
      if (data.tags.length > 0) {
        await db.postTag.createMany({
          data: data.tags.map((tagId) => ({
            postId: id,
            tagId,
          })),
        })
      }
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error('Post PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Makale sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { id } = await params

    // Mevcut makale kontrolü
    const existingPost = await db.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 })
    }

    // Makaleyi sil (cascade ile yorumlar ve etiketler de silinir)
    await db.post.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Post DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
