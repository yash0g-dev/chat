import React from "react";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#000000] p-4 font-sans text-white antialiased">
      {/* 1. NAVIGATION BAR (Leftmost Dock) */}
      <aside className="flex flex-col items-center justify-between w-20 bg-[#0B0B0C] rounded-3xl py-6 mr-4 border border-zinc-800/20">
        <div className="flex flex-col items-center gap-4 w-full">
          {/* Logo / Branding App Icon */}
          <div className="h-12 w-12 rounded-2xl bg-[#E2F1AF] text-black flex items-center justify-center font-black text-xl shadow-lg">
            S
          </div>
          <hr className="w-8 border-zinc-800 my-2" />

          {/* Workspace Item (Active Example) */}
          <button className="relative group h-12 w-12 rounded-2xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-xs font-semibold text-zinc-400 hover:text-white transition-all duration-200">
            ICG
            <span className="absolute left-0 w-1 h-6 bg-white rounded-r-md hidden group-focus:block" />
          </button>
        </div>

        {/* Settings Button */}
        <button className="h-10 w-10 text-zinc-500 hover:text-white transition-colors">
          {/* Settings Icon */}
          ⚙️
        </button>
      </aside>

      {/* 2. CHAT LIST SIDEBAR */}
      <section className="w-80 bg-[#0B0B0C] rounded-3xl p-4 mr-4 flex flex-col border border-zinc-800/20">
        <h1 className="text-xl font-bold tracking-tight px-2 mb-4">Chats</h1>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {/* Active Chat Item Wrapper */}
          <div className="flex items-center gap-3 p-3 bg-[#1C1C1E] rounded-2xl cursor-pointer transition-all duration-150">
            <div className="relative h-11 w-11 rounded-full bg-zinc-700 flex-shrink-0">
              {/* Online indicator badge */}
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-[#1C1C1E]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-semibold truncate">ICG chat</p>
              </div>
              <p className="text-xs text-zinc-400 truncate">
                Jaden: Let's discuss this tom...
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN CHAT WORKSPACE SECTION */}
      <main className="flex-1 bg-[#0B0B0C] rounded-3xl border border-zinc-800/20 flex flex-col overflow-hidden mr-4">
        {/* Chat Top Header Context Info */}
        <div className="p-4 border-b border-zinc-900 flex justify-between items-center bg-[#0B0B0C]">
          <div>
            <h2 className="text-lg font-bold">ICG chat</h2>
          </div>
          {/* Audio/Video utilities calling liveKitToken route */}
          <div className="flex gap-2">
            <button className="p-2.5 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all">
              📹
            </button>
            <button className="p-2.5 bg-zinc-900 rounded-xl text-zinc-400 hover:text-white transition-all">
              📞
            </button>
          </div>
        </div>

        {/* Scrollable Message Feed Thread */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Media Header Visual Banner element inside chat view */}
          <div className="w-full h-48 rounded-2xl overflow-hidden bg-zinc-800 shadow-inner relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0C] to-transparent opacity-60" />
            <div className="absolute bottom-4 left-4 font-bold text-lg">
              Project Board Banner
            </div>
          </div>

          {/* Inline Mid-aligned Timestamp System Alert Label */}
          <div className="flex justify-center my-4">
            <span className="bg-zinc-900/60 text-zinc-400 text-[11px] px-3 py-1 rounded-full border border-zinc-800/30">
              9 Sep 2026
            </span>
          </div>

          {/* Incoming User Message Wrapper Block */}
          <div className="flex gap-3 max-w-2xl items-start">
            <div className="h-9 w-9 rounded-full bg-zinc-700 flex-shrink-0" />
            <div className="bg-transparent">
              <div className="flex items-baseline gap-2">
                <span className="text-sm font-semibold text-zinc-200">
                  Conner Garcia
                </span>
                <span className="text-[10px] text-zinc-500">6:25 pm</span>
              </div>
              <p className="text-sm text-zinc-300 mt-1 leading-relaxed">
                Hey guys! Don't forget about our meeting next week!
              </p>
            </div>
          </div>
        </div>

        {/* Baseline Input Dock Wrapper */}
        <div className="p-4 bg-[#0B0B0C]">
          <div className="bg-[#1C1C1E] rounded-2xl p-2 flex items-center border border-zinc-800/30">
            <button className="p-2 text-zinc-400 hover:text-white">📎</button>
            <input
              type="text"
              placeholder="Write a message..."
              className="w-full bg-transparent border-0 outline-none text-sm px-2 text-zinc-100 placeholder-zinc-500 focus:ring-0"
            />
            <button className="p-2 text-zinc-400 hover:text-white">😊</button>
          </div>
        </div>
      </main>

      {/* 4. CONTEXT / DETAIL SIDEBAR (Rightmost Block) */}
      <aside className="w-72 flex flex-col gap-4">
        {/* Members Component Container */}
        <div className="flex-1 bg-[#0B0B0C] rounded-3xl p-4 border border-zinc-800/20 overflow-y-auto">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4 px-1">
            Members
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-700" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Richard Wilson</p>
              </div>
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">
                Admin
              </span>
            </div>
          </div>
        </div>

        {/* Storage / File Management Container */}
        <div className="h-64 bg-[#0B0B0C] rounded-3xl p-4 border border-zinc-800/20 flex flex-col justify-between">
          <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider px-1">
            Shared Content
          </h3>
          <div className="space-y-2 flex-1 mt-4">
            <div className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-xl cursor-pointer hover:bg-zinc-900 transition-all">
              <span className="text-sm text-zinc-300">🖼️ Photos & Media</span>
              <span className="text-xs text-zinc-500">115 files</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
