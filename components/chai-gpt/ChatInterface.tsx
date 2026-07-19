"use client";

import React, { useRef, useEffect, useState } from "react";
import { User, Coffee, Bot, Globe, Loader2, Copy, Check } from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import ChatInput from "@/components/ChatInput";
import {
  createNewChatAction,
  addMessageToChatAction,
  renameChatAction
} from "@/lib/actions/chai-gpt/conversation.actions";
import { generateChatResponseAction } from "@/lib/actions/chai-gpt/llm.actions";

// ✨ UI Types
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  toolName?: string;
  toolQuery?: string;
  isToolLoading?: boolean;
}

interface ChatInterfaceProps {
  chatId?: string;
  initialMessages?: Message[];
  initialTitle?: string;
}

// ✨ Naya CodeBlock Component Copy button aur VS Code theme ke liye
const CodeBlock = ({ language, value }: { language: string, value: string }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="rounded-lg border border-subtle bg-[#1e1e1e] my-4 overflow-hidden shadow-sm w-full font-sans">
      <div className="bg-[#2d2d2d] px-4 py-2 text-xs font-mono text-[#a0a0a0] border-b border-subtle flex justify-between items-center select-none">
        <span className="uppercase tracking-wider font-semibold">{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none"
        >
          {isCopied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-emerald-500">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy code</span>
            </>
          )}
        </button>
      </div>
      <div className="text-[13px]">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{ margin: 0, padding: '1rem', background: '#1e1e1e' }}
          PreTag="div"
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

export default function ChatInterface({
  chatId,
  initialMessages = [],
  initialTitle = "New Chat"
}: ChatInterfaceProps) {
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // States
  const [currentChatId, setCurrentChatId] = useState<string | undefined>(chatId);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isStreaming, setIsStreaming] = useState(false);

  // Chat Title States
  const [chatTitle, setChatTitle] = useState(initialTitle);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Sync state when navigating between chats
  useEffect(() => {
    setCurrentChatId(chatId);
    setMessages(initialMessages);
  }, [chatId]);

  // Rename Chat Logic
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

  // 🚀 MAIN FUNCTION: Send Message & Handle Custom Stream
  const handleSendMessage = async (content: string, useWebSearch: boolean) => {
    const userMsgId = `user_${Date.now()}`;
    const aiMsgId = `ai_${Date.now()}`;

    const newUserMsg: Message = { id: userMsgId, role: "user", content };
    const emptyAiMsg: Message = { id: aiMsgId, role: "assistant", content: "" };

    const historyForLlm = messages.map(m => ({ role: m.role, content: m.content }));

    // Optimistic Update
    setMessages((prev) => [...prev, newUserMsg, emptyAiMsg]);
    setIsStreaming(true);

    try {
      let activeChatId = currentChatId;
      let isNewChat = false;

      // 1. Create or update chat in DB
      if (!activeChatId) {
        const res = await createNewChatAction(content);
        if (res.success && res.chatId) {
          activeChatId = res.chatId;
          isNewChat = true;
          setCurrentChatId(activeChatId);
        } else {
          throw new Error("Failed to create chat");
        }
      } else {
        const res = await addMessageToChatAction(activeChatId, content);
        if (!res.success) throw new Error("Failed to add message");
      }

      // 2. Call the backend Action
      const finalHistory = [...historyForLlm, { role: "user", content }];
      const textStream = await generateChatResponseAction(activeChatId!, finalHistory, useWebSearch);

      // 3. Update URL if it's a new chat
      if (isNewChat) {
        window.history.replaceState(null, "", `/chai-gpt/chat/${activeChatId}`);
        queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] });
      }

      // 4. Custom Stream Parser loop (@openai/agents support)
      for await (const chunkString of textStream) {
        if (!chunkString) continue;

        try {
          const chunk = typeof chunkString === "string" ? JSON.parse(chunkString) : chunkString;

          setMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;

            if (chunk.type === 'text-delta') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                content: (updated[lastIdx].content || "") + chunk.textDelta
              };
            } else if (chunk.type === 'tool-call') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                toolName: chunk.toolName,
                toolQuery: chunk.query || "Searching web...",
                isToolLoading: true
              };
            } else if (chunk.type === 'tool-result') {
              updated[lastIdx] = {
                ...updated[lastIdx],
                isToolLoading: false
              };
            }

            return updated;
          });
        } catch (e) {
          console.error("Stream parse error", e, chunkString);
        }
      }

      // Refresh Sidebar
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
              Ask me anything about code refactoring, database schemas, or real-time info using the web search tool!
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
                        
                        {/* 🛠️ Tool Execution UI Badge */}
                        {msg.toolName && (
                          <div className="flex items-center gap-2 mb-2 mt-1 w-fit px-3 py-1.5 bg-blue-500/10 text-blue-500 rounded-lg text-[12px] font-medium border border-blue-500/20">
                            {msg.isToolLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" /> : <Globe className="h-3.5 w-3.5 shrink-0" />}
                            <span className="truncate max-w-[300px]">
                              {msg.isToolLoading ? msg.toolQuery : `Searched web via Tavily`}
                            </span>
                          </div>
                        )}

                        <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none font-sans text-[14px] leading-relaxed text-txt break-words mt-1">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                const language = match ? match[1] : "";
                                const value = String(children).replace(/\n$/, "");

                                return !inline && match ? (
                                  <CodeBlock language={language} value={value} />
                                ) : (
                                  <code className="bg-subtle/50 text-txt px-1.5 py-0.5 rounded-md text-[13px] font-mono border border-subtle/50" {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Waiting for response Loading Indicator */}
            {isStreaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1].content === "" && !messages[messages.length - 1].toolName && (
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