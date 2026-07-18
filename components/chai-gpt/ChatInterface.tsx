"use client";

import React, { useRef, useEffect, useState } from "react";
import { User, Coffee, Bot, } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ChatInput from "@/components/ChatInput";
import {
  createNewChatAction,
  addMessageToChatAction,
  renameChatAction
} from "@/lib/actions/chai-gpt/conversation.actions";
import { generateChatResponseAction } from "@/lib/actions/chai-gpt/llm.actions";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: Message[];
  initialTitle?: string;
}

export default function ChatInterface({
  chatId,
  initialMessages = [],
  initialTitle = "New Chat"
}: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✨ LOCAL STATE FOR INSTANT UI & STREAMING
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);

  // ✨ SYNC STATE ON SIDEBAR NAVIGATION
  useEffect(() => {
    setCurrentChatId(chatId);
    setMessages(initialMessages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId]);

  // TITLE STATE
  const [chatTitle, setChatTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const renameMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      if (!currentChatId) return;
      const res = await renameChatAction(currentChatId, newTitle);
      if (!res.success) throw new Error(res.error);
      return res.title;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] }),
  });

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (chatTitle.trim() && currentChatId) renameMutation.mutate(chatTitle);
  };

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) titleInputRef.current.focus();
  }, [isEditingTitle]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // 🚀 SUPER-FAST SEND MESSAGE FUNCTION
  const handleSendMessage = async (content: string) => {
    const userMsgId = `user_${Date.now()}`;
    const aiMsgId = `ai_${Date.now()}`;

    const newUserMsg: Message = { id: userMsgId, role: "user", content };
    const emptyAiMsg: Message = { id: aiMsgId, role: "assistant", content: "" };

    // Snap current history for LLM BEFORE updating state
    const historyForLlm = messages.map(m => ({ role: m.role, content: m.content }));

    // 1. Instant Optimistic UI Update
    setMessages((prev) => [...prev, newUserMsg, emptyAiMsg]);
    setIsStreaming(true);

    try {
      let activeChatId = currentChatId;
      let isNewChat = false;


      console.log("activeChatId", activeChatId)
      // 2. Save to Database
      if (!activeChatId) {
        console.log("sending msg", content)
        const res = await createNewChatAction(content);
        if (res.success && res.chatId) {
          activeChatId = res.chatId;

          isNewChat = true;


          console.log("success crete new chat actove chat id", activeChatId, "  ++ res.chatId", res.chatId)
          setCurrentChatId(activeChatId);
          
        } else {
          throw new Error("Failed to create chat");
        }
      } else {
        console.log("adding msg to chat action", activeChatId, content)
        const res = await addMessageToChatAction(activeChatId, content);
        if (!res.success) throw new Error("Failed to add message");
      }


      console.log("start llm, stream", activeChatId)
      // 3. Start LLM Stream
      const finalHistory = [...historyForLlm, { role: "user", content }];
      const textStream = await generateChatResponseAction(activeChatId!, finalHistory);


      // 4. Update URL & Sidebar - Stream start hone ke baad URL change karo
      if (isNewChat) {
        setCurrentChatId(activeChatId);
        window.history.replaceState(null, "", `/chai-gpt/chat/${activeChatId}`);
        queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] });
      }


      // 5. Update AI Message Chunk by Chunk
      for await (const chunk of textStream) {
        if (chunk) {
          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: updated[lastIdx].content + chunk
            };
            return updated;
          });
        }
      }

      // Refresh sidebar one last time to bump chat to top
      queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] });

    } catch (error) {
      console.error("Chat flow error:", error);
      setMessages((prev) => prev.filter(msg => msg.id !== aiMsgId));
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-base overflow-hidden">
      {/* HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-subtle bg-base/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3 text-txt">
          <Coffee className="h-4 w-4 shrink-0" />
          <div className="flex items-center gap-2 font-sans text-[13px] font-medium tracking-tight">
            <span>Chai GPT</span>
            <span className="text-muted">/</span>
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
                  onClick={() => { if (currentChatId) setIsEditingTitle(true); }}
                  className={`px-1.5 py-0.5 rounded border border-transparent truncate max-w-[200px] ${currentChatId ? "hover:bg-subtle/50 hover:border-subtle cursor-text text-txt" : "text-muted"}`}
                  title={currentChatId ? "Click to rename" : ""}
                >
                  {currentChatId ? chatTitle : "New Chat"}
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
                <div key={msg.id} className={`flex w-full ${isUser ? "justify-end px-4 sm:px-8 py-5" : "justify-start px-4 sm:px-8 py-6"}`}>
                  {isUser ? (
                    <div className="flex w-full max-w-[80%] sm:max-w-[70%] gap-3 flex-row-reverse items-start">
                      <div className="shrink-0 mt-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle text-txt shadow-sm">
                          <User className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex flex-col items-end min-w-0">
                        <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted mr-1">You</span>
                        <div className="bg-neutral-800 dark:bg-neutral-700 text-white px-4 py-2.5 rounded-2xl rounded-tr-sm font-sans text-[14px] leading-relaxed break-words shadow-sm whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex w-full max-w-[95%] xl:max-w-[90%] gap-4 md:gap-5 items-start">
                      <div className="shrink-0 mt-1">
                        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-txt text-base shadow-sm">
                          <Bot className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Chai GPT</span>
                        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none font-sans text-[14px] leading-relaxed text-txt break-words mt-1">
                          {/* Only parse markdown if the content has loaded completely, or let it parse chunks live! */}
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isStreaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1].content === "" && (
              <div className="flex w-full justify-start px-4 sm:px-8 py-6">
                <div className="flex items-center gap-1.5 h-6 mt-1 ml-[52px]">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]"></span>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <ChatInput onSendMessage={handleSendMessage} isLoading={isStreaming} placeholder="Message Chai GPT..." />
    </div>
  );
}