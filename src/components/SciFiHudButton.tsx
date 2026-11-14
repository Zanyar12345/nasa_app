"use client";

import React, { useState, useRef, useEffect } from "react";
import { sounds } from "./SoundEffects";

export type HudButtonTheme = "cyan" | "orange" | "silver" | "green";

interface SciFiHudButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  theme?: HudButtonTheme;
  code?: string;
  systemStatus?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTelemetryBlock?: boolean;
}

const THEME_COLORS: Record<
  HudButtonTheme,
  {
    primary: string; // main neon stroke hex
    primaryRgb: string;
    glow: string; // drop-shadow/box-shadow rgba
    textGlow: string;
    accentText: string;
    centerGlow: string;
    darkBg: string;
  }
> = {
  cyan: {
    primary: "#00f0ff",
    primaryRgb: "0, 240, 255",
    glow: "rgba(0, 240, 255, 0.75)",
    textGlow: "drop-shadow-[0_0_12px_rgba(0,240,255,0.85)]",
    accentText: "text-cyan-400",
    centerGlow: "rgba(0, 210, 255, 0.28)",
    darkBg: "#020c14",
  },
  orange: {
    primary: "#f97316",
    primaryRgb: "249, 115, 22",
    glow: "rgba(249, 115, 22, 0.8)",
    textGlow: "drop-shadow-[0_0_12px_rgba(249,115,22,0.9)]",
    accentText: "text-orange-400",
    centerGlow: "rgba(249, 115, 22, 0.28)",
    darkBg: "#120602",
  },
  silver: {
    primary: "#e2e8f0",
    primaryRgb: "226, 232, 240",
    glow: "rgba(255, 255, 255, 0.75)",
    textGlow: "drop-shadow-[0_0_12px_rgba(255,255,255,0.85)]",
    accentText: "text-slate-200",
    centerGlow: "rgba(226, 232, 240, 0.22)",
    darkBg: "#0c0d12",
  },
  green: {
    primary: "#10b981",
    primaryRgb: "16, 185, 129",
    glow: "rgba(16, 185, 129, 0.75)",
    textGlow: "drop-shadow-[0_0_12px_rgba(16,185,129,0.85)]",
    accentText: "text-emerald-400",
    centerGlow: "rgba(16, 185, 129, 0.28)",
    darkBg: "#02140c",
  },
};

export default function SciFiHudButton({
  children,
  theme = "cyan",
  code = "MIS_01",
  systemStatus = "SYSTEM: ACTIVE",
  size = "md",
  className = "",
  showTelemetryBlock = true,
  disabled,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}: SciFiHudButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Height and initial width by size
  const height = size === "lg" ? 74 : size === "md" ? 62 : 48;
  const initialWidth = size === "lg" ? 340 : size === "md" ? 280 : 220;
  const [width, setWidth] = useState<number>(initialWidth);

  // Dynamically track exact button width with ResizeObserver to prevent any chamfer distortion
  useEffect(() => {
    if (!buttonRef.current) return;
    const update = () => {
      if (buttonRef.current) {
        const w = buttonRef.current.offsetWidth;
        if (w > 0) setWidth(w);
      }
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(buttonRef.current);
    return () => observer.disconnect();
  }, []);

  const colors = THEME_COLORS[theme];

  const sizeClasses = {
    sm: "px-6 py-2 text-xs min-h-[48px] min-w-[200px]",
    md: "px-8 py-3 text-sm sm:text-base min-h-[62px] min-w-[260px]",
    lg: "px-10 py-4 text-base sm:text-lg min-h-[74px] min-w-[320px]",
  }[size];

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(true);
    sounds.playHover();
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    sounds.playClick(680);
    if (onClick) onClick(e);
  };

  // Coordinate math based on measured width and height
  const w = Math.max(width, 180);
  const h = height;

  // Chamfer offsets (exact 45-degree angle: deltaX == deltaY)
  const chamfer = size === "lg" ? 18 : size === "md" ? 15 : 12;
  const topY = 10;
  const botY = h - 10;
  const leftX = 10;
  const rightX = w - 10;

  // Main chamfered outer polygon points
  const mainPoints = [
    `${leftX + chamfer},${topY}`,
    `${rightX - chamfer},${topY}`,
    `${rightX},${topY + chamfer}`,
    `${rightX},${botY - chamfer}`,
    `${rightX - chamfer},${botY}`,
    `${leftX + chamfer},${botY}`,
    `${leftX},${botY - chamfer}`,
    `${leftX},${topY + chamfer}`,
  ].join(" ");

  // Inner inset border points
  const inset = size === "lg" ? 5 : 4;
  const innerPoints = [
    `${leftX + chamfer + inset},${topY + inset}`,
    `${rightX - chamfer - inset},${topY + inset}`,
    `${rightX - inset},${topY + chamfer + inset}`,
    `${rightX - inset},${botY - chamfer - inset}`,
    `${rightX - chamfer - inset},${botY - inset}`,
    `${leftX + chamfer + inset},${botY - inset}`,
    `${leftX + inset},${botY - chamfer - inset}`,
    `${leftX + inset},${topY + chamfer + inset}`,
  ].join(" ");

  // Top-left solid cyan wedge
  const wedgePts = [
    `${leftX - 6},${topY + 12}`,
    `${leftX - 6},${topY + 4}`,
    `${leftX + 4},${topY - 6}`,
    `${leftX + 12},${topY - 6}`,
  ].join(" ");

  // Bottom-right double diagonal tabs (//)
  const slash1 = [
    `${rightX - chamfer + 2},${botY - 4}`,
    `${rightX - chamfer + 7},${botY - 9}`,
    `${rightX - 2},${botY - chamfer}`,
    `${rightX - 7},${botY - chamfer + 5}`,
  ].join(" ");

  const slash2 = [
    `${rightX - chamfer + 8},${botY + 2}`,
    `${rightX - chamfer + 13},${botY - 3}`,
    `${rightX + 4},${botY - chamfer + 6}`,
    `${rightX - 1},${botY - chamfer + 11}`,
  ].join(" ");

  return (
    <button
      ref={buttonRef}
      type="button"
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative inline-flex items-center justify-center font-orbitron uppercase tracking-[0.16em] cursor-pointer select-none transition-all duration-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${sizeClasses} ${className}`}
      style={{
        filter: isHovered
          ? `drop-shadow(0 0 16px ${colors.glow}) drop-shadow(0 0 32px ${colors.glow})`
          : `drop-shadow(0 0 8px rgba(${colors.primaryRgb}, 0.35))`,
      }}
      {...props}
    >
      {/* ─────────────────────────────────────────────────────────── */}
      {/* 1. DYNAMIC VECTOR HUD FRAME (100% 1:1 TO REFERENCE PHOTO)  */}
      {/* ─────────────────────────────────────────────────────────── */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
        viewBox={`0 0 ${w} ${h}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Radial Bloom Center Gradient (Luminous Holographic HUD Cockpit Glow) */}
          <radialGradient
            id={`hud-radial-${theme}`}
            cx="50%"
            cy="50%"
            r="60%"
            fx="50%"
            fy="50%"
          >
            <stop offset="0%" stopColor={colors.centerGlow} />
            <stop offset="50%" stopColor={`rgba(${colors.primaryRgb}, 0.09)`} />
            <stop offset="85%" stopColor={`rgba(${colors.primaryRgb}, 0.02)`} />
            <stop offset="100%" stopColor={colors.darkBg} />
          </radialGradient>
        </defs>

        {/* ── Background Solid Dark Plate with Chamfered Corners ── */}
        <polygon points={mainPoints} fill={colors.darkBg} fillOpacity="0.95" />

        {/* ── Radial Center Luminous Bloom ── */}
        <polygon points={mainPoints} fill={`url(#hud-radial-${theme})`} />

        {/* ── Main Outer Chamfered Neon Border ── */}
        <polygon
          points={mainPoints}
          stroke={colors.primary}
          strokeWidth="1.8"
          strokeOpacity={isHovered ? "1" : "0.85"}
        />

        {/* ── Inner Secondary Inset Border (Framing Line Detail) ── */}
        <polygon
          points={innerPoints}
          stroke={colors.primary}
          strokeWidth="1"
          strokeOpacity={isHovered ? "0.75" : "0.38"}
        />

        {/* ── Top-Left Outer Angle Bracket ── */}
        <path
          d={`M ${leftX - 6},${topY + 20} L ${leftX - 6},${topY + 4} L ${leftX + 4},${topY - 6} L ${leftX + 24},${topY - 6}`}
          stroke={colors.primary}
          strokeWidth="1.6"
          strokeOpacity={isHovered ? "1" : "0.85"}
          fill="none"
        />

        {/* ── Top-Left Solid Filled Cyan Wedge ── */}
        <polygon
          points={wedgePts}
          fill={colors.primary}
          fillOpacity={isHovered ? "1" : "0.8"}
        />

        {/* ── Top Outer Rail Trace ── */}
        <path
          d={`M ${leftX + 54},${topY - 6} L ${rightX - 64},${topY - 6} L ${rightX - 56},${topY - 2}`}
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeOpacity={isHovered ? "0.9" : "0.6"}
          fill="none"
        />

        {/* ── Top-Right Outer Angle Bracket ── */}
        <path
          d={`M ${rightX - 24},${topY - 6} L ${rightX - 4},${topY - 6} L ${rightX + 6},${topY + 4} L ${rightX + 6},${topY + 20}`}
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeOpacity={isHovered ? "1" : "0.8"}
          fill="none"
        />

        {/* ── Top-Right Dot-Matrix Telemetry Grid ── */}
        <g fill={colors.primary} opacity={isHovered ? "0.85" : "0.55"}>
          {/* Row 1 */}
          <rect x={rightX - 86} y={topY - 10} width="2.5" height="1.8" />
          <rect x={rightX - 82} y={topY - 10} width="2.5" height="1.8" />
          <rect x={rightX - 78} y={topY - 10} width="2.5" height="1.8" />
          <rect x={rightX - 74} y={topY - 10} width="4" height="1.8" />
          <rect x={rightX - 68} y={topY - 10} width="2.5" height="1.8" />
          <rect x={rightX - 64} y={topY - 10} width="5" height="1.8" />
          <rect x={rightX - 57} y={topY - 10} width="2.5" height="1.8" />
          <rect x={rightX - 53} y={topY - 10} width="4" height="1.8" />
          <rect x={rightX - 47} y={topY - 10} width="2.5" height="1.8" />
          <rect x={rightX - 43} y={topY - 10} width="3.5" height="1.8" />
          {/* Row 2 */}
          <rect x={rightX - 82} y={topY - 7} width="2.5" height="1.6" />
          <rect x={rightX - 78} y={topY - 7} width="2.5" height="1.6" />
          <rect x={rightX - 68} y={topY - 7} width="2.5" height="1.6" />
          <rect x={rightX - 64} y={topY - 7} width="2.5" height="1.6" />
          <rect x={rightX - 57} y={topY - 7} width="4" height="1.6" />
          <rect x={rightX - 47} y={topY - 7} width="2.5" height="1.6" />
          {/* Row 3 */}
          <rect x={rightX - 74} y={topY - 4} width="2.5" height="1.4" />
          <rect x={rightX - 68} y={topY - 4} width="2.5" height="1.4" />
          <rect x={rightX - 53} y={topY - 4} width="2.5" height="1.4" />
        </g>

        {/* ── Left Edge 5 Micro-Tick Marks ── */}
        <g opacity={isHovered ? "0.95" : "0.65"}>
          <line x1={leftX - 4} y1={topY + 18} x2={leftX - 4} y2={topY + 21} stroke={colors.primary} strokeWidth="1.6" />
          <line x1={leftX - 4} y1={topY + 23} x2={leftX - 4} y2={topY + 26} stroke={colors.primary} strokeWidth="1.6" />
          <line x1={leftX - 4} y1={topY + 28} x2={leftX - 4} y2={topY + 31} stroke={colors.primary} strokeWidth="1.6" />
          <line x1={leftX - 4} y1={topY + 33} x2={leftX - 4} y2={topY + 36} stroke={colors.primary} strokeWidth="1.6" />
          <line x1={leftX - 4} y1={topY + 38} x2={leftX - 4} y2={topY + 41} stroke={colors.primary} strokeWidth="1.6" />
        </g>

        {/* ── Bottom-Left Outer Angle Bracket ── */}
        <path
          d={`M ${leftX - 6},${botY - 20} L ${leftX - 6},${botY - 4} L ${leftX + 4},${botY + 6} L ${leftX + 24},${botY + 6}`}
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeOpacity={isHovered ? "1" : "0.8"}
          fill="none"
        />

        {/* ── Bottom Circuit Trace with Circular Node Dot ── */}
        <path
          d={`M ${leftX + 60},${botY + 6} L ${w * 0.48},${botY + 6}`}
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeOpacity={isHovered ? "0.9" : "0.6"}
        />
        <circle
          cx={w * 0.48 + 4}
          cy={botY + 6}
          r="2.8"
          stroke={colors.primary}
          strokeWidth="1.4"
          fill={colors.darkBg}
          opacity={isHovered ? "1" : "0.85"}
        />
        <path
          d={`M ${w * 0.48 + 12},${botY + 6} L ${rightX - 60},${botY + 6}`}
          stroke={colors.primary}
          strokeWidth="1.2"
          strokeOpacity={isHovered ? "0.8" : "0.5"}
        />

        {/* ── Bottom-Right Outer Angle Bracket ── */}
        <path
          d={`M ${rightX - 24},${botY + 6} L ${rightX - 4},${botY + 6} L ${rightX + 6},${botY - 4} L ${rightX + 6},${botY - 20}`}
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeOpacity={isHovered ? "1" : "0.8"}
          fill="none"
        />

        {/* ── Bottom-Right Dual Thick Diagonal Accent Tabs (//) ── */}
        <polygon points={slash1} fill={colors.primary} opacity={isHovered ? "1" : "0.9"} />
        <polygon points={slash2} fill={colors.primary} opacity={isHovered ? "1" : "0.9"} />
      </svg>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 2. MICRO TELEMETRY LABELS (SYSTEM: ACTIVE, MIS_01)          */}
      {/* ─────────────────────────────────────────────────────────── */}
      {/* Top-Left Status: "SYSTEM: ACTIVE" */}
      <span
        className={`absolute -top-3.5 left-7 text-[9px] sm:text-[10px] font-hud-mono font-bold tracking-wider pointer-events-none transition-colors duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 1 : 0.85 }}
      >
        {systemStatus}
      </span>

      {/* Bottom-Left Status: "SYSTEM: ACTIVE" */}
      <span
        className={`absolute -bottom-3.5 left-6 text-[8.5px] sm:text-[9.5px] font-hud-mono font-bold tracking-wider pointer-events-none transition-colors duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.95 : 0.75 }}
      >
        {systemStatus}
      </span>

      {/* Bottom-Left Micro Technical Code Block */}
      {showTelemetryBlock && (
        <div
          className={`hidden sm:block absolute -bottom-8 left-6 text-[6.5px] font-mono leading-[1.1] pointer-events-none transition-opacity duration-300 select-none ${colors.accentText}`}
          style={{ opacity: isHovered ? 0.8 : 0.45 }}
        >
          <div>SYS_VER 04.92 // INIT PASS</div>
          <div>CORE TELEMETRY: 99.8% STABLE</div>
        </div>
      )}

      {/* Inner Top-Right Code: "MIS_01" */}
      <span
        className={`absolute top-2.5 right-6 text-[9.5px] font-hud-mono font-bold tracking-widest pointer-events-none transition-opacity duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.95 : 0.65 }}
      >
        {code}
      </span>

      {/* Inner Bottom-Right Code: "MIS_01" */}
      <span
        className={`absolute bottom-2.5 right-7 text-[9px] font-hud-mono font-bold tracking-widest pointer-events-none transition-opacity duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.95 : 0.65 }}
      >
        {code}
      </span>

      {/* Inner Bottom-Left Code: "MIS_01" */}
      <span
        className={`absolute bottom-2.5 left-6 text-[8.5px] font-hud-mono font-bold tracking-widest pointer-events-none transition-opacity duration-300 ${colors.accentText}`}
        style={{ opacity: isHovered ? 0.85 : 0.5 }}
      >
        {code}
      </span>

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 3. LIGHT SWEEP / SCANLINE HIGHLIGHT ON HOVER                */}
      {/* ─────────────────────────────────────────────────────────── */}
      <div
        className="absolute inset-x-6 inset-y-2 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent 0%, rgba(${colors.primaryRgb}, 0.22) 50%, transparent 100%)`,
        }}
      />

      {/* ─────────────────────────────────────────────────────────── */}
      {/* 4. BUTTON TEXT & ICONS WITH DYNAMIC SCI-FI ORBITRON GLOW    */}
      {/* ─────────────────────────────────────────────────────────── */}
      <span
        className={`relative z-10 text-white font-orbitron font-extrabold flex items-center justify-center gap-3 transition-all duration-300 ${colors.textGlow}`}
        style={{
          textShadow: isHovered
            ? `0 0 16px ${colors.primary}, 0 0 32px ${colors.primary}, 0 2px 4px rgba(0,0,0,0.9)`
            : `0 0 10px rgba(${colors.primaryRgb}, 0.7), 0 2px 4px rgba(0,0,0,0.9)`,
        }}
      >
        {children}
      </span>
    </button>
  );
}
