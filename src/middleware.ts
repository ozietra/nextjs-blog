// Middleware - Route Koruması
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

// Rol bazlı erişim izinleri
const rolePermissions: Record<string, string[]> = {
  ADMIN: ['*'], // Tüm sayfalara erişim
  EDITOR: [
    '/admin',
    '/admin/makaleler',
    '/admin/kategoriler',
    '/admin/etiketler',
    '/admin/yorumlar',
    '/admin/medya',
    '/admin/profil',
  ],
  AUTHOR: [
    '/admin',
    '/admin/makaleler',
    '/admin/medya',
    '/admin/profil',
  ],
  SUBSCRIBER: [
    '/admin/profil',
    '/hesabim',
  ],
}

// Sadece admin erişebileceği sayfalar
const adminOnlyPages = [
  '/admin/ayarlar',
  '/admin/kullanicilar',
  '/admin/mesajlar',
  '/admin/sayfalar',
  '/admin/ai-icerik',
]

function hasAccess(role: string | undefined, pathname: string): boolean {
  if (!role) return false

  const permissions = rolePermissions[role] || []

  // Admin her yere erişebilir
  if (permissions.includes('*')) return true

  // Admin-only sayfalar kontrolü
  if (adminOnlyPages.some(page => pathname.startsWith(page))) {
    return role === 'ADMIN'
  }

  // Diğer sayfalar için izin kontrolü
  return permissions.some(allowed =>
    pathname === allowed || pathname.startsWith(allowed + '/')
  )
}

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin sayfaları için rol kontrolü
    if (pathname.startsWith('/admin')) {
      const role = token?.role as string | undefined

      if (!hasAccess(role, pathname)) {
        // SUBSCRIBER için hesabım sayfasına yönlendir
        if (role === 'SUBSCRIBER') {
          return NextResponse.redirect(new URL('/hesabim', req.url))
        }
        // Yetkisiz erişim - ana sayfaya yönlendir
        return NextResponse.redirect(new URL('/', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Admin ve hesabım sayfaları için token gerekli
        if (pathname.startsWith('/admin') || pathname.startsWith('/hesabim')) {
          return !!token
        }

        // Diğer sayfalar için izin ver
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/hesabim/:path*'],
}
