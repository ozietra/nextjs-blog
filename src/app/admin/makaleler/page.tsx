// Makale Listesi Sayfası
import Link from 'next/link'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils'

export const dynamic = 'force-dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Eye, Edit, Trash2 } from 'lucide-react'
import { DeletePostButton } from './delete-post-button'

async function getPosts() {
  return db.post.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
      _count: { select: { comments: true } },
    },
  })
}

export default async function PostsPage() {
  const posts = await getPosts()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Makaleler</h1>
        <Link href="/admin/makaleler/yeni">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Makale
          </Button>
        </Link>
      </div>

      {posts.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40%]">Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Yazar</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Görüntülenme</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <div>
                      <Link
                        href={`/admin/makaleler/duzenle/${post.id}`}
                        className="font-medium hover:text-primary"
                      >
                        {post.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        /{post.slug}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {post.category?.name || (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{post.author.name}</TableCell>
                  <TableCell>
                    {post.published ? (
                      <Badge variant="success">Yayında</Badge>
                    ) : (
                      <Badge variant="secondary">Taslak</Badge>
                    )}
                    {post.featured && (
                      <Badge variant="warning" className="ml-1">
                        Öne Çıkan
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{post.viewCount}</TableCell>
                  <TableCell>{formatDate(post.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/${post.slug}`} target="_blank">
                        <Button variant="ghost" size="icon" title="Görüntüle">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link href={`/admin/makaleler/duzenle/${post.id}`}>
                        <Button variant="ghost" size="icon" title="Düzenle">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <DeletePostButton postId={post.id} postTitle={post.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground mb-4">Henüz makale yok</p>
          <Link href="/admin/makaleler/yeni">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              İlk Makaleyi Oluştur
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
