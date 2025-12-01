// NextAuth.js Type Declarations
import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      avatar?: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    avatar?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    avatar?: string
  }
}
