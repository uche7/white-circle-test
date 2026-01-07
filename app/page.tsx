"use client";

import { useState, useEffect, useCallback } from "react";
import ChatSidebar from "./components/ChatSidebar";
import MessageList from "./components/MessageList";
import ChatInput from "./components/ChatInput";
import { Chat, Message } from "./types";
import { useChatStream } from "./hooks/useChatStream";
import { detectPII } from "./lib/pii-detector";

export default function Home() {
  const [conversations, setConversations] = useState<Chat[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { sendMessage, isStreaming } = useChatStream();

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (currentConversationId) {
      loadConversation(currentConversationId);
    } else {
      setMessages([]);
    }
  }, [currentConversationId]);

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/conversations");
      if (response.ok) {
        const data = await response.json();
        // Convert to Chat format with time
        const chats: Chat[] = data.map((conv: any) => ({
          id: conv.id,
          title: conv.title,
          time: formatTime(conv.updatedAt),
        }));
        setConversations(chats);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      console.log("Loading conversation:", id);
      const response = await fetch(`/api/conversations/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Loaded conversation data:", data);
        const loadedMessages: Message[] = data.messages.map((msg: any) => ({
          id: msg.id,
          text: msg.text,
          isUser: msg.isUser,
          piiSpans: msg.piiSpans ? JSON.parse(msg.piiSpans) : undefined,
        }));
        console.log("Setting messages:", loadedMessages);
        setMessages(loadedMessages);
      } else {
        const errorText = await response.text();
        console.error("Failed to load conversation:", response.status, errorText);
      }
    } catch (error) {
      console.error("Failed to load conversation:", error);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setInputValue(""); // Clear input when starting new conversation
  };

  const handleConversationSelect = (id: string) => {
    console.log("Conversation selected:", id, "Current:", currentConversationId);
    if (id !== currentConversationId) {
      setCurrentConversationId(id);
    }
  };

  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageText = inputValue;
    setInputValue("");

    try {
      // Start streaming response
      const result = await sendMessage(
        messageText,
        currentConversationId,
        (streamingMsg) => {
          // Update streaming message in real-time with PII masking
          setMessages((prev) => {
            const filtered = prev.filter((m) => m.id !== "streaming");
            return [...filtered, streamingMsg];
          });
        },
        (newConversationId) => {
          // Update conversation ID if new conversation was created
          if (!currentConversationId) {
            setCurrentConversationId(newConversationId);
            loadConversations(); // Refresh sidebar
          }
        }
      );

      if (result) {
        // Final PII detection (in case any was missed during streaming)
        const finalPiiSpans = detectPII(result.fullText);
        
        // Replace streaming message with final message (PII already detected during streaming)
        setMessages((prev) => {
          const filtered = prev.filter((m) => m.id !== "streaming");
          return [
            ...filtered,
            {
              id: result.conversationId + "-" + Date.now(),
              text: result.fullText,
              isUser: false,
              piiSpans: finalPiiSpans.length > 0 ? finalPiiSpans : undefined,
            },
          ];
        });

        // Also save PII spans to database via API
        const finalMessageId = result.conversationId + "-" + Date.now();
        if (finalPiiSpans.length > 0) {
          detectPIIAsync(result.fullText, finalMessageId);
        }
        
        // Refresh conversations to update titles
        loadConversations();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [inputValue, currentConversationId, isStreaming, sendMessage]);

  // Async PII detection - runs in parallel
  const detectPIIAsync = async (text: string, messageId: string) => {
    try {
      // Call server-side PII detection API
      const response = await fetch("/api/pii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          text,
        }),
      });

      if (response.ok) {
        const { spans } = await response.json();
        
        if (spans.length > 0) {
          // Update message with PII spans
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === messageId) {
                return { ...msg, piiSpans: spans };
              }
              return msg;
            })
          );
        }
      }
    } catch (error) {
      console.error("PII detection error:", error);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hr`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  const handleConversationSelectMobile = (id: string) => {
    handleConversationSelect(id);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const handleNewConversationMobile = () => {
    handleNewConversation();
    setSidebarOpen(false); // Close sidebar on mobile after starting new chat
  };

  return (
    <div className="flex h-screen bg-black text-white relative">
      {/* Mobile menu button - hidden when sidebar is open */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-[#2a2a2a] border border-[#3a3a3a] rounded-lg flex items-center justify-center transition-colors hover:bg-[#3a3a3a]"
          aria-label="Toggle sidebar"
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
              d="M3 5H17M3 10H17M3 15H17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:static inset-y-0 left-0 z-40 transition-transform duration-300 ease-in-out`}
      >
        <ChatSidebar
          chats={conversations}
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversationMobile}
          onConversationSelect={handleConversationSelectMobile}
          onClose={() => setSidebarOpen(false)}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full md:w-auto">
        <MessageList messages={messages} isStreaming={isStreaming} />
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          disabled={isStreaming}
        />
      </div>
    </div>
  );
}
