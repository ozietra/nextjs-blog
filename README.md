# Next.js 16 Blog Sistemi

Modern, SEO uyumlu ve tam özellikli bir blog platformu.

## Özellikler

### Genel
- ✅ Next.js 16 (App Router)
- ✅ TypeScript
- ✅ Tailwind CSS + shadcn/ui
- ✅ Prisma ORM + PostgreSQL
- ✅ NextAuth.js Authentication
- ✅ Dark/Light tema desteği
- ✅ Türkçe URL slug desteği (SEO uyumlu)
- ✅ Responsive tasarım

### Public Sayfalar
- ✅ Ana sayfa (öne çıkan yazılar, slider)
- ✅ Makale detay sayfası
- ✅ Kategori sayfaları
- ✅ Etiket sayfaları
- ✅ Yazar sayfaları
- ✅ Arama sayfası
- ✅ Hakkımızda
- ✅ İletişim formu
- ✅ Gizlilik Politikası
- ✅ Çerez Politikası

### Admin Panel
- ✅ Dashboard (istatistikler)
- ✅ Makale yönetimi (CRUD)
- ✅ Lexical zengin metin editörü
- ✅ AI İçerik Üretici (OpenAI)
- ✅ Kategori yönetimi
- ✅ Etiket yönetimi
- ✅ Yorum moderasyonu
- ✅ Medya yönetimi (WebP otomatik dönüşüm)
- ✅ Site ayarları

### SEO & Reklam
- ✅ Dinamik XML Sitemap
- ✅ robots.txt
- ✅ Schema.org yapılandırılmış veri
- ✅ Meta etiketler
- ✅ Open Graph
- ✅ Google AdSense entegrasyonu

## Kurulum

### Gereksinimler
- Node.js 18+
- PostgreSQL
- OpenAI API Key (opsiyonel, AI özelliği için)

### 1. Projeyi klonlayın
```bash
git clone <repo-url>
cd nextjs-blog
```

### 2. Bağımlılıkları yükleyin
```bash
npm install
```

### 3. Environment değişkenlerini ayarlayın
```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin:
```env
# Veritabanı
DATABASE_URL="postgresql://user:password@localhost:5432/blog?schema=public"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# OpenAI (opsiyonel)
OPENAI_API_KEY="sk-..."

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 4. Veritabanını hazırlayın
```bash
# Prisma client oluştur
npx prisma generate

# Migration çalıştır
npx prisma migrate dev --name init

# Örnek veri ekle
npx prisma db seed
```

### 5. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

Tarayıcınızda [http://localhost:3000](http://localhost:3000) adresini açın.

## Admin Girişi

Seed script ile oluşturulan varsayılan admin:
- **E-posta:** admin@example.com
- **Şifre:** admin123

⚠️ Production'da bu bilgileri mutlaka değiştirin!

## Proje Yapısı

```
nextjs-blog/
├── prisma/
│   ├── schema.prisma      # Veritabanı şeması
│   └── seed.ts            # Örnek veri scripti
├── public/
│   └── uploads/           # Yüklenen medya dosyaları
├── src/
│   ├── app/
│   │   ├── (public)/      # Public sayfalar
│   │   ├── (auth)/        # Login sayfası
│   │   ├── admin/         # Admin panel
│   │   ├── api/           # API routes
│   │   ├── sitemap.ts     # Dinamik sitemap
│   │   └── robots.ts      # robots.txt
│   ├── components/
│   │   ├── ui/            # shadcn/ui bileşenleri
│   │   ├── layout/        # Header, Footer, Sidebar
│   │   ├── blog/          # Blog bileşenleri
│   │   ├── editor/        # Lexical editör
│   │   ├── seo/           # Schema.org
│   │   └── ads/           # AdSense
│   ├── lib/
│   │   ├── db.ts          # Prisma client
│   │   ├── auth.ts        # NextAuth config
│   │   └── utils.ts       # Yardımcı fonksiyonlar
│   └── providers/         # Context providers
└── package.json
```

## API Endpoints

### Public
- `GET /api/comments?postId=xxx` - Makale yorumları
- `POST /api/comments` - Yorum gönder
- `POST /api/contact` - İletişim formu

### Admin (Auth gerekli)
- `GET/POST /api/admin/posts` - Makaleler
- `GET/PUT/DELETE /api/admin/posts/[id]` - Tekil makale
- `GET/POST /api/admin/categories` - Kategoriler
- `GET/PUT/DELETE /api/admin/categories/[id]` - Tekil kategori
- `GET/POST /api/admin/tags` - Etiketler
- `GET/PUT/DELETE /api/admin/tags/[id]` - Tekil etiket
- `GET /api/admin/comments` - Tüm yorumlar
- `PUT/DELETE /api/admin/comments/[id]` - Yorum moderasyonu
- `GET/POST /api/admin/media` - Medya yönetimi
- `DELETE /api/admin/media/[id]` - Medya silme
- `GET/PUT/POST /api/admin/settings` - Site ayarları
- `POST /api/admin/ai/generate` - AI içerik üretimi

## Özelleştirme

### Tema Renkleri
`tailwind.config.ts` ve `src/app/globals.css` dosyalarını düzenleyin.

### Logo ve Favicon
- Logo: `/public/images/logo.png`
- Favicon: `/public/favicon.ico`

### AdSense
Admin Panel > Ayarlar > AdSense sekmesinden yapılandırın.

## Production

### Build
```bash
npm run build
```

### Start
```bash
npm start
```

### Environment
Production için gerekli environment değişkenleri:
- `DATABASE_URL` - Production PostgreSQL bağlantısı
- `NEXTAUTH_URL` - Production URL
- `NEXTAUTH_SECRET` - Güçlü rastgele string
- `NEXT_PUBLIC_SITE_URL` - Public site URL

## Lisans

MIT

## Destek

Sorularınız için issue açabilirsiniz.
