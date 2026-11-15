"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Copy,
  Check,
  Sparkles,
  Trophy,
  Radio,
  UserPlus,
  Play,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ShieldAlert,
} from "lucide-react";
import {
  MultiplayerMissionId,
  MultiplayerRoomState,
  getFinishOrderLabel,
} from "@/lib/multiplayerSync";
import { sounds } from "./SoundEffects";

const MISSION_ROULETTE_CARDS: {
  id: MultiplayerMissionId;
  title: string;
  subtitle: string;
  badge: string;
  image: string;
  accentBorder: string;
  accentText: string;
}[] = [
  {
    id: "iss",
    title: "ISS MISSION",
    subtitle: "408 KM LOW EARTH ORBIT // ORU CARGO & EVA",
    badge: "ORBITAL STATION",
    image: "/images/dest-iss.jpg",
    accentBorder: "border-cyan-400",
    accentText: "text-cyan-300",
  },
  {
    id: "moon",
    title: "MOON MISSION",
    subtitle: "384,400 KM SOUTH POLE // FISSION & ROVER",
    badge: "ARTEMIS LUNAR BASE",
    image: "/images/dest-moon.jpg",
    accentBorder: "border-slate-200",
    accentText: "text-slate-100",
  },
  {
    id: "mars",
    title: "MARS MISSION",
    subtitle: "225M KM JEZERO CRATER // DELAYED ROVER DRILL",
    badge: "INTERPLANETARY",
    image: "/images/dest-mars.jpg",
    accentBorder: "border-orange-500",
    accentText: "text-orange-300",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. MULTIPLAYER CREATE / JOIN LOBBY MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface MultiplayerLobbyModalProps {
  isOpen: boolean;
  initialCallsign: string;
  localPlayerId: string;
  room: MultiplayerRoomState | null;
  errorMsg: string | null;
  onClose: () => void;
  onCreateRoom: (callsign: string) => void;
  onJoinRoom: (callsign: string, roomCode: string) => void;
  onAddTestPlayer: () => void;
  onStartRandomMission: () => void;
  onLeaveRoom: () => void;
}

export function MultiplayerLobbyModal({
  isOpen,
  initialCallsign,
  localPlayerId,
  room,
  errorMsg,
  onClose,
  onCreateRoom,
  onJoinRoom,
  onAddTestPlayer,
  onStartRandomMission,
  onLeaveRoom,
}: MultiplayerLobbyModalProps) {
  const [activeTab, setActiveTab] = useState<"create" | "join">("create");
  const [callsign, setCallsign] = useState<string>(
    initialCallsign && initialCallsign.trim().length >= 2
      ? initialCallsign.trim()
      : "NOVA-01"
  );
  const [joinCode, setJoinCode] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [localValidationError, setLocalValidationError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isHost = room ? room.hostId === localPlayerId : true;
  const playerCount = room ? room.players.length : 0;
  const canStartMission = playerCount >= 2;

  const handleCopyRoomCode = () => {
    if (!room) return;
    sounds.playBlip(820);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(room.roomCode).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCreateSubmit = () => {
    const trimmed = callsign.trim();
    if (trimmed.length < 2) {
      sounds.playAlarm();
      setLocalValidationError("ENTER A CALLSIGN WITH AT LEAST 2 CHARACTERS.");
      return;
    }
    setLocalValidationError(null);
    sounds.playLaunchChord();
    onCreateRoom(trimmed);
  };

  const handleJoinSubmit = () => {
    const trimmedName = callsign.trim();
    const trimmedCode = joinCode.trim().toUpperCase();
    if (trimmedName.length < 2) {
      sounds.playAlarm();
      setLocalValidationError("ENTER A CALLSIGN WITH AT LEAST 2 CHARACTERS.");
      return;
    }
    if (trimmedCode.length < 2) {
      sounds.playAlarm();
      setLocalValidationError("ENTER A 5-CHARACTER ROOM CODE (E.G. NASA-42).");
      return;
    }
    setLocalValidationError(null);
    sounds.playLaunchChord();
    onJoinRoom(trimmedName, trimmedCode);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-cyan-400 shadow-[10px_10px_0px_#000] p-4 sm:p-6 space-y-4 text-slate-100">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-cyan-400/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950 border border-cyan-400">
              <Radio className="w-4 h-4 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <span className="font-silkscreen text-[10px] text-cyan-300 tracking-widest block">
                {`NASA MISSION CONTROL // REAL-TIME MULTIPLAYER SYNC`}
              </span>
              <h2 className="font-press-start text-sm sm:text-base text-white">
                MULTIPLAYER SPACE RACE LOBBY
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sounds.playClick(520);
              if (room) {
                onLeaveRoom();
              } else {
                onClose();
              }
            }}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border-2 border-slate-500 text-slate-200 font-press-start text-[9px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{room ? "[ LEAVE ROOM ]" : "[ BACK TO 1P / HUB ]"}</span>
          </button>
        </div>

        {/* STEP 1: NO ACTIVE ROOM YET -> SHOW [ CREATE ROOM ] / [ JOIN ROOM ] TABS */}
        {!room && (
          <div className="space-y-4">
            {/* Two Tabs: [ CREATE ROOM ] vs [ JOIN ROOM ] */}
            <div className="grid grid-cols-2 gap-2.5 bg-black p-1.5 border-2 border-slate-800">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick(640);
                  setActiveTab("create");
                  setLocalValidationError(null);
                }}
                className={`py-2.5 px-3 font-press-start text-[10px] sm:text-xs border-2 transition-all cursor-pointer ${
                  activeTab === "create"
                    ? "bg-cyan-400 text-slate-950 border-white shadow-[3px_3px_0px_#000]"
                    : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                [ CREATE ROOM ]
              </button>
              <button
                type="button"
                onClick={() => {
                  sounds.playClick(640);
                  setActiveTab("join");
                  setLocalValidationError(null);
                }}
                className={`py-2.5 px-3 font-press-start text-[10px] sm:text-xs border-2 transition-all cursor-pointer ${
                  activeTab === "join"
                    ? "bg-cyan-400 text-slate-950 border-white shadow-[3px_3px_0px_#000]"
                    : "bg-slate-900 text-slate-400 border-slate-700 hover:text-white"
                }`}
              >
                [ JOIN ROOM ]
              </button>
            </div>

            {/* Callsign Input */}
            <div className="space-y-1.5">
              <label className="font-silkscreen text-xs text-cyan-200 uppercase block">
                1. ENTER YOUR ASTRONAUT CALLSIGN:
              </label>
              <input
                type="text"
                value={callsign}
                onChange={(e) => {
                  setCallsign(e.target.value);
                  setLocalValidationError(null);
                }}
                maxLength={16}
                placeholder="e.g. NOVA-01, ORION, ARTEMIS"
                className="w-full px-3.5 py-2.5 bg-black border-2 border-cyan-400/70 focus:border-cyan-300 text-white font-press-start text-xs tracking-wider focus:outline-none shadow-[3px_3px_0px_#000]"
              />
            </div>

            {activeTab === "create" ? (
              <div className="p-4 bg-slate-900/90 border-2 border-cyan-400/50 space-y-3">
                <p className="font-silkscreen text-xs text-slate-200 leading-relaxed">
                  Generates a unique 5-character NASA room code (e.g.,{" "}
                  <strong className="text-cyan-300">NASA-42</strong>) and opens the live
                  Mission Control Waiting Lobby for up to 4 players across browser tabs or
                  devices.
                </p>
                <button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="w-full py-3 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-xs font-bold shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn"
                >
                  [ GENERATE ROOM CODE &amp; OPEN LOBBY &gt; ]
                </button>
              </div>
            ) : (
              <div className="p-4 bg-slate-900/90 border-2 border-cyan-400/50 space-y-3">
                <div className="space-y-1.5">
                  <label className="font-silkscreen text-xs text-cyan-200 uppercase block">
                    2. ENTER 5-CHARACTER ROOM CODE (E.G. NASA-42):
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => {
                      setJoinCode(e.target.value.toUpperCase());
                      setLocalValidationError(null);
                    }}
                    placeholder="NASA-42"
                    maxLength={10}
                    className="w-full px-3.5 py-2.5 bg-black border-2 border-amber-400/80 focus:border-amber-300 text-amber-300 font-press-start text-sm text-center tracking-widest uppercase focus:outline-none shadow-[3px_3px_0px_#000]"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleJoinSubmit}
                  className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 border-2 border-white text-slate-950 font-press-start text-xs font-bold shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn"
                >
                  [ JOIN WAITING LOBBY &gt; ]
                </button>
              </div>
            )}

            {(localValidationError || errorMsg) && (
              <div className="px-3 py-2 bg-rose-950 border-2 border-rose-400 text-rose-200 font-press-start text-[9px] text-center animate-pulse">
                {localValidationError || errorMsg}
              </div>
            )}
          </div>
        )}

        {/* STEP 2: ACTIVE WAITING ROOM LOBBY */}
        {room && (
          <div className="space-y-4">
            {/* Room Code Banner + Copy Button */}
            <div className="p-3.5 bg-black border-2 border-cyan-400 flex flex-wrap items-center justify-between gap-3 shadow-[4px_4px_0px_#000]">
              <div>
                <span className="font-silkscreen text-[10px] text-cyan-300 uppercase block">
                  LIVE ROOM CODE (SHARE WITH SQUAD OR OPEN ANOTHER TAB):
                </span>
                <span className="font-press-start text-lg sm:text-2xl text-amber-300 tracking-widest">
                  {room.roomCode}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyRoomCode}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">COPIED!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-cyan-300" />
                      <span>COPY CODE</span>
                    </>
                  )}
                </button>

                {playerCount < 4 && (
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playBlip(740);
                      onAddTestPlayer();
                    }}
                    className="px-3 py-2 bg-indigo-950 hover:bg-indigo-900 border-2 border-indigo-400 text-indigo-200 font-press-start text-[9px] flex items-center gap-1.5 shadow-[3px_3px_0px_#000] cursor-pointer arcade-btn"
                    title="Add simulated test astronaut for solo testing"
                  >
                    <UserPlus className="w-3.5 h-3.5 text-indigo-300" />
                    <span>[ + ADD LOCAL TEST PLAYER ]</span>
                  </button>
                )}
              </div>
            </div>

            {/* Connected Players List (Up to 4 Players) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between font-silkscreen text-xs text-cyan-200">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>CONNECTED SQUAD ROSTER ({playerCount} / 4 PLAYERS)</span>
                </span>
                <span className="text-amber-300">
                  {canStartMission
                    ? "READY FOR RANDOM MISSION ROULETTE!"
                    : "WAITING FOR 2+ PLAYERS..."}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Array.from({ length: 4 }).map((_, idx) => {
                  const player = room.players[idx];
                  const isMe = player?.id === localPlayerId;
                  return (
                    <div
                      key={player ? player.id : `empty-slot-${idx}`}
                      className={`p-3 border-2 flex items-center justify-between ${
                        player
                          ? isMe
                            ? "bg-cyan-950/70 border-cyan-300 shadow-[3px_3px_0px_#000]"
                            : "bg-slate-900/90 border-emerald-400/70 shadow-[3px_3px_0px_#000]"
                          : "bg-slate-950/60 border-slate-800 border-dashed text-slate-500"
                      }`}
                    >
                      {player ? (
                        <>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-press-start text-[10px] text-white truncate">
                                {`${idx + 1}. ${player.callsign}`}
                              </span>
                              {isMe && (
                                <span className="px-1.5 py-0.5 bg-cyan-400 text-slate-950 font-press-start text-[7px] font-bold">
                                  YOU
                                </span>
                              )}
                              {player.isHost && (
                                <span className="px-1.5 py-0.5 bg-amber-400 text-slate-950 font-press-start text-[7px] font-bold">
                                  HOST
                                </span>
                              )}
                              {player.isBot && (
                                <span className="px-1.5 py-0.5 bg-indigo-500 text-white font-press-start text-[7px]">
                                  AI SIM
                                </span>
                              )}
                            </div>
                            <span className="font-silkscreen text-[10px] text-emerald-300 block mt-0.5">
                              TELEMETRY LINKED // READY
                            </span>
                          </div>
                          <span className="w-2.5 h-2.5 bg-emerald-400 animate-ping shrink-0" />
                        </>
                      ) : (
                        <div className="flex items-center justify-between w-full font-silkscreen text-xs">
                          <span>{`SLOT ${idx + 1} // OPEN CREW SEAT`}</span>
                          <span className="text-[10px] text-slate-600">WAITING...</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Scoring Rules Summary */}
            <div className="p-2.5 bg-slate-900/80 border border-cyan-400/40 font-silkscreen text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
              <span>
                <strong className="text-cyan-300">BASE SCORE:</strong> UP TO 1,000 PTS
              </span>
              <span>
                <strong className="text-amber-300">FINISH SPEED BONUS:</strong> 1ST +150 |
                2ND +100 | 3RD +50 | 4TH +0
              </span>
            </div>

            {/* Start Random Mission Button */}
            {isHost ? (
              <button
                type="button"
                disabled={!canStartMission}
                onClick={() => {
                  sounds.playLaunchChord();
                  onStartRandomMission();
                }}
                className={`w-full py-3.5 px-4 border-2 font-press-start text-xs sm:text-sm font-bold uppercase shadow-[5px_5px_0px_#000] flex items-center justify-center gap-2 transition-all ${
                  canStartMission
                    ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 cursor-pointer arcade-btn animate-pulse"
                    : "bg-slate-900 border-slate-700 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {canStartMission
                    ? "[ START RANDOM MISSION > ]"
                    : "[ NEED 2+ PLAYERS — CLICK '+ ADD LOCAL TEST PLAYER' OR JOIN IN NEW TAB ]"}
                </span>
              </button>
            ) : (
              <div className="p-3 bg-slate-900 border-2 border-amber-400/80 text-center font-press-start text-[10px] text-amber-300 animate-pulse">
                WAITING FOR HOST TO LAUNCH RANDOM MISSION ROULETTE...
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. 3-SECOND 16-BIT MISSION ROULETTE ANIMATION OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
interface MissionRouletteModalProps {
  isOpen: boolean;
  targetMission: MultiplayerMissionId | null;
  roomCode: string;
  onComplete: () => void;
}

export function MissionRouletteModal({
  isOpen,
  targetMission,
  roomCode,
  onComplete,
}: MissionRouletteModalProps) {
  const [highlightIdx, setHighlightIdx] = useState<number>(0);
  const [locked, setLocked] = useState<boolean>(false);
  const [lockedMission, setLockedMission] =
    useState<MultiplayerMissionId | null>(null);

  const chosenMissionRef = useRef<MultiplayerMissionId | null>(targetMission);
  const onCompleteRef = useRef<() => void>(onComplete);

  useEffect(() => {
    if (targetMission) {
      chosenMissionRef.current = targetMission;
    }
  }, [targetMission]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const isSpinning = Boolean(isOpen && targetMission);

  // Deterministic 18-tick (1.8s) spin + 700ms pause (2.5s total) depending ONLY on `isSpinning`
  useEffect(() => {
    if (!isSpinning) return;

    let tick = 0;
    let launchTimeoutId: number | null = null;

    const intervalId = window.setInterval(() => {
      if (tick === 0) {
        setLocked(false);
        setLockedMission(null);
      }
      tick += 1;

      if (tick < 18) {
        setHighlightIdx(tick % MISSION_ROULETTE_CARDS.length);
        sounds.playBlip(520 + (tick % 3) * 110);
      } else {
        window.clearInterval(intervalId);
        const finalMission = chosenMissionRef.current || "iss";
        const winnerIdx = MISSION_ROULETTE_CARDS.findIndex(
          (m) => m.id === finalMission
        );
        setHighlightIdx(winnerIdx >= 0 ? winnerIdx : 0);
        setLockedMission(finalMission);
        setLocked(true);
        sounds.playLaunchChord();

        launchTimeoutId = window.setTimeout(() => {
          onCompleteRef.current();
        }, 700);
      }
    }, 100);

    return () => {
      window.clearInterval(intervalId);
      if (launchTimeoutId !== null) {
        window.clearTimeout(launchTimeoutId);
      }
    };
  }, [isSpinning]);

  if (!isOpen || !targetMission) return null;

  const activeTarget = lockedMission || targetMission;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-amber-400 shadow-[10px_10px_0px_#000] p-5 sm:p-7 space-y-5 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-950 border border-amber-400 text-amber-300 font-press-start text-[9px]">
          <Sparkles className="w-3.5 h-3.5 animate-spin" />
          <span>{`ROOM ${roomCode} // RANDOM MISSION SELECTOR ROULETTE`}</span>
        </div>

        <div
          className={`py-2.5 px-4 border-2 transition-all ${
            locked
              ? "bg-emerald-950/90 border-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.85)]"
              : "bg-slate-900/90 border-amber-400/60"
          }`}
        >
          <h2
            className={`font-press-start text-base sm:text-2xl tracking-wider ${
              locked ? "text-emerald-300" : "text-white"
            }`}
          >
            {locked
              ? `MISSION LOCKED: ${activeTarget.toUpperCase()}`
              : "SELECTING RANDOM DESTINATION..."}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MISSION_ROULETTE_CARDS.map((card, idx) => {
            const isHighlighted = idx === highlightIdx;
            const isWinner = locked && card.id === activeTarget;
            return (
              <div
                key={card.id}
                className={`relative border-2 overflow-hidden transition-all duration-150 ${
                  isWinner
                    ? "border-emerald-400 bg-emerald-950/90 scale-105 shadow-[0_0_30px_rgba(52,211,153,0.95)]"
                    : isHighlighted
                      ? `${card.accentBorder} bg-slate-900 scale-102 shadow-[0_0_20px_rgba(56,189,248,0.75)]`
                      : "border-slate-800 bg-slate-950/60 opacity-45"
                }`}
              >
                <div className="h-36 sm:h-44 w-full overflow-hidden bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={card.image}
                    alt={card.title}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-3 text-left space-y-1">
                  <span className="font-silkscreen text-[9px] text-cyan-300 block">
                    {card.badge}
                  </span>
                  <h3 className="font-press-start text-xs sm:text-sm text-white">
                    {card.title}
                  </h3>
                  <p className="font-silkscreen text-[10px] text-slate-300">
                    {card.subtitle}
                  </p>
                </div>
                {isWinner && (
                  <div className="bg-emerald-400 text-slate-950 font-press-start text-[9px] py-1 font-bold">
                    ★ MISSION LOCKED — LAUNCHING ★
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Manual [ LAUNCH NOW > ] Fallback Button */}
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={() => {
              sounds.playLaunchChord();
              onComplete();
            }}
            className={`px-5 py-2.5 border-2 font-press-start text-[10px] sm:text-xs font-bold shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn ${
              locked
                ? "bg-emerald-400 hover:bg-emerald-300 border-white text-slate-950 animate-pulse"
                : "bg-slate-900 hover:bg-slate-800 border-amber-400/70 text-amber-300"
            }`}
          >
            [ LAUNCH NOW &gt; ]
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. TOP-RIGHT LIVE SQUAD TELEMETRY BAR (SHOWN DURING MULTIPLAYER MATCH)
// ─────────────────────────────────────────────────────────────────────────────
interface LiveSquadTelemetryBarProps {
  room: MultiplayerRoomState | null;
  localPlayerId: string;
}

export function LiveSquadTelemetryBar({
  room,
  localPlayerId,
}: LiveSquadTelemetryBarProps) {
  if (!room || room.status !== "IN_MISSION") return null;

  return (
    <div className="fixed top-[52px] right-3 z-40 w-64 sm:w-72 bg-slate-950/90 border-2 border-cyan-400/90 p-2.5 shadow-[5px_5px_0px_#000] backdrop-blur-md pointer-events-none select-none">
      <div className="flex items-center justify-between border-b border-cyan-400/40 pb-1 mb-1.5">
        <span className="font-press-start text-[8px] text-cyan-300 flex items-center gap-1.5">
          <span className="w-2 h-2 bg-emerald-400 animate-ping" />
          <span>{`LIVE SQUAD // ${room.roomCode}`}</span>
        </span>
        <span className="font-silkscreen text-[9px] text-amber-300">
          {`${room.players.filter((p) => p.phase === "FINISHED ✓").length}/${room.players.length} DONE`}
        </span>
      </div>

      <div className="space-y-1">
        {room.players.map((p) => {
          const isMe = p.id === localPlayerId;
          const isFinished = p.phase === "FINISHED ✓";
          return (
            <div
              key={p.id}
              className={`px-2 py-1 border flex items-center justify-between gap-2 text-[9px] ${
                isFinished
                  ? "bg-emerald-950/90 border-emerald-400 text-emerald-200"
                  : isMe
                    ? "bg-cyan-950/80 border-cyan-400 text-white"
                    : "bg-slate-900/80 border-slate-700 text-slate-300"
              }`}
            >
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-press-start text-[8px] truncate">
                  {p.callsign}
                </span>
                {isMe && (
                  <span className="px-1 bg-cyan-400 text-slate-950 font-press-start text-[6px] font-bold">
                    YOU
                  </span>
                )}
              </div>

              <span
                className={`font-silkscreen text-[9px] shrink-0 font-bold ${
                  isFinished
                    ? "text-emerald-300"
                    : p.phase === "IN PHASE E"
                      ? "text-amber-300"
                      : "text-cyan-300"
                }`}
              >
                {isFinished && p.finishOrder
                  ? `#${p.finishOrder} (${p.totalScore} PTS)`
                  : p.phase}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. EARLY-FINISHER MISSION CONTROL WAITING OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
interface MultiplayerWaitingOverlayProps {
  room: MultiplayerRoomState | null;
  localPlayerId: string;
  onForceEnd: () => void;
}

export function MultiplayerWaitingOverlay({
  room,
  localPlayerId,
  onForceEnd,
}: MultiplayerWaitingOverlayProps) {
  if (!room || room.status !== "IN_MISSION") return null;

  const me = room.players.find((p) => p.id === localPlayerId);
  if (!me || me.phase !== "FINISHED ✓") return null;

  const allDone = room.players.every((p) => p.phase === "FINISHED ✓");
  if (allDone) return null;

  const isHost = room.hostId === localPlayerId;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-950 border-2 border-emerald-400 shadow-[10px_10px_0px_#000] p-5 sm:p-6 space-y-4 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-emerald-400/40 pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <div>
              <span className="font-press-start text-[9px] text-emerald-300 block">
                {`MISSION COMPLETE // ROOM ${room.roomCode}`}
              </span>
              <h2 className="font-press-start text-sm sm:text-base text-white">
                MISSION CONTROL TELEMETRY STANDBY
              </h2>
            </div>
          </div>

          <span className="px-2.5 py-1 bg-amber-950 border border-amber-400 text-amber-300 font-press-start text-[9px]">
            {getFinishOrderLabel(me.finishOrder)}
          </span>
        </div>

        {/* Local Player Earned Score Breakdown */}
        <div className="grid grid-cols-3 gap-2.5 font-silkscreen text-center">
          <div className="p-3 bg-slate-900 border border-cyan-400/60">
            <span className="text-[10px] text-slate-400 block">BASE SCORE</span>
            <strong className="font-press-start text-sm sm:text-base text-cyan-300">
              {me.baseScore} / 1000
            </strong>
          </div>
          <div className="p-3 bg-slate-900 border border-amber-400/60">
            <span className="text-[10px] text-slate-400 block">FINISH BONUS</span>
            <strong className="font-press-start text-sm sm:text-base text-amber-300">
              +{me.finishBonus} PTS
            </strong>
          </div>
          <div className="p-3 bg-emerald-950/80 border-2 border-emerald-400">
            <span className="text-[10px] text-emerald-200 block">TOTAL SCORE</span>
            <strong className="font-press-start text-sm sm:text-base text-white">
              {me.totalScore} PTS
            </strong>
          </div>
        </div>

        {/* Remaining Squad Live Status */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 font-silkscreen text-xs text-cyan-200">
            <Clock className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>WAITING FOR REMAINING SQUAD MEMBERS TO COMPLETE PHASE F...</span>
          </div>

          <div className="space-y-1.5">
            {room.players.map((p) => {
              const isDone = p.phase === "FINISHED ✓";
              return (
                <div
                  key={p.id}
                  className={`p-2.5 border-2 flex items-center justify-between ${
                    isDone
                      ? "bg-emerald-950/70 border-emerald-400"
                      : "bg-slate-900 border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-press-start text-[10px] text-white">
                      {p.callsign}
                    </span>
                    <span className="font-silkscreen text-[10px] text-slate-400">
                      ({p.chosenStrategy})
                    </span>
                  </div>
                  <span
                    className={`font-press-start text-[9px] ${
                      isDone ? "text-emerald-300" : "text-amber-300 animate-pulse"
                    }`}
                  >
                    {isDone
                      ? `${getFinishOrderLabel(p.finishOrder)} • ${p.totalScore} PTS`
                      : p.phase}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {isHost && (
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                sounds.playLaunchChord();
                onForceEnd();
              }}
              className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 border-2 border-white text-slate-950 font-press-start text-[9px] sm:text-[10px] font-bold flex items-center gap-1.5 shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>[ FORCE END &amp; SHOW RESULTS &gt; ]</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. SYNCHRONIZED 16-BIT NASA SPACE RACE PODIUM & LEADERBOARD MODAL
// ─────────────────────────────────────────────────────────────────────────────
interface MultiplayerPodiumModalProps {
  room: MultiplayerRoomState | null;
  localPlayerId: string;
  onPlayNextRandomMission: () => void;
  onLeaveRoom: () => void;
}

export function MultiplayerPodiumModal({
  room,
  localPlayerId,
  onPlayNextRandomMission,
  onLeaveRoom,
}: MultiplayerPodiumModalProps) {
  if (!room || room.status !== "PODIUM") return null;

  const sortedPlayers = [...room.players].sort((a, b) => {
    if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore;
    return (a.finishOrder ?? 99) - (b.finishOrder ?? 99);
  });

  const missionTitle =
    room.selectedMission === "iss"
      ? "ISS ORBITAL MISSION"
      : room.selectedMission === "moon"
        ? "ARTEMIS LUNAR SOUTH POLE MISSION"
        : "MARS JEZERO CRATER SAMPLE MISSION";

  const podiumColors = [
    {
      badge: "1ST // GOLD",
      border: "border-amber-300",
      bg: "bg-amber-950/85",
      text: "text-amber-300",
    },
    {
      badge: "2ND // SILVER",
      border: "border-slate-300",
      bg: "bg-slate-800/90",
      text: "text-slate-200",
    },
    {
      badge: "3RD // BRONZE",
      border: "border-orange-400",
      bg: "bg-orange-950/80",
      text: "text-orange-300",
    },
    {
      badge: "4TH // CREW",
      border: "border-cyan-500/60",
      bg: "bg-slate-900/90",
      text: "text-cyan-300",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-950 border-2 border-amber-400 shadow-[10px_10px_0px_#000] p-4 sm:p-6 space-y-5 text-slate-100 my-auto">
        {/* Top Podium Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-400/40 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-950 border-2 border-amber-400">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-silkscreen text-[10px] text-amber-300 uppercase block">
                {`ROOM ${room.roomCode} // ${missionTitle}`}
              </span>
              <h2 className="font-press-start text-sm sm:text-lg text-white">
                NASA SPACE RACE PODIUM &amp; LEADERBOARD
              </h2>
            </div>
          </div>

          <span className="px-3 py-1 bg-emerald-950 border border-emerald-400 text-emerald-300 font-press-start text-[9px]">
            ALL TELEMETRY VERIFIED ✓
          </span>
        </div>

        {/* Top 3 / 4 Podium Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {sortedPlayers.map((player, idx) => {
            const style = podiumColors[idx] || podiumColors[3];
            const isMe = player.id === localPlayerId;
            return (
              <div
                key={player.id}
                className={`p-3.5 border-2 ${style.border} ${style.bg} shadow-[4px_4px_0px_#000] flex flex-col justify-between space-y-2`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-press-start text-[9px] font-bold ${style.text}`}>
                    {style.badge}
                  </span>
                  <span className="px-1.5 py-0.5 bg-black/80 border border-white/30 font-press-start text-[8px] text-emerald-300">
                    {`GRADE ${player.grade}`}
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-press-start text-xs text-white truncate">
                      {player.callsign}
                    </span>
                    {isMe && (
                      <span className="px-1 py-0.5 bg-cyan-400 text-slate-950 font-press-start text-[7px] font-bold">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="font-silkscreen text-[10px] text-slate-300 block truncate mt-0.5">
                    {player.chosenStrategy}
                  </span>
                </div>

                <div className="pt-2 border-t border-white/15 flex items-baseline justify-between">
                  <span className="font-silkscreen text-[10px] text-slate-300">
                    {`${player.baseScore} + ${player.finishBonus}`}
                  </span>
                  <strong className="font-press-start text-sm text-amber-300">
                    {player.totalScore} PTS
                  </strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detailed Breakdown Table */}
        <div className="overflow-x-auto border-2 border-cyan-400/60 bg-slate-900/90">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-cyan-400/50 bg-slate-950 font-press-start text-[8px] sm:text-[9px] text-cyan-300">
                <th className="py-2.5 px-3">RANK</th>
                <th className="py-2.5 px-3">CALLSIGN</th>
                <th className="py-2.5 px-3">CHOSEN STRATEGY</th>
                <th className="py-2.5 px-3">BASE SCORE</th>
                <th className="py-2.5 px-3">FINISH BONUS</th>
                <th className="py-2.5 px-3">TOTAL SCORE</th>
                <th className="py-2.5 px-3">GRADE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-silkscreen text-xs">
              {sortedPlayers.map((p, idx) => {
                const isMe = p.id === localPlayerId;
                return (
                  <tr
                    key={p.id}
                    className={
                      isMe ? "bg-cyan-950/50 text-white" : "text-slate-200"
                    }
                  >
                    <td className="py-2.5 px-3 font-press-start text-[9px] text-amber-300">
                      #{idx + 1}
                    </td>
                    <td className="py-2.5 px-3 font-press-start text-[9px]">
                      {p.callsign} {isMe ? "(YOU)" : ""}
                    </td>
                    <td className="py-2.5 px-3 text-cyan-200">
                      {p.chosenStrategy}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-white">
                      {p.baseScore} / 1000
                    </td>
                    <td className="py-2.5 px-3 font-bold text-emerald-300">
                      {`+${p.finishBonus} PTS (${
                        p.finishOrder === 1
                          ? "1ST"
                          : p.finishOrder === 2
                            ? "2ND"
                            : p.finishOrder === 3
                              ? "3RD"
                              : `${p.finishOrder || 4}TH`
                      })`}
                    </td>
                    <td className="py-2.5 px-3 font-press-start text-[10px] text-amber-300">
                      {p.totalScore} PTS
                    </td>
                    <td className="py-2.5 px-3 font-press-start text-[10px] text-emerald-300">
                      {p.grade}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom Actions: [ PLAY NEXT RANDOM MISSION ] and [ LEAVE ROOM ] */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={() => {
              sounds.playClick(540);
              onLeaveRoom();
            }}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border-2 border-rose-400 text-rose-200 font-press-start text-[10px] shadow-[4px_4px_0px_#000] cursor-pointer arcade-btn"
          >
            [ LEAVE ROOM ]
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playLaunchChord();
              onPlayNextRandomMission();
            }}
            className="px-5 py-3 bg-emerald-400 hover:bg-emerald-300 border-2 border-white text-slate-950 font-press-start text-[10px] sm:text-xs font-bold shadow-[5px_5px_0px_#000] cursor-pointer arcade-btn animate-pulse"
          >
            [ PLAY NEXT RANDOM MISSION &gt; ]
          </button>
        </div>
      </div>
    </div>
  );
}
