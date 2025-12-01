'use client'

// Share Buttons Component
import { Button } from '@/components/ui/button'
import { Facebook, Twitter, Linkedin, Link as LinkIcon } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

interface ShareButtonsProps {
  url: string
  title: string
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  const { addToast } = useToast()

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      addToast({
        title: 'Link kopyalandı',
        description: 'Makale linki panoya kopyalandı.',
        variant: 'success',
      })
    } catch {
      addToast({
        title: 'Hata',
        description: 'Link kopyalanamadı.',
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="flex gap-2">
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <Facebook className="h-4 w-4" />
        </Button>
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <Twitter className="h-4 w-4" />
        </Button>
      </a>
      <a
        href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Button variant="outline" size="icon">
          <Linkedin className="h-4 w-4" />
        </Button>
      </a>
      <Button variant="outline" size="icon" onClick={handleCopyLink}>
        <LinkIcon className="h-4 w-4" />
      </Button>
    </div>
  )
}
