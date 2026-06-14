import type { Metadata } from "next";
import { Space_Grotesk, Rajdhani } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-inter" });
const rajdhani = Rajdhani({ subsets: ["latin"], variable: "--font-montserrat", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "SecureNet NP-SERP | National Emergency Response Platform",
  description: "India's premier public safety and emergency response platform. File FIRs, trigger SOS, and track incidents in real-time.",
  keywords: "emergency response, FIR, SOS, police, ambulance, public safety, India",
  authors: [{ name: "SecureNet Technologies" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${spaceGrotesk.variable} ${rajdhani.variable} antialiased bg-black text-foreground`}>
        {children}
      </body>
    </html>
  );
}
