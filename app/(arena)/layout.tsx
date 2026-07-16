import Sidebar from "@/components/Sidebar";


export default function ArenaLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main className="w-full flex flex-col flex-1 relative z-0">
            <Sidebar />
            {children}
        </main>
    );
}