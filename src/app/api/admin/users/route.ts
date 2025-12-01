// Admin Users API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET - Tüm kullanıcıları getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // Admin kontrolü - role alanı yoksa ilk kullanıcıyı admin say
    let isAdmin = false
    try {
      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })
      isAdmin = currentUser?.role === 'ADMIN'
    } catch {
      // role alanı yoksa, ilk kullanıcı mı kontrol et
      const firstUser = await db.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      })
      isAdmin = firstUser?.id === session.user.id
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    // Temel kullanıcı bilgilerini getir
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
        _count: {
          select: {
            posts: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Users GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni kullanıcı oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // Admin kontrolü
    let isAdmin = false
    try {
      const currentUser = await db.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      })
      isAdmin = currentUser?.role === 'ADMIN'
    } catch {
      const firstUser = await db.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select: { id: true },
      })
      isAdmin = firstUser?.id === session.user.id
    }

    if (!isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre zorunludur' },
        { status: 400 }
      )
    }

    // Email kontrolü
    const existingEmail = await db.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Bu e-posta zaten kullanılıyor' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('Users POST Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
