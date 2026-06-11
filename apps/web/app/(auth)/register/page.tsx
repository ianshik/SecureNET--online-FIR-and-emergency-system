"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

const steps = ["Account Info", "Personal Details", "Review"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CITIZEN",
    govtIdType: "AADHAAR",
    govtIdNumber: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleNext = () => {
    setError("");
    if (step === 0) {
      if (!form.email || !form.password) return setError("Email and password required.");
      if (form.password !== form.confirmPassword) return setError("Passwords do not match.");
    }
    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.phone) return setError("All fields required.");
    }
    setStep((s) => s + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: form.role,
        }),
      });
      login(res.data, res.data.token);
      router.push("/citizen/dashboard");
    } catch (err: any) {
      setError(err.message || "Registration failed");
      setStep(0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-in">
      <div className="text-center mb-8">
        <div
          className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-2xl mb-4"
          style={{ background: "linear-gradient(135deg, #059669, #2563eb)", boxShadow: "0 0 24px rgba(5,150,105,0.3)" }}
        >
          🛡️
        </div>
        <h1 className="text-2xl font-black" style={{ color: "var(--clr-text-primary)" }}>
          Create Account
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--clr-text-secondary)" }}>
          Register on SecureNet NP-SERP
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 px-1">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full h-1 rounded-full transition-all duration-300"
              style={{ background: i <= step ? "var(--clr-accent)" : "rgba(255,255,255,0.1)" }}
            />
            <span
              className="text-xs font-medium"
              style={{ color: i === step ? "#60a5fa" : "var(--clr-text-muted)" }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        {error && (
          <div
            className="px-4 py-3 rounded-lg text-sm font-medium mb-5"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}
          >
            ⚠️ {error}
          </div>
        )}

        {step === 0 && (
          <div className="flex flex-col gap-5">
            <div className="form-control">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@example.com"
                value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="form-control">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => update("password", e.target.value)} />
            </div>
            <div className="form-control">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" placeholder="Re-enter password"
                value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} />
            </div>
            <button className="btn-primary w-full mt-1" onClick={handleNext}>
              Continue →
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="form-label">First Name</label>
                <input className="form-input" placeholder="John"
                  value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </div>
              <div className="form-control">
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="Doe"
                  value={form.lastName} onChange={(e) => update("lastName", e.target.value)} />
              </div>
            </div>
            <div className="form-control">
              <label className="form-label">Phone Number</label>
              <input className="form-input" type="tel" placeholder="+91 98765 43210"
                value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            </div>
            <div className="form-control">
              <label className="form-label">Govt. ID Type</label>
              <select className="form-input" value={form.govtIdType} onChange={(e) => update("govtIdType", e.target.value)}>
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="PASSPORT">Passport</option>
              </select>
            </div>
            <div className="form-control">
              <label className="form-label">Govt. ID Number</label>
              <input className="form-input" placeholder="XXXX-XXXX-XXXX"
                value={form.govtIdNumber} onChange={(e) => update("govtIdNumber", e.target.value)} />
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setStep(0)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--clr-border)", color: "var(--clr-text-secondary)" }}
              >
                ← Back
              </button>
              <button className="flex-[2] btn-primary" onClick={handleNext}>Continue →</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-5">
            <h3 className="font-bold text-base" style={{ color: "var(--clr-text-primary)" }}>Review Your Details</h3>
            <div
              className="rounded-xl p-5 space-y-3 text-sm"
              style={{ background: "rgba(7,20,38,0.8)", border: "1px solid var(--clr-border)" }}
            >
              {[
                ["Name", `${form.firstName} ${form.lastName}`],
                ["Email", form.email],
                ["Phone", form.phone],
                ["ID", `${form.govtIdType}: ${form.govtIdNumber || "—"}`],
                ["Role", form.role],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: "var(--clr-text-muted)" }}>{label}</span>
                  <span className="font-medium" style={{ color: "var(--clr-text-primary)" }}>{val}</span>
                </div>
              ))}
            </div>
            <div
              className="text-xs px-3 py-2.5 rounded-lg"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#34d399" }}
            >
              ℹ️ Your Govt. ID will be reviewed by a Control Room Operator for verification.
            </div>
            <div className="flex gap-3 mt-1">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--clr-border)", color: "var(--clr-text-secondary)" }}
              >
                ← Back
              </button>
              <button className="flex-[2] btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating Account…" : "✅ Create Account"}
              </button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm mt-5" style={{ color: "var(--clr-text-secondary)" }}>
        Already have an account?{" "}
        <Link href="/login" className="font-semibold" style={{ color: "#60a5fa" }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
