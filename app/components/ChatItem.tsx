import { ChatItemProps } from "../types/chatItem";

export default function ChatItem({ chat, isActive, onClick }: ChatItemProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`px-3 py-2 rounded-lg transition-colors cursor-pointer mb-1 relative ${
        isActive ? "bg-[#2a2a2a]" : "hover:bg-[#2a2a2a]"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 md:gap-2 flex-1 min-w-0">
          <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.3)] shrink-0"></div>
          <span className="text-xs md:text-sm font-medium text-white truncate">
            {chat.title}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-dashed border-[#2a2a2a]"></div>
          <span className="text-[10px] md:text-xs text-gray-400">{chat.time}</span>
        </div>
      </div>
    </div>
  );
}
