'use client'

// Kullanıcı Yönetimi Sayfası
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
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
import { Avatar } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Search,
  Shield,
  UserCheck,
  User,
  Eye,
} from 'lucide-react'

interface UserData {
  id: string
  email: string
  username?: string | null
  name: string | null
  displayName?: string | null
  avatar: string | null
  role?: 'ADMIN' | 'EDITOR' | 'AUTHOR' | 'SUBSCRIBER'
  createdAt: string
  _count?: {
    posts: number
    comments?: number
  }
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Yönetici',
  EDITOR: 'Editör',
  AUTHOR: 'Yazar',
  SUBSCRIBER: 'Abone',
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500',
  EDITOR: 'bg-blue-500',
  AUTHOR: 'bg-green-500',
  SUBSCRIBER: 'bg-gray-500',
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
    displayName: '',
    role: 'SUBSCRIBER' as string,
  })

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      } else {
        const data = await res.json()
        setError(data.error || 'Kullanıcılar yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.email || !formData.password) {
      setError('E-posta ve şifre zorunludur')
      return
    }

    setActionLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setSuccess('Kullanıcı oluşturuldu')
        setIsCreateOpen(false)
        resetForm()
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Kullanıcı oluşturulamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    setError(null)

    try {
      const updateData: Record<string, unknown> = {
        email: formData.email,
        username: formData.username || null,
        name: formData.name || null,
        displayName: formData.displayName || null,
        role: formData.role,
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })

      if (res.ok) {
        setSuccess('Kullanıcı güncellendi')
        setIsEditOpen(false)
        setSelectedUser(null)
        resetForm()
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Kullanıcı güncellenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedUser) return

    setActionLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Kullanıcı silindi')
        setIsDeleteOpen(false)
        setSelectedUser(null)
        fetchUsers()
      } else {
        const data = await res.json()
        setError(data.error || 'Kullanıcı silinemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const openEditDialog = (user: UserData) => {
    setSelectedUser(user)
    setFormData({
      email: user.email,
      password: '',
      username: user.username || '',
      name: user.name || '',
      displayName: user.displayName || '',
      role: user.role || 'SUBSCRIBER',
    })
    setIsEditOpen(true)
  }

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      name: '',
      displayName: '',
      role: 'SUBSCRIBER',
    })
  }

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kullanıcılar</h1>
            <p className="text-muted-foreground">
              Kullanıcıları yönetin ({users.length} kullanıcı)
            </p>
          </div>
        </div>
        <Button
          onClick={() => {
            resetForm()
            setIsCreateOpen(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kullanıcı
        </Button>
      </div>

      {/* Stats - Sadece role alanı varsa göster */}
      {users.some(u => u.role) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {(['ADMIN', 'EDITOR', 'AUTHOR', 'SUBSCRIBER'] as const).map((role) => (
            <Card key={role}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${roleColors[role]} bg-opacity-20`}>
                    {role === 'ADMIN' ? (
                      <Shield className="h-5 w-5" />
                    ) : role === 'EDITOR' ? (
                      <Eye className="h-5 w-5" />
                    ) : role === 'AUTHOR' ? (
                      <UserCheck className="h-5 w-5" />
                    ) : (
                      <User className="h-5 w-5" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{roleLabels[role]}</p>
                    <p className="text-xl font-bold">
                      {users.filter((u) => u.role === role).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tüm Kullanıcılar</CardTitle>
              <CardDescription>
                Sistemdeki kullanıcıları yönetin
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Kullanıcı bulunamadı</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      src={user.avatar}
                      alt={user.displayName || user.name || 'User'}
                      size="md"
                    />
                    <div>
                      <p className="font-medium">
                        {user.displayName || user.name || 'İsimsiz'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right text-sm text-muted-foreground">
                      <p>{user._count?.posts || 0} yazı</p>
                      {user._count?.comments !== undefined && (
                        <p>{user._count.comments} yorum</p>
                      )}
                    </div>
                    {user.role && (
                      <Badge className={roleColors[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    )}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsDeleteOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı</DialogTitle>
            <DialogDescription>
              Yeni bir kullanıcı hesabı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>E-posta *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <Label>Şifre *</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="En az 6 karakter"
              />
            </div>
            <div>
              <Label>Kullanıcı Adı</Label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="kullaniciadi"
              />
            </div>
            <div>
              <Label>Ad Soyad</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Adı Soyadı"
              />
            </div>
            <div>
              <Label>Görünen İsim</Label>
              <Input
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Görünen isim"
              />
            </div>
            <div>
              <Label>Rol</Label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="SUBSCRIBER">Abone</option>
                <option value="AUTHOR">Yazar</option>
                <option value="EDITOR">Editör</option>
                <option value="ADMIN">Yönetici</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>
              Kullanıcı bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>E-posta *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Yeni Şifre (Opsiyonel)</Label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder="Değiştirmek için doldurun"
              />
            </div>
            <div>
              <Label>Kullanıcı Adı</Label>
              <Input
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Ad Soyad</Label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Görünen İsim</Label>
              <Input
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Rol</Label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="SUBSCRIBER">Abone</option>
                <option value="AUTHOR">Yazar</option>
                <option value="EDITOR">Editör</option>
                <option value="ADMIN">Yönetici</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleEdit} disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanıcıyı Sil</DialogTitle>
            <DialogDescription>
              &quot;{selectedUser?.displayName || selectedUser?.email}&quot; kullanıcısını
              silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
