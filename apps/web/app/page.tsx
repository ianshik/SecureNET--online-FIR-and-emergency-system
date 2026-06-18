"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Shield, MapPin, Activity, Bell, Map, Users, MessageCircle, Linkedin, Github, Instagram, User as UserIcon } from "lucide-react";
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

const heroSlides = [
  {
    image: "/images/pexels-ander-maso-lord-ander-m-2147531762-29856791.jpg",
    title1: "Respond.",
    title2: "Resolve.",
    desc: "India's National Emergency Response Command Platform. Unifying Police, Ambulance, and Fire response with real-time dispatch, live tracking, and intelligent analytics.",
    align: "left"
  },
  {
    image: "/images/fire.jpg",
    title1: "Extinguish.",
    title2: "Save.",
    desc: "Rapid Fire Response Unit. Coordinating multiple fire stations and resources to minimize damage and save lives in critical fire emergencies.",
    align: "left"
  },
  {
    image: "/images/medic-hd.png",
    title1: "Heal.",
    title2: "Protect.",
    desc: "Critical Care on the Go. Real-time medical dispatch and hospital routing ensuring patients get the right care in the golden hour.",
    align: "left"
  }
];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [heroes, setHeroes] = useState<{name: string, type: string, casesResolved: number}[]>([]);

  useEffect(() => { 
    setMounted(true);
    // Fetch Top Heroes
    const apiUrl = process.env.NEXT_PUBLIC_API_URL 
      ? process.env.NEXT_PUBLIC_API_URL.endsWith('/api') 
        ? `${process.env.NEXT_PUBLIC_API_URL}/analytics/heroes`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/analytics/heroes`
      : 'http://localhost:5001/api/analytics/heroes';

    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setHeroes(data.data);
        }
      })
      .catch(err => console.error('Failed to fetch heroes:', err));
  }, []);

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
          <span onClick={() => scrollTo('heroes')} className="text-xs font-heading font-bold text-muted uppercase tracking-widest cursor-pointer hover:text-accent transition-colors">Our Heroes</span>
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
        {heroSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            {/* Background Image with Overlay */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear"
              style={{ 
                backgroundImage: `url('${slide.image}')`,
                backgroundPosition: "center 20%",
                transform: currentSlide === index ? 'scale(1.05)' : 'scale(1)'
              }}
            />
            <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-black via-black/40 to-black/80" />

            <div className={`relative z-10 w-full h-full max-w-7xl px-8 flex flex-col justify-center pt-20 mx-auto ${slide.align === 'right' ? 'items-end text-right' : 'items-start text-left'}`}>
              <h1 className={`font-heading font-black text-6xl md:text-8xl lg:text-[120px] text-white uppercase leading-[0.85] tracking-tighter mb-8 max-w-4xl transition-all duration-700 transform ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                {slide.title1}<br />
                <span className="text-accent">{slide.title2}</span>
              </h1>
              
              <p className={`text-lg md:text-xl text-gray-300 max-w-2xl font-medium mb-12 leading-relaxed transition-all duration-700 delay-100 transform ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                {slide.desc}
              </p>
              
              <div className={`flex flex-col sm:flex-row gap-4 transition-all duration-700 delay-200 transform ${currentSlide === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
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
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-3 z-20">
          {heroSlides.map((_, idx) => (
            <button 
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? 'bg-accent w-8' : 'bg-white/30 w-2 hover:bg-white/60'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
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

      {/* Our Heroes Section */}
      <section id="heroes" className="relative z-10 w-full bg-[#0a0a0a] py-32 px-8 border-t border-surface-border">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <h3 className="font-heading font-black text-5xl text-white uppercase tracking-tighter mb-4 text-center">
            Our <span className="text-accent">Heroes</span>
          </h3>
          <p className="text-muted leading-relaxed text-lg mb-16 text-center max-w-2xl">
            Honoring the brave officers who have responded to and resolved the highest number of emergency cases in their respective departments.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {heroes.length > 0 ? heroes.map((hero, i) => (
              <div key={i} className="glass-card p-8 border-surface-border hover:border-accent/40 transition-all flex flex-col items-center text-center group">
                <div className="w-32 h-32 rounded-full bg-surface border-2 border-surface-border flex items-center justify-center overflow-hidden mb-6 group-hover:border-accent transition-colors">
                  <img 
                    src={
                      hero.type === 'Police' ? "/images/pexels-ander-maso-lord-ander-m-2147531762-29856791.jpg" :
                      hero.type === 'Fire' ? "/images/fire.jpg" :
                      hero.type === 'Medic' ? "/images/medic-hd.png" : ""
                    } 
                    alt={`${hero.type} Hero`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <h4 className="font-heading font-bold text-2xl text-white uppercase tracking-wider mb-2">
                  {hero.name}
                </h4>
                <div className="text-sm font-heading font-bold text-accent uppercase tracking-widest mb-4">
                  {hero.type} Department
                </div>
                <div className="w-full bg-surface py-3 px-4 rounded border border-surface-border">
                  <span className="text-xs text-muted uppercase tracking-wider">Cases Resolved</span>
                  <div className="text-3xl font-heading font-black text-white mt-1">
                    {hero.casesResolved}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-3 text-center text-muted py-12">Loading heroes data...</div>
            )}
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
