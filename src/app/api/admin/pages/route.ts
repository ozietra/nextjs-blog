// Admin Pages API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Tüm sayfaları getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const pages = await db.page.findMany({
      orderBy: { title: 'asc' },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error('Pages GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni sayfa oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const { title, slug, content, metaTitle, metaDesc, published } = body

    if (!title || !slug) {
      return NextResponse.json(
        { error: 'Başlık ve slug gerekli' },
        { status: 400 }
      )
    }

    // Slug kontrolü
    const existing = await db.page.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const page = await db.page.create({
      data: {
        title,
        slug,
        content: content || '',
        metaTitle,
        metaDesc,
        published: published ?? true,
      },
    })

    return NextResponse.json(page)
  } catch (error) {
    console.error('Pages POST Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
