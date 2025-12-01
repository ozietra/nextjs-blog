// Storage Adapter - Vercel Blob veya Local Storage
import { put, del } from '@vercel/blob'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'
import sharp from 'sharp'

export type StorageType = 'vercel' | 'local'

interface UploadResult {
  url: string
  pathname: string
  width?: number
  height?: number
  size?: number
}

// Storage tipini belirle
export function getStorageType(): StorageType {
  // STORAGE_TYPE env varsa onu kullan, yoksa BLOB_READ_WRITE_TOKEN varsa vercel
  if (process.env.STORAGE_TYPE === 'local') {
    return 'local'
  }
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return 'vercel'
  }
  return 'local'
}

// Vercel Blob token'ı temizle
function getCleanBlobToken(): string | undefined {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) return undefined
  return token.replace(/[^\x20-\x7E]/g, '').trim()
}

// Upload dizinini al
function getUploadDir(): string {
  return process.env.UPLOAD_DIR || './public/uploads'
}

// Site URL'ini al
function getStorageSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL.replace(/\/$/, '')
  }
  return 'http://localhost:3000'
}

// Görsel dosyasını WebP'ye dönüştür
async function convertToWebP(buffer: Buffer): Promise<{
  buffer: Buffer
  width: number
  height: number
}> {
  const image = sharp(buffer)
  const metadata = await image.metadata()

  const webpBuffer = await image
    .webp({ quality: 85 })
    .toBuffer()

  return {
    buffer: webpBuffer,
    width: metadata.width || 0,
    height: metadata.height || 0,
  }
}

// Dosya yükle
export async function uploadFile(
  file: File,
  filename: string
): Promise<UploadResult> {
  const storageType = getStorageType()

  // Görsel dosyalarını WebP'ye dönüştür
  const isImage = file.type.startsWith('image/') && !file.type.includes('gif') && !file.type.includes('svg')

  let processedBuffer: Buffer
  let finalFilename = filename
  let width: number | undefined
  let height: number | undefined

  const bytes = await file.arrayBuffer()
  const originalBuffer = Buffer.from(bytes)

  if (isImage) {
    try {
      const converted = await convertToWebP(originalBuffer)
      processedBuffer = converted.buffer
      width = converted.width
      height = converted.height
      // Dosya adını .webp olarak değiştir
      finalFilename = filename.replace(/\.[^.]+$/, '.webp')
    } catch (error) {
      console.error('WebP conversion failed, using original:', error)
      processedBuffer = originalBuffer
    }
  } else {
    processedBuffer = originalBuffer
  }

  // Blob oluştur
  const processedFile = new Blob([new Uint8Array(processedBuffer)], {
    type: isImage && finalFilename.endsWith('.webp') ? 'image/webp' : file.type
  })

  if (storageType === 'vercel') {
    const result = await uploadToVercel(processedFile, finalFilename)
    return { ...result, width, height, size: processedBuffer.length }
  } else {
    const result = await uploadToLocal(processedBuffer, finalFilename)
    return { ...result, width, height, size: processedBuffer.length }
  }
}

// Vercel Blob'a yükle
async function uploadToVercel(file: Blob, filename: string): Promise<UploadResult> {
  const cleanToken = getCleanBlobToken()

  if (!cleanToken) {
    throw new Error('BLOB_READ_WRITE_TOKEN yapılandırılmamış')
  }

  const blob = await put(filename, file, {
    access: 'public',
    addRandomSuffix: false,
    token: cleanToken,
  })

  return {
    url: blob.url,
    pathname: filename,
  }
}

// Local storage'a yükle
async function uploadToLocal(buffer: Buffer, filename: string): Promise<UploadResult> {
  const uploadDir = getUploadDir()
  const siteUrl = getStorageSiteUrl()

  // Upload dizinini oluştur
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  // Dosya yolunu oluştur
  const filePath = path.join(uploadDir, filename)

  // Buffer'ı kaydet
  await writeFile(filePath, buffer)

  // URL'i oluştur
  const url = `${siteUrl}/uploads/${filename}`

  return {
    url,
    pathname: filename,
  }
}

// Dosya sil
export async function deleteFile(urlOrPathname: string): Promise<void> {
  const storageType = getStorageType()

  // Vercel Blob URL'si mi kontrol et
  if (urlOrPathname.includes('blob.vercel-storage.com')) {
    await deleteFromVercel(urlOrPathname)
  } else if (storageType === 'local' || urlOrPathname.includes('/uploads/')) {
    await deleteFromLocal(urlOrPathname)
  }
}

// Vercel Blob'dan sil
async function deleteFromVercel(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error('Vercel Blob delete error:', error)
    throw error
  }
}

// Local storage'dan sil
async function deleteFromLocal(urlOrPathname: string): Promise<void> {
  const uploadDir = getUploadDir()

  // URL'den filename'i çıkar
  let filename: string
  if (urlOrPathname.includes('/uploads/')) {
    filename = urlOrPathname.split('/uploads/').pop() || ''
  } else {
    filename = urlOrPathname
  }

  if (!filename) {
    throw new Error('Geçersiz dosya yolu')
  }

  const filePath = path.join(uploadDir, filename)

  try {
    await unlink(filePath)
  } catch (error) {
    console.error('Local file delete error:', error)
    throw error
  }
}

// Storage tipini kontrol et ve bilgi döndür
export function getStorageInfo(): {
  type: StorageType
  configured: boolean
  message: string
} {
  const storageType = getStorageType()

  if (storageType === 'vercel') {
    const hasToken = !!process.env.BLOB_READ_WRITE_TOKEN
    return {
      type: 'vercel',
      configured: hasToken,
      message: hasToken
        ? 'Vercel Blob Storage aktif'
        : 'BLOB_READ_WRITE_TOKEN yapılandırılmamış',
    }
  }

  return {
    type: 'local',
    configured: true,
    message: `Local storage aktif (${getUploadDir()})`,
  }
}
