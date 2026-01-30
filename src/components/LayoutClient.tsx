"use client";

import Footer from "./Footer";
import Header from "./Header";
import { useRef, useState, useLayoutEffect } from "react";

function useElementHeight(ref: React.RefObject<HTMLElement>) {
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(() => {
      setHeight(ref.current?.offsetHeight ?? 0);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return height;
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);

  const headerHeight = useElementHeight(headerRef);
  const footerHeight = useElementHeight(footerRef);

  const mainHeight = `calc(100vh - ${headerHeight}px - ${footerHeight}px)`;

  return (
    <div
      className="h-full w-full flex flex-col min-h-screen"
      style={{
        background: "linear-gradient(180deg, var(--c-ink) 0%, var(--c-blue) 100%)",
      }}
    >
      <div ref={headerRef} className="sticky top-0 z-50">
        <Header />
      </div>
      <main
        className="p-8 mx-auto w-full overflow-auto relative text-porcelain"
        style={{ height: mainHeight }}
      >
        {children}
      </main>
      <div ref={footerRef} className="sticky bottom-0 z-50">
        <Footer />
      </div>
    </div>
  );
}
