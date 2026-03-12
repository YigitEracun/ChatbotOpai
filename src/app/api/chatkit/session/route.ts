import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message ?? '';

    if (!userMessage) {
      return NextResponse.json({ error: 'Mesaj boş olamaz.' }, { status: 400 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Sen yardımcı bir yapay zeka asistanısın. Kullanıcının sorularını Türkçe olarak yanıtla.',
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const reply = completion.choices[0]?.message?.content ?? 'Yanıt alınamadı.';

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error('OpenAI API hatası:', error);
    const message = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}