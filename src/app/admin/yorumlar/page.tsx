'use client'

// Yorum Yönetimi Sayfası
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  MessageSquare,
  Check,
  X,
  Trash2,
  Search,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react'

interface Comment {
  id: string
  content: string
  authorName: string
  authorEmail: string
  approved: boolean
  createdAt: string
  post: {
    id: string
    title: string
    slug: string
  }
  parent?: {
    id: string
    authorName: string
  } | null
}

export default function CommentsPage() {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('pending')

  // Dialog states
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/admin/comments')
      if (res.ok) {
        const data = await res.json()
        setComments(data)
      } else {
        setError('Yorumlar yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    setActionLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })

      if (res.ok) {
        setSuccess('Yorum onaylandı')
        fetchComments()
      } else {
        const data = await res.json()
        setError(data.error || 'Yorum onaylanamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (commentId: string) => {
    setActionLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: false }),
      })

      if (res.ok) {
        setSuccess('Yorum reddedildi')
        fetchComments()
      } else {
        const data = await res.json()
        setError(data.error || 'İşlem başarısız')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedComment) return

    setActionLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/admin/comments/${selectedComment.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setSuccess('Yorum silindi')
        setIsDeleteOpen(false)
        setSelectedComment(null)
        fetchComments()
      } else {
        const data = await res.json()
        setError(data.error || 'Yorum silinemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setActionLoading(false)
    }
  }

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.authorEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.post.title.toLowerCase().includes(searchQuery.toLowerCase())

    if (activeTab === 'pending') return !comment.approved && matchesSearch
    if (activeTab === 'approved') return comment.approved && matchesSearch
    return matchesSearch
  })

  const pendingCount = comments.filter((c) => !c.approved).length
  const approvedCount = comments.filter((c) => c.approved).length

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
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
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Yorumlar</h1>
            <p className="text-muted-foreground">
              Blog yorumlarını yönetin ve onaylayın
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
                <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Toplam Yorum</p>
                <p className="text-2xl font-bold">{comments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Onay Bekleyen</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Onaylanmış</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-auto"
            >
              <TabsList>
                <TabsTrigger value="pending" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Bekleyen
                  {pendingCount > 0 && (
                    <Badge variant="secondary">{pendingCount}</Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="approved" className="gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Onaylı
                </TabsTrigger>
                <TabsTrigger value="all" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Tümü
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Yorum ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredComments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>
                {activeTab === 'pending'
                  ? 'Onay bekleyen yorum yok'
                  : activeTab === 'approved'
                    ? 'Onaylanmış yorum yok'
                    : 'Henüz yorum yok'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yazar</TableHead>
                  <TableHead>Yorum</TableHead>
                  <TableHead>Makale</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredComments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comment.authorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {comment.authorEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate">{comment.content}</p>
                      {comment.parent && (
                        <p className="text-xs text-muted-foreground mt-1">
                          ↳ {comment.parent.authorName} yorumuna yanıt
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{comment.post.title}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {comment.approved ? (
                        <Badge
                          variant="outline"
                          className="text-green-600 border-green-600"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Onaylı
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-orange-600 border-orange-600"
                        >
                          <Clock className="h-3 w-3 mr-1" />
                          Bekliyor
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComment(comment)
                            setIsViewOpen(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!comment.approved ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleApprove(comment.id)}
                            disabled={actionLoading}
                            className="text-green-600 hover:text-green-600"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReject(comment.id)}
                            disabled={actionLoading}
                            className="text-orange-600 hover:text-orange-600"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedComment(comment)
                            setIsDeleteOpen(true)
                          }}
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

      {/* View Dialog */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yorum Detayı</DialogTitle>
          </DialogHeader>
          {selectedComment && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Yazar</p>
                <p className="font-medium">{selectedComment.authorName}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedComment.authorEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Makale</p>
                <p className="font-medium">{selectedComment.post.title}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tarih</p>
                <p>{formatDate(selectedComment.createdAt)}</p>
              </div>
              {selectedComment.parent && (
                <div>
                  <p className="text-sm text-muted-foreground">Yanıt</p>
                  <p>{selectedComment.parent.authorName} yorumuna yanıt</p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Yorum</p>
                <p className="p-4 bg-muted rounded-lg">{selectedComment.content}</p>
              </div>
              <div className="flex gap-2">
                {!selectedComment.approved ? (
                  <Button
                    onClick={() => {
                      handleApprove(selectedComment.id)
                      setIsViewOpen(false)
                    }}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Onayla
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleReject(selectedComment.id)
                      setIsViewOpen(false)
                    }}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Onayı Kaldır
                  </Button>
                )}
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
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yorumu Sil</DialogTitle>
            <DialogDescription>
              Bu işlem geri alınamaz. Yorumu silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteOpen(false)
                setSelectedComment(null)
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
