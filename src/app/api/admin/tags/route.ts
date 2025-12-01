// Admin Tags API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { createSlug } from '@/lib/utils'

const tagSchema = z.object({
  name: z.string().min(2),
  slug: z.string().optional(),
})

// GET - Tüm etiketleri getir
export async function GET(request: NextRequest) {
  try {
    const tags = await db.tag.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { posts: true },
        },
      },
    })

    return NextResponse.json(tags)
  } catch (error) {
    console.error('Tags GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni etiket oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const data = tagSchema.parse(body)

    const slug = data.slug || createSlug(data.name)

    // Slug kontrolü
    const existingTag = await db.tag.findUnique({
      where: { slug },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const tag = await db.tag.create({
      data: {
        name: data.name,
        slug,
      },
    })

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Tags POST Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
