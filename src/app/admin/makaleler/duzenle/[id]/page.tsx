'use client'

// Makale Düzenleme Sayfası
import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { createSlug, calculateReadingTime, createExcerpt } from '@/lib/utils'
import { Save, ArrowLeft, ImageIcon, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// Lexical Editor - dynamic import (SSR devre dışı)
const LexicalEditor = dynamic(
  () => import('@/components/editor/lexical-editor').then((mod) => mod.LexicalEditor),
  { ssr: false, loading: () => <div className="h-[400px] border rounded-lg animate-pulse bg-muted" /> }
)

const postSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı'),
  slug: z.string().min(3, 'Slug en az 3 karakter olmalı'),
  excerpt: z.string().optional(),
  categoryId: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
  featuredImage: z.string().optional(),
  published: z.boolean(),
  featured: z.boolean(),
})

type PostFormData = z.infer<typeof postSchema>

interface Category {
  id: string
  name: string
}

interface Tag {
  id: string
  name: string
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.id as string

  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [showMediaPicker, setShowMediaPicker] = useState(false)
  const [mediaList, setMediaList] = useState<{ id: string; url: string; originalName: string }[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      published: false,
      featured: false,
    },
  })

  const featuredImage = watch('featuredImage')

  // Makale ve verileri yükle
  useEffect(() => {
    async function fetchData() {
      try {
        const [postRes, catRes, tagRes] = await Promise.all([
          fetch(`/api/admin/posts/${postId}`),
          fetch('/api/admin/categories'),
          fetch('/api/admin/tags'),
        ])

        if (catRes.ok) setCategories(await catRes.json())
        if (tagRes.ok) setTags(await tagRes.json())

        if (postRes.ok) {
          const post = await postRes.json()
          reset({
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt || '',
            categoryId: post.categoryId || '',
            metaTitle: post.metaTitle || '',
            metaDesc: post.metaDesc || '',
            featuredImage: post.featuredImage || '',
            published: post.published,
            featured: post.featured,
          })
          setContent(post.content || '')
          setSelectedTags(post.tags?.map((t: { id: string }) => t.id) || [])
        } else {
          setError('Makale bulunamadı')
        }
      } catch (err) {
        setError('Veri yüklenemedi')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [postId, reset])

  // Medya listesini yükle
  const loadMedia = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) {
        const data = await res.json()
        setMediaList(data)
      }
    } catch (err) {
      console.error('Medya yüklenemedi')
    }
  }, [])

  useEffect(() => {
    if (showMediaPicker) {
      loadMedia()
    }
  }, [showMediaPicker, loadMedia])

  // Dosya yükleme
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i])
      }

      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.files && data.files.length > 0) {
          setValue('featuredImage', data.files[0].url)
          await loadMedia()
        }
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Dosya yüklenemedi')
      }
    } catch (err) {
      setError('Dosya yükleme hatası')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const onSubmit = async (data: PostFormData) => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const readingTime = calculateReadingTime(content)
      const excerpt = data.excerpt || createExcerpt(content)

      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          content,
          readingTime,
          excerpt,
          tags: selectedTags,
        }),
      })

      if (res.ok) {
        setSuccess('Makale güncellendi!')
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'Makale güncellenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/makaleler">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Makale Düzenle</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/${watch('slug')}`} target="_blank">
            <Button variant="outline">Önizle</Button>
          </Link>
          <Button onClick={handleSubmit(onSubmit)} disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">
            {success}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title">Başlık *</Label>
              <Input
                id="title"
                placeholder="Makale başlığı"
                {...register('title')}
                className={errors.title ? 'border-destructive' : ''}
              />
              {errors.title && (
                <p className="text-sm text-destructive mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug (URL) *</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">/</span>
                <Input
                  id="slug"
                  placeholder="makale-slug"
                  {...register('slug')}
                  className={errors.slug ? 'border-destructive' : ''}
                />
              </div>
              {errors.slug && (
                <p className="text-sm text-destructive mt-1">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <Label>İçerik *</Label>
              <LexicalEditor
                content={content}
                onChange={setContent}
                placeholder="Makale içeriğini yazın..."
                className="mt-2"
              />
            </div>

            {/* Excerpt */}
            <div>
              <Label htmlFor="excerpt">Özet (Opsiyonel)</Label>
              <Textarea
                id="excerpt"
                placeholder="Kısa özet (boş bırakılırsa otomatik oluşturulur)"
                rows={3}
                {...register('excerpt')}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publish Options */}
            <Card>
              <CardHeader>
                <CardTitle>Yayın Ayarları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="published">Yayınla</Label>
                  <Switch
                    id="published"
                    checked={watch('published')}
                    onCheckedChange={(checked) => setValue('published', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="featured">Öne Çıkar</Label>
                  <Switch
                    id="featured"
                    checked={watch('featured')}
                    onCheckedChange={(checked) => setValue('featured', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Category */}
            <Card>
              <CardHeader>
                <CardTitle>Kategori</CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  options={[
                    { value: '', label: 'Kategori seçin' },
                    ...categories.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  {...register('categoryId')}
                />
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Etiketler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          prev.includes(tag.id)
                            ? prev.filter((id) => id !== tag.id)
                            : [...prev, tag.id]
                        )
                      }}
                      className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                        selectedTags.includes(tag.id)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-input hover:bg-accent'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Henüz etiket yok
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Featured Image */}
            <Card>
              <CardHeader>
                <CardTitle>Öne Çıkan Görsel</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {featuredImage && (
                  <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                      src={featuredImage}
                      alt="Öne çıkan görsel"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <Input
                  placeholder="Görsel URL"
                  {...register('featuredImage')}
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowMediaPicker(!showMediaPicker)}
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Medyadan Seç
                  </Button>
                  <div className="flex-1 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full pointer-events-none"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <>
                          <Spinner size="sm" className="mr-2" />
                          Yükleniyor...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Dosya Yükle
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {showMediaPicker && (
                  <div className="border rounded-lg p-3 max-h-[200px] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-2">
                      {mediaList.map((media) => (
                        <button
                          key={media.id}
                          type="button"
                          onClick={() => {
                            setValue('featuredImage', media.url)
                            setShowMediaPicker(false)
                          }}
                          className="relative aspect-square rounded overflow-hidden hover:ring-2 ring-primary"
                        >
                          <Image
                            src={media.url}
                            alt={media.originalName}
                            fill
                            className="object-cover"
                          />
                        </button>
                      ))}
                      {mediaList.length === 0 && (
                        <p className="col-span-3 text-sm text-muted-foreground text-center py-4">
                          Henüz medya yok
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SEO */}
            <Card>
              <CardHeader>
                <CardTitle>SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Başlık</Label>
                  <Input
                    id="metaTitle"
                    placeholder="SEO başlığı"
                    {...register('metaTitle')}
                  />
                </div>
                <div>
                  <Label htmlFor="metaDesc">Meta Açıklama</Label>
                  <Textarea
                    id="metaDesc"
                    placeholder="SEO açıklaması"
                    rows={3}
                    {...register('metaDesc')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
