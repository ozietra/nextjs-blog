// User Profile Update API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const body = await request.json()
    const { name, currentPassword, newPassword } = body

    // Mevcut kullanıcıyı al
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Update data
    const updateData: Record<string, string> = {}

    // İsim güncelleme
    if (name !== undefined) {
      updateData.name = name
      updateData.displayName = name
    }

    // Şifre güncelleme
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Mevcut şifrenizi girin' },
          { status: 400 }
        )
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'Yeni şifre en az 6 karakter olmalı' },
          { status: 400 }
        )
      }

      // Mevcut şifreyi kontrol et
      if (!user.password) {
        return NextResponse.json(
          { error: 'Şifre değiştirilemez' },
          { status: 400 }
        )
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Mevcut şifre hatalı' },
          { status: 400 }
        )
      }

      // Yeni şifreyi hashle
      updateData.password = await bcrypt.hash(newPassword, 12)
    }

    // Kullanıcıyı güncelle
    await db.user.update({
      where: { id: session.user.id },
      data: updateData,
    })

    return NextResponse.json({ message: 'Profil güncellendi' })
  } catch (error) {
    console.error('Update Profile Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
