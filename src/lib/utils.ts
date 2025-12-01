// Yardımcı fonksiyonlar

import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import slugify from 'slugify'

// Tailwind class birleştirici
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Türkçe karakterleri İngilizce'ye dönüştürme haritası
const turkishMap: Record<string, string> = {
  'ş': 's', 'Ş': 'S',
  'ğ': 'g', 'Ğ': 'G',
  'ü': 'u', 'Ü': 'U',
  'ö': 'o', 'Ö': 'O',
  'ç': 'c', 'Ç': 'C',
  'ı': 'i', 'İ': 'I',
}

// Türkçe karakterleri İngilizce'ye dönüştür
export function turkishToEnglish(str: string): string {
  return str.replace(/[şŞğĞüÜöÖçÇıİ]/g, (char) => turkishMap[char] || char)
}

// SEO-friendly slug oluştur
export function createSlug(text: string): string {
  const converted = turkishToEnglish(text)
  return slugify(converted, {
    lower: true,
    strict: true,
    trim: true,
  })
}

// Okuma süresi hesapla (dakika)
export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

// HTML içeriğinden metin çıkar
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '')
}

// Özet oluştur (belirli karakter sayısına göre)
export function createExcerpt(content: string, length: number = 160): string {
  const text = stripHtml(content)
  if (text.length <= length) return text
  return text.substring(0, length).trim() + '...'
}

// Tarih formatla
export function formatDate(date: Date | string, locale: string = 'tr-TR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Tarih ve saat formatla
export function formatDateTime(date: Date | string, locale: string = 'tr-TR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Göreli zaman (örn: "3 gün önce")
export function timeAgo(date: Date | string, locale: string = 'tr-TR'): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (locale === 'tr-TR') {
    if (years > 0) return `${years} yıl önce`
    if (months > 0) return `${months} ay önce`
    if (days > 0) return `${days} gün önce`
    if (hours > 0) return `${hours} saat önce`
    if (minutes > 0) return `${minutes} dakika önce`
    return 'Az önce'
  }

  // İngilizce fallback
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}

// Sayıyı formatla (1000 -> 1K)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Dosya boyutu formatla
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// Rastgele ID oluştur
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Email validasyonu
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

// URL validasyonu
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// Kelime sayısı
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

// Karakter sayısı (boşluklar dahil/hariç)
export function characterCount(text: string, includeSpaces: boolean = true): number {
  return includeSpaces ? text.length : text.replace(/\s/g, '').length
}

// Renk HEX'den RGB'ye
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

// Debounce fonksiyonu
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle fonksiyonu
export function throttle<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Site URL'ini al (Vercel, VPS veya localhost)
export function getSiteUrl(): string {
  // 1. Önce kullanıcı tarafından tanımlanan URL'i kontrol et
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '') // Sondaki slash'ı kaldır
  }

  // 2. Vercel deployment URL'i (production için)
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }

  // 3. Vercel URL (preview deployments için)
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  // 4. NextAuth URL
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  }

  // 5. Fallback: localhost
  return 'http://localhost:3000'
}
