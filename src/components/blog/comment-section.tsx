'use client'

// Comment Section Component
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { formatDate, timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { MessageSquare, Send, Reply } from 'lucide-react'

const commentSchema = z.object({
  authorName: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  authorEmail: z.string().email('Geçerli bir e-posta girin'),
  content: z.string().min(10, 'Yorum en az 10 karakter olmalı'),
})

type CommentFormData = z.infer<typeof commentSchema>

interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
}

export function CommentSection({ postId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  // Yorumları yükle
  useEffect(() => {
    async function fetchComments() {
      try {
        const res = await fetch(`/api/comments?postId=${postId}`)
        if (res.ok) {
          const data = await res.json()
          setComments(data)
        }
      } catch (err) {
        console.error('Yorumlar yüklenemedi:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchComments()
  }, [postId])

  // Yorum gönder
  const onSubmit = async (data: CommentFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          postId,
          parentId: replyTo,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        reset()
        setReplyTo(null)
        setTimeout(() => setSuccess(false), 5000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Yorum gönderilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="mt-8 pt-8 border-t">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Yorumlar ({comments.length})
      </h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mb-8 p-6 bg-muted/50 rounded-xl">
        <h3 className="font-semibold mb-4">
          {replyTo ? 'Yanıtla' : 'Yorum Yaz'}
        </h3>

        {replyTo && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Yanıtlanıyor:</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setReplyTo(null)}
            >
              İptal
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="authorName">İsim</Label>
            <Input
              id="authorName"
              placeholder="Adınız"
              {...register('authorName')}
              className={errors.authorName ? 'border-destructive' : ''}
            />
            {errors.authorName && (
              <p className="text-sm text-destructive mt-1">
                {errors.authorName.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="authorEmail">E-posta</Label>
            <Input
              id="authorEmail"
              type="email"
              placeholder="E-posta adresiniz (yayınlanmayacak)"
              {...register('authorEmail')}
              className={errors.authorEmail ? 'border-destructive' : ''}
            />
            {errors.authorEmail && (
              <p className="text-sm text-destructive mt-1">
                {errors.authorEmail.message}
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <Label htmlFor="content">Yorum</Label>
          <Textarea
            id="content"
            placeholder="Yorumunuzu yazın..."
            rows={4}
            {...register('content')}
            className={errors.content ? 'border-destructive' : ''}
          />
          {errors.content && (
            <p className="text-sm text-destructive mt-1">
              {errors.content.message}
            </p>
          )}
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert variant="success" className="mb-4">
            <AlertDescription>
              Yorumunuz gönderildi. Onaylandıktan sonra yayınlanacaktır.
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <Spinner size="sm" className="mr-2" />
              Gönderiliyor...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Gönder
            </>
          )}
        </Button>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Spinner size="lg" />
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onReply={() => setReplyTo(comment.id)}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">
          Henüz yorum yok. İlk yorumu siz yapın!
        </p>
      )}
    </section>
  )
}

interface CommentItemProps {
  comment: Comment
  onReply: () => void
  isReply?: boolean
}

function CommentItem({ comment, onReply, isReply = false }: CommentItemProps) {
  return (
    <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex gap-4">
        <Avatar alt={comment.authorName} size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">{comment.authorName}</span>
            <span className="text-sm text-muted-foreground">
              {timeAgo(comment.createdAt)}
            </span>
          </div>
          <p className="text-muted-foreground mb-2">{comment.content}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReply}
            className="text-xs"
          >
            <Reply className="h-3 w-3 mr-1" />
            Yanıtla
          </Button>
        </div>
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              isReply
            />
          ))}
        </div>
      )}
    </div>
  )
}
