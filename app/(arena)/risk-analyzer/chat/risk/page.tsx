"use client";

import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, RefreshCcw, AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import ChatInput from "@/components/ChatInput";
import LockedState from "@/components/LockedState";

interface RiskResult {
  isValidScenario: boolean;
  agentMessage: string;
  overallRisk: "None" | "Low" | "Medium" | "High";
  risks?: Array<{ description: string; likelihood: "Low" | "Medium" | "High"; impact: "Low" | "Medium" | "High"; recommendation: string; }>;
  summary: string;
}

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const itemVariants = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } } };

export default function RiskAnalyzerPage() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [results, setResults] = useState<{ gpt4o: RiskResult; gpt4oMini: RiskResult } | null>(null);

  const handleSendMessage = async (message: string) => {
    setCurrentPrompt(message);
    setIsProcessing(true);
    setResults(null);
    try {
      const response = await axios.post("/api/risk-analyzer/risk", { message });
      setResults(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "High": return "text-red-500 border-red-500/30 bg-red-500/10";
      case "Medium": return "text-amber-500 border-amber-500/30 bg-amber-500/10";
      case "Low": return "text-emerald-500 border-emerald-500/30 bg-emerald-500/10";
      default: return "text-muted border-subtle bg-subtle";
    }
  };

  const IS_LOCKED = true;

  if (IS_LOCKED) {
    return <LockedState moduleName="Risk Analyzer" />;
  }


  return (
    <div className="flex h-full flex-col bg-base overflow-hidden">

      <header className="flex h-14 shrink-0 items-center justify-between border-b border-subtle bg-base px-6">
        <div className="flex items-center gap-3 text-txt">
          <ShieldAlert className="h-4 w-4" />
          <div className="flex items-center gap-2 font-sans text-[13px] font-medium tracking-tight">
            <span>Risk Analyzer</span>
            <span className="text-muted">/</span>
            <span className="text-muted">Dual Execution</span>
          </div>
        </div>
        <button onClick={() => { setResults(null); setCurrentPrompt(""); setIsProcessing(false); }} className="group flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-muted hover:bg-subtle hover:text-txt transition-colors">
          <RefreshCcw className="h-3 w-3 transition-transform group-active:rotate-180" /> Clear Workspace
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="mx-auto w-full max-w-[1600px] h-full">

          {!isProcessing && !results && !currentPrompt && (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-xl border border-subtle bg-panel p-4 shadow-sm">
                <Activity className="h-6 w-6 text-muted" strokeWidth={2} />
              </div>
              <h2 className="text-[15px] font-semibold text-txt">Awaiting Execution Context</h2>
              <p className="mt-2 max-w-sm text-[13px] text-muted">Provide an architectural plan, deployment scenario, or business logic.</p>
            </div>
          )}

          {(isProcessing || results) && currentPrompt && (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col gap-6 pb-12">
              <motion.div variants={itemVariants} className="w-full">
                <div className="rounded-xl border border-subtle bg-panel p-4 shadow-sm">
                  <span className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-muted">Execution Context</span>
                  <p className="text-[14px] leading-relaxed text-txt">{currentPrompt}</p>
                </div>
              </motion.div>

              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <AnimatePresence mode="popLayout">
                  {isProcessing ? (
                    <>
                      {[1, 2].map((key) => (
                        <motion.div key={`skeleton-${key}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col rounded-xl border border-subtle bg-base overflow-hidden">
                          <div className="flex items-center justify-between border-b border-subtle bg-panel px-5 py-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-subtle"></div>
                            <div className="h-4 w-16 animate-pulse rounded bg-subtle"></div>
                          </div>
                          <div className="flex-1 p-5">
                            <div className="mb-6 space-y-2">
                              <div className="h-3 w-full animate-pulse rounded bg-subtle"></div>
                              <div className="h-3 w-5/6 animate-pulse rounded bg-subtle"></div>
                            </div>
                            <div className="space-y-3">
                              {[1, 2].map((s) => (
                                <div key={s} className="rounded-lg border border-subtle bg-panel p-4"><div className="h-10 w-full animate-pulse bg-subtle rounded"></div></div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : results ? (
                    <>
                      {[{ model: "ChatGPT", data: results.gpt4o }, { model: "Gemini", data: results.gpt4oMini }].map(({ model, data }) => (
                        <motion.div key={model} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="flex flex-col rounded-xl border border-subtle bg-base shadow-lg overflow-hidden">
                          <div className="flex items-center justify-between border-b border-subtle bg-panel px-5 py-3">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                              <span className="font-mono text-[13px] font-medium text-txt">{model}</span>
                            </div>
                            {data.isValidScenario && <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${getRiskBadge(data.overallRisk)}`}>{data.overallRisk} RISK</span>}
                          </div>

                          <div className="flex-1 p-5">
                            {!data.isValidScenario ? (
                              <div className="flex h-full flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/10 p-6 text-center">
                                <AlertTriangle className="mb-3 h-6 w-6 text-red-500" />
                                <p className="text-[13px] font-medium text-red-500">{data.agentMessage}</p>
                              </div>
                            ) : (
                              <>
                                <p className="mb-5 text-[13px] leading-relaxed text-muted">{data.summary}</p>
                                <div className="flex flex-col gap-3">
                                  {data.risks?.map((risk, idx) => (
                                    <div key={idx} className="flex flex-col gap-2 rounded-lg border border-subtle bg-panel p-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <span className="font-sans text-[14px] font-medium text-txt">{risk.description}</span>
                                        <div className="flex shrink-0 gap-1.5">
                                          <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${getRiskBadge(risk.likelihood)}`} title="Likelihood">L: {risk.likelihood}</span>
                                          <span className={`rounded border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest ${getRiskBadge(risk.impact)}`} title="Impact">I: {risk.impact}</span>
                                        </div>
                                      </div>
                                      <div className="mt-1 flex items-start gap-2 text-[12.5px] leading-relaxed text-muted">
                                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-muted"></span>
                                        <span>{risk.recommendation}</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <ChatInput placeholder="Enter execution context for analysis..." onSendMessage={handleSendMessage} isLoading={isProcessing} />
    </div>
  );
}