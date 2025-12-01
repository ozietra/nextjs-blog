// Middleware - Route Koruması
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Admin sayfaları için rol kontrolü
    if (pathname.startsWith('/admin')) {
      if (!token || (token.role !== 'ADMIN' && token.role !== 'AUTHOR')) {
        return NextResponse.redirect(new URL('/giris', req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname

        // Admin sayfaları için token gerekli
        if (pathname.startsWith('/admin')) {
          return !!token
        }

        // Diğer sayfalar için izin ver
        return true
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*'],
}
