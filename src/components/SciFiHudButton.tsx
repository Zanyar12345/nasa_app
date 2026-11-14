"use client";

import React, { useState } from "react";

export type HudButtonTheme = "cyan" | "orange" | "silver" | "green";

interface SciFiHudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  theme?: HudButtonTheme;
  code?: string;
  systemStatus?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const THEME_COLORS: Record<
  HudButtonTheme,
  {
    primary: string; // main neon stroke hex
    primaryRgb: string;
    glow: string; // tailwind drop-shadow/box-shadow
    bgGradient: string; // inner background gradient
    textGlow: string;
    accentText: string;
  }
> = {
  cyan: {
    primary: "#00f0ff",
    primaryRgb: "0, 240, 255",
    glow: "rgba(0, 240, 255, 0.6)",
    bgGradient: "from-[#02131b]/90 via-[#042433]/80 to-[#021017]/95",
    textGlow: "drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]",
    accentText: "text-cyan-400",
  },
  orange: {
    primary: "#f97316",
    primaryRgb: "249, 115, 22",
    glow: "rgba(249, 115, 22, 0.65)",
    bgGradient: "from-[#1a0803]/90 via-[#2d1107]/80 to-[#140602]/95",
    textGlow: "drop-shadow-[0_0_12px_rgba(249,115,22,0.85)]",
    accentText: "text-orange-400",
  },
  silver: {
    primary: "#e2e8f0",
    primaryRgb: "226, 232, 240",
    glow: "rgba(255, 255, 255, 0.6)",
    bgGradient: "from-[#0d1117]/90 via-[#161f2e]/80 to-[#0a0d13]/95",
    textGlow: "drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]",
    accentText: "text-slate-200",
  },
  green: {
    primary: "#10b981",
    primaryRgb: "16, 185, 129",
    glow: "rgba(16, 185, 129, 0.6)",
    bgGradient: "from-[#021810]/90 via-[#042c1d]/80 to-[#02130c]/95",
    textGlow: "drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]",
    accentText: "text-emerald-400",
  },
};

export default function SciFiHudButton({
  children,
  theme = "cyan",
  code = "MIS_01",
  systemStatus = "SYSTEM: ACTIVE",
  size = "md",
  className = "",
  disabled,
  onClick,
  ...props
}: SciFiHudButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const colors = THEME_COLORS[theme];

  const sizeClasses = {
    sm: "px-6 py-2.5 text-xs min-h-[46px] min-w-[200px]",
    md: "px-8 py-3.5 text-sm sm:text-base min-h-[58px] min-w-[260px]",
    lg: "px-10 py-4 text-base sm:text-lg min-h-[68px] min-w-[320px]",
  }[size];

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative inline-flex items-center justify-center font-black uppercase tracking-[0.18em] cursor-pointer select-none transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      style={{
        filter: isHovered
          ? `drop-shadow(0 0 16px ${colors.glow}) drop-shadow(0 0 30px ${colors.glow})`
          : `drop-shadow(0 0 8px rgba(${colors.primaryRgb}, 0.25))`,
      }}
      {...props}
    >
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. OUTER VECTOR HUD FRAME (CHAMFERS, TRACES, BRACKETS)     */}
      {/* ─────────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox="0 0 340 70"
        preserveAspectRatio="none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Glow Filter Definition */}
        <defs>
          <linearGradient id={`grad-bg-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={`rgba(${colors.primaryRgb}, 0.12)`} />
            <stop offset="50%" stopColor={`rgba(${colors.primaryRgb}, 0.04)`} />
            <stop offset="100%" stopColor={`rgba(${colors.primaryRgb}, 0.16)`} />
          </linearGradient>
        </defs>

        {/* Inner Solid Backdrop Shape with Chamfered Corners */}
        <polygon
          points="
            18,8 
            322,8 
            332,18 
            332,52 
            322,62 
            18,62 
            8,52 
            8,18
          "
          fill="#03080c"
          fillOpacity="0.88"
        />

        <polygon
          points="
            18,8 
            322,8 
            332,18 
            332,52 
            322,62 
            18,62 
            8,52 
            8,18
          "
          fill={`url(#grad-bg-${theme})`}
        />

        {/* ───────── Main Inner Chamfered Border ───────── */}
        <polygon
          points="
            18,8 
            322,8 
            332,18 
            332,52 
            322,62 
            18,62 
            8,52 
            8,18
          "
          stroke={colors.primary}
          strokeWidth="1.8"
          strokeOpacity={isHovered ? "1" : "0.75"}
          vectorEffect="non-scaling-stroke"
        />

        {/* ───────── Top-Left Outer Angle Bracket (HUD Fin) ───────── */}
        <path
          d="M 2,16 L 2,4 L 14,4 L 22,4"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeOpacity={isHovered ? "1" : "0.7"}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 2,14 L 14,2 L 20,2"
          stroke={colors.primary}
          strokeWidth="1.5"
          fill="none"
          strokeOpacity={isHovered ? "1" : "0.8"}
          vectorEffect="non-scaling-stroke"
        />
        <polygon
          points="2,10 2,4 8,4"
          fill={colors.primary}
          fillOpacity={isHovered ? "0.9" : "0.5"}
        />

        {/* ───────── Bottom-Right Outer Angle Bracket (Dual Fins) ──── */}
        <path
          d="M 338,54 L 338,66 L 326,66 L 318,66"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeOpacity={isHovered ? "1" : "0.7"}
          vectorEffect="non-scaling-stroke"
        />
        <path
          d="M 338,56 L 326,68 L 320,68"
          stroke={colors.primary}
          strokeWidth="1.5"
          fill="none"
          strokeOpacity={isHovered ? "1" : "0.8"}
          vectorEffect="non-scaling-stroke"
        />
        {/* Diagonal Notch Stripes */}
        <line
          x1="324"
          y1="64"
          x2="330"
          y2="58"
          stroke={colors.primary}
          strokeWidth="1.8"
          strokeOpacity={isHovered ? "1" : "0.7"}
        />
        <line
          x1="328"
          y1="67"
          x2="334"
          y2="61"
          stroke={colors.primary}
          strokeWidth="1.8"
          strokeOpacity={isHovered ? "1" : "0.7"}
        />

        {/* ───────── Top Outer Rail with Step & Micro Pattern ───────── */}
        <path
          d="M 68,4 L 290,4 L 298,8"
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeOpacity="0.6"
          vectorEffect="non-scaling-stroke"
        />

        {/* ───────── Bottom Circuit Trace with Node Circle ─────────── */}
        <path
          d="M 72,66 L 160,66"
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeOpacity="0.6"
          vectorEffect="non-scaling-stroke"
        />
        <circle
          cx="163"
          cy="66"
          r="2.5"
          stroke={colors.primary}
          strokeWidth="1.2"
          fill="#03080c"
        />

        <path
          d="M 230,66 L 275,66"
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeOpacity="0.5"
          vectorEffect="non-scaling-stroke"
        />

        {/* ───────── Left Edge 5 Micro-Dots / Bars ─────────────────── */}
        <g opacity={isHovered ? "0.9" : "0.6"}>
          <line x1="4" y1="28" x2="4" y2="30" stroke={colors.primary} strokeWidth="1.5" />
          <line x1="4" y1="33" x2="4" y2="35" stroke={colors.primary} strokeWidth="1.5" />
          <line x1="4" y1="38" x2="4" y2="40" stroke={colors.primary} strokeWidth="1.5" />
          <line x1="4" y1="43" x2="4" y2="45" stroke={colors.primary} strokeWidth="1.5" />
          <line x1="4" y1="48" x2="4" y2="50" stroke={colors.primary} strokeWidth="1.5" />
        </g>

        {/* ───────── Top-Right Micro Matrix Pattern ─────────────────── */}
        <g opacity="0.55" fill={colors.primary}>
          <rect x="250" y="2" width="2" height="1.5" />
          <rect x="254" y="2" width="4" height="1.5" />
          <rect x="260" y="2" width="2" height="1.5" />
          <rect x="264" y="2" width="6" height="1.5" />
          <rect x="272" y="2" width="2" height="1.5" />
          <rect x="276" y="2" width="4" height="1.5" />
          <rect x="282" y="2" width="3" height="1.5" />
        </g>
      </svg>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. MICRO TELEMETRY LABELS (SYSTEM: ACTIVE, MIS_01)          */}
      {/* ─────────────────────────────────────────────────────────── */}
      {/* Top-Left Status */}
      <span
        className={`absolute -top-3.5 left-6 text-[9px] font-mono font-bold tracking-wider pointer-events-none transition-colors duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 1 : 0.75 }}
      >
        {systemStatus}
      </span>

      {/* Bottom-Left Status */}
      <span
        className={`absolute -bottom-3.5 left-5 text-[8.5px] font-mono tracking-wider pointer-events-none transition-colors duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.9 : 0.65 }}
      >
        {systemStatus}
      </span>

      {/* Inner Top-Right Code */}
      <span
        className={`absolute top-2 right-4 text-[9px] font-mono tracking-widest pointer-events-none transition-opacity duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.9 : 0.55 }}
      >
        {code}
      </span>

      {/* Inner Bottom-Right Code */}
      <span
        className={`absolute bottom-2 right-5 text-[8.5px] font-mono tracking-widest pointer-events-none transition-opacity duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.9 : 0.55 }}
      >
        {code}
      </span>

      {/* Inner Bottom-Left Code */}
      <span
        className={`absolute bottom-2 left-4 text-[8px] font-mono tracking-widest pointer-events-none transition-opacity duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.8 : 0.45 }}
      >
        {code}
      </span>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. LIGHT SWEEP / SCANLINE HIGHLIGHT ON HOVER                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-4 inset-y-2 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(${colors.primaryRgb}, 0.15) 50%, transparent 100%)`,
        }}
      />

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. BUTTON TEXT & ICONS WITH DYNAMIC SCI-FI GLOW             */}
      {/* ─────────────────────────────────────────────────────────── */}
      <span
        className={`relative z-10 text-white flex items-center justify-center gap-2.5 transition-all duration-300 ${colors.textGlow}`}
        style={{
          textShadow: isHovered
            ? `0 0 16px ${colors.primary}, 0 0 30px ${colors.primary}, 0 2px 4px rgba(0,0,0,0.9)`
            : `0 0 10px rgba(${colors.primaryRgb}, 0.6), 0 2px 4px rgba(0,0,0,0.9)`,
        }}
      >
        {children}
      </span>
    </button>
  );
}

