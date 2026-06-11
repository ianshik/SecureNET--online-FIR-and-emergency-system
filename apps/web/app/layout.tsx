import type { Metadata } from "next";
import "./globals.css";

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
