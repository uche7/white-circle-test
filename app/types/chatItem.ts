import { Chat } from "./index";

export interface ChatItemProps {
  chat: Chat;
  isActive?: boolean;
  onClick?: () => void;
}

