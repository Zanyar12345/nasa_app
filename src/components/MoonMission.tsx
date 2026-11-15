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
  Compass,
  Award,
  AlertTriangle,
  Radio,
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

interface LunarCargoItem {
  id: string;
  name: string;
  w: number;
  h: number;
  weight: number;
  required: boolean;
  color: string;
  borderColor: string;
  description: string;
  category: string;
}

interface PlacedLunarCargo {
  uid: string;
  itemId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface LunarSampleNode {
  id: number;
  type: "ICE_CRYSTAL" | "HE3_CORE";
  label: string;
  x: number;
  y: number;
  collected: boolean;
}

interface LunarHazard {
  id: number;
  type: "CRATER" | "BOULDER";
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
}

interface ThrusterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

const LUNAR_CARGO_ITEMS: LunarCargoItem[] = [
  {
    id: "core_drill",
    name: "CORE DRILL RIG (2x2)",
    w: 2,
    h: 2,
    weight: 35,
    required: true,
    color: "bg-cyan-500/85",
    borderColor: "border-cyan-200",
    description:
      "Required rotary-percussive drill to extract water-ice cores from permanently shadowed polar craters.",
    category: "REQUIRED SCIENCE PAYLOAD",
  },
  {
    id: "lunar_seismometer",
    name: "LUNAR SEISMOMETER (1x3)",
    w: 1,
    h: 3,
    weight: 25,
    required: true,
    color: "bg-sky-500/85",
    borderColor: "border-sky-200",
    description:
      "Required ultra-sensitive seismic station to monitor shallow moonquakes and meteoroid impacts.",
    category: "REQUIRED GEOPHYSICS",
  },
  {
    id: "he3_canister",
    name: "HELIUM-3 CANISTER (2x1)",
    w: 2,
    h: 1,
    weight: 20,
    required: true,
    color: "bg-amber-500/85",
    borderColor: "border-amber-200",
    description:
      "Required pressurized containment vessel for storing solar-wind implanted Helium-3 regolith samples.",
    category: "REQUIRED CONTAINMENT",
  },
  {
    id: "solar_beacon",
    name: "SOLAR RELAY BEACON (1x2)",
    w: 1,
    h: 2,
    weight: 18,
    required: true,
    color: "bg-emerald-500/85",
    borderColor: "border-emerald-200",
    description:
      "Required S-band & optical telemetry transponder to relay South Pole data back to Earth.",
    category: "REQUIRED COMMS",
  },
  {
    id: "beach_umbrella",
    name: "BEACH UMBRELLA (2x2)",
    w: 2,
    h: 2,
    weight: 15,
    required: false,
    color: "bg-rose-600/80",
    borderColor: "border-rose-300",
    description:
      "DECOY ITEM! Useless in a hard vacuum with no atmosphere—do not pack inside the Lunar Lander!",
    category: "NON-FLIGHT DECOY",
  },
  {
    id: "bowling_ball",
    name: "BOWLING BALL (1x3)",
    w: 1,
    h: 3,
    weight: 40,
    required: false,
    color: "bg-purple-600/80",
    borderColor: "border-purple-300",
    description:
      "DECOY ITEM! Dead weight that wastes critical Saturn V translunar injection delta-v!",
    category: "NON-FLIGHT DECOY",
  },
];

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
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.57.jpeg",
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
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE B & C: 4x4 LUNAR CARGO BAY STATE
  // ─────────────────────────────────────────────────────────────────────────
  const [placedCargo, setPlacedCargo] = useState<PlacedLunarCargo[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string>("core_drill");
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);
  const [cargoFeedback, setCargoFeedback] = useState<string>(
    "SELECT A REQUIRED LUNAR TOOL AND PLACE IT INSIDE THE 4x4 LANDER BAY."
  );

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: 2D LUNAR SURFACE ROVER & 1/6G SAMPLE EXPEDITION STATE
  // ─────────────────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [expeditionTimeLeft, setExpeditionTimeLeft] = useState<number>(95);
  const [hullShields, setHullShields] = useState<number>(3);
  const [iceCollected, setIceCollected] = useState<number>(0);
  const [he3Collected, setHe3Collected] = useState<number>(0);
  const [nearBeacon, setNearBeacon] = useState<boolean>(false);
  const [seismometerDeployed, setSeismometerDeployed] = useState<boolean>(false);
  const [failureReason, setFailureReason] = useState<string>("");

  const keysRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({
    left: false,
    right: false,
    jump: false,
  });

  const roverRef = useRef<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    onGround: boolean;
    facing: 1 | -1;
    invulnFrames: number;
  }>({
    x: 110,
    y: 340,
    vx: 0,
    vy: 0,
    onGround: true,
    facing: 1,
    invulnFrames: 0,
  });

  const samplesRef = useRef<LunarSampleNode[]>([]);
  const hazardsRef = useRef<LunarHazard[]>([]);
  const particlesRef = useRef<ThrusterParticle[]>([]);

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

  // Initialize Phase E 2D Lunar Expedition entities
  const initLunarExpedition = useCallback(() => {
    roverRef.current = {
      x: 90,
      y: 340,
      vx: 0,
      vy: 0,
      onGround: true,
      facing: 1,
      invulnFrames: 0,
    };
    setExpeditionTimeLeft(95);
    setHullShields(3);
    setIceCollected(0);
    setHe3Collected(0);
    setNearBeacon(false);
    setSeismometerDeployed(false);

    samplesRef.current = [
      { id: 1, type: "ICE_CRYSTAL", label: "H2O ICE #1", x: 380, y: 310, collected: false },
      { id: 2, type: "HE3_CORE", label: "HE-3 CORE #1", x: 670, y: 245, collected: false },
      { id: 3, type: "ICE_CRYSTAL", label: "H2O ICE #2", x: 990, y: 295, collected: false },
      { id: 4, type: "HE3_CORE", label: "HE-3 CORE #2", x: 1320, y: 225, collected: false },
      { id: 5, type: "ICE_CRYSTAL", label: "H2O ICE #3", x: 1650, y: 295, collected: false },
      { id: 6, type: "HE3_CORE", label: "HE-3 CORE #3", x: 1960, y: 240, collected: false },
    ];

    hazardsRef.current = [
      { id: 1, type: "CRATER", x: 470, y: 382, w: 95, h: 28, vx: 0 },
      { id: 2, type: "CRATER", x: 1090, y: 382, w: 110, h: 28, vx: 0 },
      { id: 3, type: "CRATER", x: 1730, y: 382, w: 105, h: 28, vx: 0 },
      { id: 4, type: "BOULDER", x: 840, y: 354, w: 28, h: 28, vx: -1.35 },
      { id: 5, type: "BOULDER", x: 1490, y: 354, w: 28, h: 28, vx: -1.6 },
      { id: 6, type: "BOULDER", x: 2060, y: 354, w: 28, h: 28, vx: -1.4 },
    ];

    particlesRef.current = [];
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
        transitionToPhase("PHASE_BC_CARGO");
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

  // Animated 0% -> 100% loading bar for Stages 1 through 6
  useEffect(() => {
    if (!currentStage || phase === "STAGE_7") return;

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
  // PHASE B/C: 4x4 CARGO BAY LOGIC
  // ─────────────────────────────────────────────────────────────────────────
  const selectedTool =
    LUNAR_CARGO_ITEMS.find((item) => item.id === selectedToolId) || LUNAR_CARGO_ITEMS[0];
  const activeW = isRotated ? selectedTool.h : selectedTool.w;
  const activeH = isRotated ? selectedTool.w : selectedTool.h;

  const packedRequiredCount = placedCargo.filter((p) => {
    const def = LUNAR_CARGO_ITEMS.find((i) => i.id === p.itemId);
    return def?.required;
  }).length;

  const packedDecoyCount = placedCargo.filter((p) => {
    const def = LUNAR_CARGO_ITEMS.find((i) => i.id === p.itemId);
    return def && !def.required;
  }).length;

  const totalCargoWeight = placedCargo.reduce((acc, p) => {
    const def = LUNAR_CARGO_ITEMS.find((i) => i.id === p.itemId);
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
      setCargoFeedback(`REMOVED ${existing.itemId.toUpperCase()} FROM LUNAR CARGO BAY.`);
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
      setCargoFeedback(`PACKED ${selectedTool.name} INTO LUNAR DESCENT MODULE.`);
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
      { uid: "auto-1", itemId: "core_drill", x: 0, y: 0, w: 2, h: 2 },
      { uid: "auto-2", itemId: "lunar_seismometer", x: 2, y: 0, w: 1, h: 3 },
      { uid: "auto-3", itemId: "solar_beacon", x: 3, y: 0, w: 1, h: 2 },
      { uid: "auto-4", itemId: "he3_canister", x: 0, y: 2, w: 2, h: 1 },
    ]);
    setCargoFeedback("ALL 4 REQUIRED LUNAR SCIENCE PAYLOADS PACKED & VERIFIED!");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: DEPLOY SEISMOMETER AT LUNAR LANDER BEACON
  // ─────────────────────────────────────────────────────────────────────────
  const handleDeploySeismometer = useCallback(() => {
    if (phase !== "PHASE_E_EXPEDITION") return;
    const totalSamples = iceCollected + he3Collected;
    if (totalSamples < 6) {
      sfx.playDamage();
      return;
    }
    if (!nearBeacon) {
      sfx.playDamage();
      return;
    }
    sfx.playVictoryFanfare();
    setSeismometerDeployed(true);
    setScore((prev) => prev + 1500 + expeditionTimeLeft * 20 + hullShields * 300);
    setTimeout(() => {
      transitionToPhase("PHASE_F_VICTORY");
    }, 650);
  }, [
    phase,
    iceCollected,
    he3Collected,
    nearBeacon,
    expeditionTimeLeft,
    hullShields,
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

      if (phase === "PHASE_E_EXPEDITION") {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
          keysRef.current.left = true;
        }
        if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
          keysRef.current.right = true;
        }
        if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
          e.preventDefault();
          keysRef.current.jump = true;
        }
        if (e.key === "e" || e.key === "E") {
          e.preventDefault();
          handleDeploySeismometer();
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
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W" || e.key === " ") {
        keysRef.current.jump = false;
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
    handleNextStage,
    handlePrevStage,
    handleDeploySeismometer,
    onAbort,
  ]);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: OXYGEN / BATTERY COUNTDOWN TIMER
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "PHASE_E_EXPEDITION" || seismometerDeployed) return;
    const timer = setInterval(() => {
      setExpeditionTimeLeft((prev) => {
        if (prev <= 1) {
          sfx.playDamage();
          setFailureReason(
            "LUNAR ROVER BATTERY & LIFE SUPPORT DEPLETED DURING THE -200°C SOUTH POLE EXPEDITION."
          );
          transitionToPhase("PHASE_F_FAILURE");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, seismometerDeployed, transitionToPhase]);

  // ─────────────────────────────────────────────────────────────────────────
  // PHASE E: 2D SIDE-SCROLLING 1/6G LUNAR SURFACE CANVAS LOOP
  // ─────────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== "PHASE_E_EXPEDITION") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    const WORLD_WIDTH = 2400;
    const GROUND_Y = 382;
    const BEACON_X = 2230;

    // Platform ridges across the Lunar South Pole traverse
    const ridges = [
      { x: 310, y: 332, w: 130, h: 14 },
      { x: 610, y: 272, w: 145, h: 14 },
      { x: 930, y: 320, w: 130, h: 14 },
      { x: 1255, y: 252, w: 150, h: 14 },
      { x: 1590, y: 320, w: 125, h: 14 },
      { x: 1900, y: 268, w: 140, h: 14 },
    ];

    const renderFrame = () => {
      const rover = roverRef.current;

      // Horizontal movement
      const accel = 0.42;
      const maxSpeed = 4.6;
      if (keysRef.current.left) {
        rover.vx = Math.max(-maxSpeed, rover.vx - accel);
        rover.facing = -1;
      } else if (keysRef.current.right) {
        rover.vx = Math.min(maxSpeed, rover.vx + accel);
        rover.facing = 1;
      } else {
        rover.vx *= 0.86;
        if (Math.abs(rover.vx) < 0.05) rover.vx = 0;
      }

      // Floaty 1/6g Lunar Jump + Thruster Assist
      if (keysRef.current.jump) {
        if (rover.onGround) {
          rover.vy = -7.8; // Floaty 1/6g leap
          rover.onGround = false;
          sfx.playJump();
        } else if (rover.vy > -3.2) {
          // Gentle 1/6g cold-gas thruster boost
          rover.vy -= 0.22;
          particlesRef.current.push({
            x: rover.x + 22,
            y: rover.y + 32,
            vx: (Math.random() - 0.5) * 1.6,
            vy: 2.2 + Math.random() * 1.5,
            life: 0,
            maxLife: 18,
            color: "#38bdf8",
          });
        }
      }

      // 1/6th Lunar Gravity (floaty descent)
      rover.vy = Math.min(5.2, rover.vy + 0.18);
      rover.x = Math.max(24, Math.min(WORLD_WIDTH - 64, rover.x + rover.vx));
      rover.y += rover.vy;

      // Ground & Platform Collision
      rover.onGround = false;
      for (const ridge of ridges) {
        if (
          rover.vy >= 0 &&
          rover.x + 36 > ridge.x &&
          rover.x + 8 < ridge.x + ridge.w &&
          rover.y + 34 >= ridge.y &&
          rover.y + 34 <= ridge.y + ridge.h + 10
        ) {
          rover.y = ridge.y - 34;
          rover.vy = 0;
          rover.onGround = true;
        }
      }

      if (rover.y + 34 >= GROUND_Y) {
        rover.y = GROUND_Y - 34;
        rover.vy = 0;
        rover.onGround = true;
      }

      if (rover.invulnFrames > 0) {
        rover.invulnFrames -= 1;
      }

      // Check Sample Collection
      for (const sample of samplesRef.current) {
        if (!sample.collected) {
          const dx = rover.x + 22 - sample.x;
          const dy = rover.y + 17 - sample.y;
          if (Math.hypot(dx, dy) < 34) {
            sample.collected = true;
            sfx.playCollect();
            setScore((prev) => prev + 350);
            if (sample.type === "ICE_CRYSTAL") {
              setIceCollected((prev) => prev + 1);
            } else {
              setHe3Collected((prev) => prev + 1);
            }
            for (let i = 0; i < 12; i++) {
              particlesRef.current.push({
                x: sample.x,
                y: sample.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                life: 0,
                maxLife: 24,
                color: sample.type === "ICE_CRYSTAL" ? "#22d3ee" : "#fbbf24",
              });
            }
          }
        }
      }

      // Update & Check Hazards (Craters & Rolling Micrometeorite Boulders)
      for (const haz of hazardsRef.current) {
        if (haz.type === "BOULDER") {
          haz.x += haz.vx;
          if (haz.x < 320) haz.x = WORLD_WIDTH - 180;
        }

        const hitX = rover.x + 34 > haz.x + 6 && rover.x + 8 < haz.x + haz.w - 6;
        const hitY = rover.y + 34 > haz.y + 4 && rover.y + 6 < haz.y + haz.h;

        if (hitX && hitY && rover.invulnFrames === 0) {
          rover.invulnFrames = 65;
          rover.vy = -5.2;
          rover.vx = -rover.facing * 3.5;
          sfx.playDamage();
          setHullShields((prev) => {
            const next = prev - 1;
            if (next <= 0) {
              setFailureReason(
                "LUNAR ROVER HULL INTEGRITY CRITICAL AFTER CRATER / MICROMETEORITE IMPACT."
              );
              transitionToPhase("PHASE_F_FAILURE");
            }
            return Math.max(0, next);
          });
        }
      }

      // Check proximity to Lunar Lander Beacon Zone
      const isNear = Math.abs(rover.x - BEACON_X) < 95;
      setNearBeacon(isNear);

      // Camera viewport tracking
      const camX = Math.max(
        0,
        Math.min(WORLD_WIDTH - canvas.width, rover.x - canvas.width * 0.35)
      );

      // ─────────────────────────────────────────────────────────────────────
      // RENDER 16-BIT PIXEL ART LUNAR SOUTH POLE SCENE
      // ─────────────────────────────────────────────────────────────────────
      ctx.fillStyle = "#030712";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Deep space starfield (parallax)
      for (let i = 0; i < 65; i++) {
        const sx = ((i * 173 - camX * 0.15) % canvas.width + canvas.width) % canvas.width;
        const sy = (i * 79) % 270;
        ctx.fillStyle = i % 4 === 0 ? "#67e8f9" : "#f8fafc";
        ctx.fillRect(sx, sy, i % 3 === 0 ? 2 : 1.5, i % 3 === 0 ? 2 : 1.5);
      }

      // Blue & White Pixel Earth hanging on the horizon
      const earthX = 760 - camX * 0.08;
      const earthY = 82;
      ctx.save();
      ctx.fillStyle = "#0284c7";
      ctx.beginPath();
      ctx.arc(earthX, earthY, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#22c55e";
      ctx.fillRect(earthX - 16, earthY - 12, 18, 12);
      ctx.fillRect(earthX + 4, earthY + 2, 14, 10);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillRect(earthX - 20, earthY - 4, 28, 4);
      ctx.fillRect(earthX - 8, earthY + 12, 22, 4);
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // Distant South Pole Crater Rim Mountains (Parallax)
      ctx.fillStyle = "#1e293b";
      for (let i = 0; i < 14; i++) {
        const mx = i * 220 - (camX * 0.35) % 220;
        const mh = 75 + (i % 3) * 32;
        ctx.beginPath();
        ctx.moveTo(mx - 40, GROUND_Y);
        ctx.lineTo(mx + 70, GROUND_Y - mh);
        ctx.lineTo(mx + 190, GROUND_Y);
        ctx.closePath();
        ctx.fill();
      }

      ctx.save();
      ctx.translate(-camX, 0);

      // Lunar Regolith Surface Floor
      ctx.fillStyle = "#475569";
      ctx.fillRect(0, GROUND_Y, WORLD_WIDTH, canvas.height - GROUND_Y);
      ctx.fillStyle = "#94a3b8";
      ctx.fillRect(0, GROUND_Y, WORLD_WIDTH, 5);

      // Elevated Crater Ridges / Platforms
      for (const ridge of ridges) {
        ctx.fillStyle = "#334155";
        ctx.fillRect(ridge.x, ridge.y, ridge.w, ridge.h);
        ctx.fillStyle = "#67e8f9";
        ctx.fillRect(ridge.x, ridge.y, ridge.w, 3);
      }

      // Draw Craters & Rolling Micrometeorite Boulders
      for (const haz of hazardsRef.current) {
        if (haz.type === "CRATER") {
          // Permanently Shadowed Dark Crater Pit
          ctx.fillStyle = "#090d16";
          ctx.fillRect(haz.x, GROUND_Y - 2, haz.w, 36);
          ctx.strokeStyle = "#f43f5e";
          ctx.lineWidth = 2;
          ctx.strokeRect(haz.x, GROUND_Y - 2, haz.w, 32);
          ctx.fillStyle = "#f43f5e";
          ctx.font = "bold 9px monospace";
          ctx.fillText("CRATER HAZARD", haz.x + 8, GROUND_Y + 18);
        } else {
          // Rolling Boulder
          ctx.fillStyle = "#f97316";
          ctx.fillRect(haz.x, haz.y, haz.w, haz.h);
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 2;
          ctx.strokeRect(haz.x, haz.y, haz.w, haz.h);
          ctx.fillStyle = "#7c2d12";
          ctx.fillRect(haz.x + 6, haz.y + 6, 8, 8);
        }
      }

      // Draw Collectible Lunar Samples (Water Ice Crystals & Helium-3 Cores)
      const pulse = Math.sin(performance.now() * 0.006) * 4;
      for (const sample of samplesRef.current) {
        if (sample.collected) continue;
        const sy = sample.y + pulse;
        if (sample.type === "ICE_CRYSTAL") {
          // Glowing Cyan Polar Water Ice Crystal
          ctx.fillStyle = "#06b6d4";
          ctx.fillRect(sample.x - 10, sy - 12, 20, 24);
          ctx.fillStyle = "#cffafe";
          ctx.fillRect(sample.x - 5, sy - 7, 10, 14);
          ctx.strokeStyle = "#67e8f9";
          ctx.lineWidth = 2;
          ctx.strokeRect(sample.x - 12, sy - 14, 24, 28);
          ctx.fillStyle = "#67e8f9";
          ctx.font = "bold 10px monospace";
          ctx.fillText("H2O ICE", sample.x - 20, sy - 18);
        } else {
          // Glowing Golden Helium-3 Regolith Core
          ctx.fillStyle = "#f59e0b";
          ctx.fillRect(sample.x - 11, sy - 11, 22, 22);
          ctx.fillStyle = "#fef08a";
          ctx.fillRect(sample.x - 6, sy - 6, 12, 12);
          ctx.strokeStyle = "#fde047";
          ctx.lineWidth = 2;
          ctx.strokeRect(sample.x - 13, sy - 13, 26, 26);
          ctx.fillStyle = "#fde047";
          ctx.font = "bold 10px monospace";
          ctx.fillText("HE-3 CORE", sample.x - 24, sy - 18);
        }
      }

      // Draw Lunar Lander & Fission Surface Power Beacon Zone at the End of Traverse
      ctx.fillStyle = "#eab308";
      ctx.fillRect(BEACON_X - 28, GROUND_Y - 78, 56, 52);
      ctx.fillStyle = "#cbd5e1";
      ctx.fillRect(BEACON_X - 22, GROUND_Y - 112, 44, 34);
      ctx.strokeStyle = "#22d3ee";
      ctx.lineWidth = 2;
      ctx.strokeRect(BEACON_X - 36, GROUND_Y - 122, 72, 122);
      // Landing legs
      ctx.strokeStyle = "#eab308";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(BEACON_X - 26, GROUND_Y - 26);
      ctx.lineTo(BEACON_X - 42, GROUND_Y);
      ctx.moveTo(BEACON_X + 26, GROUND_Y - 26);
      ctx.lineTo(BEACON_X + 42, GROUND_Y);
      ctx.stroke();

      ctx.fillStyle = "#22d3ee";
      ctx.font = "bold 11px monospace";
      ctx.fillText("LUNAR LANDER BEACON ZONE", BEACON_X - 75, GROUND_Y - 130);

      // Update & Draw Thruster Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.life += 1;
        if (pt.life >= pt.maxLife) {
          particlesRef.current.splice(i, 1);
          continue;
        }
        ctx.fillStyle = pt.color;
        ctx.fillRect(pt.x, pt.y, 4, 4);
      }

      // Draw 16-Bit Pixel Lunar Rover & Astronaut
      if (rover.invulnFrames % 4 < 2) {
        // Rover chassis
        ctx.fillStyle = "#e2e8f0";
        ctx.fillRect(rover.x + 4, rover.y + 14, 38, 12);
        // Gold thermal blanket trim
        ctx.fillStyle = "#f59e0b";
        ctx.fillRect(rover.x + 10, rover.y + 16, 26, 6);
        // Astronaut helmet & suit
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(rover.x + 14, rover.y + 2, 16, 14);
        // Gold reflective visor
        ctx.fillStyle = "#38bdf8";
        ctx.fillRect(
          rover.facing === 1 ? rover.x + 21 : rover.x + 15,
          rover.y + 5,
          7,
          6
        );
        // High-gain dish antenna
        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(rover.x + 6, rover.y + 4, 4, 10);
        // Rover wheels
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(rover.x + 4, rover.y + 24, 10, 10);
        ctx.fillRect(rover.x + 30, rover.y + 24, 10, 10);
        ctx.strokeStyle = "#38bdf8";
        ctx.lineWidth = 2;
        ctx.strokeRect(rover.x + 4, rover.y + 24, 10, 10);
        ctx.strokeRect(rover.x + 30, rover.y + 24, 10, 10);
      }

      ctx.restore();

      animId = requestAnimationFrame(renderFrame);
    };

    animId = requestAnimationFrame(renderFrame);
    return () => cancelAnimationFrame(animId);
  }, [phase, transitionToPhase]);

  const totalSamplesCollected = iceCollected + he3Collected;
  const finalRank = score >= 3600 ? "S" : score >= 2600 ? "A" : "B";

  const lifecycleTag =
    phase === "PHASE_A_BRIEFING"
      ? "PHASE A // ARTEMIS LUNAR CONCEPT & OBJECTIVES"
      : phase === "PHASE_BC_CARGO"
        ? "PHASE B/C // LUNAR LANDER CARGO BAY"
        : currentStage
          ? "PHASE D // SATURN V ASCENT & TRANSLUNAR TRANSIT"
          : phase === "PHASE_E_EXPEDITION"
            ? "PHASE E // LUNAR SURFACE OPERATIONS (1/6G EXPEDITION)"
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
                        : "[ PROCEED TO PHASE B: LUNAR CARGO PREP > ]"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE B & C: 4x4 LUNAR LANDER CARGO BAY MINI-GAME           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_BC_CARGO" && (
          <div className="my-auto mx-auto w-full max-w-6xl bg-slate-950/90 border-2 border-cyan-400 p-4 sm:p-6 shadow-[8px_8px_0px_#000] backdrop-blur-md space-y-4">
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-cyan-400/40 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-cyan-400" />
                  <span className="font-press-start text-[10px] text-cyan-300 uppercase">
                    PHASE B/C // LUNAR LANDER CARGO BAY CONFIGURATION
                  </span>
                </div>
                <h2 className="font-press-start text-sm sm:text-lg text-white mt-1">
                  PACK ALL 4 REQUIRED LUNAR TOOLS (AVOID 2 DECOYS)
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
                  MASS: <strong>{totalCargoWeight} / 100 KG</strong>
                </span>
              </div>
            </div>

            {/* Main Grid: Tool Selector + 4x4 Cargo Grid + Blueprint Scanner */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left Column: 6 Lunar Items (4 Required + 2 Decoys) */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-press-start text-cyan-300">
                  <span>1. SELECT PAYLOAD ITEM</span>
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
                  {LUNAR_CARGO_ITEMS.map((item) => {
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
                        className={`text-left p-2.5 border-2 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-slate-800 border-cyan-300 shadow-[3px_3px_0px_#000]"
                            : "bg-slate-900/90 border-slate-700 hover:border-slate-500"
                        } ${isPacked ? "opacity-60" : ""}`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span
                            className={`text-[9px] font-press-start px-1.5 py-0.5 ${
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
                        <p className="font-press-start text-[10px] text-white mt-1.5 truncate">
                          {item.name}
                        </p>
                        <p className="font-silkscreen text-[10px] text-emerald-300 mt-0.5">
                          {isPacked ? "✓ PACKED (CLICK IN BAY TO REMOVE)" : "READY TO PACK"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Center Column: Interactive 4x4 Cargo Bay Grid */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="w-full flex items-center justify-between text-[10px] font-press-start text-cyan-300 mb-2">
                  <span>2. 4x4 DESCENT BAY GRID</span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(450);
                      setPlacedCargo([]);
                      setCargoFeedback("CARGO BAY CLEARED.");
                    }}
                    className="px-2 py-0.5 bg-slate-900 hover:bg-rose-950 border border-slate-600 text-slate-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>CLEAR</span>
                  </button>
                </div>

                <div
                  className="grid grid-cols-4 gap-1.5 p-3 bg-slate-900 border-2 border-cyan-400 shadow-[6px_6px_0px_#000]"
                  onMouseLeave={() => setHoverCell(null)}
                >
                  {Array.from({ length: 16 }).map((_, idx) => {
                    const gx = idx % 4;
                    const gy = Math.floor(idx / 4);
                    const placed = placedCargo.find(
                      (p) => gx >= p.x && gx < p.x + p.w && gy >= p.y && gy < p.y + p.h
                    );
                    const placedDef = placed
                      ? LUNAR_CARGO_ITEMS.find((i) => i.id === placed.itemId)
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
                        className={`w-14 h-14 sm:w-16 sm:h-16 border-2 flex flex-col items-center justify-center p-1 text-center transition-colors cursor-pointer ${
                          placed && placedDef
                            ? `${placedDef.color} ${placedDef.borderColor}`
                            : isPreview
                              ? previewValid
                                ? "bg-emerald-500/40 border-emerald-300"
                                : "bg-rose-500/40 border-rose-400"
                              : "bg-slate-950 hover:bg-slate-900 border-slate-700"
                        }`}
                      >
                        {placed && placedDef ? (
                          <>
                            <span className="font-press-start text-[7px] text-white leading-tight line-clamp-2">
                              {placedDef.name.split(" (")[0]}
                            </span>
                            <span className="font-silkscreen text-[8px] text-slate-950 bg-white/80 px-1 mt-0.5">
                              {placedDef.required ? "OK" : "DECOY"}
                            </span>
                          </>
                        ) : (
                          <span className="font-silkscreen text-[9px] text-slate-600">
                            {gx},{gy}
                          </span>
                        )}
                      </button>
                    );
                  })}
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
                <div className="border-b border-cyan-400/30 pb-2">
                  <span className="font-press-start text-[9px] text-cyan-300">
                    BLUEPRINT SCANNER // TELEMETRY
                  </span>
                  <h3 className="font-press-start text-xs text-white mt-1">
                    {selectedTool.name}
                  </h3>
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
                  [ START PHASE E: 1/6G LUNAR SURFACE EXPEDITION &gt; ]
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE E: 2D LUNAR SURFACE ROVER & 1/6G SAMPLE EXPEDITION    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_E_EXPEDITION" && (
          <div className="my-auto mx-auto w-full max-w-5xl bg-slate-950/95 border-2 border-cyan-400 p-3 sm:p-4 shadow-[8px_8px_0px_#000] space-y-3">
            {/* Top Expedition Telemetry Strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cyan-400/40 pb-2">
              <div className="flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="font-press-start text-[10px] text-cyan-300">
                  PHASE E // LUNAR SOUTH POLE 1/6G EXPEDITION
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 font-silkscreen text-xs">
                {/* Hull Shields */}
                <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-900 border border-rose-400/60">
                  <Shield className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-slate-200 mr-1">HULL:</span>
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <Heart
                      key={idx}
                      className={`w-3.5 h-3.5 ${
                        idx < hullShields
                          ? "text-rose-400 fill-rose-400"
                          : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>

                {/* Water Ice Samples */}
                <div className="px-2.5 py-1 bg-slate-900 border border-cyan-400/60 text-cyan-300">
                  H2O ICE: <strong className="text-white">{iceCollected} / 3</strong>
                </div>

                {/* Helium-3 Cores */}
                <div className="px-2.5 py-1 bg-slate-900 border border-amber-400/60 text-amber-300">
                  HE-3 CORES: <strong className="text-white">{he3Collected} / 3</strong>
                </div>

                {/* O2 / Battery Timer */}
                <div
                  className={`px-2.5 py-1 border font-bold ${
                    expeditionTimeLeft <= 20
                      ? "bg-rose-950 border-rose-400 text-rose-300 animate-pulse"
                      : "bg-slate-900 border-emerald-400/60 text-emerald-300"
                  }`}
                >
                  O2 / BATTERY: {expeditionTimeLeft}s
                </div>
              </div>
            </div>

            {/* 2D HTML5 Canvas */}
            <div className="relative w-full overflow-hidden border-2 border-slate-700 bg-black">
              <canvas
                ref={canvasRef}
                width={920}
                height={420}
                className="w-full h-[290px] sm:h-[360px] block"
              />

              {/* Beacon Action Prompt Banner */}
              {totalSamplesCollected >= 6 && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-emerald-950/95 border-2 border-emerald-400 text-emerald-200 font-press-start text-[10px] shadow-[4px_4px_0px_#000] animate-bounce">
                  ALL 6 SAMPLES COLLECTED! DRIVE RIGHT TO LANDER BEACON &amp; PRESS [E]
                </div>
              )}
            </div>

            {/* Bottom Controls & Deploy Seismometer Button */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Touch / On-screen Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.left = true)}
                  onMouseUp={() => (keysRef.current.left = false)}
                  onMouseLeave={() => (keysRef.current.left = false)}
                  onTouchStart={() => (keysRef.current.left = true)}
                  onTouchEnd={() => (keysRef.current.left = false)}
                  className="px-3 py-2 bg-slate-900 active:bg-cyan-500 active:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[10px] cursor-pointer"
                >
                  &lt; LEFT [A]
                </button>
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.jump = true)}
                  onMouseUp={() => (keysRef.current.jump = false)}
                  onMouseLeave={() => (keysRef.current.jump = false)}
                  onTouchStart={() => (keysRef.current.jump = true)}
                  onTouchEnd={() => (keysRef.current.jump = false)}
                  className="px-3.5 py-2 bg-cyan-950 active:bg-cyan-400 active:text-slate-950 border-2 border-cyan-300 text-cyan-200 font-press-start text-[10px] cursor-pointer"
                >
                  1/6G THRUSTER JUMP [SPACE]
                </button>
                <button
                  type="button"
                  onMouseDown={() => (keysRef.current.right = true)}
                  onMouseUp={() => (keysRef.current.right = false)}
                  onMouseLeave={() => (keysRef.current.right = false)}
                  onTouchStart={() => (keysRef.current.right = true)}
                  onTouchEnd={() => (keysRef.current.right = false)}
                  className="px-3 py-2 bg-slate-900 active:bg-cyan-500 active:text-slate-950 border-2 border-cyan-400 text-cyan-200 font-press-start text-[10px] cursor-pointer"
                >
                  RIGHT [D] &gt;
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={totalSamplesCollected < 6 || !nearBeacon}
                  onClick={handleDeploySeismometer}
                  className={`px-4 py-2 border-2 font-press-start text-[10px] uppercase shadow-[4px_4px_0px_#000] flex items-center gap-1.5 ${
                    totalSamplesCollected >= 6 && nearBeacon
                      ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 cursor-pointer animate-pulse"
                      : "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>
                    [E] DEPLOY SEISMOMETER ({totalSamplesCollected}/6 SAMPLES)
                  </span>
                </button>
              </div>
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
                  <span>PHASE F // LUNAR MISSION CLOSEOUT &amp; ARCHIVAL REPORT</span>
                </div>

                <h1 className="font-press-start text-base sm:text-xl text-emerald-300 tracking-wide">
                  - CONGRATULATIONS - MISSION SUCCESSFUL
                </h1>

                <p className="font-vt323 text-xl text-slate-200 leading-snug">
                  Commander {playerName}, the Fission Surface Power &amp; Lunar Seismometer
                  array is 100% online at the South Pole! Telemetry and polar core samples have
                  been archived for future Artemis habitats.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-silkscreen text-xs">
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">SAMPLES</span>
                    <strong className="text-cyan-300">3 H2O / 3 HE-3</strong>
                  </div>
                  <div className="p-2 bg-slate-900 border border-cyan-400/50">
                    <span className="text-slate-400 block text-[10px]">GRAVITY</span>
                    <strong className="text-white">0.165g (1/6G)</strong>
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
