import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Astro Specialist — NASA Space Apps 2026",
  description:
    "An interactive 16-bit retro pixel-arcade space destination gallery and exploration terminal for the 2026 NASA Space Apps Challenge.",
};

export const viewport: Viewport = {
  themeColor: "#050814",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-[#050814]">
      <body className="min-h-full flex flex-col antialiased bg-[#050814] text-[#F8FAFC] selection:bg-[#06B6D4] selection:text-black">
        {children}
      </body>
    </html>
  );
}
