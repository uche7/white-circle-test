// LLM Streaming Module
// Uses OpenAI API for streaming responses

import OpenAI from "openai";

// Initialize OpenAI client
// In production, ensure OPENAI_API_KEY is set in environment variables
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set in environment variables");
    throw new Error("OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.");
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
};

/**
 * Streams LLM response from OpenAI
 * 
 * @param prompt - User's message
 * @param conversationHistory - Previous messages for context
 * @returns AsyncGenerator yielding text chunks
 * 
 * Tradeoff: Uses GPT-3.5-turbo for cost efficiency
 * Future: Can switch to GPT-4, add model selection, temperature control
 */
export async function* streamLLMResponse(
  prompt: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): AsyncGenerator<string, void, unknown> {
  let openai: OpenAI;
  
  try {
    // Get OpenAI client (will throw if API key is missing)
    openai = getOpenAIClient();
    
    // Build messages array for OpenAI API
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      ...conversationHistory.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: prompt,
      },
    ];

    // Stream from OpenAI with retry logic for rate limits
    let stream;
    let retries = 0;
    const maxRetries = 3;
    
    while (retries < maxRetries) {
      try {
        stream = await openai.chat.completions.create({
          model: "gpt-3.5-turbo", // Using 3.5 for cost efficiency, can upgrade to gpt-4
          messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
          stream: true,
          temperature: 0.7,
        });
        break; // Success, exit retry loop
      } catch (retryError) {
        if (retryError instanceof OpenAI.APIError && retryError.status === 429 && retries < maxRetries - 1) {
          // Rate limited - wait with exponential backoff
          const waitTime = Math.pow(2, retries) * 1000; // 1s, 2s, 4s
          console.log(`Rate limited, retrying in ${waitTime}ms... (attempt ${retries + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retries++;
          continue;
        }
        throw retryError; // Re-throw if not rate limit or max retries reached
      }
    }
    
    if (!stream) {
      throw new Error("Failed to create stream after retries");
    }

    // Yield tokens as they arrive
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  } catch (error) {
    console.error("OpenAI API error:", error);
    
    // Provide detailed error messages
    if (error instanceof OpenAI.APIError) {
      if (error.status === 401) {
        yield `Error: Invalid API key (401). Please check your OPENAI_API_KEY in .env.local and restart the server.`;
      } else if (error.status === 429) {
        yield `Error: Rate limit exceeded (429). OpenAI has rate limits on API usage. Please wait a few moments and try again. If this persists, you may need to upgrade your OpenAI plan or reduce request frequency.`;
      } else if (error.status === 500) {
        yield `Error: OpenAI server error (500). Please try again later.`;
      } else if (error.status === 503) {
        yield `Error: OpenAI service unavailable (503). The service is temporarily down. Please try again in a few moments.`;
      } else {
        yield `Error: ${error.message} (Status: ${error.status}). Please check your API key and try again.`;
      }
    } else if (error instanceof Error) {
      yield `Error: ${error.message}. Please check your configuration.`;
    } else {
      yield "Error: Failed to get response from AI. Please check the server logs for details.";
    }
  }
}
