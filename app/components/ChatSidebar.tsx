import { ChatSidebarProps } from "../types/chatSidebar";
import ChatItem from "./ChatItem";

export default function ChatSidebar({
  chats,
  currentConversationId,
  onNewConversation,
  onConversationSelect,
}: ChatSidebarProps) {
  return (
    <div className="w-96 bg-black border-r border-[#2a2a2a] flex flex-col">
      <div className="p-2 flex justify-end">
        <button
          onClick={() => onNewConversation?.()}
          className="w-8 h-8 rounded-full border border-[#2a2a2a] hover:border-[#3a3a3a] flex items-center justify-center transition-colors"
          title="New Chat"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M8 3.5V12.5M3.5 8H12.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={chat.id === currentConversationId}
              onClick={() => onConversationSelect?.(chat.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

