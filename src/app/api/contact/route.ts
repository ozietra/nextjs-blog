// Contact Form API
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { z } from 'zod'
import nodemailer from 'nodemailer'

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  subject: z.string().min(5),
  message: z.string().min(20),
})

// POST - İletişim formu gönder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = contactSchema.parse(body)

    // Veritabanına kaydet
    await db.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
      },
    })

    // Email gönder (opsiyonel - SMTP ayarları varsa)
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_PORT === '465',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          },
        })

        await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: process.env.SMTP_USER,
          subject: `İletişim Formu: ${data.subject}`,
          html: `
            <h2>Yeni İletişim Mesajı</h2>
            <p><strong>İsim:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Konu:</strong> ${data.subject}</p>
            <p><strong>Mesaj:</strong></p>
            <p>${data.message}</p>
          `,
        })
      } catch (emailError) {
        console.error('Email gönderilemedi:', emailError)
        // Email hatası olsa bile form kaydedildi, devam et
      }
    }

    return NextResponse.json(
      { message: 'Mesajınız gönderildi' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact POST Error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Geçersiz veri', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}
