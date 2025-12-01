// Admin Tag Single API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'

const tagUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
})

// GET - Tek etiket getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const tag = await db.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Etiket bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Tag GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Etiket güncelle
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
    const data = tagUpdateSchema.parse(body)

    // Etiket var mı kontrol et
    const existingTag = await db.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Etiket bulunamadı' }, { status: 404 })
    }

    // Slug kontrolü
    const slug = data.slug || (data.name ? createSlug(data.name) : existingTag.slug)

    if (slug !== existingTag.slug) {
      const slugExists = await db.tag.findFirst({
        where: { slug, id: { not: id } },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const tag = await db.tag.update({
      where: { id },
      data: {
        name: data.name || existingTag.name,
        slug,
      },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json(tag)
  } catch (error) {
    console.error('Tag PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Etiket sil
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

    // Etiket var mı kontrol et
    const tag = await db.tag.findUnique({
      where: { id },
    })

    if (!tag) {
      return NextResponse.json({ error: 'Etiket bulunamadı' }, { status: 404 })
    }

    // PostTag ilişkilerini sil
    await db.postTag.deleteMany({
      where: { tagId: id },
    })

    // Etiketi sil
    await db.tag.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Etiket silindi' })
  } catch (error) {
    console.error('Tag DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
