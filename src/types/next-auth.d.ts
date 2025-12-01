// NextAuth.js Type Declarations
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      avatar?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    role: string
    avatar?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    role: string
    avatar?: string
  }
}
