"use client";

import React, { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import DestinationSelector, { DestinationId } from "@/components/DestinationSelector";
import IssMission from "@/components/IssMission";
import MarsMission from "@/components/MarsMission";
import MoonMission from "@/components/MoonMission";

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "destination" | "mission">("landing");
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>("Commander");
  const [, setMissionMode] = useState<"solo" | "coop" | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<DestinationId>("mars");

  // When player clicks [ SINGLE PLAYER ], transition smoothly to the Destination Gallery!
  const handleStartSolo = (name: string) => {
    setPlayerName(name);
    setMissionMode("solo");
    setCurrentView("destination");
  };

  // When player launches Co-op, transition to Destination Gallery!
  const handleStartCoop = (name: string) => {
    setPlayerName(name);
    setMissionMode("coop");
    setCurrentView("destination");
  };

  const handleSelectDestination = (destId: DestinationId) => {
    setSelectedDestination(destId);
    if (destId === "iss" || destId === "mars" || destId === "moon") {
      setCurrentView("mission");
    }
  };

  const handleBackToLandingFromDest = () => {
    setCurrentView("landing");
  };

  const handleBackFromMission = () => {
    setCurrentView("destination");
  };

  const handleToggleSound = () => {
    setSoundOn((prev) => !prev);
  };

  if (currentView === "landing") {
    return (
      <LandingScreen
        onStartSolo={handleStartSolo}
        onStartCoop={handleStartCoop}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
      />
    );
  }

  if (currentView === "mission") {
    if (selectedDestination === "mars") {
      return (
        <MarsMission
          playerName={playerName}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          onAbort={handleBackFromMission}
        />
      );
    }

    if (selectedDestination === "moon") {
      return (
        <MoonMission
          playerName={playerName}
          soundOn={soundOn}
          onToggleSound={handleToggleSound}
          onAbort={handleBackFromMission}
        />
      );
    }

    return (
      <IssMission
        playerName={playerName}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        onAbort={handleBackFromMission}
      />
    );
  }

  return (
    <DestinationSelector
      playerName={playerName}
      soundOn={soundOn}
      onToggleSound={handleToggleSound}
      onBack={handleBackToLandingFromDest}
      onSelectDestination={handleSelectDestination}
    />
  );
}
