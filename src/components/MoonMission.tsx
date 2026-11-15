"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Play,
  Pause,
  Award,
  AlertTriangle,
  Package,
} from "lucide-react";

export interface MoonMissionProps {
  playerName: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onAbort: () => void;
}

export type MoonMissionPhase =
  | "PHASE_A_BRIEFING"
  | "PHASE_A_SOLUTIONS"
  | "PHASE_BC_CARGO"
  | "STAGE_1"
  | "STAGE_2"
  | "STAGE_3"
  | "STAGE_4"
  | "STAGE_5"
  | "STAGE_6"
  | "STAGE_7"
  | "PHASE_E_EXPEDITION"
  | "PHASE_F_VICTORY"
  | "PHASE_F_FAILURE";

export type LunarPowerSolutionId = "nuclear_reactor" | "solar_panels";

interface LunarPowerSolution {
  id: LunarPowerSolutionId;
  slideNumber: number;
  title: string;
  shortName: string;
  subtitle: string;
  pros: string[];
  cons: string[];
}

const LUNAR_POWER_SOLUTIONS: LunarPowerSolution[] = [
  {
    id: "nuclear_reactor",
    slideNumber: 1,
    title: "SOLUTION 1: NUCLEAR REACTOR",
    shortName: "NUCLEAR REACTOR",
    subtitle: "FISSION SURFACE POWER SYSTEM // CONTINUOUS BASELINE",
    pros: [
      "Continuous reliable power",
      "High energy output",
      "Independent of sunlight",
    ],
    cons: [
      "High radiation risk",
      "Extremely heavy payload",
      "High launch cost",
    ],
  },
  {
    id: "solar_panels",
    slideNumber: 2,
    title: "SOLUTION 2: SOLAR PANELS",
    shortName: "SOLAR PANELS",
    subtitle: "PHOTOVOLTAIC SOLAR ARRAY // SUNLIGHT DEPENDENT",
    pros: [
      "Renewable energy source",
      "Zero radiation risk",
      "Low launch weight",
    ],
    cons: [
      "Useless at night",
      "Requires heavy batteries",
      "Vulnerable to dust",
    ],
  },
];

interface MoonStageDefinition {
  id:
    | "STAGE_1"
    | "STAGE_2"
    | "STAGE_3"
    | "STAGE_4"
    | "STAGE_5"
    | "STAGE_6"
    | "STAGE_7";
  stageNumber: number;
  title: string;
  image: string;
  description: string;
  nasaFact: string;
  telemetry: {
    altitude: string;
    velocity: string;
    status: string;
  };
}

interface FairingPayloadPart {
  id: string;
  name: string;
  shortLabel: string;
  solutionId: LunarPowerSolutionId;
}

interface FairingSlotPosition {
  index: number;
  label: string;
  className: string;
}

const FAIRING_SLOTS: FairingSlotPosition[] = [
  {
    index: 0,
    label: "SLOT 1 // UPPER PORT",
    className: "left-[10.2%] top-[20.0%] w-[9.7%] h-[15.8%]",
  },
  {
    index: 1,
    label: "SLOT 2 // UPPER STBD",
    className: "left-[33.4%] top-[20.0%] w-[9.7%] h-[15.8%]",
  },
  {
    index: 2,
    label: "SLOT 3 // LOWER PORT",
    className: "left-[10.2%] top-[48.6%] w-[8.6%] h-[9.8%]",
  },
  {
    index: 3,
    label: "SLOT 4 // LOWER STBD",
    className: "left-[33.4%] top-[48.6%] w-[9.7%] h-[9.8%]",
  },
];

const FAIRING_PAYLOAD_PARTS: FairingPayloadPart[] = [
  {
    id: "u235_core",
    name: "Uranium-235 Reactor Core",
    shortLabel: "U-235 CORE",
    solutionId: "nuclear_reactor",
  },
  {
    id: "stirling_converters",
    name: "Stirling Power Converters",
    shortLabel: "STIRLING GEN",
    solutionId: "nuclear_reactor",
  },
  {
    id: "radiator_panels",
    name: "Deployable Radiator Panels",
    shortLabel: "RADIATORS",
    solutionId: "nuclear_reactor",
  },
  {
    id: "radiation_shield",
    name: "Radiation Shield",
    shortLabel: "RAD SHIELD",
    solutionId: "nuclear_reactor",
  },
  {
    id: "pv_arrays",
    name: "Deployable Photovoltaic Arrays",
    shortLabel: "PV ARRAYS",
    solutionId: "solar_panels",
  },
  {
    id: "battery_bank",
    name: "High-Capacity Battery Bank",
    shortLabel: "LI-ION BANK",
    solutionId: "solar_panels",
  },
  {
    id: "pmu_controller",
    name: "Power Management Unit",
    shortLabel: "PMU CONTROL",
    solutionId: "solar_panels",
  },
  {
    id: "tracking_gimbals",
    name: "Solar Tracking Gimbals",
    shortLabel: "SUN GIMBALS",
    solutionId: "solar_panels",
  },
];

function FairingPartPixelIcon({
  partId,
  className = "w-8 h-8",
}: {
  partId: string;
  className?: string;
}) {
  switch (partId) {
    case "u235_core":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="6" y="2" width="12" height="20" fill="#334155" />
          <rect x="8" y="4" width="8" height="16" fill="#064e3b" />
          <rect x="9" y="6" width="6" height="12" fill="#22c55e" />
          <rect x="10" y="8" width="4" height="8" fill="#86efac" />
          <rect x="4" y="5" width="2" height="14" fill="#38bdf8" />
          <rect x="18" y="5" width="2" height="14" fill="#38bdf8" />
        </svg>
      );
    case "stirling_converters":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="2" y="8" width="20" height="8" fill="#94a3b8" />
          <rect x="5" y="6" width="14" height="12" fill="#475569" />
          <rect x="7" y="8" width="10" height="8" fill="#f59e0b" />
          <rect x="9" y="10" width="6" height="4" fill="#fde047" />
          <rect x="1" y="10" width="3" height="4" fill="#38bdf8" />
          <rect x="20" y="10" width="3" height="4" fill="#38bdf8" />
        </svg>
      );
    case "radiator_panels":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="2" y="4" width="20" height="16" fill="#cbd5e1" />
          <rect x="4" y="6" width="3" height="12" fill="#f59e0b" />
          <rect x="9" y="6" width="3" height="12" fill="#fbbf24" />
          <rect x="14" y="6" width="3" height="12" fill="#f59e0b" />
          <rect x="18" y="6" width="2" height="12" fill="#38bdf8" />
        </svg>
      );
    case "radiation_shield":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="4" y="4" width="16" height="16" fill="#475569" />
          <rect x="6" y="6" width="12" height="12" fill="#1e293b" />
          <rect x="8" y="8" width="8" height="8" fill="#eab308" />
          <rect x="10" y="10" width="4" height="4" fill="#0f172a" />
          <rect x="3" y="10" width="2" height="4" fill="#facc15" />
          <rect x="19" y="10" width="2" height="4" fill="#facc15" />
        </svg>
      );
    case "pv_arrays":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="2" y="3" width="20" height="18" fill="#f59e0b" />
          <rect x="4" y="5" width="7" height="6" fill="#0284c7" />
          <rect x="13" y="5" width="7" height="6" fill="#0369a1" />
          <rect x="4" y="13" width="7" height="6" fill="#0369a1" />
          <rect x="13" y="13" width="7" height="6" fill="#0284c7" />
          <rect x="5" y="6" width="3" height="2" fill="#7dd3fc" />
          <rect x="14" y="14" width="3" height="2" fill="#7dd3fc" />
        </svg>
      );
    case "battery_bank":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="4" y="5" width="16" height="15" fill="#1e293b" />
          <rect x="7" y="3" width="3" height="2" fill="#94a3b8" />
          <rect x="14" y="3" width="3" height="2" fill="#94a3b8" />
          <rect x="6" y="7" width="12" height="3" fill="#22c55e" />
          <rect x="6" y="11" width="12" height="3" fill="#22c55e" />
          <rect x="6" y="15" width="12" height="3" fill="#4ade80" />
        </svg>
      );
    case "pmu_controller":
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="3" y="4" width="18" height="16" fill="#065f46" />
          <rect x="6" y="7" width="8" height="8" fill="#0f172a" />
          <rect x="8" y="9" width="4" height="4" fill="#38bdf8" />
          <rect x="16" y="7" width="3" height="10" fill="#fbbf24" />
          <rect x="5" y="17" width="10" height="2" fill="#fde047" />
        </svg>
      );
    case "tracking_gimbals":
    default:
      return (
        <svg viewBox="0 0 24 24" className={className} style={{ shapeRendering: "crispEdges" }}>
          <rect x="9" y="2" width="6" height="20" fill="#64748b" />
          <rect x="3" y="9" width="18" height="6" fill="#94a3b8" />
          <rect x="7" y="7" width="10" height="10" fill="#0284c7" />
          <rect x="9" y="9" width="6" height="6" fill="#fde047" />
        </svg>
      );
  }
}

interface LunarGridCell {
  col: number; // 0..7 (8 columns left to right)
  row: number; // 0..3 (4 rows top to bottom)
}

type LunarDirection = "W" | "A" | "S" | "D";

interface LunarAssemblyMapConfig {
  stageIndex: number; // 0..3
  compCode: string; // "comp-1" .. "comp-4"
  compBadge: string; // "COMP-1" .. "COMP-4"
  title: string;
  gridImage: string;
  startCell: LunarGridCell;
  compCell: LunarGridCell;
  stationCell: LunarGridCell;
  nuclearPartId: string;
  solarPartId: string;
}

const LUNAR_GRID_COLS = 8;
const LUNAR_GRID_ROWS = 4;

const LUNAR_ASSEMBLY_MAPS: LunarAssemblyMapConfig[] = [
  {
    stageIndex: 0,
    compCode: "comp-1",
    compBadge: "COMP-1",
    title: "STAGE 1/4 // PRIMARY POWER SOURCE PICKUP & DELIVERY",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.34.26 (1).jpg",
    startCell: { col: 0, row: 3 },
    compCell: { col: 3, row: 2 },
    stationCell: { col: 6, row: 1 },
    nuclearPartId: "u235_core",
    solarPartId: "pv_arrays",
  },
  {
    stageIndex: 1,
    compCode: "comp-2",
    compBadge: "COMP-2",
    title: "STAGE 2/4 // ENERGY CONVERSION & STORAGE DELIVERY",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.34.26.jpg",
    startCell: { col: 0, row: 3 },
    compCell: { col: 4, row: 0 },
    stationCell: { col: 6, row: 1 },
    nuclearPartId: "stirling_converters",
    solarPartId: "battery_bank",
  },
  {
    stageIndex: 2,
    compCode: "comp-3",
    compBadge: "COMP-3",
    title: "STAGE 3/4 // THERMAL / POWER REGULATION MODULE DELIVERY",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.34.27.jpg",
    startCell: { col: 7, row: 0 },
    compCell: { col: 0, row: 2 },
    stationCell: { col: 2, row: 0 },
    nuclearPartId: "radiator_panels",
    solarPartId: "pmu_controller",
  },
  {
    stageIndex: 3,
    compCode: "comp-4",
    compBadge: "COMP-4",
    title: "STAGE 4/4 // SHIELDING & TRACKING GIMBAL FINAL ASSEMBLY",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.34.27 (1).jpg",
    startCell: { col: 7, row: 0 },
    compCell: { col: 4, row: 3 },
    stationCell: { col: 1, row: 0 },
    nuclearPartId: "radiation_shield",
    solarPartId: "tracking_gimbals",
  },
];

function LunarRoverPixelSprite({
  carryingPartId,
  className = "w-14 h-14",
}: {
  carryingPartId?: string | null;
  className?: string;
}) {
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        viewBox="0 0 36 28"
        className={className}
        style={{ shapeRendering: "crispEdges" }}
      >
        {/* High-Gain Dish Antenna */}
        <rect x="6" y="2" width="6" height="2" fill="#38bdf8" />
        <rect x="8" y="4" width="2" height="6" fill="#94a3b8" />
        <rect x="5" y="1" width="2" height="2" fill="#e0f2fe" />
        {/* Camera Mast & Dual Warm Headlights */}
        <rect x="24" y="3" width="4" height="3" fill="#f8fafc" />
        <rect x="27" y="4" width="2" height="2" fill="#22d3ee" />
        <rect x="25" y="6" width="2" height="4" fill="#cbd5e1" />
        {/* Gold-Foil Thermal Blanket Chassis */}
        <rect x="6" y="10" width="24" height="7" fill="#eab308" />
        <rect x="8" y="11" width="20" height="5" fill="#facc15" />
        <rect x="10" y="12" width="14" height="3" fill="#fef08a" />
        {/* Front LED Headlight Beams */}
        <rect x="30" y="11" width="3" height="2" fill="#fef08a" />
        <rect x="30" y="14" width="3" height="2" fill="#38bdf8" />
        {/* Rocker-Bogie Suspension Struts */}
        <rect x="8" y="17" width="20" height="2" fill="#64748b" />
        {/* 6 Lunar Mesh Wheels */}
        <rect x="5" y="19" width="6" height="6" fill="#0f172a" />
        <rect x="6" y="20" width="4" height="4" fill="#38bdf8" />
        <rect x="15" y="19" width="6" height="6" fill="#0f172a" />
        <rect x="16" y="20" width="4" height="4" fill="#38bdf8" />
        <rect x="25" y="19" width="6" height="6" fill="#0f172a" />
        <rect x="26" y="20" width="4" height="4" fill="#38bdf8" />
      </svg>
      {carryingPartId && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 p-0.5 bg-emerald-950/95 border border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.95)]">
          <FairingPartPixelIcon partId={carryingPartId} className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}

function LunarStationPixelSprite({
  installedCount,
  isDocking,
  className = "w-14 h-14",
}: {
  installedCount: number;
  isDocking?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 36 32"
      className={className}
      style={{ shapeRendering: "crispEdges" }}
    >
      {/* Comms Tower & Beacon */}
      <rect x="17" y="1" width="2" height="7" fill="#94a3b8" />
      <rect
        x="16"
        y="0"
        width="4"
        height="3"
        fill={isDocking ? "#4ade80" : "#22d3ee"}
      />
      {/* Pressurized Lunar Habitat Dome */}
      <rect x="10" y="8" width="16" height="3" fill="#e2e8f0" />
      <rect x="7" y="11" width="22" height="9" fill="#cbd5e1" />
      {/* Dome Armored Viewport Windows */}
      <rect x="10" y="13" width="4" height="4" fill="#38bdf8" />
      <rect x="16" y="13" width="4" height="4" fill="#38bdf8" />
      <rect x="22" y="13" width="4" height="4" fill="#38bdf8" />
      {/* Gold Thermal Trim & Airlock */}
      <rect x="5" y="20" width="26" height="3" fill="#eab308" />
      <rect x="15" y="18" width="6" height="5" fill="#0f172a" />
      {/* Glowing Power Node Indicators (4 Nodes for 4 Components) */}
      <rect
        x="7"
        y="24"
        width="4"
        height="3"
        fill={installedCount >= 1 ? "#4ade80" : "#334155"}
      />
      <rect
        x="13"
        y="24"
        width="4"
        height="3"
        fill={installedCount >= 2 ? "#4ade80" : "#334155"}
      />
      <rect
        x="19"
        y="24"
        width="4"
        height="3"
        fill={installedCount >= 3 ? "#4ade80" : "#334155"}
      />
      <rect
        x="25"
        y="24"
        width="4"
        height="3"
        fill={installedCount >= 4 ? "#4ade80" : "#334155"}
      />
      {/* Docking Pad Base */}
      <rect x="3" y="27" width="30" height="3" fill="#22d3ee" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACT 7 SEQUENTIAL MOON LOADING STAGES (EXACT IMAGES & EXACT TEXT)
// ─────────────────────────────────────────────────────────────────────────────
const MOON_STAGES: MoonStageDefinition[] = [
  {
    id: "STAGE_1",
    stageNumber: 1,
    title: "Stage 1: Ignition & Liftoff",
    image: "/images/WhatsApp Image 2026-11-15 at 11.15.26.jpeg",
    description:
      "The mighty Saturn V engines roar to life, unleashing 7.5 million lbs of thrust to overcome Earth's gravity.",
    nasaFact:
      "NASA FACT: The Moon orbits Earth at an average distance of 384,400 km (238,855 miles).",
    telemetry: {
      altitude: "0.4 KM",
      velocity: "0.18 KM/S",
      status: "F-1 ENGINES @ 100% THRUST",
    },
  },
  {
    id: "STAGE_2",
    stageNumber: 2,
    title: "Stage 2: Ascent & Max Q",
    image: "/images/WhatsApp Image 2026-11-15 at 11.15.46.jpeg",
    description:
      "The rocket pushes through the thickest parts of the atmosphere at supersonic speeds, burning an incredible 15 tons of fuel per second.",
    nasaFact:
      "NASA FACT: Saturn V's five F-1 engines consumed 15 metric tons of RP-1 kerosene and liquid oxygen every single second.",
    telemetry: {
      altitude: "13.8 KM",
      velocity: "0.62 KM/S",
      status: "MAX DYNAMIC PRESSURE",
    },
  },
  {
    id: "STAGE_3",
    stageNumber: 3,
    title: "Stage 3: Stage Separation",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.00.jpeg",
    description:
      "To increase efficiency, the empty first stage is jettisoned, shedding 130 metric tons of dead weight.",
    nasaFact:
      "NASA FACT: Multi-stage rockets discard empty propellant tanks in flight so the upper engines only accelerate useful payload.",
    telemetry: {
      altitude: "67.0 KM",
      velocity: "2.76 KM/S",
      status: "S-IC JETTISON // S-II IGNITION",
    },
  },
  {
    id: "STAGE_4",
    stageNumber: 4,
    title: "Stage 4: Translunar Injection (TLI)",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.14.jpeg",
    description:
      "Leaving Earth behind! The spacecraft accelerates to 10.8 km/s to break out of Earth orbit and coast toward the Moon.",
    nasaFact:
      "NASA FACT: Translunar Injection (TLI) boosts the spacecraft onto a 3-day free-return trajectory across 384,400 km of deep space.",
    telemetry: {
      altitude: "312.0 KM",
      velocity: "10.80 KM/S",
      status: "S-IVB TLI BURN COMPLETE",
    },
  },
  {
    id: "STAGE_5",
    stageNumber: 5,
    title: "Stage 5: Lunar Orbit Insertion",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.30.jpeg",
    description:
      "Approaching the target. The spacecraft fires its retrograde thrusters to reduce speed and get captured by lunar gravity.",
    nasaFact:
      "NASA FACT: Lunar gravity is approximately 1/6th of Earth's (1.62 m/s² vs 9.81 m/s²), allowing high, floaty low-gravity hops.",
    telemetry: {
      altitude: "110.0 KM (LUNAR)",
      velocity: "1.63 KM/S",
      status: "LOI RETROGRADE CAPTURE",
    },
  },
  {
    id: "STAGE_6",
    stageNumber: 6,
    title: "Stage 6: Powered Descent",
    image: "/images/WhatsApp Image 2026-11-15 at 11.17.35.jpeg",
    description:
      "Final approach! Using only its descent engine and thrusters, the lander navigates past craters toward a safe landing zone.",
    nasaFact:
      "NASA FACT: With no atmosphere on the Moon, parachutes cannot work—touchdown relies 100% on rocket retro-propulsion.",
    telemetry: {
      altitude: "0.8 KM (LUNAR)",
      velocity: "0.01 KM/S",
      status: "DESCENT ENGINE THROTTLED",
    },
  },
  {
    id: "STAGE_7",
    stageNumber: 7,
    title: "YOU HAVE SUCCESSFULLY LANDED ON MOON",
    image: "/images/WhatsApp Image 2026-11-15 at 11.17.11.jpeg",
    description:
      "Touchdown confirmed at the Lunar South Pole! All descent systems nominal. Prepare to deploy the 1/6g Lunar Rover and collect polar water-ice & Helium-3 samples.",
    nasaFact:
      "NASA FACT: Permanently shadowed craters at the Lunar South Pole trap ancient water ice that can supply oxygen, water, and rocket propellant.",
    telemetry: {
      altitude: "0.0 KM (LUNAR SURFACE)",
      velocity: "0.00 KM/S",
      status: "TOUCHDOWN CONFIRMED // SEA OF TRANQUILITY",
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8-BIT WEB AUDIO SYNTHESIZER (NO EXTERNAL AUDIO FILES REQUIRED)
// ─────────────────────────────────────────────────────────────────────────────
class MoonChiptuneEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  playBlip(freq = 660) {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.035, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);
    } catch {}
  }

  playClick(freq = 720) {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {}
  }

  playJump() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(240, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.22);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } catch {}
  }

  playCollect() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [659.25, 880, 1174.66].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);
        gain.gain.setValueAtTime(0.07, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.16);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.16);
      });
    } catch {}
  }

  playDamage() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.linearRampToValueAtTime(65, now + 0.26);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  playStageTransition() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
        gain.gain.setValueAtTime(0.08, now + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.07);
        osc.stop(now + idx * 0.07 + 0.22);
      });
    } catch {}
  }

  playVictoryFanfare() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.08, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.32);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.32);
      });
    } catch {}
  }
}

const sfx = new MoonChiptuneEngine();

export default function MoonMission({
  playerName,
  soundOn,
  onToggleSound,
  onAbort,
}: MoonMissionProps) {
  const [phase, setPhase] = useState<MoonMissionPhase>("PHASE_A_BRIEFING");
  const [briefingPage, setBriefingPage] = useState<number>(0);
  const [solutionSlideIndex, setSolutionSlideIndex] = useState<number>(0);
  const [selectedPowerSolution, setSelectedPowerSolution] =
    useState<LunarPowerSolutionId>("nuclear_reactor");
  const swipeStartXRef = useRef<number | null>(null);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE B & C: ROCKET FAIRING PAYLOAD INTEGRATION (4 FAIRING SLOTS)
  // ─────────────────────────────────────────────────────────────────────────
  const [fairingSlots, setFairingSlots] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
  ]);
  const [draggedPartId, setDraggedPartId] = useState<string | null>(null);
  const [hoverSlotIndex, setHoverSlotIndex] = useState<number | null>(null);
  const [fairingError, setFairingError] = useState<string | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: 4-STAGE SEQUENTIAL LUNAR ROVER COMPONENT ASSEMBLY GAME (8x4 GRID)
  // ─────────────────────────────────────────────────────────────────────────
  const [assemblyStageIndex, setAssemblyStageIndex] = useState<number>(0);
  const [plannedMoves, setPlannedMoves] = useState<LunarDirection[]>([]);
  const [roverExecStatus, setRoverExecStatus] = useState<
    "PLANNING" | "DRIVING" | "INSTALLING" | "STAGE_COMPLETE"
  >("PLANNING");
  const [roverStepIndex, setRoverStepIndex] = useState<number>(0);
  const [assemblyHint, setAssemblyHint] = useState<string | null>(null);
  const [failureReason] = useState<string>("");

  const lastBlipRef = useRef<number>(0);

  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  const introBriefingPages = [
    `Welcome back ${playerName}! Your next destination is the Moon's South Pole. To keep our future lunar base operational through the long, freezing lunar nights, we need a continuous power source.`,
    `You’ve been assigned to deploy and assemble a Fission Surface Power reactor on the lunar surface. Now, gather your gear and prepare for launch. Good luck!`,
  ];

  const currentStage = MOON_STAGES.find((s) => s.id === phase) || null;
  const activeText =
    phase === "PHASE_A_BRIEFING"
      ? introBriefingPages[briefingPage] || introBriefingPages[0]
      : currentStage?.description || "";

  const isTypewriterDone = typewriterIndex >= activeText.length;

  // Initialize Phase E 4-Stage Lunar Rover Component Assembly Game
  const initLunarExpedition = useCallback(() => {
    setAssemblyStageIndex(0);
    setPlannedMoves([]);
    setRoverExecStatus("PLANNING");
    setRoverStepIndex(0);
    setAssemblyHint(null);
  }, []);

  // Helper to cleanly transition between phases and reset stage progress
  const transitionToPhase = useCallback(
    (nextPhase: MoonMissionPhase) => {
      setPhase(nextPhase);
      setBriefingPage(0);
      setTypewriterIndex(0);
      setLoadProgress(0);
      if (nextPhase === "PHASE_E_EXPEDITION") {
        initLunarExpedition();
      }
      if (nextPhase === "STAGE_7" || nextPhase === "PHASE_F_VICTORY") {
        sfx.playVictoryFanfare();
      } else if (nextPhase !== "PHASE_A_BRIEFING") {
        sfx.playStageTransition();
      }
    },
    [initLunarExpedition]
  );

  // Typewriter effect with 8-bit voice blips
  useEffect(() => {
    if (phase !== "PHASE_A_BRIEFING" && !currentStage) return;
    if (typewriterIndex >= activeText.length) return;
    const timer = setTimeout(() => {
      setTypewriterIndex((prev) => prev + 1);
      const now = performance.now();
      if (now - lastBlipRef.current > 55) {
        sfx.playBlip(580 + ((typewriterIndex * 19) % 180));
        lastBlipRef.current = now;
      }
    }, 22);
    return () => clearTimeout(timer);
  }, [phase, currentStage, typewriterIndex, activeText]);

  // Advance to the next sequential stage
  const handleNextStage = useCallback(() => {
    sfx.playClick(740);
    if (phase === "PHASE_A_BRIEFING") {
      if (briefingPage < introBriefingPages.length - 1) {
        setBriefingPage((prev) => prev + 1);
        setTypewriterIndex(0);
      } else {
        transitionToPhase("PHASE_A_SOLUTIONS");
      }
      return;
    }
    const idx = MOON_STAGES.findIndex((s) => s.id === phase);
    if (idx >= 0 && idx < MOON_STAGES.length - 1) {
      transitionToPhase(MOON_STAGES[idx + 1].id);
    } else if (phase === "STAGE_7") {
      transitionToPhase("PHASE_E_EXPEDITION");
    }
  }, [phase, briefingPage, introBriefingPages.length, transitionToPhase]);

  const handleToggleSolutionSlide = useCallback((dir: -1 | 1) => {
    sfx.playClick(660);
    setSolutionSlideIndex((prev) => {
      const total = LUNAR_POWER_SOLUTIONS.length;
      return (prev + dir + total) % total;
    });
  }, []);

  const handleSelectSolution = useCallback(() => {
    const chosen = LUNAR_POWER_SOLUTIONS[solutionSlideIndex] || LUNAR_POWER_SOLUTIONS[0];
    setSelectedPowerSolution(chosen.id);
    setFairingSlots([null, null, null, null]);
    setFairingError(null);
    sfx.playCollect();
    setScore((prev) => prev + 500);
    transitionToPhase("PHASE_BC_CARGO");
  }, [solutionSlideIndex, transitionToPhase]);

  // Go back to previous stage
  const handlePrevStage = useCallback(() => {
    sfx.playClick(580);
    const idx = MOON_STAGES.findIndex((s) => s.id === phase);
    if (idx === 0) {
      transitionToPhase("PHASE_BC_CARGO");
    } else if (idx > 0) {
      transitionToPhase(MOON_STAGES[idx - 1].id);
    }
  }, [phase, transitionToPhase]);

  // Animated 0% -> 100% loading bar for Stages 1 through 7
  useEffect(() => {
    if (!currentStage) return;

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 2);
      });
    }, 110);

    return () => clearInterval(interval);
  }, [phase, currentStage]);

  // Auto-advance once loading reaches 100% and typewriter is finished (if autoAdvance is ON)
  useEffect(() => {
    if (
      !currentStage ||
      !autoAdvance ||
      loadProgress < 100 ||
      !isTypewriterDone
    ) {
      return;
    }
    const timeout = setTimeout(() => {
      handleNextStage();
    }, phase === "STAGE_7" ? 1300 : 950);
    return () => clearTimeout(timeout);
  }, [currentStage, phase, autoAdvance, loadProgress, isTypewriterDone, handleNextStage]);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE B/C: ROCKET FAIRING 4-SLOT PAYLOAD INTEGRATION LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  const equippedFairingCount = fairingSlots.filter(Boolean).length;

  const mismatchedSlotIndices = fairingSlots.reduce<number[]>((acc, partId, idx) => {
    if (!partId) return acc;
    const part = FAIRING_PAYLOAD_PARTS.find((p) => p.id === partId);
    if (part && part.solutionId !== selectedPowerSolution) {
      acc.push(idx);
    }
    return acc;
  }, []);

  const hasIncompatiblePayload = mismatchedSlotIndices.length > 0;
  const isFairingReadyToLaunch =
    equippedFairingCount === 4 && !hasIncompatiblePayload;

  const handleEquipPartToSlot = (partId: string, targetSlotIdx?: number) => {
    setFairingError(null);
    setFairingSlots((prev) => {
      const next = [...prev];
      const existingIdx = next.indexOf(partId);

      // If no specific slot was targeted and it's already equipped, unequip it
      if (targetSlotIdx === undefined && existingIdx !== -1) {
        sfx.playClick(450);
        next[existingIdx] = null;
        return next;
      }

      const slotToUse =
        targetSlotIdx !== undefined
          ? targetSlotIdx
          : next.findIndex((s) => s === null);

      if (slotToUse === -1) {
        sfx.playDamage();
        setFairingError("ALL 4 FAIRING SLOTS ARE FULL — CLICK A SLOT TO REMOVE A PART.");
        return prev;
      }

      if (existingIdx !== -1) {
        next[existingIdx] = null;
      }

      next[slotToUse] = partId;
      sfx.playCollect();
      return next;
    });
  };

  const handleRemoveFairingSlot = (slotIdx: number) => {
    if (!fairingSlots[slotIdx]) return;
    sfx.playClick(450);
    setFairingError(null);
    setFairingSlots((prev) => {
      const next = [...prev];
      next[slotIdx] = null;
      return next;
    });
  };

  const handleLaunchFromFairing = () => {
    if (equippedFairingCount < 4) {
      sfx.playDamage();
      setFairingError("FILL ALL 4 ROCKET FAIRING SLOTS BEFORE LAUNCH.");
      return;
    }
    if (hasIncompatiblePayload) {
      sfx.playDamage();
      setFairingError("INCOMPATIBLE PAYLOAD DETECTED — REMOVE NON-MATCHING SYSTEM");
      return;
    }
    sfx.playVictoryFanfare();
    setScore((prev) => prev + 1000);
    transitionToPhase("STAGE_1");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: 8x4 LUNAR ROVER PATH-PLANNING & COMPONENT ASSEMBLY LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  const activeAssemblyMap =
    LUNAR_ASSEMBLY_MAPS[assemblyStageIndex] || LUNAR_ASSEMBLY_MAPS[0];

  const activeStagePartId =
    selectedPowerSolution === "nuclear_reactor"
      ? activeAssemblyMap.nuclearPartId
      : activeAssemblyMap.solarPartId;

  const activeStagePartDef =
    FAIRING_PAYLOAD_PARTS.find((p) => p.id === activeStagePartId) ||
    FAIRING_PAYLOAD_PARTS[0];

  // Build simulated path cells starting from startCell
  const plannedPathCells: LunarGridCell[] = React.useMemo(() => {
    const cells: LunarGridCell[] = [activeAssemblyMap.startCell];
    for (const move of plannedMoves) {
      const last = cells[cells.length - 1];
      let nextCol = last.col;
      let nextRow = last.row;
      if (move === "W") nextRow = Math.max(0, last.row - 1);
      if (move === "S") nextRow = Math.min(LUNAR_GRID_ROWS - 1, last.row + 1);
      if (move === "A") nextCol = Math.max(0, last.col - 1);
      if (move === "D") nextCol = Math.min(LUNAR_GRID_COLS - 1, last.col + 1);
      cells.push({ col: nextCol, row: nextRow });
    }
    return cells;
  }, [activeAssemblyMap.startCell, plannedMoves]);

  const simTipCell =
    plannedPathCells[plannedPathCells.length - 1] || activeAssemblyMap.startCell;

  // Find the first step index where the simulated path passes through compCell
  const compPickupStepIndex = plannedPathCells.findIndex(
    (c) =>
      c.col === activeAssemblyMap.compCell.col &&
      c.row === activeAssemblyMap.compCell.row
  );

  const hasPickedUpComponentInSim = compPickupStepIndex !== -1;

  const isTipAtStation =
    simTipCell.col === activeAssemblyMap.stationCell.col &&
    simTipCell.row === activeAssemblyMap.stationCell.row;

  // Mandatory Rule: Path must pass through `comp` BEFORE reaching `station point`
  const isAtStationWithoutComp = isTipAtStation && !hasPickedUpComponentInSim;
  const isReadyToStartRover =
    hasPickedUpComponentInSim &&
    isTipAtStation &&
    compPickupStepIndex < plannedPathCells.length - 1;

  const handleQueueLunarMove = useCallback(
    (dir: LunarDirection) => {
      if (phase !== "PHASE_E_EXPEDITION" || roverExecStatus !== "PLANNING") return;
      setAssemblyHint(null);
      setPlannedMoves((prev) => {
        if (prev.length >= 28) return prev;
        let curCol = activeAssemblyMap.startCell.col;
        let curRow = activeAssemblyMap.startCell.row;
        for (const m of prev) {
          if (m === "W") curRow = Math.max(0, curRow - 1);
          if (m === "S") curRow = Math.min(LUNAR_GRID_ROWS - 1, curRow + 1);
          if (m === "A") curCol = Math.max(0, curCol - 1);
          if (m === "D") curCol = Math.min(LUNAR_GRID_COLS - 1, curCol + 1);
        }
        let nextCol = curCol;
        let nextRow = curRow;
        if (dir === "W") nextRow = Math.max(0, curRow - 1);
        if (dir === "S") nextRow = Math.min(LUNAR_GRID_ROWS - 1, curRow + 1);
        if (dir === "A") nextCol = Math.max(0, curCol - 1);
        if (dir === "D") nextCol = Math.min(LUNAR_GRID_COLS - 1, curCol + 1);

        if (nextCol === curCol && nextRow === curRow) {
          sfx.playDamage();
          return prev;
        }

        sfx.playBlip(640 + ((prev.length * 29) % 240));
        return [...prev, dir];
      });
    },
    [phase, roverExecStatus, activeAssemblyMap.startCell]
  );

  const handleUndoLunarMove = useCallback(() => {
    if (roverExecStatus !== "PLANNING") return;
    sfx.playClick(520);
    setAssemblyHint(null);
    setPlannedMoves((prev) => prev.slice(0, -1));
  }, [roverExecStatus]);

  const handleClearLunarMoves = useCallback(() => {
    if (roverExecStatus !== "PLANNING") return;
    sfx.playClick(460);
    setAssemblyHint(null);
    setPlannedMoves([]);
  }, [roverExecStatus]);

  const handleStartLunarRover = useCallback(() => {
    if (roverExecStatus !== "PLANNING") return;
    if (!hasPickedUpComponentInSim) {
      sfx.playDamage();
      setAssemblyHint("PICK UP COMPONENT FIRST BEFORE DOCKING AT STATION");
      return;
    }
    if (!isTipAtStation) {
      sfx.playDamage();
      setAssemblyHint("EXTEND PATH TO STATION POINT AFTER COLLECTING COMPONENT");
      return;
    }
    sfx.playCollect();
    setAssemblyHint(null);
    setRoverStepIndex(0);
    setRoverExecStatus("DRIVING");
  }, [roverExecStatus, hasPickedUpComponentInSim, isTipAtStation]);

  // Step-by-step Lunar Rover execution animation along plannedPathCells
  useEffect(() => {
    if (phase !== "PHASE_E_EXPEDITION" || roverExecStatus !== "DRIVING") return;

    if (roverStepIndex < plannedPathCells.length - 1) {
      const timer = setTimeout(() => {
        const nextIdx = roverStepIndex + 1;
        setRoverStepIndex(nextIdx);
        if (nextIdx === compPickupStepIndex) {
          sfx.playCollect();
        } else {
          sfx.playBlip(520 + ((nextIdx * 37) % 240));
        }
      }, 270);
      return () => clearTimeout(timer);
    }

    // Reached station point with component!
    const installTimer = setTimeout(() => {
      sfx.playVictoryFanfare();
      setRoverExecStatus("INSTALLING");
      setScore((prev) => prev + 650);
    }, 260);
    return () => clearTimeout(installTimer);
  }, [
    phase,
    roverExecStatus,
    roverStepIndex,
    plannedPathCells.length,
    compPickupStepIndex,
  ]);

  // Advance from INSTALLING -> next stage (or PHASE_F_VICTORY after Stage 4/4)
  useEffect(() => {
    if (phase !== "PHASE_E_EXPEDITION" || roverExecStatus !== "INSTALLING") return;

    const timer = setTimeout(() => {
      if (assemblyStageIndex < LUNAR_ASSEMBLY_MAPS.length - 1) {
        setAssemblyStageIndex((prev) => prev + 1);
        setPlannedMoves([]);
        setRoverStepIndex(0);
        setAssemblyHint(null);
        setRoverExecStatus("PLANNING");
        sfx.playStageTransition();
      } else {
        setRoverExecStatus("STAGE_COMPLETE");
        transitionToPhase("PHASE_F_VICTORY");
      }
    }, 1150);

    return () => clearTimeout(timer);
  }, [phase, roverExecStatus, assemblyStageIndex, transitionToPhase]);

  // ─────────────────────────────────────────────────────────────────────────
  // KEYBOARD CONTROLS ACROSS ALL PHASES
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "PHASE_A_SOLUTIONS") {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          e.preventDefault();
          handleToggleSolutionSlide(-1);
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          e.preventDefault();
          handleToggleSolutionSlide(1);
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSelectSolution();
        } else if (e.key === "Escape") {
          onAbort();
        }
        return;
      }

      if (phase === "PHASE_BC_CARGO") {
        if (e.key === "Escape") {
          onAbort();
        }
        return;
      }

      if (phase === "PHASE_E_EXPEDITION") {
        if (e.key === "w" || e.key === "W" || e.key === "ArrowUp") {
          e.preventDefault();
          handleQueueLunarMove("W");
        } else if (e.key === "s" || e.key === "S" || e.key === "ArrowDown") {
          e.preventDefault();
          handleQueueLunarMove("S");
        } else if (e.key === "a" || e.key === "A" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleQueueLunarMove("A");
        } else if (e.key === "d" || e.key === "D" || e.key === "ArrowRight") {
          e.preventDefault();
          handleQueueLunarMove("D");
        } else if (e.key === "Backspace") {
          e.preventDefault();
          handleUndoLunarMove();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleStartLunarRover();
        } else if (e.key === "Escape") {
          onAbort();
        }
        return;
      }

      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        if (phase === "PHASE_A_BRIEFING" || currentStage) {
          e.preventDefault();
          if (!isTypewriterDone) {
            setTypewriterIndex(activeText.length);
          } else {
            handleNextStage();
          }
        }
      } else if (e.key === "ArrowLeft") {
        if (currentStage) {
          handlePrevStage();
        }
      } else if (e.key === "Escape") {
        onAbort();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    phase,
    currentStage,
    isTypewriterDone,
    activeText.length,
    handleNextStage,
    handlePrevStage,
    handleToggleSolutionSlide,
    handleSelectSolution,
    handleQueueLunarMove,
    handleUndoLunarMove,
    handleStartLunarRover,
    onAbort,
  ]);

  const finalRank = score >= 3600 ? "S" : score >= 2600 ? "A" : "B";

  const activeSolutionSlide =
    LUNAR_POWER_SOLUTIONS[solutionSlideIndex] || LUNAR_POWER_SOLUTIONS[0];
  const chosenSolutionDef =
    LUNAR_POWER_SOLUTIONS.find((s) => s.id === selectedPowerSolution) ||
    LUNAR_POWER_SOLUTIONS[0];

  const lifecycleTag =
    phase === "PHASE_A_BRIEFING"
      ? "PHASE A // ARTEMIS LUNAR CONCEPT & OBJECTIVES"
      : phase === "PHASE_A_SOLUTIONS"
        ? "PHASE A // LUNAR SURFACE POWER ARCHITECTURE TRADE STUDY"
        : phase === "PHASE_BC_CARGO"
          ? "PHASE B/C // LUNAR LANDER CARGO BAY"
          : currentStage
            ? "PHASE D // SATURN V ASCENT & TRANSLUNAR TRANSIT"
            : phase === "PHASE_E_EXPEDITION"
              ? `PHASE E // LUNAR ROVER COMPONENT ASSEMBLY (${assemblyStageIndex + 1}/4)`
              : "PHASE F // LUNAR MISSION CLOSEOUT & ARCHIVAL REPORT";

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none flex flex-col font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CRYSTAL-CLEAR FULL-SCREEN NASA PHOTOGRAPH BACKDROP         */}
      {/*    (Zero blur, zero dark vignette, 100% full brightness)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {/* Base Moon backdrop during Phases A, B/C, E, F */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            !currentStage ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dest-moon.jpg"
            alt="NASA Moon Backdrop"
            className="w-full h-full object-cover object-center"
            style={{ imageRendering: "auto" }}
          />
        </div>

        {/* Pre-rendered 7-Stage NASA Photographs at 100% natural clarity & brightness */}
        {MOON_STAGES.map((stage) => {
          const isActive = phase === stage.id;
          return (
            <div
              key={stage.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                isActive ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stage.image}
                alt={stage.title}
                className="w-full h-full object-cover object-center"
                style={{ imageRendering: "auto" }}
              />
            </div>
          );
        })}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP TELEMETRY HEADER BAR                                   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-2.5 bg-slate-950/85 border-b-2 border-cyan-400/70 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              sfx.playClick(520);
              onAbort();
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-400 text-slate-100 font-press-start text-[10px] tracking-wider shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer arcade-btn"
          >
            &lt; MISSIONS
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-slate-900/90 border border-cyan-400/60">
            <span className="w-2 h-2 bg-cyan-400 animate-ping" />
            <span className="font-press-start text-[10px] text-cyan-200 tracking-wider">
              {lifecycleTag}
            </span>
          </div>
        </div>

        {/* Center 7-Stage Stepper Pills during Phase D */}
        {currentStage && (
          <div className="hidden lg:flex items-center gap-1.5">
            {MOON_STAGES.map((s) => {
              const isCurrent = phase === s.id;
              const isPassed = currentStage.stageNumber > s.stageNumber;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    sfx.playClick(680);
                    transitionToPhase(s.id);
                  }}
                  className={`px-2 py-1 font-press-start text-[9px] border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-cyan-400 text-slate-950 border-white shadow-[0_0_10px_rgba(34,211,238,0.8)] scale-105"
                      : isPassed
                        ? "bg-cyan-950/90 text-cyan-300 border-cyan-400/70"
                        : "bg-slate-900/80 text-slate-400 border-slate-700 hover:border-slate-400"
                  }`}
                  title={s.title}
                >
                  S{s.stageNumber}
                </button>
              );
            })}
          </div>
        )}

        {/* Right Controls: Score + Auto-Advance + Sound */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-cyan-400/60 font-press-start text-[10px] text-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>SCORE: {score}</span>
          </div>

          {currentStage && phase !== "STAGE_7" && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick(640);
                setAutoAdvance((prev) => !prev);
              }}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border-2 font-silkscreen text-[10px] font-bold shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn ${
                autoAdvance
                  ? "bg-cyan-950/90 border-cyan-400 text-cyan-200"
                  : "bg-slate-900 border-slate-500 text-slate-300"
              }`}
              title="Toggle Auto-Advance"
            >
              {autoAdvance ? (
                <>
                  <Pause className="w-3 h-3 text-cyan-300" />
                  <span>AUTO: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-slate-400" />
                  <span>AUTO: PAUSED</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={onToggleSound}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-300 text-slate-100 font-press-start text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
            title={soundOn ? "Mute SFX" : "Unmute SFX"}
          >
            {soundOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">SFX: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">SFX: OFF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. MAIN STAGE VIEWPORT                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="relative z-20 flex-1 w-full overflow-hidden flex flex-col justify-between p-3 sm:p-5">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE A: COMMANDER BRIEFING INTRO (15.14.33.jpeg)           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_A_BRIEFING" && (
          <div className="my-auto mx-auto w-full max-w-4xl flex items-center justify-center">
            <div
              className="relative w-full aspect-[937/530] max-h-[80vh] border-2 border-cyan-400 shadow-[8px_8px_0px_#000] overflow-hidden cursor-pointer bg-slate-950"
              onClick={() => {
                if (!isTypewriterDone) {
                  sfx.playClick(600);
                  setTypewriterIndex(activeText.length);
                } else {
                  handleNextStage();
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/WhatsApp Image 2026-11-14 at 15.14.33.jpeg"
                alt="Commander Briefing Intro"
                className="w-full h-full object-fill select-none"
              />

              {/* Top Banner Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1 bg-slate-950/90 border-2 border-cyan-400 shadow-[3px_3px_0px_#000] flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 animate-ping" />
                  <span className="font-press-start text-[9px] sm:text-[10px] text-cyan-200 tracking-wider">
                    PHASE A // ARTEMIS LUNAR CONCEPT &amp; OBJECTIVES
                  </span>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-slate-950/90 border-2 border-slate-400 text-[10px] font-silkscreen text-slate-200 shadow-[3px_3px_0px_#000]">
                  SOUTH POLE WATER-ICE &amp; SEISMIC SURVEY
                </div>
              </div>

              {/* Typewriter Dialogue Box Strictly Inside the Image's Cyan/Blue Block */}
              <div className="absolute left-[33%] right-[9.5%] top-[69%] bottom-[9%] flex flex-col justify-between overflow-hidden pointer-events-none">
                <div className="overflow-hidden pt-1">
                  <p className="font-pixel-body text-slate-100 text-[11px] sm:text-xs md:text-sm leading-snug drop-shadow-[0_1px_2px_#000]">
                    {activeText.slice(0, typewriterIndex)}
                    {!isTypewriterDone && (
                      <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
                  <span className="hidden sm:inline text-[8px] font-silkscreen text-cyan-300/90 truncate">
                    {!isTypewriterDone
                      ? "CLICK TO FAST-FORWARD..."
                      : briefingPage < introBriefingPages.length - 1
                        ? `PART ${briefingPage + 1} / ${introBriefingPages.length} — CLICK TO CONTINUE`
                        : "PHASE A COMPLETE — READY FOR CARGO PREP"}
                  </span>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isTypewriterDone) {
                        sfx.playClick(600);
                        setTypewriterIndex(activeText.length);
                      } else {
                        handleNextStage();
                      }
                    }}
                    className="pointer-events-auto ml-auto px-2.5 sm:px-3.5 py-1 bg-cyan-500 hover:bg-cyan-400 border border-white text-slate-950 font-press-start text-[8px] sm:text-[9px] uppercase shadow-[2px_2px_0px_#000] animate-pulse cursor-pointer arcade-btn shrink-0"
                  >
                    {!isTypewriterDone
                      ? "[ FAST-FORWARD ]"
                      : briefingPage < introBriefingPages.length - 1
                        ? "[ NEXT > ]"
                        : "[ EVALUATE POWER SOLUTIONS > ]"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE A2: 2-SLIDE ENGINEERING SOLUTION SELECTOR             */}
        {/* (/images/WhatsApp Image 2026-11-15 at 14.26.34.jpeg)        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_A_SOLUTIONS" && (
          <div
            className="fixed inset-0 z-30 bg-black overflow-hidden select-none"
            onTouchStart={(e) => {
              swipeStartXRef.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              if (swipeStartXRef.current === null) return;
              const endX = e.changedTouches[0]?.clientX ?? swipeStartXRef.current;
              const deltaX = endX - swipeStartXRef.current;
              if (Math.abs(deltaX) > 40) {
                handleToggleSolutionSlide(deltaX < 0 ? 1 : -1);
              }
              swipeStartXRef.current = null;
            }}
            onMouseDown={(e) => {
              swipeStartXRef.current = e.clientX;
            }}
            onMouseUp={(e) => {
              if (swipeStartXRef.current === null) return;
              const deltaX = e.clientX - swipeStartXRef.current;
              if (Math.abs(deltaX) > 50) {
                handleToggleSolutionSlide(deltaX < 0 ? 1 : -1);
              }
              swipeStartXRef.current = null;
            }}
          >
            {/* Full-screen HUD Frame Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/WhatsApp Image 2026-11-15 at 14.26.34.jpeg"
              alt="Lunar Surface Power Trade Study HUD"
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              style={{ imageRendering: "auto" }}
            />

            {/* Top-Left Back to Missions / Briefing Button */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick(520);
                  transitionToPhase("PHASE_A_BRIEFING");
                }}
                className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] sm:text-[10px] shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
              >
                &lt; BRIEFING
              </button>
            </div>

            {/* TOP HEADER AREA (Inside Upper Cyan Frame Above Green/Red Boxes) */}
            <div className="absolute left-[14.5%] right-[12.5%] top-[9.5%] h-[25.5%] flex flex-col items-center justify-center text-center px-3 sm:px-6">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-slate-950/85 border border-cyan-400/80 text-cyan-300 font-silkscreen text-[10px] sm:text-xs mb-1.5 shadow-[2px_2px_0px_#000]">
                <span>LUNAR SOUTH POLE POWER SYSTEM TRADE STUDY</span>
                <span className="text-amber-300 font-bold">
                  [{activeSolutionSlide.slideNumber} / {LUNAR_POWER_SOLUTIONS.length}]
                </span>
              </div>

              <h1 className="font-press-start text-sm sm:text-xl md:text-2xl lg:text-3xl text-white tracking-wider drop-shadow-[0_3px_0px_#000] uppercase">
                {activeSolutionSlide.title}
              </h1>

              <p className="font-silkscreen text-[10px] sm:text-xs text-cyan-200 mt-1.5 tracking-wide drop-shadow-[1px_1px_0px_#000]">
                {activeSolutionSlide.subtitle}
              </p>

              {/* Slide Dots + Swipe / Arrow Hint */}
              <div className="flex items-center gap-3 mt-2">
                {LUNAR_POWER_SOLUTIONS.map((sol, idx) => (
                  <button
                    key={sol.id}
                    type="button"
                    onClick={() => {
                      sfx.playClick(660);
                      setSolutionSlideIndex(idx);
                    }}
                    className={`px-2.5 py-0.5 font-press-start text-[8px] sm:text-[9px] border transition-all cursor-pointer ${
                      idx === solutionSlideIndex
                        ? "bg-cyan-400 text-slate-950 border-white shadow-[0_0_10px_rgba(34,211,238,0.9)]"
                        : "bg-slate-950/80 text-cyan-300 border-cyan-400/50 hover:border-cyan-300"
                    }`}
                  >
                    SOLUTION {sol.slideNumber}
                  </button>
                ))}
              </div>
            </div>

            {/* LEFT PIXEL ARROW BUTTON (<) */}
            <button
              type="button"
              onClick={() => handleToggleSolutionSlide(-1)}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-14 sm:w-12 sm:h-16 bg-slate-950/90 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border-2 border-cyan-400 hover:border-white flex items-center justify-center shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn transition-colors"
              title="Previous Solution (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* RIGHT PIXEL ARROW BUTTON (>) */}
            <button
              type="button"
              onClick={() => handleToggleSolutionSlide(1)}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-14 sm:w-12 sm:h-16 bg-slate-950/90 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 border-2 border-cyan-400 hover:border-white flex items-center justify-center shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn transition-colors"
              title="Next Solution (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* LEFT GREEN BOX (PROS) — Aligned Inside Left Green Translucent Panel */}
            <div className="absolute left-[17.3%] w-[33.8%] top-[38%] bottom-[15%] p-3 sm:p-5 md:p-6 flex flex-col justify-center overflow-hidden">
              <div className="border-b-2 border-emerald-200/60 pb-1.5 sm:pb-2 mb-2.5 sm:mb-4 flex items-center justify-between">
                <h2 className="font-press-start text-xs sm:text-base md:text-xl text-emerald-100 tracking-wider drop-shadow-[2px_2px_0px_#000]">
                  PROS
                </h2>
                <span className="font-silkscreen text-[9px] sm:text-[10px] px-2 py-0.5 bg-emerald-950/80 border border-emerald-300/60 text-emerald-200">
                  ADVANTAGES
                </span>
              </div>

              <ul className="space-y-2 sm:space-y-3.5">
                {activeSolutionSlide.pros.map((pro, idx) => (
                  <li
                    key={idx}
                    className="font-vt323 text-lg sm:text-2xl md:text-3xl text-white leading-tight drop-shadow-[2px_2px_0px_#000] flex items-start gap-2"
                  >
                    <span className="text-emerald-200 font-bold shrink-0">&bull;</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* RIGHT RED BOX (CONS) — Aligned Inside Right Red Translucent Panel */}
            <div className="absolute left-[53%] w-[33.8%] top-[38%] bottom-[15%] p-3 sm:p-5 md:p-6 flex flex-col justify-center overflow-hidden">
              <div className="border-b-2 border-rose-200/60 pb-1.5 sm:pb-2 mb-2.5 sm:mb-4 flex items-center justify-between">
                <h2 className="font-press-start text-xs sm:text-base md:text-xl text-rose-100 tracking-wider drop-shadow-[2px_2px_0px_#000]">
                  CONS
                </h2>
                <span className="font-silkscreen text-[9px] sm:text-[10px] px-2 py-0.5 bg-rose-950/80 border border-rose-300/60 text-rose-200">
                  TRADE-OFFS
                </span>
              </div>

              <ul className="space-y-2 sm:space-y-3.5">
                {activeSolutionSlide.cons.map((con, idx) => (
                  <li
                    key={idx}
                    className="font-vt323 text-lg sm:text-2xl md:text-3xl text-white leading-tight drop-shadow-[2px_2px_0px_#000] flex items-start gap-2"
                  >
                    <span className="text-rose-200 font-bold shrink-0">&bull;</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* BOTTOM-RIGHT [ SELECT ] BUTTON (Masks Static "NEXT" Text in Corner) */}
            <div className="absolute bottom-0 right-0 z-20 bg-slate-950 px-3 py-2.5 sm:px-5 sm:py-3 border-t-2 border-l-2 border-cyan-400/80 shadow-[-4px_-4px_0px_#000] flex items-center gap-3">
              <button
                type="button"
                onClick={handleSelectSolution}
                className="px-5 py-2.5 sm:px-7 sm:py-3 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-xs sm:text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0px_#000] hover:shadow-[0_0_16px_rgba(34,211,238,0.9)] cursor-pointer arcade-btn animate-pulse"
              >
                [ SELECT ]
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE B & C: ROCKET FAIRING PAYLOAD PACKING SCREEN          */}
        {/* (/images/WhatsApp Image 2026-11-15 at 14.40.47.jpeg)        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_BC_CARGO" && (
          <div className="fixed inset-0 z-30 bg-black overflow-hidden select-none">
            {/* Crystal-Clear Full-Screen Rocket Fairing & Cyan HUD Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/WhatsApp Image 2026-11-15 at 14.40.47.jpeg"
              alt="Rocket Fairing Payload Integration HUD"
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              style={{ imageRendering: "auto" }}
            />

            {/* Top-Left Navigation Bar */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick(520);
                  transitionToPhase("PHASE_A_SOLUTIONS");
                }}
                className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] sm:text-[10px] shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
              >
                &lt; CHANGE SOLUTION
              </button>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950/90 border border-cyan-400/70 font-press-start text-[9px] text-cyan-200 shadow-[3px_3px_0px_#000]">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>PHASE B/C // PAYLOAD INTEGRATION</span>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* LEFT SIDE: 4 INTERACTIVE ROCKET FAIRING SLOTS             */}
            {/* ───────────────────────────────────────────────────────── */}
            {FAIRING_SLOTS.map((slot) => {
              const installedPartId = fairingSlots[slot.index];
              const installedPart = installedPartId
                ? FAIRING_PAYLOAD_PARTS.find((p) => p.id === installedPartId)
                : null;
              const isMismatched =
                installedPart && installedPart.solutionId !== selectedPowerSolution;
              const isHovered = hoverSlotIndex === slot.index;

              return (
                <div
                  key={slot.index}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setHoverSlotIndex(slot.index);
                  }}
                  onDragLeave={() => setHoverSlotIndex(null)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setHoverSlotIndex(null);
                    const droppedId =
                      e.dataTransfer.getData("text/plain") || draggedPartId;
                    if (droppedId) {
                      handleEquipPartToSlot(droppedId, slot.index);
                      setDraggedPartId(null);
                    }
                  }}
                  onClick={() => {
                    if (installedPart) {
                      handleRemoveFairingSlot(slot.index);
                    }
                  }}
                  title={
                    installedPart
                      ? `${installedPart.name} — Click to remove`
                      : `${slot.label} — Drag or click a part from the right panel`
                  }
                  className={`absolute ${slot.className} z-20 flex flex-col items-center justify-center p-1 text-center transition-all ${
                    installedPart
                      ? isMismatched
                        ? "bg-rose-950/90 border-2 border-rose-500 shadow-[0_0_16px_rgba(244,63,94,0.9)] animate-pulse cursor-pointer"
                        : "bg-cyan-950/85 border-2 border-cyan-300 shadow-[0_0_14px_rgba(34,211,238,0.75)] cursor-pointer hover:bg-rose-950/70"
                      : isHovered
                        ? "bg-cyan-400/30 border-2 border-white shadow-[0_0_14px_rgba(34,211,238,0.85)]"
                        : "bg-slate-950/25 hover:bg-cyan-950/40 border border-cyan-400/40"
                  }`}
                >
                  {installedPart ? (
                    <>
                      <FairingPartPixelIcon
                        partId={installedPart.id}
                        className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 shrink-0 drop-shadow-[1px_1px_0px_#000]"
                      />
                      <span
                        className={`font-press-start text-[6px] sm:text-[7px] md:text-[8px] leading-tight mt-0.5 line-clamp-2 ${
                          isMismatched ? "text-rose-200" : "text-white"
                        }`}
                      >
                        {installedPart.shortLabel}
                      </span>
                      {isMismatched && (
                        <span className="font-silkscreen text-[7px] bg-rose-600 text-white px-1 mt-0.5">
                          MISMATCH
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-silkscreen text-[8px] sm:text-[9px] text-cyan-200/80 drop-shadow-[1px_1px_0px_#000]">
                      SLOT {slot.index + 1}
                    </span>
                  )}
                </div>
              );
            })}

            {/* ───────────────────────────────────────────────────────── */}
            {/* RIGHT SIDE: TOP DASHED HEADER RECTANGLE                   */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="absolute left-[63.0%] w-[29.6%] top-[14.3%] h-[9.2%] z-20 flex flex-col items-center justify-center text-center px-2 overflow-hidden">
              <h2 className="font-press-start text-[9px] sm:text-xs md:text-sm text-cyan-200 tracking-wider drop-shadow-[2px_2px_0px_#000]">
                PAYLOAD MANIFEST (4 SLOTS)
              </h2>
              <p className="font-silkscreen text-[9px] sm:text-xs text-amber-300 mt-0.5 truncate max-w-full drop-shadow-[1px_1px_0px_#000]">
                SELECTED: {chosenSolutionDef.shortName} ({equippedFairingCount}/4)
              </p>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* RIGHT SIDE: MAIN CYAN HUD INVENTORY BODY (ALL 8 ITEMS)    */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="absolute left-[62.2%] w-[31.2%] top-[24.8%] bottom-[8.5%] z-20 flex flex-col justify-between p-2 sm:p-3 overflow-hidden">
              {/* Scrollable / Compact 8-Item Hardware List */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-1.5">
                {FAIRING_PAYLOAD_PARTS.map((part) => {
                  const slotIdx = fairingSlots.indexOf(part.id);
                  const isEquipped = slotIdx !== -1;
                  const isEquippedMismatch =
                    isEquipped && part.solutionId !== selectedPowerSolution;

                  return (
                    <div
                      key={part.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedPartId(part.id);
                        e.dataTransfer.setData("text/plain", part.id);
                      }}
                      onDragEnd={() => {
                        setDraggedPartId(null);
                        setHoverSlotIndex(null);
                      }}
                      onClick={() => handleEquipPartToSlot(part.id)}
                      className={`w-full p-1.5 sm:p-2 border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                        isEquipped
                          ? isEquippedMismatch
                            ? "bg-rose-950/85 border-rose-400 text-rose-100"
                            : "bg-cyan-950/85 border-cyan-300 text-white shadow-[2px_2px_0px_#000]"
                          : "bg-slate-950/85 hover:bg-slate-900 border-cyan-500/40 hover:border-cyan-300 text-slate-100"
                      }`}
                    >
                      <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 border border-cyan-400/50 p-1 shrink-0 flex items-center justify-center">
                        <FairingPartPixelIcon
                          partId={part.id}
                          className="w-6 h-6 sm:w-7 sm:h-7"
                        />
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <p className="font-press-start text-[7px] sm:text-[8px] md:text-[9px] text-white leading-snug truncate">
                          {part.name}
                        </p>
                        <p className="font-silkscreen text-[8px] sm:text-[9px] text-cyan-300/90 truncate">
                          {isEquipped
                            ? `INSTALLED IN SLOT ${slotIdx + 1} (CLICK TO REMOVE)`
                            : "DRAG OR CLICK TO INSTALL IN FAIRING"}
                        </p>
                      </div>

                      {isEquipped && (
                        <span
                          className={`px-1.5 py-0.5 font-press-start text-[7px] shrink-0 border ${
                            isEquippedMismatch
                              ? "bg-rose-600 text-white border-rose-200 animate-pulse"
                              : "bg-emerald-500 text-slate-950 border-white"
                          }`}
                        >
                          EQUIPPED
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom Validation Banner & [ LAUNCH MISSION > ] Button */}
              <div className="pt-2 space-y-1.5 shrink-0">
                {(hasIncompatiblePayload || fairingError) && (
                  <div className="px-2.5 py-1.5 bg-rose-950/95 border-2 border-rose-400 text-rose-200 font-press-start text-[7px] sm:text-[8px] leading-snug text-center animate-pulse">
                    {hasIncompatiblePayload
                      ? "INCOMPATIBLE PAYLOAD DETECTED — REMOVE NON-MATCHING SYSTEM"
                      : fairingError}
                  </div>
                )}

                {equippedFairingCount < 4 ? (
                  <div className="px-2.5 py-2 bg-slate-950/90 border border-cyan-400/50 font-silkscreen text-[10px] sm:text-xs text-cyan-200 text-center">
                    INSTALL 4 COMPATIBLE {chosenSolutionDef.shortName} PARTS ({equippedFairingCount} / 4)
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchFromFairing}
                    className={`w-full py-2.5 px-3 border-2 font-press-start text-[9px] sm:text-xs font-bold uppercase shadow-[4px_4px_0px_#000] transition-all cursor-pointer arcade-btn ${
                      isFairingReadyToLaunch
                        ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 animate-pulse"
                        : "bg-rose-600 hover:bg-rose-500 border-rose-200 text-white"
                    }`}
                  >
                    [ LAUNCH MISSION &gt; ]
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE D (STAGES 1 TO 6): COMPACT BOTTOM HUD BAR ONLY        */}
        {/* (Upper & center portion of NASA photo 100% unobstructed)    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {currentStage && phase !== "STAGE_7" && (
          <div className="w-full max-w-5xl mx-auto mt-auto bg-slate-950/80 border-2 border-cyan-400/80 p-3.5 sm:p-5 shadow-[6px_6px_0px_#000] backdrop-blur-md space-y-2.5">
            {/* Stage Title, Badge & Telemetry Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-400/30 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 font-press-start text-[10px] font-bold">
                  STAGE {currentStage.stageNumber} / 7
                </span>
                <h2 className="text-sm sm:text-lg font-press-start text-white tracking-wide drop-shadow-[2px_2px_0px_#000]">
                  {currentStage.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-silkscreen">
                <span className="px-2 py-0.5 bg-slate-900/90 border border-cyan-400/50 text-cyan-200">
                  ALT: <strong className="text-white">{currentStage.telemetry.altitude}</strong>
                </span>
                <span className="px-2 py-0.5 bg-slate-900/90 border border-cyan-400/50 text-cyan-200">
                  VEL: <strong className="text-white">{currentStage.telemetry.velocity}</strong>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 bg-slate-900/90 border border-emerald-400/50 text-emerald-300">
                  {currentStage.telemetry.status}
                </span>
              </div>
            </div>

            {/* Exact Stage Description with Typewriter Reveal */}
            <div
              className="min-h-[48px] bg-slate-950/75 border border-slate-700/80 px-3.5 py-2 flex flex-col justify-center cursor-pointer"
              onClick={() => {
                if (!isTypewriterDone) {
                  setTypewriterIndex(activeText.length);
                }
              }}
              title="Click to reveal full description"
            >
              <p className="font-vt323 text-lg sm:text-2xl text-white leading-snug tracking-wide">
                &ldquo;{activeText.slice(0, typewriterIndex)}&rdquo;
                {!isTypewriterDone && (
                  <span className="inline-block w-2.5 h-5 bg-cyan-400 ml-1.5 animate-pulse align-middle" />
                )}
              </p>
              <p className="font-silkscreen text-[10px] text-cyan-300 mt-1">
                {currentStage.nasaFact}
              </p>
            </div>

            {/* 16-Bit Segmented Loading Bar + Stage Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
              {/* Segmented Progress Bar */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-silkscreen text-slate-200">
                  <span>
                    {loadProgress < 100
                      ? "PHASE D // TRANSLUNAR TRANSIT LOADING..."
                      : "STAGE TELEMETRY VERIFIED"}
                  </span>
                  <span className="text-cyan-300 font-bold">{loadProgress}%</span>
                </div>
                <div className="w-full h-4 bg-black/90 border-2 border-cyan-400/70 p-0.5 grid grid-cols-20 gap-0.5">
                  {Array.from({ length: 20 }).map((_, idx) => {
                    const threshold = (idx + 1) * 5;
                    const filled = loadProgress >= threshold;
                    return (
                      <div
                        key={idx}
                        className={`h-full transition-colors duration-150 ${
                          filled
                            ? "bg-gradient-to-t from-cyan-500 to-white shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                            : "bg-slate-900"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              {/* Previous / Next Stage Buttons */}
              <div className="flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevStage}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-slate-400 text-slate-200 hover:text-white font-press-start text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-300" />
                  <span>PREV</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStage}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                >
                  <span>
                    {currentStage.stageNumber === 6
                      ? "[ CONFIRM LUNAR LANDING > ]"
                      : "[ NEXT STAGE > ]"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 7: YOU HAVE SUCCESSFULLY LANDED ON MOON (BOTTOM HUD)  */}
        {/* (No Commander Victory Image here — saved for Phase F)       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "STAGE_7" && currentStage && (
          <div className="w-full max-w-5xl mx-auto mt-auto bg-slate-950/80 border-2 border-cyan-400/80 p-4 sm:p-5 shadow-[6px_6px_0px_#000] backdrop-blur-md space-y-3">
            {/* Headline Banner Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-400/40 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-press-start text-[9px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  STAGE 7 / 7
                </span>
                <h1 className="text-base sm:text-xl md:text-2xl font-press-start text-white tracking-wider drop-shadow-[2px_2px_0px_#000]">
                  YOU HAVE SUCCESSFULLY LANDED ON MOON
                </h1>
              </div>

              <div className="flex items-center gap-1.5 text-cyan-300 font-silkscreen text-xs shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>TOUCHDOWN CONFIRMED</span>
              </div>
            </div>

            {/* Typewriter Caption + Action Controls */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 bg-slate-950/75 border border-slate-700/80 px-3.5 py-2.5">
                <p className="font-vt323 text-lg sm:text-2xl text-slate-100 leading-snug">
                  &ldquo;{activeText.slice(0, typewriterIndex)}&rdquo;
                </p>
                <p className="font-silkscreen text-[10px] text-cyan-300 mt-1">
                  {currentStage.nasaFact}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => transitionToPhase("PHASE_E_EXPEDITION")}
                  className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-[10px] sm:text-xs font-bold shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                >
                  [ START PHASE E: LUNAR ROVER COMPONENT ASSEMBLY &gt; ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE E: 4-STAGE SEQUENTIAL LUNAR ROVER COMPONENT ASSEMBLY   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_E_EXPEDITION" && (
          <div className="fixed inset-0 top-[46px] z-30 bg-black select-none overflow-hidden">
            {/* Full-Screen 8x4 Lunar Surface Grid Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeAssemblyMap.gridImage}
              alt={activeAssemblyMap.title}
              className="w-full h-full object-cover object-center pointer-events-none"
              style={{ imageRendering: "auto" }}
            />

            {/* Top-Left Stage Progress & Active Component HUD Banner */}
            <div className="absolute left-[2.2%] top-[1.2%] z-30 flex flex-wrap items-center gap-2 bg-slate-950/90 border-2 border-cyan-400 px-3 py-1.5 shadow-[4px_4px_0px_#000]">
              <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 font-press-start text-[8px] sm:text-[9px] font-bold">
                {`MAP ${assemblyStageIndex + 1} / 4`}
              </span>
              <div className="flex items-center gap-1.5">
                <FairingPartPixelIcon
                  partId={activeStagePartDef.id}
                  className="w-5 h-5"
                />
                <span className="font-press-start text-[8px] sm:text-[9px] text-white tracking-wider">
                  {`${activeAssemblyMap.compBadge}: ${activeStagePartDef.name.toUpperCase()}`}
                </span>
              </div>
              <div className="hidden xl:flex items-center gap-1 ml-2 pl-2 border-l border-cyan-400/40">
                {LUNAR_ASSEMBLY_MAPS.map((m, idx) => {
                  const isDone = idx < assemblyStageIndex;
                  const isCurrent = idx === assemblyStageIndex;
                  return (
                    <span
                      key={m.compCode}
                      className={`px-1.5 py-0.5 font-press-start text-[7px] border ${
                        isDone
                          ? "bg-emerald-500 text-slate-950 border-white"
                          : isCurrent
                            ? "bg-cyan-950 text-cyan-200 border-cyan-300 animate-pulse"
                            : "bg-slate-900 text-slate-500 border-slate-700"
                      }`}
                    >
                      {isDone ? `${m.compBadge} ✓` : m.compBadge}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* 8x4 Interactive Grid Overlay (Cols 0-7, Rows 0-3) */}
            <div className="absolute left-[9.6%] top-[5.2%] w-[83.4%] h-[74.2%] z-20">
              {/* SVG Telemetry Path-Simulation Line Overlay */}
              <svg
                viewBox="0 0 800 400"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
              >
                {plannedPathCells.length > 1 && (
                  <>
                    {/* Outer Glow Polyline */}
                    <polyline
                      fill="none"
                      stroke={
                        isReadyToStartRover
                          ? "rgba(52, 211, 153, 0.55)"
                          : hasPickedUpComponentInSim
                            ? "rgba(250, 204, 21, 0.5)"
                            : "rgba(34, 211, 238, 0.5)"
                      }
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={plannedPathCells
                        .map(
                          (c) => `${c.col * 100 + 50},${c.row * 100 + 50}`
                        )
                        .join(" ")}
                    />
                    {/* Crisp Dashed Telemetry Path Line */}
                    <polyline
                      fill="none"
                      stroke={
                        isReadyToStartRover
                          ? "#34d399"
                          : hasPickedUpComponentInSim
                            ? "#fde047"
                            : "#22d3ee"
                      }
                      strokeWidth="5"
                      strokeDasharray="12 8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={plannedPathCells
                        .map(
                          (c) => `${c.col * 100 + 50},${c.row * 100 + 50}`
                        )
                        .join(" ")}
                    />
                  </>
                )}

                {/* Waypoint Nodes Along the Simulated Path */}
                {plannedPathCells.map((c, idx) => {
                  if (idx === 0) return null;
                  const cx = c.col * 100 + 50;
                  const cy = c.row * 100 + 50;
                  const isTip = idx === plannedPathCells.length - 1;
                  const isCompNode = idx === compPickupStepIndex;
                  return (
                    <g key={`${c.col}-${c.row}-${idx}`}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isTip || isCompNode ? 9 : 5}
                        fill={
                          isReadyToStartRover
                            ? "#34d399"
                            : isCompNode
                              ? "#fde047"
                              : "#22d3ee"
                        }
                        stroke="#020617"
                        strokeWidth="2.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* 8 Columns x 4 Rows Interactive Grid Cells */}
              <div className="w-full h-full grid grid-cols-8 grid-rows-4">
                {Array.from({ length: LUNAR_GRID_ROWS }).map((_, rIdx) =>
                  Array.from({ length: LUNAR_GRID_COLS }).map((__, cIdx) => {
                    const isStartCell =
                      activeAssemblyMap.startCell.col === cIdx &&
                      activeAssemblyMap.startCell.row === rIdx;
                    const isCompCell =
                      activeAssemblyMap.compCell.col === cIdx &&
                      activeAssemblyMap.compCell.row === rIdx;
                    const isStationCell =
                      activeAssemblyMap.stationCell.col === cIdx &&
                      activeAssemblyMap.stationCell.row === rIdx;

                    // Active Rover Position (stays at startCell during PLANNING, moves step-by-step during DRIVING/INSTALLING)
                    const currentRoverCell =
                      roverExecStatus === "PLANNING"
                        ? activeAssemblyMap.startCell
                        : plannedPathCells[roverStepIndex] ||
                          activeAssemblyMap.startCell;

                    const isRoverHere =
                      currentRoverCell.col === cIdx &&
                      currentRoverCell.row === rIdx;

                    // Has the driving rover physically picked up the component yet?
                    const hasRoverPhysicallyPickedUpComp =
                      roverExecStatus !== "PLANNING" &&
                      compPickupStepIndex !== -1 &&
                      roverStepIndex >= compPickupStepIndex;

                    const isSimTipHere =
                      roverExecStatus === "PLANNING" &&
                      plannedMoves.length > 0 &&
                      simTipCell.col === cIdx &&
                      simTipCell.row === rIdx;

                    // Allow clicking adjacent cell to queue a W/A/S/D move
                    const dCol = cIdx - simTipCell.col;
                    const dRow = rIdx - simTipCell.row;
                    const isAdjacentToTip =
                      roverExecStatus === "PLANNING" &&
                      Math.abs(dCol) + Math.abs(dRow) === 1;

                    const handleCellClick = () => {
                      if (!isAdjacentToTip) return;
                      if (dRow === -1) handleQueueLunarMove("W");
                      else if (dRow === 1) handleQueueLunarMove("S");
                      else if (dCol === -1) handleQueueLunarMove("A");
                      else if (dCol === 1) handleQueueLunarMove("D");
                    };

                    return (
                      <div
                        key={`lunar-cell-${cIdx}-${rIdx}`}
                        onClick={handleCellClick}
                        className={`relative flex items-center justify-center transition-colors ${
                          isAdjacentToTip
                            ? "cursor-pointer hover:bg-cyan-400/15"
                            : ""
                        }`}
                        title={`Grid (${cIdx}, ${rIdx})`}
                      >
                        {/* Component Crate & 16-Bit Hardware Sprite at compCell */}
                        {isCompCell && !hasRoverPhysicallyPickedUpComp && (
                          <div
                            className={`relative z-20 flex flex-col items-center justify-center px-2 py-1 border-2 shadow-[0_0_16px_rgba(0,0,0,0.9)] transition-all ${
                              hasPickedUpComponentInSim
                                ? "bg-emerald-950/95 border-emerald-300 shadow-[0_0_18px_rgba(52,211,153,0.9)] scale-105"
                                : "bg-slate-950/90 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.75)] animate-pulse"
                            }`}
                          >
                            <FairingPartPixelIcon
                              partId={activeStagePartDef.id}
                              className="w-7 h-7 sm:w-9 sm:h-9"
                            />
                            <span
                              className={`mt-0.5 px-1.5 py-0.5 font-press-start text-[6px] sm:text-[7px] font-bold tracking-wider ${
                                hasPickedUpComponentInSim
                                  ? "bg-emerald-400 text-slate-950"
                                  : "bg-amber-300 text-slate-950"
                              }`}
                            >
                              {hasPickedUpComponentInSim
                                ? `${activeAssemblyMap.compBadge} ACQUIRED ✓`
                                : `${activeAssemblyMap.compBadge}: ${activeStagePartDef.shortLabel}`}
                            </span>
                          </div>
                        )}

                        {/* Lunar Outpost Station Sprite at stationCell */}
                        {isStationCell && (
                          <div
                            className={`relative z-20 flex flex-col items-center justify-center px-2 py-1 border-2 transition-all ${
                              roverExecStatus === "INSTALLING"
                                ? "bg-emerald-950/95 border-emerald-300 shadow-[0_0_24px_rgba(52,211,153,1)] scale-110"
                                : isReadyToStartRover
                                  ? "bg-emerald-950/85 border-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]"
                                  : isAtStationWithoutComp
                                    ? "bg-rose-950/90 border-rose-400 shadow-[0_0_16px_rgba(244,63,94,0.9)]"
                                    : "bg-slate-950/90 border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.7)]"
                            }`}
                          >
                            <LunarStationPixelSprite
                              installedCount={
                                roverExecStatus === "INSTALLING"
                                  ? assemblyStageIndex + 1
                                  : assemblyStageIndex
                              }
                              isDocking={roverExecStatus === "INSTALLING"}
                              className="w-9 h-8 sm:w-12 sm:h-10"
                            />
                            <span
                              className={`mt-0.5 px-1.5 py-0.5 font-press-start text-[6px] sm:text-[7px] font-bold ${
                                roverExecStatus === "INSTALLING" ||
                                isReadyToStartRover
                                  ? "bg-emerald-400 text-slate-950"
                                  : isAtStationWithoutComp
                                    ? "bg-rose-500 text-white"
                                    : "bg-cyan-300 text-slate-950"
                              }`}
                            >
                              {roverExecStatus === "INSTALLING"
                                ? "INSTALLING MODULE..."
                                : `LUNAR STATION (${assemblyStageIndex}/4)`}
                            </span>
                          </div>
                        )}

                        {/* Lunar Exploration Rover Sprite */}
                        {isRoverHere && (
                          <div className="relative z-30 flex flex-col items-center justify-center pointer-events-none">
                            <div className="p-1 bg-slate-950/90 border-2 border-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.95)]">
                              <LunarRoverPixelSprite
                                carryingPartId={
                                  hasRoverPhysicallyPickedUpComp
                                    ? activeStagePartDef.id
                                    : null
                                }
                                className="w-10 h-8 sm:w-13 sm:h-10"
                              />
                            </div>
                            <span className="mt-0.5 px-1.5 py-0.5 bg-cyan-400 text-slate-950 font-press-start text-[6px] sm:text-[7px] font-bold shadow-[2px_2px_0px_#000]">
                              {hasRoverPhysicallyPickedUpComp
                                ? `CARRYING ${activeStagePartDef.shortLabel}`
                                : isStartCell && roverExecStatus === "PLANNING"
                                  ? "LUNAR ROVER // START"
                                  : "LUNAR ROVER"}
                            </span>
                          </div>
                        )}

                        {/* Simulated Path Tip Cursor Marker during PLANNING */}
                        {isSimTipHere && !isRoverHere && (
                          <div
                            className={`z-30 pointer-events-none px-1.5 py-0.5 border font-press-start text-[6px] sm:text-[7px] shadow-[2px_2px_0px_#000] ${
                              isReadyToStartRover
                                ? "bg-emerald-400 text-slate-950 border-white animate-bounce"
                                : isAtStationWithoutComp
                                  ? "bg-rose-600 text-white border-rose-200 animate-pulse"
                                  : "bg-cyan-950/95 text-cyan-200 border-cyan-300"
                            }`}
                          >
                            {isReadyToStartRover
                              ? "READY TO DOCK ✓"
                              : isAtStationWithoutComp
                                ? "MISSING COMP!"
                                : `STEP ${plannedMoves.length}`}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Bottom-Left HUD Mask Over Static "press WASD to move" Box */}
            <div className="absolute left-[9.2%] bottom-[3.2%] w-[48%] sm:w-[44%] min-h-[13.5%] z-30 bg-slate-950/95 border-2 border-cyan-400 p-2 sm:p-3 shadow-[6px_6px_0px_#000] flex flex-col justify-between gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-cyan-400/40 pb-1">
                <div className="flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
                  <span className="font-press-start text-[7px] sm:text-[9px] text-cyan-200">
                    {`PRESS WASD TO PLAN ROUTE: START -> ${activeAssemblyMap.compBadge} -> STATION`}
                  </span>
                </div>
                <span
                  className={`px-1.5 py-0.5 font-press-start text-[7px] border ${
                    hasPickedUpComponentInSim
                      ? "bg-emerald-950 border-emerald-400 text-emerald-300"
                      : "bg-amber-950/90 border-amber-400 text-amber-300"
                  }`}
                >
                  {hasPickedUpComponentInSim
                    ? "COMPONENT ACQUIRED ✓"
                    : `1. PICK UP ${activeAssemblyMap.compBadge}`}
                </span>
              </div>

              {/* Warning / Status Banner */}
              {(isAtStationWithoutComp || assemblyHint) && (
                <div className="px-2 py-1 bg-rose-950/95 border border-rose-400 text-rose-200 font-press-start text-[7px] sm:text-[8px] animate-pulse">
                  {assemblyHint ||
                    "PICK UP COMPONENT FIRST BEFORE DOCKING AT STATION"}
                </div>
              )}

              {/* D-Pad Controls + Queued Moves Readout + Undo/Clear */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  {(["W", "A", "S", "D"] as LunarDirection[]).map((dir) => (
                    <button
                      key={dir}
                      type="button"
                      disabled={roverExecStatus !== "PLANNING"}
                      onClick={() => handleQueueLunarMove(dir)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-900 hover:bg-cyan-400 hover:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] sm:text-[10px] font-bold shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-40"
                    >
                      {dir}
                    </button>
                  ))}
                </div>

                <div className="flex-1 min-w-[90px] px-2 py-1 bg-slate-900/90 border border-slate-700 font-silkscreen text-[9px] sm:text-[10px] text-cyan-200 truncate">
                  {plannedMoves.length === 0
                    ? "QUEUE: [ EMPTY — USE WASD OR CLICK ADJACENT CELLS ]"
                    : `QUEUE (${plannedMoves.length}): ${plannedMoves.join(" → ")}`}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={
                      roverExecStatus !== "PLANNING" ||
                      plannedMoves.length === 0
                    }
                    onClick={handleUndoLunarMove}
                    className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-400 text-slate-200 font-press-start text-[7px] sm:text-[8px] cursor-pointer disabled:opacity-40"
                  >
                    [ UNDO ]
                  </button>
                  <button
                    type="button"
                    disabled={
                      roverExecStatus !== "PLANNING" ||
                      plannedMoves.length === 0
                    }
                    onClick={handleClearLunarMoves}
                    className="px-2 py-1 bg-rose-950/90 hover:bg-rose-900 border border-rose-400 text-rose-200 font-press-start text-[7px] sm:text-[8px] cursor-pointer disabled:opacity-40"
                  >
                    [ CLEAR ]
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom-Right HUD Mask Over Static "start" Button Box */}
            <div className="absolute left-[68.0%] bottom-[3.2%] w-[25.5%] min-h-[13.5%] z-30 flex items-stretch">
              <button
                type="button"
                disabled={
                  roverExecStatus !== "PLANNING" || !isReadyToStartRover
                }
                onClick={handleStartLunarRover}
                className={`w-full px-3 py-2 border-2 font-press-start text-[9px] sm:text-xs md:text-sm font-bold uppercase shadow-[6px_6px_0px_#000] transition-all flex flex-col items-center justify-center gap-1 ${
                  roverExecStatus !== "PLANNING"
                    ? "bg-amber-400 border-white text-slate-950 cursor-wait"
                    : isReadyToStartRover
                      ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 cursor-pointer arcade-btn animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.85)]"
                      : "bg-slate-950/95 border-cyan-500/60 text-slate-400 cursor-not-allowed"
                }`}
              >
                <span>
                  {roverExecStatus === "DRIVING"
                    ? "ROVER DRIVING..."
                    : roverExecStatus === "INSTALLING"
                      ? `INSTALLING ${activeAssemblyMap.compBadge}...`
                      : "[ START ROVER / EXECUTE ]"}
                </span>
                <span className="font-silkscreen text-[8px] sm:text-[9px] tracking-normal opacity-90">
                  {roverExecStatus !== "PLANNING"
                    ? `STEP ${roverStepIndex} / ${plannedPathCells.length - 1}`
                    : isReadyToStartRover
                      ? `DELIVER ${activeStagePartDef.shortLabel} TO STATION`
                      : !hasPickedUpComponentInSim
                        ? `PASS OVER ${activeAssemblyMap.compBadge} FIRST`
                        : "NOW CONNECT PATH TO STATION"}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE F: FINAL VICTORY SCREEN (15.38.38.jpeg)               */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_F_VICTORY" && (
          <div className="my-auto mx-auto w-full max-w-4xl bg-slate-950/95 border-2 border-emerald-400 p-4 sm:p-6 shadow-[8px_8px_0px_#000] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Commander Victory Portrait */}
              <div className="md:col-span-5 border-2 border-emerald-400 overflow-hidden shadow-[4px_4px_0px_#000] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/WhatsApp Image 2026-11-14 at 15.38.38.jpeg"
                  alt="Commander Victory Portrait"
                  className="w-full h-56 sm:h-64 object-cover object-center"
                />
              </div>

              {/* Mission Debrief & Archival Report */}
              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-950 border border-emerald-400 text-emerald-300 font-press-start text-[9px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{`PHASE F // LUNAR MISSION CLOSEOUT & ARCHIVAL REPORT`}</span>
                </div>

                <h1 className="font-press-start text-base sm:text-xl text-emerald-300 tracking-wide">
                  - CONGRATULATIONS - MISSION SUCCESSFUL
                </h1>

                <p className="font-vt323 text-xl text-slate-200 leading-snug">
                  Commander {playerName}, all 4 {chosenSolutionDef.shortName} modules have been
                  delivered and assembled by the Lunar Rover at the South Pole Outpost Station!
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-silkscreen text-xs">
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">POWER SYSTEM</span>
                    <strong className="text-cyan-300">{chosenSolutionDef.shortName}</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">MODULES BUILT</span>
                    <strong className="text-white">4 / 4 ONLINE</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">SCORE</span>
                    <strong className="text-amber-300">{score} PTS</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-emerald-400/60">
                    <span className="text-slate-400 block text-[10px]">NASA RANK</span>
                    <strong className="text-emerald-300 text-sm">RANK {finalRank}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/90 border border-cyan-400/40 font-silkscreen text-[11px] text-cyan-200">
                  <strong>LESSONS LEARNED:</strong> Polar water-ice cores provide vital oxygen &amp;
                  hydrogen propellant for sustained lunar bases, while continuous Fission Surface
                  Power survives the 14-day freezing lunar night.
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => transitionToPhase("PHASE_E_EXPEDITION")}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400 text-cyan-200 font-press-start text-[10px] cursor-pointer"
                  >
                    [ REPLAY EXPEDITION ]
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(680);
                      onAbort();
                    }}
                    className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-[10px] font-bold shadow-[4px_4px_0px_#000] cursor-pointer"
                  >
                    [ RETURN TO MISSION SELECT ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE F: FAILURE / RETRY SCREEN (15.38.57.jpeg)             */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_F_FAILURE" && (
          <div className="my-auto mx-auto w-full max-w-4xl bg-slate-950/95 border-2 border-rose-500 p-4 sm:p-6 shadow-[8px_8px_0px_#000] space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-5 border-2 border-rose-500 overflow-hidden shadow-[4px_4px_0px_#000] bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/WhatsApp Image 2026-11-14 at 15.38.57.jpeg"
                  alt="Mission Failed Portrait"
                  className="w-full h-56 sm:h-64 object-cover object-center"
                />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-rose-950 border border-rose-400 text-rose-300 font-press-start text-[9px]">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>PHASE E // LUNAR SURFACE CONTINGENCY</span>
                </div>

                <h1 className="font-press-start text-base sm:text-xl text-rose-400 tracking-wide">
                  MISSION ABORTED — TELEMETRY LOST
                </h1>

                <p className="font-vt323 text-xl text-slate-200 leading-snug">
                  {failureReason}
                </p>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => transitionToPhase("PHASE_E_EXPEDITION")}
                    className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-[10px] font-bold shadow-[4px_4px_0px_#000] cursor-pointer"
                  >
                    [ RETRY PHASE E EXPEDITION &gt; ]
                  </button>
                  <button
                    type="button"
                    onClick={onAbort}
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-400 text-slate-200 font-press-start text-[10px] cursor-pointer"
                  >
                    [ RETURN TO MISSION SELECT ]
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
