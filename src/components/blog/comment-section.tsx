'use client'

// Comment Section Component
import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { timeAgo } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { MessageSquare, Send, Reply, LogIn, UserCheck } from 'lucide-react'

const commentSchema = z.object({
  authorName: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  authorEmail: z.string().email('Geçerli bir e-posta girin'),
  content: z.string().min(10, 'Yorum en az 10 karakter olmalı'),
  captcha: z.string().optional(),
})

type CommentFormData = z.infer<typeof commentSchema>

interface Comment {
  id: string
  content: string
  authorName: string
  createdAt: string
  isGuest: boolean
  user?: {
    displayName: string | null
    avatar: string | null
  } | null
  replies?: Comment[]
}

interface CommentSectionProps {
  postId: string
}

// Basit matematik captcha oluştur
function generateCaptcha() {
  const num1 = Math.floor(Math.random() * 10) + 1
  const num2 = Math.floor(Math.random() * 10) + 1
  return {
    question: `${num1} + ${num2} = ?`,
    answer: String(num1 + num2),
  }
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { data: session, status } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<string | null>(null)

  // Captcha state
  const [captcha, setCaptcha] = useState(() => generateCaptcha())

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  })

  // Oturum açmış kullanıcı için otomatik doldur
  useEffect(() => {
    if (session?.user) {
      setValue('authorName', session.user.name || session.user.email || '')
      setValue('authorEmail', session.user.email || '')
    }
  }, [session, setValue])

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

    // Misafir kullanıcılar için captcha kontrolü
    if (!session && data.captcha !== captcha.answer) {
      setError('Güvenlik sorusu yanlış. Lütfen tekrar deneyin.')
      setCaptcha(generateCaptcha())
      setSubmitting(false)
      return
    }

    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          postId,
          parentId: replyTo,
          userId: session?.user?.id || null,
        }),
      })

      if (res.ok) {
        setSuccess(true)
        reset()
        setReplyTo(null)
        setCaptcha(generateCaptcha())
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {replyTo ? 'Yanıtla' : 'Yorum Yaz'}
          </h3>
          {session ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <UserCheck className="h-4 w-4 text-green-500" />
              <span>{session.user?.name || session.user?.email}</span>
            </div>
          ) : (
            <Link href="/giris" className="flex items-center gap-1 text-sm text-primary hover:underline">
              <LogIn className="h-4 w-4" />
              Giriş yaparak yorum yapın
            </Link>
          )}
        </div>

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

        {/* Misafir kullanıcılar için isim/email alanları */}
        {!session && (
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
        )}

        {/* Giriş yapmış kullanıcılar için gizli alanlar */}
        {session && (
          <>
            <input type="hidden" {...register('authorName')} />
            <input type="hidden" {...register('authorEmail')} />
          </>
        )}

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

        {/* Misafir kullanıcılar için Captcha */}
        {!session && (
          <div className="mb-4">
            <Label htmlFor="captcha">Güvenlik Sorusu: {captcha.question}</Label>
            <Input
              id="captcha"
              placeholder="Cevabı yazın"
              {...register('captcha')}
              className="max-w-[200px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Robot olmadığınızı doğrulayın
            </p>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
            <AlertDescription className="text-green-700 dark:text-green-300">
              Yorumunuz gönderildi. {!session && 'Onaylandıktan sonra yayınlanacaktır.'}
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
  const displayName = comment.user?.displayName || comment.authorName

  return (
    <div className={`${isReply ? 'ml-12 mt-4' : ''}`}>
      <div className="flex gap-4">
        <Avatar
          src={comment.user?.avatar}
          alt={displayName}
          size="md"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold">{displayName}</span>
            {!comment.isGuest && (
              <Badge variant="secondary" className="text-xs">
                <UserCheck className="h-3 w-3 mr-1" />
                Üye
              </Badge>
            )}
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
