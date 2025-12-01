// Admin Single Page API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Tek sayfa getir
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

    const page = await db.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (error) {
    console.error('Page GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Sayfa güncelle
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
    const { title, slug, content, metaTitle, metaDesc, published } = body

    const page = await db.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    // Slug değiştiyse kontrol et
    if (slug && slug !== page.slug) {
      const existing = await db.page.findUnique({
        where: { slug },
      })

      if (existing) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const updated = await db.page.update({
      where: { id },
      data: {
        title: title ?? page.title,
        slug: slug ?? page.slug,
        content: content ?? page.content,
        metaTitle: metaTitle !== undefined ? metaTitle : page.metaTitle,
        metaDesc: metaDesc !== undefined ? metaDesc : page.metaDesc,
        published: published ?? page.published,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Page PUT Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Sayfa sil
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

    const page = await db.page.findUnique({
      where: { id },
    })

    if (!page) {
      return NextResponse.json({ error: 'Sayfa bulunamadı' }, { status: 404 })
    }

    await db.page.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Sayfa silindi' })
  } catch (error) {
    console.error('Page DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
