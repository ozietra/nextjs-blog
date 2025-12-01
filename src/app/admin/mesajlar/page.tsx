'use client'

// İletişim Mesajları Yönetimi
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Mail, Trash2, Eye, Check, Clock, User } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  name: string
  email: string
  subject: string
  message: string
  read: boolean
  createdAt: string
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMessages()
  }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/admin/messages')
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      } else {
        setError('Mesajlar yüklenemedi')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: true }),
      })

      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, read: true } : m))
        )
        if (selectedMessage?.id === id) {
          setSelectedMessage({ ...selectedMessage, read: true })
        }
      }
    } catch (err) {
      console.error('Hata:', err)
    }
  }

  const deleteMessage = async (id: string) => {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/admin/messages/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== id))
        if (selectedMessage?.id === id) {
          setSelectedMessage(null)
        }
      }
    } catch (err) {
      console.error('Hata:', err)
    }
  }

  const unreadCount = messages.filter((m) => !m.read).length

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
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Mesajlar</h1>
            <p className="text-muted-foreground">
              İletişim formu mesajlarını yönetin
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <Badge variant="destructive">{unreadCount} okunmamış</Badge>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Messages List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Gelen Mesajlar</CardTitle>
            <CardDescription>{messages.length} mesaj</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    setSelectedMessage(message)
                    if (!message.read) markAsRead(message.id)
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedMessage?.id === message.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted'
                  } ${!message.read ? 'bg-blue-50 dark:bg-blue-950' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {!message.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                        )}
                        <p className="font-medium truncate">{message.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {message.subject}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteMessage(message.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Henüz mesaj yok
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Mesaj Detayı</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-semibold">
                        {selectedMessage.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a
                        href={`mailto:${selectedMessage.email}`}
                        className="hover:underline"
                      >
                        {selectedMessage.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Clock className="h-4 w-4" />
                      {formatDate(selectedMessage.createdAt)}
                    </div>
                  </div>
                  <Badge variant={selectedMessage.read ? 'secondary' : 'default'}>
                    {selectedMessage.read ? (
                      <>
                        <Check className="h-3 w-3 mr-1" />
                        Okundu
                      </>
                    ) : (
                      'Yeni'
                    )}
                  </Badge>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-2">{selectedMessage.subject}</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <a href={`mailto:${selectedMessage.email}`}>
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Yanıtla
                    </Button>
                  </a>
                  <Button
                    variant="destructive"
                    onClick={() => deleteMessage(selectedMessage.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Görüntülemek için sol taraftan bir mesaj seçin</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
