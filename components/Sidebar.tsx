"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  PanelLeftClose, PanelLeftOpen, ShieldAlert, Layers, HardHat,
  Sprout, BookOpen, User, ChevronDown, Plus, MessageSquare,
  MoreHorizontal, Pencil, Pin, PinOff, Check, Trash2, AlertTriangle,
  Lock, X // ✨ Added Lock and X imports
} from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ThemeToggle from "./themes/ThemeToggle";
import {
  getUserConversationsAction,
  renameChatAction,
  togglePinChatAction,
  deleteChatAction
} from "@/lib/actions/chai-gpt/conversation.actions";
import Logo from "./Logo";

// ✨ Global flag for controlling modules
const DISABLE_EXTRA_MODULES = true;

const AGENTS = [
  { id: "consensus", name: "Consensus", icon: HardHat, href: "/consensus", isLocked: false },
  { id: "risk", name: "Risk Analyzer", icon: ShieldAlert, href: "/risk-analyzer/chat/risk", isLocked: DISABLE_EXTRA_MODULES },
  { id: "chai-gpt", name: "Chai GPT", icon: Layers, href: "/chai-gpt/chat", isLocked: false },
];

function ChatListItem({ chat, pathname }: { chat: any, pathname: string }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(chat.title);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const isChatActive = pathname === `/chai-gpt/chat/${chat.id}`;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus();
  }, [isEditing]);

  const renameMutation = useMutation({
    mutationFn: async (newTitle: string) => renameChatAction(chat.id, newTitle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] }),
  });

  const pinMutation = useMutation({
    mutationFn: async (isPinned: boolean) => togglePinChatAction(chat.id, isPinned),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => deleteChatAction(chat.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations", "chai-gpt"] });
      if (pathname.includes(chat.id) || window.location.pathname.includes(chat.id)) {
        window.location.href = "/chai-gpt/chat";
      }
    },
  });

  const handleRenameSubmit = () => {
    if (editTitle.trim() && editTitle !== chat.title) {
      renameMutation.mutate(editTitle);
    } else {
      setEditTitle(chat.title);
    }
    setIsEditing(false);
  };

  return (
    <>
      <div className="relative group">
        {isEditing ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-subtle bg-panel shadow-sm">
            <input
              ref={inputRef}
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleRenameSubmit();
                if (e.key === "Escape") { setIsEditing(false); setEditTitle(chat.title); }
              }}
              className="flex-1 min-w-0 bg-transparent text-[12px] text-txt focus:outline-none"
            />
            <button onClick={handleRenameSubmit} className="text-emerald-500 hover:text-emerald-400">
              <Check className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => { setIsEditing(false); setEditTitle(chat.title); }} className="text-red-500 hover:text-red-400">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className={`flex items-center justify-between rounded-md transition-all duration-200 border group-hover:pr-1 ${isChatActive
            ? "bg-panel border-subtle text-txt font-medium shadow-sm"
            : "border-transparent text-muted hover:text-txt hover:bg-subtle/30"
            }`}>
            <Link
              href={`/chai-gpt/chat/${chat.id}`}
              className="flex-1 flex items-center gap-2 px-3 py-1.5 min-w-0"
            >
              {chat.isPinned ? (
                <Pin className="h-3 w-3 shrink-0 text-txt rotate-45" />
              ) : (
                <MessageSquare className="h-3 w-3 shrink-0" />
              )}
              <span className="text-[12px] truncate">{chat.title}</span>
            </Link>

            <button
              onClick={(e) => {
                e.preventDefault();
                setMenuOpen(!menuOpen);
              }}
              className={`p-1 rounded-md transition-opacity duration-200 ${menuOpen || isChatActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} hover:bg-subtle`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </div>
        )}

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-subtle bg-panel p-1 shadow-lg z-50 flex flex-col gap-0.5"
            >
              <button
                onClick={() => { setMenuOpen(false); setIsEditing(true); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium text-txt hover:bg-subtle transition-colors w-full text-left"
              >
                <Pencil className="h-3 w-3" /> Rename
              </button>
              <button
                onClick={() => { setMenuOpen(false); pinMutation.mutate(!chat.isPinned); }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium text-txt hover:bg-subtle transition-colors w-full text-left"
              >
                {chat.isPinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                {chat.isPinned ? "Unpin Chat" : "Pin Chat"}
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-[11px] font-medium text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
              >
                <Trash2 className="h-3 w-3" /> Delete Chat
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="w-full max-w-sm rounded-xl border border-subtle bg-panel p-6 shadow-2xl mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h3 className="text-[16px] font-semibold text-txt">Delete Chat?</h3>
              </div>

              <p className="mb-6 text-[13px] text-muted leading-relaxed">
                Are you sure you want to delete <span className="font-semibold text-txt">"{chat.title}"</span>? This action cannot be undone and will permanently remove all messages.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="rounded-lg px-4 py-2 text-[13px] font-medium text-txt hover:bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteMutation.mutate();
                    setIsDeleteModalOpen(false);
                  }}
                  disabled={deleteMutation.isPending}
                  className="rounded-lg bg-red-500 px-4 py-2 text-[13px] font-medium text-white hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Yes, delete it"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isChaiGptOpen, setIsChaiGptOpen] = useState(false);
  const pathname = usePathname();

  const { isLoaded, userId } = useAuth();
  const isSignedIn = !!userId;

  const { data: chaiChats = [] } = useQuery({
    queryKey: ["conversations", "chai-gpt"],
    queryFn: async () => {
      const res = await getUserConversationsAction("chai-gpt");
      if (res.success && res.conversations) return res.conversations;
      return [];
    },
    enabled: isSignedIn,
  });

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative z-40 flex h-[100dvh] flex-col justify-between border-r border-subtle bg-base p-4 shadow-xl shrink-0 overflow-hidden"
    >
      <div className="flex flex-col gap-8 flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-thin-scrollbar pb-4">

        <div className={`group relative flex h-10 shrink-0 items-center ${isCollapsed ? "justify-center" : "justify-between px-1"}`}>
          <Link
            href={"/"}
            className={`transition-all duration-200 ${isCollapsed ? "absolute opacity-100 group-hover:opacity-0 group-hover:pointer-events-none" : "relative opacity-100"}`}
          >
            <Logo showText={!isCollapsed} />
          </Link>

          {isCollapsed ? (
            <button onClick={() => setIsCollapsed(false)} className="absolute z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition-all duration-200 hover:bg-subtle hover:text-txt group-hover:opacity-100">
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={() => setIsCollapsed(true)} className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-txt">
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {!isCollapsed && <span className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted shrink-0">Agents</span>}

          {AGENTS.map((agent) => {
            const isActive = pathname.startsWith(agent.href);
            const Icon = agent.icon;

            // ✨ STEP 1: Guard check for locked modules
            if (agent.isLocked) {
              return (
                <div
                  key={agent.id}
                  className={`group relative flex shrink-0 items-center rounded-lg cursor-not-allowed opacity-60 bg-base/40 border border-transparent ${
                    isCollapsed ? "mx-auto h-11 w-11 justify-center p-0" : "w-full justify-between gap-4 px-3 py-2.5"
                  }`}
                  title="Temporarily disabled for maintenance"
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <Icon className="h-4 w-4 shrink-0 text-muted" strokeWidth={2} />
                    {!isCollapsed && (
                      <span className="truncate font-sans text-[13px] font-medium text-muted">
                        {agent.name}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && <Lock className="h-3.5 w-3.5 shrink-0 relative z-10 text-muted/50" />}
                </div>
              );
            }

            // STEP 2: Logic for Chai-GPT Accordion (Only runs if NOT locked)
            if (agent.id === "chai-gpt") {
              return (
                <div key={agent.id} className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      if (isCollapsed) {
                        setIsCollapsed(false);
                        setIsChaiGptOpen(true);
                      } else setIsChaiGptOpen(!isChaiGptOpen);
                    }}
                    className={`relative flex shrink-0 items-center rounded-lg cursor-pointer ${isCollapsed ? "mx-auto h-11 w-11 justify-center p-0" : "w-full justify-between gap-4 px-3 py-2.5"} ${isActive ? "text-txt" : "text-muted hover:text-txt"}`}
                  >
                    {isActive && <motion.div layoutId="active-tab" className="absolute inset-0 rounded-lg border border-subtle bg-panel shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                    <div className="flex items-center gap-4 relative z-10">
                      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                      {!isCollapsed && <span className={`truncate font-sans text-[13px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}>{agent.name}</span>}
                    </div>
                    {!isCollapsed && <ChevronDown className={`h-4 w-4 shrink-0 relative z-10 transition-transform duration-200 ${isChaiGptOpen ? "rotate-180" : ""}`} />}
                  </button>

                  <AnimatePresence>
                    {!isCollapsed && isChaiGptOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-0.5 overflow-visible pl-4 pr-1 pt-1"
                      >
                        <Link
                          href="/chai-gpt/chat"
                          className="group flex items-center gap-2 px-3 py-1.5 mb-1 rounded-md border border-dashed border-subtle/80 text-txt/80 hover:text-txt hover:bg-subtle/40 hover:border-subtle transition-all"
                        >
                          <Plus className="h-3.5 w-3.5 shrink-0 transition-colors" strokeWidth={2.5} />
                          <span className="text-[12px] font-medium truncate">New Chat</span>
                        </Link>
                        {chaiChats.map((chat: any) => (
                          <ChatListItem key={chat.id} chat={chat} pathname={pathname} />
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            }

            // STEP 3: Normal Links (Consensus Engine, etc.)
            return (
              <Link key={agent.id} href={agent.href} className={`relative flex shrink-0 items-center rounded-lg ${isCollapsed ? "mx-auto h-11 w-11 justify-center p-0" : "w-full justify-start gap-4 px-3 py-2.5"} ${isActive ? "text-txt" : "text-muted hover:text-txt"}`}>
                {isActive && <motion.div layoutId="active-tab" className="absolute inset-0 rounded-lg border border-subtle bg-panel shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
                <Icon className="relative z-10 h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && <span className={`relative z-10 truncate font-sans text-[13px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}>{agent.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className={`mt-auto shrink-0 flex border-t border-subtle pt-5 transition-all ${isCollapsed ? "flex-col items-center gap-5" : "flex-row items-center justify-between gap-2"}`}>
        <div className="flex items-center flex-1 min-w-0 min-h-10">
          {!isLoaded ? (
            <div className={`flex w-full animate-pulse items-center ${isCollapsed ? 'justify-center' : 'px-2 gap-3'}`}>
              <div className="h-8 w-8 rounded-lg bg-subtle shrink-0"></div>
              {!isCollapsed && (
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="h-3 w-16 bg-subtle rounded"></div>
                  <div className="h-2 w-12 bg-subtle rounded"></div>
                </div>
              )}
            </div>
          ) : !isSignedIn ? (
            <Link href="/login" className={`group flex items-center gap-3 rounded-lg hover:bg-subtle transition-colors flex-1 min-w-0 ${isCollapsed ? "p-2 mx-auto justify-center" : "px-2 py-2"}`}>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-subtle bg-panel shadow-sm">
                <User className="h-4 w-4 text-muted group-hover:text-txt" />
              </div>
              {!isCollapsed && <span className="truncate font-sans text-[13px] font-medium text-muted group-hover:text-txt flex-1 min-w-0">Sign In</span>}
            </Link>
          ) : (
            <div className={`flex flex-row-reverse items-center flex-1 min-w-0 ${isCollapsed ? "justify-center" : "px-2"}`}>
              <div className="shrink-0">
                <UserButton appearance={{ elements: { userButtonAvatarBox: "h-8 w-8 rounded-lg border border-subtle shadow-sm" } }} />
              </div>
              {!isCollapsed && (
                <div className="ml-3 flex flex-col overflow-hidden flex-1 min-w-0">
                  <span className="text-[13px] font-semibold text-txt truncate">My Account</span>
                  <span className="text-[11px] text-muted truncate">Manage profile</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </motion.aside>
  );
}