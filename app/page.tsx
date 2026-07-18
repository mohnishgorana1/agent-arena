"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Link from "next/link";
import { motion } from "framer-motion";
import { BrainCircuit, ShieldAlert, Layers, ArrowRight, Sparkles, Lock } from "lucide-react";
import { BsGithub, BsTwitterX } from "react-icons/bs";
import Logo from "@/components/Logo";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  };

  return (
    <div className="flex h-[100dvh] w-full flex-col bg-base overflow-hidden selection:bg-indigo-500/20">
      <Navbar />

      <main className="relative flex flex-1 flex-col overflow-y-auto custom-thin-scrollbar">
        {/* Modern Grid Background & Glowing Orbs */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-20"></div>
        <div className="absolute left-1/2 top-0 -z-10 h-[30rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

        <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-6 py-20 text-center lg:py-28">
          
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center w-full"
          >
            {/* New Feature Pill */}
            <motion.div variants={itemVariants} className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-indigo-500 shadow-sm backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Introducing Consensus Engine V1.0</span>
            </motion.div>

            {/* Hero Text */}
            <motion.h1 variants={itemVariants} className="font-sans text-5xl font-black tracking-tighter text-txt md:text-7xl">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-emerald-500">AgentArena</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-muted md:text-[17px]">
              The ultimate environment for testing, analyzing, and battling AI agents. Deploy multiple models simultaneously to evaluate reasoning, compare structural logic, and determine the optimal output for your most complex workflows.
            </motion.p>

            {/* Call to Actions */}
            <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/consensus"
                className="group flex h-11 items-center gap-2 rounded-xl bg-txt px-6 text-[14px] font-bold text-base transition-all hover:scale-105 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
              >
                Enter the Arena 
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="https://github.com/mohnishgorana1/agent-arena"
                target="_blank"
                rel="noreferrer"
                className="flex h-11 items-center justify-center rounded-xl border border-subtle bg-panel px-6 text-[14px] font-semibold text-txt transition-colors hover:bg-subtle"
              >
                View Documentation
              </a>
            </motion.div>
          </motion.div>

          {/* Module Cards Section */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 300, damping: 30 }}
            className="mt-24 grid w-full max-w-4xl grid-cols-1 gap-5 sm:grid-cols-3"
          >
            {/* Active Module: Consensus */}
            <Link href="/consensus" className="group relative flex flex-col items-start gap-4 rounded-2xl border border-subtle bg-panel/50 p-6 text-left transition-all hover:bg-subtle/50 hover:shadow-lg hover:-translate-y-1 backdrop-blur-sm">
              <div className="absolute top-4 right-4 flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div> Live
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-subtle bg-base shadow-sm group-hover:border-indigo-500/30 transition-colors">
                <BrainCircuit className="h-6 w-6 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-txt">Consensus Engine</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">Run concurrent multi-model verification loops (OpenAI, Gemini, Claude) to synthesize the ultimate truth.</p>
              </div>
            </Link>

            {/* Locked Module: Chai GPT */}
            <div className="group relative flex flex-col items-start gap-4 rounded-2xl border border-subtle/50 bg-panel/30 p-6 text-left opacity-70 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <Lock className="h-4 w-4 text-muted/60" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-subtle bg-base/50 grayscale">
                <Layers className="h-6 w-6 text-muted" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-muted line-through decoration-muted/40">Chai GPT</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted/80">Custom engineered chatbot interface designed for advanced workflow automation. (Currently under maintenance).</p>
              </div>
            </div>

            {/* Locked Module: Risk Analyzer */}
            <div className="group relative flex flex-col items-start gap-4 rounded-2xl border border-subtle/50 bg-panel/30 p-6 text-left opacity-70 cursor-not-allowed">
              <div className="absolute top-4 right-4">
                <Lock className="h-4 w-4 text-muted/60" />
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-subtle bg-base/50 grayscale">
                <ShieldAlert className="h-6 w-6 text-muted" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-muted line-through decoration-muted/40">Risk Analyzer</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted/80">Deep-scan structural security, prompt injection vulnerabilities, and response safety. (Currently under maintenance).</p>
              </div>
            </div>
          </motion.div>

        </div>

        <footer className="w-full bg-base py-5 mt-auto z-10">
        <div className="mx-auto flex w-full flex-col items-center justify-between gap-6 px-6 md:flex-row">
          <Logo />
          
          <p className="text-[13px] text-muted">
            &copy; {new Date().getFullYear()} Mohnish Gorana.
          </p>

        </div>
      </footer>
      </main>

      
      
    </div>
  );
}