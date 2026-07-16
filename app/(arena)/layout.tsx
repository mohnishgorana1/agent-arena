import Sidebar from "@/components/Sidebar";

export default function ArenaLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="flex h-[100dvh] w-full relative z-0 overflow-hidden bg-base">
            <Sidebar />
            <div className="flex-1 h-full overflow-hidden relative">
                {children}
            </div>
        </main>
    );
}