"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { PanelLeftClose, PanelLeftOpen, ShieldAlert, Layers, HardHat, Sprout, BookOpen, User } from "lucide-react";
import ThemeToggle from "./themes/ThemeToggle";

const AGENTS = [
  { id: "risk", name: "Risk Analyzer", icon: ShieldAlert, href: "/chat/risk" },
  { id: "stack", name: "Stack Architect", icon: Layers, href: "/chat/stack" },
  { id: "struct", name: "Struct Planner", icon: HardHat, href: "/chat/struct" },
  { id: "yield", name: "Yield Optimizer", icon: Sprout, href: "/chat/yield" },
  { id: "prep", name: "Prep Mentor", icon: BookOpen, href: "/chat/prep" },
];

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="relative z-40 flex h-full flex-col justify-between border-r border-subtle bg-base p-4 shadow-xl"
    >
      <div className="flex flex-col gap-8">
        <div className={`group relative flex h-10 items-center ${isCollapsed ? "justify-center" : "justify-between px-1"}`}>

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
              className="absolute z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted opacity-0 transition-all duration-200 hover:bg-subtle hover:text-txt group-hover:opacity-100"
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
          {!isCollapsed && <span className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">Agents</span>}
          {AGENTS.map((agent) => {
            const isActive = pathname === agent.href;
            const Icon = agent.icon;
            return (
              <Link key={agent.id} href={agent.href} className={`relative flex items-center rounded-lg ${isCollapsed ? "mx-auto h-11 w-11 justify-center p-0" : "w-full justify-start gap-4 px-3 py-2.5"} ${isActive ? "text-txt" : "text-muted hover:text-txt"}`}>
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

      <div
        className={`mt-auto flex border-t border-subtle pt-6 transition-all ${isCollapsed ? "flex-col items-center gap-4" : "flex-row items-center justify-between gap-2"
          }`}
      >
        <button
          className={`group flex items-center gap-3 rounded-lg hover:bg-subtle transition-colors ${isCollapsed ? "p-2 justify-center" : "flex-1 px-3 py-2.5"
            }`}
        >
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-subtle bg-panel shadow-sm">
            <User className="h-3.5 w-3.5 text-muted group-hover:text-txt" />
          </div>
          {!isCollapsed && (
            <span className="truncate font-sans text-[13px] font-medium text-muted group-hover:text-txt">
              Sign In
            </span>
          )}
        </button>

        <div className="shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </motion.aside>
  );
}