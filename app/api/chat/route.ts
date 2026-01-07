import { NextRequest } from "next/server";
import { streamLLMResponse } from "@/app/lib/llm";
import { db } from "@/app/lib/db";

/**
 * Streaming Chat API Route
 * 
 * POST /api/chat
 * Body: { conversationId?: string, message: string }
 * 
 * Returns: ReadableStream with text chunks
 * 
 * Flow:
 * 1. Save user message to DB
 * 2. Get conversation history
 * 3. Stream LLM response
 * 4. Save assistant message as it streams
 */
export async function POST(request: NextRequest) {
  try {
    const { conversationId, message } = await request.json();

    if (!message || typeof message !== "string") {
      return new Response("Message is required", { status: 400 });
    }

    // Get or create conversation
    let conversation;
    if (conversationId) {
      conversation = await db.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conversation) {
        return new Response("Conversation not found", { status: 404 });
      }
    } else {
      // Create new conversation with first message as title
      conversation = await db.conversation.create({
        data: {
          title: message.slice(0, 50),
        },
      });
    }

    // Save user message
    await db.message.create({
      data: {
        conversationId: conversation.id,
        text: message,
        isUser: true,
      },
    });

    // Get conversation history for context
    const history = await db.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: "asc" },
      take: 20, // Last 20 messages for context
    });

    // Convert to LLM format
    const conversationHistory = history.map((msg: { isUser: boolean; text: string }) => ({
      role: msg.isUser ? ("user" as const) : ("assistant" as const),
      content: msg.text,
    }));

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        let fullResponse = "";

        try {
          // Stream LLM response
          for await (const chunk of streamLLMResponse(message, conversationHistory)) {
            fullResponse += chunk;
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk, conversationId: conversation.id })}\n\n`));
          }

          // Save complete assistant message
          await db.message.create({
            data: {
              conversationId: conversation.id,
              text: fullResponse,
              isUser: false,
            },
          });

          // Update conversation title if it's the first exchange
          if (history.length === 1) {
            await db.conversation.update({
              where: { id: conversation.id },
              data: { title: message.slice(0, 50) },
            });
          }

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, conversationId: conversation.id })}\n\n`));
          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

