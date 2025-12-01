'use client'

// Etiket Yönetimi Sayfası
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Tags, Plus, Pencil, Trash2, Search, Hash } from 'lucide-react'

interface Tag {
  id: string
  name: string
  slug: string
  _count: {
    posts: number
  }
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
  })

  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    try {
      const res = await fetch('/api/admin/tags')
      if (res.ok) {
        const data = await res.json()
        setTags(data)
      } else {
        setError('Etiketler yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Etiket adı gerekli')
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
        }),
      })

      if (res.ok) {
        setSuccess('Etiket oluşturuldu')
        setIsCreateOpen(false)
        resetForm()
        fetchTags()
      } else {
        const data = await res.json()
        setError(data.error || 'Etiket oluşturulamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedTag || !formData.name.trim()) {
      setError('Etiket adı gerekli')
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
        }),
      })

      if (res.ok) {
        setSuccess('Etiket güncellendi')
        setIsEditOpen(false)
        resetForm()
        fetchTags()
      } else {
        const data = await res.json()
        setError(data.error || 'Etiket güncellenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedTag) return

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/tags/${selectedTag.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Etiket silindi')
        setIsDeleteOpen(false)
        setSelectedTag(null)
        fetchTags()
      } else {
        const data = await res.json()
        setError(data.error || 'Etiket silinemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setFormLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
    })
    setSelectedTag(null)
  }

  const openEditDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setFormData({
      name: tag.name,
      slug: tag.slug,
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setIsDeleteOpen(true)
  }

  const filteredTags = tags.filter(
    (tag) =>
      tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tag.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
            <Tags className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Etiketler</h1>
            <p className="text-muted-foreground">Blog etiketlerini yönetin</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Etiket
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tüm Etiketler</CardTitle>
              <CardDescription>Toplam {tags.length} etiket</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Etiket ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredTags.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Tags className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz etiket yok</p>
              <p className="text-sm">Yeni etiket ekleyerek başlayın</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="group flex items-center gap-2 px-4 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                >
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{tag.name}</span>
                  <Badge variant="secondary" className="ml-1">
                    {tag._count.posts}
                  </Badge>
                  <div className="hidden group-hover:flex items-center gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => openEditDialog(tag)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(tag)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <Tags className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Etiket</p>
                <p className="text-2xl font-bold">{tags.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <Hash className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kullanılan</p>
                <p className="text-2xl font-bold">
                  {tags.filter((t) => t._count.posts > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Hash className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Kullanılmayan</p>
                <p className="text-2xl font-bold">
                  {tags.filter((t) => t._count.posts === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Etiket</DialogTitle>
            <DialogDescription>Yeni bir blog etiketi oluşturun</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Etiket Adı *</Label>
              <Input
                id="name"
                placeholder="Örn: JavaScript"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (opsiyonel)</Label>
              <Input
                id="slug"
                placeholder="Otomatik oluşturulur"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false)
                resetForm()
              }}
            >
              İptal
            </Button>
            <Button onClick={handleCreate} disabled={formLoading}>
              {formLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Etiket Düzenle</DialogTitle>
            <DialogDescription>Etiket bilgilerini güncelleyin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Etiket Adı *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug</Label>
              <Input
                id="edit-slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsEditOpen(false)
                resetForm()
              }}
            >
              İptal
            </Button>
            <Button onClick={handleUpdate} disabled={formLoading}>
              {formLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Etiketi Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. &quot;{selectedTag?.name}&quot; etiketini silmek
              istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          {selectedTag?._count.posts && selectedTag._count.posts > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Bu etiket {selectedTag._count.posts} makalede kullanılıyor.
                Silindiğinde bu makalelerden kaldırılacak.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedTag(null)
              }}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={formLoading}
            >
              {formLoading ? <Spinner size="sm" className="mr-2" /> : null}
              Sil
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
