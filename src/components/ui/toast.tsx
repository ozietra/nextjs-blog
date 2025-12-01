// Toast Component
'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'success' | 'destructive' | 'warning'
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined)

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const addToast = React.useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Otomatik kaldırma
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, toast.duration || 5000)
  }, [])

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  )
}

const variantStyles = {
  default: 'bg-background border',
  success: 'bg-green-500 text-white border-green-600',
  destructive: 'bg-destructive text-destructive-foreground border-destructive',
  warning: 'bg-yellow-500 text-white border-yellow-600',
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  return (
    <div
      className={cn(
        'flex w-[350px] items-start gap-3 rounded-lg p-4 shadow-lg animate-in slide-in-from-right-full',
        variantStyles[toast.variant || 'default']
      )}
    >
      <div className="flex-1">
        {toast.title && <div className="font-semibold">{toast.title}</div>}
        {toast.description && (
          <div className="mt-1 text-sm opacity-90">{toast.description}</div>
        )}
      </div>
      <button
        onClick={onClose}
        className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

// Helper function
export function toast(options: Omit<Toast, 'id'>) {
  // Bu fonksiyon client component içinde useToast hook'u ile kullanılmalı
  console.warn('toast() should be called from within a component using useToast hook')
}
