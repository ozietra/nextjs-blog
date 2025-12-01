'use client'

// Medya Yönetimi Sayfası
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
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
import {
  ImageIcon,
  Upload,
  Trash2,
  Search,
  Copy,
  Check,
  X,
  FileImage,
  HardDrive,
  Calendar,
  Link as LinkIcon,
} from 'lucide-react'

interface MediaItem {
  id: string
  filename: string
  originalName: string
  url: string
  type: string
  size: number
  width: number | null
  height: number | null
  alt: string | null
  createdAt: string
}

export default function MediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Dialog states
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMedia()
  }, [])

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/admin/media')
      if (res.ok) {
        const data = await res.json()
        setMedia(data)
      } else {
        setError('Medya dosyaları yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i])
    }

    try {
      const res = await fetch('/api/admin/media', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setSuccess(`${data.uploaded} dosya yüklendi`)
        fetchMedia()
      } else {
        const data = await res.json()
        setError(data.error || 'Dosyalar yüklenemedi')
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

  const handleDelete = async () => {
    if (!selectedMedia) return

    setActionLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/media/${selectedMedia.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Dosya silindi')
        setIsDeleteOpen(false)
        setSelectedMedia(null)
        fetchMedia()
      } else {
        const data = await res.json()
        setError(data.error || 'Dosya silinemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopy = (url: string, id: string) => {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const filteredMedia = media.filter(
    (item) =>
      item.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.originalName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalSize = media.reduce((acc, item) => acc + item.size, 0)

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
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Medya</h1>
            <p className="text-muted-foreground">
              Görsel ve dosyalarınızı yönetin
            </p>
          </div>
        </div>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <FileImage className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Dosya</p>
                <p className="text-2xl font-bold">{media.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <HardDrive className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Boyut</p>
                <p className="text-2xl font-bold">{formatFileSize(totalSize)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
                <ImageIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">WebP Formatı</p>
                <p className="text-2xl font-bold">
                  {media.filter((m) => m.type === 'image/webp').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <AlertDescription>
            {error}
            {error.includes('Blob') && (
              <p className="mt-2 text-sm">
                Vercel Dashboard &gt; Storage &gt; Create Database &gt; Blob seçerek bir store oluşturun ve projeye bağlayın.
              </p>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tüm Dosyalar</CardTitle>
              <CardDescription>
                Yüklenen görseller otomatik WebP formatına dönüştürülür
              </CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Dosya ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredMedia.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Henüz dosya yok</p>
              <p className="text-sm">Dosya yükleyerek başlayın</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                  onClick={() => {
                    setSelectedMedia(item)
                    setIsViewOpen(true)
                  }}
                >
                  <Image
                    src={item.url}
                    alt={item.alt || item.originalName}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs truncate">
                      {item.originalName}
                    </p>
                    <p className="text-white/70 text-xs">
                      {formatFileSize(item.size)}
                    </p>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCopy(item.url, item.id)
                      }}
                    >
                      {copiedId === item.id ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedMedia(item)
                        setIsDeleteOpen(true)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {item.type === 'image/webp' && (
                    <Badge className="absolute top-2 left-2 text-xs">WebP</Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Dosya Detayları</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.alt || selectedMedia.originalName}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-foreground">Dosya Adı</Label>
                  <p className="font-medium">{selectedMedia.originalName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Boyut</Label>
                  <p>{formatFileSize(selectedMedia.size)}</p>
                </div>
                {selectedMedia.width && selectedMedia.height && (
                  <div>
                    <Label className="text-muted-foreground">Boyutlar</Label>
                    <p>
                      {selectedMedia.width} x {selectedMedia.height} px
                    </p>
                  </div>
                )}
                <div>
                  <Label className="text-muted-foreground">Format</Label>
                  <p>{selectedMedia.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Tarih</Label>
                  <p>{formatDate(selectedMedia.createdAt)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={selectedMedia.url}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopy(selectedMedia.url, selectedMedia.id)}
                    >
                      {copiedId === selectedMedia.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(selectedMedia.url, '_blank')}
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Görüntüle
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setIsViewOpen(false)
                      setIsDeleteOpen(true)
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dosyayı Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. &quot;{selectedMedia?.originalName}&quot; dosyasını
              silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedMedia(null)
              }}
            >
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
