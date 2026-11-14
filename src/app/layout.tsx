import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NASA Space Apps 2026 — Lunar Survival & Asteroid ISRU Rover",
  description:
    "An interactive space mission design lab, modular rover builder, and asteroid ISRU survival simulator for the 2026 NASA Space Apps Challenge.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className="h-full bg-[#F8FAFC]">
      <body className="min-h-full flex flex-col antialiased bg-[#F8FAFC] text-[#0F172A] selection:bg-[#2563EB] selection:text-white">
        {children}
      </body>
    </html>
  );
}
