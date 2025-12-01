// Admin Profile API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Kullanıcı profilini getir
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        _count: {
          select: { posts: true },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Profile GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Kullanıcı profilini güncelle
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const data = await request.json()
    const { name, slug, bio, avatar } = data

    // Slug kontrolü
    if (slug) {
      const existingUser = await db.user.findFirst({
        where: {
          slug,
          id: { not: session.user.id },
        },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        name: name || undefined,
        slug: slug || undefined,
        bio: bio !== undefined ? bio : undefined,
        avatar: avatar !== undefined ? avatar : undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        slug: true,
        bio: true,
        avatar: true,
        role: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Profile PUT Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
