"use client";

import { useRouter, usePathname } from "next/navigation";

export default function SOSButton() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide the floating button if we are already on the SOS page
  if (pathname === "/citizen/sos") {
    return null;
  }

  return (
    <button
      onClick={() => router.push("/citizen/sos")}
      className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-red-600 hover:bg-red-500 border-4 border-red-900 shadow-[0_0_30px_rgba(220,38,38,0.6)] flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 group"
    >
      <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-75 pointer-events-none" />
      <span className="font-heading font-black text-xl tracking-widest leading-none relative z-10 group-hover:animate-pulse">
        SOS
      </span>
    </button>
  );
}
