'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Send } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  subject: z.string().min(5, 'Konu en az 5 karakter olmalı'),
  message: z.string().min(20, 'Mesaj en az 20 karakter olmalı'),
})

type ContactFormData = z.infer<typeof contactSchema>

export default function ContactForm() {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactFormData) => {
    setSubmitting(true)
    setError(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (res.ok) {
        setSuccess(true)
        reset()
        setTimeout(() => setSuccess(false), 10000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Mesaj gönderilemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-8 bg-card rounded-xl border"
    >
      <h2 className="text-xl font-semibold mb-6">Bize Ulaşın</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <Label htmlFor="name">İsim *</Label>
          <Input
            id="name"
            placeholder="Adınız Soyadınız"
            {...register('name')}
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-posta *</Label>
          <Input
            id="email"
            type="email"
            placeholder="ornek@email.com"
            {...register('email')}
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      <div className="mb-4">
        <Label htmlFor="subject">Konu *</Label>
        <Input
          id="subject"
          placeholder="Mesajınızın konusu"
          {...register('subject')}
          className={errors.subject ? 'border-destructive' : ''}
        />
        {errors.subject && (
          <p className="text-sm text-destructive mt-1">
            {errors.subject.message}
          </p>
        )}
      </div>

      <div className="mb-6">
        <Label htmlFor="message">Mesaj *</Label>
        <Textarea
          id="message"
          placeholder="Mesajınızı yazın..."
          rows={6}
          {...register('message')}
          className={errors.message ? 'border-destructive' : ''}
        />
        {errors.message && (
          <p className="text-sm text-destructive mt-1">
            {errors.message.message}
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
            Mesajınız başarıyla gönderildi. En kısa sürede size
            dönüş yapacağız.
          </AlertDescription>
        </Alert>
      )}

      <Button type="submit" size="lg" disabled={submitting}>
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
  )
}
