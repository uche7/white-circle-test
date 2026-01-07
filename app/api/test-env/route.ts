import { NextResponse } from "next/server";

/**
 * Test endpoint to verify environment variables are loaded
 * DELETE this in production!
 */
export async function GET() {
  const hasApiKey = !!process.env.OPENAI_API_KEY;
  const keyLength = process.env.OPENAI_API_KEY?.length || 0;
  const keyPrefix = process.env.OPENAI_API_KEY?.substring(0, 7) || "none";

  return NextResponse.json({
    hasApiKey,
    keyLength,
    keyPrefix,
    message: hasApiKey
      ? "API key is loaded (first 7 chars shown for verification)"
      : "API key is NOT loaded - check .env.local and restart server",
  });
}

