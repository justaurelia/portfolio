"use client";

import Footer from "./Footer";
import Header from "./Header";

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="h-full w-full flex flex-col min-h-screen"
      style={{
        minHeight: "100dvh",
        background: "linear-gradient(180deg, var(--c-ink) 0%, var(--c-blue) 100%)",
      }}
    >
      <header className="sticky top-0 z-50 shrink-0">
        <Header />
      </header>
      <main className="flex-1 min-h-0 min-w-0 flex flex-col p-8 mx-auto w-full overflow-auto relative text-porcelain">
        {children}
      </main>
      <footer className="shrink-0">
        <Footer />
      </footer>
    </div>
  );
}
