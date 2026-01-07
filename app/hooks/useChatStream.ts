import { useState, useCallback } from "react";
import { Message } from "../types";
import { detectPII } from "../lib/pii-detector";

/**
 * Custom hook for handling streaming chat responses
 * 
 * Manages:
 * - Streaming state
 * - Incremental message updates
 * - PII detection in parallel
 */
export function useChatStream() {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  const sendMessage = useCallback(
    async (
      message: string,
      conversationId: string | null,
      onMessageUpdate: (message: Message) => void,
      onConversationUpdate: (id: string) => void
    ) => {
      setIsStreaming(true);
      setStreamingMessage("");

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, conversationId }),
        });

        if (!response.ok) {
          throw new Error("Failed to send message");
        }

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) {
          throw new Error("No response body");
        }

        let fullText = "";
        let currentConversationId = conversationId || "";

        // Read stream
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.chunk) {
                  fullText += data.chunk;
                  setStreamingMessage(fullText);
                  
                  // Detect PII in real-time as text streams
                  const piiSpans = detectPII(fullText);
                  
                  // Update message in real-time with PII spans
                  onMessageUpdate({
                    id: "streaming",
                    text: fullText,
                    isUser: false,
                    piiSpans: piiSpans.length > 0 ? piiSpans : undefined,
                  });
                }

                if (data.conversationId) {
                  currentConversationId = data.conversationId;
                  onConversationUpdate(data.conversationId);
                }

                if (data.done) {
                  setIsStreaming(false);
                  setStreamingMessage("");
                  return { conversationId: currentConversationId, fullText };
                }
              } catch (e) {
                // Ignore JSON parse errors
              }
            }
          }
        }
      } catch (error) {
        console.error("Streaming error:", error);
        setIsStreaming(false);
        setStreamingMessage("");
        throw error;
      }
    },
    []
  );

  return { sendMessage, isStreaming, streamingMessage };
}


