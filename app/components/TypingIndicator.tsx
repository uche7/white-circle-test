/**
 * TypingIndicator Component
 * 
 * Shows animated dots while AI is thinking/streaming
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="max-w-[70%] rounded-full px-4 py-3 bg-black border border-[#2a2a2a] text-white">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2 h-2 bg-white/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-white/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: '200ms' }}></span>
            <span className="w-2 h-2 bg-white/80 rounded-full animate-[bounce_1.4s_ease-in-out_infinite]" style={{ animationDelay: '400ms' }}></span>
          </div>
          <span className="text-sm text-gray-400">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
}

