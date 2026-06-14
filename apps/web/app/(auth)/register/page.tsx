"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/Button";

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
    <>
      <div className="mb-10">
        <h1 className="font-heading font-black text-3xl uppercase tracking-tighter text-white mb-2">
          REQUEST ACCESS
        </h1>
        <p className="text-sm text-muted font-medium">
          Submit clearance request for SecureNet NP-SERP.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 px-1">
        {steps.map((s, i) => (
          <div key={s} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full h-[2px] transition-all duration-300"
              style={{ background: i <= step ? "var(--clr-accent, #F59E0B)" : "rgba(255,255,255,0.1)" }}
            />
            <span
              className="text-[10px] font-heading font-bold uppercase tracking-wider"
              style={{ color: i === step ? "var(--clr-accent, #F59E0B)" : "var(--clr-text-muted, #64748B)" }}
            >
              {s}
            </span>
          </div>
        ))}
      </div>

      <div className="glass-card p-8">
        {error && (
          <div className="px-4 py-3 rounded-md text-xs font-bold font-heading tracking-wider uppercase bg-danger/10 border border-danger/30 text-danger mb-6">
            [ERROR] {error}
          </div>
        )}

        {step === 0 && (
          <div className="flex flex-col gap-6">
            <div className="form-control">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" placeholder="you@securenet.gov"
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
            <Button className="w-full mt-2" onClick={handleNext}>
              PROCEED TO PERSONAL DETAILS
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="form-control">
                <label className="form-label">First Name</label>
                <input className="form-input" placeholder="Operator"
                  value={form.firstName} onChange={(e) => update("firstName", e.target.value)} />
              </div>
              <div className="form-control">
                <label className="form-label">Last Name</label>
                <input className="form-input" placeholder="Name"
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
            <div className="flex gap-4 mt-2">
              <Button variant="outline" onClick={() => setStep(0)} className="w-1/3">
                BACK
              </Button>
              <Button onClick={handleNext} className="w-2/3">
                PROCEED TO REVIEW
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h3 className="font-heading font-bold text-lg uppercase tracking-wider text-white">Review Clearance Details</h3>
            
            <div className="rounded-md p-5 space-y-4 text-sm bg-surface border border-surface-border">
              {[
                ["Name", `${form.firstName} ${form.lastName}`],
                ["Email", form.email],
                ["Phone", form.phone],
                ["ID", `${form.govtIdType}: ${form.govtIdNumber || "—"}`],
                ["Role", form.role],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between border-b border-surface-border/50 pb-2 last:border-0 last:pb-0">
                  <span className="text-muted font-heading font-bold uppercase text-[10px] tracking-wider">{label}</span>
                  <span className="font-medium text-white">{val}</span>
                </div>
              ))}
            </div>
            
            <div className="text-[11px] px-4 py-3 rounded-md bg-accent/10 border border-accent/20 text-accent font-medium">
              [NOTICE] Your Govt. ID will be reviewed by a Control Room Operator for verification before full clearance is granted.
            </div>
            
            <div className="flex gap-4 mt-2">
              <Button variant="outline" onClick={() => setStep(1)} className="w-1/3">
                BACK
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="w-2/3">
                {loading ? "SUBMITTING..." : "CONFIRM & SUBMIT"}
              </Button>
            </div>
          </div>
        )}
      </div>

      <p className="text-center text-sm mt-8 text-muted">
        Already have clearance?{" "}
        <Link href="/login" className="font-heading font-bold text-accent uppercase tracking-widest hover:text-white transition-colors">
          INITIATE LOGIN
        </Link>
      </p>
    </>
  );
}
