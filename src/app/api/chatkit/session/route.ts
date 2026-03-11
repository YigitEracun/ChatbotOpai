import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "API anahtarı eksik." }, { status: 500 });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    
    // Frontend'den gelen mesajı al
    const body = await req.json();
    const userMessage = body.message;

    if (!userMessage) {
      return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
    }

    // OpenAI Chat modeline mesajı gönder
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // İstediğiniz modeli seçebilirsiniz
      messages: [
        { role: "system", content: "Sen Türkçe konuşan yardımsever bir asistansın." },
        { role: "user", content: userMessage }
      ],
    });

    // OpenAI'dan gelen cevabı al
    const botReply = completion.choices[0].message.content;

    // Arayüze "reply" olarak geri gönder
    return NextResponse.json({ reply: botReply });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("OpenAI Hatası:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
