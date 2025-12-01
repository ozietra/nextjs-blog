// Admin Categories API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'

const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  color: z.string().optional(),
  order: z.number().default(0),
})

// GET - Tüm kategorileri getir
export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Categories GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni kategori oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const data = categorySchema.parse(body)

    const slug = data.slug || createSlug(data.name)

    // Slug kontrolü
    const existingCategory = await db.category.findUnique({
      where: { slug },
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const category = await db.category.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        color: data.color || null,
        order: data.order,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Categories POST Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
