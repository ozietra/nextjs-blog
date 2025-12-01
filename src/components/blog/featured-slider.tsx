'use client'

// Featured Posts Slider Component (Swiper.js)
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

// Swiper styles
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

interface FeaturedPost {
  id: string
  title: string
  slug: string
  excerpt?: string | null
  featuredImage?: string | null
  readingTime: number
  createdAt: Date | string
  category?: {
    name: string
    slug: string
    color?: string | null
  } | null
  author: {
    name?: string | null
    slug?: string | null
    avatar?: string | null
  }
}

interface FeaturedSliderProps {
  posts: FeaturedPost[]
  autoplay?: boolean
  interval?: number
}

export function FeaturedSlider({
  posts,
  autoplay = true,
  interval = 5000
}: FeaturedSliderProps) {
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null)

  if (posts.length === 0) return null

  const handlePrev = () => {
    swiperRef?.slidePrev()
  }

  const handleNext = () => {
    swiperRef?.slideNext()
  }

  return (
    <div className="relative group">
      <Swiper
        onSwiper={setSwiperRef}
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        spaceBetween={0}
        slidesPerView={1}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        pagination={{
          clickable: true,
          bulletClass: 'swiper-pagination-bullet !bg-white/50 !w-3 !h-3',
          bulletActiveClass: '!bg-white !w-8 !rounded-full',
        }}
        autoplay={autoplay ? { delay: interval, disableOnInteraction: false } : false}
        loop={posts.length > 1}
        className="rounded-2xl overflow-hidden"
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id}>
            <article className="relative h-[400px] md:h-[500px]">
              {/* Background Image */}
              <div className="absolute inset-0">
                {post.featuredImage ? (
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    priority
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/30 to-primary/60" />
                )}
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 text-white">
                <div className="max-w-3xl">
                  {post.category && (
                    <Link href={`/kategori/${post.category.slug}`}>
                      <Badge
                        className="mb-4"
                        style={{
                          backgroundColor: post.category.color || 'hsl(var(--primary))',
                        }}
                      >
                        {post.category.name}
                      </Badge>
                    </Link>
                  )}

                  <Link href={`/${post.slug}`}>
                    <h2 className="text-2xl md:text-4xl font-bold mb-3 line-clamp-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  {post.excerpt && (
                    <p className="text-gray-300 line-clamp-2 mb-4 md:text-lg">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                    <Link
                      href={`/yazar/${post.author.slug || post.id}`}
                      className="flex items-center gap-2 hover:text-white transition-colors"
                    >
                      <Avatar
                        src={post.author.avatar}
                        alt={post.author.name || 'Yazar'}
                        size="sm"
                      />
                      <span>{post.author.name || 'Anonim'}</span>
                    </Link>

                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(post.createdAt)}
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {post.readingTime} dk okuma
                    </span>
                  </div>

                  <Link
                    href={`/${post.slug}`}
                    className="inline-block mt-6"
                  >
                    <Button>
                      Devamını Oku
                    </Button>
                  </Link>
                </div>
              </div>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons */}
      {posts.length > 1 && (
        <>
          <Button
            variant="secondary"
            size="icon"
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </>
      )}
    </div>
  )
}
