// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers"; // Impor provider yang dibuat tadi
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata tetap bisa jalan karena ini Server Component
export const metadata: Metadata = {
  title: "Monitoring Produksi - Dashboard",
  description: "Live Monitoring System for Manufacturing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
            {/* Header: Fixed 35px Height */}
            <div className="w-full h-[35px] flex items-center justify-between px-6 bg-white border-b border-slate-200 shadow-sm">
              <h1 className="text-sm font-black tracking-tight text-slate-900 uppercase">Monitoring Produksi</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">System Live</span>
                </div>
              </div>
            </div>
            {children}
            {/* Footer: Fixed 35px Height */}
            <div className="w-full h-[35px] flex items-center justify-between px-6 bg-slate-100 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Home</span>
                <div className="h-3 w-[1px] bg-slate-300"></div>
                <span className="text-[9px] text-slate-400 font-medium">Pabrik Digital v2.0</span>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/" className="text-[9px] text-slate-400 uppercase font-bold">HOME</Link>
                <Link href="/planing" className="text-[10px] text-slate-600 font-black uppercase tracking-wider">PLANING</Link>
                <Link href="/planning-unroling" className="text-[10px] text-slate-600 font-black uppercase tracking-wider">PLANNING UNROL</Link>
                <Link href="/planning-cwr" className="text-[10px] text-slate-600 font-black uppercase tracking-wider">PLANNING CWR</Link>
                <Link href="/planning-inspect" className="text-[10px] text-slate-600 font-black uppercase tracking-wider">PLANNING INSPECT</Link>
                <Link href="/planning-stenter" className="text-[10px] text-slate-600 font-black uppercase tracking-wider">PLANNING STENTER</Link>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}