"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setLogout } from "@/store/authSlice";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import {
  MessageSquare,
  LogOut,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Loader2,
} from "lucide-react";

export default function HomePage() {
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // The Secure Logout Function
  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/auth/logout",
        {},
        { withCredentials: true },
      );
      dispatch(setLogout());
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // State 1: Waiting for the Redux checkAuth to finish
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#030712]">
        <div className="relative flex flex-col items-center gap-4">
          <div className="absolute -inset-4 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 relative z-10" />
          <p className="text-blue-500/80 text-sm font-medium animate-pulse tracking-widest">
            CONNECTING...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#030712] text-white selection:bg-blue-500/30 overflow-hidden">
      {/* 🌌 AMBIENT BACKGROUND EFFECTS */}
      <div className="absolute top-0 z-[-2] h-screen w-screen bg-[#030712] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.15),rgba(255,255,255,0))]"></div>
      <div className="absolute inset-0 z-[-1] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

      {/* 🟢 DYNAMIC NAVBAR */}
      <nav className="fixed top-0 w-full border-b border-white/5 bg-[#030712]/60 p-4 px-6 md:px-12 backdrop-blur-xl z-50 transition-all duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-white">
              VIBE
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
                CHAT
              </span>
            </h1>
          </div>

          {/* Auth Controls */}
          <div>
            {user ? (
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-bold text-gray-200">
                    @{user.username}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Online
                  </span>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 p-[2px] cursor-pointer hover:scale-105 transition-transform">
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-[#030712] text-sm font-bold">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-gray-300 backdrop-blur-md transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                >
                  <span className="hidden sm:inline">Sign Out</span>
                  <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 sm:gap-6">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-400 transition-colors hover:text-white"
                >
                  Log in
                </Link>
                <Link
                  href="/register"
                  className="relative inline-flex items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-gray-950 transition-all hover:scale-105 hover:bg-gray-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🟢 MAIN CONTENT AREA */}
      <main className="flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center">
        {user ? (
          /* --- LOGGED IN DASHBOARD --- */
          <div className="w-full max-w-3xl space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-b from-blue-500 to-indigo-600 p-1 shadow-2xl shadow-blue-500/20">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#030712] text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-indigo-300">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {/* Glowing ring effect */}
              <div className="absolute -inset-2 rounded-full border border-blue-500/30 animate-[spin_4s_linear_infinite]"></div>
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                Session Secured via HTTP-Only
              </div>
              <h2 className="text-4xl font-black tracking-tight sm:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                Welcome back, <br className="sm:hidden" />
                <span className="text-white">{user.username}</span>
              </h2>
              <p className="text-lg text-gray-400 max-w-xl mx-auto">
                Your end-to-end encrypted session is locked in. Ready to drop
                into the servers and start vibing?
              </p>
            </div>

            <div className="pt-4 flex justify-center">
              <button 
                onClick={() => router.push("/dashboard")}
              className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-blue-500/25 ring-1 ring-white/20 transition-all hover:scale-105 hover:shadow-blue-500/40 hover:ring-white/40">
                <Zap className="h-5 w-5 text-blue-200" />
                Enter Global Chat
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ) : (
          /* --- LOGGED OUT HERO SECTION --- */
          <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            {/* Top Pill Badge */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm text-gray-300 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-blue-400" />
                <span className="font-medium">VibeChat v2.0 is now live</span>
              </div>
            </div>

            <h2 className="text-5xl font-black tracking-tight sm:text-7xl md:text-8xl">
              Connect with the <br className="hidden sm:block" />
              <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-400 to-cyan-400 pb-2">
                Universe.
                {/* Text Glow */}
                <span className="absolute inset-0 blur-2xl bg-gradient-to-r from-blue-500 to-cyan-400 opacity-20 z-[-1]"></span>
              </span>
            </h2>

            <p className="mx-auto max-w-2xl text-lg sm:text-xl text-gray-400 leading-relaxed">
              Experience ultra-fast, real-time messaging secured by
              enterprise-grade HTTP-only sessions. Build communities, share
              moments, and vibe instantly.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 w-full sm:w-auto px-6 sm:px-0">
              <Link
                href="/register"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-gray-950 transition-all hover:scale-105 hover:bg-gray-100"
              >
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-8 py-4 text-lg font-bold text-white backdrop-blur-sm transition-all hover:bg-white/10"
              >
                Sign In
              </Link>
            </div>

            {/* Feature Highlights beneath hero */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/5 pt-10 text-left">
              {[
                { title: "Lightning Fast", desc: "Real-time WebSockets" },
                { title: "Bank-Grade Security", desc: "HTTP-Only Cookies" },
                { title: "Global Scale", desc: "Connect without limits" },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 backdrop-blur-sm"
                >
                  <div className="font-bold text-gray-200">{feature.title}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {feature.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
