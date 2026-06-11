"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

const stats = [
  { label: "Active Incidents", value: "2,847", suffix: "" },
  { label: "Avg Response Time", value: "8.4", suffix: "min" },
  { label: "Officers Online", value: "12,500", suffix: "+" },
  { label: "Cases Resolved", value: "98.2", suffix: "%" },
];

const features = [
  {
    icon: "🆘",
    title: "One-Tap SOS",
    desc: "Instant emergency dispatch with auto GPS capture. Police, Ambulance & Fire in seconds.",
    color: "#ef4444",
  },
  {
    icon: "📍",
    title: "Live Tracking",
    desc: "Real-time responder location sharing via encrypted Socket.io streams.",
    color: "#2d8cf0",
  },
  {
    icon: "📋",
    title: "Digital FIR",
    desc: "File, track and export First Information Reports with digital signatures.",
    color: "#10b981",
  },
  {
    icon: "🧠",
    title: "AI Assistant",
    desc: "Smart complaint classification and priority scoring powered by AI.",
    color: "#8b5cf6",
  },
  {
    icon: "🗺️",
    title: "Crime Analytics",
    desc: "City-wide heatmaps, trend charts, and real-time command center view.",
    color: "#f59e0b",
  },
  {
    icon: "🔒",
    title: "Zero-Trust Security",
    desc: "End-to-end encryption, RBAC, audit logs, and tamper detection.",
    color: "#06b6d4",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Ambient background blobs */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 20% 10%, rgba(45,140,240,0.1) 0%, transparent 70%), radial-gradient(ellipse 60% 50% at 80% 80%, rgba(139,92,246,0.08) 0%, transparent 60%)",
        }}
      />

      {/* Navbar */}
      <nav className="navbar px-6 py-3 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-lg font-black"
            style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)" }}
          >
            🛡️
          </div>
          <div>
            <div className="font-bold text-sm text-white">SecureNet</div>
            <div className="text-xs" style={{ color: "var(--clr-text-muted)" }}>NP-SERP</div>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: "var(--clr-text-secondary)" }}>
          <span className="cursor-pointer hover:text-white transition-colors">Features</span>
          <span className="cursor-pointer hover:text-white transition-colors">Docs</span>
          <span className="cursor-pointer hover:text-white transition-colors">Contact</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <button
              className="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
              style={{ color: "var(--clr-text-secondary)", background: "transparent" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--clr-text-secondary)")}
            >
              Login
            </button>
          </Link>
          <Link href="/register">
            <button className="btn-primary text-sm py-2 px-5">
              Register
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 pt-24 pb-16 px-6 text-center max-w-5xl mx-auto">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
          style={{ background: "rgba(45,140,240,0.1)", border: "1px solid rgba(45,140,240,0.3)", color: "#60a5fa" }}
        >
          <span className="status-dot online" />
          Live Platform — Protecting 1.4 Billion Citizens
        </div>

        <h1
          className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight"
          style={{ color: "var(--clr-text-primary)" }}
        >
          India's National
          <br />
          <span className="gradient-text">Emergency Response</span>
          <br />
          <span className="gradient-text-danger">Command Platform</span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "var(--clr-text-secondary)" }}>
          SecureNet NP-SERP unifies Police, Ambulance, and Fire response with real-time dispatch, live tracking, digital FIRs, and AI-powered crime analytics — all in one platform.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <button className="btn-primary text-base px-8 py-3.5 gap-2">
              🆘 Register as Citizen
            </button>
          </Link>
          <Link href="/login">
            <button
              className="px-8 py-3.5 text-base font-semibold rounded-lg transition-all"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid var(--clr-border)",
                color: "var(--clr-text-primary)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
                e.currentTarget.style.borderColor = "var(--clr-border-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                e.currentTarget.style.borderColor = "var(--clr-border)";
              }}
            >
              🔐 Officer Login
            </button>
          </Link>
        </div>
      </section>

      {/* Stats Bar */}
      <section
        className="relative z-10 mx-6 md:mx-auto max-w-4xl rounded-2xl px-8 py-6 mb-20 grid grid-cols-2 md:grid-cols-4 gap-6 glass-card"
        style={{ borderColor: "rgba(45,140,240,0.2)" }}
      >
        {stats.map((stat, i) => (
          <div key={i} className="text-center">
            <div
              className="text-3xl font-black mb-1"
              style={{ color: i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#10b981" }}
            >
              {stat.value}
              <span className="text-lg">{stat.suffix}</span>
            </div>
            <div className="text-xs font-medium uppercase tracking-widest" style={{ color: "var(--clr-text-muted)" }}>
              {stat.label}
            </div>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 max-w-6xl mx-auto mb-24">
        <h2
          className="text-3xl font-bold text-center mb-3"
          style={{ color: "var(--clr-text-primary)" }}
        >
          Built for <span className="gradient-text">Mission-Critical Operations</span>
        </h2>
        <p className="text-center mb-12" style={{ color: "var(--clr-text-secondary)" }}>
          Every module engineered to enterprise-grade standards
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass-card glass-card-hover p-6"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
              >
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-2" style={{ color: "var(--clr-text-primary)" }}>
                {f.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--clr-text-secondary)" }}>
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="relative z-10 border-t px-6 py-8 text-center"
        style={{ borderColor: "var(--clr-border)" }}
      >
        <p className="text-xs" style={{ color: "var(--clr-text-muted)" }}>
          © 2026 SecureNet Technologies — National Public Safety & Emergency Response Platform. All rights reserved.
        </p>
        <p className="text-xs mt-1" style={{ color: "var(--clr-text-muted)" }}>
          Powered by Next.js 15 · Express · MongoDB · Socket.io · AWS
        </p>
      </footer>
    </div>
  );
}
