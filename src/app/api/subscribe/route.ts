// Newsletter Subscribe API
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Check if already subscribed
    const existing = await db.subscriber.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existing) {
      if (existing.confirmed) {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kayıtlı' },
          { status: 400 }
        )
      } else {
        // Resend confirmation
        return NextResponse.json({
          message: 'Bu e-posta zaten kayıtlı. Onay bekleniyor.',
        })
      }
    }

    // Create subscriber
    await db.subscriber.create({
      data: {
        email: email.toLowerCase(),
        confirmed: true, // Auto-confirm for now (no email verification)
      },
    })

    return NextResponse.json({
      message: 'Bültene başarıyla abone oldunuz!',
    })
  } catch (error) {
    console.error('Subscribe Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
