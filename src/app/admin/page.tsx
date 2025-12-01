// Admin Dashboard
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  Eye,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react'
import Link from 'next/link'
import { formatDate, formatNumber } from '@/lib/utils'

async function getStats() {
  const [
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews,
    totalComments,
    pendingComments,
    totalCategories,
    totalTags,
    recentPosts,
    recentComments,
  ] = await Promise.all([
    db.post.count(),
    db.post.count({ where: { published: true } }),
    db.post.count({ where: { published: false } }),
    db.post.aggregate({ _sum: { viewCount: true } }),
    db.comment.count(),
    db.comment.count({ where: { approved: false } }),
    db.category.count(),
    db.tag.count(),
    db.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        author: { select: { name: true } },
        category: { select: { name: true } },
      },
    }),
    db.comment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      where: { approved: false },
      include: {
        post: { select: { title: true, slug: true } },
      },
    }),
  ])

  return {
    totalPosts,
    publishedPosts,
    draftPosts,
    totalViews: totalViews._sum.viewCount || 0,
    totalComments,
    pendingComments,
    totalCategories,
    totalTags,
    recentPosts,
    recentComments,
  }
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Makale
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.publishedPosts} yayında, {stats.draftPosts} taslak
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Görüntülenme
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalViews)}
            </div>
            <p className="text-xs text-muted-foreground">
              Tüm zamanlar
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Yorumlar
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalComments}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingComments} onay bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kategoriler / Etiketler
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalCategories} / {stats.totalTags}
            </div>
            <p className="text-xs text-muted-foreground">
              Kategori ve etiket
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Son Makaleler</CardTitle>
              <Link
                href="/admin/makaleler"
                className="text-sm text-primary hover:underline"
              >
                Tümünü Gör
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentPosts.length > 0 ? (
              <div className="space-y-4">
                {stats.recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/admin/makaleler/duzenle/${post.id}`}
                        className="font-medium hover:text-primary truncate block"
                      >
                        {post.title}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{post.author.name}</span>
                        {post.category && (
                          <>
                            <span>•</span>
                            <span>{post.category.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(post.createdAt)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Henüz makale yok
              </p>
            )}
          </CardContent>
        </Card>

        {/* Pending Comments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Onay Bekleyen Yorumlar</CardTitle>
              <Link
                href="/admin/yorumlar"
                className="text-sm text-primary hover:underline"
              >
                Tümünü Gör
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats.recentComments.length > 0 ? (
              <div className="space-y-4">
                {stats.recentComments.map((comment) => (
                  <div key={comment.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{comment.authorName}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {comment.content}
                    </p>
                    <Link
                      href={`/${comment.post.slug}`}
                      className="text-xs text-primary hover:underline"
                    >
                      {comment.post.title}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                Onay bekleyen yorum yok
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Hızlı İşlemler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admin/makaleler/yeni"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              + Yeni Makale
            </Link>
            <Link
              href="/admin/ai-icerik"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              AI ile İçerik Üret
            </Link>
            <Link
              href="/admin/kategoriler"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Kategoriler
            </Link>
            <Link
              href="/admin/medya"
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Medya Yükle
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
