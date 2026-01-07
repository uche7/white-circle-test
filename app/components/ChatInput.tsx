import { ChatInputProps } from "../types/chatInput";

export default function ChatInput({ value, onChange, onSend, disabled = false }: ChatInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSend();
    }
  };

  return (
    <div className="p-4">
      <div className="max-w-4xl mx-auto relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask anything dangerous to test"
          disabled={disabled}
          className="w-full bg-white/5 backdrop-blur-md text-sm text-white placeholder-gray-400 rounded-full px-5 py-3 pr-14 border border-white/10 focus:outline-none focus:border-white/15 focus:bg-white/8 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/5 backdrop-blur-md hover:bg-white/10 border border-white/10 hover:border-white/15 rounded-full flex items-center justify-center transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M10 5V15M5 10L10 5L15 10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
