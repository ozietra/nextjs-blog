// Comments API
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'

const commentSchema = z.object({
  postId: z.string(),
  parentId: z.string().nullable().optional(),
  authorName: z.string().min(2),
  authorEmail: z.string().email(),
  content: z.string().min(10),
})

// GET - Bir makaleye ait onaylanmış yorumları getir
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const postId = searchParams.get('postId')

    if (!postId) {
      return NextResponse.json({ error: 'postId gerekli' }, { status: 400 })
    }

    const comments = await db.comment.findMany({
      where: {
        postId,
        approved: true,
        parentId: null, // Sadece üst düzey yorumlar
      },
      orderBy: { createdAt: 'desc' },
      include: {
        replies: {
          where: { approved: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error('Comments GET Error:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// POST - Yeni yorum oluştur
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = commentSchema.parse(body)

    // Post var mı kontrol et
    const post = await db.post.findUnique({
      where: { id: data.postId, published: true },
    })

    if (!post) {
      return NextResponse.json({ error: 'Makale bulunamadı' }, { status: 404 })
    }

    // Parent yorum var mı kontrol et
    if (data.parentId) {
      const parentComment = await db.comment.findUnique({
        where: { id: data.parentId },
      })

      if (!parentComment) {
        return NextResponse.json(
          { error: 'Yanıtlanacak yorum bulunamadı' },
          { status: 404 }
        )
      }
    }

    const comment = await db.comment.create({
      data: {
        postId: data.postId,
        parentId: data.parentId || null,
        authorName: data.authorName,
        authorEmail: data.authorEmail,
        content: data.content,
        approved: false, // Varsayılan olarak onay bekliyor
      },
    })

    return NextResponse.json(
      { message: 'Yorum gönderildi, onay bekleniyor' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Comments POST Error:', error)

    if (error instanceof z.ZodError) {
      const messages = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      return NextResponse.json(
        { error: messages || 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
