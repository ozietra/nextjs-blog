// Admin Media API - Vercel Blob veya Local Storage
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { uploadFile, getStorageInfo } from '@/lib/storage'
import { randomUUID } from 'crypto'

// GET - Tüm medya dosyalarını getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const media = await db.media.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Media GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Dosya yükle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // Storage durumunu kontrol et
    const storageInfo = getStorageInfo()
    if (!storageInfo.configured) {
      return NextResponse.json(
        { error: storageInfo.message },
        { status: 500 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Dosya gerekli' }, { status: 400 })
    }

    const uploaded: { id: string; url: string; filename: string }[] = []
    const errors: string[] = []

    for (const file of files) {
      try {
        // Dosya türü kontrolü
        if (!file.type.startsWith('image/')) {
          errors.push(`${file.name}: Sadece görsel dosyalar kabul edilir`)
          continue
        }

        // Dosya boyutu kontrolü (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          errors.push(`${file.name}: Dosya boyutu 10MB'dan büyük olamaz`)
          continue
        }

        const uuid = randomUUID()
        const extension = file.name.split('.').pop() || 'jpg'
        const filename = `${uuid}.${extension}`

        // Storage'a yükle (Vercel veya Local) - otomatik WebP dönüşümü yapılır
        const result = await uploadFile(file, filename)

        // Veritabanına kaydet (WebP dönüşümü sonrası bilgilerle)
        const finalFilename = result.pathname
        const isWebP = finalFilename.endsWith('.webp')

        const media = await db.media.create({
          data: {
            filename: finalFilename,
            originalName: file.name,
            url: result.url,
            type: isWebP ? 'image/webp' : file.type,
            size: result.size || file.size,
            width: result.width || null,
            height: result.height || null,
          },
        })

        uploaded.push({
          id: media.id,
          url: media.url,
          filename: media.filename,
        })
      } catch (fileError: unknown) {
        console.error(`File upload error for ${file.name}:`, fileError)
        let errorMessage = fileError instanceof Error ? fileError.message : 'Bilinmeyen hata'

        // Blob store hatası için özel mesaj
        if (errorMessage.includes('store does not exist') || errorMessage.includes('not found')) {
          errorMessage = 'Vercel Blob Store bulunamadı. Vercel Dashboard > Storage > Create Database > Blob seçerek bir store oluşturun.'
        }

        errors.push(`${file.name}: ${errorMessage}`)
      }
    }

    if (uploaded.length === 0 && errors.length > 0) {
      return NextResponse.json({
        error: errors.join(', '),
        uploaded: 0,
        errors,
      }, { status: 400 })
    }

    return NextResponse.json({
      uploaded: uploaded.length,
      files: uploaded,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: unknown) {
    console.error('Media POST Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Sunucu hatası'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
