import { NextRequest } from "next/server";
import { detectPIIAsync } from "@/app/lib/pii-detector";
import { db } from "@/app/lib/db";

/**
 * Async PII Detection API Route
 * 
 * POST /api/pii
 * Body: { messageId: string, text: string }
 * 
 * Returns: { spans: PIISpan[] }
 * 
 * This runs in parallel with streaming - doesn't block the chat response
 * When PII is detected, the client retroactively masks the spans
 */
export async function POST(request: NextRequest) {
  try {
    const { messageId, text } = await request.json();

    if (!messageId || !text) {
      return new Response("MessageId and text are required", { status: 400 });
    }

    // Detect PII asynchronously
    const spans = await detectPIIAsync(text);

    // Update message with PII spans metadata
    if (spans.length > 0) {
      await db.message.update({
        where: { id: messageId },
        data: {
          piiSpans: JSON.stringify(spans),
        },
      });
    }

    return Response.json({ spans });
  } catch (error) {
    console.error("PII detection error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

