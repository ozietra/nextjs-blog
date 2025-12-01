// Admin Settings API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { revalidatePath, revalidateTag } from 'next/cache'

// GET - Tüm ayarları getir
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const settings = await db.setting.findMany()

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Settings GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Ayarları güncelle (toplu)
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const { settings } = body as { settings: { key: string; value: string }[] }

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json(
        { error: 'Geçersiz veri formatı' },
        { status: 400 }
      )
    }

    // Her ayarı upsert et
    for (const setting of settings) {
      await db.setting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    // Tüm sayfaları yeniden oluştur
    revalidatePath('/', 'layout')
    revalidatePath('/iletisim')
    revalidatePath('/hakkimizda')

    return NextResponse.json({ message: 'Ayarlar kaydedildi' })
  } catch (error) {
    console.error('Settings PUT Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Tek ayar ekle/güncelle
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Ayar anahtarı gerekli' },
        { status: 400 }
      )
    }

    const setting = await db.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Settings POST Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
