import OpenAI from "openai";
import { NextResponse } from "next/server";

// Initialize the OpenAI client using the server-side API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST() {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    // Request a short-lived client_secret for a new ChatKit session
    // This keeps your real API key safe on the server
    const session = await openai.beta.realtime.sessions.create({
      model: "gpt-4o-realtime-preview-2024-12-17",
    });

    // Return only the ephemeral client_secret to the browser
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (error: unknown) {
    console.error("Error creating ChatKit session:", error);
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: `Failed to create session: ${message}` },
      { status: 500 }
    );
  }
}
