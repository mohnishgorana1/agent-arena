"use client";

import React, { useState, useEffect } from "react";

export default function UserSetup() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const storedName = localStorage.getItem("agentArena_user");
    if (storedName) {
      setSavedName(storedName);
    }
  }, []);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      localStorage.setItem("agentArena_user", name.trim());
      setSavedName(name.trim());
      setIsModalOpen(false);
      setName("");
    }
  };

  const handleClearName = () => {
    localStorage.removeItem("agentArena_user");
    setSavedName("");
  };

  if (!isMounted) return <div className="h-12"></div>; 

  return (
    <>
      {/* Dynamic Button Area */}
      {savedName ? (
        <div className="flex items-center gap-4 rounded-full border border-subtle bg-panel py-2 pl-4 pr-2">
          <span className="text-sm text-muted">
            Welcome, <span className="font-semibold text-txt">{savedName}</span>
          </span>
          <button
            onClick={handleClearName}
            className="rounded-full bg-subtle px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-txt"
          >
            Change
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsModalOpen(true)}
          className="cursor-pointer rounded-full bg-txt px-6 py-3 text-sm font-medium text-base transition-transform hover:scale-105 shadow-lg shadow-black/10"
        >
          Enter Arena
        </button>
      )}

      {/* Vercel-style Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-all">
          {/* Click outside to close */}
          <div className="absolute inset-0" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="relative w-full max-w-sm scale-100 animate-in fade-in zoom-in-95 flex-col gap-4 rounded-2xl border border-subtle bg-panel p-6 shadow-2xl">
            <h2 className="font-sans text-xl font-semibold tracking-tight text-txt">
              Set Your Identity
            </h2>
            <p className="mt-1 text-sm text-muted">
              Who is commanding the agents today?
            </p>

            <form onSubmit={handleSaveName} className="mt-5 flex flex-col gap-3">
              <input
                type="text"
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full rounded-xl border border-subtle bg-input px-4 py-2.5 text-sm text-txt outline-none transition-all placeholder:text-muted focus:border-muted"
                required
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl bg-subtle px-4 py-2.5 text-sm font-medium text-txt transition-colors hover:opacity-80"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-txt px-4 py-2.5 text-sm font-medium text-base transition-colors hover:opacity-90"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}