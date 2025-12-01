// Admin Media Single API - Vercel Blob veya Local Storage
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { deleteFile } from '@/lib/storage'

// GET - Tek medya dosyası getir
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

    const media = await db.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(media)
  } catch (error) {
    console.error('Media GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Medya bilgilerini güncelle
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

    const media = await db.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
    }

    const updated = await db.media.update({
      where: { id },
      data: {
        alt: body.alt ?? media.alt,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Media PUT Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Medya dosyasını sil
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

    const media = await db.media.findUnique({
      where: { id },
    })

    if (!media) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 404 })
    }

    // Storage'dan sil (Vercel Blob veya Local)
    try {
      await deleteFile(media.url)
    } catch (storageError) {
      console.error('Storage delete error:', storageError)
      // Storage hatası olsa bile veritabanından silmeye devam et
    }

    // Veritabanından sil
    await db.media.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Dosya silindi' })
  } catch (error) {
    console.error('Media DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
