import { Chat } from "./index";

export interface ChatSidebarProps {
  chats: Chat[];
  currentConversationId?: string | null;
  onNewConversation?: () => void;
  onConversationSelect?: (id: string) => void;
}

