'use client'

// Hesabım Sayfası - Aboneler için
import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Avatar } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  User,
  Mail,
  Calendar,
  LogOut,
  Save,
  Home,
  MessageSquare,
  Settings,
} from 'lucide-react'

export default function HesabimPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || '',
      }))
    }
  }, [session])

  // Clear messages
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!session) {
    router.push('/giris')
    return null
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const updateData: Record<string, string> = {
        name: formData.name,
      }

      // Şifre değişikliği
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setError('Şifreler eşleşmiyor')
          setLoading(false)
          return
        }
        if (!formData.currentPassword) {
          setError('Mevcut şifrenizi girin')
          setLoading(false)
          return
        }
        updateData.currentPassword = formData.currentPassword
        updateData.newPassword = formData.newPassword
      }

      const res = await fetch('/api/auth/update-profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        setSuccess('Profil güncellendi')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }))
        // Session'ı güncelle
        await update()
      } else {
        const data = await res.json()
        setError(data.error || 'Güncelleme başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    signOut({ callbackUrl: '/' })
  }

  return (
    <div className="min-h-screen bg-muted/50">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            Blog
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {session.user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Card */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={session.user.avatar}
                  alt={session.user.name || 'Kullanıcı'}
                  className="w-16 h-16 text-xl"
                />
                <div>
                  <h1 className="text-2xl font-bold">
                    Hoş geldin, {session.user.name || 'Kullanıcı'}!
                  </h1>
                  <p className="text-muted-foreground">
                    Hesap ayarlarını buradan yönetebilirsin
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Link href="/">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="pt-6 flex items-center gap-3">
                  <Home className="h-5 w-5 text-primary" />
                  <span>Ana Sayfa</span>
                </CardContent>
              </Card>
            </Link>
            <Link href="/iletisim">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="pt-6 flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  <span>İletişim</span>
                </CardContent>
              </Card>
            </Link>
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

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Profil Ayarları
              </CardTitle>
              <CardDescription>
                Hesap bilgilerinizi güncelleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-posta</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={session.user.email || ''}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    E-posta adresi değiştirilemez
                  </p>
                </div>

                <div>
                  <Label htmlFor="name">Ad Soyad</Label>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Adınız Soyadınız"
                    />
                  </div>
                </div>

                <hr className="my-6" />

                <h3 className="font-medium">Şifre Değiştir</h3>

                <div>
                  <Label htmlFor="currentPassword">Mevcut Şifre</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, currentPassword: e.target.value })
                    }
                    placeholder="Mevcut şifreniz"
                  />
                </div>

                <div>
                  <Label htmlFor="newPassword">Yeni Şifre</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, newPassword: e.target.value })
                    }
                    placeholder="Yeni şifreniz (en az 6 karakter)"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Yeni Şifre (Tekrar)</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({ ...formData, confirmPassword: e.target.value })
                    }
                    placeholder="Yeni şifrenizi tekrar girin"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
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
              </form>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Hesap Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hesap Türü:</span>
                  <span className="font-medium">
                    {session.user.role === 'SUBSCRIBER' && 'Abone'}
                    {session.user.role === 'AUTHOR' && 'Yazar'}
                    {session.user.role === 'EDITOR' && 'Editör'}
                    {session.user.role === 'ADMIN' && 'Yönetici'}
                  </span>
                </div>
                {(session.user.role === 'ADMIN' ||
                  session.user.role === 'EDITOR' ||
                  session.user.role === 'AUTHOR') && (
                  <div className="pt-4">
                    <Link href="/admin">
                      <Button variant="outline" className="w-full">
                        Yönetim Paneline Git
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
