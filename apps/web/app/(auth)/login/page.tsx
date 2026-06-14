"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";
import { ShieldAlert } from "lucide-react";

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
  const [isAdminMode, setIsAdminMode] = useState(false);
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
      
      const role = res.data.role;
      
      if (isAdminMode && role !== "AUTHORITY") {
        throw new Error("Invalid credentials");
      }
      if (!isAdminMode && role === "AUTHORITY") {
        throw new Error("Invalid credentials");
      }

      login(res.data, res.data.token);
      router.push(DASH_MAP[role] || "/citizen/dashboard");
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="mb-10 flex justify-between items-start">
        <div>
          <h1 className={`font-heading font-black text-3xl uppercase tracking-tighter mb-2 ${isAdminMode ? 'text-danger' : 'text-white'}`}>
            {isAdminMode ? 'ADMIN CLEARANCE' : 'AUTHENTICATE'}
          </h1>
          <p className="text-sm text-muted font-medium">
            {isAdminMode 
              ? 'Enter master credentials to access the Authority network.' 
              : 'Enter your credentials to access the secure network.'}
          </p>
        </div>
        {isAdminMode && <ShieldAlert className="w-10 h-10 text-danger animate-pulse opacity-50" />}
      </div>

      <div className={`glass-card p-8 transition-colors duration-500 ${isAdminMode ? 'border-danger/30 shadow-[0_0_30px_rgba(220,38,38,0.15)]' : ''}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="form-control">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className={`form-input ${isAdminMode ? 'focus:border-danger focus:ring-danger/20' : ''}`}
              placeholder={isAdminMode ? "admin@securenet.gov" : "operator@securenet.gov"}
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
              className={`form-input ${isAdminMode ? 'focus:border-danger focus:ring-danger/20' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="px-4 py-3 rounded-md text-xs font-bold font-heading tracking-wider uppercase bg-danger/10 border border-danger/30 text-danger">
              [ERROR] {error}
            </div>
          )}

          <Button type="submit" className={`w-full mt-2 ${isAdminMode ? 'bg-danger hover:bg-danger/90 text-white' : ''}`} disabled={loading}>
            {loading ? "AUTHENTICATING..." : "INITIATE LOGIN"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-surface-border text-center">
          <button 
            type="button"
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              setError("");
            }}
            className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest hover:text-white transition-colors"
          >
            SWITCH TO {isAdminMode ? 'STANDARD' : 'ADMIN'} PORTAL
          </button>
        </div>
      </div>

      <p className="text-center text-sm mt-8 text-muted">
        No clearance?{" "}
        <Link href="/register" className="font-heading font-bold text-accent uppercase tracking-widest hover:text-white transition-colors">
          REQUEST ACCESS
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-8 p-5 rounded-md text-xs bg-surface border border-surface-border text-muted">
        <strong className="text-white font-heading tracking-widest uppercase">TEST CLEARANCES:</strong>
        <div className="mt-3 space-y-1.5 font-mono">
          <div><span className="text-accent">CIT</span>: citizen@securenet.com / password123</div>
          <div><span className="text-accent">OFC</span>: officer@securenet.com / password123</div>
          <div><span className="text-accent">ADM</span>: admin@securenet.com / password123</div>
        </div>
      </div>
    </>
  );
}
