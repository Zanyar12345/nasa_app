"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Check,
  Award,
  Crosshair,
  RotateCw,
  Flame,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import SciFiHudButton from "./SciFiHudButton";

export interface IssMissionProps {
  playerName: string;
  lang: "tr" | "en";
  soundOn: boolean;
  onToggleSound: () => void;
  onAbort: () => void;
}

type MissionPhase =
  | "trans_intro_briefing"
  | "stage1_cargo"
  | "stage1_launch"
  | "trans_launch_success"
  | "stage2_eva_flight"
  | "stage2_panel_repair"
  | "success_screen"
  | "failed_screen";

// ─────────────────────────────────────────────────────────────────────────────
// 1. PROCEDURAL 8-BIT CHIPTUNE SYNTHESIZER (WEB AUDIO API - ZERO EXTERNAL ASSETS)
// ─────────────────────────────────────────────────────────────────────────────
class ChiptuneEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  // Typewriter voice blip
  playBlip(freq = 680) {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  // Retro coin / item load chime
  playCoin() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(987.77, now);
      osc.frequency.setValueAtTime(1318.51, now + 0.07);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    } catch {}
  }

  // Rocket thruster rumble
  playThruster(duration = 0.2) {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(70, now);
      osc.frequency.exponentialRampToValueAtTime(115, now + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(45, now + duration);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);
    } catch {}
  }

  // Explosion / decouple boom
  playBoom() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch {}
  }

  // Laser zap
  playLaser() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.14);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {}
  }

  // Electric spark crackle
  playSpark() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.03, 0.07, 0.11].forEach((delay, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(1200 + idx * 400, now + delay);
        gain.gain.setValueAtTime(0.05, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.04);
      });
    } catch {}
  }

  // Coolant spray hiss
  playHiss() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.12);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch {}
  }

  // Ratchet torque wrench click
  playRachet() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(840, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.035);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  // Ascending victory fanfare
  playFanfare() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0.08, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.28);
      });
    } catch {}
  }

  // Defeat / failure buzz
  playFailure() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 415.3, 392, 349.23];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.12, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.14 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.35);
      });
    } catch {}
  }

  playClick(freq = 560) {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.06);
      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }

  playAlarm() {
    if (!this.enabled || typeof window === "undefined") return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [0, 0.12].forEach((delay) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(880, now + delay);
        gain.gain.setValueAtTime(0.08, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.08);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + delay);
        osc.stop(now + delay + 0.08);
      });
    } catch {}
  }
}

const sfx = new ChiptuneEngine();

// ─────────────────────────────────────────────────────────────────────────────
// 2. 16-BIT COLORFUL PIXEL ART SVGs
// ─────────────────────────────────────────────────────────────────────────────
function PixelO2Tank({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <rect x="12" y="2" width="8" height="3" fill="#cbd5e1" />
      <rect x="14" y="1" width="4" height="2" fill="#e2e8f0" />
      <rect x="15" y="0" width="2" height="1" fill="#f8fafc" />
      <rect x="10" y="5" width="12" height="22" fill="#2563eb" />
      <rect x="11" y="6" width="3" height="20" fill="#60a5fa" />
      <rect x="12" y="10" width="8" height="3" fill="#f8fafc" />
      <rect x="12" y="18" width="8" height="2" fill="#f8fafc" />
      <circle cx="21" cy="7" r="2" fill="#f59e0b" />
      <rect x="11" y="27" width="10" height="2" fill="#1e293b" />
    </svg>
  );
}

function PixelTransponder({ className = "w-8 h-8", damaged = false }: { className?: string; damaged?: boolean }) {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <rect x="4" y="6" width="24" height="20" fill={damaged ? "#292524" : "#047857"} />
      <rect x="6" y="8" width="20" height="16" fill={damaged ? "#1c1917" : "#064e3b"} />
      <rect x="8" y="10" width="16" height="12" fill={damaged ? "#44403c" : "#10b981"} />
      <rect x="14" y="2" width="4" height="4" fill="#94a3b8" />
      <line x1="16" y1="0" x2="16" y2="3" stroke="#f8fafc" strokeWidth="2" />
      <rect x="23" y="10" width="3" height="3" fill={damaged ? "#ef4444" : "#22c55e"} />
      <rect x="8" y="26" width="3" height="4" fill="#f59e0b" />
      <rect x="13" y="26" width="3" height="4" fill="#f59e0b" />
      <rect x="18" y="26" width="3" height="4" fill="#f59e0b" />
      <rect x="23" y="26" width="3" height="4" fill="#f59e0b" />
      {damaged && (
        <>
          <polygon points="12,14 16,11 15,16 19,13 14,20" fill="#f59e0b" />
          <polygon points="18,16 21,14 20,18 24,15 19,22" fill="#ef4444" />
        </>
      )}
    </svg>
  );
}

function PixelWireKit({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <rect x="3" y="12" width="5" height="8" fill="#b45309" />
      <rect x="24" y="12" width="5" height="8" fill="#b45309" />
      <path d="M 8,14 Q 16,6 24,14" fill="none" stroke="#00f0ff" strokeWidth="3" />
      <path d="M 8,16 Q 16,11 24,16" fill="none" stroke="#facc15" strokeWidth="3" />
      <path d="M 8,18 Q 16,24 24,18" fill="none" stroke="#ef4444" strokeWidth="3" />
      <rect x="4" y="14" width="2" height="4" fill="#f8fafc" />
      <rect x="26" y="14" width="2" height="4" fill="#f8fafc" />
    </svg>
  );
}

function PixelTorqueWrench({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <rect x="4" y="14" width="18" height="4" fill="#94a3b8" />
      <rect x="4" y="15" width="16" height="2" fill="#f8fafc" />
      <rect x="2" y="13" width="4" height="6" fill="#0284c7" />
      <rect x="20" y="11" width="6" height="10" fill="#64748b" />
      <rect x="24" y="9" width="6" height="14" fill="#94a3b8" />
      <rect x="26" y="13" width="2" height="6" fill="#0f172a" />
      <rect x="7" y="15" width="4" height="2" fill="#00f0ff" />
    </svg>
  );
}

function PixelSnackCrate({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <rect x="4" y="6" width="24" height="20" fill="#d97706" />
      <rect x="6" y="8" width="20" height="16" fill="#f59e0b" />
      <rect x="4" y="6" width="4" height="4" fill="#78350f" />
      <rect x="24" y="6" width="4" height="4" fill="#78350f" />
      <rect x="4" y="22" width="4" height="4" fill="#78350f" />
      <rect x="24" y="22" width="4" height="4" fill="#78350f" />
      <polygon points="12,18 20,18 16,12" fill="#ef4444" />
      <circle cx="15" cy="16" r="1" fill="#fde047" />
      <circle cx="17" cy="15" r="1" fill="#fde047" />
    </svg>
  );
}

function PixelLeadShield({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} shapeRendering="crispEdges">
      <rect x="4" y="4" width="24" height="24" fill="#334155" />
      <rect x="6" y="6" width="20" height="20" fill="#1e293b" />
      <polygon points="6,6 14,6 6,14" fill="#facc15" />
      <polygon points="18,6 26,6 6,26 6,18" fill="#facc15" />
      <polygon points="26,14 26,22 18,26 10,26" fill="#facc15" />
      <rect x="12" y="12" width="8" height="8" fill="#475569" />
      <text x="13" y="18" fill="#f8fafc" fontSize="6" fontFamily="monospace" fontWeight="bold">Pb</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. CARGO BAY PUZZLE ITEM DEFINITIONS (FOOTPRINTS & NASA SPECS)
// ─────────────────────────────────────────────────────────────────────────────
interface CargoItemDef {
  id: string;
  name: string;
  nameTr: string;
  weight: number;
  w: number; // grid width (1..4)
  h: number; // grid height (1..4)
  required: boolean;
  color: string;
  accent: string;
  subsystem: string;
  subsystemTr: string;
  spec: string;
  specTr: string;
  note: string;
  noteTr: string;
}

const CARGO_ITEMS: CargoItemDef[] = [
  {
    id: "o2_tank",
    name: "O2 Reserve Tank",
    nameTr: "O2 Yedek Oksijen Tankı",
    weight: 25,
    w: 1,
    h: 3,
    required: true,
    color: "#2563eb",
    accent: "#60a5fa",
    subsystem: "ECLSS (Life Support)",
    subsystemTr: "ECLSS (Yaşam Destek)",
    spec: "101.3 kPa Pressurized Grade-5 Ti Alloy",
    specTr: "101.3 kPa Basınçlı Ti-Grade 5 Alaşım",
    note: "Supplies pure pressurized oxygen for up to 8 hours of continuous zero-G extravehicular spacewalk operations.",
    noteTr: "8 saate kadar kesintisiz sıfır yerçekimi uzay yürüyüşü için saf basınçlı oksijen depoları sağlar.",
  },
  {
    id: "transponder",
    name: "Signal Transponder",
    nameTr: "Yedek Sinyal Transponderi",
    weight: 30,
    w: 2,
    h: 2,
    required: true,
    color: "#059669",
    accent: "#34d399",
    subsystem: "Ku-Band Telemetry & Video",
    subsystemTr: "Ku-Bant Telemetri & Video",
    spec: "14.8 GHz / Dual Solid-State Power Amp",
    specTr: "14.8 GHz / Çift Yarıiletken Güç Amplifikatörü",
    note: "Routes astronaut real-time biometrics, 4K suit-cam feeds, and ISS command telemetry through NASA's TDRS satellite constellation.",
    noteTr: "Astronot biyometrik verilerini, 4K kask kamerasını ve istasyon telemetrisini NASA TDRS uydu ağına aktarır.",
  },
  {
    id: "wire_kit",
    name: "Insulated Wire Kit",
    nameTr: "İzole Bus Kablo Kiti",
    weight: 20,
    w: 2,
    h: 1,
    required: true,
    color: "#d97706",
    accent: "#fbbf24",
    subsystem: "EPS (Power Distribution)",
    subsystemTr: "EPS (Elektrik Dağıtımı)",
    spec: "120V DC Radiation-Hardened Mil-Spec",
    specTr: "120V DC Radyasyona Dayanıklı Mil-Spec",
    note: "Triple-braided copper bus conductors wrapped in vacuum-resistant multi-layer Kapton thermal film to prevent vacuum arcing.",
    noteTr: "Uzay boşluğunda yüksek voltaj arkını engelleyen çok katmanlı Kapton film kaplı üçlü örgülü bakır kablo demeti.",
  },
  {
    id: "wrench",
    name: "EVA Torque Wrench",
    nameTr: "EVA Tork Anahtarı",
    weight: 15,
    w: 1,
    h: 2,
    required: true,
    color: "#0891b2",
    accent: "#22d3ee",
    subsystem: "EVA Tools Assembly",
    subsystemTr: "EVA Aletleri Donanımı",
    spec: "15–45 Nm Calibrated Electronic Ratchet",
    specTr: "15–45 Nm Kalibreli Elektronik Cırcır",
    note: "Counterbalanced zero-reaction space ratchet preventing astronauts from rotating their own bodies while unbolting in zero-G.",
    noteTr: "Sıfır yerçekiminde astronotun kendi ekseni etrafında dönmesini önleyen sıfır reaksiyonlu karşı ağırlıklı tork aleti.",
  },
  {
    id: "snack_crate",
    name: "Extra Snack Crate (Decoy)",
    nameTr: "Atıştırmalık Kasası (Ağır Yük)",
    weight: 40,
    w: 2,
    h: 2,
    required: false,
    color: "#b45309",
    accent: "#f59e0b",
    subsystem: "Crew Provisions (Decoy)",
    subsystemTr: "Mürettebat Kumanyası (Tuzak)",
    spec: "40.0 KG Freeze-Dried Ration Crates",
    specTr: "40.0 KG Dondurularak Kurutulmuş Rasyon",
    note: "Standard food rations and snack pouches. Non-essential mass that breaches the strict 100 KG rocket limit.",
    noteTr: "Dondurularak kurutulmuş uzay rasyonları. Kritik 100 KG yük sınırını aşan gereksiz kargo.",
  },
  {
    id: "lead_shield",
    name: "Heavy Lead Shield (Decoy)",
    nameTr: "Kurşun Zırh Plakası (Ağır)",
    weight: 55,
    w: 2,
    h: 3,
    required: false,
    color: "#334155",
    accent: "#64748b",
    subsystem: "Heavy Ballast (Decoy)",
    subsystemTr: "Ağır Zırh / Safra (Tuzak)",
    spec: "55.0 KG High-Density Lead Plate",
    specTr: "55.0 KG Yüksek Yoğunluklu Kurşun Blok",
    note: "Heavy radiation plate. Far too massive for this repair flight; loading this will breach payload limits.",
    noteTr: "Ağır kurşun blok. Bu tamir görevi için aşırı ağırdır; yük sınırını aşar.",
  },
];

interface PlacedCargo {
  itemId: string;
  x: number; // 0..3
  y: number; // 0..3
  w: number;
  h: number;
}

interface FloatingPopup {
  id: number;
  text: string;
  color: string;
  x: number;
  y: number;
}

export default function IssMission({
  playerName,
  lang,
  soundOn,
  onToggleSound,
  onAbort,
}: IssMissionProps) {
  // Sync sound engine
  useEffect(() => {
    sfx.enabled = soundOn;
  }, [soundOn]);

  // Mission Main State
  const [phase, setPhase] = useState<MissionPhase>("trans_intro_briefing");
  const [failReason, setFailReason] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [popups, setPopups] = useState<FloatingPopup[]>([]);
  const [shakeOffset, setShakeOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const addScore = useCallback((pts: number, text: string, x = 50, y = 40, color = "#00f0ff") => {
    setScore((prev) => prev + pts);
    const newPopup: FloatingPopup = {
      id: Date.now() + Math.random(),
      text,
      color,
      x,
      y,
    };
    setPopups((prev) => [...prev, newPopup]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, 1100);
  }, []);

  const triggerShake = useCallback((intensity = 6) => {
    const ox = (Math.random() - 0.5) * intensity * 2;
    const oy = (Math.random() - 0.5) * intensity * 2;
    setShakeOffset({ x: ox, y: oy });
    setTimeout(() => setShakeOffset({ x: 0, y: 0 }), 320);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // TYPEWRITER OVERLAY SYSTEM (15.14.33.jpeg Dialogue Box)
  // ─────────────────────────────────────────────────────────────────────────
  const [typewriterIndex, setTypewriterIndex] = useState(0);
  const [isTypewriterDone, setIsTypewriterDone] = useState(false);

  const getBriefingText = () => {
    if (phase === "trans_intro_briefing") {
      return lang === "tr"
        ? `[GÖREV EMRİ // ISS ORBITAL REPAIR] Komutan ${playerName}, ISS harici TDRS sinyal transponderi mikrometeorit çarpmasıyla hasar gördü. 4x4 roket kargo ambarına 4 kritik tamir ekipmanını (Maksimum 100 KG) [R] tuşuyla çevirip yerleştirin ve fırlatmayı başlatın!`
        : `[MISSION DIRECTIVE // ISS ORBITAL REPAIR] Commander ${playerName}, the ISS external TDRS transponder suffered a micrometeorite strike. Pack all 4 required repair tools into the 4x4 rocket cargo bay (Max 100 KG) using [R] to rotate, then initiate orbital launch!`;
    }
    if (phase === "trans_launch_success") {
      return lang === "tr"
        ? `[FIRLATMA BAŞARILI // 408 KM LEO] Yörünge hızı 28.000 km/s! ISS istasyonu Dünya çevresinde 90 dakikada bir tur atar ve her gün 16 gün doğumu görür. Şimdi hava kilidini boşaltıp sıfır yerçekiminde uzay yürüyüşüne (EVA) başlayın!`
        : `[LAUNCH SUCCESSFUL // 408 KM LEO] Orbital velocity locked at 28,000 km/h! The ISS orbits Earth every 90 minutes, witnessing 16 sunrises daily. Depressurize the airlock and begin your zero-gravity EVA spacewalk!`;
    }
    return "";
  };

  const currentBriefingFullText = getBriefingText();

  useEffect(() => {
    if (phase !== "trans_intro_briefing" && phase !== "trans_launch_success") return;

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      setTypewriterIndex(idx);
      if (idx % 3 === 0) sfx.playBlip(720);
      if (idx >= currentBriefingFullText.length) {
        setIsTypewriterDone(true);
        clearInterval(interval);
      }
    }, 24);

    return () => clearInterval(interval);
  }, [phase, currentBriefingFullText]);

  const handleSkipTypewriter = () => {
    if (!isTypewriterDone) {
      setTypewriterIndex(currentBriefingFullText.length);
      setIsTypewriterDone(true);
      sfx.playClick(600);
    } else {
      sfx.playCoin();
      if (phase === "trans_intro_briefing") setPhase("stage1_cargo");
      if (phase === "trans_launch_success") setPhase("stage2_eva_flight");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 1A: 4x4 GRID CARGO PACKING MECHANICS
  // ─────────────────────────────────────────────────────────────────────────
  const [placedCargo, setPlacedCargo] = useState<PlacedCargo[]>([]);
  const [selectedToolId, setSelectedToolId] = useState<string>("o2_tank");
  const [isRotated, setIsRotated] = useState<boolean>(false);
  const [hoverCell, setHoverCell] = useState<{ x: number; y: number } | null>(null);

  const selectedToolDef = CARGO_ITEMS.find((t) => t.id === selectedToolId) || CARGO_ITEMS[0];
  const activeW = isRotated ? selectedToolDef.h : selectedToolDef.w;
  const activeH = isRotated ? selectedToolDef.w : selectedToolDef.h;

  const totalPayloadWeight = placedCargo.reduce((acc, p) => {
    const item = CARGO_ITEMS.find((t) => t.id === p.itemId);
    return acc + (item ? item.weight : 0);
  }, 0);

  const packedRequiredCount = placedCargo.filter((p) => {
    const item = CARGO_ITEMS.find((t) => t.id === p.itemId);
    return item?.required;
  }).length;

  const isCargoReadyForLaunch = packedRequiredCount === 4 && totalPayloadWeight <= 100;

  // Collision and bounds check
  const canPlaceItem = (x: number, y: number, w: number, h: number) => {
    if (x + w > 4 || y + h > 4) return false;
    for (const p of placedCargo) {
      const overlapX = Math.max(x, p.x) < Math.min(x + w, p.x + p.w);
      const overlapY = Math.max(y, p.y) < Math.min(y + h, p.y + p.h);
      if (overlapX && overlapY) return false;
    }
    return true;
  };

  const handleCellClick = (cellX: number, cellY: number) => {
    // Check if cell already contains an item -> remove it
    const existing = placedCargo.find(
      (p) => cellX >= p.x && cellX < p.x + p.w && cellY >= p.y && cellY < p.y + p.h
    );
    if (existing) {
      sfx.playClick(440);
      setPlacedCargo((prev) => prev.filter((p) => p.itemId !== existing.itemId));
      return;
    }

    // Try to place selected tool
    if (placedCargo.some((p) => p.itemId === selectedToolId)) {
      sfx.playAlarm();
      return;
    }

    if (canPlaceItem(cellX, cellY, activeW, activeH)) {
      sfx.playCoin();
      setPlacedCargo((prev) => [
        ...prev,
        {
          itemId: selectedToolId,
          x: cellX,
          y: cellY,
          w: activeW,
          h: activeH,
        },
      ]);
      addScore(250, `+PACKED ${selectedToolDef.name}`, cellX * 20 + 20, cellY * 20 + 20);

      // Select next unplaced item
      const nextUnplaced = CARGO_ITEMS.find(
        (t) => t.required && t.id !== selectedToolId && !placedCargo.some((p) => p.itemId === t.id)
      );
      if (nextUnplaced) setSelectedToolId(nextUnplaced.id);
    } else {
      sfx.playAlarm();
      triggerShake(4);
    }
  };

  const toggleRotation = () => {
    sfx.playClick(780);
    setIsRotated((prev) => !prev);
  };

  // Keyboard shortcut [R] to rotate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "r" || e.key === "R") {
        setIsRotated((prev) => !prev);
        sfx.playClick(780);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 1B: ACTIVE THRUST & ENGINE HEAT LAUNCH SIMULATOR
  // ─────────────────────────────────────────────────────────────────────────
  const [altitude, setAltitude] = useState<number>(0); // 0 -> 408 km
  const [velocity, setVelocity] = useState<number>(0); // 0 -> 28,000 km/h
  const [engineHeat, setEngineHeat] = useState<number>(0); // 0 -> 100%
  const [isOverheated, setIsOverheated] = useState<boolean>(false);
  const [isThrustingActive, setIsThrustingActive] = useState<boolean>(false);
  const [timingEvent, setTimingEvent] = useState<"none" | "separation" | "insertion">("none");
  const [timingNeedle, setTimingNeedle] = useState<number>(20);
  const [timingDirection, setTimingDirection] = useState<number>(1);
  const [debrisChunks, setDebrisChunks] = useState<
    { id: string; name: string; x: number; y: number; zapped: boolean }[]
  >([
    { id: "deb1", name: "SOLAR SHARD", x: 28, y: 35, zapped: false },
    { id: "deb2", name: "DEFUNCT BOOSTER", x: 62, y: 22, zapped: false },
    { id: "deb3", name: "MICROMETEORITE", x: 44, y: 55, zapped: false },
  ]);
  const launchCanvasRef = useRef<HTMLCanvasElement>(null);
  const altitudeRef = useRef(0);
  const velocityRef = useRef(0);

  useEffect(() => {
    altitudeRef.current = altitude;
    velocityRef.current = velocity;
  }, [altitude, velocity]);

  // Target corridor: min and max velocity based on altitude
  const targetMinVelocity = Math.min(27000, 2000 + (altitude / 408) * 24000);
  const targetMaxVelocity = targetMinVelocity + 4000;
  const isInsideCorridor = velocity >= targetMinVelocity && velocity <= targetMaxVelocity;

  // Spacebar thrust listener
  useEffect(() => {
    if (phase !== "stage1_launch") return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && !e.repeat) {
        setIsThrustingActive(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsThrustingActive(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase]);

  // Launch Engine Loop (Physics, Heat, Timing, Debris)
  useEffect(() => {
    if (phase !== "stage1_launch") return;

    const interval = setInterval(() => {
      // 1. Heat and thrust physics
      if (isThrustingActive && !isOverheated) {
        sfx.playThruster(0.1);
        setVelocity((prev) => Math.min(28000, prev + 240));
        setEngineHeat((prev) => {
          const next = prev + 1.2;
          if (next >= 100) {
            setIsOverheated(true);
            sfx.playAlarm();
            sfx.playBoom();
            triggerShake(8);
            setTimeout(() => setIsOverheated(false), 1600);
            return 100;
          }
          return next;
        });
      } else {
        // Natural cool-down and atmospheric drag
        setEngineHeat((prev) => Math.max(0, prev - 1.8));
        setVelocity((prev) => Math.max(0, prev - 85));
      }

      // 2. Altitude advancement based on velocity
      setAltitude((prev) => {
        if (prev >= 408) {
          sfx.playFanfare();
          addScore(1500, "+ORBITAL INSERTION ACHIEVED!");
          setTypewriterIndex(0);
          setIsTypewriterDone(false);
          setPhase("trans_launch_success");
          return 408;
        }
        const climbRate = (velocity / 28000) * 2.8;
        return Math.min(408, prev + climbRate);
      });

      // 3. Staging Gates
      if (altitude >= 115 && altitude <= 135 && timingEvent === "none") {
        setTimingEvent("separation");
        sfx.playAlarm();
      } else if (altitude > 135 && timingEvent === "separation") {
        setTimingEvent("none");
      }

      if (altitude >= 340 && altitude <= 365 && timingEvent === "none") {
        setTimingEvent("insertion");
        sfx.playAlarm();
      } else if (altitude > 365 && timingEvent === "insertion") {
        setTimingEvent("none");
      }

      // 4. Timing needle oscillation
      setTimingNeedle((prev) => {
        let next = prev + timingDirection * 4;
        if (next > 85) {
          setTimingDirection(-1);
          next = 85;
        } else if (next < 15) {
          setTimingDirection(1);
          next = 15;
        }
        return next;
      });

      // 5. Corridor score tick
      if (isInsideCorridor && velocity > 2000) {
        setScore((prev) => prev + 4);
      }
    }, 60);

    return () => clearInterval(interval);
  }, [
    phase,
    isThrustingActive,
    isOverheated,
    altitude,
    velocity,
    timingEvent,
    timingDirection,
    isInsideCorridor,
    addScore,
    triggerShake,
  ]);

  // Multi-Layer Living Sky-to-Space Parallax Canvas Renderer
  useEffect(() => {
    if (phase !== "stage1_launch") return;
    const canvas = launchCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let tick = 0;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }[] = [];

    // Pre-generate stars for low Earth orbit
    const stars = Array.from({ length: 65 }).map(() => ({
      x: Math.random() * 800,
      y: Math.random() * 320,
      size: Math.random() > 0.8 ? 2.5 : Math.random() > 0.5 ? 1.8 : 1.0,
      color: Math.random() > 0.7 ? "#00f0ff" : Math.random() > 0.4 ? "#fef08a" : "#f8fafc",
      twinkleSpeed: 0.05 + Math.random() * 0.08,
    }));

    const render = () => {
      tick++;
      const currentAlt = altitudeRef.current;
      const currentVel = velocityRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;
      const rx = w * 0.5;
      const ry = h * 0.45;

      // ─── 1. DYNAMIC ATMOSPHERE BACKGROUND GRADIENT ───
      if (currentAlt < 60) {
        // Troposphere (0-60 km): Azure sky fading to deep blue
        const altFactor = currentAlt / 60;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, `rgb(${Math.round(8 - altFactor * 4)}, ${Math.round(47 - altFactor * 30)}, ${Math.round(73 - altFactor * 45)})`);
        grad.addColorStop(0.5, `rgb(${Math.round(2 - altFactor * 0)}, ${Math.round(132 - altFactor * 80)}, ${Math.round(199 - altFactor * 100)})`);
        grad.addColorStop(1, `rgb(${Math.round(56 - altFactor * 40)}, ${Math.round(189 - altFactor * 130)}, ${Math.round(248 - altFactor * 150)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Ground / Launchpad horizon falling away
        const launchpadY = h - 35 + currentAlt * 4.5;
        if (launchpadY < h + 50) {
          ctx.fillStyle = "#0f172a";
          ctx.fillRect(0, launchpadY, w, 60);
          // Launch tower silhouette
          ctx.fillStyle = "#991b1b";
          ctx.fillRect(w * 0.25, launchpadY - 45, 18, 45);
          ctx.fillRect(w * 0.23, launchpadY - 30, 28, 4);
        }

        // Layer 1: Fast foreground pixel clouds rushing down
        ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
        for (let i = 0; i < 6; i++) {
          const cx = ((i * 150 + tick * 1.5) % (w + 120)) - 60;
          const cy = ((i * 65 + tick * (currentVel * 0.0006 + 3)) % (h + 80)) - 40;
          ctx.fillRect(cx, cy, 54, 16);
          ctx.fillRect(cx + 8, cy - 8, 38, 12);
        }
      } else if (currentAlt < 160) {
        // Stratosphere / Mesosphere (60-160 km): Deep space navy with glowing ozone limb
        const stratFactor = (currentAlt - 60) / 100;
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, "#010409");
        grad.addColorStop(0.65, `rgb(${Math.round(15 - stratFactor * 10)}, ${Math.round(23 - stratFactor * 15)}, ${Math.round(42 - stratFactor * 25)})`);
        grad.addColorStop(1, `rgb(${Math.round(6 - stratFactor * 4)}, ${Math.round(182 - stratFactor * 120)}, ${Math.round(212 - stratFactor * 140)})`);
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Distant weather sounding balloon drifting
        const balloonX = ((tick * 0.6) % (w + 40)) - 20;
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        ctx.beginPath();
        ctx.arc(balloonX, h * 0.35, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(balloonX - 1, h * 0.35 + 7, 2, 4);

        // Supersonic Shockwave Rings around rocket nose cone
        if (currentVel > 5000) {
          const wavePhase = (tick * 0.15) % 1;
          const waveR = 12 + wavePhase * 36;
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 - wavePhase * 0.7})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.ellipse(rx, ry - 14, waveR, waveR * 0.45, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Low Earth Orbit (160-408 km): Deep space with starry void, Moon & ISS Silhouette
        ctx.fillStyle = "#010409";
        ctx.fillRect(0, 0, w, h);

        // Cosmic Nebula Cluster in background
        const nebGrad = ctx.createRadialGradient(w * 0.35, h * 0.25, 10, w * 0.35, h * 0.25, 90);
        nebGrad.addColorStop(0, "rgba(168, 85, 247, 0.2)");
        nebGrad.addColorStop(0.6, "rgba(6, 182, 212, 0.12)");
        nebGrad.addColorStop(1, "transparent");
        ctx.fillStyle = nebGrad;
        ctx.fillRect(0, 0, w, h);

        // Twinkling Parallax Starfield
        stars.forEach((s, idx) => {
          const alpha = 0.4 + Math.sin(tick * s.twinkleSpeed + idx) * 0.45;
          ctx.fillStyle = s.color;
          ctx.globalAlpha = Math.max(0.1, alpha);
          ctx.fillRect(s.x, s.y, s.size, s.size);
        });
        ctx.globalAlpha = 1.0;

        // Pixel Crescent Moon in upper left
        ctx.fillStyle = "#f8fafc";
        ctx.beginPath();
        ctx.arc(80, 50, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#010409";
        ctx.beginPath();
        ctx.arc(87, 47, 14, 0, Math.PI * 2);
        ctx.fill();

        // Ringed Planet in background
        ctx.fillStyle = "#fbbf24";
        ctx.beginPath();
        ctx.arc(w - 90, 70, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(251, 191, 36, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(w - 90, 70, 14, 3, Math.PI / 6, 0, Math.PI * 2);
        ctx.stroke();

        // ISS Silhouette Rendezvous Target (scales up as rocket nears 408 km)
        if (currentAlt >= 220) {
          const issProgress = (currentAlt - 220) / (408 - 220); // 0..1
          const issScale = 0.5 + issProgress * 0.7; // 0.5 -> 1.2
          const issX = w * 0.76;
          const issY = 45;

          ctx.save();
          ctx.translate(issX, issY);
          ctx.scale(issScale, issScale);

          // Central ISS Module Stack
          ctx.fillStyle = "#e2e8f0";
          ctx.fillRect(-18, -4, 36, 8);
          ctx.fillRect(-4, -14, 8, 28);

          // Solar Array Wings (Gold-tinted photovoltaic arrays)
          ctx.fillStyle = "#ca8a04";
          ctx.fillRect(-38, -12, 16, 24);
          ctx.fillRect(22, -12, 16, 24);

          // Photovoltaic Gridlines
          ctx.strokeStyle = "#020617";
          ctx.lineWidth = 1;
          ctx.strokeRect(-38, -12, 16, 24);
          ctx.strokeRect(22, -12, 16, 24);

          // Blinking Docking Beacons
          ctx.fillStyle = tick % 24 < 12 ? "#00f0ff" : "#ef4444";
          ctx.fillRect(0, -6, 2, 2);

          ctx.restore();
        }

        // Curved Earth Horizon at bottom with glowing limb
        ctx.strokeStyle = "rgba(0, 240, 255, 0.85)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(w * 0.5, h + 380, 440, Math.PI * 1.2, Math.PI * 1.8);
        ctx.stroke();
      }

      // ─── 2. ROCKET EXHAUST PLUME & SPARKS ───
      if (isThrustingActive && !isOverheated) {
        // Supersonic core diamond
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.moveTo(rx - 4, ry + 20);
        ctx.lineTo(rx + 4, ry + 20);
        ctx.lineTo(rx, ry + 36);
        ctx.closePath();
        ctx.fill();

        // Spawn outer flame & ember particles
        for (let i = 0; i < 4; i++) {
          particles.push({
            x: rx + (Math.random() - 0.5) * 14,
            y: ry + 26,
            vx: (Math.random() - 0.5) * 2.5,
            vy: 4 + Math.random() * 6,
            life: 1.0,
            size: 3 + Math.random() * 3,
            color: Math.random() > 0.5 ? "#00f0ff" : Math.random() > 0.5 ? "#f59e0b" : "#ef4444",
          });
        }
      }

      // Overheat steam venting
      if (isOverheated) {
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: rx + (Math.random() - 0.5) * 22,
            y: ry + (Math.random() - 0.5) * 28,
            vx: (Math.random() - 0.5) * 4,
            vy: -2 - Math.random() * 3,
            life: 1.0,
            size: 4,
            color: "#ef4444",
          });
        }
      }

      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.045;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [phase, isThrustingActive, isOverheated]);

  const handleTimingGateClick = () => {
    if (timingNeedle >= 40 && timingNeedle <= 60) {
      sfx.playBoom();
      sfx.playCoin();
      triggerShake(7);
      addScore(1000, "PERFECT TIMING! +1000 PTS", 50, 40, "#22c55e");
      setTimingEvent("none");
    } else {
      sfx.playAlarm();
      triggerShake(4);
      addScore(200, "TIMING GLITCH! +200 PTS", 50, 40, "#f59e0b");
      setTimingEvent("none");
    }
  };

  const handleZapDebris = (id: string, x: number, y: number) => {
    sfx.playLaser();
    sfx.playBoom();
    triggerShake(4);
    addScore(500, "DEBRIS VAPORIZED! +500", x, y, "#00f0ff");
    setDebrisChunks((prev) => prev.map((d) => (d.id === id ? { ...d, zapped: true } : d)));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 2A: ZERO-G INERTIA EVA FLIGHT & O2 TIMER
  // ─────────────────────────────────────────────────────────────────────────
  const [astroPos, setAstroPos] = useState<{ x: number; y: number }>({ x: 20, y: 65 });
  const [astroVel, setAstroVel] = useState<{ vx: number; vy: number }>({ vx: 0, vy: 0 });
  const [astroFacing, setAstroFacing] = useState<number>(1);
  const [o2Level, setO2Level] = useState<number>(100);
  const [isThrustingEva, setIsThrustingEva] = useState<boolean>(false);
  const [evaHazards, setEvaHazards] = useState<{ id: number; x: number; y: number; vx: number; vy: number }[]>([
    { id: 1, x: 50, y: 30, vx: -0.4, vy: 0.2 },
    { id: 2, x: 70, y: 70, vx: 0.3, vy: -0.3 },
    { id: 3, x: 35, y: 40, vx: 0.2, vy: 0.4 },
  ]);

  const PANEL_TARGET = { x: 78, y: 34 };
  const distanceToPanel = Math.hypot(astroPos.x - PANEL_TARGET.x, astroPos.y - PANEL_TARGET.y);
  const isNearPanel = distanceToPanel < 16;

  // Zero-G Physics & O2 Drain Loop
  useEffect(() => {
    if (phase !== "stage2_eva_flight") return;

    const interval = setInterval(() => {
      // 1. Drain O2
      setO2Level((prev) => {
        const next = prev - 0.22;
        if (next <= 0) {
          sfx.playFailure();
          setFailReason(
            lang === "tr"
              ? "KRİTİK HATA: SIFIR YERÇEKİMİNDE OKSİJEN TÜKENDİ! ASTRONOT HAVA KİLİDİ EKİBİ TARAFINDAN KURTARILDI."
              : "CRITICAL FAILURE: OXYGEN DEPLETED IN ZERO-G! ASTRONAUT RETRIEVED BY AIRLOCK EMERGENCY CREW."
          );
          setPhase("failed_screen");
          return 0;
        }
        return next;
      });

      // 2. Position integration with realistic zero-g inertia damping (0.965)
      setAstroPos((prev) => ({
        x: Math.max(6, Math.min(92, prev.x + astroVel.vx)),
        y: Math.max(12, Math.min(84, prev.y + astroVel.vy)),
      }));

      setAstroVel((prev) => ({
        vx: prev.vx * 0.965,
        vy: prev.vy * 0.965,
      }));

      // 3. Update drifting hazards
      setEvaHazards((prev) =>
        prev.map((h) => {
          const nx = h.x + h.vx;
          const ny = h.y + h.vy;
          if (nx < 10 || nx > 90) h.vx *= -1;
          if (ny < 15 || ny > 85) h.vy *= -1;

          // Check collision with astronaut
          const dist = Math.hypot(astroPos.x - nx, astroPos.y - ny);
          if (dist < 6) {
            sfx.playSpark();
            triggerShake(6);
            addScore(-100, "HAZARD IMPACT! -8% O2", nx, ny, "#ef4444");
            setO2Level((o) => Math.max(0, o - 8));
          }
          return { ...h, x: nx, y: ny };
        })
      );
    }, 45);

    return () => clearInterval(interval);
  }, [phase, astroPos, astroVel, lang, addScore, triggerShake]);

  // WASD / Arrow Keys for Zero-G Thrust
  useEffect(() => {
    if (phase !== "stage2_eva_flight") return;

    const handleKeyDown = (e: KeyboardEvent) => {
      let ax = 0;
      let ay = 0;
      if (e.key === "w" || e.key === "ArrowUp") ay -= 0.6;
      if (e.key === "s" || e.key === "ArrowDown") ay += 0.6;
      if (e.key === "a" || e.key === "ArrowLeft") {
        ax -= 0.6;
        setAstroFacing(-1);
      }
      if (e.key === "d" || e.key === "ArrowRight") {
        ax += 0.6;
        setAstroFacing(1);
      }
      if (e.key === "e" || e.key === "E") {
        if (isNearPanel) {
          sfx.playCoin();
          setPhase("stage2_panel_repair");
        }
      }

      if (ax !== 0 || ay !== 0) {
        setIsThrustingEva(true);
        sfx.playThruster(0.08);
        setAstroVel((prev) => ({
          vx: Math.max(-2.5, Math.min(2.5, prev.vx + ax)),
          vy: Math.max(-2.5, Math.min(2.5, prev.vy + ay)),
        }));
      }
    };

    const handleKeyUp = () => {
      setIsThrustingEva(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [phase, isNearPanel]);

  // Tap / click to thrust towards position
  const handleEvaCanvasClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const targetX = ((e.clientX - rect.left) / rect.width) * 100;
    const targetY = ((e.clientY - rect.top) / rect.height) * 100;

    const dx = targetX - astroPos.x;
    const dy = targetY - astroPos.y;
    setAstroFacing(dx >= 0 ? 1 : -1);
    sfx.playThruster(0.12);

    const angle = Math.atan2(dy, dx);
    setAstroVel({
      vx: Math.cos(angle) * 1.8,
      vy: Math.sin(angle) * 1.8,
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  // STAGE 2B: HANDS-ON COMMS BOX REPAIR MECHANICS
  // ─────────────────────────────────────────────────────────────────────────
  const [unboltedBolts, setUnboltedBolts] = useState<string[]>([]);
  const [holdingBolt, setHoldingBolt] = useState<string | null>(null);
  const [boltTorqueProgress, setBoltTorqueProgress] = useState<number>(0);

  const [transponderHeat, setTransponderHeat] = useState<number>(100);
  const [isSprayingCoolant, setIsSprayingCoolant] = useState<boolean>(false);
  const [isDamagedEjected, setIsDamagedEjected] = useState<boolean>(false);
  const [isSpareInstalled, setIsSpareInstalled] = useState<boolean>(false);
  const [solderedPins, setSolderedPins] = useState<number[]>([]);
  const [solderSparkPos, setSolderSparkPos] = useState<number>(0);
  const [solderSparkDir, setSolderSparkDir] = useState<number>(1);

  const [connectedWires, setConnectedWires] = useState<Record<string, string>>({});
  const [selectedWire, setSelectedWire] = useState<string | null>(null);
  const [waveAmplitude, setWaveAmplitude] = useState<number>(0.4);
  const [wavePhase, setWavePhase] = useState<number>(60);
  const oscCanvasRef = useRef<HTMLCanvasElement>(null);

  const isCoverRemoved = unboltedBolts.length === 4;
  const isSolderedComplete = solderedPins.length === 4;
  const isRewiredComplete = Object.keys(connectedWires).length === 4;

  // Bolt hold-unbolt timer
  useEffect(() => {
    if (!holdingBolt) return;
    const interval = setInterval(() => {
      sfx.playRachet();
      setBoltTorqueProgress((prev) => {
        const next = prev + 12;
        if (next >= 100) {
          sfx.playCoin();
          setUnboltedBolts((b) => [...b, holdingBolt]);
          setHoldingBolt(null);
          addScore(250, "HEX BOLT UNTHREADED! +250");
          return 0;
        }
        return next;
      });
    }, 80);
    return () => clearInterval(interval);
  }, [holdingBolt, addScore]);

  // Coolant spray loop
  useEffect(() => {
    if (!isSprayingCoolant) return;
    const interval = setInterval(() => {
      sfx.playHiss();
      setTransponderHeat((prev) => {
        const next = Math.max(0, prev - 14);
        if (next === 0) {
          sfx.playCoin();
          addScore(300, "TEMP: 0°C (SAFE TO PULL)");
        }
        return next;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isSprayingCoolant, addScore]);

  // Solder moving spark loop
  useEffect(() => {
    if (phase !== "stage2_panel_repair" || isSolderedComplete) return;
    const interval = setInterval(() => {
      setSolderSparkPos((prev) => {
        let next = prev + solderSparkDir * 4;
        if (next > 92) {
          setSolderSparkDir(-1);
          next = 92;
        } else if (next < 8) {
          setSolderSparkDir(1);
          next = 8;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [phase, solderSparkDir, isSolderedComplete]);

  const handleSolderPinClick = (pinIdx: number) => {
    const targetX = 15 + pinIdx * 24;
    const diff = Math.abs(solderSparkPos - targetX);
    if (diff < 12) {
      sfx.playSpark();
      sfx.playCoin();
      setSolderedPins((prev) => [...new Set([...prev, pinIdx])]);
      addScore(250, `PIN #${pinIdx + 1} SOLDERED! +250`);
    } else {
      sfx.playAlarm();
      triggerShake(4);
    }
  };

  const handleWireSelect = (wireId: string) => {
    sfx.playClick(620);
    setSelectedWire(wireId);
  };

  const handleTerminalSelect = (termId: string) => {
    if (!selectedWire) return;
    sfx.playSpark();
    sfx.playCoin();
    setConnectedWires((prev) => ({ ...prev, [selectedWire]: termId }));
    addScore(200, `BUS CABLE LINKED: ${selectedWire.toUpperCase()}`);
    setSelectedWire(null);
  };

  // Oscilloscope calculation & wave sync calculation
  const ampError = Math.abs(waveAmplitude - 1.0);
  const phaseError = Math.abs(wavePhase - 180) / 180;
  const signalMatchPercent = Math.max(0, Math.min(100, Math.round(100 - (ampError * 50 + phaseError * 50))));

  // Oscilloscope canvas animation
  useEffect(() => {
    if (phase !== "stage2_panel_repair") return;
    const canvas = oscCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.08;
      ctx.fillStyle = "#030d17";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Grid
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 20) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      const cy = canvas.height * 0.5;

      // 1. Target NASA Reference Wave (Green)
      ctx.strokeStyle = "rgba(34, 197, 94, 0.85)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = cy + Math.sin(x * 0.05 + t) * 22;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // 2. Current Transponder Signal Wave (Yellow)
      ctx.strokeStyle = signalMatchPercent >= 98 ? "#00f0ff" : "#facc15";
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const pRad = (wavePhase * Math.PI) / 180;
        const y = cy + Math.sin(x * 0.05 + t + pRad) * 22 * waveAmplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [phase, waveAmplitude, wavePhase, signalMatchPercent]);

  // Check victory condition when all steps done and signal 100%
  useEffect(() => {
    if (
      phase === "stage2_panel_repair" &&
      isCoverRemoved &&
      isSolderedComplete &&
      isRewiredComplete &&
      signalMatchPercent >= 98
    ) {
      sfx.playFanfare();
      const timer = setTimeout(() => {
        addScore(2000, "COMMUNICATION SIGNAL LOCKED: 100%!");
        setPhase("success_screen");
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [phase, isCoverRemoved, isSolderedComplete, isRewiredComplete, signalMatchPercent, addScore]);

  // Mini-comms tactical tip based on current state
  const getCommsTip = () => {
    if (phase === "stage1_cargo") {
      return lang === "tr"
        ? "Bas [R] ile aletleri çevir! 4x4 roket ambarına 4 zorunlu tamir aletini sığdır (Maks 100 KG)."
        : "Press [R] to rotate tools into the 4x4 bay! Fit all 4 required repair tools (Max 100 KG).";
    }
    if (phase === "stage1_launch") {
      if (isOverheated) {
        return lang === "tr" ? "UYARI: MOTOR AŞIRI ISINDI! Soğumasını bekle!" : "WARNING: ENGINE OVERHEATED! Wait for cooldown!";
      }
      return lang === "tr"
        ? "SPACE tuşuna basılı tutarak ibreyi yeşil koridorda tut! Motor ısısına dikkat et!"
        : "Hold SPACE to keep velocity in the green corridor! Monitor engine heat!";
    }
    if (phase === "stage2_eva_flight") {
      return lang === "tr"
        ? "Sıfır yerçekimi eylemsizliği aktif! WASD ile hasarlı anten kutusuna uç, döküntülere dikkat!"
        : "Zero-G inertia active! Steer with WASD to the comms box, dodge drifting debris to conserve O2!";
    }
    if (phase === "stage2_panel_repair") {
      if (!isCoverRemoved) {
        return lang === "tr"
          ? "Tork anahtarını 4 köşe cıvatasının üstünde basılı tutarak kapağı sök!"
          : "Hold Torque Wrench on all 4 corner hex bolts to unthread the cover!";
      }
      if (transponderHeat > 0) {
        return lang === "tr"
          ? "UYARI: Transponder 380°C! Dokunmadan önce soğutucu gaz püskürt!"
          : "WARNING: Transponder is 380°C! Spray coolant before pulling!";
      }
      if (!isDamagedEjected) {
        return lang === "tr" ? "Soğuyan hasarlı transponderi yuvasından çıkar!" : "Eject the cooled damaged transponder!";
      }
      if (!isSpareInstalled) {
        return lang === "tr" ? "Yeni yeşil transponderi yuvasına tak!" : "Insert the clean green transponder!";
      }
      if (!isSolderedComplete) {
        return lang === "tr"
          ? "Hareket eden kıvılcım 4 pinin üzerine geldiğinde tıkla ve lehimle!"
          : "Click each pin when the spark aligns to solder!";
      }
      if (!isRewiredComplete) {
        return lang === "tr"
          ? "4 renkli kabloyu eşleşen renkteki soketlere bağla!"
          : "Connect all 4 colored cables to their matching sockets!";
      }
      return lang === "tr"
        ? "Genlik ve Faz kaydırıcılarını ayarla, sinyali %100'e kilitle!"
        : "Tune Amplitude & Phase sliders until signal locks at 100%!";
    }
    return "";
  };

  return (
    <main
      className="relative w-screen h-screen min-h-[640px] overflow-hidden select-none bg-[#030a14] font-sans text-slate-100 flex flex-col"
      style={{
        transform:
          shakeOffset.x !== 0 || shakeOffset.y !== 0
            ? `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`
            : "none",
      }}
    >
      {/* ───────────────────────────────────────────────────────────── */}
      {/* 1. FULL-SCREEN NASA ISS BACKGROUND WITH ORBITAL-CYAN TINT     */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/images/dest-iss.jpg"
          alt="NASA International Space Station Orbit"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter brightness-[0.72] contrast-[1.08]"
        />
        {/* Deep Orbital Vignette & CRT Scanlines */}
        <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px]" />
        <div className="fixed inset-0 crt-overlay z-40 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#00f0ff_1px,transparent_1px)] [background-size:24px_24px] opacity-15" />
      </div>

      {/* Floating Arcade Points Popups */}
      {popups.map((p) => (
        <div
          key={p.id}
          className="fixed z-50 pointer-events-none font-press-start text-xs sm:text-sm animate-bounce drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          style={{ left: `${p.x}%`, top: `${p.y}%`, color: p.color }}
        >
          {p.text}
        </div>
      ))}

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 2. TOP HUD HEADER BAR                                         */}
      {/* ───────────────────────────────────────────────────────────── */}
      <header className="relative z-30 w-full px-4 sm:px-8 py-3 flex items-center justify-between border-b-2 border-cyan-400/50 bg-[#020b14]/90 backdrop-blur-md shadow-[4px_4px_0px_#000]">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onAbort}
            className="px-3 py-1.5 bg-[#031422] hover:bg-[#062438] border-2 border-cyan-400 text-cyan-200 text-xs font-press-start shadow-[3px_3px_0px_#000] arcade-btn flex items-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">{lang === "tr" ? "GERİ / ÇIKIŞ" : "ABORT"}</span>
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#031422] border-2 border-cyan-400/80 shadow-[3px_3px_0px_#000]">
            <span className="w-2 h-2 rounded-none bg-cyan-400 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-press-start text-cyan-100 uppercase">
              {phase === "stage1_cargo"
                ? lang === "tr" ? "AŞAMA 1: 4x4 ROKET AMBARI" : "STAGE 1: 4x4 ROCKET HOLD"
                : phase === "stage1_launch"
                ? lang === "tr" ? "AŞAMA 1: AKTİF İTKİ & FIRLATMA" : "STAGE 1: ACTIVE LAUNCH"
                : phase === "stage2_eva_flight"
                ? lang === "tr" ? "AŞAMA 2: SIFIR-G UZAY YÜRÜYÜŞÜ" : "STAGE 2: ZERO-G EVA FLIGHT"
                : phase === "stage2_panel_repair"
                ? lang === "tr" ? "AŞAMA 2: HARİCİ PANEL TAMİRİ" : "STAGE 2: COMMS PANEL REPAIR"
                : lang === "tr" ? "NASA GÖREV DEBRİFİNGİ" : "NASA MISSION DEBRIEF"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#031422] border-2 border-cyan-400/60 shadow-[3px_3px_0px_#000]">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-press-start text-amber-300">
              {score.toString().padStart(6, "0")} PTS
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleSound}
            className="p-2 bg-[#031422] hover:bg-[#062438] border-2 border-cyan-400 text-cyan-200 shadow-[3px_3px_0px_#000] arcade-btn cursor-pointer"
            title={soundOn ? "Mute SFX" : "Unmute SFX"}
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>
        </div>
      </header>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 3. MAIN GAMEPLAY VIEWPORTS                                    */}
      {/* ───────────────────────────────────────────────────────────── */}
      <div className="relative z-20 flex-1 w-full overflow-hidden flex flex-col items-center justify-center p-2 sm:p-5">
        {/* ═══════════════════════════════════════════════════════════ */}
        {/* OVERLAY: FULL BRIEFING CARD (15.14.33.jpeg DIALOGUE BOX)    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {(phase === "trans_intro_briefing" || phase === "trans_launch_success") && (
          <div
            className="relative w-full max-w-4xl h-[520px] max-h-[85vh] border-2 border-cyan-400 shadow-[8px_8px_0px_#000] overflow-hidden cursor-pointer"
            onClick={handleSkipTypewriter}
          >
            {/* Background WhatsApp Image */}
            <Image
              src="/images/iss-dialogue-card.jpg"
              alt="NASA Mission Commander Dialogue Overlay"
              fill
              priority
              className="object-cover object-center filter brightness-[0.95]"
            />

            {/* Typewriter Text inside the Cyan Dialogue Frame on Bottom Right */}
            <div className="absolute left-[24%] right-[3%] bottom-[5%] top-[58%] p-3 sm:p-5 flex flex-col justify-between pointer-events-none">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-2 h-2 bg-cyan-400 animate-ping" />
                  <span className="font-orbitron font-bold text-[10px] sm:text-xs text-cyan-300 tracking-widest uppercase">
                    COMMS // CMDR {playerName.toUpperCase()}
                  </span>
                </div>
                <p className="font-pixel-body text-slate-100 text-sm sm:text-base md:text-lg leading-snug drop-shadow-[0_2px_4px_#000]">
                  {currentBriefingFullText.slice(0, typewriterIndex)}
                  {!isTypewriterDone && <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[9px] font-silkscreen text-cyan-400/80">
                  {isTypewriterDone
                    ? lang === "tr" ? "DEVAM ETMEK İÇİN TIKLAYIN >" : "CLICK TO CONTINUE >"
                    : lang === "tr" ? "GEÇMEK İÇİN TIKLAYIN..." : "CLICK TO SKIP..."}
                </span>

                <button
                  type="button"
                  className="pointer-events-auto px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 border-2 border-white text-white font-press-start text-[10px] uppercase shadow-[3px_3px_0px_#000] animate-pulse"
                >
                  {isTypewriterDone
                    ? lang === "tr" ? "[ DEVAM ET > ]" : "[ CONTINUE > ]"
                    : lang === "tr" ? "[ TAMAMLA ]" : "[ FAST-FORWARD ]"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 1A: ROCKET CUTAWAY CARGO BAY & BLUEPRINT SCANNER      */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "stage1_cargo" && (
          <div className="w-full max-w-6xl bg-[#020c16]/95 border-2 border-cyan-400 p-3 sm:p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-3">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between border-b-2 border-cyan-400/40 pb-2">
              <div className="space-y-0.5">
                <h2 className="text-sm sm:text-base font-press-start text-white flex items-center gap-2">
                  <span>{lang === "tr" ? "ROKET KESİT AMBARI & YÜKLEME" : "ROCKET CUTAWAY CARGO HOLD"}</span>
                  <span className="text-[9px] font-hud-mono px-2 py-0.5 bg-cyan-950 border border-cyan-400/60 text-cyan-300">
                    PAD 39A // READY
                  </span>
                </h2>
                <p className="text-xs font-vt323 text-cyan-300">
                  {lang === "tr"
                    ? "Aletleri çevirmek için [R] tuşuna basın. 4 zorunlu tamir aletini ambar sınırlarında yerleştirin!"
                    : "Press [R] to rotate footprints. Fit all 4 required repair tools into the bay hold!"}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleRotation}
                  className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border-2 border-cyan-400 text-cyan-200 font-press-start text-[9px] sm:text-[10px] flex items-center gap-1.5 cursor-pointer arcade-btn"
                >
                  <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{lang === "tr" ? "ÇEVİR (R)" : "ROTATE (R)"}</span>
                </button>

                <div className={`px-3 py-1.5 border-2 text-xs font-press-start ${totalPayloadWeight > 100 ? "bg-red-950 border-red-500 text-red-300 animate-pulse" : "bg-[#031524] border-cyan-400 text-cyan-300"}`}>
                  {totalPayloadWeight} / 100 KG
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* ─── LEFT: 16-BIT PIXEL-ART ROCKET CUTAWAY FRAME ─── */}
              <div className="lg:col-span-6 flex flex-col items-center">
                <div className="relative w-full max-w-[420px] bg-[#020b14] border-2 border-cyan-400/80 p-2 shadow-[4px_4px_0px_#000] flex flex-col items-center">
                  {/* Rocket Nose Cone & Blinking Red Beacon */}
                  <div className="relative w-full flex flex-col items-center">
                    {/* Beacon light */}
                    <span className="w-2.5 h-2.5 rounded-none bg-red-500 animate-ping mb-1" />
                    <svg viewBox="0 0 160 36" className="w-36 h-9" shapeRendering="crispEdges">
                      <polygon points="80,2 108,34 52,34" fill="#f8fafc" stroke="#00f0ff" strokeWidth="1.5" />
                      <polygon points="80,2 86,12 74,12" fill="#ef4444" />
                      <line x1="80" y1="0" x2="80" y2="4" stroke="#94a3b8" strokeWidth="2" />
                    </svg>
                    {/* Avionics Ring */}
                    <div className="w-48 py-0.5 bg-[#081e30] border-x-2 border-cyan-400 text-[8px] font-press-start text-cyan-300 text-center tracking-wider">
                      AVIONICS // 408 KM
                    </div>
                  </div>

                  {/* Main Cutaway Body with Gantry Tower & Side Boosters */}
                  <div className="relative w-full flex items-stretch justify-center gap-1.5 py-1">
                    {/* Red Launch Gantry Tower Scaffolding (Left) */}
                    <div className="hidden sm:flex w-12 bg-red-950/40 border-r-2 border-red-600/80 flex-col justify-between py-2 px-1 relative">
                      <span className="w-1.5 h-1.5 bg-amber-400 animate-pulse self-center" />
                      <div className="text-[7px] font-mono text-red-400 -rotate-90 origin-center whitespace-nowrap">
                        GANTRY 39A
                      </div>
                      <div className="w-full h-0.5 bg-red-600/60 my-1" />
                      <div className="w-full h-0.5 bg-red-600/60 my-1" />
                      <span className="w-1.5 h-1.5 bg-red-500 animate-pulse self-center" />
                    </div>

                    {/* Left Strap-on Booster */}
                    <div className="w-7 bg-[#0f172a] border-2 border-slate-600 flex flex-col items-center justify-between py-1">
                      <polygon points="0,12 14,0 28,12" fill="#e2e8f0" />
                      <div className="w-full h-2 bg-slate-900 border-y border-slate-700" />
                      <div className="text-[6.5px] font-press-start text-slate-400 -rotate-90 my-auto">SRB-L</div>
                      <div className="w-4 h-2 bg-slate-800 border-t border-slate-600" />
                    </div>

                    {/* Central Open Cargo Bay Section */}
                    <div className="relative p-2 bg-[#030e1a] border-2 border-cyan-400 flex flex-col items-center shadow-[inset_0_0_12px_rgba(0,240,255,0.25)]">
                      {/* Top Hazard Caution Stripe */}
                      <div className="w-full h-2 bg-hazard-stripes border-b border-black mb-1.5" />

                      {/* The 4x4 Grid Matrix */}
                      <div className="grid grid-cols-4 gap-1.5 w-56 h-56 sm:w-64 sm:h-64">
                        {Array.from({ length: 16 }).map((_, idx) => {
                          const cx = idx % 4;
                          const cy = Math.floor(idx / 4);

                          const placed = placedCargo.find(
                            (p) => cx >= p.x && cx < p.x + p.w && cy >= p.y && cy < p.y + p.h
                          );
                          const itemDef = placed ? CARGO_ITEMS.find((t) => t.id === placed.itemId) : null;

                          const isHovered =
                            hoverCell &&
                            cx >= hoverCell.x &&
                            cx < hoverCell.x + activeW &&
                            cy >= hoverCell.y &&
                            cy < hoverCell.y + activeH;

                          const isValidHover = isHovered && canPlaceItem(hoverCell.x, hoverCell.y, activeW, activeH);

                          return (
                            <button
                              key={idx}
                              type="button"
                              onMouseEnter={() => setHoverCell({ x: cx, y: cy })}
                              onMouseLeave={() => setHoverCell(null)}
                              onClick={() => handleCellClick(cx, cy)}
                              className={`relative border-2 transition-all flex items-center justify-center cursor-pointer ${
                                placed
                                  ? "border-cyan-300 shadow-[inset_0_0_8px_rgba(0,240,255,0.5)]"
                                  : isHovered
                                  ? isValidHover
                                    ? "bg-emerald-500/40 border-emerald-400"
                                    : "bg-red-500/40 border-red-400"
                                  : "bg-[#04111d] hover:bg-[#071c30] border-slate-700 hover:border-cyan-400/60"
                              }`}
                              style={{ backgroundColor: placed ? itemDef?.color : undefined }}
                            >
                              {placed && (
                                <span className="text-[8px] sm:text-[9px] font-press-start text-white drop-shadow-[0_1px_2px_#000]">
                                  {itemDef?.name.split(" ")[0]}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Bottom Hazard Caution Stripe */}
                      <div className="w-full h-2 bg-hazard-stripes border-t border-black mt-1.5" />
                    </div>

                    {/* Right Strap-on Booster */}
                    <div className="w-7 bg-[#0f172a] border-2 border-slate-600 flex flex-col items-center justify-between py-1">
                      <polygon points="0,12 14,0 28,12" fill="#e2e8f0" />
                      <div className="w-full h-2 bg-slate-900 border-y border-slate-700" />
                      <div className="text-[6.5px] font-press-start text-slate-400 -rotate-90 my-auto">SRB-R</div>
                      <div className="w-4 h-2 bg-slate-800 border-t border-slate-600" />
                    </div>
                  </div>

                  {/* Launchpad Base Table, Clamps & Animated Steam Vents */}
                  <div className="relative w-full flex flex-col items-center pt-1">
                    {/* Rocket engine bells & Hold-down clamps */}
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-2.5 bg-slate-700 border border-slate-500" />
                      <div className="w-7 h-3 bg-cyan-900 border-x-2 border-cyan-400" />
                      <div className="w-5 h-2.5 bg-slate-700 border border-slate-500" />
                    </div>

                    {/* Concrete Launch Table */}
                    <div className="w-full h-5 bg-[#091522] border-2 border-cyan-400/80 flex items-center justify-between px-3 text-[8px] font-press-start text-cyan-300">
                      <span>PAD 39A</span>
                      {/* Venting steam clouds */}
                      <div className="flex items-center gap-2 text-slate-400 animate-pulse text-[10px]">
                        <span>░▒▓ STEAM TRENCH ▓▒░</span>
                      </div>
                      <span>CLAMP: LOCKED</span>
                    </div>
                  </div>
                </div>

                <div className="mt-1.5 text-center text-xs font-silkscreen text-cyan-300">
                  {lang === "tr"
                    ? `ZORUNLU ALETLER: ${packedRequiredCount} / 4 YÜKLENDİ`
                    : `REQUIRED TOOLS: ${packedRequiredCount} / 4 PACKED`}
                </div>
              </div>

              {/* ─── RIGHT: INVENTORY LIST & BLUEPRINT SCANNER ─── */}
              <div className="lg:col-span-6 flex flex-col gap-3">
                {/* 1. Tool Selection Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {CARGO_ITEMS.map((item) => {
                    const isPacked = placedCargo.some((p) => p.itemId === item.id);
                    const isSelected = selectedToolId === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          sfx.playClick(640);
                          setSelectedToolId(item.id);
                        }}
                        className={`p-2 border-2 text-left flex flex-col justify-between transition-all cursor-pointer shadow-[3px_3px_0px_#000] arcade-btn min-h-[64px] ${
                          isPacked
                            ? "bg-[#062436]/50 border-slate-600 opacity-60"
                            : isSelected
                            ? "bg-[#04243b] border-cyan-400 ring-2 ring-cyan-400"
                            : "bg-[#031524] hover:bg-[#07243c] border-slate-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[9px] font-press-start text-white truncate block">
                            {lang === "tr" ? item.nameTr.split(" ")[0] : item.name.split(" ")[0]}
                          </span>
                          {isPacked && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                        </div>

                        <div className="flex items-center justify-between text-[11px] font-vt323 text-cyan-300 pt-1">
                          <span>{item.weight} KG</span>
                          <span className="text-amber-300">[{item.w}x{item.h}]</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* 2. DEDICATED CYAN PIXEL BLUEPRINT SCANNER */}
                <div className="p-3 bg-[#02101c] border-2 border-cyan-400 shadow-[4px_4px_0px_#000] flex flex-col gap-2">
                  <div className="flex items-center justify-between border-b border-cyan-400/40 pb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-cyan-400 animate-ping" />
                      <span className="text-[10px] font-orbitron font-bold text-cyan-300 uppercase tracking-widest">
                        BLUEPRINT SCANNER // NASA SPECS
                      </span>
                    </div>
                    <span className="text-[9px] font-press-start text-amber-300">
                      {isRotated ? "ROTATED: 90°" : "NORMAL: 0°"}
                    </span>
                  </div>

                  <div className="grid grid-cols-12 gap-3 items-center">
                    {/* Holographic Pedestal with Zoomed SVG & Scanning Line */}
                    <div className="col-span-5 relative h-28 bg-black/80 border border-cyan-400/60 flex items-center justify-center overflow-hidden">
                      {/* Scanning vertical line */}
                      <div className="absolute inset-x-0 h-1 bg-cyan-400 shadow-[0_0_8px_#00f0ff] animate-pulse top-1/2 -translate-y-1/2" />
                      <div className="p-2 transform scale-125 filter drop-shadow-[0_0_10px_rgba(0,240,255,0.7)]">
                        {selectedToolDef.id === "o2_tank" && <PixelO2Tank className="w-14 h-14" />}
                        {selectedToolDef.id === "transponder" && <PixelTransponder className="w-14 h-14" />}
                        {selectedToolDef.id === "wire_kit" && <PixelWireKit className="w-14 h-14" />}
                        {selectedToolDef.id === "wrench" && <PixelTorqueWrench className="w-14 h-14" />}
                        {selectedToolDef.id === "snack_crate" && <PixelSnackCrate className="w-14 h-14" />}
                        {selectedToolDef.id === "lead_shield" && <PixelLeadShield className="w-14 h-14" />}
                      </div>
                    </div>

                    {/* Footprint Diagram Matrix & Specs */}
                    <div className="col-span-7 space-y-1.5 text-left">
                      <div className="text-xs font-press-start text-white">
                        {lang === "tr" ? selectedToolDef.nameTr : selectedToolDef.name}
                      </div>

                      {/* Footprint visualizer */}
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-silkscreen text-slate-400">FOOTPRINT:</span>
                        <div
                          className="grid gap-1 p-1 bg-black/90 border border-cyan-400"
                          style={{
                            gridTemplateColumns: `repeat(${activeW}, minmax(0, 1fr))`,
                          }}
                        >
                          {Array.from({ length: activeW * activeH }).map((_, i) => (
                            <div key={i} className="w-3 h-3 bg-cyan-400 shadow-[0_0_4px_#00f0ff]" />
                          ))}
                        </div>
                        <span className="text-[10px] font-press-start text-cyan-300">
                          {activeW}x{activeH}
                        </span>
                      </div>

                      <div className="text-[11px] font-vt323 text-slate-300 leading-snug">
                        <span className="text-cyan-400 font-bold">SUBSYSTEM: </span>
                        {lang === "tr" ? selectedToolDef.subsystemTr : selectedToolDef.subsystem}
                      </div>
                      <div className="text-[11px] font-vt323 text-slate-300 leading-snug">
                        <span className="text-cyan-400 font-bold">SPEC: </span>
                        {lang === "tr" ? selectedToolDef.specTr : selectedToolDef.spec}
                      </div>
                    </div>
                  </div>

                  {/* Educational NASA Note */}
                  <div className="p-2 bg-black/60 border-t border-cyan-400/40 text-[11px] font-vt323 text-slate-300 leading-tight">
                    <span className="text-amber-400 font-bold">NASA HARDWARE NOTE: </span>
                    {lang === "tr" ? selectedToolDef.noteTr : selectedToolDef.note}
                  </div>
                </div>

                {/* Launch Action Button */}
                <div className="pt-2 flex items-center justify-end border-t border-cyan-400/40">
                  <SciFiHudButton
                    disabled={!isCargoReadyForLaunch}
                    onClick={() => {
                      sfx.playFanfare();
                      setPhase("stage1_launch");
                    }}
                    theme="cyan"
                    code="LAUNCH_01"
                    systemStatus={isCargoReadyForLaunch ? "PAYLOAD OPTIMAL" : "INCOMPLETE"}
                    size="lg"
                  >
                    <span>{lang === "tr" ? "FIRLATMAYI BAŞLAT" : "INITIATE LAUNCH"}</span>
                  </SciFiHudButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 1B: LIVING SKY-TO-SPACE PARALLAX LAUNCH SCENERY       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "stage1_launch" && (
          <div className="w-full max-w-5xl bg-[#020d18]/90 border-2 border-cyan-400 p-3 sm:p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-3">
            {/* Telemetry Gauges Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Altitude Gauge */}
              <div className="p-2.5 bg-black/80 border-2 border-cyan-400 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center justify-between text-[10px] font-press-start text-cyan-300 mb-1">
                  <span>ALTITUDE</span>
                  <span>{altitude.toFixed(1)} / 408 KM</span>
                </div>
                <div className="w-full h-3 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-100"
                    style={{ width: `${(altitude / 408) * 100}%` }}
                  />
                </div>
              </div>

              {/* Velocity Gauge with Target Corridor */}
              <div className="p-2.5 bg-black/80 border-2 border-cyan-400 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center justify-between text-[10px] font-press-start text-cyan-300 mb-1">
                  <span>VELOCITY</span>
                  <span className={isInsideCorridor ? "text-emerald-400" : "text-amber-400"}>
                    {Math.round(velocity)} KM/H
                  </span>
                </div>
                <div className="relative w-full h-3 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className="absolute top-0 bottom-0 bg-emerald-500/40 border-x border-emerald-400"
                    style={{
                      left: `${(targetMinVelocity / 28000) * 100}%`,
                      width: `${((targetMaxVelocity - targetMinVelocity) / 28000) * 100}%`,
                    }}
                  />
                  <div
                    className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_#ffffff]"
                    style={{ left: `${(velocity / 28000) * 100}%` }}
                  />
                </div>
              </div>

              {/* Engine Heat Gauge */}
              <div className="p-2.5 bg-black/80 border-2 border-cyan-400 shadow-[3px_3px_0px_#000]">
                <div className="flex items-center justify-between text-[10px] font-press-start mb-1">
                  <span className={isOverheated ? "text-red-400 animate-pulse" : "text-cyan-300"}>
                    {isOverheated ? "OVERHEAT STALL!" : "ENGINE HEAT"}
                  </span>
                  <span className={engineHeat > 80 ? "text-red-400" : "text-amber-300"}>
                    {Math.round(engineHeat)}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-75 ${
                      isOverheated ? "bg-red-500 animate-pulse" : engineHeat > 75 ? "bg-red-400" : "bg-amber-400"
                    }`}
                    style={{ width: `${engineHeat}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Launch Center Parallax Stage & Canvas */}
            <div className="relative w-full h-68 sm:h-76 bg-slate-950 border-2 border-cyan-400/80 overflow-hidden">
              <canvas ref={launchCanvasRef} width={800} height={320} className="absolute inset-0 w-full h-full" />

              {/* Pixel Rocket in Center */}
              <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <svg viewBox="0 0 32 48" className="w-12 h-16 drop-shadow-[0_0_14px_#00f0ff]" shapeRendering="crispEdges">
                  <polygon points="16,2 22,14 10,14" fill="#ef4444" />
                  <rect x="11" y="14" width="10" height="22" fill="#f8fafc" />
                  <circle cx="16" cy="22" r="3" fill="#00f0ff" />
                  <polygon points="10,26 6,34 11,34" fill="#0284c7" />
                  <polygon points="22,26 26,34 21,34" fill="#0284c7" />
                  <rect x="13" y="36" width="6" height="3" fill="#64748b" />
                </svg>
              </div>

              {/* Space Debris Point-Defense Targets */}
              {altitude >= 180 &&
                altitude <= 300 &&
                debrisChunks.map((deb) => {
                  if (deb.zapped) return null;
                  return (
                    <button
                      key={deb.id}
                      type="button"
                      onClick={() => handleZapDebris(deb.id, deb.x, deb.y)}
                      className="absolute p-2 bg-red-950/90 border-2 border-red-500 text-red-200 font-press-start text-[8px] animate-bounce cursor-crosshair shadow-[3px_3px_0px_#000] arcade-btn flex items-center gap-1.5 z-30"
                      style={{ left: `${deb.x}%`, top: `${deb.y}%` }}
                    >
                      <Crosshair className="w-3.5 h-3.5 text-red-400 animate-spin" />
                      <span>[ ZAP: {deb.name} ]</span>
                    </button>
                  );
                })}

              {/* Timing Gate Overlay (Separation or Insertion) */}
              {timingEvent !== "none" && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-80 p-3 bg-black/90 border-2 border-cyan-400 shadow-[4px_4px_0px_#000] z-30 flex flex-col gap-2">
                  <div className="text-[10px] font-press-start text-cyan-300 text-center animate-pulse">
                    {timingEvent === "separation" ? "STAGE SEPARATION AT 120 KM" : "ORBITAL INSERTION AT 350 KM"}
                  </div>
                  <div className="relative w-full h-4 bg-slate-900 border border-cyan-400">
                    <div className="absolute top-0 bottom-0 left-[40%] width-[20%] w-[20%] bg-emerald-500/50 border-x border-emerald-400" />
                    <div
                      className="absolute top-0 bottom-0 w-2 bg-white shadow-[0_0_8px_#ffffff]"
                      style={{ left: `${timingNeedle}%` }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleTimingGateClick}
                    className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 border-2 border-white text-white font-press-start text-xs uppercase shadow-[3px_3px_0px_#000] arcade-btn"
                  >
                    [ EXECUTE COMMAND ]
                  </button>
                </div>
              )}
            </div>

            {/* Launch Controls Bar */}
            <div className="flex items-center justify-between border-t border-cyan-400/40 pt-2">
              <span className="text-xs font-vt323 text-cyan-300">
                {lang === "tr"
                  ? "BOŞLUK (SPACE) tuşuna basılı tutun veya butona basarak itki uygulayın."
                  : "Hold SPACEBAR or hold the button below to fire orbital thrusters."}
              </span>

              <button
                type="button"
                onMouseDown={() => setIsThrustingActive(true)}
                onMouseUp={() => setIsThrustingActive(false)}
                onTouchStart={() => setIsThrustingActive(true)}
                onTouchEnd={() => setIsThrustingActive(false)}
                disabled={isOverheated}
                className={`px-8 py-3.5 border-2 font-orbitron font-extrabold text-sm uppercase shadow-[4px_4px_0px_#000] arcade-btn flex items-center gap-2 cursor-pointer ${
                  isOverheated
                    ? "bg-red-950 border-red-500 text-red-400 cursor-not-allowed"
                    : "bg-cyan-600 hover:bg-cyan-500 border-white text-white"
                }`}
              >
                <Flame className="w-4 h-4 text-amber-300" />
                <span>{isOverheated ? "OVERHEATED!" : "HOLD: THRUSTER (SPACE)"}</span>
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 2A: ZERO-G INERTIA EVA FLIGHT WITH VISOR HUD          */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "stage2_eva_flight" && (
          <div className="w-full max-w-5xl bg-[#020d18]/90 border-2 border-cyan-400 p-3 sm:p-5 shadow-[6px_6px_0px_#000] flex flex-col gap-2.5">
            {/* Top O2 & Telemetry Bar */}
            <div className="flex items-center justify-between border-b-2 border-cyan-400/40 pb-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-press-start text-cyan-300">EVA OXYGEN SUPPLY:</span>
                <div className="w-36 sm:w-48 h-3.5 bg-slate-900 border border-slate-700 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-100 ${
                      o2Level < 25 ? "bg-red-500 animate-pulse" : "bg-cyan-400"
                    }`}
                    style={{ width: `${o2Level}%` }}
                  />
                </div>
                <span className={`text-xs font-press-start ${o2Level < 25 ? "text-red-400" : "text-white"}`}>
                  {Math.round(o2Level)}%
                </span>
              </div>

              <div className="text-xs font-vt323 text-cyan-300">
                DISTANCE TO COMMS BOX: {distanceToPanel.toFixed(1)} M
              </div>
            </div>

            {/* Zero-G Flight Canvas Area with Rich ISS Exterior & Visor HUD */}
            <div
              className="relative w-full h-80 sm:h-96 bg-black/85 border-2 border-cyan-400/80 overflow-hidden cursor-crosshair"
              onClick={handleEvaCanvasClick}
            >
              {/* ─── 1. DECORATIVE ISS SOLAR ARRAYS & TRUSS STRUCTURE ─── */}
              {/* Gold-tinted rotating solar array wings */}
              <div className="absolute right-0 top-0 bottom-0 w-64 pointer-events-none opacity-85 overflow-hidden flex flex-col justify-around py-2">
                {/* Upper Solar Wing with Photovoltaic Gridlines */}
                <div className="w-48 h-24 bg-[#ca8a04]/80 border-2 border-[#facc15] shadow-[0_0_12px_rgba(202,138,4,0.5)] self-end transform rotate-[-2deg]">
                  <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-0.5 p-0.5 opacity-60">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-[#a16207] border border-[#fef08a]" />
                    ))}
                  </div>
                </div>

                {/* Central Metallic P6 Truss Segment */}
                <div className="w-56 h-14 bg-[#0a1b2a] border-y-2 border-cyan-400/70 self-end flex items-center justify-between px-3">
                  <span className="text-[8px] font-press-start text-cyan-300">P6 TRUSS</span>
                  <div className="flex items-center gap-1.5">
                    {/* Blinking Navigation Strobes */}
                    <span className="w-2 h-2 rounded-none bg-emerald-400 animate-ping" />
                    <span className="w-2 h-2 rounded-none bg-red-500 animate-pulse" />
                  </div>
                </div>

                {/* Lower Solar Wing with Photovoltaic Gridlines */}
                <div className="w-48 h-24 bg-[#ca8a04]/80 border-2 border-[#facc15] shadow-[0_0_12px_rgba(202,138,4,0.5)] self-end transform rotate-[2deg]">
                  <div className="w-full h-full grid grid-cols-4 grid-rows-3 gap-0.5 p-0.5 opacity-60">
                    {Array.from({ length: 12 }).map((_, i) => (
                      <div key={i} className="bg-[#a16207] border border-[#fef08a]" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Sparkling Comms Junction Box on the Truss */}
              <div
                className={`absolute w-14 h-14 bg-[#062438] border-2 flex flex-col items-center justify-center transition-all ${
                  isNearPanel
                    ? "border-emerald-400 shadow-[0_0_16px_#10b981] animate-pulse"
                    : "border-cyan-400 shadow-[0_0_10px_#00f0ff]"
                }`}
                style={{ left: `${PANEL_TARGET.x}%`, top: `${PANEL_TARGET.y}%` }}
              >
                <Zap className="w-5 h-5 text-amber-400 animate-bounce" />
                <span className="text-[7px] font-press-start text-cyan-200">COMMS</span>
              </div>

              {/* Drifting Space Debris Hazards */}
              {evaHazards.map((h) => (
                <div
                  key={h.id}
                  className="absolute w-4 h-4 bg-red-500 border border-red-300 shadow-[0_0_8px_#ef4444] animate-spin pointer-events-none"
                  style={{ left: `${h.x}%`, top: `${h.y}%` }}
                />
              ))}

              {/* Astronaut Sprite with True Zero-G Inertia */}
              <div
                className="absolute transition-transform duration-75 pointer-events-none z-20"
                style={{
                  left: `${astroPos.x}%`,
                  top: `${astroPos.y}%`,
                  transform: `translate(-50%, -50%) scaleX(${astroFacing})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/character.png"
                  alt="Astronaut Commander in Zero-G"
                  className="w-14 h-14 object-contain pixelated drop-shadow-[0_0_8px_rgba(0,240,255,0.7)]"
                />

                {/* Jetpack Puff Particles */}
                {isThrustingEva && (
                  <div className="absolute -left-3 top-6 w-2 h-2 bg-cyan-300 animate-ping" />
                )}
              </div>

              {/* ─── 2. ASTRONAUT HELMET VISOR HUD OVERLAY ─── */}
              {/* Visor 4 Corner Angled Brackets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

              {/* Visor Top Telemetry Ticker */}
              <div className="absolute top-2 inset-x-8 flex items-center justify-between text-[8px] font-mono text-cyan-400/80 pointer-events-none">
                <span>[ VISOR HUD: OPTICAL 1.0 ]</span>
                <span>BEARING: 248° WSW</span>
                <span>LEO ORBIT: 408 KM</span>
              </div>

              {/* Visor Bottom Telemetry */}
              <div className="absolute bottom-2 inset-x-8 flex items-center justify-between text-[8px] font-mono text-cyan-400/80 pointer-events-none">
                <span>SUIT PRESSURE: 4.3 PSI</span>
                <span>SUIT TEMP: 21.4°C // TETHER: NOMINAL</span>
              </div>

              {/* Near Panel Prompt */}
              {isNearPanel && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-black/95 border-2 border-emerald-400 text-emerald-300 font-press-start text-xs uppercase shadow-[4px_4px_0px_#000] animate-bounce z-30">
                  {lang === "tr" ? "[ E ] TUŞUNA BASIN // PANELİ AÇIN" : "PRESS [ E ] // OPEN COMMS PANEL"}
                </div>
              )}
            </div>

            {/* Flight Instructions & Action */}
            <div className="flex items-center justify-between border-t border-cyan-400/40 pt-2">
              <span className="text-xs font-vt323 text-cyan-300">
                {lang === "tr"
                  ? "WASD / Yön tuşları ile sıfır yerçekiminde süzülün veya hedef konuma tıklayın."
                  : "Use WASD or tap to drift in zero-gravity with inertia."}
              </span>

              {isNearPanel && (
                <SciFiHudButton
                  onClick={() => {
                    sfx.playCoin();
                    setPhase("stage2_panel_repair");
                  }}
                  theme="cyan"
                  code="PANEL_01"
                  systemStatus="APPROACH CONFIRMED"
                  size="md"
                >
                  <span>{lang === "tr" ? "PANELİ AÇ" : "OPEN PANEL"}</span>
                </SciFiHudButton>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STAGE 2B: HANDS-ON COMMS BOX REPAIR (BOLTS, SOLDER, WAVE)    */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "stage2_panel_repair" && (
          <div className="w-full max-w-5xl bg-[#020d18]/95 border-2 border-cyan-400 p-4 sm:p-6 shadow-[6px_6px_0px_#000] flex flex-col gap-4">
            <div className="flex items-center justify-between border-b-2 border-cyan-400/40 pb-2">
              <div>
                <h2 className="text-base sm:text-lg font-press-start text-white">
                  {lang === "tr" ? "HARİCİ SİNYAL PANELİ TAMİRİ" : "EXTERNAL COMMS PANEL REPAIR"}
                </h2>
                <span className="text-xs font-vt323 text-cyan-300">
                  {!isCoverRemoved
                    ? lang === "tr" ? "ADIM 1: TORK ANAHTARI İLE 4 KÖŞE VİDASINI SÖKÜN" : "STEP 1: UNTHREAD 4 CORNER HEX BOLTS WITH TORQUE WRENCH"
                    : !isSolderedComplete
                    ? lang === "tr" ? "ADIM 2: TRANSPONDERİ SOĞUTUN, DEĞİŞTİRİN VE 4 PİNİ LEHİMLEYİN" : "STEP 2: COOL TRANSPONDER, SWAP & SOLDER 4 PINS"
                    : lang === "tr" ? "ADIM 3: KABLOLARI BAĞLAYIN VE OSİLOSKOP SİNYALİNİ KİLİTLEYİN" : "STEP 3: REWIRE BUS & LOCK OSCILLOSCOPE FREQUENCY"}
                </span>
              </div>

              <div className="px-3 py-1.5 bg-[#031524] border-2 border-cyan-400 text-xs font-press-start text-emerald-400">
                {isCoverRemoved && isSolderedComplete && isRewiredComplete ? "SIGNAL READY" : "HARDWARE INCOMPLETE"}
              </div>
            </div>

            {/* Panel Interactive Work Area */}
            <div className="relative w-full min-h-[300px] sm:min-h-[340px] bg-black/90 border-2 border-cyan-400/80 p-5 shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              {/* SUB-STEP 1: 4 HEX BOLTS UNTHREADING */}
              {!isCoverRemoved ? (
                <div className="relative w-full h-72 bg-[#041624] border-2 border-slate-600 flex items-center justify-center">
                  <div className="text-center font-press-start text-xs text-slate-300 space-y-2 pointer-events-none">
                    <Wrench className="w-8 h-8 text-cyan-400 mx-auto animate-bounce" />
                    <div>{lang === "tr" ? "KORUYUCU DIŞ PANEL KAPAĞI" : "PROTECTIVE COVER PLATE"}</div>
                    <p className="text-[10px] text-cyan-300 font-pixel">
                      {lang === "tr" ? "Her cıvatanın üzerinde fareyi basılı tutun." : "Click and hold on each corner bolt."}
                    </p>
                  </div>

                  {/* 4 Corner Hex Bolts */}
                  {["TL", "TR", "BL", "BR"].map((boltId) => {
                    const isUnbolted = unboltedBolts.includes(boltId);
                    const isHoldingThis = holdingBolt === boltId;
                    const posClasses = {
                      TL: "top-4 left-4",
                      TR: "top-4 right-4",
                      BL: "bottom-4 left-4",
                      BR: "bottom-4 right-4",
                    }[boltId];

                    return (
                      <button
                        key={boltId}
                        type="button"
                        disabled={isUnbolted}
                        onMouseDown={() => {
                          if (!isUnbolted) {
                            setHoldingBolt(boltId);
                            setBoltTorqueProgress(0);
                          }
                        }}
                        onMouseUp={() => {
                          if (isHoldingThis) setHoldingBolt(null);
                        }}
                        onTouchStart={() => {
                          if (!isUnbolted) {
                            setHoldingBolt(boltId);
                            setBoltTorqueProgress(0);
                          }
                        }}
                        onTouchEnd={() => {
                          if (isHoldingThis) setHoldingBolt(null);
                        }}
                        className={`absolute ${posClasses} w-14 h-14 border-2 flex flex-col items-center justify-center cursor-pointer shadow-[3px_3px_0px_#000] arcade-btn ${
                          isUnbolted
                            ? "bg-slate-900 border-slate-700 opacity-30 cursor-not-allowed"
                            : isHoldingThis
                            ? "bg-cyan-600 border-white ring-2 ring-cyan-300"
                            : "bg-[#051c2e] hover:bg-[#082a44] border-cyan-400"
                        }`}
                      >
                        <Wrench className="w-5 h-5 text-cyan-200" />
                        <span className="text-[8px] font-press-start text-white">
                          {isUnbolted ? "OFF" : isHoldingThis ? `${boltTorqueProgress}%` : "HOLD"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* SUB-STEP 2 & 3: INTERIOR HARDWARE (COOLANT, SOLDER, REWIRE, OSCILLOSCOPE) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                  {/* Left Column: Transponder Unit & Solder Pins */}
                  <div className="lg:col-span-6 flex flex-col gap-3 p-3 bg-[#031524] border border-cyan-400/50">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="text-[10px] font-press-start text-cyan-300">TDRS TRANSPONDER SOCKET</span>
                      <span className={`text-[10px] font-press-start ${transponderHeat > 0 ? "text-red-400" : "text-emerald-400"}`}>
                        {transponderHeat > 0 ? `${transponderHeat * 3.8}°C (HOT)` : "0°C (COLD)"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 py-2">
                      <div className="w-20 h-20 bg-black/80 border-2 border-slate-700 flex items-center justify-center">
                        {!isDamagedEjected ? (
                          <PixelTransponder className="w-16 h-16" damaged={true} />
                        ) : isSpareInstalled ? (
                          <PixelTransponder className="w-16 h-16" damaged={false} />
                        ) : (
                          <span className="text-[9px] font-press-start text-slate-500">EMPTY</span>
                        )}
                      </div>

                      <div className="flex-1 flex flex-col gap-2">
                        {transponderHeat > 0 ? (
                          <button
                            type="button"
                            onMouseDown={() => setIsSprayingCoolant(true)}
                            onMouseUp={() => setIsSprayingCoolant(false)}
                            onTouchStart={() => setIsSprayingCoolant(true)}
                            onTouchEnd={() => setIsSprayingCoolant(false)}
                            className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 border-2 border-cyan-300 text-white font-press-start text-[10px] flex items-center gap-2 cursor-pointer arcade-btn"
                          >
                            <Wind className="w-4 h-4" />
                            <span>{lang === "tr" ? "HOLD: SOĞUTUCU GAZI SIK" : "HOLD: SPRAY COOLANT"}</span>
                          </button>
                        ) : !isDamagedEjected ? (
                          <button
                            type="button"
                            onClick={() => {
                              sfx.playCoin();
                              setIsDamagedEjected(true);
                              addScore(300, "BURNT TRANSPONDER EJECTED!");
                            }}
                            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 border-2 border-white text-white font-press-start text-[10px] cursor-pointer arcade-btn"
                          >
                            {lang === "tr" ? "HASARLI ÜNİTEYİ ÇIKAR" : "EJECT BURNT UNIT"}
                          </button>
                        ) : !isSpareInstalled ? (
                          <button
                            type="button"
                            onClick={() => {
                              sfx.playCoin();
                              setIsSpareInstalled(true);
                              addScore(500, "NEW TRANSPONDER INSTALLED!");
                            }}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 border-2 border-white text-white font-press-start text-[10px] cursor-pointer arcade-btn"
                          >
                            {lang === "tr" ? "YEDEK TRANSPONDERİ TAK" : "INSTALL SPARE UNIT"}
                          </button>
                        ) : (
                          <span className="text-xs font-press-start text-emerald-400">
                            TRANSPONDER MOUNTED!
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 4 Precision Solder Pins */}
                    {isSpareInstalled && !isSolderedComplete && (
                      <div className="p-2 bg-black/80 border border-slate-700 flex flex-col gap-2">
                        <div className="text-[9px] font-press-start text-cyan-300">
                          {lang === "tr" ? "KIVILCIM PİNİN ÜSTÜNDEYKEN TIKLA:" : "CLICK PIN AS SPARK ALIGNS:"}
                        </div>

                        {/* Moving spark bar */}
                        <div className="relative w-full h-3 bg-slate-900 border border-slate-700">
                          <div
                            className="absolute top-0 bottom-0 w-3 bg-amber-300 shadow-[0_0_8px_#f59e0b]"
                            style={{ left: `${solderSparkPos}%` }}
                          />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {[0, 1, 2, 3].map((pinIdx) => {
                            const isSoldered = solderedPins.includes(pinIdx);
                            return (
                              <button
                                key={pinIdx}
                                type="button"
                                onClick={() => handleSolderPinClick(pinIdx)}
                                className={`py-1.5 border font-press-start text-[9px] cursor-pointer arcade-btn ${
                                  isSoldered
                                    ? "bg-emerald-600 border-emerald-400 text-white"
                                    : "bg-slate-800 hover:bg-slate-700 border-amber-400 text-amber-200"
                                }`}
                              >
                                {isSoldered ? "OK" : `PIN #${pinIdx + 1}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Rewiring & Live CRT Oscilloscope */}
                  <div className="lg:col-span-6 flex flex-col gap-3 p-3 bg-[#031524] border border-cyan-400/50">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="text-[10px] font-press-start text-cyan-300">BUS REWIRING & FREQUENCY</span>
                      <span className="text-[10px] font-press-start text-emerald-400">
                        LOCK: {signalMatchPercent}%
                      </span>
                    </div>

                    {/* 4 Color Wires to Sockets */}
                    {!isRewiredComplete && (
                      <div className="p-2 bg-black/80 border border-slate-700 grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-press-start text-slate-400">INPUT BUS</span>
                          {["cyan", "amber", "emerald", "violet"].map((color) => {
                            const isLinked = !!connectedWires[color];
                            const isSel = selectedWire === color;
                            return (
                              <button
                                key={color}
                                type="button"
                                disabled={isLinked}
                                onClick={() => handleWireSelect(color)}
                                className={`py-1 px-2 border text-left font-press-start text-[8px] uppercase cursor-pointer arcade-btn ${
                                  isLinked
                                    ? "bg-slate-900 border-slate-700 text-slate-600 opacity-40"
                                    : isSel
                                    ? "border-white ring-2 ring-white text-white font-bold"
                                    : "border-slate-600 text-slate-200"
                                }`}
                                style={{ backgroundColor: color === "cyan" ? "#00f0ff22" : color === "amber" ? "#f59e0b22" : color === "emerald" ? "#10b98122" : "#a855f722" }}
                              >
                                {color}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <span className="text-[8px] font-press-start text-slate-400">TARGET SOCKET</span>
                          {["emerald", "cyan", "violet", "amber"].map((term) => {
                            const linkedColor = Object.keys(connectedWires).find((k) => connectedWires[k] === term);
                            return (
                              <button
                                key={term}
                                type="button"
                                onClick={() => handleTerminalSelect(term)}
                                className={`py-1 px-2 border text-left font-press-start text-[8px] uppercase cursor-pointer arcade-btn ${
                                  linkedColor
                                    ? "bg-emerald-950 border-emerald-400 text-emerald-300"
                                    : selectedWire
                                    ? "border-cyan-400 text-cyan-200 animate-pulse"
                                    : "border-slate-700 text-slate-400"
                                }`}
                              >
                                {linkedColor ? `LINKED: ${linkedColor}` : `SOCKET: ${term}`}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Live CRT Oscilloscope Canvas & Sliders */}
                    <div className="flex flex-col gap-2">
                      <div className="relative w-full h-24 border-2 border-cyan-400 overflow-hidden">
                        <canvas ref={oscCanvasRef} width={400} height={100} className="w-full h-full" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[9px] font-press-start text-cyan-300">
                        <div>
                          <span>AMPLITUDE: {waveAmplitude.toFixed(1)}</span>
                          <input
                            type="range"
                            min="0.2"
                            max="2.0"
                            step="0.1"
                            value={waveAmplitude}
                            onChange={(e) => {
                              sfx.playClick(500);
                              setWaveAmplitude(parseFloat(e.target.value));
                            }}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>

                        <div>
                          <span>PHASE: {wavePhase}°</span>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            step="15"
                            value={wavePhase}
                            onChange={(e) => {
                              sfx.playClick(500);
                              setWavePhase(parseInt(e.target.value));
                            }}
                            className="w-full accent-cyan-400 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MISSION SUCCESSFUL SCREEN (15.38.38.jpeg)                   */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "success_screen" && (
          <div className="relative w-full max-w-4xl h-[520px] max-h-[85vh] border-2 border-cyan-400 shadow-[8px_8px_0px_#000] overflow-hidden">
            {/* Background WhatsApp Success Image */}
            <Image
              src="/images/iss-success-card.jpg"
              alt="NASA Mission Successful"
              fill
              priority
              className="object-cover object-center filter brightness-[0.95]"
            />

            {/* Dynamic Overlay on Right Side */}
            <div className="absolute left-[38%] right-[3%] top-[6%] bottom-[6%] p-4 sm:p-6 bg-slate-950/85 border-2 border-cyan-400/80 backdrop-blur-md shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-cyan-400/40 pb-2">
                  <span className="text-[10px] font-press-start text-cyan-400 uppercase tracking-widest block">
                    - CONGRATULATIONS -
                  </span>
                  <h1 className="text-lg sm:text-2xl font-press-start text-white tracking-wider mt-1">
                    MISSION SUCCESSFUL
                  </h1>
                </div>

                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 bg-[#031524] border-2 border-amber-400 text-sm font-press-start text-amber-300">
                    {score.toString().padStart(6, "0")} PTS
                  </div>
                  <div className="px-3 py-1.5 bg-[#031524] border-2 border-cyan-400 text-sm font-press-start text-cyan-300">
                    {score >= 5000 ? "RANK: S" : score >= 3500 ? "RANK: A" : "RANK: B"}
                  </div>
                </div>

                <p className="font-pixel-body text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {lang === "tr"
                    ? "TDRS uydu takımyıldızı sinyal kilidi sağlandı! ISS istasyonu Houston ve tüm yer kontrol istasyonlarıyla kesintisiz geniş bant iletişimini yeniden başlattı. Tarih boyunca 11 ülkeden astronotlar ISS'de 270'ten fazla uzay yürüyüşü gerçekleştirmiştir."
                    : "TDRS satellite constellation locked! High-bandwidth downlink restored with Houston Mission Control. Astronauts from 11 nations have conducted over 270 spacewalks outside the orbital outpost since 1998."}
                </p>
              </div>

              <div className="pt-3 border-t border-cyan-400/40 flex items-center justify-between gap-3">
                <SciFiHudButton
                  onClick={() => {
                    sfx.playClick(500);
                    setPlacedCargo([]);
                    setUnboltedBolts([]);
                    setTransponderHeat(100);
                    setIsDamagedEjected(false);
                    setIsSpareInstalled(false);
                    setSolderedPins([]);
                    setConnectedWires({});
                    setScore(0);
                    setPhase("stage1_cargo");
                  }}
                  theme="silver"
                  code="RETRY"
                  systemStatus="RESET MISSION"
                  size="md"
                >
                  <span>{lang === "tr" ? "TEKRAR OYNA" : "REPLAY"}</span>
                </SciFiHudButton>

                <SciFiHudButton
                  onClick={onAbort}
                  theme="cyan"
                  code="EXIT_01"
                  systemStatus="DEBRIEF COMPLETE"
                  size="md"
                >
                  <span>{lang === "tr" ? "MENÜYE DÖN" : "RETURN TO SELECT"}</span>
                </SciFiHudButton>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* MISSION FAILED SCREEN (15.38.57.jpeg)                       */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {phase === "failed_screen" && (
          <div className="relative w-full max-w-4xl h-[520px] max-h-[85vh] border-2 border-red-500 shadow-[8px_8px_0px_#000] overflow-hidden">
            {/* Background WhatsApp Failed Image */}
            <Image
              src="/images/iss-failed-card.jpg"
              alt="NASA Mission Failed"
              fill
              priority
              className="object-cover object-center filter brightness-[0.95]"
            />

            {/* Dynamic Overlay on Right Side */}
            <div className="absolute left-[38%] right-[3%] top-[6%] bottom-[6%] p-4 sm:p-6 bg-slate-950/90 border-2 border-red-500/80 backdrop-blur-md shadow-[4px_4px_0px_#000] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="border-b border-red-500/40 pb-2">
                  <span className="text-[10px] font-press-start text-red-400 uppercase tracking-widest block">
                    - MISSION FAILED -
                  </span>
                  <h1 className="text-lg sm:text-2xl font-press-start text-white tracking-wider mt-1">
                    CRITICAL SYSTEM FAILURE
                  </h1>
                </div>

                <div className="p-3 bg-red-950/60 border border-red-500 text-xs font-press-start text-red-300">
                  {failReason || (lang === "tr" ? "GÖREV PROTOKOLÜ BAŞARISIZ OLDU." : "CRITICAL FLIGHT PARAMETER VIOLATION.")}
                </div>

                <p className="font-pixel-body text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {lang === "tr"
                    ? "Taktik İpucu: Sıfır yerçekimi uzay yürüyüşünde döküntülere çarpmamaya özen gösterin ve itki süresini minimumda tutarak oksijen seviyenizi koruyun."
                    : "Tactical Tip: In zero-G EVA, minimize thruster bursts and avoid micro-debris hazards to preserve your oxygen reserves."}
                </p>
              </div>

              <div className="pt-3 border-t border-red-500/40 flex items-center justify-between gap-3">
                <SciFiHudButton
                  onClick={() => {
                    sfx.playClick(500);
                    setPlacedCargo([]);
                    setUnboltedBolts([]);
                    setTransponderHeat(100);
                    setIsDamagedEjected(false);
                    setIsSpareInstalled(false);
                    setSolderedPins([]);
                    setConnectedWires({});
                    setScore(0);
                    setO2Level(100);
                    setAltitude(0);
                    setVelocity(0);
                    setEngineHeat(0);
                    setPhase("stage1_cargo");
                  }}
                  theme="cyan"
                  code="RETRY"
                  systemStatus="EMERGENCY RESTART"
                  size="md"
                >
                  <span>{lang === "tr" ? "GÖREVİ YENİDEN DENE" : "RETRY MISSION"}</span>
                </SciFiHudButton>

                <SciFiHudButton
                  onClick={onAbort}
                  theme="silver"
                  code="ABORT"
                  systemStatus="RETURN TO BASE"
                  size="md"
                >
                  <span>{lang === "tr" ? "ÇIKIŞ" : "ABORT TO MENU"}</span>
                </SciFiHudButton>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ───────────────────────────────────────────────────────────── */}
      {/* 4. LIVE MINI-COMMS CALLOUT BAR (DURING ACTIVE GAMEPLAY)       */}
      {/* ───────────────────────────────────────────────────────────── */}
      {phase !== "trans_intro_briefing" &&
        phase !== "trans_launch_success" &&
        phase !== "success_screen" &&
        phase !== "failed_screen" && (
          <div className="fixed bottom-3 right-3 sm:right-6 z-40 max-w-md bg-[#020c18]/95 border-2 border-cyan-400 p-2.5 shadow-[4px_4px_0px_#000] flex items-center gap-3 backdrop-blur-md">
            <div className="w-10 h-10 border border-cyan-400 shrink-0 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/commander-portrait.png"
                alt="Commander Portrait"
                className="w-full h-full object-cover pixelated"
              />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-1.5 h-1.5 bg-cyan-400 animate-ping" />
                <span className="font-orbitron font-bold text-[9px] text-cyan-300 uppercase tracking-widest">
                  COMMS // CMDR {playerName.toUpperCase()}
                </span>
              </div>
              <p className="font-vt323 text-slate-200 text-xs leading-tight truncate">
                {getCommsTip()}
              </p>
            </div>
          </div>
        )}
    </main>
  );
}
