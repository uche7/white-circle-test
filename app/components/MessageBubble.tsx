import React from "react";
import { MessageBubbleProps } from "../types/messageBubble";
import { applyPIISpans } from "./SpoilerText";

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Debug: Always log message to see what we're receiving
  if (!message.isUser) {
    console.log("MessageBubble - Full message:", {
      id: message.id,
      hasPiiSpans: !!message.piiSpans,
      piiSpansLength: message.piiSpans?.length || 0,
      textLength: message.text.length,
      textPreview: message.text.substring(0, 100)
    });
  }

  // Apply PII masking if spans are available
  const content =
    message.piiSpans && message.piiSpans.length > 0
      ? applyPIISpans(message.text, message.piiSpans)
      : message.text;

  // Debug: Log PII spans to console
  if (message.piiSpans && message.piiSpans.length > 0) {
    console.log("MessageBubble - PII spans detected:", message.piiSpans);
    console.log("MessageBubble - Content type:", Array.isArray(content) ? "array" : "string");
    console.log("MessageBubble - Content length:", Array.isArray(content) ? content.length : "string");
    console.log("MessageBubble - Message text:", message.text);
  }

  return (
    <div
      className={`flex ${
        message.isUser ? "justify-end" : "justify-start"
      } w-full px-2 md:px-0`}
    >
      <div
        className={`min-w-0 max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2 md:py-3 bg-black text-white overflow-hidden ${
          message.isUser ? "border border-[#2a2a2a] rounded-full" : ""
        }`}
      >
        <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {Array.isArray(content) 
            ? content.map((item, idx) => {
                if (typeof item === 'string') {
                  return <span key={`text-${idx}`}>{item}</span>;
                }
                return item;
              })
            : content}
        </div>
      </div>
    </div>
  );
}
