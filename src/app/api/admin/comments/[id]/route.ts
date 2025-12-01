// Admin Comment Single API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const commentUpdateSchema = z.object({
  approved: z.boolean().optional(),
  content: z.string().min(10).optional(),
})

// GET - Tek yorum getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { id } = await params

    const comment = await db.comment.findUnique({
      where: { id },
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
            content: true,
          },
        },
        replies: {
          select: {
            id: true,
            authorName: true,
            content: true,
            approved: true,
            createdAt: true,
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// PUT - Yorum güncelle (onay/red/düzenle)
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
    const data = commentUpdateSchema.parse(body)

    // Yorum var mı kontrol et
    const existingComment = await db.comment.findUnique({
      where: { id },
    })

    if (!existingComment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    const comment = await db.comment.update({
      where: { id },
      data: {
        approved: data.approved ?? existingComment.approved,
        content: data.content ?? existingComment.content,
      },
      include: {
        post: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error('Comment PUT Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// DELETE - Yorum sil
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

    // Yorum var mı kontrol et
    const comment = await db.comment.findUnique({
      where: { id },
      include: {
        replies: true,
      },
    })

    if (!comment) {
      return NextResponse.json({ error: 'Yorum bulunamadı' }, { status: 404 })
    }

    // Yanıtları da sil
    if (comment.replies.length > 0) {
      await db.comment.deleteMany({
        where: { parentId: id },
      })
    }

    // Ana yorumu sil
    await db.comment.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Yorum silindi' })
  } catch (error) {
    console.error('Comment DELETE Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
