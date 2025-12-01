'use client'

// Kategori Yönetimi Sayfası
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { FolderTree, Plus, Pencil, Trash2, Search } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  parentId: string | null
  parent?: Category | null
  _count: {
    posts: number
    children: number
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Dialog states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formLoading, setFormLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/admin/categories')
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      } else {
        setError('Kategoriler yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setError('Kategori adı gerekli')
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          parentId: formData.parentId || undefined,
        }),
      })

      if (res.ok) {
        setSuccess('Kategori oluşturuldu')
        setIsCreateOpen(false)
        resetForm()
        fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Kategori oluşturulamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async () => {
    if (!selectedCategory || !formData.name.trim()) {
      setError('Kategori adı gerekli')
      return
    }

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug || undefined,
          description: formData.description || undefined,
          parentId: formData.parentId || null,
        }),
      })

      if (res.ok) {
        setSuccess('Kategori güncellendi')
        setIsEditOpen(false)
        resetForm()
        fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Kategori güncellenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return

    setFormLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/categories/${selectedCategory.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Kategori silindi')
        setIsDeleteOpen(false)
        setSelectedCategory(null)
        fetchCategories()
      } else {
        const data = await res.json()
        setError(data.error || 'Kategori silinemedi')
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
      description: '',
      parentId: '',
    })
    setSelectedCategory(null)
  }

  const openEditDialog = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      parentId: category.parentId || '',
    })
    setIsEditOpen(true)
  }

  const openDeleteDialog = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteOpen(true)
  }

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase())
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
            <FolderTree className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Kategoriler</h1>
            <p className="text-muted-foreground">
              Blog kategorilerini yönetin
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Kategori
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
              <CardTitle>Tüm Kategoriler</CardTitle>
              <CardDescription>
                Toplam {categories.length} kategori
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kategori ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FolderTree className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz kategori yok</p>
              <p className="text-sm">Yeni kategori ekleyerek başlayın</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori Adı</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Üst Kategori</TableHead>
                  <TableHead className="text-center">Makale</TableHead>
                  <TableHead className="text-center">Alt Kategori</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">
                      {category.name}
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      {category.parent ? (
                        <Badge variant="outline">{category.parent.name}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {category._count.posts}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">
                        {category._count.children}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(category)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yeni Kategori</DialogTitle>
            <DialogDescription>
              Yeni bir blog kategorisi oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Kategori Adı *</Label>
              <Input
                id="name"
                placeholder="Örn: Teknoloji"
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
            <div>
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                placeholder="Kategori açıklaması"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="parentId">Üst Kategori</Label>
              <select
                id="parentId"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
              >
                <option value="">Yok (Ana Kategori)</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
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
            <DialogTitle>Kategori Düzenle</DialogTitle>
            <DialogDescription>
              Kategori bilgilerini güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="edit-name">Kategori Adı *</Label>
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
            <div>
              <Label htmlFor="edit-description">Açıklama</Label>
              <Input
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="edit-parentId">Üst Kategori</Label>
              <select
                id="edit-parentId"
                className="w-full px-3 py-2 border rounded-md bg-background"
                value={formData.parentId}
                onChange={(e) =>
                  setFormData({ ...formData, parentId: e.target.value })
                }
              >
                <option value="">Yok (Ana Kategori)</option>
                {categories
                  .filter((cat) => cat.id !== selectedCategory?.id)
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
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
            <DialogTitle>Kategoriyi Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. &quot;{selectedCategory?.name}&quot; kategorisini
              silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          {selectedCategory?._count.posts && selectedCategory._count.posts > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                Bu kategoride {selectedCategory._count.posts} makale var.
                Silmeden önce makaleleri başka bir kategoriye taşıyın.
              </AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedCategory(null)
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
