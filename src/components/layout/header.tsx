'use client'

// Header Component - Site üst menüsü
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { Menu, X, Search, Sun, Moon, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/components/providers/theme-provider'
import { cn } from '@/lib/utils'

interface MenuItem {
  label: string
  url: string
  target?: string
}

interface HeaderProps {
  siteName?: string
  logo?: string | null
  menuItems?: MenuItem[]
}

export function Header({
  siteName = 'Blog',
  logo,
  menuItems = [
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Hakkımızda', url: '/hakkimizda' },
    { label: 'İletişim', url: '/iletisim' },
  ]
}: HeaderProps) {
  const { data: session } = useSession()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Arama formu gönder
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/ara?q=${encodeURIComponent(searchQuery)}`
    }
  }

  // Tema değiştir
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'bg-background/80 backdrop-blur-md shadow-sm'
          : 'bg-background'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            {logo ? (
              <img src={logo} alt={siteName} className="h-8 w-auto" />
            ) : (
              <span className="text-xl font-bold text-primary">{siteName}</span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {menuItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                target={item.target}
                className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Ara"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Tema değiştir"
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* User Menu / Login */}
            {session ? (
              <Link href="/admin">
                <Button variant="ghost" size="icon" aria-label="Admin Panel">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link href="/giris" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  Giriş Yap
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menü"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="pb-4 animate-in fade-in-0 slide-in-from-top-full">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-4 pr-10 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 animate-in fade-in-0 slide-in-from-top-full">
            <div className="flex flex-col space-y-1">
              {menuItems.map((item) => (
                <Link
                  key={item.url}
                  href={item.url}
                  target={item.target}
                  className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-accent"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {!session && (
                <Link
                  href="/giris"
                  className="px-3 py-2 text-sm font-medium text-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Giriş Yap
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
