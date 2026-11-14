"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Rocket,
  ArrowLeft,
  Compass,
  Telescope,
  Volume2,
  VolumeX,
  Orbit,
  QuestionMark,
  X,
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
  nameTr: string;
  badgeTr: string;
  badgeEn: string;
  image: string;
  description: string;
  distanceTr: string;
  distanceEn: string;
  orbitTypeTr: string;
  orbitTypeEn: string;
  theme: DestinationTheme;
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL NASA DESTINATION DESCRIPTIONS & DYNAMIC THEMES
// ─────────────────────────────────────────────────────────────────────────────
export const DESTINATIONS: DestinationItem[] = [
  {
    id: "mars",
    name: "MARS",
    nameTr: "MARS GÖREVİ",
    badgeTr: "KIZIL GEZEGEN • PHOBOS & DEIMOS",
    badgeEn: "THE RED PLANET • PHOBOS & DEIMOS",
    image: "/images/dest-mars.jpg",
    description:
      "Mars is kept company by two cratered moons -- an inner moon named Phobos and an outer moon named Deimos. On August 1, 2013, NASA's Curiosity rover pointed its telephoto lens toward the Martian heavens and recorded a series of night sky images that show the irregularly shaped moons crossing paths. Phobos, the larger of the two, circles the Red Planet about every eight hours from an average distance of 3,700 miles. Deimos is located farther away -- approximately 12,500 miles -- and completes one orbit every 30 hours. In comparison to Earth's moon, the moons of Mars are much smaller and placed in closer proximity to their planetary companion. For example, it would take Apollo astronauts three days to travel 238,000 miles from Earth to the moon. A similar journey from Mars to Phobos or Deimos would only take an hour or two.",
    distanceTr: "~225 Milyon km",
    distanceEn: "~225 Million km",
    orbitTypeTr: "Gezegenler Arası Yörünge",
    orbitTypeEn: "Interplanetary Orbit",
    theme: {
      cardBg: "bg-[#1f0c08]/85",
      cardBorder: "border-orange-500/40",
      cardGlow: "shadow-[0_20px_50px_rgba(234,88,12,0.25)] ring-1 ring-orange-500/20",
      arrowBtn:
        "bg-[#1f0c08]/80 hover:bg-[#33140d]/90 border-orange-500/40 hover:border-orange-400 text-orange-200 hover:text-white shadow-2xl shadow-orange-950/60",
      arrowIcon: "text-orange-300 group-hover:text-orange-100",
      indicatorBadge: "bg-[#1f0c08]/85 border-orange-500/40 text-orange-100 shadow-orange-950/50",
      indicatorDotActive: "bg-orange-500 shadow-sm shadow-orange-500/80",
      headerChip: "bg-[#1f0c08]/80 border-orange-500/30 text-orange-300",
      headerBackBtn:
        "bg-[#1f0c08]/80 hover:bg-[#33140d] border-orange-500/40 text-orange-200 hover:text-white shadow-orange-950/40",
      headerIcon: "text-orange-400",
      chipBg: "bg-orange-950/60 border-orange-500/30 text-orange-200",
      accentText: "text-orange-400",
      tagPulse: "bg-orange-500",
      tagText: "text-orange-300",
      divider: "border-orange-900/50",
      primaryBtn:
        "bg-gradient-to-r from-orange-600 via-red-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-[0_12px_35px_rgba(234,88,12,0.55)] hover:shadow-[0_16px_45px_rgba(249,115,22,0.7)] border-orange-400/40",
      primaryBtnIcon: "text-amber-200",
      primaryBtnArrow: "text-orange-200",
      infoBtn:
        "bg-[#1f0c08]/85 hover:bg-[#33140d] border-orange-500/50 hover:border-orange-400 text-orange-300 hover:text-white shadow-[0_0_25px_rgba(234,88,12,0.35)] ring-1 ring-orange-500/20",
      infoBtnActive:
        "bg-orange-600 border-orange-400 text-white shadow-[0_0_35px_rgba(234,88,12,0.7)] ring-2 ring-orange-300",
      infoIcon: "text-orange-300 group-hover:text-orange-100",
      titleColor: "text-amber-100",
      titleGlow:
        "drop-shadow-[0_0_35px_rgba(249,115,22,0.85)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]",
      title3DClass: "mission-title-mars",
    },
  },
  {
    id: "iss",
    name: "ISS",
    nameTr: "ULUSLARARASI UZAY İSTASYONU",
    badgeTr: "ALÇAK DÜNYA YÖRÜNGESİ (LEO)",
    badgeEn: "LOW EARTH ORBIT (LEO)",
    image: "/images/dest-iss.jpg",
    description:
      "The International Space Station Program brings together international flight crews, multiple launch vehicles, globally distributed launch and flight operations, training, engineering, and development facilities, communications networks, and the international scientific research community.",
    distanceTr: "408 km (Alçak Dünya Yörüngesi)",
    distanceEn: "408 km (Low Earth Orbit)",
    orbitTypeTr: "Dairesel Alçak Yörünge (LEO)",
    orbitTypeEn: "Circular Low Earth Orbit",
    theme: {
      cardBg: "bg-[#081524]/85",
      cardBorder: "border-cyan-400/40",
      cardGlow: "shadow-[0_20px_50px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/20",
      arrowBtn:
        "bg-[#081524]/80 hover:bg-[#0c223a]/90 border-cyan-400/40 hover:border-cyan-300 text-cyan-200 hover:text-white shadow-2xl shadow-cyan-950/60",
      arrowIcon: "text-cyan-300 group-hover:text-cyan-100",
      indicatorBadge: "bg-[#081524]/85 border-cyan-400/40 text-cyan-100 shadow-cyan-950/50",
      indicatorDotActive: "bg-cyan-400 shadow-sm shadow-cyan-400/80",
      headerChip: "bg-[#081524]/80 border-cyan-400/30 text-cyan-300",
      headerBackBtn:
        "bg-[#081524]/80 hover:bg-[#0c223a] border-cyan-400/40 text-cyan-200 hover:text-white shadow-cyan-950/40",
      headerIcon: "text-cyan-400",
      chipBg: "bg-cyan-950/60 border-cyan-400/30 text-cyan-200",
      accentText: "text-cyan-400",
      tagPulse: "bg-cyan-400",
      tagText: "text-cyan-300",
      divider: "border-cyan-900/50",
      primaryBtn:
        "bg-gradient-to-r from-cyan-600 via-blue-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white shadow-[0_12px_35px_rgba(8,145,178,0.55)] hover:shadow-[0_16px_45px_rgba(6,182,212,0.7)] border-cyan-300/40",
      primaryBtnIcon: "text-sky-200",
      primaryBtnArrow: "text-cyan-200",
      infoBtn:
        "bg-[#081524]/85 hover:bg-[#0c223a] border-cyan-400/50 hover:border-cyan-300 text-cyan-300 hover:text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] ring-1 ring-cyan-400/20",
      infoBtnActive:
        "bg-cyan-600 border-cyan-300 text-white shadow-[0_0_35px_rgba(6,182,212,0.7)] ring-2 ring-cyan-200",
      infoIcon: "text-cyan-300 group-hover:text-cyan-100",
      titleColor: "text-cyan-100",
      titleGlow:
        "drop-shadow-[0_0_35px_rgba(6,182,212,0.85)] drop-shadow-[0_4px_18px_rgba(0,0,0,0.95)]",
      title3DClass: "mission-title-iss",
    },
  },
  {
    id: "moon",
    name: "MOON",
    nameTr: "AY GÖREVİ",
    badgeTr: "ARTEMIS & CISLUNAR YÖRÜNGE",
    badgeEn: "ARTEMIS & CISLUNAR ORBIT",
    image: "/images/dest-moon.jpg",
    description:
      "From lighting up our skies to preserving evidence of our solar system’s history, Earth’s closest neighbor plays a pivotal role in the study of our planet and beyond.",
    distanceTr: "384,400 km (Cislunar)",
    distanceEn: "384,400 km (Cislunar)",
    orbitTypeTr: "Ay Yörüngesi & Asteroit Randevusu",
    orbitTypeEn: "Lunar Orbit & Asteroid Rendezvous",
    theme: {
      cardBg: "bg-[#12141a]/90",
      cardBorder: "border-slate-300/40",
      cardGlow: "shadow-[0_20px_50px_rgba(203,213,225,0.2)] ring-1 ring-white/20",
      arrowBtn:
        "bg-[#12141a]/85 hover:bg-[#1e222d]/90 border-slate-300/40 hover:border-white text-slate-200 hover:text-white shadow-2xl shadow-black/60",
      arrowIcon: "text-slate-300 group-hover:text-white",
      indicatorBadge: "bg-[#12141a]/85 border-slate-300/40 text-white shadow-black/50",
      indicatorDotActive: "bg-white shadow-sm shadow-white/80",
      headerChip: "bg-[#12141a]/85 border-slate-400/30 text-slate-200",
      headerBackBtn:
        "bg-[#12141a]/85 hover:bg-[#1e222d] border-slate-300/40 text-slate-200 hover:text-white shadow-black/40",
      headerIcon: "text-slate-300",
      chipBg: "bg-slate-900/80 border-slate-600/40 text-slate-200",
      accentText: "text-slate-200",
      tagPulse: "bg-slate-300",
      tagText: "text-slate-300",
      divider: "border-slate-800",
      primaryBtn:
        "bg-slate-200 hover:bg-white text-slate-950 font-black shadow-[0_12px_35px_rgba(255,255,255,0.35)] hover:shadow-[0_16px_45px_rgba(255,255,255,0.55)] border-white/60",
      primaryBtnIcon: "text-slate-900",
      primaryBtnArrow: "text-slate-900",
      infoBtn:
        "bg-[#12141a]/85 hover:bg-[#1e222d] border-slate-300/50 hover:border-white text-slate-200 hover:text-white shadow-[0_0_25px_rgba(203,213,225,0.25)] ring-1 ring-white/20",
      infoBtnActive:
        "bg-slate-200 border-white text-slate-950 shadow-[0_0_35px_rgba(255,255,255,0.6)] ring-2 ring-white",
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
  lang: "tr" | "en";
  soundOn: boolean;
  onToggleSound: () => void;
  onBack: () => void;
  onSelectDestination: (destId: DestinationId) => void;
}

export default function DestinationSelector({
  playerName,
  lang,
  soundOn,
  onToggleSound,
  onBack,
  onSelectDestination,
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
            {/* Standard <img> with zero downscaling compression for razor-sharp view */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={dest.image}
              alt={`NASA Destination: ${dest.name}`}
              className="w-screen h-screen object-cover select-none"
              style={{ imageRendering: "auto" }}
            />
          </div>
        ))}

        {/* Minimal edge gradients only for header & card contrast (zero dark wash over center image) */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-black/15 to-transparent z-15 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-black/15 to-transparent z-15 pointer-events-none" />
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP FLOATING NAVIGATION & BACK / HUD CONTROLS             */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full px-6 sm:px-12 pt-4 sm:pt-5 pb-2 flex items-center justify-between">
        {/* Left: Back Button & Player Callsign Badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border backdrop-blur-md text-xs font-mono font-bold transition-all duration-500 cursor-pointer active:scale-95 ${t.headerBackBtn}`}
            title={lang === "tr" ? "Geri Dön" : "Back"}
          >
            <ArrowLeft className={`w-4 h-4 transition-colors duration-500 ${t.headerIcon}`} />
            <span>{lang === "tr" ? "GERİ" : "BACK"}</span>
          </button>

          <div
            className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl border backdrop-blur-md text-xs font-mono shadow-md transition-all duration-500 ${t.headerChip}`}
          >
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${t.tagPulse}`} />
            <span className="font-bold uppercase tracking-wider">
              {playerName ? `CMDR: ${playerName}` : "CMDR: NOVA"}
            </span>
          </div>
        </div>

        {/* Center: Slide Dot Indicators in Top Header */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/10 backdrop-blur-md shadow-md">
          {DESTINATIONS.map((dest, idx) => (
            <button
              key={dest.id}
              onClick={() => {
                sounds.playClick(680);
                setCurrentIndex(idx);
              }}
              className={`transition-all duration-500 rounded-full cursor-pointer ${
                idx === currentIndex
                  ? `w-6 h-1.5 ${t.indicatorDotActive}`
                  : "w-1.5 h-1.5 bg-white/40 hover:bg-white/70"
              }`}
              title={dest.name}
            />
          ))}
        </div>

        {/* Right: Sound & Telescope Info */}
        <div className="flex items-center gap-2.5">
          <div
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-md text-[11px] font-mono transition-all duration-500 ${t.headerChip}`}
          >
            <Telescope className={`w-3.5 h-3.5 transition-colors duration-500 ${t.headerIcon}`} />
            <span>NASA ARCHIVE</span>
          </div>

          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border text-xs backdrop-blur-md shadow-md transition-all duration-500 cursor-pointer active:scale-95 ${t.headerBackBtn}`}
            title={soundOn ? "Sesi Kapat / Mute" : "Sesi Aç / Unmute"}
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
      <div className="relative z-30 w-full flex flex-col items-center justify-center px-4 pointer-events-auto mt-2 sm:mt-5 select-none">
        {/* Clean, large floating title directly over the NASA background in Bike Park / 3D Pixel font */}
        <h1
          className={`text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.16em] uppercase transition-all duration-500 font-bikepark ${
            t.title3DClass || `${t.titleColor} ${t.titleGlow}`
          }`}
        >
          {activeDest.name} MISSION
        </h1>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. DYNAMIC ON-SCREEN LEFT & RIGHT CAROUSEL ARROWS             */}
      {/* ───────────────────────────────────────────────────────────── */}
      {/* Left Arrow Button (<) */}
      <button
        onClick={handlePrev}
        className={`fixed left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full border backdrop-blur-md transition-all duration-500 cursor-pointer flex items-center justify-center group ${t.arrowBtn}`}
        aria-label="Önceki / Previous Slide"
        title="Önceki Hedef (Sol Yön Tuşu / Left Arrow)"
      >
        <ChevronLeft
          className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-500 group-hover:-translate-x-0.5 ${t.arrowIcon}`}
        />
      </button>

      {/* Right Arrow Button (>) */}
      <button
        onClick={handleNext}
        className={`fixed right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-14 sm:h-14 rounded-full border backdrop-blur-md transition-all duration-500 cursor-pointer flex items-center justify-center group ${t.arrowBtn}`}
        aria-label="Sonraki / Next Slide"
        title="Sonraki Hedef (Sağ Yön Tuşu / Right Arrow)"
      >
        <ChevronRight
          className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-500 group-hover:translate-x-0.5 ${t.arrowIcon}`}
        />
      </button>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. SLEEK CIRCULAR '?' INFO BUTTON & HOVER/CLICK NASA CARD     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-8 left-16 sm:left-20 z-30"
        onMouseEnter={() => setIsInfoHovered(true)}
        onMouseLeave={() => setIsInfoHovered(false)}
      >
        {/* Revealed Themed NASA Scientific Info Card (smoothly revealed on hover or pinned by click) */}
        <div
          className={`absolute bottom-full left-0 pb-3 transition-all duration-500 origin-bottom-left ${
            isInfoOpen
              ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
              : "opacity-0 scale-95 translate-y-3 pointer-events-none"
          }`}
        >
          <div
            className={`max-w-[calc(100vw-88px)] sm:max-w-xl w-[calc(100vw-88px)] sm:w-[500px] rounded-3xl p-5 sm:p-6 backdrop-blur-xl border space-y-3.5 transition-all duration-500 shadow-2xl ${t.cardBg} ${t.cardBorder} ${t.cardGlow}`}
          >
            {/* Destination Category Badge & Name */}
            <div className={`flex items-center justify-between gap-2 border-b pb-2.5 ${t.divider}`}>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${t.tagPulse}`} />
                <span className={`text-[11px] font-mono font-bold tracking-widest uppercase ${t.tagText}`}>
                  {lang === "tr" ? activeDest.badgeTr : activeDest.badgeEn}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {isInfoPinned && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20">
                    {lang === "tr" ? "SABİTLENDİ" : "PINNED"}
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
                  className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 cursor-pointer"
                  title={lang === "tr" ? "Kapat" : "Close"}
                  aria-label={lang === "tr" ? "Kapat" : "Close"}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>{lang === "tr" ? activeDest.nameTr : `${activeDest.name} MISSION`}</span>
            </h2>

            {/* Exact Official NASA Description */}
            <p className="text-xs sm:text-[13px] text-slate-300 leading-relaxed max-h-36 sm:max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-700">
              {activeDest.description}
            </p>

            {/* Telemetry Chips */}
            <div className={`flex flex-wrap items-center gap-2 pt-1 border-t text-[11px] font-mono ${t.divider}`}>
              <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all duration-500 ${t.chipBg}`}>
                <Orbit className={`w-3.5 h-3.5 transition-colors duration-500 ${t.accentText}`} />
                <span>{lang === "tr" ? activeDest.distanceTr : activeDest.distanceEn}</span>
              </div>

              <div className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all duration-500 ${t.chipBg}`}>
                <Compass className={`w-3.5 h-3.5 transition-colors duration-500 ${t.accentText}`} />
                <span>{lang === "tr" ? activeDest.orbitTypeTr : activeDest.orbitTypeEn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sleek, circular ? (Question Mark) icon button */}
        <button
          type="button"
          onClick={handleTogglePin}
          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border backdrop-blur-md transition-all duration-500 cursor-pointer flex items-center justify-center group active:scale-95 shadow-2xl ${
            isInfoPinned ? t.infoBtnActive : t.infoBtn
          }`}
          aria-label={lang === "tr" ? "NASA Bilgi Kartı (?)" : "NASA Mission Information (?)"}
          title={
            lang === "tr"
              ? isInfoPinned
                ? "Bilgi Kartını Kapat / Sabitlemeyi Kaldır"
                : "NASA Görev Bilgisi (? - Tıkla ve Sabitle)"
              : isInfoPinned
              ? "Close / Unpin Info Card"
              : "NASA Mission Information (? - Click to Pin)"
          }
        >
          <QuestionMark
            className={`w-6 h-6 sm:w-7 sm:h-7 transition-all duration-500 group-hover:scale-110 ${
              isInfoPinned ? "text-inherit" : t.infoIcon
            }`}
            strokeWidth={2.4}
          />
          <span className="sr-only">?</span>
        </button>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 5. DYNAMIC SCI-FI HUD SELECT DESTINATION / LAUNCH BUTTON      */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-4 sm:right-10 z-30">
        <SciFiHudButton
          onClick={handleSelect}
          theme={activeDest.id === "mars" ? "orange" : activeDest.id === "iss" ? "cyan" : "silver"}
          code={`MIS_0${currentIndex + 1}`}
          systemStatus="SYSTEM: ACTIVE"
          size="lg"
        >
          <Rocket className="w-5 h-5 shrink-0" />
          <span>
            {lang === "tr"
              ? "HEDEFİ SEÇ / BAŞLA"
              : "SELECT DESTINATION"}
          </span>
          <ChevronRight className="w-5 h-5 shrink-0" />
        </SciFiHudButton>
      </div>
    </main>
  );
}
