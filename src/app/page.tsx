"use client";

import React, { useState } from "react";
import LandingScreen from "@/components/LandingScreen";
import DestinationSelector, { DestinationId } from "@/components/DestinationSelector";
import WelcomeGuide from "@/components/WelcomeGuide";

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "destination" | "guide">("landing");
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [soundOn, setSoundOn] = useState<boolean>(true);
  const [playerName, setPlayerName] = useState<string>("Commander");
  const [missionMode, setMissionMode] = useState<"solo" | "coop" | null>(null);
  const [, setSelectedDestination] = useState<DestinationId>("moon");

  // When player clicks [ SINGLE PLAYER ], transition to the Destination Gallery!
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
    setCurrentView("guide");
  };

  const handleReturnToLanding = () => {
    setCurrentView("landing");
    setMissionMode(null);
  };

  const handleBackToLandingFromDest = () => {
    setCurrentView("landing");
  };

  const handleToggleSound = () => {
    setSoundOn((prev) => !prev);
  };

  if (currentView === "landing") {
    return (
      <LandingScreen
        onStartSolo={handleStartSolo}
        onStartCoop={handleStartCoop}
        lang={lang}
        onLangChange={setLang}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
      />
    );
  }

  if (currentView === "destination") {
    return (
      <DestinationSelector
        playerName={playerName}
        lang={lang}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        onBack={handleBackToLandingFromDest}
        onSelectDestination={handleSelectDestination}
      />
    );
  }

  return (
    <WelcomeGuide
      onReturnToLanding={handleReturnToLanding}
      initialLang={lang}
      initialSoundOn={soundOn}
      playerName={playerName}
      initialMode={missionMode}
    />
  );
}
