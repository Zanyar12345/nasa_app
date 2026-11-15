"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Compass,
  Telescope,
  Volume2,
  VolumeX,
  Orbit,
  QuestionMark,
  X,
  Users,
} from "lucide-react";
import { sounds } from "./SoundEffects";
import SciFiHudButton from "./SciFiHudButton";

export type DestinationId = "mars" | "iss" | "moon";

export interface DestinationTheme {
  cardBg: string;
  cardBorder: string;
  cardGlow: string;
  arrowBtn: string;
  arrowIcon: string;
  indicatorBadge: string;
  indicatorDotActive: string;
  headerChip: string;
  headerBackBtn: string;
  headerIcon: string;
  chipBg: string;
  accentText: string;
  tagPulse: string;
  tagText: string;
  divider: string;
  primaryBtn: string;
  primaryBtnIcon: string;
  primaryBtnArrow: string;
  infoBtn: string;
  infoBtnActive: string;
  infoIcon: string;
  titleColor: string;
  titleGlow: string;
  title3DClass?: string;
}

export interface DestinationItem {
  id: DestinationId;
  name: string;
  badgeEn: string;
  image: string;
  description: string;
  distanceEn: string;
  orbitTypeEn: string;
  theme: DestinationTheme;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL NASA DESTINATION DESCRIPTIONS & DYNAMIC THEMES
// ─────────────────────────────────────────────────────────────────────────────
export const DESTINATIONS: DestinationItem[] = [
  {
    id: "mars",
    name: "MARS MISSION",
    badgeEn: "THE RED PLANET • PHOBOS & DEIMOS",
    image: "/images/dest-mars.jpg",
    description:
      "Mars is kept company by two cratered moons -- an inner moon named Phobos and an outer moon named Deimos. On August 1, 2013, NASA's Curiosity rover pointed its telephoto lens toward the Martian heavens and recorded a series of night sky images that show the irregularly shaped moons crossing paths. Phobos, the larger of the two, circles the Red Planet about every eight hours from an average distance of 3,700 miles. Deimos is located farther away -- approximately 12,500 miles -- and completes one orbit every 30 hours. In comparison to Earth's moon, the moons of Mars are much smaller and placed in closer proximity to their planetary companion. For example, it would take Apollo astronauts three days to travel 238,000 miles from Earth to the moon. A similar journey from Mars to Phobos or Deimos would only take an hour or two.",
    distanceEn: "~225 Million km",
    orbitTypeEn: "Interplanetary Orbit",
    theme: {
      cardBg: "bg-[#140603]/95",
      cardBorder: "border-2 border-orange-500",
      cardGlow: "shadow-[6px_6px_0px_#000] ring-1 ring-orange-500/40",
      arrowBtn:
        "bg-[#140603]/90 hover:bg-[#280c07] border-2 border-orange-500 hover:border-orange-400 text-orange-200 hover:text-white shadow-[4px_4px_0px_#000] arcade-btn",
      arrowIcon: "text-orange-400 group-hover:text-white",
      indicatorBadge: "bg-[#140603]/90 border-2 border-orange-500 text-orange-100 shadow-[3px_3px_0px_#000] font-press-start text-[10px]",
      indicatorDotActive: "bg-orange-500 shadow-[0_0_8px_#f97316]",
      headerChip: "bg-[#140603]/90 border-2 border-orange-500/80 text-orange-300 shadow-[3px_3px_0px_#000] font-silkscreen",
      headerBackBtn:
        "bg-[#140603]/90 hover:bg-[#280c07] border-2 border-orange-500 text-orange-200 hover:text-white shadow-[3px_3px_0px_#000] font-silkscreen arcade-btn",
      headerIcon: "text-orange-400",
      chipBg: "bg-[#240b07] border border-orange-500/50 text-orange-200 shadow-[2px_2px_0px_#000] font-silkscreen",
      accentText: "text-orange-400",
      tagPulse: "bg-orange-500",
      tagText: "text-orange-300 font-press-start text-[9px]",
      divider: "border-orange-900/80",
      primaryBtn:
        "bg-orange-600 hover:bg-orange-500 border-2 border-amber-300 text-white shadow-[5px_5px_0px_#000] font-press-start arcade-btn",
      primaryBtnIcon: "text-amber-300",
      primaryBtnArrow: "text-white",
      infoBtn:
        "bg-[#140603]/90 hover:bg-[#280c07] border-2 border-orange-500 text-orange-300 shadow-[4px_4px_0px_#000] font-press-start arcade-btn",
      infoBtnActive:
        "bg-orange-600 border-2 border-white text-white shadow-[4px_4px_0px_#000] font-press-start",
      infoIcon: "text-orange-300 group-hover:text-white",
      titleColor: "text-amber-100",
      titleGlow:
        "drop-shadow-[0_0_35px_rgba(249,115,22,0.85)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]",
      title3DClass: "mission-title-mars",
    },
  },
  {
    id: "iss",
    name: "ISS MISSION",
    badgeEn: "LOW EARTH ORBIT (LEO)",
    image: "/images/dest-iss.jpg",
    description:
      "The International Space Station Program brings together international flight crews, multiple launch vehicles, globally distributed launch and flight operations, training, engineering, and development facilities, communications networks, and the international scientific research community.",
    distanceEn: "408 km (Low Earth Orbit)",
    orbitTypeEn: "Circular Low Earth Orbit",
    theme: {
      cardBg: "bg-[#030e1c]/95",
      cardBorder: "border-2 border-cyan-400",
      cardGlow: "shadow-[6px_6px_0px_#000] ring-1 ring-cyan-400/40",
      arrowBtn:
        "bg-[#030e1c]/90 hover:bg-[#081e38] border-2 border-cyan-400 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-[4px_4px_0px_#000] arcade-btn",
      arrowIcon: "text-cyan-300 group-hover:text-white",
      indicatorBadge: "bg-[#030e1c]/90 border-2 border-cyan-400 text-cyan-100 shadow-[3px_3px_0px_#000] font-press-start text-[10px]",
      indicatorDotActive: "bg-cyan-400 shadow-[0_0_8px_#22d3ee]",
      headerChip: "bg-[#030e1c]/90 border-2 border-cyan-400/80 text-cyan-300 shadow-[3px_3px_0px_#000] font-silkscreen",
      headerBackBtn:
        "bg-[#030e1c]/90 hover:bg-[#081e38] border-2 border-cyan-400 text-cyan-200 hover:text-white shadow-[3px_3px_0px_#000] font-silkscreen arcade-btn",
      headerIcon: "text-cyan-400",
      chipBg: "bg-[#07182c] border border-cyan-400/50 text-cyan-200 shadow-[2px_2px_0px_#000] font-silkscreen",
      accentText: "text-cyan-400",
      tagPulse: "bg-cyan-400",
      tagText: "text-cyan-300 font-press-start text-[9px]",
      divider: "border-cyan-950",
      primaryBtn:
        "bg-cyan-600 hover:bg-cyan-500 border-2 border-cyan-200 text-white shadow-[5px_5px_0px_#000] font-press-start arcade-btn",
      primaryBtnIcon: "text-cyan-200",
      primaryBtnArrow: "text-white",
      infoBtn:
        "bg-[#030e1c]/90 hover:bg-[#081e38] border-2 border-cyan-400 text-cyan-300 shadow-[4px_4px_0px_#000] font-press-start arcade-btn",
      infoBtnActive:
        "bg-cyan-600 border-2 border-white text-white shadow-[4px_4px_0px_#000] font-press-start",
      infoIcon: "text-cyan-300 group-hover:text-white",
      titleColor: "text-cyan-100",
      titleGlow:
        "drop-shadow-[0_0_35px_rgba(6,182,212,0.85)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]",
      title3DClass: "mission-title-iss",
    },
  },
  {
    id: "moon",
    name: "MOON MISSION",
    badgeEn: "ARTEMIS & CISLUNAR ORBIT",
    image: "/images/dest-moon.jpg",
    description:
      "From lighting up our skies to preserving evidence of our solar system’s history, Earth’s closest neighbor plays a pivotal role in the study of our planet and beyond.",
    distanceEn: "384,400 km (Cislunar)",
    orbitTypeEn: "Lunar Orbit & Asteroid Rendezvous",
    theme: {
      cardBg: "bg-[#0c0d12]/95",
      cardBorder: "border-2 border-slate-300",
      cardGlow: "shadow-[6px_6px_0px_#000] ring-1 ring-white/40",
      arrowBtn:
        "bg-[#0c0d12]/90 hover:bg-[#1a1b24] border-2 border-slate-300 hover:border-white text-slate-200 hover:text-white shadow-[4px_4px_0px_#000] arcade-btn",
      arrowIcon: "text-slate-300 group-hover:text-white",
      indicatorBadge: "bg-[#0c0d12]/90 border-2 border-slate-300 text-white shadow-[3px_3px_0px_#000] font-press-start text-[10px]",
      indicatorDotActive: "bg-white shadow-[0_0_8px_#ffffff]",
      headerChip: "bg-[#0c0d12]/90 border-2 border-slate-400/80 text-slate-200 shadow-[3px_3px_0px_#000] font-silkscreen",
      headerBackBtn:
        "bg-[#0c0d12]/90 hover:bg-[#1a1b24] border-2 border-slate-300 text-slate-200 hover:text-white shadow-[3px_3px_0px_#000] font-silkscreen arcade-btn",
      headerIcon: "text-slate-300",
      chipBg: "bg-[#171822] border border-slate-500/50 text-slate-200 shadow-[2px_2px_0px_#000] font-silkscreen",
      accentText: "text-slate-200",
      tagPulse: "bg-slate-300",
      tagText: "text-slate-300 font-press-start text-[9px]",
      divider: "border-slate-800",
      primaryBtn:
        "bg-slate-200 hover:bg-white border-2 border-white text-slate-950 shadow-[5px_5px_0px_#000] font-press-start arcade-btn",
      primaryBtnIcon: "text-slate-950",
      primaryBtnArrow: "text-slate-950",
      infoBtn:
        "bg-[#0c0d12]/90 hover:bg-[#1a1b24] border-2 border-slate-300 text-slate-200 shadow-[4px_4px_0px_#000] font-press-start arcade-btn",
      infoBtnActive:
        "bg-slate-200 border-2 border-white text-slate-950 shadow-[4px_4px_0px_#000] font-press-start",
      infoIcon: "text-slate-300 group-hover:text-white",
      titleColor: "text-slate-100",
      titleGlow:
        "drop-shadow-[0_0_35px_rgba(255,255,255,0.75)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]",
      title3DClass: "mission-title-moon",
    },
  },
];

interface DestinationSelectorProps {
  playerName: string;
  soundOn: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onSelectDestination: (destId: DestinationId) => void;
  onOpenMultiplayer?: () => void;
}

export default function DestinationSelector({
  playerName,
  soundOn,
  onToggleSound,
  onBack,
  onSelectDestination,
  onOpenMultiplayer,
}: DestinationSelectorProps) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isInfoPinned, setIsInfoPinned] = useState<boolean>(false);
  const [isInfoHovered, setIsInfoHovered] = useState<boolean>(false);

  const activeDest = DESTINATIONS[currentIndex];
  const t = activeDest.theme;

  const isInfoOpen = isInfoPinned || isInfoHovered;

  const handlePrev = useCallback(() => {
    sounds.playClick(620);
    setCurrentIndex((prev) => (prev === 0 ? DESTINATIONS.length - 1 : prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    sounds.playClick(720);
    setCurrentIndex((prev) => (prev === DESTINATIONS.length - 1 ? 0 : prev + 1));
  }, []);

  const handleSelect = useCallback(() => {
    sounds.playLaunchChord();
    onSelectDestination(activeDest.id);
  }, [activeDest.id, onSelectDestination]);

  const handleTogglePin = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick(680);
    setIsInfoPinned((prev) => {
      const next = !prev;
      if (!next) {
        setIsInfoHovered(false);
      }
      return next;
    });
  }, []);

  // Keyboard navigation listener (Left/Right Arrow keys + Escape + Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "KeyA") {
        handlePrev();
      } else if (e.key === "ArrowRight" || e.key === "KeyD") {
        handleNext();
      } else if (e.key === "Escape") {
        if (isInfoPinned) {
          setIsInfoPinned(false);
          setIsInfoHovered(false);
        } else {
          onBack();
        }
      } else if (e.key === "Enter") {
        handleSelect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handlePrev, handleNext, onBack, handleSelect, isInfoPinned]);

  return (
    <main className="relative w-screen h-screen min-h-[600px] overflow-hidden select-none bg-black font-sans text-slate-100">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. FULL-RESOLUTION NASA BACKGROUNDS (ZERO BLUR, CRISP DETAIL) */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {DESTINATIONS.map((dest, idx) => (
          <div
            key={dest.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dest.image}
              alt={`NASA Destination: ${dest.name}`}
              className="w-full h-full object-cover object-center filter contrast-[1.04]"
              style={{
                imageRendering: "auto",
              }}
            />
          </div>
        ))}

        {/* Minimalist edge darkening to ensure HUD elements contrast cleanly without dimming center */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 80%, rgba(0,0,0,0.72) 100%)",
          }}
        />

        {/* Soft top & bottom gradient bars for clean navigation contrast */}
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/70 via-black/30 to-transparent pointer-events-none z-10" />
      </div>

      {/* CRT Scanline Retro Arcade Monitor Overlay */}
      <div className="fixed inset-0 crt-overlay z-40 pointer-events-none" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP FLOATING NAVIGATION & BACK / HUD CONTROLS             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full px-6 sm:px-12 pt-4 sm:pt-5 pb-2 flex items-center justify-between">
        {/* Left: Back Button & Player Callsign Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-none sm:rounded-sm border-2 backdrop-blur-md text-xs font-silkscreen font-bold transition-all duration-300 cursor-pointer shadow-[3px_3px_0px_#000] arcade-btn ${t.headerBackBtn}`}
            title="Back"
          >
            <ArrowLeft className={`w-4 h-4 transition-colors duration-300 ${t.headerIcon}`} />
            <span>BACK</span>
          </button>

          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-none sm:rounded-sm border-2 backdrop-blur-md text-xs font-silkscreen shadow-[3px_3px_0px_#000] transition-all duration-300 ${t.headerChip}`}
          >
            <span className={`w-2 h-2 rounded-none animate-pulse ${t.tagPulse}`} />
            <span className="font-bold uppercase tracking-wider">
              {playerName ? `CMDR: ${playerName}` : "CMDR: NOVA"}
            </span>
          </div>
        </div>

        {/* Center: Slide Dot Indicators in Top Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-none sm:rounded-sm bg-black/80 border-2 border-slate-700 shadow-[3px_3px_0px_#000]">
          {DESTINATIONS.map((dest, idx) => (
            <button
              key={dest.id}
              onClick={() => {
                sounds.playClick(680);
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? `w-6 h-2 ${t.indicatorDotActive} rounded-none`
                  : "w-2 h-2 bg-white/40 hover:bg-white/80 rounded-none"
              }`}
              title={dest.name}
            />
          ))}
        </div>

        {/* Right: 1P Solo / Multiplayer Mode Switcher, Sound & Telescope Info */}
        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-950/90 border-2 border-emerald-400/70 text-emerald-300 font-press-start text-[9px] shadow-[3px_3px_0px_#000]">
            <span>[ 1P SOLO ]</span>
          </div>

          {onOpenMultiplayer && (
            <button
              type="button"
              onClick={() => {
                sounds.playBlip(720);
                onOpenMultiplayer();
              }}
              className="px-3 py-1.5 bg-cyan-950/90 hover:bg-cyan-900 border-2 border-cyan-400 text-cyan-200 hover:text-white font-press-start text-[9px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
              title="Open Real-Time Multiplayer Room Lobby"
            >
              <Users className="w-3.5 h-3.5 text-cyan-300" />
              <span>[ MULTIPLAYER ]</span>
            </button>
          )}

          <div
            className={`hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-none sm:rounded-sm border-2 backdrop-blur-md text-[11px] font-silkscreen transition-all duration-300 shadow-[3px_3px_0px_#000] ${t.headerChip}`}
          >
            <Telescope className={`w-3.5 h-3.5 transition-colors duration-300 ${t.headerIcon}`} />
            <span>NASA ARCHIVE</span>
          </div>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-none sm:rounded-sm border-2 text-xs backdrop-blur-md shadow-[3px_3px_0px_#000] transition-all duration-300 cursor-pointer arcade-btn ${t.headerBackBtn}`}
            title={soundOn ? "Mute SFX" : "Unmute SFX"}
          >
            {soundOn ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2B. PROMINENT FLOATING MISSION TITLE (ZERO BOX, CLEAN TEXT)   */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-30 w-full flex flex-col items-center justify-center px-4 pointer-events-auto mt-2 sm:mt-5 select-none text-center">
        <h1
          className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.12em] sm:tracking-[0.16em] uppercase transition-all duration-500 font-bikepark drop-shadow-2xl leading-none sm:leading-tight ${
            t.title3DClass || `${t.titleColor} ${t.titleGlow}`
          }`}
        >
          {activeDest.name}
        </h1>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. CENTER SLIDER CONTROLS (LEFT & RIGHT RETRO CHEVRONS)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-x-4 sm:inset-x-10 top-1/2 -translate-y-1/2 z-30 flex items-center justify-between pointer-events-none">
        {/* Previous Slide Button */}
        <button
          type="button"
          onClick={handlePrev}
          className={`pointer-events-auto p-3.5 sm:p-4 rounded-none sm:rounded-sm border-2 backdrop-blur-md transition-all duration-300 cursor-pointer group shadow-[4px_4px_0px_#000] arcade-btn ${t.arrowBtn}`}
          aria-label="Previous Mission (<)"
          title="Previous Mission (< or A)"
        >
          <ChevronLeft
            className={`w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:-translate-x-0.5 ${t.arrowIcon}`}
            strokeWidth={2.6}
          />
        </button>

        {/* Next Slide Button */}
        <button
          type="button"
          onClick={handleNext}
          className={`pointer-events-auto p-3.5 sm:p-4 rounded-none sm:rounded-sm border-2 backdrop-blur-md transition-all duration-300 cursor-pointer group shadow-[4px_4px_0px_#000] arcade-btn ${t.arrowBtn}`}
          aria-label="Next Mission (>)"
          title="Next Mission (> or D)"
        >
          <ChevronRight
            className={`w-6 h-6 sm:w-8 sm:h-8 transition-transform duration-300 group-hover:translate-x-0.5 ${t.arrowIcon}`}
            strokeWidth={2.6}
          />
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. BOTTOM-LEFT INTERACTIVE NASA INFO TRIGGER & CARD POPUP     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-2 sm:bottom-3 left-4 sm:left-10 z-30"
        onMouseEnter={() => setIsInfoHovered(true)}
        onMouseLeave={() => setIsInfoHovered(false)}
      >
        {/* Hover / Click Info Popup Card positioned directly above the button */}
        <div
          className={`absolute left-0 bottom-14 sm:bottom-16 transition-all duration-300 origin-bottom-left ${
            isInfoOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          }`}
        >
          <div
            className={`max-w-[calc(100vw-88px)] sm:max-w-xl w-[calc(100vw-88px)] sm:w-[500px] rounded-none sm:rounded-sm p-5 sm:p-6 backdrop-blur-xl border-2 space-y-3.5 transition-all duration-300 shadow-[8px_8px_0px_#000] ${t.cardBg} ${t.cardBorder} ${t.cardGlow}`}
          >
            {/* Destination Category Badge & Name */}
            <div className={`flex items-center justify-between gap-2 border-b pb-2.5 ${t.divider}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-none animate-pulse ${t.tagPulse}`} />
                <span className={`text-[10px] font-press-start tracking-wider uppercase ${t.tagText}`}>
                  {activeDest.badgeEn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isInfoPinned && (
                  <span className="text-[9px] font-press-start px-2 py-0.5 rounded-none bg-white/10 text-white border border-white/30">
                    PINNED
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    sounds.playClick(500);
                    setIsInfoPinned(false);
                    setIsInfoHovered(false);
                  }}
                  className="text-slate-400 hover:text-white transition-colors p-1 hover:bg-white/10 cursor-pointer"
                  title="Close"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-press-start tracking-tight text-white flex items-center gap-2">
              <span>{activeDest.name}</span>
            </h2>

            {/* Exact Official NASA Description in Crisp Pixel Font */}
            <p className="text-base sm:text-lg font-vt323 text-slate-200 leading-snug max-h-40 sm:max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700 tracking-wide">
              {activeDest.description}
            </p>

            {/* Telemetry Chips */}
            <div className={`flex flex-wrap items-center gap-2 pt-1 border-t text-[11px] font-silkscreen ${t.divider}`}>
              <div className={`px-2.5 py-1 rounded-none border shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all duration-300 ${t.chipBg}`}>
                <Orbit className={`w-3.5 h-3.5 transition-colors duration-300 ${t.accentText}`} />
                <span>{activeDest.distanceEn}</span>
              </div>

              <div className={`px-2.5 py-1 rounded-none border shadow-[2px_2px_0px_#000] flex items-center gap-1.5 transition-all duration-300 ${t.chipBg}`}>
                <Compass className={`w-3.5 h-3.5 transition-colors duration-300 ${t.accentText}`} />
                <span>{activeDest.orbitTypeEn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sharp Retro Arcade ? (Question Mark) icon button */}
        <button
          type="button"
          onClick={handleTogglePin}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-none sm:rounded-sm border-2 backdrop-blur-md transition-all duration-300 cursor-pointer flex items-center justify-center group shadow-[4px_4px_0px_#000] arcade-btn ${
            isInfoPinned ? t.infoBtnActive : t.infoBtn
          }`}
          aria-label="NASA Mission Information (?)"
          title={isInfoPinned ? "Close / Unpin Info Card" : "NASA Mission Information (? - Click to Pin)"}
        >
          <QuestionMark
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-300 group-hover:scale-110 ${
              isInfoPinned ? "text-inherit" : t.infoIcon
            }`}
            strokeWidth={2.4}
          />
          <span className="sr-only">?</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. DYNAMIC SCI-FI HUD SELECT MISSION / LAUNCH BUTTON          */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-14 sm:bottom-16 right-4 sm:right-10 z-30">
        <SciFiHudButton
          onClick={handleSelect}
          theme={activeDest.id === "mars" ? "orange" : activeDest.id === "iss" ? "cyan" : "silver"}
          code={`MIS_0${currentIndex + 1}`}
          systemStatus="SYSTEM: ACTIVE"
          size="lg"
        >
          <span>SELECT MISSION</span>
        </SciFiHudButton>
      </div>
    </main>
  );
}
