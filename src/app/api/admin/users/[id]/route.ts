// Admin User by ID API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Tekil kullanıcı getir
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // Sadece admin görebilir
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    const user = await db.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        displayName: true,
        slug: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('User GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Kullanıcı güncelle
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // Sadece admin güncelleyebilir
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    const body = await request.json()
    const { email, password, username, name, displayName, slug, bio, avatar, role } = body

    // Email kontrolü
    if (email) {
      const existingEmail = await db.user.findFirst({
        where: { email, id: { not: id } },
      })

      if (existingEmail) {
        return NextResponse.json(
          { error: 'Bu e-posta zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Username kontrolü
    if (username) {
      const existingUsername = await db.user.findFirst({
        where: { username, id: { not: id } },
      })

      if (existingUsername) {
        return NextResponse.json(
          { error: 'Bu kullanıcı adı zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    // Slug kontrolü
    if (slug) {
      const existingSlug = await db.user.findFirst({
        where: { slug, id: { not: id } },
      })

      if (existingSlug) {
        return NextResponse.json(
          { error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {}

    if (email !== undefined) updateData.email = email
    if (username !== undefined) updateData.username = username || null
    if (name !== undefined) updateData.name = name || null
    if (displayName !== undefined) updateData.displayName = displayName || null
    if (slug !== undefined) updateData.slug = slug || null
    if (bio !== undefined) updateData.bio = bio || null
    if (avatar !== undefined) updateData.avatar = avatar || null
    if (role !== undefined) updateData.role = role

    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        displayName: true,
        slug: true,
        bio: true,
        avatar: true,
        role: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error('User PUT Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Kullanıcı sil
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    const { id } = await params

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // Sadece admin silebilir
    const currentUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    })

    if (currentUser?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 403 })
    }

    // Kendini silmeyi engelle
    if (session.user.id === id) {
      return NextResponse.json(
        { error: 'Kendinizi silemezsiniz' },
        { status: 400 }
      )
    }

    await db.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Kullanıcı silindi' })
  } catch (error) {
    console.error('User DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
