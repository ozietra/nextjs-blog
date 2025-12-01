// Admin Single Message API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// PUT - Mesajı güncelle (okundu olarak işaretle)
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

    const message = await db.contactMessage.update({
      where: { id },
      data: { read: body.read ?? true },
    })

    return NextResponse.json(message)
  } catch (error) {
    console.error('Message PUT Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Mesajı sil
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

    await db.contactMessage.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Mesaj silindi' })
  } catch (error) {
    console.error('Message DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
