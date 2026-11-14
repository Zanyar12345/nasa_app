"use client";

import React, { useState } from "react";
import { sounds } from "./SoundEffects";
import { Sparkles } from "lucide-react";

interface GuideCharacterProps {
  currentStep: number;
  lang: "tr" | "en";
}

export default function GuideCharacter({ currentStep, lang }: GuideCharacterProps) {
  const [isStriking, setIsStriking] = useState(false);

  const handleCharacterClick = () => {
    setIsStriking(true);
    sounds.playLaunchChord();
    setTimeout(() => setIsStriking(false), 900);
  };

  return (
    <div className="relative flex flex-col items-center justify-center select-none group">
      {/* Interactive Character Container */}
      <div
        onClick={handleCharacterClick}
        className="relative cursor-pointer transition-transform duration-300 hover:scale-[1.02] active:scale-[0.98]"
        title={
          lang === "tr"
            ? "Astro-Mühendis Nova ile konuşmak ve çiviyi tınlatmak için tıkla!"
            : "Click to speak with Astro-Engineer Nova and chime the needle!"
        }
      >
        {/* Storybook Status Badge Floating Above */}
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-4 py-1.5 bg-white/95 backdrop-blur-md border border-slate-300 rounded-full shadow-lg text-[11px] font-semibold tracking-wider text-slate-800 whitespace-nowrap">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600 shadow-sm shadow-blue-400" />
          </span>
          <span className="font-bold tracking-tight text-slate-900">
            {lang === "tr" ? "Astro-Mühendis Nova" : "Astro-Engineer Nova"}
          </span>
          <span className="text-slate-300 text-[10px]">|</span>
          <span className="text-blue-600 font-mono text-[10px] tracking-widest uppercase flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {lang === "tr" ? "GÖREV REHBERİ" : "MISSION GUIDE"}
          </span>
        </div>

        {/* Needle Slash / Gold Spark Effect on Click */}
        {isStriking && (
          <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center overflow-visible">
            <div className="w-[120%] h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent rotate-[-35deg] transform scale-125 animate-ping" />
            <div className="absolute inset-0 rounded-[36px] border-2 border-blue-500/80 animate-ping" />
            <div className="absolute w-24 h-24 rounded-full bg-amber-400/20 blur-md animate-ping" />
          </div>
        )}

        {/* Crisp Storybook Illustration Frame */}
        <div className="relative w-76 sm:w-84 md:w-92 h-[410px] sm:h-[450px] rounded-[32px] overflow-hidden p-2.5 bg-white border-2 border-slate-300 shadow-[0_12px_40px_rgba(15,23,42,0.08)] ring-1 ring-blue-500/10">
          
          {/* Architectural Blueprint Corner Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-blue-600/70 z-20 pointer-events-none" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-blue-600/70 z-20 pointer-events-none" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-blue-600/70 z-20 pointer-events-none" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-blue-600/70 z-20 pointer-events-none" />

          {/* Top Center Blueprint Crest */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-3 py-0.5 bg-white border border-slate-200 rounded-full shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span className="text-[9px] font-mono font-bold tracking-widest text-slate-700 uppercase">
              NASA ISRU EXPEDITION
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          </div>

          {/* ───────── 2D HAND-DRAWN STORYBOOK SPRITE CANVAS ───────── */}
          <div className="relative w-full h-full rounded-[24px] overflow-hidden bg-gradient-to-b from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center border border-slate-200">
            
            {/* Subtle blueprint grid in illustration background */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 450">
              <line x1="0" y1="100" x2="400" y2="100" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="200" x2="400" y2="200" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="0" y1="300" x2="400" y2="300" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="100" y1="0" x2="100" y2="450" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="200" y1="0" x2="200" y2="450" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="300" y1="0" x2="300" y2="450" stroke="#2563EB" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            {/* Hand-Crafted In-Game Sprite: Team Cherry Style Astronaut */}
            <div className="relative w-full h-full flex items-center justify-center animate-silk-breathe">
              <svg
                viewBox="0 0 400 450"
                className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(15,23,42,0.18)]"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Silk Cloak Shadow Gradient */}
                  <linearGradient id="cloakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#E11D48" />
                    <stop offset="60%" stopColor="#BE123C" />
                    <stop offset="100%" stopColor="#881337" />
                  </linearGradient>

                  <linearGradient id="cloakShade" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#9F1239" />
                    <stop offset="100%" stopColor="#4C0519" />
                  </linearGradient>

                  <linearGradient id="maskGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="70%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>

                  <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#F8FAFC" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>

                  <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" />
                    <stop offset="50%" stopColor="#D97706" />
                    <stop offset="100%" stopColor="#78350F" />
                  </linearGradient>

                  <linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="50%" stopColor="#FFFFFF" />
                    <stop offset="100%" stopColor="#94A3B8" />
                  </linearGradient>

                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* ── 1. CELESTIAL NEEDLE (STRAIGHT THROUGH BACK) ── */}
                <g id="celestial-needle" transform="rotate(-24 200 240)">
                  <path
                    d="M 200 30 L 208 340 L 200 390 L 192 340 Z"
                    fill="url(#needleGrad)"
                    stroke="#0F172A"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                  />
                  <line x1="200" y1="50" x2="200" y2="360" stroke="#64748B" strokeWidth="1.5" />
                  <circle cx="200" cy="55" r="5" fill="#0F172A" />
                  <path
                    d="M 200 55 C 220 70, 240 120, 215 160 C 190 200, 250 240, 230 300"
                    stroke="#D97706"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    filter="url(#goldGlow)"
                  />
                </g>

                {/* ── 2. ASTRONAUT LIFE SUPPORT BACKPACK ── */}
                <g id="life-support-tank">
                  <rect
                    x="115"
                    y="220"
                    width="42"
                    height="85"
                    rx="12"
                    fill="#1E293B"
                    stroke="#0F172A"
                    strokeWidth="4"
                  />
                  <rect x="115" y="245" width="42" height="12" fill="url(#brassGrad)" stroke="#0F172A" strokeWidth="2" />
                  <path d="M 125 305 Q 136 325 147 305 Z" fill="#0284C7" opacity="0.9" />

                  {/* Ribbed oxygen tube */}
                  <path
                    d="M 130 230 C 120 190, 150 270, 185 270"
                    fill="none"
                    stroke="#0F172A"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M 130 230 C 120 190, 150 270, 185 270"
                    fill="none"
                    stroke="#94A3B8"
                    strokeWidth="5"
                    strokeDasharray="3 3"
                    strokeLinecap="round"
                  />
                </g>

                {/* ── 3. QUILTED EVA ASTRONAUT SUIT ── */}
                <g id="astronaut-suit">
                  <path
                    d="M 145 280 C 140 370, 145 440, 145 450 L 255 450 C 255 440, 260 370, 255 280 Z"
                    fill="url(#suitGrad)"
                    stroke="#0F172A"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />
                  <line x1="160" y1="360" x2="240" y2="400" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="240" y1="360" x2="160" y2="400" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="165" y1="400" x2="235" y2="440" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" />
                  <line x1="235" y1="400" x2="165" y2="440" stroke="#64748B" strokeWidth="1.5" strokeDasharray="4 3" />

                  <path
                    d="M 148 290 C 125 320, 115 365, 120 410 C 130 415, 150 405, 155 385 C 150 350, 155 310, 155 290 Z"
                    fill="#CBD5E1"
                    stroke="#0F172A"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="132" cy="395" rx="14" ry="7" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />

                  <path
                    d="M 252 290 C 275 320, 285 365, 280 410 C 270 415, 250 405, 245 385 C 250 350, 245 310, 245 290 Z"
                    fill="#94A3B8"
                    stroke="#0F172A"
                    strokeWidth="4"
                    strokeLinejoin="round"
                  />
                  <ellipse cx="268" cy="395" rx="14" ry="7" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
                </g>

                {/* ── 4. SILKSONG CRIMSON TRAVELER CLOAK ── */}
                <g id="silksong-cloak">
                  <path
                    d="M 130 240 C 110 320, 95 380, 105 450 L 295 450 C 305 380, 290 320, 270 240 Z"
                    fill="url(#cloakShade)"
                    stroke="#0F172A"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M 200 215 
                       C 180 220, 140 240, 125 270 
                       C 115 295, 125 330, 135 360 
                       L 165 330 
                       L 180 375 
                       L 200 320 
                       L 220 375 
                       L 235 330 
                       L 265 360 
                       C 275 330, 285 295, 275 270 
                       C 260 240, 220 220, 200 215 Z"
                    fill="url(#cloakGrad)"
                    stroke="#0F172A"
                    strokeWidth="4.5"
                    strokeLinejoin="round"
                  />

                  <path d="M 170 240 Q 155 290 145 340" stroke="#4C0519" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 230 240 Q 245 290 255 340" stroke="#4C0519" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <path d="M 200 235 L 200 315" stroke="#4C0519" strokeWidth="3" fill="none" strokeLinecap="round" />

                  {/* Brass Regulator Pin */}
                  <g id="brass-regulator" transform="translate(200, 260)">
                    <circle cx="0" cy="0" r="16" fill="url(#brassGrad)" stroke="#0F172A" strokeWidth="3" />
                    <circle cx="0" cy="0" r="11" fill="#0F172A" stroke="#0F172A" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="9" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 3" fill="none" opacity="0.8" />
                    <line x1="0" y1="0" x2="5" y2="-6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="0" cy="0" r="2.5" fill="#F8FAFC" />
                  </g>
                </g>

                {/* ── 5. PORCELAIN INSECTOID ASTRONAUT HELMET / MASK ── */}
                <g id="astronaut-mask">
                  <ellipse cx="200" cy="225" rx="45" ry="15" fill="#4C0519" opacity="0.4" />

                  <path
                    d="M 200 195 
                       C 160 195, 140 170, 138 135 
                       C 136 100, 148 70, 125 32
                       C 118 20, 110 12, 102 5
                       C 122 10, 145 28, 155 55
                       C 165 80, 175 105, 185 115
                       C 192 110, 208 110, 215 115
                       C 225 105, 235 80, 245 55
                       C 255 28, 278 10, 298 5
                       C 290 12, 282 20, 275 32
                       C 252 70, 264 100, 262 135
                       C 260 170, 240 195, 200 195 Z"
                    fill="url(#maskGrad)"
                    stroke="#0F172A"
                    strokeWidth="5"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />

                  <path
                    d="M 148 150 C 145 175, 170 192, 200 192 C 230 192, 255 175, 252 150 C 238 170, 162 170, 148 150 Z"
                    fill="#CBD5E1"
                    opacity="0.85"
                  />

                  {/* Left Void Eye */}
                  <g id="left-eye">
                    <path
                      d="M 166 135 C 160 148, 165 172, 176 174 C 188 176, 192 155, 186 140 C 182 132, 172 128, 166 135 Z"
                      fill="#0F172A"
                      stroke="#0F172A"
                      strokeWidth="3.5"
                    />
                    <ellipse cx="178" cy="147" rx="3.5" ry="6" fill="#F8FAFC" opacity="0.9" transform="rotate(-15 178 147)" />
                    <circle cx="174" cy="160" r="1.5" fill="#0284C7" opacity="0.9" />
                  </g>

                  {/* Right Void Eye */}
                  <g id="right-eye">
                    <path
                      d="M 234 135 C 240 148, 235 172, 224 174 C 212 176, 208 155, 214 140 C 218 132, 228 128, 234 135 Z"
                      fill="#0F172A"
                      stroke="#0F172A"
                      strokeWidth="3.5"
                    />
                    <ellipse cx="222" cy="147" rx="3.5" ry="6" fill="#F8FAFC" opacity="0.9" transform="rotate(15 222 147)" />
                    <circle cx="226" cy="160" r="1.5" fill="#0284C7" opacity="0.9" />
                  </g>
                </g>
              </svg>
            </div>

            {/* Step-Adaptive Status Pill at bottom of frame */}
            <div className="absolute bottom-3 inset-x-3 z-20 flex items-center justify-between px-3.5 py-1.5 rounded-xl bg-white/95 border border-slate-300 shadow-sm backdrop-blur-md">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span className="text-[10px] font-mono font-bold tracking-wider text-slate-700 uppercase">
                  {currentStep === 1 && (lang === "tr" ? "AY ACİL DURUM: AKTİF" : "LUNAR DISTRESS: ACTIVE")}
                  {currentStep === 2 && (lang === "tr" ? "ASTEROİT DENGE: GEREKLİ" : "ASTEROID ISRU: TARGETED")}
                  {currentStep === 3 && (lang === "tr" ? "DÖNÜŞ ROTASI: HAZIR" : "RETURN READY: PREPARED")}
                </span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Soft shadow below */}
      <div className="w-48 sm:w-56 h-3 bg-slate-400/20 rounded-full blur-[8px] mt-2 animate-zero-g-shadow" />

      {/* Interactive Hint */}
      <p className="mt-2 text-xs text-slate-600 font-medium tracking-tight flex items-center gap-1.5">
        <span className="text-blue-600">✦</span>
        <span>
          {lang === "tr"
            ? "Tavsiye ve çan akoru için Nova'ya tıkla"
            : "Click Nova for advice and chime chord"}
        </span>
        <span className="text-blue-600">✦</span>
      </p>
    </div>
  );
}
