import React from "react";
import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="flex h-[100dvh] w-full flex-col bg-base overflow-hidden">
      
      {/* 1. Tumhara Naya Top Navbar */}
      <Navbar />

      {/* 2. Main Landing Page Content */}
      <main className="relative flex flex-1 flex-col overflow-y-auto">
        
        {/* Abstract Background Element */}
        <div className="absolute left-1/2 top-0 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-subtle blur-[120px]"></div>

        <div className="flex min-h-full flex-col items-center justify-center px-6 py-12 text-center">

          {/* Logo/Icon */}
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-subtle bg-panel shadow-sm">
            <span className="text-3xl font-bold text-txt">A</span>
          </div>

          {/* Hero Text */}
          <h1 className="font-sans text-4xl font-semibold tracking-tighter text-txt md:text-5xl">
            Welcome to AgentArena
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted">
            The ultimate environment for testing, analyzing, and battling AI agents.
            Deploy multiple models simultaneously to compare their reasoning, evaluate structural risks, and determine the optimal output for your workflow.
          </p>

          {/* Feature Tags */}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <span className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-xs font-medium tracking-wide text-muted">
              ⚡ Concurrent Execution
            </span>
            <span className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-xs font-medium tracking-wide text-muted">
              📊 Zod Schema Parsing
            </span>
            <span className="rounded-lg border border-subtle bg-panel px-3 py-1.5 text-xs font-medium tracking-wide text-muted">
              🛡️ Risk Analysis
            </span>
          </div>

        </div>
      </main>
    </div>
  );
}