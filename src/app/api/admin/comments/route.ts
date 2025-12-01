// Admin Comments API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

// GET - Tüm yorumları getir (admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'pending', 'approved', 'all'

    const where: Record<string, unknown> = {}
    if (status === 'pending') {
      where.approved = false
    } else if (status === 'approved') {
      where.approved = true
    }

    const comments = await db.comment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        parent: {
          select: {
            id: true,
            authorName: true,
          },
        },
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Admin Comments GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
