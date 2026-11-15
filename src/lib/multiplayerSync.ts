"use client";

export type MultiplayerMissionId = "iss" | "moon" | "mars";

export type PlayerProgressPhase =
  | "LOBBY"
  | "IN PHASE A"
  | "IN PHASE B/C"
  | "IN PHASE D"
  | "IN PHASE E"
  | "FINISHED ✓";

export interface MultiplayerPlayer {
  id: string;
  callsign: string;
  isHost: boolean;
  isBot?: boolean;
  phase: PlayerProgressPhase;
  chosenStrategy: string;
  baseScore: number; // 0..1000 PTS
  finishOrder: number | null; // 1, 2, 3, 4
  finishBonus: number; // +150, +100, +50, +0
  totalScore: number; // baseScore + finishBonus
  grade: "S" | "A" | "B";
  finishedAt: number | null;
}

export interface MultiplayerRoomState {
  roomCode: string;
  hostId: string;
  status: "WAITING" | "ROULETTE" | "IN_MISSION" | "PODIUM";
  selectedMission: MultiplayerMissionId | null;
  rouletteStartedAt: number | null;
  missionStartedAt: number | null;
  players: MultiplayerPlayer[];
  updatedAt: number;
}

const STORAGE_PREFIX = "nasa_astro_mp_room_";
const CHANNEL_NAME = "nasa_astro_arcade_mp_channel_v1";

export function generateRoomCode(): string {
  const num = Math.floor(10 + Math.random() * 90);
  return `NASA-${num}`;
}

export function normalizeRoomCode(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
  if (!cleaned) return "";
  if (cleaned.startsWith("NASA-")) return cleaned;
  if (/^\d{2,4}$/.test(cleaned)) return `NASA-${cleaned}`;
  return cleaned;
}

export function getFinishOrderBonus(order: number): number {
  if (order === 1) return 150;
  if (order === 2) return 100;
  if (order === 3) return 50;
  return 0;
}

export function getFinishOrderLabel(order: number | null): string {
  if (order === 1) return "1ST FINISHER (+150 PTS)";
  if (order === 2) return "2ND FINISHER (+100 PTS)";
  if (order === 3) return "3RD FINISHER (+50 PTS)";
  if (order && order >= 4) return `${order}TH FINISHER (+0 PTS)`;
  return "IN PROGRESS";
}

export function computeNasaGrade(totalScore: number): "S" | "A" | "B" {
  if (totalScore >= 950) return "S";
  if (totalScore >= 800) return "A";
  return "B";
}

export function getRoomFromStorage(roomCode: string): MultiplayerRoomState | null {
  if (typeof window === "undefined") return null;
  try {
    const key = `${STORAGE_PREFIX}${normalizeRoomCode(roomCode)}`;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as MultiplayerRoomState;
  } catch {
    return null;
  }
}

export function saveRoomToStorage(room: MultiplayerRoomState): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${STORAGE_PREFIX}${normalizeRoomCode(room.roomCode)}`;
    const nextRoom: MultiplayerRoomState = {
      ...room,
      updatedAt: Date.now(),
    };
    window.localStorage.setItem(key, JSON.stringify(nextRoom));
    broadcastRoomUpdate(nextRoom);
  } catch {}
}

let sharedChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return null;
  }
  if (!sharedChannel) {
    try {
      sharedChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch {
      sharedChannel = null;
    }
  }
  return sharedChannel;
}

export function broadcastRoomUpdate(room: MultiplayerRoomState): void {
  const ch = getBroadcastChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: "ROOM_SYNC",
        room,
      });
    } catch {}
  }
}

export function broadcastRouletteStart(
  roomCode: string,
  chosenMission: "ISS" | "MOON" | "MARS",
  room: MultiplayerRoomState
): void {
  const ch = getBroadcastChannel();
  if (ch) {
    try {
      ch.postMessage({
        type: "ROULETTE_START",
        roomCode: normalizeRoomCode(roomCode),
        chosenMission,
        room,
      });
    } catch {}
  }
}

export function subscribeToRoomUpdates(
  roomCode: string,
  onUpdate: (room: MultiplayerRoomState) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const normalized = normalizeRoomCode(roomCode);
  const storageKey = `${STORAGE_PREFIX}${normalized}`;
  let lastUpdatedAt = 0;

  const deliverIfNew = (incoming: MultiplayerRoomState) => {
    if (incoming.updatedAt && incoming.updatedAt <= lastUpdatedAt) {
      return;
    }
    lastUpdatedAt = incoming.updatedAt || Date.now();
    onUpdate(incoming);
  };

  const handleBroadcast = (ev: MessageEvent) => {
    if (!ev.data) return;
    if (
      (ev.data.type === "ROOM_SYNC" || ev.data.type === "ROULETTE_START") &&
      ev.data.room &&
      normalizeRoomCode(ev.data.room.roomCode) === normalized
    ) {
      deliverIfNew(ev.data.room as MultiplayerRoomState);
    }
  };

  const handleStorage = (ev: StorageEvent) => {
    if (ev.key === storageKey && ev.newValue) {
      try {
        const parsed = JSON.parse(ev.newValue) as MultiplayerRoomState;
        deliverIfNew(parsed);
      } catch {}
    }
  };

  let localChannel: BroadcastChannel | null = null;
  if (typeof BroadcastChannel !== "undefined") {
    try {
      localChannel = new BroadcastChannel(CHANNEL_NAME);
      localChannel.addEventListener("message", handleBroadcast);
    } catch {}
  }

  window.addEventListener("storage", handleStorage);

  // Poll every 450ms as a rock-solid fallback across windows/iframes, only firing when updatedAt changes
  const pollTimer = window.setInterval(() => {
    const latest = getRoomFromStorage(normalized);
    if (latest) {
      deliverIfNew(latest);
    }
  }, 450);

  return () => {
    if (localChannel) {
      try {
        localChannel.removeEventListener("message", handleBroadcast);
        localChannel.close();
      } catch {}
    }
    window.removeEventListener("storage", handleStorage);
    window.clearInterval(pollTimer);
  };
}

export function createMultiplayerRoom(
  hostId: string,
  hostCallsign: string,
  customCode?: string
): MultiplayerRoomState {
  const roomCode = customCode ? normalizeRoomCode(customCode) : generateRoomCode();
  const hostPlayer: MultiplayerPlayer = {
    id: hostId,
    callsign: hostCallsign.trim() || "Commander",
    isHost: true,
    isBot: false,
    phase: "LOBBY",
    chosenStrategy: "PENDING SELECTION",
    baseScore: 0,
    finishOrder: null,
    finishBonus: 0,
    totalScore: 0,
    grade: "B",
    finishedAt: null,
  };

  const room: MultiplayerRoomState = {
    roomCode,
    hostId,
    status: "WAITING",
    selectedMission: null,
    rouletteStartedAt: null,
    missionStartedAt: null,
    players: [hostPlayer],
    updatedAt: Date.now(),
  };

  saveRoomToStorage(room);
  return room;
}

export function joinMultiplayerRoom(
  roomCode: string,
  playerId: string,
  callsign: string
): { room: MultiplayerRoomState | null; error?: string } {
  const normalized = normalizeRoomCode(roomCode);
  if (!normalized) {
    return { room: null, error: "PLEASE ENTER A VALID 5-CHARACTER ROOM CODE (E.G. NASA-42)." };
  }

  const existing = getRoomFromStorage(normalized);
  if (!existing) {
    // Allow joining any valid formatted code even across isolated contexts by initializing the shared room
    const fallbackRoom = createMultiplayerRoom(playerId, callsign, normalized);
    return { room: fallbackRoom };
  }

  const alreadyIn = existing.players.find((p) => p.id === playerId);
  if (alreadyIn) {
    const updatedPlayers = existing.players.map((p) =>
      p.id === playerId ? { ...p, callsign: callsign.trim() || p.callsign } : p
    );
    const updated = { ...existing, players: updatedPlayers };
    saveRoomToStorage(updated);
    return { room: updated };
  }

  if (existing.players.length >= 4) {
    return { room: null, error: "ROOM IS FULL (MAXIMUM 4 ASTRONAUTS PER SQUAD)." };
  }

  const newPlayer: MultiplayerPlayer = {
    id: playerId,
    callsign: callsign.trim() || `Astro-${existing.players.length + 1}`,
    isHost: false,
    isBot: false,
    phase: existing.status === "IN_MISSION" ? "IN PHASE A" : "LOBBY",
    chosenStrategy: "PENDING SELECTION",
    baseScore: 0,
    finishOrder: null,
    finishBonus: 0,
    totalScore: 0,
    grade: "B",
    finishedAt: null,
  };

  const updated: MultiplayerRoomState = {
    ...existing,
    players: [...existing.players, newPlayer],
  };

  saveRoomToStorage(updated);
  return { room: updated };
}

const TEST_BOT_NAMES = ["ORION-07", "ARTEMIS-03", "KEPLER-09", "VEGA-11"];

export function addLocalTestPlayer(
  roomCode: string
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing || existing.players.length >= 4) return existing;

  const usedNames = new Set(existing.players.map((p) => p.callsign.toUpperCase()));
  const botName =
    TEST_BOT_NAMES.find((n) => !usedNames.has(n)) ||
    `ASTRO-BOT-${existing.players.length + 1}`;

  const botPlayer: MultiplayerPlayer = {
    id: `bot_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    callsign: botName,
    isHost: false,
    isBot: true,
    phase: "LOBBY",
    chosenStrategy: "AUTO TELEMETRY",
    baseScore: 0,
    finishOrder: null,
    finishBonus: 0,
    totalScore: 0,
    grade: "B",
    finishedAt: null,
  };

  const updated: MultiplayerRoomState = {
    ...existing,
    players: [...existing.players, botPlayer],
  };
  saveRoomToStorage(updated);
  return updated;
}

export function startMissionRoulette(
  roomCode: string,
  chosenMission?: MultiplayerMissionId
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing) return null;

  const pool: MultiplayerMissionId[] = ["iss", "moon", "mars"];
  const selectedMission =
    chosenMission || pool[Math.floor(Math.random() * pool.length)];

  const resetPlayers: MultiplayerPlayer[] = existing.players.map((p) => ({
    ...p,
    phase: "IN PHASE A",
    chosenStrategy:
      selectedMission === "iss"
        ? "ORU CARGO + EVA"
        : selectedMission === "moon"
          ? "NUCLEAR REACTOR"
          : "PERSEVERANCE ROVER",
    baseScore: 0,
    finishOrder: null,
    finishBonus: 0,
    totalScore: 0,
    grade: "B",
    finishedAt: null,
  }));

  const updated: MultiplayerRoomState = {
    ...existing,
    status: "ROULETTE",
    selectedMission,
    rouletteStartedAt: Date.now(),
    missionStartedAt: null,
    players: resetPlayers,
    updatedAt: Date.now(),
  };
  saveRoomToStorage(updated);
  broadcastRouletteStart(
    roomCode,
    selectedMission.toUpperCase() as "ISS" | "MOON" | "MARS",
    updated
  );
  return updated;
}

export function markRouletteCompleteAndStartMission(
  roomCode: string
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing) return null;
  if (existing.status === "IN_MISSION" || existing.status === "PODIUM") {
    return existing;
  }

  const updated: MultiplayerRoomState = {
    ...existing,
    status: "IN_MISSION",
    missionStartedAt: Date.now(),
  };
  saveRoomToStorage(updated);
  return updated;
}

export function updatePlayerMissionProgress(
  roomCode: string,
  playerId: string,
  phase: PlayerProgressPhase,
  chosenStrategy?: string
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing) return null;

  const updatedPlayers = existing.players.map((p) => {
    if (p.id !== playerId) return p;
    // Never downgrade a player who already finished
    if (p.phase === "FINISHED ✓" && phase !== "FINISHED ✓") return p;
    return {
      ...p,
      phase,
      chosenStrategy: chosenStrategy || p.chosenStrategy,
    };
  });

  const updated: MultiplayerRoomState = {
    ...existing,
    players: updatedPlayers,
  };
  saveRoomToStorage(updated);
  return updated;
}

export function recordPlayerMissionFinish(
  roomCode: string,
  playerId: string,
  rawBaseScore: number,
  chosenStrategy?: string
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing) return null;

  const clampedBase = Math.max(100, Math.min(1000, Math.round(rawBaseScore)));

  // Count how many players have already finished
  const alreadyFinishedCount = existing.players.filter(
    (p) => p.finishOrder !== null && p.id !== playerId
  ).length;

  const updatedPlayers = existing.players.map((p) => {
    if (p.id !== playerId) return p;
    const order = p.finishOrder ?? alreadyFinishedCount + 1;
    const bonus = getFinishOrderBonus(order);
    const total = clampedBase + bonus;
    return {
      ...p,
      phase: "FINISHED ✓" as PlayerProgressPhase,
      chosenStrategy: chosenStrategy || p.chosenStrategy,
      baseScore: clampedBase,
      finishOrder: order,
      finishBonus: bonus,
      totalScore: total,
      grade: computeNasaGrade(total),
      finishedAt: p.finishedAt ?? Date.now(),
    };
  });

  const allFinished = updatedPlayers.every((p) => p.phase === "FINISHED ✓");

  const updated: MultiplayerRoomState = {
    ...existing,
    status: allFinished ? "PODIUM" : existing.status,
    players: updatedPlayers,
  };

  saveRoomToStorage(updated);
  return updated;
}

export function forceEndMissionAndShowPodium(
  roomCode: string
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing) return null;

  let nextOrder =
    existing.players.filter((p) => p.finishOrder !== null).length + 1;

  const finalizedPlayers = existing.players.map((p) => {
    if (p.phase === "FINISHED ✓" && p.finishOrder !== null) {
      return p;
    }
    const order = nextOrder++;
    const estimatedBase =
      p.baseScore > 0
        ? p.baseScore
        : p.phase === "IN PHASE E"
          ? 820
          : p.phase === "IN PHASE D"
            ? 710
            : p.phase === "IN PHASE B/C"
              ? 620
              : 540;
    const bonus = getFinishOrderBonus(order);
    const total = estimatedBase + bonus;
    return {
      ...p,
      phase: "FINISHED ✓" as PlayerProgressPhase,
      baseScore: estimatedBase,
      finishOrder: order,
      finishBonus: bonus,
      totalScore: total,
      grade: computeNasaGrade(total),
      finishedAt: Date.now(),
    };
  });

  const updated: MultiplayerRoomState = {
    ...existing,
    status: "PODIUM",
    players: finalizedPlayers,
  };
  saveRoomToStorage(updated);
  return updated;
}

export function resetRoomToLobbyForNextRound(
  roomCode: string
): MultiplayerRoomState | null {
  const existing = getRoomFromStorage(roomCode);
  if (!existing) return null;

  const resetPlayers = existing.players.map((p) => ({
    ...p,
    phase: "LOBBY" as PlayerProgressPhase,
    chosenStrategy: "READY FOR NEXT ROUND",
    baseScore: 0,
    finishOrder: null,
    finishBonus: 0,
    totalScore: 0,
    grade: "B" as const,
    finishedAt: null,
  }));

  const updated: MultiplayerRoomState = {
    ...existing,
    status: "WAITING",
    selectedMission: null,
    rouletteStartedAt: null,
    missionStartedAt: null,
    players: resetPlayers,
  };
  saveRoomToStorage(updated);
  return updated;
}

