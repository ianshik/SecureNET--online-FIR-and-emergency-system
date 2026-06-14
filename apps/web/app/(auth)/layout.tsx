import { Shield, Activity, Lock, Database } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex bg-black text-foreground font-sans">
      {/* Left side - Image & Cinematic Info */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface flex-col justify-center border-r border-surface-border overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50 mix-blend-luminosity scale-105"
          style={{ 
            backgroundImage: "url('/images/pexels-ander-maso-lord-ander-m-2147531762-29856791.jpg')",
            backgroundPosition: "center 20%" 
          }}
        />
        
        {/* Heavy Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/20 via-black/50 to-black" />
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/80 via-transparent to-black" />

        <div className="relative z-10 p-12 xl:p-20 w-full">
          <div className="mb-8 slide-in">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-accent/10 border border-accent/20 text-accent text-[10px] font-heading font-bold tracking-widest uppercase mb-8 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              SecureNet Alpha-01 Live
            </span>
            
            <Shield className="w-16 h-16 text-white mb-8 opacity-90 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            
            <h2 className="font-heading font-black text-5xl xl:text-7xl uppercase tracking-tighter text-white leading-[0.9] mb-6 drop-shadow-xl">
              Command <br />
              <span className="text-accent">Center</span>
            </h2>
            
            <p className="text-gray-300 font-medium text-sm xl:text-base leading-relaxed max-w-md mb-10">
              The National Emergency Response Platform (NP-SERP). A unified, high-speed interface for Police, Medical, and Fire dispatch operations across the grid. Authorized personnel only.
            </p>
            
            <div className="grid grid-cols-2 gap-6 max-w-md">
               <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-accent bg-gradient-to-r from-accent/5 to-transparent py-1">
                 <div className="flex items-center gap-1.5 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">
                   <Lock className="w-3 h-3" /> Protocol
                 </div>
                 <p className="text-xs font-mono text-white">Zero-Trust Auth</p>
               </div>
               <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-[#3b82f6] bg-gradient-to-r from-[#3b82f6]/5 to-transparent py-1">
                 <div className="flex items-center gap-1.5 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">
                   <Database className="w-3 h-3" /> Encryption
                 </div>
                 <p className="text-xs font-mono text-white">AES-256 GCM</p>
               </div>
               <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-success bg-gradient-to-r from-success/5 to-transparent py-1">
                 <div className="flex items-center gap-1.5 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">
                   <Activity className="w-3 h-3" /> Status
                 </div>
                 <p className="text-xs font-mono text-success">Operational</p>
               </div>
               <div className="flex flex-col gap-1.5 pl-3 border-l-2 border-danger bg-gradient-to-r from-danger/5 to-transparent py-1">
                 <div className="flex items-center gap-1.5 text-[10px] font-heading font-bold text-muted uppercase tracking-widest">
                   <Shield className="w-3 h-3" /> Clearance
                 </div>
                 <p className="text-xs font-mono text-white">Level 4 Required</p>
               </div>
            </div>
          </div>
          
          <div className="w-full h-px bg-white/10 mt-12 mb-6" />
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest opacity-60">
            Unauthorised access is strictly prohibited under the IT Act 2000. All authentication attempts are logged and monitored by the Central Authority.
          </p>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-24 relative overflow-y-auto">
        <Link href="/" className="absolute top-8 right-8 flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
          <span className="font-heading font-bold text-xs tracking-widest uppercase">Return Home</span>
        </Link>
        
        <div className="w-full max-w-md slide-in my-auto py-12">
          {children}
        </div>
      </div>
    </div>
  );
}
