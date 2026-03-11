import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not set on the server." },
      { status: 500 }
    );
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create an ephemeral session token for ChatKit
    const session = await openai.beta.realtime.sessions.create({
      model: "gpt-4o-realtime-preview-2024-12-17",
    });

    return NextResponse.json({ client_secret: session.client_secret });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[chatkit/session] Error:", message);
    return NextResponse.json(
      { error: `Failed to create session: ${message}` },
      { status: 500 }
    );
  }
}
