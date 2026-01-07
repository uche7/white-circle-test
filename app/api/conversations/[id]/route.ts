import { NextRequest } from "next/server";
import { db } from "@/app/lib/db";

/**
 * Single Conversation API Route
 * 
 * GET /api/conversations/[id] - Get conversation with messages
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Handle both sync and async params (Next.js 16+ uses async)
    const resolvedParams = params instanceof Promise ? await params : params;
    const conversationId = resolvedParams.id;

    const conversation = await db.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return new Response("Conversation not found", { status: 404 });
    }

    return Response.json(conversation);
  } catch (error) {
    console.error("Get conversation error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

