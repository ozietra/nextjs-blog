// Prisma Seed Script
import { PrismaClient, Role } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin kullanıcı oluştur
  const adminPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin',
      password: adminPassword,
      role: Role.ADMIN,
      bio: 'Blog yöneticisi',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // Kategoriler oluştur
  const categories = [
    { name: 'Teknoloji', slug: 'teknoloji', description: 'Teknoloji haberleri ve yazıları' },
    { name: 'Yazılım', slug: 'yazilim', description: 'Yazılım geliştirme ve programlama' },
    { name: 'Tasarım', slug: 'tasarim', description: 'UI/UX ve grafik tasarım' },
    { name: 'İş Dünyası', slug: 'is-dunyasi', description: 'İş ve girişimcilik' },
    { name: 'Kişisel Gelişim', slug: 'kisisel-gelisim', description: 'Kişisel gelişim ve motivasyon' },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }
  console.log('✅ Categories created')

  // Etiketler oluştur
  const tags = [
    { name: 'JavaScript', slug: 'javascript' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'React', slug: 'react' },
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'Node.js', slug: 'nodejs' },
    { name: 'CSS', slug: 'css' },
    { name: 'Tailwind', slug: 'tailwind' },
    { name: 'SEO', slug: 'seo' },
    { name: 'Web Geliştirme', slug: 'web-gelistirme' },
    { name: 'Veritabanı', slug: 'veritabani' },
  ]

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: {},
      create: tag,
    })
  }
  console.log('✅ Tags created')

  // Örnek makale oluştur
  const category = await prisma.category.findFirst({
    where: { slug: 'teknoloji' },
  })

  const samplePost = await prisma.post.upsert({
    where: { slug: 'nextjs-14-ile-modern-web-gelistirme' },
    update: {},
    create: {
      title: 'Next.js 14 ile Modern Web Geliştirme',
      slug: 'nextjs-14-ile-modern-web-gelistirme',
      content: `
        <h2>Next.js 14 Nedir?</h2>
        <p>Next.js 14, React tabanlı modern web uygulamaları geliştirmek için kullanılan güçlü bir framework'tür. Vercel tarafından geliştirilen bu framework, server-side rendering, static site generation ve API routes gibi özellikler sunar.</p>

        <h2>Öne Çıkan Özellikler</h2>
        <ul>
          <li><strong>App Router:</strong> Yeni dosya tabanlı routing sistemi</li>
          <li><strong>Server Components:</strong> Sunucu tarafında render edilen React bileşenleri</li>
          <li><strong>Turbopack:</strong> Hızlı geliştirme deneyimi</li>
          <li><strong>Server Actions:</strong> Form işlemleri için sunucu fonksiyonları</li>
        </ul>

        <h2>Kurulum</h2>
        <p>Yeni bir Next.js projesi oluşturmak için:</p>
        <pre><code>npx create-next-app@latest my-app</code></pre>

        <h2>Sonuç</h2>
        <p>Next.js 14, modern web geliştirme için mükemmel bir seçimdir. Performans, SEO ve geliştirici deneyimi açısından rakiplerinden öne çıkmaktadır.</p>
      `,
      excerpt:
        'Next.js 14 ile modern web uygulamaları geliştirmenin temelleri ve yeni özellikler.',
      metaDesc:
        'Next.js 14 framework özellikleri, kurulum ve kullanım rehberi. Modern web geliştirme için en iyi pratikler.',
      published: true,
      featured: true,
      readingTime: 5,
      authorId: admin.id,
      categoryId: category?.id,
    },
  })

  // Etiketleri makaleye bağla
  const jsTag = await prisma.tag.findFirst({ where: { slug: 'javascript' } })
  const nextTag = await prisma.tag.findFirst({ where: { slug: 'nextjs' } })
  const reactTag = await prisma.tag.findFirst({ where: { slug: 'react' } })

  if (jsTag) {
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: samplePost.id, tagId: jsTag.id } },
      update: {},
      create: { postId: samplePost.id, tagId: jsTag.id },
    })
  }
  if (nextTag) {
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: samplePost.id, tagId: nextTag.id } },
      update: {},
      create: { postId: samplePost.id, tagId: nextTag.id },
    })
  }
  if (reactTag) {
    await prisma.postTag.upsert({
      where: { postId_tagId: { postId: samplePost.id, tagId: reactTag.id } },
      update: {},
      create: { postId: samplePost.id, tagId: reactTag.id },
    })
  }
  console.log('✅ Sample post created')

  // Varsayılan ayarları oluştur
  const defaultSettings = [
    { key: 'siteName', value: 'My Blog' },
    { key: 'siteDescription', value: 'Modern bir blog platformu' },
    { key: 'siteUrl', value: 'http://localhost:3000' },
    { key: 'language', value: 'tr' },
    { key: 'postsPerPage', value: '10' },
    { key: 'commentsEnabled', value: 'true' },
    { key: 'commentsModeration', value: 'true' },
    { key: 'adsenseEnabled', value: 'false' },
  ]

  for (const setting of defaultSettings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log('✅ Default settings created')

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
