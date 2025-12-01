'use client'

// Statik Sayfalar Yönetimi
import { useState, useEffect } from 'react'
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
import { FileText, Save, Plus, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

interface Page {
  id: string
  title: string
  slug: string
  content: string
  metaTitle?: string | null
  metaDesc?: string | null
  published: boolean
}

export default function PagesPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [selectedPage, setSelectedPage] = useState<Page | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data)
      }
    } catch (err) {
      setError('Sayfalar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!selectedPage) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const method = selectedPage.id ? 'PUT' : 'POST'
      const url = selectedPage.id
        ? `/api/admin/pages/${selectedPage.id}`
        : '/api/admin/pages'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedPage),
      })

      if (res.ok) {
        setSuccess('Sayfa kaydedildi')
        await fetchPages()
        const data = await res.json()
        setSelectedPage(data)
      } else {
        const data = await res.json()
        setError(data.error || 'Kaydetme başarısız')
      }
    } catch {
      setError('Bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu sayfayı silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/admin/pages/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Sayfa silindi')
        await fetchPages()
        if (selectedPage?.id === id) {
          setSelectedPage(null)
        }
      } else {
        setError('Silme başarısız')
      }
    } catch {
      setError('Bir hata oluştu')
    }
  }

  const createNewPage = () => {
    setSelectedPage({
      id: '',
      title: '',
      slug: '',
      content: '',
      metaTitle: '',
      metaDesc: '',
      published: true,
    })
  }

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
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Statik Sayfalar</h1>
            <p className="text-muted-foreground">
              Hakkımızda, Gizlilik Politikası gibi sayfaları yönetin
            </p>
          </div>
        </div>
        <Button onClick={createNewPage}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Sayfa
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
        {/* Pages List */}
        <Card>
          <CardHeader>
            <CardTitle>Sayfalar</CardTitle>
            <CardDescription>Düzenlemek için bir sayfa seçin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {pages.map((page) => (
                <div
                  key={page.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedPage?.id === page.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => setSelectedPage(page)}
                >
                  <div>
                    <p className="font-medium">{page.title}</p>
                    <p className="text-sm text-muted-foreground">/{page.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Link href={`/${page.slug}`} target="_blank">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(page.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {pages.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Henüz sayfa bulunmuyor
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>
              {selectedPage?.id ? 'Sayfayı Düzenle' : 'Yeni Sayfa'}
            </CardTitle>
            <CardDescription>
              Sayfa içeriğini HTML formatında yazabilirsiniz
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPage ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      value={selectedPage.title}
                      onChange={(e) =>
                        setSelectedPage({ ...selectedPage, title: e.target.value })
                      }
                      placeholder="Sayfa Başlığı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      value={selectedPage.slug}
                      onChange={(e) =>
                        setSelectedPage({ ...selectedPage, slug: e.target.value })
                      }
                      placeholder="hakkimizda"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="content">İçerik (HTML)</Label>
                  <Textarea
                    id="content"
                    value={selectedPage.content}
                    onChange={(e) =>
                      setSelectedPage({ ...selectedPage, content: e.target.value })
                    }
                    placeholder="<h2>Başlık</h2><p>İçerik...</p>"
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="metaTitle">Meta Başlık (SEO)</Label>
                    <Input
                      id="metaTitle"
                      value={selectedPage.metaTitle || ''}
                      onChange={(e) =>
                        setSelectedPage({
                          ...selectedPage,
                          metaTitle: e.target.value,
                        })
                      }
                      placeholder="SEO başlığı"
                    />
                  </div>
                  <div>
                    <Label htmlFor="metaDesc">Meta Açıklama (SEO)</Label>
                    <Input
                      id="metaDesc"
                      value={selectedPage.metaDesc || ''}
                      onChange={(e) =>
                        setSelectedPage({
                          ...selectedPage,
                          metaDesc: e.target.value,
                        })
                      }
                      placeholder="155 karakterlik açıklama"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => setSelectedPage(null)}>
                    İptal
                  </Button>
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
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Düzenlemek için sol taraftan bir sayfa seçin</p>
                <p className="text-sm">veya yeni bir sayfa oluşturun</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
