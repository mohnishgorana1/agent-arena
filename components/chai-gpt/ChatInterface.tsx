"use client";

import React, { useRef, useEffect, useState } from "react";
import { User, Coffee, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ChatInput from "@/components/ChatInput";
import {
  createNewChatAction,
  addMessageToChatAction,
  getChatMessagesAction,
  renameChatAction
} from "@/lib/actions/chai-gpt/conversation.actions";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: Message[];
}

export default function ChatInterface({ chatId, initialMessages = [] }: ChatInterfaceProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // TITLE
  const [chatTitle, setChatTitle] = useState("New Chat");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch & Cache Messages (TanStack Query)
  const { data: messages = [] } = useQuery({
    queryKey: ["chat-messages", chatId],
    queryFn: async () => {
      if (!chatId) return [];
      const result = await getChatMessagesAction(chatId);
      if (result.success && result.messages) {
        return result.messages as Message[];
      }
      throw new Error(result.error || "Failed to fetch messages");
    },
    initialData: initialMessages,
    enabled: !!chatId, // Nayi chat par fetch run nahi hoga
    staleTime: 1000 * 60 * 5, // 5 minutes tak cache stale nahi hoga
  });

  // 2. Handle Sending Messages (TanStack Mutation with Optimistic UI)
  const mutation = useMutation({
    mutationFn: async (content: string) => {
      if (!chatId) {
        // Create new chat
        const res = await createNewChatAction(content);
        if (!res.success) throw new Error(res.error);
        return { isNew: true, chatId: res.chatId, content };
      } else {
        // Add to existing chat
        const res = await addMessageToChatAction(chatId, content);
        if (!res.success) throw new Error(res.error);
        return { isNew: false, content };
      }
    },
    onMutate: async (newContent) => {
      // Optimistic Update: UI me turant message dikhane ke liye
      const tempId = `temp_${Date.now()}`;
      const optimisticMsg: Message = { id: tempId, role: "user", content: newContent };

      if (chatId) {
        await queryClient.cancelQueries({ queryKey: ["chat-messages", chatId] });
        const previousMessages = queryClient.getQueryData<Message[]>(["chat-messages", chatId]);

        queryClient.setQueryData<Message[]>(["chat-messages", chatId], (old) => [
          ...(old || []),
          optimisticMsg,
        ]);

        return { previousMessages };
      }
    },
    onSuccess: (data) => {
      if (data.isNew && data.chatId) {
        // Nayi chat bani hai, URL redirect karo
        router.replace(`/chai-gpt/chat/${data.chatId}`);
      } else if (chatId) {
        // Existing chat me save ho gaya. Yahan AI response mock kar rahe hain.
        // LLM integration aane par yahan AI stream trigger hogi.
        setTimeout(() => {
          const aiResponse: Message = {
            id: Date.now().toString(),
            role: "assistant",
            content: "TanStack Mutation successful! Database updated.",
          };
          queryClient.setQueryData<Message[]>(["chat-messages", chatId], (old) => [
            ...(old || []),
            aiResponse,
          ]);
        }, 800);
      }
    },
    onError: (err, newContent, context) => {
      // Agar backend request fail hui, toh optimistic message hata do
      if (chatId && context?.previousMessages) {
        queryClient.setQueryData(["chat-messages", chatId], context.previousMessages);
      }
      console.error("Message send failed:", err);
    },
  });


  // Rename Mutation (TanStack Query)
  const renameMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      if (!chatId) return;
      const res = await renameChatAction(chatId, newTitle);
      if (!res.success) throw new Error(res.error);
      return res.title;
    },
    onSuccess: () => {
      // Sidebar ki list ko refresh karne ke liye query invalidate karo
      queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] });
    },
  });

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (chatTitle.trim() && chatId) {
      renameMutation.mutate(chatTitle);
    }
  };

  // Focus effect for rename input
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  // Auto-scroll effect
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, mutation.isPending]);

  return (
    <div className="flex h-full flex-col bg-base overflow-hidden">

      {/* HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-subtle bg-base/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 text-txt">
          <Coffee className="h-4 w-4 shrink-0" />
          <div className="flex items-center gap-2 font-sans text-[13px] font-medium tracking-tight">
            <span>Chai GPT</span>
            <span className="text-muted">/</span>

            {/* Inline Rename Logic */}
            <div className="relative flex items-center">
              {isEditingTitle ? (
                <input
                  ref={titleInputRef}
                  type="text"
                  value={chatTitle}
                  onChange={(e) => setChatTitle(e.target.value)}
                  onBlur={handleTitleSubmit}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleTitleSubmit();
                    if (e.key === 'Escape') setIsEditingTitle(false);
                  }}
                  className="bg-panel border border-subtle rounded px-1.5 py-0.5 text-[13px] text-txt focus:outline-none focus:border-muted w-[200px]"
                />
              ) : (
                <span
                  onClick={() => {
                    if (chatId) setIsEditingTitle(true);
                  }}
                  className={`px-1.5 py-0.5 rounded border border-transparent truncate max-w-[200px] ${chatId ? "hover:bg-subtle/50 hover:border-subtle cursor-text text-txt" : "text-muted"
                    }`}
                  title={chatId ? "Click to rename" : ""}
                >
                  {chatId ? (chatTitle !== "New Chat" ? chatTitle : `Chat: ${chatId.substring(0, 8)}...`) : "New Chat"}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* CHAT MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto custom-thin-scrollbar">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center px-4">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-subtle bg-panel shadow-sm">
              <Coffee className="h-8 w-8 text-txt" />
            </div>
            <h2 className="text-lg font-semibold text-txt">How can I help you today?</h2>
            <p className="mt-2 max-w-sm text-[13px] text-muted">
              Ask me anything about code refactoring, database schemas, or serverless deployments.
            </p>
          </div>
        ) : (
          <div className="flex flex-col pb-8">
            {messages.map((msg) => {
              const isUser = msg.role === "user";

              return (
                <div
                  key={msg.id}
                  // REMOVED: bg-panel and border-y for a seamless look
                  className={`flex w-full ${isUser ? "justify-end px-4 sm:px-8 py-5" : "justify-start px-4 sm:px-8 py-6"}`}
                >
                  {isUser ? (
                    // 🧑‍💻 USER MESSAGE 
                    <div className="flex w-full max-w-[80%] sm:max-w-[70%] gap-3 flex-row-reverse items-start">
                      <div className="shrink-0 mt-1">
                        {/* Clean Avatar */}
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle text-txt shadow-sm">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-0">
                        <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted mr-1">
                          You
                        </span>
                        {/* DARK BUBBLE WITH NO BORDER */}
                        <div className="bg-neutral-800 dark:bg-neutral-700 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm font-sans text-[14px] leading-relaxed break-words shadow-sm">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 🤖 GPT MESSAGE (Clean & Seamless)
                    <div className="flex w-full max-w-[95%] xl:max-w-[90%] gap-4 md:gap-5 items-start">
                      <div className="shrink-0 mt-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-txt text-base shadow-sm">
                          <Coffee className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                          Chai GPT
                        </span>
                        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none font-sans text-[14px] leading-relaxed text-txt break-words mt-1">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator for Mutation */}
            {mutation.isPending && (
              <div className="flex w-full justify-start px-4 sm:px-8 py-6">
                <div className="flex w-full max-w-[95%] xl:max-w-[90%] gap-4 md:gap-5 items-start">
                  <div className="shrink-0 mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-txt text-base shadow-sm">
                      <Bot className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1 justify-center">
                    <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                      Chai GPT
                    </span>
                    <div className="flex items-center gap-1.5 h-6 mt-1">
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]"></span>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"></span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <ChatInput
        onSendMessage={(content) => mutation.mutate(content)}
        isLoading={mutation.isPending}
        placeholder="Message Chai GPT..."
      />
    </div>
  );
}
