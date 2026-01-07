/**
 * TypingIndicator Component
 * 
 * Shows animated dots while AI is thinking/streaming
 */
export default function TypingIndicator() {
  return (
    <div className="flex justify-start w-full px-2 md:px-0">
      <div className="max-w-[85%] md:max-w-[70%] min-w-0 rounded-full px-3 md:px-4 py-2 md:py-3 bg-black border border-[#2a2a2a] text-white overflow-hidden flex items-center space-x-2">
        <span className="text-xs md:text-sm leading-relaxed text-gray-400">AI is thinking</span>
        <div className="flex space-x-1">
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
          <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-white/80 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
        </div>
      </div>
    </div>
  );
}

