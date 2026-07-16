import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Coffee } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center p-4 lg:p-8 bg-base overflow-hidden">
      
      {/* 🌟 OUTER BACKGROUND SHAPES */}
      <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full border-[60px] border-subtle pointer-events-none" />
      <div className="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 h-[600px] w-[600px] rounded-full border-[60px] border-subtle pointer-events-none" />

      {/* 📦 MAIN CARD WRAPPER */}
      <div className="relative z-10 flex w-full max-w-5xl overflow-hidden rounded-2xl bg-panel shadow-2xl border border-subtle">
        
        {/* ✨ LEFT PANEL: Abstract Shapes & Bada Message */}
        <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-base/50 p-12 text-txt lg:flex">
          
          {/* Abstract Circular Shapes */}
          <div className="absolute -left-16 -top-16 h-80 w-80 rounded-full border-[32px] border-subtle" />
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full border-[40px] border-subtle" />
          <div className="absolute bottom-32 left-12 h-40 w-40 rounded-full bg-subtle/50" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-txt text-base shadow-md">
              <Coffee className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">Agent Arena</span>
          </div>

          {/* Big Welcome Message with Enhanced Paragraph */}
          <div className="relative z-10 mt-12 mb-auto">
            <h1 className="mb-6 text-6xl font-bold leading-tight tracking-tight text-txt">
              Hello, <br />
              welcome!
            </h1>
            <p className="max-w-md text-base font-medium text-muted leading-relaxed">
              Step into the future of AI-powered development. Grab your favorite cup of chai, and let Agent Arena help you write cleaner code, debug faster, and build scalable applications with ease.
            </p>
          </div>
        </div>

        {/* 📦 RIGHT PANEL: Form Area */}
        <div className="flex w-full flex-col items-center justify-center p-8 sm:p-12 lg:w-1/2">
          <div className="w-full max-w-[320px] flex flex-col items-center">
            
            {/* Mobile-only Logo */}
            <div className="mb-8 flex items-center justify-center lg:hidden">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-subtle text-txt">
                <Coffee className="h-8 w-8" />
              </div>
            </div>

            {/* ✨ CUSTOM HEADER (Center Aligned) */}
            <div className="mb-8 w-full text-center">
              <h2 className="mb-2 text-2xl font-bold text-txt">
                Sign in
              </h2>
              <p className="text-sm font-medium text-muted">
                Continue with your Google account
              </p>
            </div>

            {/* 🤖 CLERK COMPONENT (Center Aligned) */}
            <div className="flex w-full justify-center">
              <SignIn />
            </div>

            {/* 👇 CUSTOM FOOTER (Center Aligned) */}
            <div className="mt-8 flex w-full flex-col items-center space-y-4">
              <p className="text-center text-sm font-medium text-muted">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="font-bold text-txt underline-offset-4 transition-colors hover:underline"
                >
                  Sign up
                </Link>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}