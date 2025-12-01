'use client'

// Admin Sidebar Component
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  Tags,
  MessageSquare,
  Image,
  Settings,
  Sparkles,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  UserCircle,
  FileCode,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { useState } from 'react'

const menuItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Makaleler',
    href: '/admin/makaleler',
    icon: FileText,
  },
  {
    title: 'AI İçerik',
    href: '/admin/ai-icerik',
    icon: Sparkles,
  },
  {
    title: 'Kategoriler',
    href: '/admin/kategoriler',
    icon: FolderTree,
  },
  {
    title: 'Etiketler',
    href: '/admin/etiketler',
    icon: Tags,
  },
  {
    title: 'Yorumlar',
    href: '/admin/yorumlar',
    icon: MessageSquare,
  },
  {
    title: 'Mesajlar',
    href: '/admin/mesajlar',
    icon: Mail,
  },
  {
    title: 'Medya',
    href: '/admin/medya',
    icon: Image,
  },
  {
    title: 'Sayfalar',
    href: '/admin/sayfalar',
    icon: FileCode,
  },
  {
    title: 'Kullanıcılar',
    href: '/admin/kullanicilar',
    icon: Users,
  },
  {
    title: 'Profil',
    href: '/admin/profil',
    icon: UserCircle,
  },
  {
    title: 'Ayarlar',
    href: '/admin/ayarlar',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-card border-r flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b">
        {!collapsed && (
          <Link href="/admin" className="text-lg font-bold text-primary">
            Admin Panel
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={cn(collapsed && 'mx-auto')}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/admin' && pathname.startsWith(item.href))

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent',
                    collapsed && 'justify-center'
                  )}
                  title={collapsed ? item.title : undefined}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t">
        {session?.user && (
          <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
            <Avatar
              src={session.user.avatar}
              alt={session.user.name || ''}
              size="sm"
            />
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {session.user.email}
                </p>
              </div>
            )}
          </div>
        )}

        <div className={cn('mt-3 flex gap-2', collapsed && 'flex-col')}>
          <Link href="/" className="flex-1">
            <Button
              variant="outline"
              size="sm"
              className={cn('w-full', collapsed && 'px-0')}
              title="Siteye Git"
            >
              {collapsed ? <User className="h-4 w-4" /> : 'Siteye Git'}
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => signOut({ callbackUrl: '/giris' })}
            className={cn(collapsed && 'px-0')}
            title="Çıkış Yap"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Çıkış</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
