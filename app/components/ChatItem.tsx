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
        <div className="flex items-center gap-2 flex-1">
          <div className="w-2 h-2 rounded-full bg-white shadow-[0_0_4px_rgba(255,255,255,0.3)]"></div>
          <span className="text-sm font-medium text-white truncate">
            {chat.title}
          </span>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <div className="w-3 h-3 rounded-full border border-dashed border-[#2a2a2a]"></div>
          <span className="text-xs text-gray-400">{chat.time}</span>
        </div>
      </div>
    </div>
  );
}
