'use client'

// Google AdSense Components
import { useEffect, useRef } from 'react'
import Script from 'next/script'

interface AdSenseProps {
  clientId: string
  slotId: string
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal'
  fullWidth?: boolean
  className?: string
}

// Ana AdSense component
export function AdSense({
  clientId,
  slotId,
  format = 'auto',
  fullWidth = true,
  className = '',
}: AdSenseProps) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is a global
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense Error:', err)
    }
  }, [])

  if (!clientId || !slotId) {
    return null
  }

  return (
    <div ref={adRef} className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive={fullWidth ? 'true' : 'false'}
      />
    </div>
  )
}

// Header Banner Reklam
export function HeaderAd({
  clientId,
  slotId,
}: {
  clientId: string
  slotId: string
}) {
  return (
    <div className="w-full py-2 bg-muted/30">
      <div className="container mx-auto">
        <AdSense
          clientId={clientId}
          slotId={slotId}
          format="horizontal"
          className="min-h-[90px]"
        />
      </div>
    </div>
  )
}

// Sidebar Reklam
export function SidebarAd({
  clientId,
  slotId,
}: {
  clientId: string
  slotId: string
}) {
  return (
    <div className="sticky top-4">
      <AdSense
        clientId={clientId}
        slotId={slotId}
        format="vertical"
        className="min-h-[250px]"
      />
    </div>
  )
}

// Makale İçi Reklam
export function InArticleAd({
  clientId,
  slotId,
}: {
  clientId: string
  slotId: string
}) {
  return (
    <div className="my-8 p-4 bg-muted/20 rounded-lg">
      <p className="text-xs text-muted-foreground text-center mb-2">Reklam</p>
      <AdSense
        clientId={clientId}
        slotId={slotId}
        format="fluid"
        className="min-h-[250px]"
      />
    </div>
  )
}

// Footer Reklam
export function FooterAd({
  clientId,
  slotId,
}: {
  clientId: string
  slotId: string
}) {
  return (
    <div className="w-full py-4 bg-muted/30">
      <div className="container mx-auto">
        <AdSense
          clientId={clientId}
          slotId={slotId}
          format="horizontal"
          className="min-h-[90px]"
        />
      </div>
    </div>
  )
}

// AdSense Script (Layout'ta bir kez yükle)
export function AdSenseScript({ clientId }: { clientId: string }) {
  if (!clientId) return null

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="lazyOnload"
    />
  )
}

// Multiplex Reklam (İlgili İçerik)
export function MultiplexAd({
  clientId,
  slotId,
}: {
  clientId: string
  slotId: string
}) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is a global
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense Error:', err)
    }
  }, [])

  if (!clientId || !slotId) {
    return null
  }

  return (
    <div ref={adRef} className="my-8">
      <p className="text-xs text-muted-foreground text-center mb-2">
        İlginizi Çekebilir
      </p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="autorelaxed"
      />
    </div>
  )
}

// Responsive Display Reklam
export function ResponsiveAd({
  clientId,
  slotId,
  className = '',
}: {
  clientId: string
  slotId: string
  className?: string
}) {
  const adRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      // @ts-expect-error adsbygoogle is a global
      (window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch (err) {
      console.error('AdSense Error:', err)
    }
  }, [])

  if (!clientId || !slotId) {
    return null
  }

  return (
    <div ref={adRef} className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
