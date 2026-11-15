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
  RotateCw,
  Trash2,
  Shield,
  Heart,
  Award,
  AlertTriangle,
  Radio,
  Package,
  Wrench,
  Cpu,
  Cable,
  Zap,
} from "lucide-react";

import { PlayerProgressPhase } from "@/lib/multiplayerSync";

export interface IssMissionProps {
  playerName: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onAbort: () => void;
  onPhaseProgress?: (phase: PlayerProgressPhase, strategyLabel?: string) => void;
  onMissionComplete?: (baseScore1000: number, strategyLabel: string) => void;
}

export type IssMissionPhase =
  | "PHASE_A_BRIEFING"
  | "PHASE_BC_CARGO"
  | "STAGE_1"
  | "STAGE_2"
  | "STAGE_3"
  | "STAGE_4"
  | "STAGE_5"
  | "STAGE_6"
  | "STAGE_7"
  | "PHASE_E_EVA"
  | "PHASE_F_VICTORY"
  | "PHASE_F_FAILURE";

interface IssStageDefinition {
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

interface IssCargoItem {
  id: string;
  name: string;
  w: number;
  h: number;
  weight: number;
  required: boolean;
  color: string;
  borderColor: string;
  description: string;
}

interface PlacedIssCargo {
  uid: string;
  itemId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface FloatingSparePart {
  id: number;
  label: string;
  x: number;
  y: number;
  collected: boolean;
}

interface DebrisHazard {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  angle: number;
  vRot: number;
}

interface NitrogenPuff {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

type CableColor = "CYAN" | "AMBER" | "EMERALD" | "MAGENTA";

interface WireDef {
  id: CableColor;
  label: string;
  hexMain: string;
  hexLight: string;
  hexDark: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
}

const WIRE_DEFS: Record<CableColor, WireDef> = {
  CYAN: {
    id: "CYAN",
    label: "S-BAND RF DATA",
    hexMain: "#06b6d4",
    hexLight: "#67e8f9",
    hexDark: "#0e7490",
    badgeBg: "bg-cyan-500/20",
    badgeBorder: "border-cyan-400",
    badgeText: "text-cyan-300",
  },
  AMBER: {
    id: "AMBER",
    label: "28V DC MAIN BUS",
    hexMain: "#f59e0b",
    hexLight: "#fde047",
    hexDark: "#b45309",
    badgeBg: "bg-amber-500/20",
    badgeBorder: "border-amber-400",
    badgeText: "text-amber-300",
  },
  EMERALD: {
    id: "EMERALD",
    label: "OPTICAL SYNC",
    hexMain: "#10b981",
    hexLight: "#6ee7b7",
    hexDark: "#047857",
    badgeBg: "bg-emerald-500/20",
    badgeBorder: "border-emerald-400",
    badgeText: "text-emerald-300",
  },
  MAGENTA: {
    id: "MAGENTA",
    label: "KU-BAND TELEMETRY",
    hexMain: "#d946ef",
    hexLight: "#f0abfc",
    hexDark: "#86198f",
    badgeBg: "bg-fuchsia-500/20",
    badgeBorder: "border-fuchsia-400",
    badgeText: "text-fuchsia-300",
  },
};

const LEFT_WIRE_ORDER: CableColor[] = ["CYAN", "AMBER", "EMERALD", "MAGENTA"];
// Shuffled right-hand socket order for authentic Among Us crossed-wire routing
const RIGHT_SOCKET_ORDER: CableColor[] = ["EMERALD", "CYAN", "MAGENTA", "AMBER"];

const ISS_CARGO_ITEMS: IssCargoItem[] = [
  {
    id: "sband_transponder",
    name: "S-BAND TRANSPONDER (2x2)",
    w: 2,
    h: 2,
    weight: 32,
    required: true,
    color: "bg-cyan-950/90",
    borderColor: "border-cyan-300",
    description:
      "Required high-gain S-band transceiver assembly wrapped in gold MLI thermal foil to replace the damaged relay on the ISS external comms array.",
  },
  {
    id: "fiber_harness",
    name: "FIBER OPTIC HARNESS (1x3)",
    w: 1,
    h: 3,
    weight: 18,
    required: true,
    color: "bg-sky-950/90",
    borderColor: "border-sky-300",
    description:
      "Required radiation-shielded telemetry cable bundle with gold MIL-SPEC connectors for reconnecting the 4 severed bus lines.",
  },
  {
    id: "eva_torque_wrench",
    name: "EVA TORQUE WRENCH (2x1)",
    w: 2,
    h: 1,
    weight: 16,
    required: true,
    color: "bg-amber-950/90",
    borderColor: "border-amber-300",
    description:
      "Required zero-reaction pistol-grip power tool used by astronauts in microgravity so bolt torque doesn't spin the crewmember.",
  },
  {
    id: "thermal_circuit_board",
    name: "THERMAL CIRCUIT BOARD (1x2)",
    w: 1,
    h: 2,
    weight: 14,
    required: true,
    color: "bg-emerald-950/90",
    borderColor: "border-emerald-300",
    description:
      "Required avionics voltage regulator PCB with dual copper heat-pipes to swap out the fried capacitor bank inside the truss junction box.",
  },
  {
    id: "pool_floatie",
    name: "POOL FLOATIE (2x2)",
    w: 2,
    h: 2,
    weight: 12,
    required: false,
    color: "bg-rose-950/85",
    borderColor: "border-rose-400",
    description:
      "DECOY ITEM! Non-flight inflatable pink flamingo beach toy—never certified for vacuum or Dragon pressurized cargo!",
  },
  {
    id: "cast_iron_skillet",
    name: "CAST IRON SKILLET (1x3)",
    w: 1,
    h: 3,
    weight: 38,
    required: false,
    color: "bg-purple-950/85",
    borderColor: "border-purple-400",
    description:
      "DECOY ITEM! Heavy unstrapped cast-iron frying pan—useless in microgravity and wastes critical Falcon 9 upmass!",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 16-BIT PIXEL ART HARDWARE SPRITE RENDERER (SVG PIXEL ART)
// ─────────────────────────────────────────────────────────────────────────────
function PixelCargoSprite({
  itemId,
  className = "w-12 h-12",
}: {
  itemId: string;
  className?: string;
}) {
  switch (itemId) {
    case "sband_transponder":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Gold MLI Thermal Foil Housing */}
          <rect x="4" y="10" width="24" height="18" fill="#d97706" />
          <rect x="6" y="12" width="20" height="14" fill="#fbbf24" />
          <rect x="8" y="14" width="10" height="6" fill="#0f172a" />
          {/* Blinking green/cyan telemetry LEDs */}
          <rect x="9" y="15" width="3" height="3" fill="#22d3ee" />
          <rect x="14" y="15" width="3" height="3" fill="#4ade80" />
          {/* Metallic Waveguide & Parabolic Dish */}
          <rect x="14" y="5" width="4" height="6" fill="#94a3b8" />
          <rect x="9" y="2" width="14" height="4" fill="#e2e8f0" />
          <rect x="15" y="0" width="2" height="3" fill="#38bdf8" />
          {/* Copper cooling fins */}
          <rect x="20" y="14" width="4" height="10" fill="#b45309" />
          <rect x="21" y="15" width="2" height="8" fill="#fde047" />
        </svg>
      );

    case "fiber_harness":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Coiled Cyan & Blue Fiber Optic Loops */}
          <rect x="8" y="5" width="16" height="22" fill="#0369a1" />
          <rect x="10" y="7" width="12" height="18" fill="#0f172a" />
          <rect x="6" y="8" width="2" height="16" fill="#22d3ee" />
          <rect x="24" y="8" width="2" height="16" fill="#22d3ee" />
          <rect x="9" y="11" width="14" height="3" fill="#38bdf8" />
          <rect x="9" y="18" width="14" height="3" fill="#38bdf8" />
          {/* Gold MIL-SPEC Connectors */}
          <rect x="11" y="1" width="4" height="5" fill="#fbbf24" />
          <rect x="17" y="1" width="4" height="5" fill="#fbbf24" />
          <rect x="11" y="26" width="4" height="5" fill="#f59e0b" />
          <rect x="17" y="26" width="4" height="5" fill="#f59e0b" />
        </svg>
      );

    case "eva_torque_wrench":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* NASA Pistol-Grip Zero-Reaction Power Tool */}
          <rect x="3" y="9" width="20" height="9" fill="#e2e8f0" />
          <rect x="5" y="11" width="10" height="5" fill="#0284c7" />
          {/* Digital Torque Readout */}
          <rect x="6" y="12" width="6" height="3" fill="#38bdf8" />
          {/* Heavy Hex Socket Drive Head */}
          <rect x="23" y="8" width="6" height="11" fill="#64748b" />
          <rect x="25" y="11" width="4" height="5" fill="#fbbf24" />
          {/* Pistol Handle & Battery Pack */}
          <rect x="9" y="18" width="7" height="9" fill="#94a3b8" />
          <rect x="16" y="18" width="3" height="4" fill="#ef4444" />
          <rect x="7" y="26" width="11" height="4" fill="#f59e0b" />
        </svg>
      );

    case "thermal_circuit_board":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Emerald Solder-Mask PCB */}
          <rect x="5" y="3" width="22" height="26" fill="#065f46" />
          <rect x="7" y="5" width="18" height="22" fill="#047857" />
          {/* Dual Silicon Microprocessors */}
          <rect x="9" y="7" width="8" height="8" fill="#1e293b" />
          <rect x="11" y="9" width="4" height="4" fill="#38bdf8" />
          <rect x="9" y="17" width="8" height="7" fill="#1e293b" />
          <rect x="11" y="19" width="4" height="3" fill="#fbbf24" />
          {/* Copper Heat Pipes & Gold Edge Fingers */}
          <rect x="19" y="6" width="4" height="18" fill="#f59e0b" />
          <rect x="6" y="27" width="3" height="3" fill="#fde047" />
          <rect x="11" y="27" width="3" height="3" fill="#fde047" />
          <rect x="16" y="27" width="3" height="3" fill="#fde047" />
          <rect x="21" y="27" width="3" height="3" fill="#fde047" />
        </svg>
      );

    case "pool_floatie":
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Pink Flamingo Pool Ring Decoy */}
          <rect x="5" y="14" width="22" height="12" fill="#ec4899" />
          <rect x="8" y="12" width="16" height="16" fill="#f472b6" />
          <rect x="11" y="16" width="10" height="6" fill="#0f172a" />
          {/* Flamingo Neck & Beak */}
          <rect x="20" y="4" width="4" height="10" fill="#ec4899" />
          <rect x="17" y="3" width="7" height="4" fill="#f472b6" />
          <rect x="14" y="4" width="3" height="3" fill="#fde047" />
          <rect x="19" y="4" width="2" height="2" fill="#000000" />
        </svg>
      );

    case "cast_iron_skillet":
    default:
      return (
        <svg
          viewBox="0 0 32 32"
          className={className}
          style={{ shapeRendering: "crispEdges" }}
        >
          {/* Heavy Cast-Iron Pan + Sunny-Side-Up Egg */}
          <rect x="14" y="2" width="4" height="9" fill="#334155" />
          <rect x="15" y="3" width="2" height="3" fill="#0f172a" />
          <rect x="6" y="11" width="20" height="18" fill="#1e293b" />
          <rect x="8" y="13" width="16" height="14" fill="#334155" />
          {/* Fried Egg Inside */}
          <rect x="10" y="15" width="11" height="9" fill="#f8fafc" />
          <rect x="13" y="17" width="5" height="5" fill="#f59e0b" />
          <rect x="14" y="18" width="2" height="2" fill="#fde047" />
        </svg>
      );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXACT 7 SEQUENTIAL ISS LOADING STAGES (EXACT IMAGES & EXACT TEXT)
// ─────────────────────────────────────────────────────────────────────────────
const ISS_TRANSIT_STAGES: IssStageDefinition[] = [
  {
    id: "STAGE_1",
    stageNumber: 1,
    title: "Stage 1: Ignition & Liftoff",
    image: "/images/WhatsApp Image 2026-11-15 at 11.15.26_2.jpeg",
    description:
      "Nine Merlin engines ignite simultaneously, producing 1.7 million lbs of thrust to lift the capsule toward Low Earth Orbit.",
    nasaFact:
      "NASA FACT: Falcon 9's nine Merlin 1D engines burn super-cooled liquid oxygen and RP-1 rocket-grade kerosene.",
    telemetry: {
      altitude: "0.6 KM",
      velocity: "0.21 KM/S",
      status: "9x MERLIN 1D @ FULL THRUST",
    },
  },
  {
    id: "STAGE_2",
    stageNumber: 2,
    title: "Stage 2: Pitch, Roll & Max Q",
    image: "/images/WhatsApp Image 2026-11-15 at 11.15.46_2.jpeg",
    description:
      "The rocket automatically steers to precisely match the International Space Station’s 51.6-degree orbital inclination.",
    nasaFact:
      "NASA FACT: Max Q is the point of maximum aerodynamic stress on the vehicle as it accelerates past Mach 1.",
    telemetry: {
      altitude: "14.2 KM",
      velocity: "0.58 KM/S",
      status: "51.6° INCLINATION ROLL LOCKED",
    },
  },
  {
    id: "STAGE_3",
    stageNumber: 3,
    title: "Stage 3: MECO & Separation",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.00_2.jpeg",
    description:
      "Main Engine Cut-Off (MECO). The first stage detaches and prepares to flip for its automated return landing back on Earth.",
    nasaFact:
      "NASA FACT: Using cold-gas nitrogen thrusters and titanium grid fins, the first stage booster lands autonomously for reuse.",
    telemetry: {
      altitude: "79.5 KM",
      velocity: "2.34 KM/S",
      status: "MECO // STAGE 1 SEPARATION",
    },
  },
  {
    id: "STAGE_4",
    stageNumber: 4,
    title: "Stage 4: Orbital Insertion",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.14_2.jpeg",
    description:
      "Second stage shuts down. The spacecraft achieves its target orbital velocity of 7.67 km/s (27,600 km/h). Welcome to zero gravity.",
    nasaFact:
      "NASA FACT: At 27,600 km/h in Low Earth Orbit (408 km), the ISS circles Earth every 90 minutes—16 sunrises and sunsets daily!",
    telemetry: {
      altitude: "402.0 KM",
      velocity: "7.67 KM/S",
      status: "SECO // LEO ORBITAL INSERTION",
    },
  },
  {
    id: "STAGE_5",
    stageNumber: 5,
    title: "Stage 5: Proximity Operations",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.30_2.jpeg",
    description:
      "Approaching the station. The spacecraft's relative speed is carefully reduced to just 0.1 meters per second for a safe approach.",
    nasaFact:
      "NASA FACT: Laser LIDAR sensors measure distance and closure rate to the millimeter as the capsule enters the 200m Keep-Out Sphere.",
    telemetry: {
      altitude: "408.0 KM (ISS)",
      velocity: "0.10 M/S REL",
      status: "LIDAR RENDEZVOUS CORRIDOR",
    },
  },
  {
    id: "STAGE_6",
    stageNumber: 6,
    title: "Stage 6: Docking Confirmed",
    image: "/images/WhatsApp Image 2026-11-15 at 11.18.33 (1).jpeg",
    description:
      "Mission Success! You have successfully docked with the International Space Station, orbiting 400 km above the Earth.",
    nasaFact:
      "NASA FACT: Twelve mechanical structural hooks latch tightly to form an airtight seal between the spacecraft and Harmony Node 2.",
    telemetry: {
      altitude: "408.0 KM (ISS)",
      velocity: "0.00 M/S REL",
      status: "HARD CAPTURE // LATCHES LOCKED",
    },
  },
  {
    id: "STAGE_7",
    stageNumber: 7,
    title: "YOU HAVE SUCCESSFULLY ARRIVED AT ISS",
    image: "/images/WhatsApp Image 2026-11-15 at 11.18.12 (1).jpeg",
    description:
      "Hard capture and vestibule pressurization complete! Equalizing hatch pressure at 14.7 psi—suit up in your EMU spacesuit and enter the Quest Airlock for your 2D Zero-G EVA Spacewalk!",
    nasaFact:
      "NASA FACT: Astronauts pre-breathe pure oxygen before an EVA spacewalk to purge nitrogen and prevent decompression sickness.",
    telemetry: {
      altitude: "408.0 KM (LEO)",
      velocity: "7.67 KM/S (27,600 KM/H)",
      status: "DOCKED // QUEST AIRLOCK READY",
    },
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 8-BIT WEB AUDIO SYNTHESIZER
// ─────────────────────────────────────────────────────────────────────────────
class IssChiptuneEngine {
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

  playBlip(freq = 680) {
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

  playWireSnap() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 783.99, 1174.66].forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.045);
        gain.gain.setValueAtTime(0.09, now + idx * 0.045);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.045 + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.045);
        osc.stop(now + idx * 0.045 + 0.14);
      });
    } catch {}
  }

  playCollect() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [587.33, 783.99, 1046.5].forEach((freq, idx) => {
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
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(60, now + 0.25);
      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.27);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.27);
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

const sfx = new IssChiptuneEngine();

// Coordinate helpers for the 360x220 Among Us-style wire box SVG viewBox
const getLeftTerminalY = (rowIndex: number) => 38 + rowIndex * 48;
const getRightTerminalY = (rowIndex: number) => 38 + rowIndex * 48;
const LEFT_TERMINAL_X = 58;
const RIGHT_TERMINAL_X = 302;

export default function IssMission({
  playerName,
  soundOn,
  onToggleSound,
  onAbort,
  onPhaseProgress,
  onMissionComplete,
}: IssMissionProps) {
  const [phase, setPhase] = useState<IssMissionPhase>("PHASE_A_BRIEFING");
  const [briefingPage, setBriefingPage] = useState<number>(0);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE B & C: 4x4 DRAGON CARGO BAY STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [placedCargo, setPlacedCargo] = useState<PlacedIssCargo[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string>("sband_transponder");
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [cargoFeedback, setCargoFeedback] = useState<string>(
    "SELECT A REQUIRED ISS EVA TOOL AND PACK IT INSIDE THE 4x4 DRAGON CARGO BAY."
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: 2D ZERO-G EVA SPACEWALK & AMONG US WIRE PANEL STATE
  // ─────────────────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wireSvgRef = useRef<SVGSVGElement | null>(null);

  const [evaOxygenLeft, setEvaOxygenLeft] = useState<number>(105);
  const [suitIntegrity, setSuitIntegrity] = useState<number>(3);
  const [sparesCollected, setSparesCollected] = useState<number>(0);
  const [nearCommsPanel, setNearCommsPanel] = useState<boolean>(false);
  const [panelOverlayOpen, setPanelOverlayOpen] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>("");

  // Among Us Drag-and-Drop Wire State
  const [connectedCables, setConnectedCables] = useState<Record<CableColor, boolean>>({
    CYAN: false,
    AMBER: false,
    EMERALD: false,
    MAGENTA: false,
  });
  const [draggingWire, setDraggingWire] = useState<CableColor | null>(null);
  const [dragCursor, setDragCursor] = useState<{ x: number; y: number } | null>(null);
  const [hoveredSocket, setHoveredSocket] = useState<CableColor | null>(null);
  const [sparkSocket, setSparkSocket] = useState<CableColor | null>(null);
  const [capacitorReplaced, setCapacitorReplaced] = useState<boolean>(false);
  const [relayReplaced, setRelayReplaced] = useState<boolean>(false);

  const keysRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const astroRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    facing: 1 | -1;
    invulnFrames: number;
  }>({
    x: 90,
    y: 200,
    vx: 0,
    vy: 0,
    facing: 1,
    invulnFrames: 0,
  });

  const sparesRef = useRef<FloatingSparePart[]>([]);
  const debrisRef = useRef<DebrisHazard[]>([]);
  const puffsRef = useRef<NitrogenPuff[]>([]);
  const lastBlipRef = useRef<number>(0);

  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  const introBriefingPages = [
    `Welcome back ${playerName}! The ISS is experiencing a critical communication failure, and we’ve lost all signal with our astronauts on board.`,
    `You are being charge to restore the connection. Now, gather your gear and prepare for launch.`,
  ];

  const currentStage = ISS_TRANSIT_STAGES.find((s) => s.id === phase) || null;
  const activeText =
    phase === "PHASE_A_BRIEFING"
      ? introBriefingPages[briefingPage] || introBriefingPages[0]
      : currentStage?.description || "";

  const isTypewriterDone = typewriterIndex >= activeText.length;

  // Initialize Phase E 2D Zero-G EVA Spacewalk
  const initEvaSpacewalk = useCallback(() => {
    astroRef.current = {
      x: 90,
      y: 200,
      vx: 0,
      vy: 0,
      facing: 1,
      invulnFrames: 0,
    };
    setEvaOxygenLeft(105);
    setSuitIntegrity(3);
    setSparesCollected(0);
    setNearCommsPanel(false);
    setPanelOverlayOpen(false);
    setDraggingWire(null);
    setDragCursor(null);
    setHoveredSocket(null);
    setSparkSocket(null);
    setConnectedCables({
      CYAN: false,
      AMBER: false,
      EMERALD: false,
      MAGENTA: false,
    });
    setCapacitorReplaced(false);
    setRelayReplaced(false);

    sparesRef.current = [
      { id: 1, label: "COOLANT CELL #1", x: 520, y: 120, collected: false },
      { id: 2, label: "AVIONICS FUSE #2", x: 1080, y: 270, collected: false },
      { id: 3, label: "S-BAND COUPLER #3", x: 1620, y: 135, collected: false },
    ];

    debrisRef.current = [
      { id: 1, x: 420, y: 180, vx: -0.9, vy: 1.15, r: 15, angle: 0, vRot: 0.04 },
      { id: 2, x: 780, y: 255, vx: 0.8, vy: -1.25, r: 17, angle: 1.2, vRot: -0.05 },
      { id: 3, x: 1220, y: 150, vx: -1.1, vy: 1.3, r: 16, angle: 2.1, vRot: 0.045 },
      { id: 4, x: 1520, y: 240, vx: 0.9, vy: -1.15, r: 17, angle: 0.5, vRot: -0.035 },
      { id: 5, x: 1860, y: 190, vx: -1.0, vy: 1.2, r: 16, angle: 3.0, vRot: 0.05 },
    ];

    puffsRef.current = [];
  }, []);

  const transitionToPhase = useCallback(
    (nextPhase: IssMissionPhase) => {
      setPhase(nextPhase);
      setBriefingPage(0);
      setTypewriterIndex(0);
      setLoadProgress(0);
      if (nextPhase === "PHASE_E_EVA") {
        initEvaSpacewalk();
      }
      if (nextPhase === "STAGE_7" || nextPhase === "PHASE_F_VICTORY") {
        sfx.playVictoryFanfare();
      } else if (nextPhase !== "PHASE_A_BRIEFING") {
        sfx.playStageTransition();
      }
    },
    [initEvaSpacewalk]
  );

  // Typewriter effect with 8-bit voice blips
  useEffect(() => {
    if (phase !== "PHASE_A_BRIEFING" && !currentStage) return;
    if (typewriterIndex >= activeText.length) return;
    const timer = setTimeout(() => {
      setTypewriterIndex((prev) => prev + 1);
      const now = performance.now();
      if (now - lastBlipRef.current > 55) {
        sfx.playBlip(610 + ((typewriterIndex * 19) % 180));
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
        transitionToPhase("PHASE_BC_CARGO");
      }
      return;
    }
    const idx = ISS_TRANSIT_STAGES.findIndex((s) => s.id === phase);
    if (idx >= 0 && idx < ISS_TRANSIT_STAGES.length - 1) {
      transitionToPhase(ISS_TRANSIT_STAGES[idx + 1].id);
    } else if (phase === "STAGE_7") {
      transitionToPhase("PHASE_E_EVA");
    }
  }, [phase, briefingPage, introBriefingPages.length, transitionToPhase]);

  const handlePrevStage = useCallback(() => {
    sfx.playClick(580);
    const idx = ISS_TRANSIT_STAGES.findIndex((s) => s.id === phase);
    if (idx === 0) {
      transitionToPhase("PHASE_BC_CARGO");
    } else if (idx > 0) {
      transitionToPhase(ISS_TRANSIT_STAGES[idx - 1].id);
    }
  }, [phase, transitionToPhase]);

  // Animated 0% -> 100% loading bar for Stages 1 through 6
  useEffect(() => {
    if (!currentStage || phase === "STAGE_7") return;
    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 2);
      });
    }, 105);
    return () => clearInterval(interval);
  }, [phase, currentStage]);

  // Auto-advance once loading reaches 100% and typewriter is finished
  useEffect(() => {
    if (
      !currentStage ||
      phase === "STAGE_7" ||
      !autoAdvance ||
      loadProgress < 100 ||
      !isTypewriterDone
    ) {
      return;
    }
    const timeout = setTimeout(() => {
      handleNextStage();
    }, 950);
    return () => clearTimeout(timeout);
  }, [currentStage, phase, autoAdvance, loadProgress, isTypewriterDone, handleNextStage]);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE B/C: 4x4 DRAGON CARGO BAY LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  const selectedTool =
    ISS_CARGO_ITEMS.find((item) => item.id === selectedToolId) || ISS_CARGO_ITEMS[0];
  const activeW = isRotated ? selectedTool.h : selectedTool.w;
  const activeH = isRotated ? selectedTool.w : selectedTool.h;

  const packedRequiredCount = placedCargo.filter((p) => {
    const def = ISS_CARGO_ITEMS.find((i) => i.id === p.itemId);
    return def?.required;
  }).length;

  const packedDecoyCount = placedCargo.filter((p) => {
    const def = ISS_CARGO_ITEMS.find((i) => i.id === p.itemId);
    return def && !def.required;
  }).length;

  const totalCargoWeight = placedCargo.reduce((acc, p) => {
    const def = ISS_CARGO_ITEMS.find((i) => i.id === p.itemId);
    return acc + (def ? def.weight : 0);
  }, 0);

  const isCargoReadyForLaunch = packedRequiredCount === 4 && packedDecoyCount === 0;

  const canPlaceCargoAt = useCallback(
    (gx: number, gy: number, w: number, h: number) => {
      if (gx < 0 || gy < 0 || gx + w > 4 || gy + h > 4) return false;
      if (placedCargo.some((p) => p.itemId === selectedTool.id)) return false;
      for (let r = gy; r < gy + h; r++) {
        for (let c = gx; c < gx + w; c++) {
          const occupied = placedCargo.some(
            (p) => c >= p.x && c < p.x + p.w && r >= p.y && r < p.y + p.h
          );
          if (occupied) return false;
        }
      }
      return true;
    },
    [placedCargo, selectedTool.id]
  );

  const handlePlaceCargoCell = (gx: number, gy: number) => {
    const existing = placedCargo.find(
      (p) => gx >= p.x && gx < p.x + p.w && gy >= p.y && gy < p.y + p.h
    );
    if (existing) {
      sfx.playClick(420);
      setPlacedCargo((prev) => prev.filter((p) => p.uid !== existing.uid));
      setCargoFeedback(`REMOVED ${existing.itemId.toUpperCase()} FROM DRAGON CARGO BAY.`);
      return;
    }

    if (placedCargo.some((p) => p.itemId === selectedTool.id)) {
      sfx.playDamage();
      setCargoFeedback(`${selectedTool.name} IS ALREADY PACKED IN THE BAY!`);
      return;
    }

    if (!canPlaceCargoAt(gx, gy, activeW, activeH)) {
      sfx.playDamage();
      setCargoFeedback("INVALID FIT! ROTATE [R] OR CHOOSE AN OPEN 4x4 SLOT.");
      return;
    }

    if (!selectedTool.required) {
      sfx.playDamage();
      setCargoFeedback(
        `WARNING: ${selectedTool.name} IS A NON-FLIGHT DECOY! CLICK IT TO REMOVE BEFORE CDR.`
      );
    } else {
      sfx.playCollect();
      setCargoFeedback(`PACKED ${selectedTool.name} INTO DRAGON TRUNK.`);
    }

    setPlacedCargo((prev) => [
      ...prev,
      {
        uid: `${selectedTool.id}-${Date.now()}`,
        itemId: selectedTool.id,
        x: gx,
        y: gy,
        w: activeW,
        h: activeH,
      },
    ]);
  };

  const handleAutoPackRequired = () => {
    sfx.playCollect();
    setPlacedCargo([
      { uid: "auto-1", itemId: "sband_transponder", x: 0, y: 0, w: 2, h: 2 },
      { uid: "auto-2", itemId: "fiber_harness", x: 2, y: 0, w: 1, h: 3 },
      { uid: "auto-3", itemId: "thermal_circuit_board", x: 3, y: 0, w: 1, h: 2 },
      { uid: "auto-4", itemId: "eva_torque_wrench", x: 0, y: 2, w: 2, h: 1 },
    ]);
    setCargoFeedback("ALL 4 REQUIRED ISS EVA REPAIR TOOLS PACKED & VERIFIED!");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: AMONG US-STYLE DRAG-AND-DROP WIRE CONNECTING HANDLERS
  // ─────────────────────────────────────────────────────────────────────────
  const clientToWireSvgCoords = (clientX: number, clientY: number) => {
    const svg = wireSvgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const scaleX = 360 / Math.max(1, rect.width);
    const scaleY = 220 / Math.max(1, rect.height);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const handleStartWireDrag = (
    color: CableColor,
    clientX: number,
    clientY: number
  ) => {
    if (connectedCables[color]) return;
    sfx.playClick(660);
    setDraggingWire(color);
    setDragCursor(clientToWireSvgCoords(clientX, clientY));
  };

  const handleMoveWireDrag = (clientX: number, clientY: number) => {
    if (!draggingWire) return;
    const pt = clientToWireSvgCoords(clientX, clientY);
    setDragCursor(pt);

    // Check if cursor is near any right-side socket
    let foundSocket: CableColor | null = null;
    RIGHT_SOCKET_ORDER.forEach((sockColor, idx) => {
      const sy = getRightTerminalY(idx);
      if (Math.hypot(pt.x - RIGHT_TERMINAL_X, pt.y - sy) < 28) {
        foundSocket = sockColor;
      }
    });
    setHoveredSocket(foundSocket);
  };

  const handleEndWireDrag = () => {
    if (!draggingWire) return;
    if (hoveredSocket) {
      if (hoveredSocket === draggingWire && !connectedCables[draggingWire]) {
        // Matching socket! Snap in, chime & spark!
        sfx.playWireSnap();
        const linkedColor = draggingWire;
        setConnectedCables((prev) => ({
          ...prev,
          [linkedColor]: true,
        }));
        setSparkSocket(linkedColor);
        setScore((prev) => prev + 250);
        setTimeout(() => setSparkSocket(null), 550);
      } else {
        // Wrong socket! Buzz and snap back
        sfx.playDamage();
      }
    }
    setDraggingWire(null);
    setDragCursor(null);
    setHoveredSocket(null);
  };

  // Direct socket click fallback (if player clicks a left plug then clicks a right socket)
  const handleSocketClick = (sockColor: CableColor) => {
    if (!draggingWire) return;
    if (sockColor === draggingWire && !connectedCables[draggingWire]) {
      sfx.playWireSnap();
      setConnectedCables((prev) => ({
        ...prev,
        [sockColor]: true,
      }));
      setSparkSocket(sockColor);
      setScore((prev) => prev + 250);
      setTimeout(() => setSparkSocket(null), 550);
    } else {
      sfx.playDamage();
    }
    setDraggingWire(null);
    setDragCursor(null);
    setHoveredSocket(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: EXTERNAL PANEL REPAIR COMPLETION CHECK
  // ─────────────────────────────────────────────────────────────────────────
  const allCablesConnected =
    connectedCables.CYAN &&
    connectedCables.AMBER &&
    connectedCables.EMERALD &&
    connectedCables.MAGENTA;

  const isPanelFullyRepaired =
    allCablesConnected && capacitorReplaced && relayReplaced;

  useEffect(() => {
    if (phase === "PHASE_E_EVA" && isPanelFullyRepaired) {
      sfx.playVictoryFanfare();
      const timer = setTimeout(() => {
        setScore((prev) => prev + 1600 + evaOxygenLeft * 20 + suitIntegrity * 300);
        setPanelOverlayOpen(false);
        transitionToPhase("PHASE_F_VICTORY");
      }, 1100);
      return () => clearTimeout(timer);
    }
  }, [
    phase,
    isPanelFullyRepaired,
    evaOxygenLeft,
    suitIntegrity,
    transitionToPhase,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // KEYBOARD CONTROLS ACROSS ALL PHASES
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "PHASE_BC_CARGO") {
        if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          sfx.playClick(620);
          setIsRotated((prev) => !prev);
        }
        return;
      }

      if (phase === "PHASE_E_EVA") {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          keysRef.current.left = true;
        }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          keysRef.current.right = true;
        }
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
          e.preventDefault();
          keysRef.current.up = true;
        }
        if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
          e.preventDefault();
          keysRef.current.down = true;
        }
        if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          if (nearCommsPanel && sparesCollected >= 3) {
            sfx.playClick(780);
            setPanelOverlayOpen(true);
          } else {
            sfx.playDamage();
          }
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

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        keysRef.current.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        keysRef.current.right = false;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        keysRef.current.up = false;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        keysRef.current.down = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [
    phase,
    currentStage,
    isTypewriterDone,
    activeText.length,
    nearCommsPanel,
    sparesCollected,
    handleNextStage,
    handlePrevStage,
    onAbort,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: EVA OXYGEN TIMER
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "PHASE_E_EVA" || isPanelFullyRepaired) return;
    const timer = setInterval(() => {
      setEvaOxygenLeft((prev) => {
        if (prev <= 1) {
          sfx.playDamage();
          setPanelOverlayOpen(false);
          setFailureReason(
            "EMU SPACESUIT PRIMARY OXYGEN RESERVES EXHAUSTED BEFORE S-BAND TRANSPONDER RESTORATION."
          );
          transitionToPhase("PHASE_F_FAILURE");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, isPanelFullyRepaired, transitionToPhase]);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: RICH 16-BIT 2D ZERO-GRAVITY EVA SPACEWALK CANVAS LOOP
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "PHASE_E_EVA") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const WORLD_WIDTH = 2150;
    const PANEL_X = 1980;
    const PANEL_Y = 195;

    const renderFrame = () => {
      const now = performance.now();
      const astro = astroRef.current;

      // Microgravity 2D SAFER nitrogen thruster movement (paused while circuit overlay is open)
      if (!panelOverlayOpen) {
        const thrust = 0.22;
        const maxVel = 4.2;

        if (keysRef.current.left) {
          astro.vx = Math.max(-maxVel, astro.vx - thrust);
          astro.facing = -1;
          puffsRef.current.push({
            x: astro.x + 36,
            y: astro.y + 18,
            vx: 2.0 + Math.random() * 1.4,
            vy: (Math.random() - 0.5) * 1.1,
            life: 0,
            maxLife: 16,
            size: 4 + Math.random() * 2,
            color: Math.random() > 0.4 ? "#bae6fd" : "#38bdf8",
          });
        }
        if (keysRef.current.right) {
          astro.vx = Math.min(maxVel, astro.vx + thrust);
          astro.facing = 1;
          puffsRef.current.push({
            x: astro.x - 4,
            y: astro.y + 18,
            vx: -2.0 - Math.random() * 1.4,
            vy: (Math.random() - 0.5) * 1.1,
            life: 0,
            maxLife: 16,
            size: 4 + Math.random() * 2,
            color: Math.random() > 0.4 ? "#bae6fd" : "#38bdf8",
          });
        }
        if (keysRef.current.up) {
          astro.vy = Math.max(-maxVel, astro.vy - thrust);
          puffsRef.current.push({
            x: astro.x + 16,
            y: astro.y + 38,
            vx: (Math.random() - 0.5) * 1.1,
            vy: 2.0 + Math.random() * 1.4,
            life: 0,
            maxLife: 16,
            size: 4 + Math.random() * 2,
            color: Math.random() > 0.4 ? "#bae6fd" : "#38bdf8",
          });
        }
        if (keysRef.current.down) {
          astro.vy = Math.min(maxVel, astro.vy + thrust);
          puffsRef.current.push({
            x: astro.x + 16,
            y: astro.y - 4,
            vx: (Math.random() - 0.5) * 1.1,
            vy: -2.0 - Math.random() * 1.4,
            life: 0,
            maxLife: 16,
            size: 4 + Math.random() * 2,
            color: Math.random() > 0.4 ? "#bae6fd" : "#38bdf8",
          });
        }

        // Subtle zero-g damping so control feels crisp and responsive
        astro.vx *= 0.965;
        astro.vy *= 0.965;

        astro.x = Math.max(30, Math.min(WORLD_WIDTH - 60, astro.x + astro.vx));
        astro.y = Math.max(46, Math.min(canvas.height - 82, astro.y + astro.vy));
      }

      if (astro.invulnFrames > 0) {
        astro.invulnFrames -= 1;
      }

      // Check collection of 3 floating spare parts / coolant cells
      for (const part of sparesRef.current) {
        if (!part.collected) {
          const dx = astro.x + 18 - part.x;
          const dy = astro.y + 18 - part.y;
          if (Math.hypot(dx, dy) < 34) {
            part.collected = true;
            sfx.playCollect();
            setScore((prev) => prev + 400);
            setSparesCollected((prev) => prev + 1);
            for (let k = 0; k < 14; k++) {
              puffsRef.current.push({
                x: part.x,
                y: part.y,
                vx: (Math.random() - 0.5) * 4.5,
                vy: (Math.random() - 0.5) * 4.5,
                life: 0,
                maxLife: 22,
                size: 4,
                color: k % 2 === 0 ? "#22d3ee" : "#fde047",
              });
            }
          }
        }
      }

      // Update & check drifting micrometeoroid debris
      for (const deb of debrisRef.current) {
        if (!panelOverlayOpen) {
          deb.x += deb.vx;
          deb.y += deb.vy;
          deb.angle += deb.vRot;
          if (deb.y < 52 || deb.y > canvas.height - 78) deb.vy *= -1;
          if (deb.x < 260) deb.x = WORLD_WIDTH - 200;
          if (deb.x > WORLD_WIDTH - 150) deb.x = 280;
        }

        const dist = Math.hypot(astro.x + 18 - deb.x, astro.y + 18 - deb.y);
        if (dist < deb.r + 16 && astro.invulnFrames === 0 && !panelOverlayOpen) {
          astro.invulnFrames = 65;
          astro.vx = -astro.vx * 1.4;
          astro.vy = -astro.vy * 1.4;
          sfx.playDamage();
          setSuitIntegrity((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setFailureReason(
                "EMU SPACESUIT PRESSURE COMPROMISED BY ORBITAL MICROMETEOROID DEBRIS IMPACT."
              );
              transitionToPhase("PHASE_F_FAILURE");
            }
            return Math.max(0, next);
          });
        }
      }

      // Check proximity to the Damaged Communications Array Panel at the end of the truss
      const distToPanel = Math.hypot(astro.x - PANEL_X, astro.y - PANEL_Y);
      setNearCommsPanel(distToPanel < 95);

      const camX = Math.max(
        0,
        Math.min(WORLD_WIDTH - canvas.width, astro.x - canvas.width * 0.35)
      );

      // ─────────────────────────────────────────────────────────────────────
      // RENDER MULTI-LAYER 16-BIT PIXEL ART ORBITAL SCENE
      // ─────────────────────────────────────────────────────────────────────
      ctx.fillStyle = "#020617";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 1. Twinkling Multi-Size Deep Space Starfield
      for (let i = 0; i < 75; i++) {
        const sx = ((i * 167 - camX * 0.12) % canvas.width + canvas.width) % canvas.width;
        const sy = (i * 61) % 305;
        const twinkle = Math.sin(now * 0.004 + i) > 0.3;
        ctx.fillStyle = i % 5 === 0 ? "#38bdf8" : i % 7 === 0 ? "#fde047" : "#f8fafc";
        const sz = i % 4 === 0 && twinkle ? 3 : 2;
        ctx.fillRect(sx, sy, sz, sz);
      }

      // 2. Curved Earth Limb with Atmospheric Blue Glow & Drifting Pixel Cloud Bands
      ctx.save();
      const earthCenterX = canvas.width * 0.5 - (camX * 0.08 - 60);
      const earthRadius = 1280;
      const earthCenterY = canvas.height + earthRadius - 68;

      // Outer atmospheric cyan halo
      const haloGrad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 12,
        earthCenterX,
        earthCenterY,
        earthRadius + 46
      );
      haloGrad.addColorStop(0, "#0284c7");
      haloGrad.addColorStop(0.45, "rgba(56, 189, 248, 0.55)");
      haloGrad.addColorStop(1, "rgba(2, 6, 23, 0)");
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 46, 0, Math.PI * 2);
      ctx.fill();

      // Deep ocean Earth curvature
      ctx.fillStyle = "#0369a1";
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      // Drifting 16-bit pixel cloud bands & landmass patches along Earth's limb
      const cloudDrift = (now * 0.015) % 240;
      for (let c = -2; c < 8; c++) {
        const cx = c * 160 + cloudDrift - (camX * 0.18) % 160;
        const cy = canvas.height - 34 + (c % 2) * 8;
        ctx.fillStyle = "rgba(34, 197, 94, 0.35)";
        ctx.fillRect(cx + 24, cy + 4, 64, 10);
        ctx.fillStyle = "rgba(248, 250, 252, 0.78)";
        ctx.fillRect(cx, cy, 82, 5);
        ctx.fillRect(cx + 16, cy - 4, 48, 4);
      }

      // Bright cyan atmospheric horizon line
      ctx.strokeStyle = "#67e8f9";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, -Math.PI * 0.7, -Math.PI * 0.3);
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.translate(-camX, 0);

      // 3. Slowly Rotating Golden ISS Solar Array Wings Catching Sunlight
      for (let i = 0; i < 5; i++) {
        const sx = 230 + i * 420;
        // Slow orbital sun-tracking width modulation
        const rotPhase = Math.sin(now * 0.0012 + i * 0.8);
        const wingW = Math.max(26, Math.round(68 * (0.65 + 0.35 * Math.abs(rotPhase))));
        const offsetX = sx + Math.round((74 - wingW) / 2);

        // Central mast
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(sx + 34, 14, 6, 366);

        // Solar blanket frame
        ctx.fillStyle = "#78350f";
        ctx.fillRect(offsetX, 20, wingW, 354);
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.strokeRect(offsetX, 20, wingW, 354);

        // Individual photovoltaic cells + sweeping sunlight shimmer
        const shimmerRow = Math.floor((now * 0.01 + i * 3) % 14);
        for (let r = 0; r < 14; r++) {
          const ry = 28 + r * 24;
          ctx.fillStyle = r === shimmerRow ? "#fef08a" : "#d97706";
          ctx.fillRect(offsetX + 4, ry, Math.max(8, wingW - 8), 16);
          ctx.fillStyle = "#fbbf24";
          ctx.fillRect(offsetX + 6, ry + 2, Math.max(4, wingW - 12), 6);
        }
      }

      // 4. Pressurized ISS Modules + Glowing Cupola Observation Window
      for (let m = 0; m < 3; m++) {
        const mx = 460 + m * 620;
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(mx, 142, 170, 34);
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(mx, 166, 170, 10);
        ctx.strokeStyle = "#475569";
        ctx.lineWidth = 2;
        ctx.strokeRect(mx, 142, 170, 34);

        // Cupola Observation Dome with warm interior cabin glow
        const cupX = mx + 65;
        ctx.fillStyle = "#475569";
        ctx.fillRect(cupX, 126, 40, 16);
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(cupX + 6, 129, 10, 10);
        ctx.fillRect(cupX + 24, 129, 10, 10);
        ctx.fillStyle = "#fde047";
        ctx.fillRect(cupX + 17, 128, 6, 11);
      }

      // 5. ISS Integrated Truss Structure Backbone (Center Horizontal Girder)
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 175, WORLD_WIDTH, 54);
      ctx.fillStyle = "#334155";
      ctx.fillRect(0, 175, WORLD_WIDTH, 8);
      ctx.fillRect(0, 221, WORLD_WIDTH, 8);
      ctx.strokeStyle = "#94a3b8";
      ctx.lineWidth = 2;
      ctx.strokeRect(0, 175, WORLD_WIDTH, 54);

      for (let x = 0; x < WORLD_WIDTH; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 175);
        ctx.lineTo(x + 30, 229);
        ctx.lineTo(x + 60, 175);
        ctx.stroke();
        // Handrail yellow EVA translation bar
        ctx.fillStyle = "#facc15";
        ctx.fillRect(x + 12, 200, 36, 3);
      }

      // Quest Airlock Start Zone (Left)
      ctx.fillStyle = "#475569";
      ctx.fillRect(26, 142, 82, 116);
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(46, 172, 42, 56);
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 142, 82, 116);
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(34, 150, 8, 8);
      ctx.fillStyle = "#22d3ee";
      ctx.font = "bold 10px monospace";
      ctx.fillText("QUEST AIRLOCK", 26, 134);

      // 6. Safety Tether Cable from Quest Airlock to Astronaut
      ctx.save();
      ctx.strokeStyle = "rgba(226, 232, 240, 0.65)";
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      const tetherStartX = 96;
      const tetherStartY = 200;
      const midX = (tetherStartX + astro.x) * 0.5;
      const midY = (tetherStartY + astro.y) * 0.5 + Math.sin(now * 0.004) * 18;
      ctx.moveTo(tetherStartX, tetherStartY);
      ctx.quadraticCurveTo(midX, midY, astro.x + 16, astro.y + 18);
      ctx.stroke();
      ctx.restore();

      // 7. Draw Glowing Floating Coolant / Spare-Part Canisters (3x)
      const bob = Math.sin(now * 0.006) * 6;
      for (const part of sparesRef.current) {
        if (part.collected) continue;
        const py = part.y + bob;

        // Outer energy beacon ring
        ctx.strokeStyle = "rgba(34, 211, 238, 0.55)";
        ctx.lineWidth = 2;
        ctx.strokeRect(part.x - 18, py - 18, 36, 36);

        // Pixel canister body
        ctx.fillStyle = "#0e7490";
        ctx.fillRect(part.x - 12, py - 14, 24, 28);
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(part.x - 8, py - 8, 16, 16);
        ctx.fillStyle = "#cffafe";
        ctx.fillRect(part.x - 4, py - 4, 8, 8);
        // Gold end caps
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(part.x - 10, py - 16, 20, 4);
        ctx.fillRect(part.x - 10, py + 12, 20, 4);

        ctx.fillStyle = "#67e8f9";
        ctx.font = "bold 10px monospace";
        ctx.fillText(part.label, part.x - 42, py - 24);
      }

      // 8. Draw Spinning Micrometeoroid Debris with Red Warning Brackets
      for (const deb of debrisRef.current) {
        ctx.save();
        ctx.translate(deb.x, deb.y);

        // Warning target bracket
        ctx.strokeStyle = "rgba(244, 63, 94, 0.75)";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-deb.r - 5, -deb.r - 5, deb.r * 2 + 10, deb.r * 2 + 10);

        ctx.rotate(deb.angle);
        // Faceted rocky/metallic debris sprite
        ctx.fillStyle = "#be123c";
        ctx.fillRect(-deb.r, -deb.r + 3, deb.r * 2, deb.r * 2 - 6);
        ctx.fillRect(-deb.r + 3, -deb.r, deb.r * 2 - 6, deb.r * 2);
        ctx.fillStyle = "#fb7185";
        ctx.fillRect(-deb.r + 4, -deb.r + 4, 8, 6);
        ctx.fillStyle = "#4c0519";
        ctx.fillRect(2, 2, 7, 7);
        ctx.restore();
      }

      // 9. Damaged S-Band Communications Array Panel at Far End of Truss
      ctx.fillStyle = isPanelFullyRepaired ? "#064e3b" : "#0f172a";
      ctx.fillRect(PANEL_X - 36, PANEL_Y - 54, 76, 108);
      ctx.strokeStyle = isPanelFullyRepaired ? "#34d399" : "#fbbf24";
      ctx.lineWidth = 3;
      ctx.strokeRect(PANEL_X - 36, PANEL_Y - 54, 76, 108);

      // Dish antenna on top of panel
      ctx.fillStyle = "#e2e8f0";
      ctx.fillRect(PANEL_X - 18, PANEL_Y - 70, 40, 12);
      ctx.fillStyle = "#38bdf8";
      ctx.fillRect(PANEL_X - 2, PANEL_Y - 82, 8, 12);

      // Severed wire detail or online green status bars
      if (isPanelFullyRepaired) {
        ctx.fillStyle = "#34d399";
        ctx.fillRect(PANEL_X - 22, PANEL_Y - 34, 48, 12);
        ctx.fillRect(PANEL_X - 22, PANEL_Y - 12, 48, 12);
        ctx.fillRect(PANEL_X - 22, PANEL_Y + 10, 48, 12);
      } else {
        ctx.fillStyle = "#06b6d4";
        ctx.fillRect(PANEL_X - 24, PANEL_Y - 32, 16, 5);
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(PANEL_X - 24, PANEL_Y - 16, 16, 5);
        ctx.fillStyle = "#10b981";
        ctx.fillRect(PANEL_X - 24, PANEL_Y, 16, 5);
        ctx.fillStyle = "#d946ef";
        ctx.fillRect(PANEL_X - 24, PANEL_Y + 16, 16, 5);

        // Sparking short-circuit flash
        if (Math.floor(now / 180) % 2 === 0) {
          ctx.fillStyle = "#fde047";
          ctx.fillRect(PANEL_X - 4, PANEL_Y - 10, 16, 16);
          ctx.fillStyle = "#f43f5e";
          ctx.fillRect(PANEL_X, PANEL_Y - 6, 8, 8);
        }
      }

      ctx.fillStyle = isPanelFullyRepaired ? "#6ee7b7" : "#fde047";
      ctx.font = "bold 11px monospace";
      ctx.fillText(
        isPanelFullyRepaired ? "COMMS ARRAY: ONLINE" : "DAMAGED COMMS PANEL [E]",
        PANEL_X - 75,
        PANEL_Y - 88
      );

      // 10. Update & Draw Nitrogen Thruster Puffs & Spark Particles
      for (let i = puffsRef.current.length - 1; i >= 0; i--) {
        const pf = puffsRef.current[i];
        pf.x += pf.vx;
        pf.y += pf.vy;
        pf.life += 1;
        if (pf.life >= pf.maxLife) {
          puffsRef.current.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pf.color;
        ctx.fillRect(pf.x, pf.y, pf.size, pf.size);
      }

      // 11. Draw Detailed 16-Bit EVA Astronaut Sprite with SAFER Jetpack & Gold Visor
      if (astro.invulnFrames % 4 < 2) {
        // PLSS Life-Support & SAFER Thruster Backpack
        ctx.fillStyle = "#64748b";
        ctx.fillRect(astro.x + 2, astro.y + 4, 32, 26);
        ctx.fillStyle = "#cbd5e1";
        ctx.fillRect(astro.x + 4, astro.y + 6, 28, 22);
        // Thruster nozzles on corners
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(astro.x, astro.y + 6, 3, 5);
        ctx.fillRect(astro.x + 33, astro.y + 6, 3, 5);
        ctx.fillRect(astro.x, astro.y + 23, 3, 5);
        ctx.fillRect(astro.x + 33, astro.y + 23, 3, 5);

        // White EMU Spacesuit Torso & DCM Chest Display
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(astro.x + 7, astro.y + 8, 22, 22);
        ctx.fillStyle = "#0284c7";
        ctx.fillRect(astro.x + 12, astro.y + 12, 12, 8);
        ctx.fillStyle = "#4ade80";
        ctx.fillRect(astro.x + 14, astro.y + 14, 3, 3);

        // Helmet & Gold-Tinted Reflective Visor with Specular Highlight
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(astro.x + 8, astro.y - 6, 20, 15);
        ctx.fillStyle = "#d97706";
        const visorX = astro.facing === 1 ? astro.x + 14 : astro.x + 9;
        ctx.fillRect(visorX, astro.y - 3, 12, 9);
        ctx.fillStyle = "#fbbf24";
        ctx.fillRect(visorX + 1, astro.y - 2, 10, 7);
        ctx.fillStyle = "#fef08a";
        ctx.fillRect(visorX + 2, astro.y - 1, 4, 3);

        // Red Commander Stripes & Boots
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(astro.x + 8, astro.y + 24, 20, 3);
        ctx.fillStyle = "#94a3b8";
        ctx.fillRect(astro.x + 9, astro.y + 30, 7, 6);
        ctx.fillRect(astro.x + 20, astro.y + 30, 7, 6);
      }

      ctx.restore();

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [phase, panelOverlayOpen, isPanelFullyRepaired, transitionToPhase]);

  const standardizedScore1000 = Math.min(
    1000,
    Math.max(
      100,
      Math.round(
        400 +
          sparesCollected * 80 +
          suitIntegrity * 60 +
          Math.min(180, Math.round(evaOxygenLeft * 1.7))
      )
    )
  );
  const finalRank =
    standardizedScore1000 >= 900 ? "S" : standardizedScore1000 >= 750 ? "A" : "B";

  useEffect(() => {
    if (!onPhaseProgress) return;
    const progressLabel: PlayerProgressPhase =
      phase === "PHASE_A_BRIEFING"
        ? "IN PHASE A"
        : phase === "PHASE_BC_CARGO"
          ? "IN PHASE B/C"
          : phase === "PHASE_E_EVA"
            ? "IN PHASE E"
            : phase === "PHASE_F_VICTORY"
              ? "FINISHED ✓"
              : "IN PHASE D";
    onPhaseProgress(progressLabel, "4x4 DRAGON ORU + EVA");
  }, [phase, onPhaseProgress]);

  useEffect(() => {
    if (phase === "PHASE_F_VICTORY" && onMissionComplete) {
      onMissionComplete(standardizedScore1000, "4x4 DRAGON ORU + EVA");
    }
  }, [phase, onMissionComplete, standardizedScore1000]);

  const lifecycleTag =
    phase === "PHASE_A_BRIEFING"
      ? "PHASE A // ISS RESUPPLY & REPAIR CONCEPT"
      : phase === "PHASE_BC_CARGO"
        ? "PHASE B/C // DRAGON CARGO BAY"
        : currentStage
          ? "PHASE D // FALCON 9 ASCENT & ORBITAL DOCKING"
          : phase === "PHASE_E_EVA"
            ? "PHASE E // ORBITAL OPERATIONS (2D EVA REPAIR)"
            : "PHASE F // MISSION CLOSEOUT & LESSONS LEARNED";

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none flex flex-col font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CRYSTAL-CLEAR FULL-SCREEN NASA PHOTOGRAPH BACKDROP         */}
      {/*    (Zero blur, zero dark vignette, 100% full brightness)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {/* Base ISS backdrop during Phases A, B/C, E, F */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            !currentStage ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dest-iss.jpg"
            alt="NASA ISS Backdrop"
            className="w-full h-full object-cover object-center"
            style={{ imageRendering: "auto" }}
          />
        </div>

        {/* Pre-rendered 7-Stage NASA Photographs at 100% natural clarity & brightness */}
        {ISS_TRANSIT_STAGES.map((stage) => {
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
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400 text-cyan-200 font-press-start text-[10px] tracking-wider shadow-[3px_3px_0px_#000] active:translate-y-0.5 cursor-pointer arcade-btn"
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
            {ISS_TRANSIT_STAGES.map((s) => {
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
                    PHASE A // ISS RESUPPLY &amp; REPAIR CONCEPT
                  </span>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-slate-950/90 border-2 border-slate-400 text-[10px] font-silkscreen text-slate-200 shadow-[3px_3px_0px_#000]">
                  408 KM LEO // S-BAND COMMS RESTORATION
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
                        : "[ PROCEED TO PHASE B: CARGO PREP > ]"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE B & C: 4x4 DRAGON CARGO BAY WITH 16-BIT PIXEL SPRITES */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_BC_CARGO" && (
          <div className="my-auto mx-auto w-full max-w-6xl bg-slate-950/92 border-2 border-cyan-400 p-4 sm:p-6 shadow-[8px_8px_0px_#000] backdrop-blur-md space-y-4">
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cyan-400/40 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <span className="font-press-start text-[10px] text-cyan-300 uppercase">
                    PHASE B/C // DRAGON CARGO BAY CONFIGURATION
                  </span>
                </div>
                <h2 className="font-press-start text-sm sm:text-lg text-white mt-1">
                  PACK ALL 4 REQUIRED ISS EVA TOOLS (AVOID 2 DECOYS)
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 font-silkscreen text-xs">
                <span className="px-3 py-1 bg-slate-900 border border-cyan-400 text-cyan-200">
                  REQUIRED TOOLS: <strong className="text-white">{packedRequiredCount} / 4</strong>
                </span>
                <span
                  className={`px-3 py-1 border ${
                    packedDecoyCount > 0
                      ? "bg-rose-950/90 border-rose-400 text-rose-200 animate-pulse"
                      : "bg-slate-900 border-emerald-400/60 text-emerald-300"
                  }`}
                >
                  DECOYS: <strong>{packedDecoyCount}</strong>
                </span>
                <span className="px-3 py-1 bg-slate-900 border border-slate-500 text-slate-200">
                  MASS: <strong>{totalCargoWeight} / 95 KG</strong>
                </span>
              </div>
            </div>

            {/* Main Grid: Tool Selector + 4x4 Cargo Grid + Blueprint Scanner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: 6 ISS Items with Detailed 16-Bit Pixel Sprites */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-press-start text-cyan-300">
                  <span>1. SELECT PAYLOAD HARDWARE</span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(640);
                      setIsRotated((prev) => !prev);
                    }}
                    className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>[R] ROTATE ({activeW}x{activeH})</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {ISS_CARGO_ITEMS.map((item) => {
                    const isPacked = placedCargo.some((p) => p.itemId === item.id);
                    const isSelected = selectedToolId === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          sfx.playClick(600);
                          setSelectedToolId(item.id);
                        }}
                        className={`text-left p-2.5 border-2 transition-all cursor-pointer flex items-center gap-2.5 ${
                          isSelected
                            ? "bg-slate-800 border-cyan-300 shadow-[3px_3px_0px_#000]"
                            : "bg-slate-900/90 border-slate-700 hover:border-slate-500"
                        } ${isPacked ? "opacity-60" : ""}`}
                      >
                        <div className="w-12 h-12 shrink-0 bg-slate-950 border border-slate-700 flex items-center justify-center p-1">
                          <PixelCargoSprite itemId={item.id} className="w-10 h-10" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[8px] font-press-start px-1.5 py-0.5 ${
                                item.required
                                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-400/50"
                              }`}
                            >
                              {item.required ? "REQUIRED" : "DECOY"}
                            </span>
                            <span className="font-silkscreen text-[10px] text-slate-300">
                              {item.w}x{item.h} • {item.weight}KG
                            </span>
                          </div>
                          <p className="font-press-start text-[9px] text-white mt-1 truncate">
                            {item.name}
                          </p>
                          <p className="font-silkscreen text-[10px] text-emerald-300 mt-0.5 truncate">
                            {isPacked ? "✓ PACKED (CLICK TO REMOVE)" : "READY TO LOAD"}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center Column: Lighted Dragon Spacecraft 4x4 Cargo Bay */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-[10px] font-press-start text-cyan-300 mb-2">
                  <span>2. DRAGON PRESSURIZED BAY</span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(450);
                      setPlacedCargo([]);
                      setCargoFeedback("DRAGON CARGO BAY CLEARED.");
                    }}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-rose-950 border border-slate-600 text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>CLEAR</span>
                  </button>
                </div>

                {/* Metallic Dragon Bulkhead Frame with Animated Status LEDs */}
                <div className="p-3 bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-2 border-cyan-400 shadow-[6px_6px_0px_#000] relative">
                  {/* Top Bay Status Light Bar */}
                  <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-none ${
                          isCargoReadyForLaunch
                            ? "bg-emerald-400 animate-ping"
                            : "bg-amber-400 animate-pulse"
                        }`}
                      />
                      <span className="font-silkscreen text-[9px] text-cyan-200">
                        {isCargoReadyForLaunch ? "BAY LOCKED // GREEN" : "LOADING RACK A-4"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <span
                          key={i}
                          className={`w-2 h-2 border border-black ${
                            i < packedRequiredCount ? "bg-emerald-400" : "bg-slate-700"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div
                    className="grid grid-cols-4 gap-1.5 p-2 bg-slate-950/90 border-2 border-slate-700"
                    onMouseLeave={() => setHoverCell(null)}
                  >
                    {Array.from({ length: 16 }).map((_, idx) => {
                      const gx = idx % 4;
                      const gy = Math.floor(idx / 4);
                      const placed = placedCargo.find(
                        (p) => gx >= p.x && gx < p.x + p.w && gy >= p.y && gy < p.y + p.h
                      );
                      const placedDef = placed
                        ? ISS_CARGO_ITEMS.find((i) => i.id === placed.itemId)
                        : null;

                      const isPreview =
                        hoverCell &&
                        !placed &&
                        gx >= hoverCell.x &&
                        gx < hoverCell.x + activeW &&
                        gy >= hoverCell.y &&
                        gy < hoverCell.y + activeH;
                      const previewValid =
                        hoverCell && canPlaceCargoAt(hoverCell.x, hoverCell.y, activeW, activeH);

                      return (
                        <button
                          key={idx}
                          type="button"
                          onMouseEnter={() => setHoverCell({ x: gx, y: gy })}
                          onClick={() => handlePlaceCargoCell(gx, gy)}
                          className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex flex-col items-center justify-center p-1 text-center transition-colors cursor-pointer relative overflow-hidden ${
                            placed && placedDef
                              ? `${placedDef.color} ${placedDef.borderColor}`
                              : isPreview
                                ? previewValid
                                  ? "bg-emerald-500/40 border-emerald-300"
                                  : "bg-rose-500/40 border-rose-400"
                                : "bg-slate-900/80 hover:bg-slate-800 border-slate-700"
                          }`}
                        >
                          {placed && placedDef ? (
                            <>
                              <PixelCargoSprite
                                itemId={placedDef.id}
                                className="w-8 h-8 sm:w-9 sm:h-9 drop-shadow-[1px_1px_0px_#000]"
                              />
                              <span className="font-press-start text-[6px] text-white leading-tight truncate max-w-full mt-0.5">
                                {placedDef.name.split(" (")[0]}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="w-1.5 h-1.5 bg-slate-800 absolute top-1 left-1" />
                              <span className="w-1.5 h-1.5 bg-slate-800 absolute top-1 right-1" />
                              <span className="font-silkscreen text-[9px] text-slate-600">
                                {gx},{gy}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAutoPackRequired}
                  className="mt-2.5 px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-cyan-400/60 text-cyan-200 font-silkscreen text-xs cursor-pointer"
                >
                  [ AUTO-LOAD 4 REQUIRED TOOLS ]
                </button>
              </div>

              {/* Right Column: Blueprint Scanner & CDR Readiness */}
              <div className="lg:col-span-3 bg-slate-900/95 border-2 border-cyan-400/70 p-3.5 space-y-3">
                <div className="border-b border-cyan-400/30 pb-2 flex items-center justify-between">
                  <div>
                    <span className="font-press-start text-[9px] text-cyan-300">
                      BLUEPRINT SCANNER
                    </span>
                    <h3 className="font-press-start text-[11px] text-white mt-1">
                      {selectedTool.name}
                    </h3>
                  </div>
                  <div className="w-12 h-12 bg-slate-950 border border-cyan-400/60 p-1 shrink-0 flex items-center justify-center">
                    <PixelCargoSprite itemId={selectedTool.id} className="w-10 h-10" />
                  </div>
                </div>

                <p className="font-vt323 text-lg text-slate-200 leading-snug">
                  {selectedTool.description}
                </p>

                <div className="p-2.5 bg-slate-950 border border-slate-700 font-silkscreen text-[11px] text-cyan-200">
                  {cargoFeedback}
                </div>

                <button
                  type="button"
                  disabled={!isCargoReadyForLaunch}
                  onClick={() => {
                    sfx.playVictoryFanfare();
                    setScore((prev) => prev + 1000);
                    transitionToPhase("STAGE_1");
                  }}
                  className={`w-full py-3 px-3 border-2 font-press-start text-[10px] uppercase shadow-[4px_4px_0px_#000] transition-all ${
                    isCargoReadyForLaunch
                      ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 cursor-pointer animate-pulse"
                      : "bg-slate-800 border-slate-600 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  [ COMPLETE CDR &amp; INITIATE PHASE D LAUNCH &gt; ]
                </button>
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
              className="min-h-[48px] bg-slate-950/75 border border-cyan-400/30 px-3.5 py-2 flex flex-col justify-center cursor-pointer"
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
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-silkscreen text-cyan-200">
                  <span>
                    {loadProgress < 100
                      ? "PHASE D // ISS ORBITAL TRANSIT LOADING..."
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
                            ? "bg-gradient-to-t from-cyan-500 to-cyan-200 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                            : "bg-slate-900"
                        }`}
                      />
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevStage}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400/60 text-cyan-200 hover:text-white font-press-start text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                >
                  <ChevronLeft className="w-4 h-4 text-cyan-300" />
                  <span>PREV</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStage}
                  className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                >
                  <span>
                    {currentStage.stageNumber === 6
                      ? "[ CONFIRM ISS DOCKING > ]"
                      : "[ NEXT STAGE > ]"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 7: YOU HAVE SUCCESSFULLY ARRIVED AT ISS (BOTTOM HUD)  */}
        {/* (No Commander Victory Image here — saved for Phase F)       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "STAGE_7" && currentStage && (
          <div className="w-full max-w-5xl mx-auto mt-auto bg-slate-950/80 border-2 border-cyan-400/80 p-4 sm:p-5 shadow-[6px_6px_0px_#000] backdrop-blur-md space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-cyan-400/40 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-press-start text-[9px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  STAGE 7 / 7
                </span>
                <h1 className="text-base sm:text-xl md:text-2xl font-press-start text-white tracking-wider drop-shadow-[2px_2px_0px_#000]">
                  YOU HAVE SUCCESSFULLY ARRIVED AT ISS
                </h1>
              </div>

              <div className="flex items-center gap-1.5 text-cyan-300 font-silkscreen text-xs shrink-0">
                <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                <span>HARD CAPTURE COMPLETE</span>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="flex-1 bg-slate-950/75 border border-cyan-400/30 px-3.5 py-2.5">
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
                  onClick={() => transitionToPhase("PHASE_E_EVA")}
                  className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-[10px] sm:text-xs font-bold shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                >
                  [ START PHASE E: 2D ZERO-G EVA REPAIR &gt; ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE E: 2D ZERO-G EVA SPACEWALK & AMONG US WIRE PANEL      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_E_EVA" && (
          <div className="my-auto mx-auto w-full max-w-5xl bg-slate-950/95 border-2 border-cyan-400 p-3 sm:p-4 shadow-[8px_8px_0px_#000] space-y-3">
            {/* Top EVA Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-400/40 pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span className="font-press-start text-[10px] text-cyan-300">
                  PHASE E // ORBITAL OPERATIONS (2D EVA REPAIR)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-silkscreen text-xs">
                {/* Suit Integrity Hearts */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-rose-400/60">
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-slate-200 mr-1">EMU SUIT:</span>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Heart
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < suitIntegrity
                          ? "text-rose-400 fill-rose-400"
                          : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Spare Parts Collected */}
                <div className="px-2.5 py-1 bg-slate-900 border border-cyan-400/60 text-cyan-300">
                  SPARE CELLS: <strong className="text-white">{sparesCollected} / 3</strong>
                </div>

                {/* EVA Oxygen Timer */}
                <div
                  className={`px-2.5 py-1 border font-bold ${
                    evaOxygenLeft <= 25
                      ? "bg-rose-950 border-rose-400 text-rose-300 animate-pulse"
                      : "bg-slate-900 border-emerald-400/60 text-emerald-300"
                  }`}
                >
                  EVA O2: {evaOxygenLeft}s
                </div>
              </div>
            </div>

            {/* 2D HTML5 Canvas + Among Us-Style Drag-and-Drop External Panel Overlay */}
            <div className="relative w-full overflow-hidden border-2 border-slate-700 bg-black">
              <canvas
                ref={canvasRef}
                width={920}
                height={400}
                className="w-full h-[290px] sm:h-[360px] block"
              />

              {sparesCollected >= 3 && !panelOverlayOpen && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 font-press-start text-[10px] shadow-[4px_4px_0px_#000] animate-bounce">
                  ALL 3 SPARE CELLS COLLECTED! FLY RIGHT TO COMMS PANEL &amp; PRESS [E]
                </div>
              )}

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* AMONG US-STYLE DRAG-AND-DROP EXTERNAL CIRCUIT REPAIR BOX    */}
              {/* ═══════════════════════════════════════════════════════════ */}
              {panelOverlayOpen && (
                <div
                  className={`absolute inset-0 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto transition-colors duration-300 ${
                    isPanelFullyRepaired
                      ? "bg-emerald-950/95"
                      : "bg-slate-950/95"
                  }`}
                >
                  {/* Top Metallic Bulkhead Bar */}
                  <div className="flex items-center justify-between border-b-2 border-cyan-400/60 pb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-amber-400" />
                      <h3 className="font-press-start text-[10px] sm:text-xs text-white">
                        ISS S-BAND EXTERNAL CIRCUIT JUNCTION BOX
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      {isPanelFullyRepaired && (
                        <span className="px-2.5 py-1 bg-emerald-400 text-slate-950 font-press-start text-[9px] animate-bounce flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          POWER SURGE: 100% ONLINE
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setPanelOverlayOpen(false)}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-400 font-press-start text-[9px] text-slate-200 cursor-pointer"
                      >
                        [ CLOSE PANEL ]
                      </button>
                    </div>
                  </div>

                  {/* Main Dual-Bay Repair Housing */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 my-auto py-2 items-stretch">
                    {/* LEFT BAY (7 Cols): AMONG US-STYLE DRAG-AND-DROP WIRE CONNECTING */}
                    <div className="lg:col-span-7 bg-slate-900 border-2 border-cyan-400/70 p-2.5 flex flex-col justify-between relative shadow-[inset_0_0_24px_#000]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-press-start text-[9px] text-cyan-300 flex items-center gap-1.5">
                          <Cable className="w-3.5 h-3.5" />
                          1. DRAG LEFT WIRE PLUGS TO MATCHING RIGHT SOCKETS
                        </span>
                        <span className="font-silkscreen text-[10px] text-emerald-300">
                          {Object.values(connectedCables).filter(Boolean).length} / 4 LINKED
                        </span>
                      </div>

                      {/* Interactive SVG Wire Dragging Canvas */}
                      <div className="relative w-full bg-slate-950 border-2 border-slate-700 overflow-hidden select-none touch-none">
                        <svg
                          ref={wireSvgRef}
                          viewBox="0 0 360 220"
                          className="w-full h-[185px] sm:h-[205px] block cursor-crosshair"
                          onPointerMove={(e) => handleMoveWireDrag(e.clientX, e.clientY)}
                          onPointerUp={handleEndWireDrag}
                          onPointerCancel={handleEndWireDrag}
                          onPointerLeave={handleEndWireDrag}
                        >
                          {/* Metallic Circuit Board Background & Corner Bolts */}
                          <rect x="0" y="0" width="360" height="220" fill="#090d16" />
                          <rect x="8" y="8" width="6" height="6" fill="#475569" />
                          <rect x="346" y="8" width="6" height="6" fill="#475569" />
                          <rect x="8" y="206" width="6" height="6" fill="#475569" />
                          <rect x="346" y="206" width="6" height="6" fill="#475569" />

                          {/* Scorch Marks & Glowing Background PCB Traces */}
                          <ellipse cx="180" cy="110" rx="54" ry="38" fill="rgba(15, 23, 42, 0.9)" />
                          <path
                            d="M 70 30 L 130 30 L 155 55 L 280 55"
                            stroke={allCablesConnected ? "#10b981" : "#1e293b"}
                            strokeWidth="2"
                            fill="none"
                          />
                          <path
                            d="M 70 190 L 145 190 L 175 160 L 280 160"
                            stroke={allCablesConnected ? "#22d3ee" : "#1e293b"}
                            strokeWidth="2"
                            fill="none"
                          />

                          {/* Left & Right Terminal Housing Channels */}
                          <rect x="0" y="14" width="44" height="192" fill="#1e293b" />
                          <rect x="316" y="14" width="44" height="192" fill="#1e293b" />

                          {/* RIGHT-HAND SOCKETS + LED INDICATOR LIGHTS */}
                          {RIGHT_SOCKET_ORDER.map((sockColor, rIdx) => {
                            const wDef = WIRE_DEFS[sockColor];
                            const sy = getRightTerminalY(rIdx);
                            const isLinked = connectedCables[sockColor];
                            const isHovered = hoveredSocket === sockColor;
                            const isSparking = sparkSocket === sockColor;

                            return (
                              <g
                                key={sockColor}
                                onClick={() => handleSocketClick(sockColor)}
                                className="cursor-pointer"
                              >
                                {/* Socket Collar */}
                                <rect
                                  x={RIGHT_TERMINAL_X - 10}
                                  y={sy - 13}
                                  width="28"
                                  height="26"
                                  fill={isHovered ? "#334155" : "#0f172a"}
                                  stroke={wDef.hexMain}
                                  strokeWidth={isHovered ? "3" : "2"}
                                />
                                {/* Copper Receptor Prongs */}
                                <rect
                                  x={RIGHT_TERMINAL_X - 16}
                                  y={sy - 7}
                                  width="8"
                                  height="14"
                                  fill="#d97706"
                                />
                                {/* Colored Terminal Stripe */}
                                <rect
                                  x="320"
                                  y={sy - 9}
                                  width="18"
                                  height="18"
                                  fill={wDef.hexMain}
                                />
                                {/* Right-side Status LED Indicator (Turns Green when Linked!) */}
                                <rect
                                  x="342"
                                  y={sy - 5}
                                  width="10"
                                  height="10"
                                  fill={isLinked ? "#4ade80" : "#334155"}
                                  stroke="#000"
                                  strokeWidth="1.5"
                                />
                                {/* Electrical Spark Burst on Snap */}
                                {isSparking && (
                                  <g>
                                    <line
                                      x1={RIGHT_TERMINAL_X - 18}
                                      y1={sy - 18}
                                      x2={RIGHT_TERMINAL_X + 6}
                                      y2={sy + 18}
                                      stroke="#fde047"
                                      strokeWidth="3"
                                    />
                                    <line
                                      x1={RIGHT_TERMINAL_X - 18}
                                      y1={sy + 18}
                                      x2={RIGHT_TERMINAL_X + 6}
                                      y2={sy - 18}
                                      stroke="#67e8f9"
                                      strokeWidth="3"
                                    />
                                  </g>
                                )}
                              </g>
                            );
                          })}

                          {/* ALREADY CONNECTED WIRES (Curved Shaded 2D Cables) */}
                          {LEFT_WIRE_ORDER.map((wireColor, lIdx) => {
                            if (!connectedCables[wireColor]) return null;
                            const wDef = WIRE_DEFS[wireColor];
                            const rIdx = RIGHT_SOCKET_ORDER.indexOf(wireColor);
                            const y1 = getLeftTerminalY(lIdx);
                            const y2 = getRightTerminalY(rIdx);
                            const midX = (LEFT_TERMINAL_X + RIGHT_TERMINAL_X) * 0.5;
                            const sagY = (y1 + y2) * 0.5 + 14;
                            const pathData = `M ${LEFT_TERMINAL_X} ${y1} Q ${midX} ${sagY} ${
                              RIGHT_TERMINAL_X - 12
                            } ${y2}`;

                            return (
                              <g key={`linked-${wireColor}`}>
                                {/* Drop Shadow */}
                                <path
                                  d={pathData}
                                  stroke="rgba(0,0,0,0.75)"
                                  strokeWidth="14"
                                  strokeLinecap="round"
                                  fill="none"
                                  transform="translate(0, 4)"
                                />
                                {/* Dark Outer Insulation */}
                                <path
                                  d={pathData}
                                  stroke={wDef.hexDark}
                                  strokeWidth="12"
                                  strokeLinecap="round"
                                  fill="none"
                                />
                                {/* Main Colored Cable Body */}
                                <path
                                  d={pathData}
                                  stroke={wDef.hexMain}
                                  strokeWidth="8"
                                  strokeLinecap="round"
                                  fill="none"
                                />
                                {/* Specular Highlight Stripe */}
                                <path
                                  d={pathData}
                                  stroke={wDef.hexLight}
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  fill="none"
                                  transform="translate(0, -1.5)"
                                />
                                {/* Snapped-in Metallic Connector Head */}
                                <rect
                                  x={RIGHT_TERMINAL_X - 20}
                                  y={y2 - 7}
                                  width="12"
                                  height="14"
                                  fill="#94a3b8"
                                  stroke="#f8fafc"
                                  strokeWidth="1.5"
                                />
                              </g>
                            );
                          })}

                          {/* LEFT-HAND WIRE TERMINALS & UNCONNECTED STUBS */}
                          {LEFT_WIRE_ORDER.map((wireColor, lIdx) => {
                            const wDef = WIRE_DEFS[wireColor];
                            const ly = getLeftTerminalY(lIdx);
                            const isLinked = connectedCables[wireColor];
                            const isBeingDragged = draggingWire === wireColor;

                            return (
                              <g
                                key={wireColor}
                                onPointerDown={(e) => {
                                  e.stopPropagation();
                                  handleStartWireDrag(wireColor, e.clientX, e.clientY);
                                }}
                                className={
                                  isLinked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
                                }
                              >
                                {/* Left Colored Base Block */}
                                <rect
                                  x="6"
                                  y={ly - 10}
                                  width="32"
                                  height="20"
                                  fill={wDef.hexMain}
                                  stroke="#000"
                                  strokeWidth="2"
                                />
                                <rect
                                  x="10"
                                  y={ly - 6}
                                  width="24"
                                  height="5"
                                  fill={wDef.hexLight}
                                />

                                {/* Unconnected Draggable Copper Plug Stub */}
                                {!isLinked && !isBeingDragged && (
                                  <g>
                                    <rect
                                      x="38"
                                      y={ly - 7}
                                      width="22"
                                      height="14"
                                      fill={wDef.hexMain}
                                      stroke="#fff"
                                      strokeWidth="1.5"
                                    />
                                    {/* Copper Prongs */}
                                    <rect
                                      x="60"
                                      y={ly - 5}
                                      width="9"
                                      height="4"
                                      fill="#fbbf24"
                                    />
                                    <rect
                                      x="60"
                                      y={ly + 1}
                                      width="9"
                                      height="4"
                                      fill="#fbbf24"
                                    />
                                  </g>
                                )}
                              </g>
                            );
                          })}

                          {/* ACTIVE LIVE DRAGGED CABLE (FROM LEFT TERMINAL TO CURSOR TIP) */}
                          {draggingWire && dragCursor && (
                            <g className="pointer-events-none">
                              {(() => {
                                const lIdx = LEFT_WIRE_ORDER.indexOf(draggingWire);
                                const wDef = WIRE_DEFS[draggingWire];
                                const y1 = getLeftTerminalY(lIdx);
                                const midX = (LEFT_TERMINAL_X + dragCursor.x) * 0.5;
                                const sagY = (y1 + dragCursor.y) * 0.5 + 18;
                                const livePath = `M ${LEFT_TERMINAL_X} ${y1} Q ${midX} ${sagY} ${dragCursor.x} ${dragCursor.y}`;

                                return (
                                  <>
                                    <path
                                      d={livePath}
                                      stroke="rgba(0,0,0,0.8)"
                                      strokeWidth="15"
                                      strokeLinecap="round"
                                      fill="none"
                                      transform="translate(0, 5)"
                                    />
                                    <path
                                      d={livePath}
                                      stroke={wDef.hexDark}
                                      strokeWidth="12"
                                      strokeLinecap="round"
                                      fill="none"
                                    />
                                    <path
                                      d={livePath}
                                      stroke={wDef.hexMain}
                                      strokeWidth="8"
                                      strokeLinecap="round"
                                      fill="none"
                                    />
                                    <path
                                      d={livePath}
                                      stroke={wDef.hexLight}
                                      strokeWidth="2.5"
                                      strokeLinecap="round"
                                      fill="none"
                                      transform="translate(0, -1.5)"
                                    />
                                    {/* Live Metallic Plug Head at Cursor Tip */}
                                    <rect
                                      x={dragCursor.x - 8}
                                      y={dragCursor.y - 8}
                                      width="16"
                                      height="16"
                                      fill="#e2e8f0"
                                      stroke="#fff"
                                      strokeWidth="2"
                                    />
                                    <rect
                                      x={dragCursor.x + 8}
                                      y={dragCursor.y - 5}
                                      width="7"
                                      height="10"
                                      fill="#fbbf24"
                                    />
                                  </>
                                );
                              })()}
                            </g>
                          )}
                        </svg>
                      </div>

                      <p className="font-silkscreen text-[10px] text-cyan-200 mt-1 text-center">
                        HOLD &amp; DRAG ANY LEFT WIRE PLUG ACROSS THE BOX TO ITS MATCHING COLORED SOCKET!
                      </p>
                    </div>

                    {/* RIGHT BAY (5 Cols): SWAP 2 FRIED AVIONICS MODULES */}
                    <div className="lg:col-span-5 bg-slate-900 border-2 border-amber-400/70 p-3 flex flex-col justify-between space-y-2.5">
                      <div>
                        <span className="font-press-start text-[9px] text-amber-300 block">
                          2. REPLACE 2 FRIED AVIONICS MODULES
                        </span>
                        <p className="font-silkscreen text-[10px] text-slate-300 mt-1">
                          Install the Phase B hardware modules into the damaged slots:
                        </p>
                      </div>

                      <div className="space-y-2">
                        {/* Slot A: Fried Capacitor -> Thermal Circuit Board */}
                        <button
                          type="button"
                          disabled={capacitorReplaced}
                          onClick={() => {
                            sfx.playCollect();
                            setCapacitorReplaced(true);
                            setScore((prev) => prev + 350);
                          }}
                          className={`w-full p-2.5 border-2 text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                            capacitorReplaced
                              ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
                              : "bg-rose-950/85 hover:bg-rose-900 border-rose-400 text-rose-200 animate-pulse"
                          }`}
                        >
                          <div className="w-10 h-10 bg-slate-950 border border-current p-1 shrink-0 flex items-center justify-center">
                            <PixelCargoSprite
                              itemId="thermal_circuit_board"
                              className="w-8 h-8"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-press-start text-[8px] block truncate">
                              {capacitorReplaced
                                ? "✓ THERMAL CIRCUIT BOARD INSTALLED"
                                : "SLOT A: FRIED CAPACITOR BANK"}
                            </span>
                            <span className="font-silkscreen text-[10px] opacity-85 block truncate">
                              {capacitorReplaced
                                ? "28V REGULATOR NOMINAL"
                                : "CLICK TO INSTALL THERMAL CIRCUIT BOARD"}
                            </span>
                          </div>
                        </button>

                        {/* Slot B: Damaged Relay -> S-Band Transponder */}
                        <button
                          type="button"
                          disabled={relayReplaced}
                          onClick={() => {
                            sfx.playCollect();
                            setRelayReplaced(true);
                            setScore((prev) => prev + 350);
                          }}
                          className={`w-full p-2.5 border-2 text-left flex items-center gap-2.5 cursor-pointer transition-all ${
                            relayReplaced
                              ? "bg-emerald-950/90 border-emerald-400 text-emerald-300"
                              : "bg-rose-950/85 hover:bg-rose-900 border-rose-400 text-rose-200 animate-pulse"
                          }`}
                        >
                          <div className="w-10 h-10 bg-slate-950 border border-current p-1 shrink-0 flex items-center justify-center">
                            <PixelCargoSprite itemId="sband_transponder" className="w-8 h-8" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="font-press-start text-[8px] block truncate">
                              {relayReplaced
                                ? "✓ S-BAND TRANSPONDER INSTALLED"
                                : "SLOT B: DAMAGED S-BAND RELAY"}
                            </span>
                            <span className="font-silkscreen text-[10px] opacity-85 block truncate">
                              {relayReplaced
                                ? "DOWNLINK LOCKED @ 2.2 GHZ"
                                : "CLICK TO INSTALL S-BAND TRANSPONDER"}
                            </span>
                          </div>
                        </button>
                      </div>

                      <div
                        className={`p-2 border-2 font-press-start text-[9px] text-center transition-all ${
                          isPanelFullyRepaired
                            ? "bg-emerald-400 border-white text-slate-950 shadow-[0_0_20px_rgba(52,211,153,0.9)]"
                            : "bg-slate-950 border-cyan-400/40 text-cyan-300"
                        }`}
                      >
                        {isPanelFullyRepaired
                          ? "ISS COMMUNICATIONS: 100% ONLINE!"
                          : "LINK ALL 4 WIRES & SWAP BOTH MODULES"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Zero-G Thruster Controls & Open Panel Action Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.left = true)}
                  onMouseUp={() => (keysRef.current.left = false)}
                  onMouseLeave={() => (keysRef.current.left = false)}
                  onTouchStart={() => (keysRef.current.left = true)}
                  onTouchEnd={() => (keysRef.current.left = false)}
                  className="px-2.5 py-2 bg-slate-900 active:bg-cyan-500 active:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] cursor-pointer"
                >
                  &lt; LEFT [A]
                </button>
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.up = true)}
                  onMouseUp={() => (keysRef.current.up = false)}
                  onMouseLeave={() => (keysRef.current.up = false)}
                  onTouchStart={() => (keysRef.current.up = true)}
                  onTouchEnd={() => (keysRef.current.up = false)}
                  className="px-2.5 py-2 bg-slate-900 active:bg-cyan-500 active:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] cursor-pointer"
                >
                  UP [W]
                </button>
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.down = true)}
                  onMouseUp={() => (keysRef.current.down = false)}
                  onMouseLeave={() => (keysRef.current.down = false)}
                  onTouchStart={() => (keysRef.current.down = true)}
                  onTouchEnd={() => (keysRef.current.down = false)}
                  className="px-2.5 py-2 bg-slate-900 active:bg-cyan-500 active:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] cursor-pointer"
                >
                  DOWN [S]
                </button>
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.right = true)}
                  onMouseUp={() => (keysRef.current.right = false)}
                  onMouseLeave={() => (keysRef.current.right = false)}
                  onTouchStart={() => (keysRef.current.right = true)}
                  onTouchEnd={() => (keysRef.current.right = false)}
                  className="px-2.5 py-2 bg-slate-900 active:bg-cyan-500 active:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] cursor-pointer"
                >
                  RIGHT [D] &gt;
                </button>
              </div>

              <button
                type="button"
                disabled={sparesCollected < 3 || !nearCommsPanel}
                onClick={() => {
                  sfx.playClick(780);
                  setPanelOverlayOpen(true);
                }}
                className={`px-4 py-2 border-2 font-press-start text-[10px] uppercase shadow-[4px_4px_0px_#000] flex items-center gap-1.5 ${
                  sparesCollected >= 3 && nearCommsPanel
                    ? "bg-amber-400 hover:bg-amber-300 border-white text-slate-950 cursor-pointer animate-pulse"
                    : "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Radio className="w-3.5 h-3.5" />
                <span>[E] OPEN COMMS PANEL ({sparesCollected}/3 SPARES)</span>
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

              {/* Mission Debrief & Lessons Learned */}
              <div className="md:col-span-7 space-y-3">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-950 border border-emerald-400 text-emerald-300 font-press-start text-[9px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>PHASE F // MISSION CLOSEOUT &amp; LESSONS LEARNED</span>
                </div>

                <h1 className="font-press-start text-base sm:text-xl text-emerald-300 tracking-wide">
                  - CONGRATULATIONS - MISSION SUCCESSFUL
                </h1>

                <p className="font-vt323 text-xl text-slate-200 leading-snug">
                  Commander {playerName}, ISS S-Band and Ku-Band communications are 100% online!
                  Full telemetry with the orbital crew has been restored at 408 km Low Earth Orbit.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-silkscreen text-xs">
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">ORBIT ALT</span>
                    <strong className="text-cyan-300">408 KM LEO</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">COMMS LINK</span>
                    <strong className="text-emerald-300">100% ONLINE</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">BASE SCORE</span>
                    <strong className="text-amber-300">{standardizedScore1000} / 1000</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-emerald-400/60">
                    <span className="text-slate-400 block text-[10px]">NASA RANK</span>
                    <strong className="text-emerald-300 text-sm">RANK {finalRank}</strong>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900/90 border border-cyan-400/40 font-silkscreen text-[11px] text-cyan-200">
                  <strong>LESSONS LEARNED:</strong> Modular Orbital Replacement Units (ORUs) and
                  zero-reaction EVA tools allow astronauts to service critical station avionics in
                  microgravity while traveling at 27,600 km/h.
                </div>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => transitionToPhase("PHASE_E_EVA")}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400 text-cyan-200 font-press-start text-[10px] cursor-pointer"
                  >
                    [ REPLAY 2D EVA ]
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
                  <span>PHASE E // EVA CONTINGENCY ABORT</span>
                </div>

                <h1 className="font-press-start text-base sm:text-xl text-rose-400 tracking-wide">
                  MISSION ABORTED — RETURN TO AIRLOCK
                </h1>

                <p className="font-vt323 text-xl text-slate-200 leading-snug">
                  {failureReason}
                </p>

                <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => transitionToPhase("PHASE_E_EVA")}
                    className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-[10px] font-bold shadow-[4px_4px_0px_#000] cursor-pointer"
                  >
                    [ RETRY PHASE E EVA &gt; ]
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
