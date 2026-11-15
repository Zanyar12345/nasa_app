"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  ChevronRight,
  Telescope,
  User,
  Users,
  ArrowLeft,
  Dice5,
  Copy,
  Check,
  Radio,
  Compass,
} from "lucide-react";
import NasaInfoModal from "./NasaInfoModal";
import { sounds } from "./SoundEffects";
import SciFiHudButton from "./SciFiHudButton";

interface LandingScreenProps {
  onStartSolo: (playerName: string) => void;
  onStartCoop: (playerName: string) => void;
  soundOn: boolean;
  onToggleSound: () => void;
}

export default function LandingScreen({
  onStartSolo,
  onStartCoop,
  soundOn,
  onToggleSound,
}: LandingScreenProps) {
  // Panel state: "title" (initial view) -> "setup" (player name & mode select) -> "multiplayer" (lobby)
  const [panelView, setPanelView] = useState<"title" | "setup" | "multiplayer">("title");
  const [playerName, setPlayerName] = useState<string>("");
  const [nameError, setNameError] = useState<string>("");
  const [roomCode] = useState<string>("NASA-2026");
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [joinCodeInput, setJoinCodeInput] = useState<string>("");
  const [multiplayerTab, setMultiplayerTab] = useState<"create" | "join">("create");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  const CALLSIGNS = [
    "Nova",
    "Orion",
    "Artemis",
    "Phoenix",
    "Astra",
    "Polaris",
    "Kepler",
    "Cosmo",
    "Discovery",
    "Endeavour",
    "Apollo",
    "Vanguard",
    "Gemini",
    "Echo",
  ];

  const handleStartClick = () => {
    sounds.playNextStep();
    setPanelView("setup");
  };

  const handleBackToTitle = () => {
    sounds.playBlip(520);
    setPanelView("title");
    setNameError("");
  };

  const handleBackToSetup = () => {
    sounds.playBlip(520);
    setPanelView("setup");
  };

  const handleRandomCallsign = () => {
    sounds.playBlip(720);
    const randomBase = CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];
    const randomSuffix = Math.floor(10 + Math.random() * 89);
    setPlayerName(`${randomBase}-${randomSuffix}`);
    setNameError("");
  };

  const handleSelectSolo = () => {
    const trimmed = playerName.trim();
    if (trimmed.length < 2) {
      sounds.playAlarm();
      setNameError("Please enter a callsign with at least 2 characters.");
      return;
    }
    sounds.playLaunchChord();
    onStartSolo(trimmed);
  };

  const handleSelectMultiplayer = () => {
    const trimmed = playerName.trim();
    sounds.playBlip(680);
    onStartCoop(trimmed.length >= 2 ? trimmed : "NOVA-01");
  };

  const handleLaunchCoop = () => {
    sounds.playLaunchChord();
    onStartCoop(playerName.trim() || "Commander");
  };

  const handleCopyCode = () => {
    sounds.playBlip(800);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(roomCode);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenInfo = () => {
    sounds.playBlip(780);
    setIsInfoModalOpen(true);
  };

  const handleCloseInfo = () => {
    sounds.playClick(440);
    setIsInfoModalOpen(false);
  };

  const isNameValid = playerName.trim().length >= 2;

  return (
    <main className="relative w-screen h-screen min-h-[600px] overflow-hidden select-none bg-slate-950 font-sans">
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. FULL-SCREEN NASA SPACE PHOTOGRAPH BACKGROUND               */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/nasa-bg.jpg"
          alt="NASA James Webb & Hubble Galaxy NGC 4258"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.98] contrast-[1.04]"
        />

        {/* Subtle, non-intrusive edge vignette to guarantee effortless readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0) 35%, rgba(15, 23, 42, 0.42) 75%, rgba(2, 6, 23, 0.78) 100%)",
          }}
        />

        {/* Soft edge gradients for clean readability */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Subtle CRT Scanline Retro Arcade Monitor Overlay */}
      <div className="fixed inset-0 crt-overlay z-40 pointer-events-none" />

      {/* ───────────────────────────────────────────────────────────── */}
      {/* TOP FLOATING HEADER HUD                                       */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full px-6 sm:px-12 py-5 flex items-center justify-between">
        {/* Left: NASA Space Apps Challenge 2026 Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-none sm:rounded-sm bg-slate-950/90 border-2 border-sky-400/80 backdrop-blur-md shadow-[3px_3px_0px_#000]">
            <span className="w-2 h-2 rounded-none bg-sky-400 animate-pulse" />
            <span className="text-[11px] font-silkscreen font-bold tracking-wider text-slate-200 uppercase">
              NASA Space Apps 2026
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-none sm:rounded-sm bg-blue-950/80 border-2 border-blue-500/50 backdrop-blur-md text-[11px] font-silkscreen text-blue-300 shadow-[3px_3px_0px_#000]">
            <Telescope className="w-3.5 h-3.5 text-blue-400" />
            <span>JWST • Chandra • Hubble</span>
          </div>
        </div>

        {/* Right: Sound Toggle (Language Switcher Removed - English Locked) */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleSound}
            className="p-2 rounded-none sm:rounded-sm bg-slate-950/90 hover:bg-slate-800 border-2 border-white/30 text-slate-200 text-xs backdrop-blur-md shadow-[3px_3px_0px_#000] transition-all cursor-pointer arcade-btn"
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
      {/* MAIN VIEWPORT: ASYMMETRIC CHARACTER (LEFT) & DYNAMIC RIGHT    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 w-full h-[calc(100vh-80px)] flex flex-col lg:flex-row items-center justify-between px-6 sm:px-12 lg:px-16 pointer-events-none">
        {/* ── LEFT SIDE: VERTICALLY CENTERED PROMINENT CHARACTER SPRITE ── */}
        <div className="w-full lg:w-1/2 h-full flex flex-col items-center justify-center relative pointer-events-none my-auto">
          {/* Character Sprite Container with Idle Breathing Float and Ambient Rim Glow */}
          <div className="relative animate-idle-float flex items-center justify-center">
            <div className="absolute -inset-6 bg-gradient-to-t from-sky-500/25 via-blue-500/15 to-transparent blur-3xl rounded-none pointer-events-none" />

            {/* Standard <img> with strict natural aspect ratio & sharp pixelated rendering */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/character.png"
              alt="Space Mission Commander Nova"
              className="relative w-auto h-[48vh] sm:h-[58vh] lg:h-[65vh] max-h-[680px] max-w-[85vw] lg:max-w-none object-contain aspect-auto filter drop-shadow-[0_25px_40px_rgba(0,0,0,0.85)] drop-shadow-[0_0_25px_rgba(56,189,248,0.25)] select-none pointer-events-none pixelated"
              style={{
                width: "auto",
                height: "65vh",
                maxHeight: "680px",
                maxWidth: "85vw",
                objectFit: "contain",
                imageRendering: "pixelated",
              }}
            />
          </div>
        </div>

        {/* ── RIGHT SIDE: DYNAMIC PANEL (TITLE -> SETUP -> MULTIPLAYER) ── */}
        <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-end justify-center text-center lg:text-right pointer-events-auto my-auto py-4">
          {/* VIEW 1: INITIAL TITLE & PRIMARY CONTROLS */}
          {panelView === "title" && (
            <div className="w-full max-w-xl flex flex-col items-center lg:items-end space-y-6 animate-in fade-in duration-300">
              {/* Retro Arcade Game Title */}
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-white leading-tight font-press-start drop-shadow-[4px_4px_0px_#000]">
                  <span className="block text-sky-400">ASTRO</span>
                  <span className="block text-amber-300">SPECIALIST</span>
                </h1>
              </div>

              {/* Action Buttons Column: Prominent START Button + Distanced INFO on the Right */}
              <div className="w-full sm:w-80 flex flex-col items-center lg:items-end gap-3 pt-2">
                {/* 1. PROMINENT SCI-FI HUD [ START JOURNEY ] BUTTON */}
                <div className="w-full flex justify-center py-1">
                  <SciFiHudButton
                    onClick={handleStartClick}
                    theme="cyan"
                    code="MIS_01"
                    systemStatus="SYSTEM: ACTIVE"
                    size="lg"
                    className="w-full"
                  >
                    <span>START JOURNEY</span>
                  </SciFiHudButton>
                </div>

                {/* 2. NASA PHOTO INFO BUTTON: Below START button with generous separation and on the right */}
                <div className="w-full flex justify-center lg:justify-end pt-8 sm:pt-12">
                  <button
                    type="button"
                    onClick={handleOpenInfo}
                    className="px-4 py-2.5 rounded-none bg-slate-950/90 hover:bg-[#061e2e] border-2 border-sky-400/80 hover:border-sky-300 text-sky-200 hover:text-white font-silkscreen text-[11px] sm:text-xs tracking-wider shadow-[4px_4px_0px_#000] arcade-btn flex items-center gap-2 cursor-pointer backdrop-blur-md transition-all"
                    title="NASA Space Photo Info"
                  >
                    <Telescope className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span>NASA PHOTO INFO</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: POST-START PLAYER SETUP CARD */}
          {panelView === "setup" && (
            <div className="w-full max-w-md bg-slate-950/95 text-slate-100 border-2 border-sky-400 rounded-none sm:rounded-sm p-5 sm:p-6 shadow-[8px_8px_0px_#000] backdrop-blur-xl space-y-3.5 animate-in fade-in duration-200 text-left">
              {/* Card Header */}
              <div className="space-y-1 pb-2.5 border-b-2 border-slate-800">
                <div className="flex items-center gap-2 text-sky-400 text-xs font-silkscreen font-bold tracking-widest uppercase">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <span>ASTRONAUT REGISTRATION</span>
                </div>
                <h3 className="text-base sm:text-lg font-press-start text-white tracking-tight">
                  INITIALIZE MISSION
                </h3>
                <p className="text-xs text-slate-400 font-pixel">
                  Enter your callsign and select your game mode:
                </p>
              </div>

              {/* 1. Player Name Input with Random Callsign Generator */}
              <div className="space-y-1.5">
                <label className="text-xs font-silkscreen font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Astronaut Callsign</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    Min. 2 chars
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => {
                        setPlayerName(e.target.value);
                        if (nameError) setNameError("");
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && isNameValid) {
                          handleSelectSolo();
                        }
                      }}
                      maxLength={18}
                      placeholder="e.g. Nova, Orion, Artemis"
                      className={`w-full py-2.5 px-3.5 rounded-none bg-black/90 border-2 text-sm font-silkscreen font-semibold text-white placeholder-slate-500 focus:outline-none transition-all shadow-[3px_3px_0px_#000] ${
                        nameError
                          ? "border-red-500 focus:border-red-400"
                          : "border-slate-700 focus:border-sky-400"
                      }`}
                    />
                  </div>

                  {/* Random NASA Callsign Generator Button */}
                  <button
                    type="button"
                    onClick={handleRandomCallsign}
                    title="Generate Random Callsign"
                    className="p-2.5 rounded-none bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-sky-400 text-slate-300 hover:text-sky-300 transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-[3px_3px_0px_#000] arcade-btn"
                  >
                    <Dice5 className="w-5 h-5" />
                  </button>
                </div>

                {nameError && (
                  <p className="text-xs text-red-400 font-silkscreen font-medium animate-in fade-in">
                    {nameError}
                  </p>
                )}
              </div>

              {/* 2. Prominent Mode Selection Buttons with Expanded Safe Spacing & Zero Collision */}
              <div className="pt-2">
                <div className="flex flex-col gap-7 sm:gap-8">
                  {/* Mode Button 1: 1P SOLO */}
                  <div className="w-full">
                    <SciFiHudButton
                      onClick={handleSelectSolo}
                      disabled={!isNameValid}
                      theme="cyan"
                      code="SOLO_01"
                      systemStatus="MODE: 1P SOLO"
                      size="md"
                      className="w-full py-2"
                      showTelemetryBlock={false}
                      showBottomStatus={false}
                    >
                      <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-cyan-300 shrink-0" />
                        <span>[ 1P SOLO ]</span>
                      </div>
                    </SciFiHudButton>
                  </div>

                  {/* Mode Button 2: MULTIPLAYER */}
                  <div className="w-full">
                    <SciFiHudButton
                      onClick={handleSelectMultiplayer}
                      theme="cyan"
                      code="COOP_02"
                      systemStatus="MODE: MULTIPLAYER"
                      size="md"
                      className="w-full py-2"
                      showTelemetryBlock={false}
                      showBottomStatus={false}
                    >
                      <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-cyan-300 shrink-0" />
                        <span>[ MULTIPLAYER ]</span>
                      </div>
                    </SciFiHudButton>
                  </div>
                </div>
              </div>

              {/* 3. Subtle Back Button to Return to Initial View */}
              <div className="pt-2.5 border-t-2 border-slate-800 flex items-center justify-between font-silkscreen">
                <button
                  type="button"
                  onClick={handleBackToTitle}
                  className="px-3 py-1.5 rounded-none text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center gap-1.5 arcade-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Title</span>
                </button>

                <span className="text-[10px] text-slate-500">
                  Step 1 / 2
                </span>
              </div>
            </div>
          )}

          {/* VIEW 3: MULTIPLAYER LOBBY CARD (ROOM CREATE / JOIN) */}
          {panelView === "multiplayer" && (
            <div className="w-full max-w-md bg-slate-950/95 text-slate-100 border-2 border-indigo-500 rounded-none sm:rounded-sm p-6 sm:p-7 shadow-[8px_8px_0px_#000] backdrop-blur-xl space-y-5 animate-in fade-in duration-200 text-left">
              {/* Header */}
              <div className="space-y-1.5 pb-3 border-b-2 border-slate-800">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-silkscreen font-bold tracking-widest uppercase">
                  <Radio className="w-4 h-4 text-indigo-400" />
                  <span>CREW LOBBY</span>
                </div>
                <h3 className="text-base sm:text-lg font-press-start text-white tracking-tight">
                  CO-OP MISSION ROOM
                </h3>
                <p className="text-xs text-slate-400 font-pixel">
                  Connect with your crew and assign mission roles:
                </p>
              </div>

              {/* Tab Selector: Create Room vs Join Room */}
              <div className="flex rounded-none bg-black p-1 border-2 border-slate-800 shadow-[2px_2px_0px_#000]">
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(600);
                    setMultiplayerTab("create");
                  }}
                  className={`flex-1 py-2 rounded-none text-xs font-silkscreen font-bold transition-all cursor-pointer ${
                    multiplayerTab === "create"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Host Room
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick(600);
                    setMultiplayerTab("join");
                  }}
                  className={`flex-1 py-1.5 rounded-none text-xs font-silkscreen font-bold transition-all cursor-pointer ${
                    multiplayerTab === "join"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Join Room
                </button>
              </div>

              {multiplayerTab === "create" ? (
                <div className="space-y-4">
                  {/* Generated Room Code Display */}
                  <div className="p-3.5 rounded-none bg-black border-2 border-slate-700 flex items-center justify-between shadow-[3px_3px_0px_#000]">
                    <div>
                      <span className="text-[10px] font-silkscreen text-slate-400 uppercase block">
                        Room Code
                      </span>
                      <span className="text-base sm:text-lg font-press-start tracking-widest text-sky-400">
                        {roomCode}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="px-3 py-1.5 rounded-none bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-silkscreen border-2 border-slate-700 flex items-center gap-1.5 cursor-pointer transition-colors shadow-[2px_2px_0px_#000] arcade-btn"
                    >
                      {copiedCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">COPIED</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-400" />
                          <span>COPY</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Crew Slots */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-silkscreen text-slate-400 uppercase block">
                      Crew Roster (1/4 Ready):
                    </span>

                    <div className="space-y-1.5 font-silkscreen text-xs">
                      <div className="p-2.5 rounded-none bg-indigo-950/60 border border-indigo-500/60 flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-2">
                          <span>👑</span>
                          <span>{playerName.trim() || "Commander"} (You)</span>
                        </span>
                        <span className="text-[9px] font-press-start text-emerald-400 bg-emerald-500/20 px-2 py-0.5 border border-emerald-500/40">
                          READY
                        </span>
                      </div>

                      <div className="p-2.5 rounded-none bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-400">
                        <span>2. ISRU Mining Specialist</span>
                        <span className="text-[9px] font-press-start text-slate-500">WAITING...</span>
                      </div>

                      <div className="p-2.5 rounded-none bg-slate-950/60 border border-slate-800 flex items-center justify-between text-slate-400">
                        <span>3. Thermal & Power Operator</span>
                        <span className="text-[9px] font-press-start text-slate-500">WAITING...</span>
                      </div>
                    </div>
                  </div>

                  {/* Launch Co-op Button */}
                  <div className="w-full flex justify-center pt-2">
                    <SciFiHudButton
                      onClick={handleLaunchCoop}
                      theme="cyan"
                      code="COOP_01"
                      systemStatus="CREW: READY"
                      size="md"
                      className="w-full"
                    >
                      <span>LAUNCH WITH CREW</span>
                    </SciFiHudButton>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-silkscreen text-slate-400 uppercase block">
                      Enter Room Code:
                    </label>
                    <input
                      type="text"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                      placeholder="NASA-XXXX"
                      maxLength={10}
                      className="w-full py-3 px-4 rounded-none bg-black border-2 border-slate-700 text-center text-sm font-press-start tracking-widest text-sky-400 focus:outline-none focus:border-sky-400 shadow-[3px_3px_0px_#000] uppercase"
                    />
                  </div>

                  <div className="w-full flex justify-center pt-1">
                    <SciFiHudButton
                      onClick={handleLaunchCoop}
                      theme="cyan"
                      code="JOIN_01"
                      systemStatus="LOBBY: READY"
                      size="md"
                      className="w-full"
                      showTelemetryBlock={false}
                    >
                      <span>CONNECT & LAUNCH</span>
                      <ChevronRight className="w-4 h-4 shrink-0" />
                    </SciFiHudButton>
                  </div>
                </div>
              )}

              {/* Back to Setup Button */}
              <div className="pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleBackToSetup}
                  className="px-3 py-1.5 rounded-none text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer flex items-center gap-1.5 arcade-btn"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Back to Setup</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. NASA PHOTO SCIENTIFIC INFO MODAL                           */}
      {/* ───────────────────────────────────────────────────────────── */}
      <NasaInfoModal
        isOpen={isInfoModalOpen}
        onClose={handleCloseInfo}
      />
    </main>
  );
}
