import { NextRequest } from "next/server";
import { db } from "@/app/lib/db";

/**
 * Conversations API Route
 * 
 * GET /api/conversations - List all conversations
 * POST /api/conversations - Create new conversation
 */
export async function GET() {
  try {
    const conversations = await db.conversation.findMany({
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    return Response.json(conversations);
  } catch (error) {
    console.error("Get conversations error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    const conversation = await db.conversation.create({
      data: {
        title: title || "New Chat",
      },
    });

    return Response.json(conversation);
  } catch (error) {
    console.error("Create conversation error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}

