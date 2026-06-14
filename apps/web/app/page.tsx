"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, MapPin, Activity, Bell, Map, Users, MessageCircle, Linkedin, Github, Instagram } from "lucide-react";
import { Button } from "../components/ui/Button";

const features = [
  {
    icon: <Bell className="w-6 h-6" />,
    title: "One-Tap SOS",
    desc: "Instant emergency dispatch with auto GPS capture. Police, Ambulance & Fire in seconds.",
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: "Live Tracking",
    desc: "Real-time responder location sharing via encrypted high-speed streams.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Digital FIR",
    desc: "File, track and export First Information Reports with digital signatures.",
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: "AI Assistant",
    desc: "Smart complaint classification and priority scoring powered by intelligent models.",
  },
  {
    icon: <Map className="w-6 h-6" />,
    title: "Crime Analytics",
    desc: "City-wide heatmaps, trend charts, and real-time command center view.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Zero-Trust Security",
    desc: "End-to-end encryption, strict RBAC, audit logs, and tamper detection.",
  },
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-sans">
      
      {/* Top Alert Bar */}
      <div className="w-full bg-accent/10 border-b border-accent/20 py-2 text-center">
        <p className="text-accent text-xs font-heading font-bold tracking-widest uppercase">
          Live Platform — Protecting 1.4 Billion Citizens
        </p>
      </div>

      {/* Navbar */}
      <nav className="absolute top-[33px] left-0 right-0 z-50 px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Shield className="w-8 h-8 text-white" />
          <div>
            <div className="font-heading font-black text-xl tracking-wider text-white uppercase leading-none">SecureNet</div>
            <div className="text-[10px] font-heading font-bold text-muted uppercase tracking-widest mt-1">NP-SERP</div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <span onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="text-xs font-heading font-bold text-white uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">Home</span>
          <span onClick={() => scrollTo('features')} className="text-xs font-heading font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">Features</span>
          <Link href="/login">
            <span className="text-xs font-heading font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">Emergency</span>
          </Link>
          <span onClick={() => scrollTo('contact')} className="text-xs font-heading font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">Contact</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <span className="text-xs font-heading font-bold text-white uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">Login</span>
          </Link>
          <Link href="/register">
            <Button variant="default" size="sm" className="bg-white text-black hover:bg-gray-200">
              Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: "url('/images/pexels-ander-maso-lord-ander-m-2147531762-29856791.jpg')",
            backgroundPosition: "center 20%" 
          }}
        />
        <div className="absolute inset-0 z-0 bg-black/70 bg-gradient-to-t from-black via-black/40 to-black/80" />

        <div className="relative z-10 w-full max-w-7xl px-8 flex flex-col items-start justify-center pt-20">
          <h1 className="font-heading font-black text-6xl md:text-8xl lg:text-[120px] text-white uppercase leading-[0.85] tracking-tighter mb-8 max-w-4xl">
            Respond.<br />
            <span className="text-accent">Resolve.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl font-medium mb-12 leading-relaxed">
            India's National Emergency Response Command Platform. Unifying Police, Ambulance, and Fire response with real-time dispatch, live tracking, and intelligent analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/register">
              <Button size="lg" className="px-12">
                File FIR
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-12">
                Officer Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3">
          <div className="w-2 h-2 rounded-full bg-accent"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
          <div className="w-2 h-2 rounded-full bg-white/30"></div>
        </div>
      </section>

      {/* Tactical Features Section */}
      <section id="features" className="relative z-10 w-full bg-black py-32 px-8 border-t border-surface-border">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16 items-center">
          
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-accent/5 rounded-xl blur-2xl"></div>
            <div className="relative glass-card p-8 aspect-square flex flex-col justify-center border-accent/20">
              <h3 className="font-heading font-black text-5xl text-white uppercase tracking-tighter mb-4">
                Stop Reacting.
              </h3>
              <h4 className="font-heading font-bold text-2xl text-accent uppercase tracking-widest mb-8">
                Intelligent Dispatch
              </h4>
              <p className="text-muted leading-relaxed text-lg">
                By analysing the realities of emergency response, we've built a unified platform identifying key challenges, performance KPIs, and non-negotiables required to maintain peak operational readiness.
              </p>
              <div className="mt-12">
                <Button>View Analytics</Button>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card p-6 border-surface-border hover:border-accent/40 transition-colors">
                <div className="w-12 h-12 rounded bg-surface border border-surface-border flex items-center justify-center text-accent mb-6">
                  {f.icon}
                </div>
                <h5 className="font-heading font-bold text-white uppercase tracking-wider mb-3">
                  {f.title}
                </h5>
                <p className="text-sm text-muted leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="border-t border-surface-border bg-[#050505] py-16 px-8 flex flex-col items-center text-center">
        <Shield className="w-8 h-8 text-white mb-8 opacity-20" />
        
        {/* Socials */}
        <div className="flex items-center gap-6 mb-8">
          <a href="https://wa.me/919256857504" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
            <MessageCircle className="w-5 h-5" />
          </a>
          <a href="https://www.linkedin.com/in/anshik-yadav-681664287/" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
            <Linkedin className="w-5 h-5" />
          </a>
          <a href="https://github.com/gunguna1" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
            <Github className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/anshqk/" target="_blank" rel="noopener noreferrer" className="p-3 rounded bg-surface border border-surface-border text-muted hover:text-accent hover:border-accent/50 hover:bg-accent/10 transition-all">
            <Instagram className="w-5 h-5" />
          </a>
        </div>

        <p className="text-xs font-heading font-bold text-muted uppercase tracking-widest">
          Vanguard Operations Command © 2026 SecureNet Technologies.
        </p>
      </footer>
    </div>
  );
}
