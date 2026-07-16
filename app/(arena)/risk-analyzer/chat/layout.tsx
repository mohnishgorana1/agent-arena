import React from "react";

// 'export default' hona zaroori hai!
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex h-full flex-1 flex-col overflow-hidden bg-transparent">
      {/* Background and wrapper */}
      <div className="mx-auto flex h-full w-full  flex-col">
        {children}
      </div>
    </main>
  );
}