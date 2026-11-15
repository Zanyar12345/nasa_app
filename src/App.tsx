"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import LandingScreen from "@/components/LandingScreen";
import DestinationSelector, {
  DestinationId,
} from "@/components/DestinationSelector";
import IssMission from "@/components/IssMission";
import MarsMission from "@/components/MarsMission";
import MoonMission from "@/components/MoonMission";
import {
  MultiplayerMissionId,
  MultiplayerRoomState,
  PlayerProgressPhase,
  createMultiplayerRoom,
  joinMultiplayerRoom,
  addLocalTestPlayer,
  startMissionRoulette,
  markRouletteCompleteAndStartMission,
  updatePlayerMissionProgress,
  recordPlayerMissionFinish,
  forceEndMissionAndShowPodium,
  resetRoomToLobbyForNextRound,
  subscribeToRoomUpdates,
} from "@/lib/multiplayerSync";
import {
  MultiplayerLobbyModal,
  MissionRouletteModal,
  LiveSquadTelemetryBar,
  MultiplayerWaitingOverlay,
  MultiplayerPodiumModal,
} from "@/components/MultiplayerOverlay";

export default function App() {
  const [currentView, setCurrentView] = useState<
    "landing" | "destination" | "mission"
  >("landing");
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>("Commander");
  const [missionMode, setMissionMode] = useState<"solo" | "multiplayer">("solo");
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationId>("mars");

  // Multiplayer State
  const [localPlayerId] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const existing = window.sessionStorage.getItem("nasa_mp_player_id");
      if (existing) return existing;
      const created = `astro_${Date.now()}_${Math.floor(100 + Math.random() * 899)}`;
      window.sessionStorage.setItem("nasa_mp_player_id", created);
      return created;
    }
    return "astro_local";
  });

  const [isLobbyModalOpen, setIsLobbyModalOpen] = useState<boolean>(false);
  const [mpRoom, setMpRoom] = useState<MultiplayerRoomState | null>(null);
  const [mpError, setMpError] = useState<string | null>(null);
  const [missionInstanceKey, setMissionInstanceKey] = useState<number>(1);
  const hasRecordedFinishRef = useRef<boolean>(false);

  const mpRoomRef = useRef<MultiplayerRoomState | null>(null);
  const chosenMissionRef = useRef<MultiplayerMissionId | null>(null);
  const prevRoomStatusRef = useRef<MultiplayerRoomState["status"] | null>(null);

  const syncRoomState = useCallback((updatedRoom: MultiplayerRoomState) => {
    mpRoomRef.current = updatedRoom;
    if (updatedRoom.selectedMission) {
      chosenMissionRef.current = updatedRoom.selectedMission;
    }
    setMpRoom(updatedRoom);
    const prevStatus = prevRoomStatusRef.current;
    prevRoomStatusRef.current = updatedRoom.status;

    if (updatedRoom.status === "IN_MISSION" && updatedRoom.selectedMission) {
      setMissionMode("multiplayer");
      setSelectedDestination(updatedRoom.selectedMission);
      setIsLobbyModalOpen(false);
      if (prevStatus !== "IN_MISSION") {
        hasRecordedFinishRef.current = false;
        setMissionInstanceKey((prev) => prev + 1);
        setCurrentView("mission");
      }
    } else if (updatedRoom.status === "WAITING") {
      hasRecordedFinishRef.current = false;
      setIsLobbyModalOpen(true);
    }
  }, []);

  // Subscribe to real-time updates for active room
  useEffect(() => {
    if (!mpRoom?.roomCode) return;
    const unsubscribe = subscribeToRoomUpdates(mpRoom.roomCode, (updatedRoom) => {
      syncRoomState(updatedRoom);
    });
    return () => unsubscribe();
  }, [mpRoom?.roomCode, syncRoomState]);

  // Simulated AI Crew progression when host adds local test players via [ + ADD LOCAL TEST PLAYER ]
  useEffect(() => {
    if (
      !mpRoom ||
      mpRoom.status !== "IN_MISSION" ||
      mpRoom.hostId !== localPlayerId
    ) {
      return;
    }

    const bots = mpRoom.players.filter(
      (p) => p.isBot && p.phase !== "FINISHED ✓"
    );
    if (bots.length === 0) return;

    const timer = window.setInterval(() => {
      const targetBot = bots[Math.floor(Math.random() * bots.length)];
      if (!targetBot) return;

      const phaseOrder: PlayerProgressPhase[] = [
        "IN PHASE A",
        "IN PHASE B/C",
        "IN PHASE D",
        "IN PHASE E",
        "FINISHED ✓",
      ];
      const currentIdx = phaseOrder.indexOf(targetBot.phase);
      const nextPhase =
        phaseOrder[Math.min(phaseOrder.length - 1, Math.max(0, currentIdx + 1))];

      const botStrategies =
        mpRoom.selectedMission === "iss"
          ? ["4x4 DRAGON ORU + EVA", "S-BAND RELAY EVA"]
          : mpRoom.selectedMission === "moon"
            ? ["NUCLEAR REACTOR", "SOLAR PANELS"]
            : ["PERSEVERANCE", "CURIOSITY"];
      const chosenStrat =
        botStrategies[Math.floor(Math.random() * botStrategies.length)];

      if (nextPhase === "FINISHED ✓") {
        const simulatedScore = Math.floor(760 + Math.random() * 210);
        const updated = recordPlayerMissionFinish(
          mpRoom.roomCode,
          targetBot.id,
          simulatedScore,
          chosenStrat
        );
        if (updated) setMpRoom(updated);
      } else {
        const updated = updatePlayerMissionProgress(
          mpRoom.roomCode,
          targetBot.id,
          nextPhase,
          chosenStrat
        );
        if (updated) setMpRoom(updated);
      }
    }, 6500);

    return () => window.clearInterval(timer);
  }, [mpRoom, localPlayerId]);

  // 1P Solo Handlers
  const handleStartSolo = (name: string) => {
    setPlayerName(name);
    setMissionMode("solo");
    setMpRoom(null);
    setIsLobbyModalOpen(false);
    setCurrentView("destination");
  };

  // Open Multiplayer Lobby Modal
  const handleOpenMultiplayer = (name?: string) => {
    if (name && name.trim().length >= 2) {
      setPlayerName(name.trim());
    }
    setMpError(null);
    setIsLobbyModalOpen(true);
  };

  const handleCreateRoom = (callsign: string) => {
    setPlayerName(callsign);
    setMpError(null);
    const created = createMultiplayerRoom(localPlayerId, callsign);
    syncRoomState(created);
  };

  const handleJoinRoom = (callsign: string, code: string) => {
    setPlayerName(callsign);
    setMpError(null);
    const res = joinMultiplayerRoom(code, localPlayerId, callsign);
    if (res.error || !res.room) {
      setMpError(res.error || "UNABLE TO JOIN ROOM.");
      return;
    }
    syncRoomState(res.room);
  };

  const handleAddTestPlayer = () => {
    if (!mpRoom) return;
    const updated = addLocalTestPlayer(mpRoom.roomCode);
    if (updated) syncRoomState(updated);
  };

  const handleStartRandomMission = () => {
    if (!mpRoom) return;
    hasRecordedFinishRef.current = false;
    const chosenMissionUpper = (["ISS", "MOON", "MARS"] as const)[
      Math.floor(Math.random() * 3)
    ];
    const chosenMission =
      chosenMissionUpper.toLowerCase() as MultiplayerMissionId;
    chosenMissionRef.current = chosenMission;
    const updated = startMissionRoulette(mpRoom.roomCode, chosenMission);
    if (updated) syncRoomState(updated);
  };

  const handleRouletteComplete = useCallback(() => {
    const activeRoom = mpRoomRef.current;
    if (!activeRoom) return;
    const updated = markRouletteCompleteAndStartMission(activeRoom.roomCode);
    if (updated) syncRoomState(updated);
  }, [syncRoomState]);

  const handleLeaveRoom = () => {
    setMpRoom(null);
    setMissionMode("solo");
    setIsLobbyModalOpen(false);
    hasRecordedFinishRef.current = false;
    if (currentView === "mission") {
      setCurrentView("destination");
    }
  };

  const handlePlayNextRandomMission = () => {
    if (!mpRoom) return;
    hasRecordedFinishRef.current = false;
    const updated = resetRoomToLobbyForNextRound(mpRoom.roomCode);
    if (updated) {
      setMpRoom(updated);
      setCurrentView("destination");
      setIsLobbyModalOpen(true);
    }
  };

  const handleForceEndMultiplayer = () => {
    if (!mpRoom) return;
    const updated = forceEndMissionAndShowPodium(mpRoom.roomCode);
    if (updated) setMpRoom(updated);
  };

  // Callbacks passed to IssMission / MoonMission / MarsMission
  const handleMissionPhaseProgress = useCallback(
    (phaseLabel: PlayerProgressPhase, strategyLabel?: string) => {
      if (missionMode !== "multiplayer" || !mpRoom) return;
      const updated = updatePlayerMissionProgress(
        mpRoom.roomCode,
        localPlayerId,
        phaseLabel,
        strategyLabel
      );
      if (updated) setMpRoom(updated);
    },
    [missionMode, mpRoom, localPlayerId]
  );

  const handleMissionComplete = useCallback(
    (baseScore1000: number, strategyLabel: string) => {
      if (missionMode !== "multiplayer" || !mpRoom) return;
      if (hasRecordedFinishRef.current) return;
      hasRecordedFinishRef.current = true;
      const updated = recordPlayerMissionFinish(
        mpRoom.roomCode,
        localPlayerId,
        baseScore1000,
        strategyLabel
      );
      if (updated) setMpRoom(updated);
    },
    [missionMode, mpRoom, localPlayerId]
  );

  const handleSelectDestination = (destId: DestinationId) => {
    setSelectedDestination(destId);
    if (destId === "iss" || destId === "mars" || destId === "moon") {
      setMissionInstanceKey((prev) => prev + 1);
      setCurrentView("mission");
    }
  };

  const handleBackToLandingFromDest = () => {
    setCurrentView("landing");
  };

  const handleBackFromMission = () => {
    if (missionMode === "multiplayer" && mpRoom) {
      handleLeaveRoom();
      return;
    }
    setCurrentView("destination");
  };

  const handleToggleSound = () => {
    setSoundOn((prev) => !prev);
  };

  return (
    <>
      {currentView === "landing" && (
        <LandingScreen
          onStartSolo={handleStartSolo}
          onStartCoop={(name) => handleOpenMultiplayer(name)}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
        />
      )}

      {currentView === "destination" && (
        <DestinationSelector
          playerName={playerName}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          onBack={handleBackToLandingFromDest}
          onSelectDestination={handleSelectDestination}
          onOpenMultiplayer={() => handleOpenMultiplayer(playerName)}
        />
      )}

      {currentView === "mission" && (
        <>
          {selectedDestination === "mars" && (
            <MarsMission
              key={`mars-${missionInstanceKey}`}
              playerName={playerName}
              soundOn={soundOn}
              onToggleSound={handleToggleSound}
              onAbort={handleBackFromMission}
              onPhaseProgress={handleMissionPhaseProgress}
              onMissionComplete={handleMissionComplete}
            />
          )}

          {selectedDestination === "moon" && (
            <MoonMission
              key={`moon-${missionInstanceKey}`}
              playerName={playerName}
              soundOn={soundOn}
              onToggleSound={handleToggleSound}
              onAbort={handleBackFromMission}
              onPhaseProgress={handleMissionPhaseProgress}
              onMissionComplete={handleMissionComplete}
            />
          )}

          {selectedDestination === "iss" && (
            <IssMission
              key={`iss-${missionInstanceKey}`}
              playerName={playerName}
              soundOn={soundOn}
              onToggleSound={handleToggleSound}
              onAbort={handleBackFromMission}
              onPhaseProgress={handleMissionPhaseProgress}
              onMissionComplete={handleMissionComplete}
            />
          )}
        </>
      )}

      {/* ───────────────────────────────────────────────────────────────── */}
      {/* REAL-TIME MULTIPLAYER LOBBY, ROULETTE, LIVE HUD & PODIUM MODALS   */}
      {/* ───────────────────────────────────────────────────────────────── */}
      <MultiplayerLobbyModal
        isOpen={isLobbyModalOpen && mpRoom?.status !== "ROULETTE" && mpRoom?.status !== "PODIUM"}
        initialCallsign={playerName}
        localPlayerId={localPlayerId}
        room={mpRoom}
        errorMsg={mpError}
        onClose={() => setIsLobbyModalOpen(false)}
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onAddTestPlayer={handleAddTestPlayer}
        onStartRandomMission={handleStartRandomMission}
        onLeaveRoom={handleLeaveRoom}
      />

      <MissionRouletteModal
        isOpen={mpRoom?.status === "ROULETTE"}
        targetMission={mpRoom?.selectedMission || null}
        roomCode={mpRoom?.roomCode || "NASA-00"}
        onComplete={handleRouletteComplete}
      />

      <LiveSquadTelemetryBar
        room={missionMode === "multiplayer" ? mpRoom : null}
        localPlayerId={localPlayerId}
      />

      <MultiplayerWaitingOverlay
        room={missionMode === "multiplayer" ? mpRoom : null}
        localPlayerId={localPlayerId}
        onForceEnd={handleForceEndMultiplayer}
      />

      <MultiplayerPodiumModal
        room={mpRoom}
        localPlayerId={localPlayerId}
        onPlayNextRandomMission={handlePlayNextRandomMission}
        onLeaveRoom={handleLeaveRoom}
      />
    </>
  );
}
