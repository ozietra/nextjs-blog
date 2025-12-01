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
  blog: 'Ultra-detaylı, kapsamlı ve SEO uyumlu bir blog makalesi yaz.',
  'product-review': 'Detaylı ve objektif bir ürün incelemesi yaz. Artıları, eksileri ve sonuç bölümlerini içer.',
  listicle: 'Numaralı maddeler halinde organize edilmiş detaylı bir liste makalesi yaz.',
  tutorial: 'Adım adım talimatlar içeren çok detaylı bir rehber/tutorial yaz.',
  news: 'Güncel ve bilgilendirici bir haber makalesi formatında yaz.',
  custom: '',
}

const toneDescriptions: Record<string, string> = {
  professional: 'profesyonel ve uzman bir ton kullan',
  friendly: 'samimi ve arkadaşça bir ton kullan',
  formal: 'resmi ve ciddi bir ton kullan',
  casual: 'gündelik ve rahat bir ton kullan',
}

// Ultra-detaylı makale için master prompt
const getMasterPrompt = (wordCount: string, keywords: string) => `
⚡ KRİTİK GEREKİNİMLER - ULTRA-DETAYLI MAKALE:

1. UZUNLUK VE DERİNLİK (EN ÖNEMLİ):
   - Makale EN AZ ${wordCount} kelime olmalı, DAHA UZUN yazmaya çalış
   - Her H2 bölümü 400-600 kelime içermeli
   - Her paragraf 200-400 kelime olmalı
   - Her H2 başlığı altında 2-3 uzun paragraf yaz
   - Kısa, yüzeysel içerik YAZMA
   - Her cümle yeni bilgi ve değer katmalı

2. YAPI:
   - Etkileyici bir giriş paragrafı ile başla (250-300 kelime)
   - 5-8 adet H2 ana bölüm içermeli
   - Her H2 altında 2-3 detaylı paragraf olmalı
   - H2 bölümleri içinde H3 alt başlıklar kullan
   - Kapsamlı bir sonuç paragrafı ile bitir (200-250 kelime)
   - H1 etiketi KULLANMA
   - "Giriş" gibi başlıklar KULLANMA, doğrudan içerikle başla

3. PARAGRAF KALİTESİ:
   Her paragraf şunları içermeli:
   - Kavram açıklaması (50-75 kelime)
   - Detaylı örnekler veya vaka çalışmaları (75-100 kelime)
   - Pratik uygulamalar veya ipuçları (50-75 kelime)
   - Uzman görüşleri veya araştırma bulguları (50-75 kelime)

4. HTML FORMAT:
   - Temiz HTML kullan: <h2>, <h3>, <h4>, <p>, <table>, <ul>, <li>
   - Her paragraf <p></p> etiketleri arasında
   - Her başlık doğru etiketlerde: <h2>Başlık</h2>
   - H1 etiketi HIÇBİR YERDE kullanma
   - Başlıkların önüne "H2:", "H3:" gibi şeyler ekleme

5. TABLOLAR:
   - Makalede 1-2 HTML tablo ekle
   - Tablolar önemli bilgileri organize etmeli

6. İÇERİK ÇEŞİTLİLİĞİ:
   Şunları ekle:
   - Tarihsel bağlam ve arka plan
   - Güncel trendler ve modern uygulamalar
   - Farklı bakış açıları
   - Bilimsel veya araştırma tabanlı bilgi
   - Pratik ipuçları ve uygulanabilir tavsiyeler
   - Yaygın yanlış anlamalar ve açıklamalar
   - Gerçek dünya örnekleri
   - Adım adım açıklamalar

7. YAZIM STİLİ:
   - Profesyonel ama etkileyici ton
   - Net ve anlaşılır dil
   - Paragraflar arası doğal geçişler
   - Yapay zeka terimleri KULLANMA: "kapsamlı rehber", "nihai", "keşfetmek"
   - Sohbet tarzında ama otoriter ses

8. ANAHTAR KELİME KULLANIMI:
   ${keywords ? `- "${keywords}" anahtar kelimelerini doğal olarak kullan` : ''}
   - İlk paragrafta ana konuyu kullan
   - 2-3 H2 başlığında doğal olarak kullan
   - Toplamda 5-8 kez kullan (daha fazla değil)
   - %1-1.5 anahtar kelime yoğunluğu
   - Asla zorla veya doldurma yapma

9. KALİTE STANDARTLARI:
   - %100 orijinal içerik
   - Gerçek ve doğru bilgi
   - Profesyonel ve saygılı ton
   - Google AdSense uyumlu

🎯 UNUTMA: Daha fazla içerik daha iyidir. Kapsamlı, detaylı ve zengin içerik yaz!
`

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

    const masterPromptContent = getMasterPrompt(body.wordCount, body.keywords || '')

    const systemPrompt = `Sen çok deneyimli ve profesyonel bir Türkçe içerik uzmanısın. Ultra-detaylı, SEO uyumlu, okunabilir ve son derece bilgilendirici makaleler yazıyorsun. Her paragrafın zengin içerikli ve değerli olmasına özen gösteriyorsun.

HTML formatında yanıt ver (sadece body içeriği, html/head/body etiketleri olmadan).
Başlıklar için h2, h3 etiketlerini, paragraflar için p etiketini, listeler için ul/ol ve li etiketlerini, tablolar için table etiketini kullan.
${tonePrompt}.

${masterPromptContent}`

    const userPrompt = `${contentTypePrompt}

Konu: ${body.topic}

${keywordsPrompt}

Hedef kelime sayısı: EN AZ ${body.wordCount} kelime (daha fazla yaz!).

Aşağıdaki JSON formatında yanıt ver:
{
  "title": "SEO uyumlu, ilgi çekici makale başlığı",
  "content": "HTML formatında ULTRA-DETAYLI makale içeriği (tablolar, örnekler, detaylı paragraflar dahil)",
  "excerpt": "2-3 cümlelik etkileyici özet",
  "metaDescription": "155 karakterlik SEO meta açıklaması",
  "suggestedTags": ["etiket1", "etiket2", "etiket3", "etiket4", "etiket5"]
}`

    const completion = await openai.chat.completions.create({
      model: selectedModel === 'gpt-4o' ? 'gpt-4o' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 16000, // Daha uzun içerik için artırıldı
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
