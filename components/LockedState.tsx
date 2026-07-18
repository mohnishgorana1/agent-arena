import React from "react";
import { Lock, Wrench } from "lucide-react"; // Changed icon to Wrench for "Under Construction" vibe
import Link from "next/link";

export default function LockedState({ moduleName }: { moduleName: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-base p-6 text-center selection:bg-indigo-500/20">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-subtle bg-panel shadow-sm backdrop-blur-md">
        <Lock className="h-10 w-10 text-muted" />
      </div>
      
      <h2 className="mb-3 text-2xl font-bold text-txt tracking-tight">
        {moduleName} is Locked
      </h2>
      
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-subtle bg-panel/50 p-4 text-left max-w-md shadow-sm">
        <Wrench className="mt-0.5 h-5 w-5 shrink-0 text-indigo-500" />
        <p className="text-[13px] leading-relaxed text-muted">
          This module is currently under active development and has been temporarily disabled. We are working hard to bring this feature to you soon.
        </p>
      </div>

      <Link 
        href="/consensus" 
        className="rounded-lg bg-txt px-5 py-2.5 text-[13px] font-bold text-base transition-transform hover:scale-105 shadow-sm"
      >
        Go to Consensus Engine
      </Link>
    </div>
  );
}