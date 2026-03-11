import { NextResponse } from "next/server";

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "API anahtarı eksik." }, { status: 500 });
  }

  try {
    const body = await req.json();
    const userMessage = body.message;
    
    // Workflow ID'niz
    const WORKFLOW_ID = "wf_69b147b431a08190a9c42b7de229f0f40206f716a3fee578";

    if (!userMessage) {
      return NextResponse.json({ error: "Mesaj boş olamaz." }, { status: 400 });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: userMessage }],
        // Workflow ID'yi extra parametre olarak veya ChatKit endpoint'ine uygun şekilde ekliyoruz
        user: WORKFLOW_ID 
      })
    });

    const data = await response.json();

    if (!response.ok) {
       console.error("API Hatası:", data);
       return NextResponse.json({ error: data.error?.message || "Hata oluştu" }, { status: response.status });
    }

    const botReply = data.choices?.[0]?.message?.content || "Yanıt alınamadı.";

    return NextResponse.json({ reply: botReply });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bilinmeyen hata";
    console.error("Sistem Hatası:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}