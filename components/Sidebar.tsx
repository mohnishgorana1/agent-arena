"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { PanelLeftClose, PanelLeftOpen, ShieldAlert, Layers, HardHat, Sprout, BookOpen, User } from "lucide-react";
import { UserButton, useAuth } from "@clerk/nextjs";
import ThemeToggle from "./themes/ThemeToggle";

const AGENTS = [
  { id: "risk", name: "Risk Analyzer", icon: ShieldAlert, href: "/risk-analyzer/chat/risk" },
  { id: "chai-gpt", name: "Chai GPT", icon: Layers, href: "/chai-gpt/chat" },
  { id: "struct", name: "Struct Planner", icon: HardHat, href: "/chat/struct" },
  { id: "yield", name: "Yield Optimizer", icon: Sprout, href: "/chat/yield" },
  { id: "prep", name: "Prep Mentor", icon: BookOpen, href: "/chat/prep" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const { isLoaded, userId } = useAuth();
  const isSignedIn = !!userId;

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative z-40 flex h-dvh flex-col justify-between border-r border-subtle bg-base p-4 shadow-xl shrink-0 overflow-hidden"
    >
      {/* SCROLLABLE AREA: Sirf upper content scroll hoga (min-h-0 zaruri hai flexbox scroll ke liye) */}
      <div className="flex flex-col gap-8 flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-thin-scrollbar pb-4">

        <div className={`group relative flex h-10 shrink-0 items-center ${isCollapsed ? "justify-center" : "justify-between px-1"}`}>
          {/* Logo Link */}
          <Link
            href={"/"}
            className={`flex items-center gap-3 transition-all duration-200 ${isCollapsed
              ? "absolute opacity-100 group-hover:opacity-0 group-hover:pointer-events-none"
              : "relative opacity-100"
              }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-subtle bg-panel text-sm font-bold text-txt shadow-sm">
              A
            </div>
            {!isCollapsed && (
              <span className="font-sans text-[14px] font-semibold tracking-tight text-txt whitespace-nowrap">
                AgentArena
              </span>
            )}
          </Link>

          {/* Toggle Buttons */}
          {isCollapsed ? (
            <button
              onClick={() => setIsCollapsed(false)}
              className="absolute z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted opacity-0 transition-all duration-200 hover:bg-subtle hover:text-txt group-hover:opacity-100"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsCollapsed(true)}
              className="z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-subtle hover:text-txt"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {!isCollapsed && <span className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted shrink-0">Agents</span>}
          {AGENTS.map((agent) => {
            const isActive = pathname === agent.href;
            const Icon = agent.icon;
            return (
              <Link key={agent.id} href={agent.href} className={`relative flex shrink-0 items-center rounded-lg ${isCollapsed ? "mx-auto h-11 w-11 justify-center p-0" : "w-full justify-start gap-4 px-3 py-2.5"} ${isActive ? "text-txt" : "text-muted hover:text-txt"}`}>
                {isActive && (
                  <motion.div layoutId="active-tab" className="absolute inset-0 rounded-lg border border-subtle bg-panel shadow-sm" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <Icon className="relative z-10 h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                {!isCollapsed && <span className={`relative z-10 truncate font-sans text-[13px] tracking-wide ${isActive ? "font-semibold" : "font-medium"}`}>{agent.name}</span>}
              </Link>
            );
          })}
        </div>
      </div>

      {/* =======================================
          BOTTOM SECTION: AUTH & THEME TOGGLE
          ======================================= */}
      <div
        className={`mt-auto shrink-0 flex border-t border-subtle pt-5 transition-all ${isCollapsed ? "flex-col items-center gap-5" : "flex-row items-center justify-between gap-2"
          }`}
      >
        <div className="flex items-center flex-1 min-w-0 min-h-10">

          {!isLoaded ? (
            // SKELETON LOADER
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
            // SIGNED OUT STATE
            <Link
              href="/login"
              className={`group flex items-center gap-3 rounded-lg hover:bg-subtle transition-colors flex-1 min-w-0 ${isCollapsed ? "p-2 mx-auto justify-center" : "px-2 py-2"
                }`}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-subtle bg-panel shadow-sm">
                <User className="h-4 w-4 text-muted group-hover:text-txt" />
              </div>
              {!isCollapsed && (
                <span className="truncate font-sans text-[13px] font-medium text-muted group-hover:text-txt flex-1 min-w-0">
                  Sign In
                </span>
              )}
            </Link>
          ) : (
            // SIGNED IN STATE
            <div className={`flex flex-row-reverse items-center flex-1 min-w-0 ${isCollapsed ? "justify-center" : "px-2"}`}>
              <div className="shrink-0">
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-8 w-8 rounded-lg border border-subtle shadow-sm",
                    },
                  }}
                />
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

        {/* Theme Toggle */}
        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </motion.aside>
  );
}
