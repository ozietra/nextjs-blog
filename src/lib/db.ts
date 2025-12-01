// Prisma Client instance
// Global instance kullanarak hot-reload'da yeniden bağlantı oluşmasını önlüyoruz

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

export default db
