"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  Play,
  Pause,
  RotateCcw,
  Rocket,
  CheckCircle2,
} from "lucide-react";

export interface MarsMissionProps {
  playerName: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onAbort: () => void;
  /** Optional callback hook for plugging in the playable Mars surface mini-game after Stage 7 */
  onStartMarsGame?: () => void;
}

export type MarsStageId =
  | "STAGE_1"
  | "STAGE_2"
  | "STAGE_3"
  | "STAGE_4"
  | "STAGE_5"
  | "STAGE_6"
  | "STAGE_7";

export type MarsMissionPhase =
  | "BRIEFING_INTRO"
  | "PHASE_A_SOLUTIONS"
  | "PHASE_BC_ROVER"
  | MarsStageId
  | "SAMPLING_SITE_MAP"
  | "SAMPLING_SITE_VIEW"
  | "PHASE_F_VICTORY"
  | "STAGE_GAME_READY";

export type MarsSamplingSiteId = "rochette" | "wildcat" | "cheyava";

export type MarsDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

export interface MarsGridCell {
  col: number;
  row: number;
}

export type RoverExecutionStatus =
  | "PLANNING"
  | "DRIVING"
  | "DRILLING"
  | "COMPLETED";

export interface MarsSamplingSiteConfig {
  id: MarsSamplingSiteId;
  areaNumber: number;
  label: string;
  code: string;
  geologyType: string;
  scientificSummary: string;
  sampleName: string;
  gridImage: string;
  startCell: MarsGridCell;
  targetCell: MarsGridCell;
  circleLeft: string;
  circleTop: string;
  circleWidth: string;
  circleHeight: string;
  labelLeft: string;
  labelTop: string;
}

export const MARS_SAMPLING_SITES: MarsSamplingSiteConfig[] = [
  {
    id: "rochette",
    areaNumber: 1,
    label: "Crater Floor – Rochette",
    code: "SITE 01 // ROCHETTE",
    geologyType: "ANCIENT BASALTIC LAVA & SALT MINERALS",
    scientificSummary:
      "Basaltic crater floor outcrop bearing water-deposited salt minerals that preserve ancient Martian groundwater history.",
    sampleName: "Montdenier / Montagnac Basalt Core",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.29.11 (2).jpg",
    startCell: { col: 5, row: 3 },
    targetCell: { col: 0, row: 0 },
    circleLeft: "19.6%",
    circleTop: "41.2%",
    circleWidth: "11.8%",
    circleHeight: "10.8%",
    labelLeft: "20.6%",
    labelTop: "29.0%",
  },
  {
    id: "wildcat",
    areaNumber: 2,
    label: "Delta Front – Wildcat Ridge",
    code: "SITE 02 // WILDCAT RIDGE",
    geologyType: "FINE-GRAINED SEDIMENTARY MUDSTONE",
    scientificSummary:
      "Ancient lakebed mudstone rich in organic-bearing sulfate and clay minerals formed as a prehistoric Martian river delta settled.",
    sampleName: "Hazeltop / Bearwallow Organic Mudstone Core",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.29.11 (1).jpg",
    startCell: { col: 7, row: 0 },
    targetCell: { col: 1, row: 3 },
    circleLeft: "85.8%",
    circleTop: "42.8%",
    circleWidth: "11.6%",
    circleHeight: "10.8%",
    labelLeft: "84.5%",
    labelTop: "30.8%",
  },
  {
    id: "cheyava",
    areaNumber: 3,
    label: "Neretva Vallis – Cheyava Falls",
    code: "SITE 03 // CHEYAVA FALLS",
    geologyType: "RIVER CHANNEL VEINS & LEOPARD SPOTS",
    scientificSummary:
      "Ancient river valley rock featuring calcium sulfate veins and millimeter-scale 'leopard spots' linked to potential microbial chemistry.",
    sampleName: "Sapphire Canyon Biosignature Core",
    gridImage: "/images/WhatsApp Image 2026-11-15 at 15.29.11.jpg",
    startCell: { col: 0, row: 3 },
    targetCell: { col: 6, row: 1 },
    circleLeft: "64.0%",
    circleTop: "85.5%",
    circleWidth: "11.6%",
    circleHeight: "10.8%",
    labelLeft: "64.8%",
    labelTop: "72.0%",
  },
];

export type MarsRoverSolutionId = "perseverance" | "curiosity";

export interface MarsRoverSolution {
  id: MarsRoverSolutionId;
  slideNumber: number;
  title: string;
  shortName: string;
  cardName: string;
  specSummary: string;
  subtitle: string;
  pros: string[];
  cons: string[];
}

export const MARS_ROVER_SOLUTIONS: MarsRoverSolution[] = [
  {
    id: "perseverance",
    slideNumber: 1,
    title: "SOLUTION 1: LOAD PERSEVERANCE",
    shortName: "PERSEVERANCE",
    cardName: "Perseverance Rover",
    specSummary: "SAMPLE-CACHING TURRET • SUPERCAM MAST • REINFORCED WHEELS",
    subtitle: "MARS 2020 SAMPLE CACHING ROVER // AUTONOMOUS CORING",
    pros: [
      "Seals rock cores",
      "Faster autonomous driving",
      "Reinforced durable wheels",
    ],
    cons: [
      "No onboard lab",
      "Drill pebble jam risk",
      "Requires return mission",
    ],
  },
  {
    id: "curiosity",
    slideNumber: 2,
    title: "SOLUTION 2: LOAD CURIOSITY",
    shortName: "CURIOSITY",
    cardName: "Curiosity Rover",
    specSummary: "SAM ONBOARD LAB • CHEMCAM LASER MAST • MMRTG BATTERY",
    subtitle: "MARS SCIENCE LABORATORY // IN-SITU CHEMICAL ANALYSIS",
    pros: [
      "Onboard chemistry lab",
      "Proven nuclear battery",
      "Long-range rock laser",
    ],
    cons: [
      "Cannot seal tubes",
      "Slower terrain navigation",
      "Fragile thin wheels",
    ],
  },
];

function MarsRoverPixelSprite({
  roverId,
  className = "w-20 h-16",
}: {
  roverId: MarsRoverSolutionId;
  className?: string;
}) {
  if (roverId === "perseverance") {
    return (
      <svg
        viewBox="0 0 36 28"
        className={className}
        style={{ imageRendering: "pixelated" }}
        shapeRendering="crispEdges"
      >
        {/* Angled Rear MMRTG Power Source with Cooling Fins */}
        <rect x="2" y="9" width="6" height="4" fill="#cbd5e1" />
        <rect x="3" y="8" width="4" height="2" fill="#f8fafc" />
        <rect x="1" y="10" width="2" height="2" fill="#f97316" />
        {/* UHF Antenna */}
        <rect x="8" y="6" width="2" height="6" fill="#64748b" />
        <rect x="7" y="5" width="4" height="2" fill="#38bdf8" />
        {/* Warm Electronics Box Chassis (White + Gold Thermal Foil) */}
        <rect x="7" y="12" width="17" height="6" fill="#f8fafc" />
        <rect x="8" y="13" width="15" height="4" fill="#e2e8f0" />
        <rect x="10" y="14" width="6" height="2" fill="#f59e0b" />
        <rect x="18" y="14" width="4" height="2" fill="#38bdf8" />
        {/* SuperCam Mast & Cyclops Laser Eye */}
        <rect x="20" y="4" width="3" height="8" fill="#cbd5e1" />
        <rect x="18" y="2" width="7" height="4" fill="#f8fafc" />
        <rect x="21" y="3" width="3" height="2" fill="#ef4444" />
        <rect x="19" y="3" width="1" height="2" fill="#0f172a" />
        {/* Articulated Sample-Caching Robotic Arm & Coring Turret */}
        <rect x="24" y="13" width="6" height="2" fill="#94a3b8" />
        <rect x="28" y="9" width="2" height="6" fill="#cbd5e1" />
        <rect x="30" y="8" width="4" height="5" fill="#f59e0b" />
        <rect x="34" y="10" width="2" height="2" fill="#22d3ee" />
        {/* Rocker-Bogie Suspension Struts */}
        <rect x="6" y="18" width="20" height="2" fill="#475569" />
        <rect x="7" y="19" width="2" height="3" fill="#64748b" />
        <rect x="15" y="19" width="2" height="3" fill="#64748b" />
        <rect x="23" y="19" width="2" height="3" fill="#64748b" />
        {/* 6 Reinforced Thick Titanium Cleated Wheels */}
        <rect x="5" y="21" width="6" height="5" fill="#1e293b" />
        <rect x="6" y="22" width="4" height="3" fill="#eab308" />
        <rect x="13" y="21" width="6" height="5" fill="#1e293b" />
        <rect x="14" y="22" width="4" height="3" fill="#eab308" />
        <rect x="21" y="21" width="6" height="5" fill="#1e293b" />
        <rect x="22" y="22" width="4" height="3" fill="#eab308" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 36 28"
      className={className}
      style={{ imageRendering: "pixelated" }}
      shapeRendering="crispEdges"
    >
      {/* Rear MMRTG Nuclear Battery */}
      <rect x="2" y="10" width="6" height="4" fill="#94a3b8" />
      <rect x="1" y="11" width="2" height="2" fill="#22c55e" />
      {/* SAM Onboard Chemistry Lab Intake Stacks */}
      <rect x="10" y="8" width="3" height="4" fill="#f59e0b" />
      <rect x="14" y="9" width="3" height="3" fill="#eab308" />
      {/* Curiosity Lab Chassis */}
      <rect x="7" y="12" width="17" height="6" fill="#e2e8f0" />
      <rect x="8" y="13" width="15" height="4" fill="#cbd5e1" />
      <rect x="9" y="14" width="8" height="2" fill="#10b981" />
      <rect x="19" y="14" width="4" height="2" fill="#f59e0b" />
      {/* ChemCam Long-Range Laser Mast */}
      <rect x="20" y="4" width="2" height="8" fill="#94a3b8" />
      <rect x="18" y="2" width="6" height="4" fill="#cbd5e1" />
      <rect x="21" y="3" width="2" height="2" fill="#38bdf8" />
      <rect x="24" y="3" width="6" height="1" fill="#f43f5e" />
      {/* Front Drill Arm */}
      <rect x="24" y="14" width="6" height="2" fill="#64748b" />
      <rect x="29" y="12" width="4" height="4" fill="#94a3b8" />
      <rect x="33" y="13" width="2" height="2" fill="#38bdf8" />
      {/* Rocker-Bogie Suspension */}
      <rect x="6" y="18" width="20" height="2" fill="#334155" />
      <rect x="7" y="19" width="2" height="3" fill="#475569" />
      <rect x="15" y="19" width="2" height="3" fill="#475569" />
      <rect x="23" y="19" width="2" height="3" fill="#475569" />
      {/* 6 Thin Aluminum Wheels */}
      <rect x="5" y="21" width="6" height="5" fill="#0f172a" />
      <rect x="6" y="22" width="4" height="3" fill="#94a3b8" />
      <rect x="13" y="21" width="6" height="5" fill="#0f172a" />
      <rect x="14" y="22" width="4" height="3" fill="#94a3b8" />
      <rect x="21" y="21" width="6" height="5" fill="#0f172a" />
      <rect x="22" y="22" width="4" height="3" fill="#94a3b8" />
    </svg>
  );
}

export interface MarsStageConfig {
  id: MarsStageId;
  stageNumber: number;
  title: string;
  shortLabel: string;
  image: string;
  description: string;
  telemetry: {
    altitude: string;
    velocity: string;
    status: string;
  };
  /** Hook placeholder for future playable mini-game insertion after this loading stage */
  nextMiniGameHook?: string;
}

export const MARS_STAGES: MarsStageConfig[] = [
  {
    id: "STAGE_1",
    stageNumber: 1,
    title: "Stage 1: Ignition & Liftoff",
    shortLabel: "S1: LIFTOFF",
    image: "/images/WhatsApp Image 2026-11-15 at 11.15.26_3.jpeg",
    description:
      "The massive core stage and twin solid rocket boosters ignite, generating a staggering 8.8 million lbs of thrust for deep space exploration.",
    telemetry: {
      altitude: "0.3 KM (SLC-41)",
      velocity: "0.14 KM/S",
      status: "THRUST: 8.8M LBS",
    },
    nextMiniGameHook: "minigame_mars_stage1_launch",
  },
  {
    id: "STAGE_2",
    stageNumber: 2,
    title: "Stage 2: Ascent & Max Q",
    shortLabel: "S2: MAX Q",
    image: "/images/WhatsApp Image 2026-11-15 at 11.15.46_3.jpeg",
    description:
      "Engines briefly throttle down to safely pass through Maximum Dynamic Pressure, enduring extreme aerodynamic stress.",
    telemetry: {
      altitude: "14.0 KM (MAX Q)",
      velocity: "0.62 KM/S",
      status: "THROTTLE: BUCKET PASS",
    },
    nextMiniGameHook: "minigame_mars_stage2_maxq",
  },
  {
    id: "STAGE_3",
    stageNumber: 3,
    title: "Stage 3: Booster Separation",
    shortLabel: "S3: SRB SEP",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.00_3.jpeg",
    description:
      "The twin Solid Rocket Boosters burn out and detach, allowing the main core stage to push the payload further into the void.",
    telemetry: {
      altitude: "46.5 KM (STRATOSPHERE)",
      velocity: "1.85 KM/S",
      status: "TWIN SRB: JETTISONED",
    },
    nextMiniGameHook: "minigame_mars_stage3_srb_sep",
  },
  {
    id: "STAGE_4",
    stageNumber: 4,
    title: "Stage 4: Trans-Mars Injection (TMI)",
    shortLabel: "S4: TMI BURN",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.14_3.jpeg",
    description:
      "Interplanetary trajectory locked. The vehicle surpasses the 11.2 km/s escape velocity, beginning its months-long journey to the Red Planet.",
    telemetry: {
      altitude: "380 KM -> HELIOCENTRIC",
      velocity: "11.2+ KM/S (ESCAPE)",
      status: "TMI TRAJECTORY: LOCKED",
    },
    nextMiniGameHook: "minigame_mars_stage4_tmi",
  },
  {
    id: "STAGE_5",
    stageNumber: 5,
    title: "Stage 5: Atmospheric Entry (EDL)",
    shortLabel: "S5: EDL ENTRY",
    image: "/images/WhatsApp Image 2026-11-15 at 11.16.30_3.jpeg",
    description:
      "Plunging into the thin Martian atmosphere at 20,000 km/h. The heat shield glows red-hot, enduring temperatures up to 2,100°C.",
    telemetry: {
      altitude: "125 KM -> 11 KM (EDL)",
      velocity: "20,000 KM/H (5.5 KM/S)",
      status: "SHIELD TEMP: 2,100°C",
    },
    nextMiniGameHook: "minigame_mars_stage5_edl",
  },
  {
    id: "STAGE_6",
    stageNumber: 6,
    title: "Stage 6: Touchdown Confirmed",
    shortLabel: "S6: SKY CRANE",
    image: "/images/WhatsApp Image 2026-11-15 at 11.17.35.jpeg",
    description:
      "Mission Success! You have successfully landed on Mars. The sky crane has safely lowered your rover into the 0.38g gravity environment.",
    telemetry: {
      altitude: "0.0 M (JEZERO CRATER)",
      velocity: "0.00 KM/S (LANDED)",
      status: "GRAVITY: 0.38 G",
    },
    nextMiniGameHook: "minigame_mars_stage6_rover_ops",
  },
  {
    id: "STAGE_7",
    stageNumber: 7,
    title: "Stage 7: YOU HAVE SUCCESSFULLY LANDED ON MARS",
    shortLabel: "S7: ARRIVAL",
    image: "/images/WhatsApp Image 2026-11-15 at 11.17.51 (1).jpeg",
    description: "YOU HAVE SUCCESSFULLY LANDED ON MARS",
    telemetry: {
      altitude: "0.0 M (JEZERO DELTA)",
      velocity: "0.00 KM/S",
      status: "MARS ARRIVAL COMPLETE",
    },
    nextMiniGameHook: "STAGE_GAME_READY",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PROCEDURAL 8-BIT CHIPTUNE SYNTHESIZER (WEB AUDIO API - ZERO EXTERNAL FILES)
// ─────────────────────────────────────────────────────────────────────────────
class MarsChiptuneEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playBlip(freq = 620) {
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

  playClick(freq = 700) {
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

  playStageTransition() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [392, 493.88, 587.33];
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

const sfx = new MarsChiptuneEngine();

export default function MarsMission({
  playerName,
  soundOn,
  onToggleSound,
  onAbort,
}: MarsMissionProps) {
  const [phase, setPhase] = useState<MarsMissionPhase>("BRIEFING_INTRO");
  const [briefingPage, setBriefingPage] = useState<number>(0);
  const [solutionSlideIndex, setSolutionSlideIndex] = useState<number>(0);
  const [selectedRoverSolution, setSelectedRoverSolution] =
    useState<MarsRoverSolutionId>("perseverance");
  const [loadedFairingRover, setLoadedFairingRover] =
    useState<MarsRoverSolutionId | null>(null);
  const [hoverRoverSlot, setHoverRoverSlot] = useState<boolean>(false);
  const [roverFairingError, setRoverFairingError] = useState<string | null>(
    null
  );
  const [activeSamplingSite, setActiveSamplingSite] =
    useState<MarsSamplingSiteId | null>(null);
  const [hoveredSamplingSite, setHoveredSamplingSite] =
    useState<MarsSamplingSiteId | null>(null);
  const [plannedMoves, setPlannedMoves] = useState<MarsDirection[]>([]);
  const [roverExecStatus, setRoverExecStatus] =
    useState<RoverExecutionStatus>("PLANNING");
  const [roverStepIndex, setRoverStepIndex] = useState<number>(0);
  const [sampledSites, setSampledSites] = useState<MarsSamplingSiteId[]>([]);
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);

  const lastBlipRef = useRef<number>(0);
  const swipeStartXRef = useRef<number | null>(null);

  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  const introBriefingPages = [
    `Welcome back, ${playerName}! Orbital satellites have detected mysterious mineral formations and ancient riverbeds in Mars’s Jezero Crater. There are strong clues that microscopic life may have once existed there.`,
    `However, cameras from orbit cannot analyze the rocks' internal chemistry. So, you must load the rover you choose onto the rocket and launch it to Mars, and remotely pilot it from Earth to drill samples.`,
    `Remember that communication with Mars has up to a 20-minute delay and real-time control is not an option, so you must queue all your moves first.`,
  ];

  const activeSolutionSlide =
    MARS_ROVER_SOLUTIONS[solutionSlideIndex] || MARS_ROVER_SOLUTIONS[0];
  const chosenRoverDef =
    MARS_ROVER_SOLUTIONS.find((s) => s.id === selectedRoverSolution) ||
    MARS_ROVER_SOLUTIONS[0];
  const loadedRoverDef = loadedFairingRover
    ? MARS_ROVER_SOLUTIONS.find((s) => s.id === loadedFairingRover) || null
    : null;
  const isLoadedRoverMismatched =
    loadedFairingRover !== null && loadedFairingRover !== selectedRoverSolution;
  const isRoverFairingReadyToLaunch =
    loadedFairingRover !== null && loadedFairingRover === selectedRoverSolution;

  const activeSamplingSiteDef =
    MARS_SAMPLING_SITES.find((s) => s.id === activeSamplingSite) ||
    MARS_SAMPLING_SITES[0];

  // Compute simulated 8x4 grid path cells from startCell + plannedMoves
  const plannedPathCells: MarsGridCell[] = React.useMemo(() => {
    const cells: MarsGridCell[] = [activeSamplingSiteDef.startCell];
    for (const dir of plannedMoves) {
      const prev = cells[cells.length - 1];
      let nextCol = prev.col;
      let nextRow = prev.row;
      if (dir === "UP") nextRow -= 1;
      else if (dir === "DOWN") nextRow += 1;
      else if (dir === "LEFT") nextCol -= 1;
      else if (dir === "RIGHT") nextCol += 1;
      nextCol = Math.max(0, Math.min(7, nextCol));
      nextRow = Math.max(0, Math.min(3, nextRow));
      cells.push({ col: nextCol, row: nextRow });
    }
    return cells;
  }, [activeSamplingSiteDef.startCell, plannedMoves]);

  const simTipCell =
    plannedPathCells[plannedPathCells.length - 1] ||
    activeSamplingSiteDef.startCell;

  const isTargetReachedInSim =
    simTipCell.col === activeSamplingSiteDef.targetCell.col &&
    simTipCell.row === activeSamplingSiteDef.targetCell.row;

  const currentRoverCell =
    roverExecStatus === "PLANNING"
      ? activeSamplingSiteDef.startCell
      : plannedPathCells[
          Math.min(roverStepIndex, plannedPathCells.length - 1)
        ] || activeSamplingSiteDef.startCell;

  const currentRoverHeading: MarsDirection =
    roverExecStatus === "PLANNING"
      ? plannedMoves[0] || "RIGHT"
      : plannedMoves[Math.max(0, roverStepIndex - 1)] || "RIGHT";

  const currentStage = MARS_STAGES.find((s) => s.id === phase) || null;
  const activeText =
    phase === "BRIEFING_INTRO"
      ? introBriefingPages[briefingPage] || introBriefingPages[0]
      : currentStage?.description || "";

  const isTypewriterDone = typewriterIndex >= activeText.length;

  // Helper to cleanly transition between phases and reset stage progress
  const transitionToPhase = useCallback((nextPhase: MarsMissionPhase) => {
    setPhase(nextPhase);
    setBriefingPage(0);
    setTypewriterIndex(0);
    setLoadProgress(0);
    if (nextPhase === "STAGE_7" || nextPhase === "PHASE_F_VICTORY") {
      sfx.playVictoryFanfare();
    } else if (nextPhase !== "BRIEFING_INTRO") {
      sfx.playStageTransition();
    }
  }, []);

  const handleToggleSolutionSlide = useCallback((direction: -1 | 1) => {
    sfx.playClick(660);
    setSolutionSlideIndex(
      (prev) =>
        (prev + direction + MARS_ROVER_SOLUTIONS.length) %
        MARS_ROVER_SOLUTIONS.length
    );
  }, []);

  const handleSelectSolution = useCallback(() => {
    const chosen =
      MARS_ROVER_SOLUTIONS[solutionSlideIndex] || MARS_ROVER_SOLUTIONS[0];
    setSelectedRoverSolution(chosen.id);
    setLoadedFairingRover(null);
    setRoverFairingError(null);
    sfx.playStageTransition();
    transitionToPhase("PHASE_BC_ROVER");
  }, [solutionSlideIndex, transitionToPhase]);

  const handleLoadRoverIntoFairing = useCallback(
    (roverId: MarsRoverSolutionId) => {
      setRoverFairingError(null);
      if (loadedFairingRover === roverId) {
        setLoadedFairingRover(null);
        sfx.playClick(480);
        return;
      }
      setLoadedFairingRover(roverId);
      if (roverId === selectedRoverSolution) {
        sfx.playStageTransition();
      } else {
        sfx.playClick(320);
      }
    },
    [loadedFairingRover, selectedRoverSolution]
  );

  const handleRemoveRoverFromFairing = useCallback(() => {
    if (!loadedFairingRover) return;
    setLoadedFairingRover(null);
    setRoverFairingError(null);
    sfx.playClick(480);
  }, [loadedFairingRover]);

  const handleLaunchFromRoverFairing = useCallback(() => {
    if (!loadedFairingRover) {
      sfx.playClick(300);
      setRoverFairingError("LOAD A ROVER INTO THE CENTRAL PAYLOAD BAY FIRST!");
      return;
    }
    if (loadedFairingRover !== selectedRoverSolution) {
      sfx.playClick(280);
      setRoverFairingError(
        "MISMATCHED ROVER — LOAD THE ROVER SELECTED IN PHASE A"
      );
      return;
    }
    setRoverFairingError(null);
    sfx.playStageTransition();
    transitionToPhase("STAGE_1");
  }, [loadedFairingRover, selectedRoverSolution, transitionToPhase]);

  const handleSelectSamplingSite = useCallback(
    (siteId: MarsSamplingSiteId) => {
      setActiveSamplingSite(siteId);
      setPlannedMoves([]);
      setRoverExecStatus("PLANNING");
      setRoverStepIndex(0);
      sfx.playStageTransition();
      transitionToPhase("SAMPLING_SITE_VIEW");
    },
    [transitionToPhase]
  );

  const handleQueueMove = useCallback(
    (dir: MarsDirection) => {
      if (roverExecStatus !== "PLANNING") return;
      if (plannedMoves.length >= 24) {
        sfx.playClick(280);
        return;
      }
      let nextCol = simTipCell.col;
      let nextRow = simTipCell.row;
      if (dir === "UP") nextRow -= 1;
      else if (dir === "DOWN") nextRow += 1;
      else if (dir === "LEFT") nextCol -= 1;
      else if (dir === "RIGHT") nextCol += 1;

      if (nextCol < 0 || nextCol > 7 || nextRow < 0 || nextRow > 3) {
        sfx.playClick(260);
        return;
      }

      // If stepping directly back onto the previous cell, pop the last move (clean undo)
      if (plannedPathCells.length >= 2) {
        const prevCell = plannedPathCells[plannedPathCells.length - 2];
        if (prevCell.col === nextCol && prevCell.row === nextRow) {
          setPlannedMoves((prev) => prev.slice(0, -1));
          sfx.playClick(520);
          return;
        }
      }

      setPlannedMoves((prev) => [...prev, dir]);
      if (
        nextCol === activeSamplingSiteDef.targetCell.col &&
        nextRow === activeSamplingSiteDef.targetCell.row
      ) {
        sfx.playStageTransition();
      } else {
        sfx.playBlip(640 + plannedMoves.length * 25);
      }
    },
    [
      roverExecStatus,
      plannedMoves.length,
      simTipCell,
      plannedPathCells,
      activeSamplingSiteDef.targetCell,
    ]
  );

  const handleUndoMove = useCallback(() => {
    if (roverExecStatus !== "PLANNING" || plannedMoves.length === 0) return;
    setPlannedMoves((prev) => prev.slice(0, -1));
    sfx.playClick(500);
  }, [roverExecStatus, plannedMoves.length]);

  const handleClearMoves = useCallback(() => {
    if (roverExecStatus !== "PLANNING") return;
    setPlannedMoves([]);
    setRoverStepIndex(0);
    sfx.playClick(440);
  }, [roverExecStatus]);

  const handleExecuteRoverPath = useCallback(() => {
    if (roverExecStatus !== "PLANNING" || !isTargetReachedInSim) {
      sfx.playClick(300);
      return;
    }
    sfx.playStageTransition();
    setRoverStepIndex(0);
    setRoverExecStatus("DRIVING");
  }, [roverExecStatus, isTargetReachedInSim]);

  // Step-by-step animated Rover drive along plannedPathCells -> DRILLING -> COMPLETED
  useEffect(() => {
    if (phase !== "SAMPLING_SITE_VIEW") return;

    if (roverExecStatus === "DRIVING") {
      const totalSteps = plannedPathCells.length - 1;
      const timer = setTimeout(() => {
        if (roverStepIndex < totalSteps) {
          sfx.playClick(460 + (roverStepIndex % 4) * 55);
          setRoverStepIndex((prev) => prev + 1);
        } else {
          sfx.playStageTransition();
          setRoverExecStatus("DRILLING");
        }
      }, 360);
      return () => clearTimeout(timer);
    }

    if (roverExecStatus === "DRILLING") {
      const drillTimer = setTimeout(() => {
        sfx.playVictoryFanfare();
        setRoverExecStatus("COMPLETED");
        setSampledSites((prev) =>
          prev.includes(activeSamplingSiteDef.id)
            ? prev
            : [...prev, activeSamplingSiteDef.id]
        );
      }, 1500);
      return () => clearTimeout(drillTimer);
    }
  }, [
    phase,
    roverExecStatus,
    roverStepIndex,
    plannedPathCells.length,
    activeSamplingSiteDef.id,
  ]);

  // Typewriter effect with 8-bit voice blips
  useEffect(() => {
    if (typewriterIndex >= activeText.length) return;
    const timer = setTimeout(() => {
      setTypewriterIndex((prev) => prev + 1);
      const now = performance.now();
      if (now - lastBlipRef.current > 55) {
        sfx.playBlip(540 + ((typewriterIndex * 19) % 180));
        lastBlipRef.current = now;
      }
    }, 22);
    return () => clearTimeout(timer);
  }, [typewriterIndex, activeText]);

  // Advance to the next sequential stage
  const handleNextStage = useCallback(() => {
    sfx.playClick(740);
    if (phase === "BRIEFING_INTRO") {
      if (briefingPage < introBriefingPages.length - 1) {
        setBriefingPage((prev) => prev + 1);
        setTypewriterIndex(0);
      } else {
        transitionToPhase("PHASE_A_SOLUTIONS");
      }
      return;
    }
    if (phase === "PHASE_A_SOLUTIONS") {
      handleSelectSolution();
      return;
    }
    if (phase === "PHASE_BC_ROVER") {
      handleLaunchFromRoverFairing();
      return;
    }
    if (phase === "STAGE_7") {
      transitionToPhase("SAMPLING_SITE_MAP");
      return;
    }
    const idx = MARS_STAGES.findIndex((s) => s.id === phase);
    if (idx >= 0 && idx < MARS_STAGES.length - 1) {
      transitionToPhase(MARS_STAGES[idx + 1].id);
    }
  }, [
    phase,
    briefingPage,
    introBriefingPages.length,
    transitionToPhase,
    handleSelectSolution,
    handleLaunchFromRoverFairing,
  ]);

  // Go back to previous stage
  const handlePrevStage = useCallback(() => {
    sfx.playClick(580);
    if (phase === "PHASE_F_VICTORY") {
      transitionToPhase("SAMPLING_SITE_MAP");
      return;
    }
    if (phase === "SAMPLING_SITE_VIEW") {
      transitionToPhase("SAMPLING_SITE_MAP");
      return;
    }
    if (phase === "SAMPLING_SITE_MAP") {
      transitionToPhase("STAGE_7");
      return;
    }
    if (phase === "PHASE_BC_ROVER") {
      transitionToPhase("PHASE_A_SOLUTIONS");
      return;
    }
    const idx = MARS_STAGES.findIndex((s) => s.id === phase);
    if (idx === 0) {
      transitionToPhase("PHASE_BC_ROVER");
    } else if (idx > 0) {
      transitionToPhase(MARS_STAGES[idx - 1].id);
    }
  }, [phase, transitionToPhase]);

  // Animated 0% -> 100% loading bar for Stages 1 through 6
  useEffect(() => {
    if (
      phase === "BRIEFING_INTRO" ||
      phase === "PHASE_A_SOLUTIONS" ||
      phase === "PHASE_BC_ROVER" ||
      phase === "STAGE_7" ||
      phase === "SAMPLING_SITE_MAP" ||
      phase === "SAMPLING_SITE_VIEW" ||
      phase === "PHASE_F_VICTORY" ||
      phase === "STAGE_GAME_READY"
    )
      return;

    const interval = setInterval(() => {
      setLoadProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 2);
      });
    }, 110);

    return () => clearInterval(interval);
  }, [phase]);

  // Auto-advance once loading reaches 100% and typewriter is finished (if autoAdvance is ON)
  useEffect(() => {
    if (phase === "STAGE_7" && autoAdvance) {
      const timeout = setTimeout(() => {
        transitionToPhase("SAMPLING_SITE_MAP");
      }, 2800);
      return () => clearTimeout(timeout);
    }

    if (
      phase === "BRIEFING_INTRO" ||
      phase === "PHASE_A_SOLUTIONS" ||
      phase === "PHASE_BC_ROVER" ||
      phase === "STAGE_7" ||
      phase === "SAMPLING_SITE_MAP" ||
      phase === "SAMPLING_SITE_VIEW" ||
      phase === "PHASE_F_VICTORY" ||
      phase === "STAGE_GAME_READY" ||
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
  }, [
    phase,
    autoAdvance,
    loadProgress,
    isTypewriterDone,
    handleNextStage,
    transitionToPhase,
  ]);

  // Keyboard navigation (Space / Enter / Right Arrow to advance, Left Arrow to go back, WASD in grid)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase === "PHASE_A_SOLUTIONS") {
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          handleToggleSolutionSlide(-1);
        } else if (e.key === "ArrowRight") {
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

      if (phase === "PHASE_BC_ROVER") {
        if (e.key === "1") {
          handleLoadRoverIntoFairing("perseverance");
        } else if (e.key === "2") {
          handleLoadRoverIntoFairing("curiosity");
        } else if (e.key === "Enter") {
          e.preventDefault();
          handleLaunchFromRoverFairing();
        } else if (e.key === "ArrowLeft") {
          handlePrevStage();
        } else if (e.key === "Escape") {
          onAbort();
        }
        return;
      }

      if (phase === "SAMPLING_SITE_MAP") {
        if (e.key === "1") {
          handleSelectSamplingSite("rochette");
        } else if (e.key === "2") {
          handleSelectSamplingSite("wildcat");
        } else if (e.key === "3") {
          handleSelectSamplingSite("cheyava");
        } else if (e.key === "ArrowLeft") {
          handlePrevStage();
        } else if (e.key === "Escape") {
          onAbort();
        }
        return;
      }

      if (phase === "SAMPLING_SITE_VIEW") {
        const keyLower = e.key.toLowerCase();
        if (keyLower === "w" || e.key === "ArrowUp") {
          e.preventDefault();
          handleQueueMove("UP");
        } else if (keyLower === "s" || e.key === "ArrowDown") {
          e.preventDefault();
          handleQueueMove("DOWN");
        } else if (keyLower === "a" || e.key === "ArrowLeft") {
          e.preventDefault();
          handleQueueMove("LEFT");
        } else if (keyLower === "d" || e.key === "ArrowRight") {
          e.preventDefault();
          handleQueueMove("RIGHT");
        } else if (e.key === "Backspace") {
          e.preventDefault();
          handleUndoMove();
        } else if (keyLower === "c") {
          e.preventDefault();
          handleClearMoves();
        } else if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (roverExecStatus === "PLANNING" && isTargetReachedInSim) {
            handleExecuteRoverPath();
          } else if (roverExecStatus === "COMPLETED") {
            transitionToPhase("SAMPLING_SITE_MAP");
          }
        } else if (e.key === "Escape") {
          transitionToPhase("SAMPLING_SITE_MAP");
        }
        return;
      }

      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isTypewriterDone) {
          setTypewriterIndex(activeText.length);
        } else if (phase !== "STAGE_GAME_READY") {
          handleNextStage();
        }
      } else if (e.key === "ArrowLeft") {
        if (phase !== "BRIEFING_INTRO") {
          handlePrevStage();
        }
      } else if (e.key === "Escape") {
        onAbort();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isTypewriterDone,
    activeText.length,
    phase,
    roverExecStatus,
    isTargetReachedInSim,
    handleNextStage,
    handlePrevStage,
    handleToggleSolutionSlide,
    handleSelectSolution,
    handleLoadRoverIntoFairing,
    handleLaunchFromRoverFairing,
    handleSelectSamplingSite,
    handleQueueMove,
    handleUndoMove,
    handleClearMoves,
    handleExecuteRoverPath,
    transitionToPhase,
    onAbort,
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 text-stone-100 select-none flex flex-col font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. CRYSTAL-CLEAR FULL-SCREEN NASA PHOTOGRAPH BACKDROP         */}
      {/*    (Zero blur, zero dark vignette, 100% full brightness)      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        {/* Base Mars backdrop during Briefing Intro */}
        <div
          className={`absolute inset-0 transition-opacity duration-500 ${
            phase === "BRIEFING_INTRO" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/dest-mars.jpg"
            alt="NASA Mars Backdrop"
            className="w-full h-full object-cover object-center"
            style={{ imageRendering: "auto" }}
          />
        </div>

        {/* Pre-rendered 7-Stage NASA Photographs at 100% natural clarity & brightness */}
        {MARS_STAGES.map((stage) => {
          const isActive = phase === stage.id;
          return (
            <div
              key={stage.id}
              className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
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
      {/* 2. TOP MARS TELEMETRY & STAGE STEPPER HEADER                  */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full bg-stone-950/80 border-b-2 border-orange-400/70 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 backdrop-blur-sm">
        {/* Left: Abort & Mission Title */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              sfx.playClick(520);
              onAbort();
            }}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border-2 border-orange-400 text-amber-100 hover:text-white font-press-start text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>ABORT</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-stone-900/90 border-2 border-orange-400/60 shadow-[3px_3px_0px_#000]">
            <Rocket className="w-3.5 h-3.5 text-amber-300" />
            <span className="font-press-start text-[10px] text-amber-100 tracking-wider">
              MARS MISSION
            </span>
          </div>
        </div>

        {/* Center: 7-Stage Progress Stepper */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-black/80 px-2.5 py-1.5 border-2 border-orange-900/80 shadow-[3px_3px_0px_#000]">
          <button
            type="button"
            onClick={() => {
              sfx.playClick(600);
              transitionToPhase("BRIEFING_INTRO");
            }}
            className={`px-2 py-1 text-[9px] font-press-start transition-all cursor-pointer ${
              phase === "BRIEFING_INTRO"
                ? "bg-orange-500 text-white font-bold shadow-[0_0_8px_#f97316]"
                : "bg-stone-900 text-stone-400 hover:text-white"
            }`}
            title="Commander Briefing"
          >
            BRIEF
          </button>

          {MARS_STAGES.map((st) => {
            const isCurrent = phase === st.id;
            const currentNum =
              phase === "SAMPLING_SITE_MAP" || phase === "SAMPLING_SITE_VIEW"
                ? 8
                : currentStage?.stageNumber || 0;
            const isCompleted = currentNum > st.stageNumber;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  sfx.playClick(680);
                  transitionToPhase(st.id);
                }}
                className={`px-2 py-1 text-[9px] font-press-start transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-amber-300 text-stone-950 font-bold shadow-[0_0_10px_#fcd34d]"
                    : isCompleted
                    ? "bg-orange-950/90 text-amber-300 border border-orange-500/50 hover:bg-orange-900"
                    : "bg-stone-900 text-stone-400 hover:text-stone-200"
                }`}
                title={st.title}
              >
                S{st.stageNumber}
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => {
              sfx.playClick(720);
              transitionToPhase("SAMPLING_SITE_MAP");
            }}
            className={`px-2 py-1 text-[9px] font-press-start transition-all cursor-pointer ${
              phase === "SAMPLING_SITE_MAP" || phase === "SAMPLING_SITE_VIEW"
                ? "bg-cyan-400 text-slate-950 font-bold shadow-[0_0_10px_#22d3ee]"
                : "bg-stone-900 text-stone-400 hover:text-cyan-300"
            }`}
            title="Jezero Crater Sampling Site Map"
          >
            MAP
          </button>
        </div>

        {/* Right: Auto-Advance Toggle & SFX Toggle */}
        <div className="flex items-center gap-2">
          {phase !== "BRIEFING_INTRO" &&
            phase !== "PHASE_A_SOLUTIONS" &&
            phase !== "PHASE_BC_ROVER" &&
            phase !== "STAGE_7" &&
            phase !== "SAMPLING_SITE_MAP" &&
            phase !== "SAMPLING_SITE_VIEW" &&
            phase !== "STAGE_GAME_READY" && (
            <button
              type="button"
              onClick={() => {
                sfx.playClick(640);
                setAutoAdvance((prev) => !prev);
              }}
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1.5 border-2 font-silkscreen text-[10px] font-bold shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn ${
                autoAdvance
                  ? "bg-orange-950/90 border-orange-400 text-amber-200"
                  : "bg-stone-900 border-stone-600 text-stone-300"
              }`}
              title="Toggle Auto-Advance"
            >
              {autoAdvance ? (
                <>
                  <Pause className="w-3 h-3 text-amber-300" />
                  <span>AUTO: ON</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 text-stone-400" />
                  <span>AUTO: PAUSED</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onToggleSound();
            }}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border-2 border-orange-400 text-amber-100 font-press-start text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
            title={soundOn ? "Mute SFX" : "Unmute SFX"}
          >
            {soundOn ? (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">SFX: ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5 text-stone-400" />
                <span className="hidden sm:inline">SFX: OFF</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. MAIN STAGE VIEWPORT                                        */}
      {/* ───────────────────────────────────────────────────────────── */}
      <main className="relative z-20 flex-1 w-full overflow-hidden flex flex-col justify-between p-3 sm:p-6">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE 0: COMMANDER BRIEFING INTRO (15.14.33.jpeg)           */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "BRIEFING_INTRO" && (
          <div className="my-auto mx-auto w-full max-w-4xl flex items-center justify-center">
            <div
              className="relative w-full aspect-[937/530] max-h-[80vh] border-2 border-orange-400 shadow-[8px_8px_0px_#000] overflow-hidden cursor-pointer bg-stone-950"
              onClick={() => {
                if (!isTypewriterDone) {
                  setTypewriterIndex(activeText.length);
                } else {
                  handleNextStage();
                }
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/WhatsApp Image 2026-11-14 at 15.14.33.jpeg"
                alt="Commander Mars Briefing Intro"
                className="w-full h-full object-fill select-none"
              />

              {/* Top Banner Badge */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                <div className="px-3 py-1 bg-stone-950/90 border-2 border-orange-400 shadow-[3px_3px_0px_#000] flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-400 animate-ping" />
                  <span className="font-press-start text-[9px] sm:text-[10px] text-amber-300 tracking-wider">
                    PERSEVERANCE / ARTEMIS MARS FLIGHT BRIEFING
                  </span>
                </div>
                <div className="hidden sm:block px-3 py-1 bg-stone-950/90 border-2 border-orange-400/60 text-[10px] font-silkscreen text-amber-200 shadow-[3px_3px_0px_#000]">
                  7 STAGES // LAUNCH TO JEZERO TOUCHDOWN
                </div>
              </div>

              {/* Typewriter Dialogue Box Strictly Inside the Image's Cyan/Blue Block */}
              <div className="absolute left-[33%] right-[9.5%] top-[69%] bottom-[9%] flex flex-col justify-between overflow-hidden pointer-events-none">
                <div className="overflow-hidden pt-1">
                  <p className="font-pixel-body text-stone-100 text-[11px] sm:text-xs md:text-sm leading-snug drop-shadow-[0_1px_2px_#000]">
                    {activeText.slice(0, typewriterIndex)}
                    {!isTypewriterDone && (
                      <span className="inline-block w-1.5 h-3 bg-orange-400 ml-1 animate-pulse" />
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5 shrink-0">
                  <span className="hidden sm:inline text-[8px] font-silkscreen text-amber-300/90 truncate">
                    {!isTypewriterDone
                      ? "CLICK TO FAST-FORWARD..."
                      : briefingPage < introBriefingPages.length - 1
                        ? `PART ${briefingPage + 1} / ${introBriefingPages.length} — CLICK TO CONTINUE`
                        : "READY FOR ROVER SELECTION"}
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
                    className="pointer-events-auto ml-auto px-2.5 sm:px-3.5 py-1 bg-orange-500 hover:bg-orange-400 border border-white text-white font-press-start text-[8px] sm:text-[10px] uppercase shadow-[2px_2px_0px_#000] animate-pulse cursor-pointer arcade-btn shrink-0"
                  >
                    {!isTypewriterDone
                      ? "[ FAST-FORWARD ]"
                      : briefingPage < introBriefingPages.length - 1
                        ? "[ NEXT > ]"
                        : "[ EVALUATE ROVER SOLUTIONS > ]"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE A2: 2-SLIDE MARS ROVER SOLUTION SELECTOR              */}
        {/* (/images/WhatsApp Image 2026-11-15 at 14.26.35 (1).jpeg)    */}
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
              src="/images/WhatsApp Image 2026-11-15 at 14.26.35 (1).jpeg"
              alt="Mars Rover Architecture Trade Study HUD"
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              style={{ imageRendering: "auto" }}
            />

            {/* Top-Left Back to Briefing Button */}
            <div className="absolute top-3 left-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  sfx.playClick(520);
                  transitionToPhase("BRIEFING_INTRO");
                }}
                className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] sm:text-[10px] shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
              >
                &lt; BRIEFING
              </button>
            </div>

            {/* TOP HEADER AREA (Inside Upper Cyan Frame Above Green/Red Boxes) */}
            <div className="absolute left-[14.5%] right-[12.5%] top-[9.5%] h-[25.5%] flex flex-col items-center justify-center text-center px-3 sm:px-6">
              <div className="inline-flex items-center gap-2 px-3 py-0.5 bg-slate-950/85 border border-cyan-400/80 text-cyan-300 font-silkscreen text-[10px] sm:text-xs mb-1.5 shadow-[2px_2px_0px_#000]">
                <span>MARS SURFACE ROVER SELECTION TRADE STUDY</span>
                <span className="text-amber-300 font-bold">
                  [{activeSolutionSlide.slideNumber} / {MARS_ROVER_SOLUTIONS.length}]
                </span>
              </div>

              <h1 className="font-press-start text-sm sm:text-xl md:text-2xl lg:text-3xl text-white tracking-wider drop-shadow-[0_3px_0px_#000] uppercase">
                {activeSolutionSlide.title}
              </h1>

              <p className="font-silkscreen text-[10px] sm:text-xs text-cyan-200 mt-1.5 tracking-wide drop-shadow-[1px_1px_0px_#000]">
                {activeSolutionSlide.subtitle}
              </p>

              {/* Slide Dots + Direct Switch Buttons */}
              <div className="flex items-center gap-3 mt-2">
                {MARS_ROVER_SOLUTIONS.map((sol, idx) => (
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

            {/* BOTTOM-RIGHT [ SELECT ] BUTTON (Masks Static "select" Text in Corner) */}
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
        {/* PHASE B & C: ROVER FAIRING INTEGRATION SCREEN               */}
        {/* (/images/WhatsApp Image 2026-11-15 at 14.40.47_2.jpeg)      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_BC_ROVER" && (
          <div className="fixed inset-0 z-30 bg-black overflow-hidden select-none">
            {/* Crystal-Clear Full-Screen Rocket Fairing & Cyan HUD Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/WhatsApp Image 2026-11-15 at 14.40.47_2.jpeg"
              alt="Mars Rover Fairing Integration HUD"
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
                <Rocket className="w-3.5 h-3.5 text-cyan-400" />
                <span>PHASE B/C // ROVER PAYLOAD INTEGRATION</span>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* LEFT SIDE: SINGLE CENTRAL ROCKET PAYLOAD SLOT (1 SLOT)    */}
            {/* ───────────────────────────────────────────────────────── */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setHoverRoverSlot(true);
              }}
              onDragLeave={() => setHoverRoverSlot(false)}
              onDrop={(e) => {
                e.preventDefault();
                setHoverRoverSlot(false);
                const droppedRoverId = e.dataTransfer.getData(
                  "text/plain"
                ) as MarsRoverSolutionId;
                if (
                  droppedRoverId === "perseverance" ||
                  droppedRoverId === "curiosity"
                ) {
                  handleLoadRoverIntoFairing(droppedRoverId);
                }
              }}
              onClick={() => {
                if (loadedFairingRover) {
                  handleRemoveRoverFromFairing();
                }
              }}
              title={
                loadedRoverDef
                  ? `${loadedRoverDef.cardName} (Click to remove from payload bay)`
                  : "Central Rocket Payload Bay (Drop or click a rover from the right panel)"
              }
              className={`absolute left-[18.2%] top-[20.0%] w-[15.2%] h-[39.0%] z-20 flex flex-col items-center justify-center p-2.5 text-center transition-all cursor-pointer border-[3px] ${
                loadedRoverDef
                  ? isLoadedRoverMismatched
                    ? "bg-rose-950/90 border-rose-400 shadow-[0_0_24px_rgba(244,63,94,0.9)] animate-pulse"
                    : "bg-cyan-950/90 border-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.9)]"
                  : hoverRoverSlot
                    ? "bg-cyan-400/35 border-white border-dashed shadow-[0_0_22px_rgba(34,211,238,0.95)] scale-105"
                    : "bg-slate-950/60 hover:bg-cyan-950/65 border-cyan-300 border-dashed shadow-[0_0_16px_rgba(34,211,238,0.65)]"
              }`}
            >
              {loadedRoverDef ? (
                <>
                  <MarsRoverPixelSprite
                    roverId={loadedRoverDef.id}
                    className="w-16 h-14 sm:w-24 sm:h-20 md:w-28 md:h-24 shrink-0"
                  />
                  <span
                    className={`font-press-start text-[8px] sm:text-[10px] leading-tight mt-2 px-2 py-1 border ${
                      isLoadedRoverMismatched
                        ? "bg-rose-950 border-rose-300 text-rose-200"
                        : "bg-slate-950/90 border-emerald-300 text-emerald-200"
                    }`}
                  >
                    {loadedRoverDef.cardName}
                  </span>
                  <span className="font-silkscreen text-[8px] sm:text-[9px] text-cyan-200 mt-1.5">
                    [ CLICK TO UNLOAD ]
                  </span>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1.5 px-1">
                  <span className="px-2 py-0.5 bg-slate-950/90 border border-cyan-400/70 font-press-start text-[8px] sm:text-[9px] text-cyan-300">
                    CENTRAL BAY
                  </span>
                  <span className="font-press-start text-[9px] sm:text-[11px] text-white drop-shadow-[1px_1px_0px_#000]">
                    1 ROVER SLOT
                  </span>
                  <span className="font-silkscreen text-[8px] sm:text-[10px] text-cyan-200/90 leading-tight">
                    DROP OR CLICK ROVER TO LOAD
                  </span>
                </div>
              )}
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* RIGHT SIDE: TOP DASHED HEADER BOX INSIDE CYAN HUD PANEL   */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="absolute left-[63.0%] w-[29.6%] top-[14.3%] h-[9.2%] z-20 flex flex-col items-center justify-center text-center px-2">
              <div className="font-press-start text-[9px] sm:text-xs md:text-sm text-white tracking-wider drop-shadow-[2px_2px_0px_#000]">
                ROVER BAY (1 SLOT)
              </div>
              <div className="font-silkscreen text-[8px] sm:text-[10px] text-cyan-300 mt-0.5">
                {`SELECTED: LOAD ${chosenRoverDef.shortName} (${loadedFairingRover ? 1 : 0} / 1)`}
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* RIGHT SIDE: MAIN CYAN HUD BODY — BOTH ROVERS              */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="absolute left-[62.2%] w-[31.2%] top-[24.8%] bottom-[8.5%] z-20 flex flex-col justify-between p-2 sm:p-3.5 overflow-hidden">
              <div className="flex-1 flex flex-col justify-center gap-3 overflow-y-auto pr-0.5">
                {MARS_ROVER_SOLUTIONS.map((rover) => {
                  const isEquipped = loadedFairingRover === rover.id;
                  const isEquippedWrong =
                    isEquipped && rover.id !== selectedRoverSolution;

                  return (
                    <div
                      key={rover.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", rover.id);
                      }}
                      onClick={() => handleLoadRoverIntoFairing(rover.id)}
                      className={`group relative flex flex-col sm:flex-row items-center gap-3 px-3 py-3 sm:px-4 sm:py-4 border-2 transition-all cursor-pointer select-none shadow-[4px_4px_0px_#000] ${
                        isEquipped
                          ? isEquippedWrong
                            ? "bg-rose-950/90 border-rose-400 text-rose-100"
                            : "bg-emerald-950/85 border-emerald-400 text-emerald-100"
                          : "bg-slate-950/90 hover:bg-cyan-950/85 border-cyan-400/70 hover:border-cyan-300 text-slate-100"
                      }`}
                    >
                      {/* 16-Bit Pixel-Art Rover Illustration */}
                      <div className="w-20 h-16 sm:w-24 sm:h-20 bg-slate-900/95 border-2 border-cyan-400/50 flex items-center justify-center shrink-0 p-1.5 shadow-[2px_2px_0px_#000]">
                        <MarsRoverPixelSprite
                          roverId={rover.id}
                          className="w-full h-full"
                        />
                      </div>

                      {/* Rover Card Info (No - SL1 / - SL2 tags) */}
                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <div className="flex flex-wrap items-center justify-center sm:justify-between gap-1.5">
                          <h3 className="font-press-start text-[10px] sm:text-xs md:text-sm text-white leading-snug">
                            {rover.cardName}
                          </h3>
                          {isEquipped && (
                            <span
                              className={`px-2 py-0.5 font-press-start text-[7px] sm:text-[8px] border shrink-0 ${
                                isEquippedWrong
                                  ? "bg-rose-500 text-white border-rose-200"
                                  : "bg-emerald-400 text-slate-950 border-white"
                              }`}
                            >
                              LOADED
                            </span>
                          )}
                        </div>

                        <p className="font-silkscreen text-[8px] sm:text-[10px] text-cyan-300 mt-1 leading-tight">
                          {rover.specSummary}
                        </p>

                        <p className="font-vt323 text-sm sm:text-base text-slate-200 mt-1 leading-tight">
                          {rover.pros[0]} &bull; {rover.pros[1]}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Validation Banner & [ LAUNCH TO MARS > ] Button */}
              <div className="pt-2 space-y-1.5 shrink-0">
                {(isLoadedRoverMismatched || roverFairingError) && (
                  <div className="px-2.5 py-1.5 bg-rose-950/95 border-2 border-rose-400 text-rose-200 font-press-start text-[7px] sm:text-[8px] leading-snug text-center animate-pulse">
                    {isLoadedRoverMismatched
                      ? "MISMATCHED ROVER — LOAD THE ROVER SELECTED IN PHASE A"
                      : roverFairingError}
                  </div>
                )}

                {!loadedFairingRover ? (
                  <div className="px-2.5 py-2 bg-slate-950/90 border border-cyan-400/50 font-silkscreen text-[10px] sm:text-xs text-cyan-200 text-center">
                    {`LOAD ${chosenRoverDef.cardName.toUpperCase()} INTO THE ROCKET BAY (0 / 1)`}
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleLaunchFromRoverFairing}
                    className={`w-full py-2.5 px-3 border-2 font-press-start text-[9px] sm:text-xs font-bold uppercase shadow-[4px_4px_0px_#000] transition-all cursor-pointer arcade-btn ${
                      isRoverFairingReadyToLaunch
                        ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 animate-pulse"
                        : "bg-rose-600 hover:bg-rose-500 border-rose-200 text-white"
                    }`}
                  >
                    [ LAUNCH TO MARS &gt; ]
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGES 1 TO 6: COMPACT BOTTOM HUD BAR ONLY                  */}
        {/* (Upper & center portion of NASA photo 100% unobstructed)    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {currentStage && phase !== "STAGE_7" && (
          <div className="w-full max-w-5xl mx-auto mt-auto bg-stone-950/80 border-2 border-orange-400/80 p-3.5 sm:p-5 shadow-[6px_6px_0px_#000] backdrop-blur-md space-y-2.5">
            {/* Stage Title, Badge & Telemetry Row */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-orange-400/30 pb-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 bg-orange-500 text-white font-press-start text-[10px] font-bold">
                  STAGE {currentStage.stageNumber} / 7
                </span>
                <h2 className="text-sm sm:text-lg font-press-start text-white tracking-wide drop-shadow-[2px_2px_0px_#000]">
                  {currentStage.title}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-silkscreen">
                <span className="px-2 py-0.5 bg-stone-900/90 border border-orange-400/50 text-amber-300">
                  ALT: <strong className="text-white">{currentStage.telemetry.altitude}</strong>
                </span>
                <span className="px-2 py-0.5 bg-stone-900/90 border border-orange-400/50 text-amber-300">
                  VEL: <strong className="text-white">{currentStage.telemetry.velocity}</strong>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 bg-stone-900/90 border border-emerald-400/50 text-emerald-300">
                  {currentStage.telemetry.status}
                </span>
              </div>
            </div>

            {/* Exact Stage Description with Typewriter Reveal */}
            <div
              className="min-h-[48px] bg-stone-950/75 border border-orange-400/30 px-3.5 py-2.5 flex items-center cursor-pointer"
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
                  <span className="inline-block w-2.5 h-5 bg-orange-400 ml-1.5 animate-pulse align-middle" />
                )}
              </p>
            </div>

            {/* 16-Bit Segmented Loading Bar + Stage Navigation Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
              {/* Segmented Progress Bar */}
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-silkscreen text-amber-200">
                  <span>
                    {loadProgress < 100
                      ? "MARS INTERPLANETARY TRANSIT LOADING..."
                      : "STAGE TELEMETRY VERIFIED"}
                  </span>
                  <span className="text-amber-300 font-bold">{loadProgress}%</span>
                </div>
                <div className="w-full h-4 bg-black/90 border-2 border-orange-400/70 p-0.5 grid grid-cols-20 gap-0.5">
                  {Array.from({ length: 20 }).map((_, idx) => {
                    const threshold = (idx + 1) * 5;
                    const filled = loadProgress >= threshold;
                    return (
                      <div
                        key={idx}
                        className={`h-full transition-colors duration-150 ${
                          filled
                            ? "bg-gradient-to-t from-orange-600 to-amber-300 shadow-[0_0_6px_rgba(249,115,22,0.8)]"
                            : "bg-stone-900"
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
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 border-2 border-orange-400/60 text-amber-200 hover:text-white font-press-start text-[10px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                >
                  <ChevronLeft className="w-4 h-4 text-amber-300" />
                  <span>PREV</span>
                </button>

                <button
                  type="button"
                  onClick={handleNextStage}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-400 border-2 border-white text-white font-press-start text-[10px] sm:text-xs font-bold flex items-center gap-1.5 shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                >
                  <span>
                    {currentStage.stageNumber === 6
                      ? "[ CONFIRM MARS LANDING > ]"
                      : "[ NEXT STAGE > ]"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 7: YOU HAVE SUCCESSFULLY LANDED ON MARS (BOTTOM HUD)  */}
        {/* (No Commander victory portrait here; crystal-clear photo)   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "STAGE_7" && (
          <div className="w-full max-w-5xl mx-auto mt-auto bg-stone-950/80 border-2 border-orange-400/80 p-4 sm:p-5 shadow-[6px_6px_0px_#000] backdrop-blur-md space-y-3">
            {/* Headline Banner Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-orange-400/40 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/90 border border-emerald-400 text-emerald-300 font-press-start text-[9px] shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>STAGE 7 / 7</span>
                </span>
                <h1 className="text-sm sm:text-xl md:text-2xl font-press-start text-white tracking-wider leading-snug drop-shadow-[0_0_18px_rgba(249,115,22,0.85)]">
                  YOU HAVE SUCCESSFULLY LANDED ON MARS
                </h1>
              </div>
            </div>

            {/* Stage 7 Summary Text & Proceed to Sampling Map Action Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-press-start text-amber-300 uppercase tracking-widest block">
                  {`- TOUCHDOWN CONFIRMED // CMDR ${playerName.toUpperCase()} // ROVER: ${chosenRoverDef.shortName} -`}
                </span>
                <p className="font-vt323 text-lg sm:text-xl text-stone-100 leading-snug">
                  &ldquo;{chosenRoverDef.shortName} is safely on the surface at Jezero Crater (0.38g). Proceed to the Jezero Crater orbital surface map to choose your target sampling site!&rdquo;
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick(640);
                    transitionToPhase("STAGE_1");
                  }}
                  className="px-3.5 py-2.5 bg-stone-900 hover:bg-stone-800 border-2 border-orange-400/60 text-amber-200 hover:text-white font-press-start text-[10px] flex items-center justify-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-amber-300" />
                  <span>[ REPLAY ]</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick(760);
                    transitionToPhase("SAMPLING_SITE_MAP");
                  }}
                  className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-[10px] sm:text-xs font-bold flex items-center gap-2 shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                >
                  <span>[ SELECT SAMPLING SITE &gt; ]</span>
                  <ChevronRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE E1: INTERACTIVE MARS JEZERO CRATER SAMPLING SITE MAP  */}
        {/* (/images/WhatsApp Image 2026-11-15 at 15.23.52.jpg)         */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "SAMPLING_SITE_MAP" && (
          <div className="fixed inset-0 z-30 bg-black overflow-hidden select-none">
            {/* Full-screen Jezero Crater Sampling Area Photograph */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/WhatsApp Image 2026-11-15 at 15.23.52.jpg"
              alt="Mars Jezero Crater Sampling Site Selector"
              className="w-full h-full object-cover object-center pointer-events-none select-none"
              style={{ imageRendering: "auto" }}
            />

            {/* Top HUD Header Bar */}
            <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick(560);
                    transitionToPhase("STAGE_7");
                  }}
                  className="px-3 py-1.5 bg-stone-950/90 hover:bg-stone-900 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] sm:text-[10px] shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                >
                  &lt; STAGE 7
                </button>

                <div className="px-3 py-1.5 bg-stone-950/90 border-2 border-cyan-400/80 shadow-[3px_3px_0px_#000] flex items-center gap-2">
                  <span className="w-2 h-2 bg-cyan-400 animate-ping" />
                  <span className="font-press-start text-[9px] sm:text-[10px] text-cyan-200 tracking-wider">
                    JEZERO CRATER // CLICK A CYAN TARGET CIRCLE TO DEPLOY {chosenRoverDef.shortName}
                  </span>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-stone-950/90 border-2 border-orange-400/80 font-silkscreen text-[10px] text-amber-200 shadow-[3px_3px_0px_#000]">
                <span>ACTIVE ROVER:</span>
                <strong className="text-white">{chosenRoverDef.shortName}</strong>
                <span className="text-cyan-300">| DELAY: 20 MIN ONE-WAY</span>
              </div>
            </div>

            {/* 3 Interactive Sampling Sites (Opaque HUD Labels + Glowing Cyan Circle Hotspots) */}
            {MARS_SAMPLING_SITES.map((site) => {
              const isHovered = hoveredSamplingSite === site.id;
              const isSampled = sampledSites.includes(site.id);
              return (
                <React.Fragment key={site.id}>
                  {/* High-Contrast 16-bit HUD Tag Covering Static "sampling area X" Text */}
                  <button
                    type="button"
                    onMouseEnter={() => {
                      setHoveredSamplingSite(site.id);
                      sfx.playBlip(680 + site.areaNumber * 70);
                    }}
                    onMouseLeave={() => setHoveredSamplingSite(null)}
                    onClick={() => handleSelectSamplingSite(site.id)}
                    style={{
                      left: site.labelLeft,
                      top: site.labelTop,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute z-20 min-w-[185px] sm:min-w-[235px] md:min-w-[265px] min-h-[12.2%] px-3 py-2 sm:px-4 sm:py-2.5 border-2 transition-all duration-150 flex flex-col items-center justify-center text-center cursor-pointer shadow-[4px_4px_0px_#000] ${
                      isHovered
                        ? "bg-cyan-950 border-white scale-105 shadow-[0_0_20px_rgba(34,211,238,0.95)]"
                        : isSampled
                          ? "bg-emerald-950/95 border-emerald-400 hover:border-white"
                          : "bg-stone-950 border-cyan-400 hover:border-white"
                    }`}
                  >
                    <span className="font-silkscreen text-[8px] sm:text-[10px] text-cyan-300 tracking-widest uppercase mb-0.5">
                      {isSampled ? `${site.code} — SAMPLED ✓` : site.code}
                    </span>
                    <span className="font-press-start text-[9px] sm:text-[11px] md:text-xs text-white leading-snug drop-shadow-[1px_1px_0px_#000]">
                      {site.label}
                    </span>
                  </button>

                  {/* Clickable Glowing Cyan Circle Hotspot Aligned Over Image's Cyan Oval */}
                  <button
                    type="button"
                    aria-label={`Select ${site.label}`}
                    onMouseEnter={() => {
                      setHoveredSamplingSite(site.id);
                      sfx.playBlip(680 + site.areaNumber * 70);
                    }}
                    onMouseLeave={() => setHoveredSamplingSite(null)}
                    onClick={() => handleSelectSamplingSite(site.id)}
                    style={{
                      left: site.circleLeft,
                      top: site.circleTop,
                      width: site.circleWidth,
                      height: site.circleHeight,
                      transform: "translate(-50%, -50%)",
                    }}
                    className={`absolute z-20 rounded-[50%] border-[3px] sm:border-4 transition-all duration-200 flex items-center justify-center cursor-pointer group ${
                      isHovered
                        ? "border-white bg-cyan-400/35 scale-110 shadow-[0_0_28px_rgba(34,211,238,1),inset_0_0_18px_rgba(34,211,238,0.8)]"
                        : isSampled
                          ? "border-emerald-400 bg-emerald-400/25 shadow-[0_0_20px_rgba(52,211,153,0.85)]"
                          : "border-cyan-300/90 bg-cyan-400/15 hover:bg-cyan-400/30 shadow-[0_0_16px_rgba(34,211,238,0.75)] animate-pulse"
                    }`}
                  >
                    <span
                      className={`px-2 py-0.5 font-press-start text-[8px] sm:text-[9px] border transition-all ${
                        isHovered
                          ? "bg-cyan-300 text-slate-950 border-white scale-105 shadow-[2px_2px_0px_#000]"
                          : isSampled
                            ? "bg-emerald-400 text-slate-950 border-white"
                            : "bg-stone-950/90 text-cyan-200 border-cyan-400/80"
                      }`}
                    >
                      {isHovered
                        ? "[ DEPLOY HERE ]"
                        : isSampled
                          ? "SAMPLED ✓"
                          : `AREA 0${site.areaNumber}`}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}

            {/* Bottom-Right Mars Rover HUD Telemetry Badge (Cleanly Masks Screenshot Notification Box) */}
            <div className="absolute bottom-0 right-0 z-20 w-[30%] min-w-[260px] sm:min-w-[330px] min-h-[10.5%] bg-stone-950 border-t-2 border-l-2 border-cyan-400 px-3.5 py-2.5 sm:px-5 sm:py-3 shadow-[-4px_-4px_0px_#000] flex flex-col justify-center">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 animate-ping shrink-0" />
                  <span className="font-press-start text-[8px] sm:text-[10px] text-cyan-300 tracking-wider">
                    JEZERO CRATER // SELECT TARGET SITE
                  </span>
                </div>
                <span className="font-silkscreen text-[9px] text-amber-300 shrink-0">
                  {`SAMPLED: ${sampledSites.length}/3`}
                </span>
              </div>
              {sampledSites.length > 0 ? (
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <span className="font-silkscreen text-[9px] text-emerald-300 truncate">
                    CORE SAMPLES SECURED!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playVictoryFanfare();
                      transitionToPhase("PHASE_F_VICTORY");
                    }}
                    className="px-2.5 py-1 bg-emerald-400 hover:bg-emerald-300 border border-white text-slate-950 font-press-start text-[8px] font-bold shadow-[2px_2px_0px_#000] cursor-pointer arcade-btn shrink-0"
                  >
                    [ COMPLETE MISSION &gt; ]
                  </button>
                </div>
              ) : (
                <p className="font-silkscreen text-[9px] sm:text-[10px] text-stone-300 mt-1 truncate">
                  {hoveredSamplingSite
                    ? MARS_SAMPLING_SITES.find(
                        (s) => s.id === hoveredSamplingSite
                      )?.geologyType
                    : `ROVER: ${chosenRoverDef.shortName} // CLICK ANY CYAN RING (1-3)`}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE E2: 8x4 GRID ROVER PATH-PLANNING & EXECUTION GAME     */}
        {/* (/images/WhatsApp Image 2026-11-15 at 15.29.11*.jpg)        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "SAMPLING_SITE_VIEW" && (
          <div className="fixed inset-0 z-30 bg-black overflow-hidden select-none">
            {/* Full-Screen 8x4 Grid Martian Terrain Background Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={activeSamplingSiteDef.gridImage}
              alt={`${activeSamplingSiteDef.label} 8x4 Grid`}
              className="w-full h-full object-fill pointer-events-none select-none"
              style={{ imageRendering: "auto" }}
            />

            {/* Top Compact Site Telemetry Pill */}
            <div className="absolute top-1 left-3 right-3 z-30 flex items-center justify-between gap-2 pointer-events-none">
              <div className="px-2.5 py-0.5 bg-stone-950/90 border border-cyan-400/80 font-press-start text-[8px] sm:text-[9px] text-cyan-200 shadow-[2px_2px_0px_#000]">
                {`${activeSamplingSiteDef.code} // ${activeSamplingSiteDef.label.toUpperCase()}`}
              </div>
              <div className="hidden sm:block px-2.5 py-0.5 bg-stone-950/90 border border-amber-400/80 font-silkscreen text-[9px] sm:text-[10px] text-amber-300 shadow-[2px_2px_0px_#000]">
                {roverExecStatus === "PLANNING"
                  ? isTargetReachedInSim
                    ? "TARGET REACHED IN SIMULATION — PRESS [ START ROVER ] OR ENTER!"
                    : "USE WASD / ARROWS TO SIMULATE PATH FROM START TO TARGET [X]"
                  : roverExecStatus === "DRIVING"
                    ? `EXECUTING QUEUED COMMANDS... STEP ${roverStepIndex} / ${plannedMoves.length}`
                    : roverExecStatus === "DRILLING"
                      ? `DRILLING & ANALYZING ${activeSamplingSiteDef.sampleName.toUpperCase()}...`
                      : "SAMPLE ACQUIRED!"}
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* ALIGNED 8x4 INTERACTIVE GRID OVERLAY                      */}
            {/* (Matches cyan 8x4 grid on image: left 9.6%, top 5.0%,     */}
            {/*  width 83.4%, height 74.2%)                               */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="absolute left-[9.6%] top-[5.0%] w-[83.4%] h-[74.2%] z-20">
              {/* 1. SVG Telemetry Path Line & Wheel Tracks Overlay */}
              <svg
                viewBox="0 0 800 400"
                preserveAspectRatio="none"
                className="absolute inset-0 w-full h-full pointer-events-none z-20"
              >
                {/* Simulated Planned Path Polyline (Outer Glow + Animated Dashed Core) */}
                {plannedPathCells.length > 1 && (
                  <>
                    <polyline
                      fill="none"
                      stroke={
                        isTargetReachedInSim
                          ? "rgba(52, 211, 153, 0.45)"
                          : "rgba(34, 211, 238, 0.45)"
                      }
                      strokeWidth="16"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={plannedPathCells
                        .map((c) => `${c.col * 100 + 50},${c.row * 100 + 50}`)
                        .join(" ")}
                    />
                    <polyline
                      fill="none"
                      stroke={isTargetReachedInSim ? "#34d399" : "#22d3ee"}
                      strokeWidth="6"
                      strokeDasharray="14 8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={plannedPathCells
                        .map((c) => `${c.col * 100 + 50},${c.row * 100 + 50}`)
                        .join(" ")}
                    />
                  </>
                )}

                {/* Traversed Wheel Track Lines During/After Rover Execution */}
                {roverExecStatus !== "PLANNING" && roverStepIndex > 0 && (
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="8"
                    strokeDasharray="6 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={plannedPathCells
                      .slice(0, roverStepIndex + 1)
                      .map((c) => `${c.col * 100 + 50},${c.row * 100 + 50}`)
                      .join(" ")}
                  />
                )}

                {/* Directional Waypoint Dots & Arrowheads Along Simulated Path */}
                {plannedPathCells.map((cell, idx) => {
                  if (idx === 0) return null;
                  const prev = plannedPathCells[idx - 1];
                  const cx = cell.col * 100 + 50;
                  const cy = cell.row * 100 + 50;
                  const midX = (prev.col * 100 + 50 + cx) / 2;
                  const midY = (prev.row * 100 + 50 + cy) / 2;
                  const angle =
                    (Math.atan2(
                      cy - (prev.row * 100 + 50),
                      cx - (prev.col * 100 + 50)
                    ) *
                      180) /
                    Math.PI;

                  return (
                    <g key={`${cell.col}-${cell.row}-${idx}`}>
                      <g
                        transform={`translate(${midX}, ${midY}) rotate(${angle})`}
                      >
                        <polygon
                          points="-8,-7 10,0 -8,7"
                          fill={isTargetReachedInSim ? "#6ee7b7" : "#67e8f9"}
                        />
                      </g>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={idx === plannedPathCells.length - 1 ? 11 : 6}
                        fill={isTargetReachedInSim ? "#10b981" : "#06b6d4"}
                        stroke="#ffffff"
                        strokeWidth="2.5"
                      />
                    </g>
                  );
                })}
              </svg>

              {/* 2. Interactive 8x4 Grid Cells (Click adjacent cell to queue step) */}
              <div className="grid grid-cols-8 grid-rows-4 w-full h-full relative z-10">
                {Array.from({ length: 32 }).map((_, idx) => {
                  const col = idx % 8;
                  const row = Math.floor(idx / 8);
                  const isStart =
                    col === activeSamplingSiteDef.startCell.col &&
                    row === activeSamplingSiteDef.startCell.row;
                  const isTarget =
                    col === activeSamplingSiteDef.targetCell.col &&
                    row === activeSamplingSiteDef.targetCell.row;
                  const isSimTip =
                    roverExecStatus === "PLANNING" &&
                    col === simTipCell.col &&
                    row === simTipCell.row;
                  const isAdjacentToSimTip =
                    roverExecStatus === "PLANNING" &&
                    Math.abs(col - simTipCell.col) +
                      Math.abs(row - simTipCell.row) ===
                      1;

                  return (
                    <div
                      key={`${col}-${row}`}
                      onClick={() => {
                        if (!isAdjacentToSimTip) return;
                        if (row === simTipCell.row - 1) handleQueueMove("UP");
                        else if (row === simTipCell.row + 1)
                          handleQueueMove("DOWN");
                        else if (col === simTipCell.col - 1)
                          handleQueueMove("LEFT");
                        else if (col === simTipCell.col + 1)
                          handleQueueMove("RIGHT");
                      }}
                      className={`relative flex items-center justify-center transition-colors ${
                        isAdjacentToSimTip
                          ? "cursor-pointer hover:bg-cyan-400/20"
                          : ""
                      } ${
                        isSimTip && !isStart
                          ? "bg-cyan-400/20 shadow-[inset_0_0_16px_rgba(34,211,238,0.65)]"
                          : ""
                      }`}
                    >
                      {/* Subtle Start Badge inside Starting Point Cell */}
                      {isStart && (
                        <div className="absolute inset-1 bg-stone-950/75 border border-cyan-400/60 flex flex-col items-center justify-end pb-1 pointer-events-none">
                          <span className="font-press-start text-[7px] sm:text-[8px] text-cyan-300 tracking-wider">
                            START
                          </span>
                        </div>
                      )}

                      {/* Bold Glowing 16-Bit Target 'X' Marker inside Sampling Point Cell */}
                      {isTarget && (
                        <div
                          className={`absolute inset-1 flex flex-col items-center justify-center pointer-events-none border-2 transition-all ${
                            isTargetReachedInSim ||
                            roverExecStatus === "COMPLETED"
                              ? "bg-emerald-950/85 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.9)]"
                              : "bg-stone-950/85 border-rose-400 shadow-[0_0_18px_rgba(244,63,94,0.85)] animate-pulse"
                          }`}
                        >
                          <span
                            className={`font-press-start text-xl sm:text-3xl md:text-4xl font-bold leading-none drop-shadow-[2px_2px_0px_#000] ${
                              isTargetReachedInSim ||
                              roverExecStatus === "COMPLETED"
                                ? "text-emerald-300"
                                : "text-rose-400"
                            }`}
                          >
                            X
                          </span>
                          <span className="font-silkscreen text-[7px] sm:text-[9px] text-white mt-0.5 tracking-wider">
                            {roverExecStatus === "COMPLETED"
                              ? "SAMPLED ✓"
                              : "TARGET SITE"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* 3. Animated 16-Bit Rover Sprite on the 8x4 Grid */}
              <div
                style={{
                  left: `${((currentRoverCell.col + 0.5) / 8) * 100}%`,
                  top: `${((currentRoverCell.row + 0.5) / 4) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="absolute z-30 w-[11.5%] h-[22%] flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ease-linear"
              >
                {/* Core Drilling / Laser Spectrometer Animation When Reached X */}
                {roverExecStatus === "DRILLING" && (
                  <div className="absolute -top-6 px-2 py-0.5 bg-amber-400 text-stone-950 border border-white font-press-start text-[7px] sm:text-[8px] animate-bounce shadow-[2px_2px_0px_#000] whitespace-nowrap">
                    DRILLING CORE...
                  </div>
                )}

                <div
                  className={`w-full h-full flex items-center justify-center transition-transform duration-150 ${
                    currentRoverHeading === "LEFT" ? "-scale-x-100" : ""
                  } ${
                    roverExecStatus === "DRIVING" ||
                    roverExecStatus === "DRILLING"
                      ? "animate-bounce"
                      : ""
                  }`}
                >
                  <MarsRoverPixelSprite
                    roverId={selectedRoverSolution}
                    className="w-full h-full drop-shadow-[0_4px_6px_rgba(0,0,0,0.95)]"
                  />
                </div>
              </div>
            </div>

            {/* ───────────────────────────────────────────────────────── */}
            {/* BOTTOM COMMAND QUEUE & EXECUTION HUD BAR                  */}
            {/* ───────────────────────────────────────────────────────── */}
            <div className="absolute bottom-0 left-0 right-0 h-[19.8%] z-30 bg-stone-950/95 border-t-2 border-cyan-400 px-3 sm:px-5 py-2 flex flex-col justify-between shadow-[0_-6px_16px_rgba(0,0,0,0.9)]">
              {/* Top Row: D-Pad Controls + Queued Command Sequence Pills */}
              <div className="flex items-center justify-between gap-3 overflow-hidden">
                {/* On-Screen WASD / Arrow Buttons */}
                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  <span className="hidden md:inline font-press-start text-[8px] text-cyan-300 mr-1">
                    QUEUE MOVE:
                  </span>
                  {(
                    [
                      { dir: "UP", label: "W / ↑" },
                      { dir: "LEFT", label: "A / ←" },
                      { dir: "DOWN", label: "S / ↓" },
                      { dir: "RIGHT", label: "D / →" },
                    ] as const
                  ).map((btn) => (
                    <button
                      key={btn.dir}
                      type="button"
                      disabled={roverExecStatus !== "PLANNING"}
                      onClick={() => handleQueueMove(btn.dir)}
                      className="px-2 py-1 sm:px-2.5 sm:py-1.5 bg-slate-900 hover:bg-cyan-400 disabled:opacity-40 text-cyan-200 hover:text-slate-950 border border-cyan-400 font-press-start text-[8px] sm:text-[9px] shadow-[2px_2px_0px_#000] cursor-pointer arcade-btn"
                    >
                      {btn.label}
                    </button>
                  ))}
                </div>

                {/* Queued Command Stream */}
                <div className="flex-1 flex items-center gap-1 overflow-x-auto px-2 py-1 bg-black/80 border border-cyan-400/40 min-h-[28px]">
                  <span className="font-silkscreen text-[9px] text-amber-300 shrink-0 mr-1">
                    {`QUEUE (${plannedMoves.length}):`}
                  </span>
                  {plannedMoves.length === 0 ? (
                    <span className="font-silkscreen text-[9px] text-stone-400 truncate">
                      PRESS WASD / ARROWS OR CLICK ADJACENT GRID CELLS TO PLOT PATH TO [X]
                    </span>
                  ) : (
                    plannedMoves.map((mv, i) => {
                      const arrowChar =
                        mv === "UP"
                          ? "↑"
                          : mv === "DOWN"
                            ? "↓"
                            : mv === "LEFT"
                              ? "←"
                              : "→";
                      const isExecuted =
                        roverExecStatus !== "PLANNING" && i < roverStepIndex;
                      return (
                        <span
                          key={i}
                          className={`px-1.5 py-0.5 font-press-start text-[8px] border shrink-0 ${
                            isExecuted
                              ? "bg-emerald-400 text-slate-950 border-white"
                              : "bg-cyan-950 text-cyan-200 border-cyan-400/70"
                          }`}
                        >
                          {arrowChar}
                        </span>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Row: Undo / Clear / Back + [ START ROVER / EXECUTE ] */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(560);
                      transitionToPhase("SAMPLING_SITE_MAP");
                    }}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 border-2 border-cyan-400 text-cyan-200 font-press-start text-[8px] sm:text-[9px] shadow-[2px_2px_0px_#000] cursor-pointer arcade-btn"
                  >
                    [ &lt; BACK TO SITE MAP ]
                  </button>

                  <button
                    type="button"
                    disabled={
                      roverExecStatus !== "PLANNING" ||
                      plannedMoves.length === 0
                    }
                    onClick={handleUndoMove}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-amber-400/80 text-amber-200 font-press-start text-[8px] sm:text-[9px] shadow-[2px_2px_0px_#000] cursor-pointer arcade-btn"
                  >
                    [ UNDO STEP ]
                  </button>

                  <button
                    type="button"
                    disabled={
                      roverExecStatus !== "PLANNING" ||
                      plannedMoves.length === 0
                    }
                    onClick={handleClearMoves}
                    className="px-2.5 py-1.5 bg-stone-900 hover:bg-stone-800 disabled:opacity-40 border border-rose-400/80 text-rose-200 font-press-start text-[8px] sm:text-[9px] shadow-[2px_2px_0px_#000] cursor-pointer arcade-btn"
                  >
                    [ CLEAR PATH ]
                  </button>
                </div>

                {/* Right Action: Execute Drive or Sample Complete Actions */}
                <div className="flex items-center gap-2">
                  {roverExecStatus === "COMPLETED" ? (
                    <>
                      <span className="hidden md:inline font-press-start text-[9px] text-emerald-300">
                        {`✓ ${activeSamplingSiteDef.sampleName.toUpperCase()} COLLECTED!`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playClick(680);
                          transitionToPhase("SAMPLING_SITE_MAP");
                        }}
                        className="px-3.5 py-2 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-[9px] sm:text-[10px] font-bold shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                      >
                        [ SAMPLE ANOTHER SITE ]
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sfx.playVictoryFanfare();
                          transitionToPhase("PHASE_F_VICTORY");
                        }}
                        className="px-4 py-2 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-[9px] sm:text-[10px] font-bold shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn animate-pulse"
                      >
                        [ COMPLETE MISSION &gt; ]
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      disabled={
                        roverExecStatus !== "PLANNING" || !isTargetReachedInSim
                      }
                      onClick={handleExecuteRoverPath}
                      className={`px-4 py-2 sm:px-6 sm:py-2.5 border-2 font-press-start text-[9px] sm:text-xs font-bold uppercase shadow-[4px_4px_0px_#000] transition-all cursor-pointer arcade-btn ${
                        roverExecStatus === "PLANNING" && isTargetReachedInSim
                          ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 animate-pulse shadow-[0_0_18px_rgba(52,211,153,0.95)]"
                          : "bg-stone-900 border-stone-600 text-stone-400 opacity-70 cursor-not-allowed"
                      }`}
                    >
                      {roverExecStatus === "DRIVING"
                        ? "[ ROVER DRIVING... ]"
                        : roverExecStatus === "DRILLING"
                          ? "[ DRILLING CORE SAMPLE... ]"
                          : isTargetReachedInSim
                            ? "[ START ROVER / EXECUTE > ]"
                            : "[ REACH TARGET X TO START ROVER ]"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* PHASE F: MARS MISSION VICTORY DEBRIEF (15.38.38.jpeg)       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "PHASE_F_VICTORY" && (
          <div className="my-auto mx-auto w-full max-w-4xl flex items-center justify-center">
            <div className="relative w-full aspect-[937/530] max-h-[80vh] border-2 border-emerald-400 shadow-[8px_8px_0px_#000] overflow-hidden bg-stone-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/WhatsApp Image 2026-11-14 at 15.38.38.jpeg"
                alt="Mars Mission Complete"
                className="w-full h-full object-fill select-none"
              />

              <div className="absolute left-[49%] right-[6%] top-[50%] bottom-[10%] bg-slate-950/90 border-2 border-emerald-400/80 p-3 sm:p-5 flex flex-col justify-between shadow-[4px_4px_0px_#000]">
                <div className="space-y-2 overflow-y-auto pr-1">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-950 border border-emerald-400 text-emerald-300 font-press-start text-[8px] sm:text-[9px]">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>PHASE F // JEZERO SAMPLE ACQUISITION COMPLETE</span>
                  </div>

                  <h3 className="font-press-start text-xs sm:text-sm text-white leading-snug">
                    WELL DONE, CMDR {playerName.toUpperCase()}!
                  </h3>

                  <p className="font-pixel-body text-emerald-100 text-[11px] sm:text-xs leading-relaxed">
                    {`${chosenRoverDef.cardName} successfully navigated the delayed-command telemetry grid and extracted pristine Martian core samples from Jezero Crater (${sampledSites.length} / 3 sites sampled).`}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-emerald-500/30">
                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(640);
                      transitionToPhase("SAMPLING_SITE_MAP");
                    }}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400 text-cyan-200 font-press-start text-[8px] sm:text-[9px] shadow-[2px_2px_0px_#000] cursor-pointer arcade-btn"
                  >
                    [ &lt; SITE MAP ]
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      sfx.playClick(720);
                      onAbort();
                    }}
                    className="px-3.5 py-2 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-[8px] sm:text-[9px] font-bold shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                  >
                    [ RETURN TO BASE &gt; ]
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
