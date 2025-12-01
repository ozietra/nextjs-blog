'use client'

// Kayıt Sayfası
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { UserPlus, Mail, Lock, User, AtSign } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    username: '',
    name: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validation
    if (!formData.email || !formData.password) {
      setError('E-posta ve şifre zorunludur')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username || undefined,
          name: formData.name || undefined,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(data.message)
        setTimeout(() => {
          router.push('/giris')
        }, 2000)
      } else {
        setError(data.error || 'Kayıt başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <UserPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Kayıt Ol</CardTitle>
          <CardDescription>
            Yeni bir hesap oluşturun
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <AlertDescription className="text-green-700 dark:text-green-300">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">E-posta *</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="pl-10"
                  placeholder="ornek@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Kullanıcı Adı</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className="pl-10"
                  placeholder="kullaniciadi"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="pl-10"
                  placeholder="Adınız Soyadınız"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground">
                En az 6 karakter
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">Şifre Tekrar *</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="passwordConfirm"
                  type="password"
                  value={formData.passwordConfirm}
                  onChange={(e) =>
                    setFormData({ ...formData, passwordConfirm: e.target.value })
                  }
                  className="pl-10"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Kayıt yapılıyor...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Kayıt Ol
                </>
              )}
            </Button>

            <p className="text-sm text-center text-muted-foreground">
              Zaten hesabınız var mı?{' '}
              <Link href="/giris" className="text-primary hover:underline">
                Giriş yapın
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
