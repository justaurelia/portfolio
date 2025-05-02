"use client";
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* Name block */}
      <div className="absolute left-[40%] top-[5%] z-20 flex flex-col justify-start items-start">
        <div className="text-6xl font-bold">Aurelia</div>
        <div className="ml-40 text-6xl font-bold">Azarmi</div>
      </div>

      {/* Photo block */}
      <div className="absolute left-[10%] top-0 z-10 p-10">
        <div className="relative w-72 rounded-3xl shadow-[0_20px_50px] shadow-cyan-600/40 overflow-hidden">
          <img
            src="/profile.png"
            alt="Aurelia Azarmi"
            width={300}
            height={0}
            style={{ height: "auto" }}
          />
        </div>
      </div>


      {/* Text block */}
      <div className="absolute right-[10%] bottom-[5%] top-[25%] left-[30%] z-0 bg-gray-300 rounded-2xl flex flex-col justify-center items-center gap-6 p-20">
        <h2 className="text-lg text-gray-600">AI-driven Software Maker & Former Pastry Chef</h2>
        <div className="text-gray-500">
          Building <span className="font-semibold text-primary">PastelarAI</span> to help bakeries run smarter and more efficiently.
          Passionate about design, AI, and of course, great pastries.
        </div>

        <Link
          to="/about"
          className="px-5 py-2 rounded-full border text-sm font-medium hover:bg-primary hover:text-white transition"
        >
          My Journey
        </Link>

        <div className="mt-6 space-y-2 flex flex-col justify-center items-center">
          <p className="text-xs text-gray-400 uppercase tracking-wider">Now Building</p>
          <h3 className="text-xl font-semibold">🚀 PastelarAI</h3>
          <p className="text-gray-500 text-sm">
            AI-powered bakery management platform for smarter production, cost control, and growth.
          </p>
          <Link to="/work" className="text-primary font-medium hover:underline">
            Learn more →
          </Link>
        </div>
      </div>
    </>
  );
}