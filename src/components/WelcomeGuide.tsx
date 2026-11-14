"use client";

import React, { useState } from "react";
import GuideCharacter from "./GuideCharacter";
import MissionGameplay from "./MissionGameplay";
import { sounds } from "./SoundEffects";
import {
  Users,
  ArrowRight,
  ArrowLeft,
  FastForward,
  Scale,
  Camera,
  Coins,
  VolumeX,
  CheckCircle2,
  Sparkles,
  Flame,
  Compass,
  Bell,
  ShieldAlert,
  Feather,
} from "lucide-react";

type Language = "tr" | "en";
type Mode = "solo" | "coop" | null;

interface WelcomeGuideProps {
  onReturnToLanding?: () => void;
  initialLang?: Language;
  initialSoundOn?: boolean;
  playerName?: string;
  initialMode?: Mode;
}

export default function WelcomeGuide({
  onReturnToLanding,
  initialLang = "tr",
  initialSoundOn = true,
  playerName = "Commander",
  initialMode = null,
}: WelcomeGuideProps) {
  const [lang, setLang] = useState<Language>(initialLang);
  const [step, setStep] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<Mode>(initialMode);
  const [soundOn, setSoundOn] = useState<boolean>(initialSoundOn);

  // Demo interactive state for Step 2 trade-off showcase
  const [payloadFocus, setPayloadFocus] = useState<"standard" | "high-res">("standard");

  const toggleSound = () => {
    sounds.enabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) {
      sounds.playBlip(720);
    }
  };

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    sounds.playBlip(640);
  };

  const goToStep = (nextStep: number) => {
    if (nextStep < 1 || nextStep > 3) return;
    setStep(nextStep);
    sounds.playNextStep();
  };

  const skipToStep3 = () => {
    setStep(3);
    sounds.playBlip(800, "triangle", 0.15);
  };

  const handleSelectMode = (mode: "solo" | "coop") => {
    setSelectedMode(mode);
    sounds.playLaunchChord();
  };

  const resetToWelcome = () => {
    setSelectedMode(null);
    setStep(1);
    sounds.playBlip(500);
  };

  // Translations dictionary
  const t = {
    tr: {
      badgeTitle: "NASA Space Apps 2026",
      labTitle: "Ay'da Mahsur Kalış & Asteroit ISRU Görevi",
      versionBadge: "HAYATTA KALMA GÖREVİ • V2.0",
      soundActive: "Ses Açık",
      soundMuted: "Sessiz",
      stepIndicator: "Aşama",
      skipBtn: "Doğrudan Başla (Atla)",
      prevBtn: "Önceki",
      nextBtn: "İleri (Devam Et)",

      // Step 1: Greeting & Story Hook
      step1Tag: "1. AŞAMA: KRİTİK AY ÇAĞRISI",
      step1Heading: "Hoş geldin uzay yolcusu!",
      step1Dialogue:
        "Hoş geldin uzay yolcusu! Durum kritik... Mürettebatımız Ay'da mahsur kaldı ve Dünya'ya dönecek yakıtımız kalmadı.",
      step1Highlight1: "Ay'da Mahsur Kaldık",
      step1Highlight2: "Dönüş Yakıtı: %0",
      step1Highlight3: "Acil Hayatta Kalma",
      step1GoalLabel: "Görevin Hayatta Kalma Şartı:",
      step1GoalText:
        "Ay'daki gereksiz ağır yükleri söküp hafifle, yakından geçen asteroide inerek buz ve mineralleri çıkar, kendi roket yakıtını rafine ederek Dünya'ya dön!",

      // Step 2: The Core Challenge & Asteroid Premise
      step2Tag: "2. AŞAMA: KÜTLE & İTKİ DENGESİ",
      step2Heading: "Kurtuluşumuz Yakından Geçen Bir Asteroitte!",
      step2Dialogue:
        "Tek şansımız yakınımızdan geçen buz ve mineral yüklü bir asteroit. Elimizdeki son yakıtla oraya inip gerekli malzemeleri çıkaracağız, kendi yakıtımızı rafine edip Dünya'ya döneceğiz!",
      step2DemoTitle: "Kritik Asteroit Yükü & İtki Dengesi:",
      step2DemoOpt1: "Hafif Maden Tezgâhı",
      step2DemoOpt2: "Ağır Kriyojenik ISRU Reaktörü",
      step2MassLabel: "Toplam Gemi Kütlesi",
      step2RocketLabel: "Ay'dan Ayrılış İtkisi",
      step2BudgetLabel: "Kalan Enerji / Rezerv",
      step2Hint:
        "💡 Nova'nın Uyarısı: Gemi ne kadar ağır olursa Ay'dan kaçmak için o kadar çok yakıt gerekir. Yalnızca kritik madencilik aletlerini al!",

      // Step 3: Call to Action & Mode Select
      step3Tag: "3. AŞAMA: MOD SEÇİMİ & FIRLATMA",
      step3Heading: "Mürettebatı Kurtarmaya Hazır mısın?",
      step3Dialogue:
        "Ekip halinde (2–4 Kişi) görevleri paylaşabilirsin... ya da cesaretin varsa en zor mod olan Tek Kişilik Baş Mühendis (Solo Survival) modunda tüm gemiyi tek başına kurtarmayı deneyebilirsin!",
      soloTitle: "Tek Kişi — En Zor Mod (Solo Hardcore)",
      soloBadge: "Aşırı Zorluk • 1 Oyuncu • Canlı Zamanlayıcı",
      soloDesc:
        "Hiçbir yardım almadan tüm gemiyi tek başına kurtar. Çok dar kütle sınırları ve acil durum fırlatma penceresi sayacıyla başa çık!",
      soloFeature1: "Canlı Fırlatma Penceresi Zamanlayıcısı",
      soloFeature2: "Çok sıkı kütle & güç toleransı",
      soloBtn: "Tek Başına Baş Mühendis Ol →",
      coopTitle: "Ekip Kur — 2–4 Kişi (Co-op)",
      coopBadge: "Mürettebat İş Birliği • 2-4 Oyuncu",
      coopDesc:
        "Arkadaşlarınla rolleri paylaş: Sistem Mühendisi, ISRU Maden Şefi, Kriyojenik Termal Operatör ve Yörünge Pilotu.",
      coopFeature1: "Genişletilmiş kargo ve kütle marjı",
      coopFeature2: "Ortak kriz kararları ve iş bölümü",
      coopBtn: "Mürettebatı Topla & Başla →",
    },
    en: {
      badgeTitle: "NASA Space Apps 2026",
      labTitle: "Lunar Stranding & Asteroid ISRU Mission",
      versionBadge: "SURVIVAL MISSION • V2.0",
      soundActive: "Sound On",
      soundMuted: "Muted",
      stepIndicator: "Step",
      skipBtn: "Jump Straight to Start",
      prevBtn: "Previous",
      nextBtn: "Next (Continue)",

      // Step 1: Greeting & Story Hook
      step1Tag: "STEP 1: CRITICAL LUNAR DISTRESS",
      step1Heading: "Welcome, space traveler!",
      step1Dialogue:
        "Welcome, space traveler! Situation critical... Our crew is stranded on the Moon and we have no fuel left to return to Earth.",
      step1Highlight1: "Stranded on Moon",
      step1Highlight2: "Return Fuel: 0%",
      step1Highlight3: "Survival Emergency",
      step1GoalLabel: "Survival Objective:",
      step1GoalText:
        "Strip non-essential lunar mass, rendezvous with the passing asteroid, extract water-ice, synthesize cryogenic propellant, and navigate safely home to Earth!",

      // Step 2: The Core Challenge & Asteroid Premise
      step2Tag: "STEP 2: MASS & PROPULSION BALANCE",
      step2Heading: "Our Only Hope: A Passing Asteroid!",
      step2Dialogue:
        "Our only chance is a water-ice and mineral-rich asteroid passing near us. With our last fuel we will land there, extract vital resources, refine our return propellant, and return to Earth!",
      step2DemoTitle: "Critical Asteroid Payload & Thrust Balance:",
      step2DemoOpt1: "Lightweight Mining Rig",
      step2DemoOpt2: "Heavy Cryo ISRU Reactor",
      step2MassLabel: "Total Ship Mass",
      step2RocketLabel: "Lunar Escape Thrust",
      step2BudgetLabel: "Power & Reserves",
      step2Hint:
        "💡 Nova's Warning: The heavier the ship, the more escape delta-V required. Strip non-essential mass before attempting the asteroid rendezvous!",

      // Step 3: Call to Action & Mode Select
      step3Tag: "STEP 3: MODE SELECTION & LAUNCH",
      step3Heading: "Ready to Save the Crew?",
      step3Dialogue:
        "You can share roles with a 2–4 person crew... or if you have the grit, test yourself in the most challenging mode: Solo Chief Engineer (Solo Survival) and save the entire ship alone!",
      soloTitle: "Solo — Hardcore Survival (Hardest)",
      soloBadge: "Extreme Difficulty • 1 Player • Live Timer",
      soloDesc:
        "Save the entire spacecraft by yourself without backup. Endure unforgiving mass margins and an active launch window countdown!",
      soloFeature1: "Live Launch Window Countdown Timer",
      soloFeature2: "Razor-thin mass & power tolerances",
      soloBtn: "Embark as Solo Chief Engineer →",
      coopTitle: "Assemble Crew — 2–4 Players (Co-op)",
      coopBadge: "Crew Collaboration • 2-4 Players",
      coopDesc:
        "Divide and conquer: Systems Engineer, ISRU Mining Lead, Cryogenic Thermal Operator, and Orbital Navigator.",
      coopFeature1: "Generous cargo and mass allowances",
      coopFeature2: "Collaborative emergency crisis choices",
      coopBtn: "Assemble Crew & Begin →",
    },
  };

  const cur = t[lang];

  // If a mode was selected, seamlessly transition to the 3-Stage Mission Gameplay!
  if (selectedMode) {
    return (
      <MissionGameplay
        mode={selectedMode}
        lang={lang}
        onReturnToWelcome={resetToWelcome}
        playerName={playerName}
      />
    );
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-blueprint-grid text-slate-900 overflow-hidden font-sans">
      {/* 1. TOP DAYLIGHT HEADER BAR */}
      <header className="relative z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* NASA Mission Emblem & Title */}
          <div className="flex items-center gap-3">
            {onReturnToLanding && (
              <button
                onClick={onReturnToLanding}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold cursor-pointer transition-colors shadow-sm"
                title={lang === "tr" ? "Giriş Ekranına Dön" : "Return to Title Screen"}
              >
                <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">{lang === "tr" ? "Giriş" : "Title"}</span>
              </button>
            )}
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-600">
                  {cur.badgeTitle}
                </span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 rounded-full border border-slate-200">
                  {cur.versionBadge}
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>{cur.labTitle}</span>
              </h1>
            </div>
          </div>

          {/* Right Action Controls: Audio & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Audio Toggle */}
            <button
              onClick={toggleSound}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                soundOn
                  ? "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  : "bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200"
              }`}
              title={soundOn ? cur.soundActive : cur.soundMuted}
            >
              {soundOn ? (
                <>
                  <Bell className="w-4 h-4 text-blue-600" />
                  <span className="hidden md:inline">{cur.soundActive}</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4 text-slate-400" />
                  <span className="hidden md:inline">{cur.soundMuted}</span>
                </>
              )}
            </button>

            {/* Language Toggle TR / EN */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => handleLangChange("tr")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  lang === "tr"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>🇹🇷</span>
                <span>TR</span>
              </button>
              <button
                onClick={() => handleLangChange("en")}
                className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  lang === "en"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <span>🇺🇸</span>
                <span>EN</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN CONTAINER */}
      <main className="relative z-30 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* LEFT COLUMN: Storybook Hand-Drawn Character Illustration */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <GuideCharacter currentStep={step} lang={lang} />
          </div>

          {/* RIGHT COLUMN: Crisp White Story Card */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative bg-white rounded-3xl p-6 sm:p-9 border-2 border-slate-200 shadow-xl shadow-slate-200/50 transition-all">
              {/* Pointer Tail pointing left towards Nova in clean white */}
              <div className="hidden lg:block absolute -left-3 top-32 w-6 h-6 bg-white border-l-2 border-b-2 border-slate-200 transform rotate-45" />

              {/* Dialog Top Meta Bar */}
              <div className="flex items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200 uppercase tracking-widest flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {step === 1 && cur.step1Tag}
                    {step === 2 && cur.step2Tag}
                    {step === 3 && cur.step3Tag}
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                    <Feather className="w-3.5 h-3.5 text-blue-600" />
                    NASA Engineering Briefing
                  </span>
                </div>

                {/* Skip to Step 3 Button */}
                {step < 3 && (
                  <button
                    onClick={skipToStep3}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-2.5 py-1 rounded-md hover:bg-slate-100 cursor-pointer"
                    title={cur.skipBtn}
                  >
                    <span>{cur.skipBtn}</span>
                    <FastForward className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Dialogue Content */}
              <div className="py-6">
                {/* Step 1: Greeting & Story Hook */}
                {step === 1 && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      <span>{cur.step1Heading}</span>
                      <Sparkles className="w-6 h-6 text-amber-500" />
                    </h2>
                    <p className="text-base sm:text-lg text-slate-700 leading-relaxed font-normal bg-red-50/70 p-4 rounded-2xl border border-red-200">
                      &ldquo;{cur.step1Dialogue}&rdquo;
                    </p>

                    {/* Visual Feature Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 shadow-sm">
                        <Compass className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-800 leading-snug">
                          {cur.step1Highlight1}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 shadow-sm">
                        <Flame className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-800 leading-snug">
                          {cur.step1Highlight2}
                        </span>
                      </div>
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 shadow-sm">
                        <ShieldAlert className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span className="text-xs font-bold text-slate-800 leading-snug">
                          {cur.step1Highlight3}
                        </span>
                      </div>
                    </div>

                    {/* Mission Target Box */}
                    <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200 text-xs text-slate-700">
                      <span className="font-bold text-blue-700 block mb-1">
                        {cur.step1GoalLabel}
                      </span>
                      {cur.step1GoalText}
                    </div>
                  </div>
                )}

                {/* Step 2: The Asteroid Trade-off */}
                {step === 2 && (
                  <div className="space-y-5 animate-in fade-in duration-300">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {cur.step2Heading}
                    </h2>
                    <p className="text-base sm:text-lg text-slate-800 font-medium leading-relaxed bg-amber-50/70 p-4 rounded-2xl border border-amber-200">
                      &ldquo;{cur.step2Dialogue}&rdquo;
                    </p>

                    {/* Interactive Telemetry Test Bench */}
                    <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600 flex items-center gap-1.5">
                          <Scale className="w-4 h-4 text-blue-600" />
                          {cur.step2DemoTitle}
                        </span>
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-md border border-blue-200">
                          Canlı Denge / Interactive
                        </span>
                      </div>

                      {/* Payload Toggle */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setPayloadFocus("standard");
                            sounds.playBlip(550);
                          }}
                          className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                            payloadFocus === "standard"
                              ? "bg-white border-blue-600 text-blue-900 shadow-md ring-2 ring-blue-500/20"
                              : "bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <span className="font-bold">{cur.step2DemoOpt1}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal">
                            320 kg • 450W • Nominal
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setPayloadFocus("high-res");
                            sounds.playBlip(750);
                          }}
                          className={`p-2.5 rounded-xl text-left border text-xs font-semibold transition-all cursor-pointer ${
                            payloadFocus === "high-res"
                              ? "bg-white border-red-500 text-red-900 shadow-md ring-2 ring-red-500/20"
                              : "bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-4 h-4 text-red-500" />
                            <span className="font-bold">{cur.step2DemoOpt2}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-normal">
                            440 kg • 620W • Ağır ISRU
                          </span>
                        </button>
                      </div>

                      {/* Dynamic Meter Bars */}
                      <div className="space-y-2.5 pt-1">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Scale className="w-3.5 h-3.5 text-blue-600" />
                              {cur.step2MassLabel}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {payloadFocus === "standard"
                                ? "2,420 kg (Kalkışa Uygun)"
                                : "2,840 kg (Kritik Sınır)"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                payloadFocus === "standard" ? "w-[55%] bg-blue-600" : "w-[85%] bg-red-600"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-amber-500" />
                              {cur.step2RocketLabel}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {payloadFocus === "standard"
                                ? "Kalan Yakıt Yeterli"
                                : "Aşırı Ağırlık Riski!"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                payloadFocus === "standard" ? "w-[50%] bg-emerald-500" : "w-[90%] bg-red-600"
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-700 flex items-center gap-1">
                              <Coins className="w-3.5 h-3.5 text-emerald-600" />
                              {cur.step2BudgetLabel}
                            </span>
                            <span className="font-mono font-bold text-slate-900">
                              {payloadFocus === "standard"
                                ? "+400W Net Güç (Stabil)"
                                : "+230W Net Güç (Düşük)"}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 rounded-full ${
                                payloadFocus === "standard" ? "w-[65%] bg-emerald-500" : "w-[30%] bg-amber-500"
                              }`}
                            />
                          </div>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic pt-1">{cur.step2Hint}</p>
                    </div>
                  </div>
                )}

                {/* Step 3: Call to Action & Mode Reveal */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in duration-300">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                        {cur.step3Heading}
                      </h2>
                      <p className="mt-3 text-base sm:text-lg text-slate-700 leading-relaxed font-normal">
                        {cur.step3Dialogue}
                      </p>
                    </div>

                    {/* The Two Action Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      {/* 1. Solo Hardcore Mode Card */}
                      <div
                        onClick={() => handleSelectMode("solo")}
                        className="group relative cursor-pointer bg-red-50/50 hover:bg-red-50 p-5 rounded-2xl border-2 border-red-300 hover:border-red-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center border border-red-200 group-hover:scale-110 transition-transform">
                              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                              {cur.soloBadge}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-red-600 transition-colors">
                            {cur.soloTitle}
                          </h3>
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                            {cur.soloDesc}
                          </p>

                          <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{cur.soloFeature1}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{cur.soloFeature2}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-5 pt-4 border-t border-red-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-red-600 group-hover:text-red-700">
                            {cur.soloBtn}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-red-600 group-hover:bg-red-700 text-white flex items-center justify-center transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>

                      {/* 2. Co-op Mode Card */}
                      <div
                        onClick={() => handleSelectMode("coop")}
                        className="group relative cursor-pointer bg-blue-50/50 hover:bg-blue-50 p-5 rounded-2xl border-2 border-blue-200 hover:border-blue-500 shadow-md hover:shadow-xl transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center border border-blue-200 group-hover:scale-110 transition-transform">
                              <Users className="w-5 h-5 text-blue-700" />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                              {cur.coopBadge}
                            </span>
                          </div>

                          <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {cur.coopTitle}
                          </h3>
                          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                            {cur.coopDesc}
                          </p>

                          <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{cur.coopFeature1}</span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                              <span>{cur.coopFeature2}</span>
                            </li>
                          </ul>
                        </div>

                        <div className="mt-5 pt-4 border-t border-blue-100 flex items-center justify-between">
                          <span className="text-xs font-bold text-blue-600 group-hover:text-blue-700">
                            {cur.coopBtn}
                          </span>
                          <span className="w-7 h-7 rounded-full bg-blue-600 group-hover:bg-blue-700 text-white flex items-center justify-center transition-colors">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Step Dots and Navigation Buttons */}
              <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {[1, 2, 3].map((dotIndex) => (
                    <button
                      key={dotIndex}
                      onClick={() => goToStep(dotIndex)}
                      className={`h-3 rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center ${
                        step === dotIndex
                          ? "w-8 bg-blue-600 shadow-md shadow-blue-500/20"
                          : dotIndex < step
                          ? "w-4 bg-blue-300"
                          : "w-3 bg-slate-200 hover:bg-slate-300"
                      }`}
                      title={`${cur.stepIndicator} ${dotIndex}`}
                    />
                  ))}
                  <span className="text-xs font-mono font-medium text-slate-500 ml-2">
                    {step}/3 {cur.stepIndicator}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {step > 1 && (
                    <button
                      onClick={() => goToStep(step - 1)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>{cur.prevBtn}</span>
                    </button>
                  )}

                  {step < 3 ? (
                    <button
                      onClick={() => goToStep(step + 1)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                    >
                      <span>{cur.nextBtn}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <div className="text-xs font-semibold text-blue-600 hidden sm:block">
                      {lang === "tr"
                        ? "✦ Kurtarma görevini başlatmak için bir mod seçin"
                        : "✦ Select a survival mode to start the rescue"}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-30 w-full border-t border-slate-200 bg-white/95 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            NASA Space Apps Challenge 2026 — <strong className="text-slate-800">Space Mission Design Game</strong> (Lunar ISRU Survival Edition)
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>NASA Artemis ISRU</span>
            <span>•</span>
            <span>Modular Rover Builder</span>
            <span>•</span>
            <span>2D Asteroid Driving Mini-Game</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
