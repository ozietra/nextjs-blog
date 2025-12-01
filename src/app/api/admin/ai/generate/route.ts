// AI Content Generation API
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createSlug, createExcerpt } from '@/lib/utils'
import OpenAI from 'openai'

// OpenAI API key'i veritabanından al
async function getOpenAIApiKey(): Promise<string | null> {
  try {
    const setting = await db.setting.findUnique({
      where: { key: 'openaiApiKey' },
    })
    return setting?.value || process.env.OPENAI_API_KEY || null
  } catch {
    return process.env.OPENAI_API_KEY || null
  }
}

interface GenerateRequest {
  topic: string
  keywords?: string
  model: 'gpt-4o' | 'gpt-4o-mini' | 'auto'
  contentType: string
  tone: string
  wordCount: string
  customPrompt?: string
}

const contentTypePrompts: Record<string, string> = {
  blog: 'SEO uyumlu, bilgilendirici ve ilgi çekici bir blog makalesi yaz.',
  'product-review': 'Detaylı ve objektif bir ürün incelemesi yaz. Artıları, eksileri ve sonuç bölümlerini içer.',
  listicle: 'Numaralı maddeler halinde organize edilmiş bir liste makalesi yaz.',
  tutorial: 'Adım adım talimatlar içeren detaylı bir rehber/tutorial yaz.',
  news: 'Güncel ve bilgilendirici bir haber makalesi formatında yaz.',
  custom: '',
}

const toneDescriptions: Record<string, string> = {
  professional: 'profesyonel ve uzman bir ton kullan',
  friendly: 'samimi ve arkadaşça bir ton kullan',
  formal: 'resmi ve ciddi bir ton kullan',
  casual: 'gündelik ve rahat bir ton kullan',
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    // API key'i veritabanından al
    const apiKey = await getOpenAIApiKey()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API anahtarı yapılandırılmamış. Ayarlar > AI sekmesinden API anahtarınızı girin.' },
        { status: 500 }
      )
    }

    // OpenAI client'ı oluştur
    const openai = new OpenAI({
      apiKey: apiKey,
    })

    const body: GenerateRequest = await request.json()

    if (!body.topic) {
      return NextResponse.json({ error: 'Konu gerekli' }, { status: 400 })
    }

    // Model seçimi
    let selectedModel = body.model
    if (body.model === 'auto') {
      // Kelime sayısına göre model seç
      const wordCount = parseInt(body.wordCount)
      selectedModel = wordCount > 1500 ? 'gpt-4o' : 'gpt-4o-mini'
    }

    // Prompt oluştur
    const contentTypePrompt =
      body.contentType === 'custom'
        ? body.customPrompt || ''
        : contentTypePrompts[body.contentType]

    const tonePrompt = toneDescriptions[body.tone] || ''
    const keywordsPrompt = body.keywords
      ? `Şu anahtar kelimeleri doğal bir şekilde içeriğe dahil et: ${body.keywords}.`
      : ''

    const systemPrompt = `Sen profesyonel bir içerik yazarısın. Türkçe dilinde SEO uyumlu, yüksek kaliteli içerikler üretiyorsun.
HTML formatında yanıt ver (sadece body içeriği, html/head/body etiketleri olmadan).
Başlıklar için h2, h3 etiketlerini, paragraflar için p etiketini, listeler için ul/ol ve li etiketlerini kullan.
${tonePrompt}.`

    const userPrompt = `${contentTypePrompt}

Konu: ${body.topic}

${keywordsPrompt}

Hedef kelime sayısı: yaklaşık ${body.wordCount} kelime.

Aşağıdaki JSON formatında yanıt ver:
{
  "title": "Makale başlığı",
  "content": "HTML formatında makale içeriği",
  "excerpt": "2-3 cümlelik özet",
  "metaDescription": "155 karakterlik SEO meta açıklaması",
  "suggestedTags": ["etiket1", "etiket2", "etiket3"]
}`

    const completion = await openai.chat.completions.create({
      model: selectedModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    })

    const responseText = completion.choices[0]?.message?.content

    if (!responseText) {
      return NextResponse.json(
        { error: 'AI yanıt üretemedi' },
        { status: 500 }
      )
    }

    // JSON parse et
    let parsedResponse
    try {
      // JSON bloğunu bul
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('JSON bulunamadı')
      }
    } catch (parseError) {
      console.error('JSON parse hatası:', parseError)
      // Fallback: basit parsing
      parsedResponse = {
        title: body.topic,
        content: responseText,
        excerpt: createExcerpt(responseText),
        metaDescription: createExcerpt(responseText, 155),
        suggestedTags: body.keywords?.split(',').map((k) => k.trim()) || [],
      }
    }

    // Slug oluştur
    const slug = createSlug(parsedResponse.title)

    // AI kullanım logunu kaydet
    const usage = completion.usage
    if (usage) {
      await db.aIUsageLog.create({
        data: {
          model: selectedModel,
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost: calculateCost(
            selectedModel,
            usage.prompt_tokens,
            usage.completion_tokens
          ),
        },
      })
    }

    return NextResponse.json({
      title: parsedResponse.title,
      content: parsedResponse.content,
      excerpt: parsedResponse.excerpt,
      metaDescription: parsedResponse.metaDescription,
      suggestedTags: parsedResponse.suggestedTags || [],
      slug,
    })
  } catch (error) {
    console.error('AI Generate Error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API hatası: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

// Maliyet hesaplama (yaklaşık USD)
function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const rates: Record<string, { input: number; output: number }> = {
    'gpt-4o': { input: 0.005, output: 0.015 },
    'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  }

  const rate = rates[model] || rates['gpt-4o-mini']
  return (promptTokens / 1000) * rate.input + (completionTokens / 1000) * rate.output
}
