"use client";
import ChatBar from "../components/ChatBar";

export default function Home() {
  return (
    <div className="h-full flex flex-col max-w-2xl mx-auto px-6">
      {/* Body */}
      <section className="text-center mb-10 flex-shrink-0">
        <h2 className="text-2xl md:text-3xl font-semibold text-porcelain">
          Talk to my work.
        </h2>
        <p className="mt-2 text-porcelain/80 leading-relaxed max-w-lg mx-auto">
          Real answers. Real work.
        </p>
      </section>

      {/* Large prominent chat input bar - fills remaining height */}
      <div id="chat" className="flex-1 min-h-0 flex flex-col">
        <ChatBar />
        <p className="mt-3 text-center text-sm text-porcelain/55 flex-shrink-0 font-light italic">
          Built to answer your first questions.
        </p>
        <p className="mt-1 text-center text-[10px] text-porcelain/40 flex-shrink-0">
          Questions may be stored to improve this experience.
        </p>
      </div>
    </div>
  );
}
