// Avatar Component
'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, alt = '', fallback, size = 'md', ...props }, ref) => {
    const [imageError, setImageError] = React.useState(false)

    const initials = React.useMemo(() => {
      if (fallback) return fallback.slice(0, 2).toUpperCase()
      if (alt) {
        const words = alt.split(' ')
        if (words.length >= 2) {
          return (words[0][0] + words[1][0]).toUpperCase()
        }
        return alt.slice(0, 2).toUpperCase()
      }
      return '?'
    }, [fallback, alt])

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            className="aspect-square h-full w-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted font-medium text-muted-foreground">
            {initials}
          </div>
        )}
      </div>
    )
  }
)
Avatar.displayName = 'Avatar'

export { Avatar }
