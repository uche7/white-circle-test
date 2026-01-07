export interface Chat {
  id: string;
  title: string;
  time: string;
}

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  piiSpans?: Array<{ start: number; end: number; type: string }>;
}

