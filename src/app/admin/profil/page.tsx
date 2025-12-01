'use client'

// Profil Düzenleme Sayfası
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Save,
  Camera,
  Link as LinkIcon,
  FileText,
  Calendar,
  Mail,
} from 'lucide-react'

interface ProfileData {
  id: string
  email: string
  name: string | null
  slug: string | null
  bio: string | null
  avatar: string | null
  role: string
  createdAt: string
  _count: {
    posts: number
  }
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [bio, setBio] = useState('')
  const [avatar, setAvatar] = useState('')

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/admin/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        setName(data.name || '')
        setSlug(data.slug || '')
        setBio(data.bio || '')
        setAvatar(data.avatar || '')
      } else {
        setError('Profil yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, slug, bio, avatar }),
      })

      if (res.ok) {
        const data = await res.json()
        setProfile((prev) => (prev ? { ...prev, ...data } : null))
        setSuccess('Profil başarıyla güncellendi!')
      } else {
        const data = await res.json()
        setError(data.error || 'Profil güncellenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    formData.append('files', file)

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        if (data.files?.[0]?.url) {
          setAvatar(data.files[0].url)
          setSuccess('Avatar yüklendi')
        }
      } else {
        setError('Avatar yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const generateSlug = () => {
    if (name) {
      const newSlug = name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      setSlug(newSlug)
    }
  }

  // Clear messages after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [success])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Profil</h1>
            <p className="text-muted-foreground">
              Yazar profilinizi düzenleyin
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving}>
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

      {success && (
        <Alert className="mb-4 border-green-500 bg-green-50 dark:bg-green-950">
          <AlertDescription className="text-green-700 dark:text-green-300">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Avatar ve Bilgiler */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Fotoğrafı</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative">
                <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted">
                  {avatar ? (
                    <Image
                      src={avatar}
                      alt="Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-2 -right-2 rounded-full h-10 w-10 p-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Spinner size="sm" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-4 text-center">
                Önerilen boyut: 256x256 px
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hesap Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">E-posta</p>
                  <p className="font-medium">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Kayıt Tarihi</p>
                  <p className="font-medium">
                    {profile?.createdAt
                      ? new Date(profile.createdAt).toLocaleDateString('tr-TR')
                      : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Toplam Makale</p>
                  <p className="font-medium">{profile?._count?.posts || 0}</p>
                </div>
              </div>
              <div className="pt-2">
                <Badge variant={profile?.role === 'ADMIN' ? 'default' : 'secondary'}>
                  {profile?.role === 'ADMIN' ? 'Yönetici' : 'Yazar'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sağ Kolon - Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Bu bilgiler yazar sayfanızda görüntülenecektir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adınız Soyadınız"
                />
              </div>
              <div>
                <Label htmlFor="slug">Yazar URL (Slug)</Label>
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="ad-soyad"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={generateSlug}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Oluştur
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Yazar sayfası URL&apos;i: /yazar/{slug || 'slug'}
                </p>
              </div>
              <div>
                <Label htmlFor="bio">Biyografi</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kendinizi kısaca tanıtın..."
                  rows={5}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Makalelerde ve yazar sayfanızda görüntülenecek kısa biyografi
                </p>
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Profil fotoğrafı için doğrudan URL girebilir veya yukarıdan yükleyebilirsiniz
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Yazar Sayfası Önizleme</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-muted/30">
                <div className="flex items-start gap-4">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex-shrink-0">
                    {avatar ? (
                      <Image
                        src={avatar}
                        alt={name || 'Avatar'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="h-10 w-10 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{name || 'İsim Girilmedi'}</h3>
                    <p className="text-sm text-muted-foreground">
                      /yazar/{slug || 'slug'}
                    </p>
                    <p className="mt-2 text-muted-foreground">
                      {bio || 'Biyografi girilmedi...'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
