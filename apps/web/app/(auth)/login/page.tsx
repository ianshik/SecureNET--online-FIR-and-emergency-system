"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const ROLE_PORTALS = [
  { role: "CITIZEN",      label: "Citizen",       icon: "👤", color: "#10b981" },
  { role: "OFFICER",      label: "Officer",        icon: "👮", color: "#2d8cf0" },
  { role: "CONTROL_ROOM", label: "Control Room",   icon: "🖥️", color: "#8b5cf6" },
  { role: "AUTHORITY",    label: "Authority",      icon: "⚖️", color: "#f59e0b" },
];

const DASH_MAP: Record<string, string> = {
  CITIZEN: "/citizen/dashboard",
  OFFICER: "/officer/dashboard",
  CONTROL_ROOM: "/control-room/dashboard",
  AUTHORITY: "/authority/dashboard",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      login(res.data, res.data.token);
      router.push(DASH_MAP[res.data.role] || "/citizen/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-in">
      {/* Logo */}
      <div className="text-center mb-8">
        <div
          className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mb-4"
          style={{ background: "linear-gradient(135deg, #2563eb, #7c3aed)", boxShadow: "0 0 24px rgba(37,99,235,0.4)" }}
        >
          🛡️
        </div>
        <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
          Welcome Back
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--clr-text-secondary)" }}>
          SecureNet NP-SERP — Sign in to your account
        </p>
      </div>

      {/* Card */}
      <div className="glass-card p-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="form-control">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div className="form-control">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
            >
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full mt-1" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Signing In…
              </span>
            ) : (
              "Sign In →"
            )}
          </button>
        </form>

        <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--clr-border)" }}>
          <p className="text-xs text-center mb-4" style={{ color: "var(--clr-text-muted)" }}>
            Role-based portals
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_PORTALS.map((p) => (
              <div
                key={p.role}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium"
                style={{
                  background: `${p.color}10`,
                  border: `1px solid ${p.color}25`,
                  color: p.color,
                }}
              >
                <span>{p.icon}</span>
                {p.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-center text-sm mt-5" style={{ color: "var(--clr-text-secondary)" }}>
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-semibold" style={{ color: "#60a5fa" }}>
          Register now
        </Link>
      </p>

      {/* Demo credentials */}
      <div
        className="mt-4 p-4 rounded-xl text-xs"
        style={{ background: "rgba(45,140,240,0.05)", border: "1px solid rgba(45,140,240,0.15)", color: "var(--clr-text-muted)" }}
      >
        <strong style={{ color: "var(--clr-text-secondary)" }}>Demo credentials:</strong>
        <div className="mt-1 space-y-0.5">
          <div>citizen@securenet.com / password123</div>
          <div>officer@securenet.com / password123</div>
          <div>admin@securenet.com / password123</div>
        </div>
      </div>
    </div>
  );
}
