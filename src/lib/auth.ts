// NextAuth.js Yapılandırması
import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { db } from './db'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Şifre', type: 'password' },
      },
      async authorize(credentials) {
        console.log('[AUTH] Login attempt:', credentials?.email)

        try {
          if (!credentials?.email || !credentials?.password) {
            console.log('[AUTH] Missing credentials')
            return null
          }

          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          console.log('[AUTH] User found:', !!user)

          if (!user || !user.password) {
            console.log('[AUTH] No user or no password')
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          console.log('[AUTH] Password valid:', isPasswordValid)

          if (!isPasswordValid) {
            return null
          }

          console.log('[AUTH] Returning user:', user.id)
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.avatar || undefined,
            avatar: user.avatar || undefined,
          }
        } catch (error) {
          console.error('[AUTH] Error:', error)
          return null
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.avatar = (user as { avatar?: string }).avatar
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.avatar = token.avatar as string | undefined
      }
      return session
    },
  },
  pages: {
    signIn: '/giris',
    error: '/giris',
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
}
