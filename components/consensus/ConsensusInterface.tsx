"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cpu, User, Sparkles, ChevronDown, Trash2, Loader2, Bot, ShieldAlert, CheckCircle2, Copy, Check } from "lucide-react";
import ChatInput from "@/components/ChatInput";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { generateConsensusAction } from "@/lib/actions/consensus/consensus.actions";

// ==========================================
// Types
// ==========================================
interface DraftResult { 
  id: string; 
  name: string; 
  status: string; 
  duration: number; 
  toolCalls: number; 
  output: string; 
}

interface Message { 
  id: string; 
  role: "user" | "assistant"; 
  content: string; 
  consistencyScore?: string; 
  drafts?: DraftResult[]; 
  isError?: boolean; 
}

// ==========================================
// Main Component
// ==========================================
export default function ConsensusInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✨ Load from LocalStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("consensus_chat_history");
    if (saved) setMessages(JSON.parse(saved));
    setIsLoaded(true);
  }, []);

  // ✨ Save to LocalStorage whenever messages change
  useEffect(() => {
    if (isLoaded) localStorage.setItem("consensus_chat_history", JSON.stringify(messages));
  }, [messages, isLoaded]);

  // ✨ Smooth auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isProcessing]);

  const handleSendMessage = async (userText: string) => {
    const newMessageId = Date.now().toString();
    const newUserMessage: Message = { id: `user-${newMessageId}`, role: "user", content: userText };
    
    setMessages((prev) => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      const historyPayload = [...messages, newUserMessage].map(m => ({ role: m.role, content: m.content }));
      const payload = await generateConsensusAction(historyPayload);

      if (payload.success && payload.data) {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: payload.data.answer.markdown,
            consistencyScore: payload.data.answer.consistency,
            drafts: payload.data.drafts as DraftResult[],
          },
        ]);
      } else {
        throw new Error(payload.error?.message || "Execution Error.");
      }
    } catch (error: any) {
      const isSecurityBlock = error.message.includes("SECURITY_REJECTION");
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: isSecurityBlock ? `Security Violation: ${error.message}` : error.message,
          isError: true,
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    if(window.confirm("Are you sure you want to clear the consensus history?")) {
        setMessages([]);
        localStorage.removeItem("consensus_chat_history");
    }
  };

  // Prevent hydration errors
  if (!isLoaded) return null;

  return (
    <div className="flex h-full flex-col bg-base overflow-hidden relative font-sans selection:bg-indigo-500/20">
      {/* Sleek Minimal Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-subtle bg-base/80 px-6 backdrop-blur-md z-20">
        <div className="flex items-center gap-3 text-txt">
          <div className="flex h-7 w-7 items-center justify-center rounded-md border border-subtle bg-panel shadow-sm">
            <Bot className="h-4 w-4 text-txt" />
          </div>
          <div className="flex items-center gap-2 font-medium tracking-tight text-[13px]">
            <span>Consensus Engine</span>
            <span className="text-muted">/</span>
            <span className="text-muted">Active Workspace</span>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[11px] font-medium text-muted hover:bg-subtle hover:text-txt transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </header>

      {/* Main Chat Workspace */}
      <div className="flex-1 overflow-y-auto px-4 py-8 scroll-smooth z-10 custom-thin-scrollbar flex flex-col items-center">
        <div className="w-full max-w-5xl flex flex-col gap-6 pb-24">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex mt-32 flex-col items-center justify-center text-center px-4"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-subtle bg-panel shadow-sm">
                <Sparkles className="h-6 w-6 text-txt" />
              </div>
              <h2 className="text-lg font-semibold text-txt tracking-tight">Self-Consistency Hub</h2>
              <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-muted">
                Input your problem statement. The architecture runs cross-model verification loops to generate an optimal consensus resolution.
              </p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}

              {/* Processing Loader UI */}
              {isProcessing && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex w-full justify-start py-4">
                  <div className="flex w-full gap-4 items-start">
                    <div className="shrink-0 mt-1">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md border border-subtle bg-panel shadow-sm">
                        <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">Consensus Engine</span>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[13px] text-muted">Running consensus matrix...</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} className="h-2" />
        </div>
      </div>

      {/* Input Zone - Centered with flex */}
      <div className="absolute bottom-0 w-full flex justify-center bg-gradient-to-t from-base via-base/95 to-transparent pb-6 pt-12 px-4 z-20 pointer-events-none">
        <div className="w-full max-w-5xl pointer-events-auto rounded-2xl">
          <ChatInput placeholder="Query the consensus matrix..." onSendMessage={handleSendMessage} isLoading={isProcessing} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Sub-Layout: Chat Message Block 
// ==========================================
function ChatMessage({ message }: { message: Message }) {
  const [showDrafts, setShowDrafts] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const isUser = message.role === "user";
  const isBlocked = message.isError || message.content.includes("Security Violation");

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} py-4`}
    >
      {isUser ? (
        // ✨ Soft User Bubble 
        <div className="flex w-full max-w-[75%] gap-3 flex-row-reverse items-start">
          <div className="shrink-0 mt-1">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-subtle border border-subtle/50 text-txt shadow-sm">
              <User className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-col items-end min-w-0">
            <span className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted mr-1">You</span>
            <div className="bg-neutral-800/10 dark:bg-neutral-100/10 border border-subtle/50 text-txt px-4 py-2.5 rounded-2xl rounded-tr-sm font-sans text-[14px] leading-relaxed break-words shadow-sm whitespace-pre-wrap">
              {message.content}
            </div>
          </div>
        </div>
      ) : (
        // ✨ Full-Width Assistant Response
        <div className="flex w-full gap-4 items-start">
          <div className="shrink-0 mt-1">
            <div className={`flex h-8 w-8 items-center justify-center rounded-md border shadow-sm ${isBlocked ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-txt border-txt text-base"}`}>
              {isBlocked ? <ShieldAlert className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted">Consensus Engine</span>
              {!isBlocked && message.consistencyScore && (
                <div className="flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase text-muted bg-panel border border-subtle px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="h-3 w-3 text-indigo-500" />
                  Score: <span className="text-txt">{message.consistencyScore}</span>
                </div>
              )}
            </div>
            
            <div className={`w-full text-[14px] leading-relaxed break-words mt-1 ${isBlocked ? "text-red-500 font-medium" : "text-txt prose prose-sm prose-neutral dark:prose-invert max-w-none"}`}>
              {isBlocked ? (
                message.content
              ) : (
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => <h1 className="text-xl font-bold mt-4 mb-2 text-txt" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="text-lg font-bold mt-4 mb-2 text-txt" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="text-base font-bold mt-3 mb-2 text-txt" {...props} />,
                    p: ({ node, ...props }) => <p className="mb-3 leading-relaxed" {...props} />,
                    ul: ({ node, ...props }) => <ul className="list-disc list-outside ml-4 mb-3 flex flex-col gap-1" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-outside ml-4 mb-3 flex flex-col gap-1" {...props} />,
                    li: ({ node, ...props }) => <li className="text-[14.5px] pl-1" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-txt" {...props} />,
                    
                    // ✨ PREMIUM CODE BLOCK RENDERING ✨
                    code: ({ inline, className, children, ...props }: any) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeString = String(children).replace(/\n$/, "");
                      const codeId = codeString.substring(0, 20); 

                      if (!inline && match) {
                        return (
                          <div className="relative group my-4 rounded-xl overflow-hidden border border-subtle bg-[#1E1E1E] shadow-sm">
                            <div className="flex items-center justify-between px-4 py-2 bg-[#2D2D2D] border-b border-white/5">
                              <span className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                                {match[1]}
                              </span>
                              <button
                                onClick={() => handleCopy(codeString, codeId)}
                                className="flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-white transition-colors"
                              >
                                {copiedCodeId === codeId ? (
                                  <><Check className="h-3.5 w-3.5 text-emerald-400"/> Copied!</>
                                ) : (
                                  <><Copy className="h-3.5 w-3.5"/> Copy Code</>
                                )}
                              </button>
                            </div>
                            <SyntaxHighlighter
                              style={vscDarkPlus as any}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                padding: "1rem",
                                background: "transparent",
                                fontSize: "13px",
                              }}
                              {...props}
                            >
                              {codeString}
                            </SyntaxHighlighter>
                          </div>
                        );
                      }
                      return (
                        <code className="bg-subtle border border-subtle/30 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-txt" {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              )}
            </div>

            {/* Clean Monochrome Drafts Accordion */}
            {message.drafts && message.drafts.length > 0 && !isBlocked && (
              <div className="mt-4 flex w-full flex-col overflow-hidden rounded-xl border border-subtle bg-panel/30 transition-all duration-200">
                <button
                  onClick={() => setShowDrafts(!showDrafts)}
                  className="flex items-center justify-between px-4 py-3 text-[12px] font-medium text-muted hover:text-txt hover:bg-subtle/50 transition-colors w-full"
                >
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4" />
                    Inspect {message.drafts.length} Agent Drafts
                  </div>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDrafts ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {showDrafts && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="flex flex-col border-t border-subtle divide-y divide-subtle/50"
                    >
                      {message.drafts.map((draft) => (
                        <DraftStack
                          key={draft.id}
                          title={`${draft.name} • ${draft.duration}ms • ${draft.toolCalls} tools`}
                          content={draft.output}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ==========================================
// Sub-Layout: Draft Stack (Monochrome)
// ==========================================
function DraftStack({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-4 bg-transparent w-full">
      <div className="mb-2 inline-flex items-center gap-1.5 border border-subtle bg-panel px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase text-muted shadow-sm">
        <Sparkles className="h-3 w-3" /> {title}
      </div>
      <div className="text-[13px] text-muted whitespace-pre-wrap leading-relaxed bg-subtle/30 border border-subtle/50 p-3 rounded-lg font-mono max-h-[250px] overflow-y-auto custom-thin-scrollbar w-full">
        {content || "No generation output recorded."}
      </div>
    </div>
  );
}