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
import SciFiHudButton from "./SciFiHudButton";

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

export type MarsMissionPhase = "BRIEFING_INTRO" | MarsStageId | "STAGE_GAME_READY";

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
  const [loadProgress, setLoadProgress] = useState<number>(0);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true);
  const [typewriterIndex, setTypewriterIndex] = useState<number>(0);

  const lastBlipRef = useRef<number>(0);

  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  const introBriefingPages = [
    `Welcome back, ${playerName}! The scientists at the research center urgently need soil and rock samples from the Mars surface.`,
    `You’ve been assigned to lead the mission. Grab your gear and prepare for launch. Good luck!`,
  ];

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
    if (nextPhase === "STAGE_7") {
      sfx.playVictoryFanfare();
    } else if (nextPhase !== "BRIEFING_INTRO") {
      sfx.playStageTransition();
    }
  }, []);

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
        transitionToPhase("STAGE_1");
      }
      return;
    }
    const idx = MARS_STAGES.findIndex((s) => s.id === phase);
    if (idx >= 0 && idx < MARS_STAGES.length - 1) {
      transitionToPhase(MARS_STAGES[idx + 1].id);
    }
  }, [phase, briefingPage, introBriefingPages.length, transitionToPhase]);

  // Go back to previous stage
  const handlePrevStage = useCallback(() => {
    sfx.playClick(580);
    const idx = MARS_STAGES.findIndex((s) => s.id === phase);
    if (idx === 0) {
      transitionToPhase("BRIEFING_INTRO");
    } else if (idx > 0) {
      transitionToPhase(MARS_STAGES[idx - 1].id);
    }
  }, [phase, transitionToPhase]);

  // Animated 0% -> 100% loading bar for Stages 1 through 6
  useEffect(() => {
    if (phase === "BRIEFING_INTRO" || phase === "STAGE_7" || phase === "STAGE_GAME_READY") return;

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
    if (
      phase === "BRIEFING_INTRO" ||
      phase === "STAGE_7" ||
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
  }, [phase, autoAdvance, loadProgress, isTypewriterDone, handleNextStage]);

  // Keyboard navigation (Space / Enter / Right Arrow to advance, Left Arrow to go back)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!isTypewriterDone) {
          setTypewriterIndex(activeText.length);
        } else if (phase !== "STAGE_7" && phase !== "STAGE_GAME_READY") {
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
  }, [isTypewriterDone, activeText.length, phase, handleNextStage, handlePrevStage, onAbort]);

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
            const currentNum = currentStage?.stageNumber || 0;
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
        </div>

        {/* Right: Auto-Advance Toggle & SFX Toggle */}
        <div className="flex items-center gap-2">
          {phase !== "BRIEFING_INTRO" && phase !== "STAGE_7" && phase !== "STAGE_GAME_READY" && (
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
                        : "READY FOR HEAVY-LIFT IGNITION"}
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
                        : "[ START MISSION > ]"}
                  </button>
                </div>
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

            {/* Stage 7 Summary Text & Return Action Row */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center md:text-left">
                <span className="text-[10px] font-press-start text-amber-300 uppercase tracking-widest block">
                  - TOUCHDOWN CONFIRMED // CMDR {playerName.toUpperCase()} -
                </span>
                <p className="font-vt323 text-lg sm:text-xl text-stone-100 leading-snug">
                  &ldquo;Perseverance is safely on the surface at Jezero Crater (0.38g). All 7 interplanetary transit and EDL stages completed nominally!&rdquo;
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

                <SciFiHudButton
                  onClick={onAbort}
                  theme="orange"
                  code="MARS_07"
                  systemStatus="MISSION COMPLETE"
                  size="md"
                  showTelemetryBlock={false}
                >
                  <span>RETURN TO MISSION SELECT</span>
                </SciFiHudButton>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
