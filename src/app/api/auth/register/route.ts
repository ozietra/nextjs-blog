// User Registration API
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, name } = body

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Temel kullanıcı verisi
    const userData: Record<string, unknown> = {
      email,
      password: hashedPassword,
      name: name || null,
    }

    // Opsiyonel alanlar - veritabanında varsa ekle
    if (username) {
      // Username benzersizliğini kontrol et
      try {
        const existingUsername = await db.user.findFirst({
          where: { username },
        })
        if (existingUsername) {
          return NextResponse.json(
            { error: 'Bu kullanıcı adı zaten kullanılıyor' },
            { status: 400 }
          )
        }
        userData.username = username
      } catch {
        // username alanı yoksa atla
      }
    }

    // Yeni alanları ekle (varsa)
    try {
      userData.displayName = name || username || null
      userData.role = 'SUBSCRIBER'
    } catch {
      // Alanlar yoksa atla
    }

    // Create user
    const user = await db.user.create({
      data: userData as never,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      message: 'Kayıt başarılı! Giriş yapabilirsiniz.',
      user,
    })
  } catch (error) {
    console.error('Register Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
