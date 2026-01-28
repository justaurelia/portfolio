"use client";
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <>
      {/* Name block */}
      <div className="absolute left-[40%] top-[6%] z-20 flex flex-col justify-start items-start">
        <div className="text-7xl font-extrabold text-cyan-600">Aurelia</div>
        <div className="ml-40 text-7xl font-extrabold text-cyan-600">Azarmi</div>
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
      <div className="absolute right-[10%] bottom-[5%] top-[25%] left-[30%] z-0 bg-gray-100 rounded-2xl flex flex-col justify-center items-center gap-5 p-20 shadow-inner">
        <h2 className="mt-5 text-lg text-gray-700 font-semibold">AI-driven Software Maker</h2>
        <div className="text-gray-600 leading-relaxed max-w-lg text-center">
          Trained and shaped in France. Grew and elevated in the US. Driven by a love for software engineering, AI, and — naturally — great pastries.
        </div>

        <Link
          to="/about"
          className="px-6 py-3 rounded-full border-2 border-cyan-600 text-cyan-600 text-sm font-semibold hover:bg-cyan-600 hover:text-white transition"
        >
          My Journey
        </Link>

        <div className="mt-6 space-y-2 flex flex-col justify-center items-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider">Now Building</p>
          <h3 className="text-xl font-semibold text-cyan-600">🚀 Jucosa</h3>
          <p className="text-gray-600 text-sm max-w-md text-center">
            AI-powered bakery management platform for smarter production, cost control, and growth.
          </p>
          <Link to="/work" className="text-cyan-600 font-medium hover:underline">
            Learn more →
          </Link>
        </div>
      </div>
    </>
  );
}
