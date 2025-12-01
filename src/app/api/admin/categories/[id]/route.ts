// Admin Category Single API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'

const categoryUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  parentId: z.string().optional().nullable(),
})

// GET - Tek kategori getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const category = await db.category.findUnique({
      where: { id },
      include: {
        parent: true,
        children: true,
        _count: {
          select: { posts: true, children: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Kategori güncelle
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
    const data = categoryUpdateSchema.parse(body)

    // Kategori var mı kontrol et
    const existingCategory = await db.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      )
    }

    // Slug kontrolü
    const slug = data.slug || (data.name ? createSlug(data.name) : existingCategory.slug)

    if (slug !== existingCategory.slug) {
      const slugExists = await db.category.findFirst({
        where: { slug, id: { not: id } },
      })

      if (slugExists) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Döngüsel parent kontrolü
    if (data.parentId) {
      if (data.parentId === id) {
        return NextResponse.json(
          { error: 'Kategori kendi kendisinin üst kategorisi olamaz' },
          { status: 400 }
        )
      }

      // Alt kategorilerde mi kontrol et
      const isChild = await checkIfChild(id, data.parentId)
      if (isChild) {
        return NextResponse.json(
          { error: 'Alt kategori üst kategori olarak seçilemez' },
          { status: 400 }
        )
      }
    }

    const category = await db.category.update({
      where: { id },
      data: {
        name: data.name || existingCategory.name,
        slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId,
      },
      include: {
        parent: true,
        _count: {
          select: { posts: true, children: true },
        },
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Category PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Kategori sil
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

    // Kategori var mı kontrol et
    const category = await db.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { posts: true, children: true },
        },
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Kategori bulunamadı' },
        { status: 404 }
      )
    }

    // Alt kategori varsa silinemez
    if (category._count.children > 0) {
      return NextResponse.json(
        { error: 'Alt kategorileri olan kategori silinemez' },
        { status: 400 }
      )
    }

    // Makale varsa uyar (ama silmeye izin ver)
    if (category._count.posts > 0) {
      // Makalelerin categoryId'sini null yap
      await db.post.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      })
    }

    await db.category.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Kategori silindi' })
  } catch (error) {
    console.error('Category DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Helper: Alt kategori kontrolü
async function checkIfChild(parentId: string, targetId: string): Promise<boolean> {
  const children = await db.category.findMany({
    where: { parentId },
    select: { id: true },
  })

  for (const child of children) {
    if (child.id === targetId) return true
    const isChild = await checkIfChild(child.id, targetId)
    if (isChild) return true
  }

  return false
}
