import { MessageBubbleProps } from "../types/messageBubble";
import { applyPIISpans } from "./SpoilerText";

export default function MessageBubble({ message }: MessageBubbleProps) {
  // Apply PII masking if spans are available
  const content =
    message.piiSpans && message.piiSpans.length > 0
      ? applyPIISpans(message.text, message.piiSpans)
      : message.text;

  return (
    <div
      className={`flex ${
        message.isUser ? "justify-end" : "justify-start"
      } w-full`}
    >
      <div
        className={` min-w-0  px-4 py-3 bg-black text-white overflow-hidden ${
          message.isUser ? "border border-[#2a2a2a] rounded-full" : ""
        }`}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
          {content}
        </p>
      </div>
    </div>
  );
}
