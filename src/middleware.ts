// Middleware - Route Koruması (Sadece ADMIN)
import { withAuth } from 'next-auth/middleware'

export default withAuth({
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
})

export const config = {
  matcher: ['/admin/:path*'],
}
