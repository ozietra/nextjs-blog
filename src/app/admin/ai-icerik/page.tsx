'use client'

// AI İçerik Üretici Sayfası
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Spinner } from '@/components/ui/spinner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Copy, FileText, RefreshCw, ArrowRight } from 'lucide-react'

const modelOptions = [
  { value: 'gpt-4o', label: 'GPT-4o (Güçlü)' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Hızlı)' },
  { value: 'auto', label: 'Otomatik' },
]

const contentTypeOptions = [
  { value: 'blog', label: 'Blog Makalesi' },
  { value: 'product-review', label: 'Ürün İncelemesi' },
  { value: 'listicle', label: 'Liste Makalesi' },
  { value: 'tutorial', label: 'Rehber/Tutorial' },
  { value: 'news', label: 'Haber Makalesi' },
  { value: 'custom', label: 'Özel Prompt' },
]

const toneOptions = [
  { value: 'professional', label: 'Profesyonel' },
  { value: 'friendly', label: 'Arkadaşça' },
  { value: 'formal', label: 'Resmi' },
  { value: 'casual', label: 'Gündelik' },
]

const wordCountOptions = [
  { value: '500', label: '500 kelime' },
  { value: '1000', label: '1000 kelime' },
  { value: '1500', label: '1500 kelime' },
  { value: '2000', label: '2000 kelime' },
  { value: '3000', label: '3000+ kelime' },
]

interface GeneratedContent {
  title: string
  content: string
  excerpt: string
  metaDescription: string
  suggestedTags: string[]
  slug: string
}

export default function AIContentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

  const [formData, setFormData] = useState({
    topic: '',
    keywords: '',
    model: 'gpt-4o-mini',
    contentType: 'blog',
    tone: 'professional',
    wordCount: '1000',
    customPrompt: '',
  })

  const handleGenerate = async () => {
    if (!formData.topic.trim()) {
      setError('Lütfen bir konu girin')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/admin/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedContent(data)
      } else {
        const errorData = await res.json()
        setError(errorData.error || 'İçerik oluşturulamadı')
      }
    } catch (err) {
      setError('Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleUseContent = () => {
    if (generatedContent) {
      // İçeriği sessionStorage ile yeni makale sayfasına aktar
      sessionStorage.setItem('ai-generated-content', JSON.stringify({
        title: generatedContent.title,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt,
        metaDesc: generatedContent.metaDescription,
        slug: generatedContent.slug,
      }))
      router.push('/admin/makaleler/yeni')
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 rounded-lg bg-primary/10">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">AI İçerik Üretici</h1>
          <p className="text-muted-foreground">
            OpenAI ile SEO uyumlu içerik oluşturun
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Panel */}
        <Card>
          <CardHeader>
            <CardTitle>İçerik Ayarları</CardTitle>
            <CardDescription>
              İçerik oluşturmak için bilgileri doldurun
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Topic */}
            <div>
              <Label htmlFor="topic">Konu / Anahtar Kelime *</Label>
              <Input
                id="topic"
                placeholder="Örn: Next.js 14 ile Blog Geliştirme"
                value={formData.topic}
                onChange={(e) =>
                  setFormData({ ...formData, topic: e.target.value })
                }
              />
            </div>

            {/* Additional Keywords */}
            <div>
              <Label htmlFor="keywords">Ek Anahtar Kelimeler</Label>
              <Input
                id="keywords"
                placeholder="Virgülle ayırın: SEO, React, TypeScript"
                value={formData.keywords}
                onChange={(e) =>
                  setFormData({ ...formData, keywords: e.target.value })
                }
              />
            </div>

            {/* Model Selection */}
            <div>
              <Label htmlFor="model">AI Model</Label>
              <Select
                options={modelOptions}
                value={formData.model}
                onChange={(e) =>
                  setFormData({ ...formData, model: e.target.value })
                }
              />
            </div>

            {/* Content Type */}
            <div>
              <Label htmlFor="contentType">İçerik Türü</Label>
              <Select
                options={contentTypeOptions}
                value={formData.contentType}
                onChange={(e) =>
                  setFormData({ ...formData, contentType: e.target.value })
                }
              />
            </div>

            {/* Tone */}
            <div>
              <Label htmlFor="tone">Ton</Label>
              <Select
                options={toneOptions}
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
              />
            </div>

            {/* Word Count */}
            <div>
              <Label htmlFor="wordCount">Kelime Sayısı</Label>
              <Select
                options={wordCountOptions}
                value={formData.wordCount}
                onChange={(e) =>
                  setFormData({ ...formData, wordCount: e.target.value })
                }
              />
            </div>

            {/* Custom Prompt */}
            {formData.contentType === 'custom' && (
              <div>
                <Label htmlFor="customPrompt">Özel Prompt</Label>
                <Textarea
                  id="customPrompt"
                  placeholder="Özel talimatlarınızı yazın..."
                  rows={4}
                  value={formData.customPrompt}
                  onChange={(e) =>
                    setFormData({ ...formData, customPrompt: e.target.value })
                  }
                />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  İçerik Oluştur
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Oluşturulan İçerik</CardTitle>
            <CardDescription>
              AI tarafından oluşturulan içerik burada görünecek
            </CardDescription>
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="space-y-4">
                {/* Actions */}
                <div className="flex gap-2">
                  <Button onClick={handleUseContent} className="flex-1">
                    <FileText className="h-4 w-4 mr-2" />
                    Makale Olarak Kullan
                  </Button>
                  <Button variant="outline" onClick={handleGenerate}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yeniden Oluştur
                  </Button>
                </div>

                <Tabs defaultValue="content">
                  <TabsList className="w-full">
                    <TabsTrigger value="content" className="flex-1">
                      İçerik
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="flex-1">
                      SEO
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    {/* Title */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label>Başlık</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(generatedContent.title)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="p-3 bg-muted rounded-lg">
                        {generatedContent.title}
                      </p>
                    </div>

                    {/* Content */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <Label>İçerik</Label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(generatedContent.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div
                        className="p-3 bg-muted rounded-lg prose prose-sm max-h-[400px] overflow-y-auto"
                        dangerouslySetInnerHTML={{
                          __html: generatedContent.content,
                        }}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="seo" className="space-y-4">
                    {/* Excerpt */}
                    <div>
                      <Label>Özet</Label>
                      <p className="p-3 bg-muted rounded-lg text-sm">
                        {generatedContent.excerpt}
                      </p>
                    </div>

                    {/* Meta Description */}
                    <div>
                      <Label>Meta Açıklama</Label>
                      <p className="p-3 bg-muted rounded-lg text-sm">
                        {generatedContent.metaDescription}
                      </p>
                    </div>

                    {/* Suggested Tags */}
                    <div>
                      <Label>Önerilen Etiketler</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {generatedContent.suggestedTags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-primary/10 text-primary rounded-full text-sm"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Slug */}
                    <div>
                      <Label>URL Slug</Label>
                      <p className="p-3 bg-muted rounded-lg text-sm font-mono">
                        /{generatedContent.slug}
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Henüz içerik oluşturulmadı</p>
                <p className="text-sm">
                  Sol panelden ayarları yapıp içerik oluşturun
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
