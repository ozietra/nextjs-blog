'use client'

// Delete Post Button Component
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'
import { Trash2 } from 'lucide-react'

interface DeletePostButtonProps {
  postId: string
  postTitle: string
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setOpen(false)
        router.refresh()
      } else {
        alert('Silme işlemi başarısız')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Sil">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Makaleyi Sil</DialogTitle>
          <DialogDescription>
            &quot;{postTitle}&quot; başlıklı makaleyi silmek istediğinizden emin
            misiniz? Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Siliniyor...
              </>
            ) : (
              'Sil'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
