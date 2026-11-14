"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { sounds } from "./SoundEffects";
import {
  Rocket,
  ShieldAlert,
  Battery,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  VolumeX,
  Bell,
  ArrowRight,
  Sparkles,
  Zap,
  Weight,
  Globe,
  Radio,
  Clock,
  Compass,
  Gauge,
  Cpu,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface MissionGameplayProps {
  mode: "solo" | "coop";
  lang: "tr" | "en";
  onReturnToWelcome: () => void;
  playerName?: string;
}

// Gear Item definition
interface GearItem {
  id: string;
  nameTr: string;
  nameEn: string;
  type: "chassis" | "drill" | "power" | "tank" | "non-essential";
  massKg: number;
  powerW: number; // positive = gen, negative = draw
  speedMod: number; // effect on rover drive speed
  slots: number;
  descriptionTr: string;
  descriptionEn: string;
  installed: boolean;
  requiredForAsteroid?: boolean;
}

// Deposit node on the 2D asteroid terrain
interface MineralDeposit {
  id: number;
  x: number; // position along terrain in px
  yieldKg: number;
  mined: boolean;
  type: "water_ice" | "rare_mineral";
}

export default function MissionGameplay({
  mode,
  lang,
  onReturnToWelcome,
  playerName = "Commander",
}: MissionGameplayProps) {
  // Gameplay Stages: 1 = Modular Builder, 2 = 2D Driving/Mining Canvas, 3 = Earth Return & Debrief
  const [stage, setStage] = useState<1 | 2 | 3>(1);
  const [soundOn, setSoundOn] = useState<boolean>(true);

  // ─────────────────────────────────────────────────────────────
  // STAGE 1: MODULAR ROVER BUILDER STATE
  // ─────────────────────────────────────────────────────────────
  const baseDryMass = 1400;
  const maxMassLimit = mode === "solo" ? 2850 : 3350;
  const maxCargoSlots = mode === "solo" ? 5 : 6;

  // Solo Hardcore Launch Window Countdown
  const [launchCountdown, setLaunchCountdown] = useState<number>(mode === "solo" ? 110 : 0);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);

  const [gear, setGear] = useState<GearItem[]>([
    {
      id: "heavy_wheels",
      nameTr: "Yüksek Torklu Arazi Tekerlekleri",
      nameEn: "High-Torque All-Terrain Rover Wheels",
      type: "chassis",
      massKg: 280,
      powerW: -100,
      speedMod: +3,
      slots: 0, // Yürüyen aksam/süspansiyon gövde altına monte edilir, kargo yuvası kaplamaz
      descriptionTr: "Asteroit kraterlerinde tırmanma torkunu ve sürüş hızını %40 artırır.",
      descriptionEn: "High-grip titanium mesh tires for navigating steep asteroid craters.",
      installed: true,
      requiredForAsteroid: true,
    },
    {
      id: "plasma_drill",
      nameTr: "Tungsten Plazma Buz Matkabı",
      nameEn: "Tungsten Plasma Water-Ice Auger",
      type: "drill",
      massKg: 340,
      powerW: -400,
      speedMod: -1,
      slots: 1,
      descriptionTr: "Asteroit regolitini delip buz kristallerini eriterek tanka pompalar.",
      descriptionEn: "Excavates subsurface asteroid ice veins and pumps liquid to ISRU.",
      installed: true,
      requiredForAsteroid: true,
    },
    {
      id: "isru_refinery",
      nameTr: "ISRU Termal Yakıt Rafinerisi",
      nameEn: "ISRU Thermal Propellant Plant",
      type: "drill",
      massKg: 420,
      powerW: -450,
      speedMod: -1,
      slots: 1,
      descriptionTr: "Eritilen buzu elektroliz ile Sıvı Hidrojen ve Oksijen yakıtına çevirir.",
      descriptionEn: "Splits H2O into cryogenic liquid hydrogen/oxygen return propellant.",
      installed: true,
      requiredForAsteroid: true,
    },
    {
      id: "cryo_tank",
      nameTr: "Genişletilmiş Kriyojenik Yakıt Deposu",
      nameEn: "Cryogenic Return Propellant Tank",
      type: "tank",
      massKg: 260,
      powerW: 0,
      speedMod: 0,
      slots: 1,
      descriptionTr: "Dünya'ya dönüş için rafine edilen %100 yakıt kapasitesini depolar.",
      descriptionEn: "Pressurized cryogenic dewars to store refined Earth-return fuel.",
      installed: true,
      requiredForAsteroid: true,
    },
    {
      id: "solar_wings",
      nameTr: "Açılabilir GaAs Güneş Kanatları",
      nameEn: "Deployable GaAs Solar Array Wings",
      type: "power",
      massKg: 130,
      powerW: 1100,
      speedMod: 0,
      slots: 1,
      descriptionTr: "Güneş ışığında kesintisiz 1,100W elektrik üretir.",
      descriptionEn: "Lightweight solar wings delivering 1,100W electrical generation.",
      installed: true,
    },
    {
      id: "rtg_core",
      nameTr: "Kompakt RTG Nükleer Jeneratör",
      nameEn: "Compact RTG Nuclear Power Unit",
      type: "power",
      massKg: 220,
      powerW: 600,
      speedMod: -1,
      slots: 1,
      descriptionTr: "Gölgede ve toz fırtınalarında sönmeyen sabit 600W nükleer güç.",
      descriptionEn: "Weatherproof nuclear battery immune to shadow and dust storms.",
      installed: false,
    },
    // Non-essential gear installed from lunar base (Must be stripped to stay under mass limit!)
    {
      id: "lunar_hab",
      nameTr: "Ağır Ay Yaşam Kabini (Gereksiz Yük)",
      nameEn: "Heavy Lunar Crew Cabin (Strip Me!)",
      type: "non-essential",
      massKg: 850,
      powerW: -300,
      speedMod: -3,
      slots: 2,
      descriptionTr: "Ay'da terk edilmeli! Fazla ağırlık gemiyi yere çakar.",
      descriptionEn: "Excessive weight from the Moon base. Discard to reduce mass!",
      installed: true,
    },
    {
      id: "heavy_chassis_armor",
      nameTr: "Ağır Çelik Zırh Plakaları (Gereksiz Yük)",
      nameEn: "Heavy Steel Armor Plates (Strip Me!)",
      type: "non-essential",
      massKg: 410,
      powerW: 0,
      speedMod: -2,
      slots: 1,
      descriptionTr: "Ay'da sökülmeli! Asteroit için gereksiz ölü ağırlık.",
      descriptionEn: "Strip off to lighten the rover and increase driving velocity.",
      installed: true,
    },
  ]);

  // Derived builder stats
  const currentMass = useMemo(
    () => baseDryMass + gear.filter((g) => g.installed).reduce((sum, g) => sum + g.massKg, 0),
    [gear]
  );
  const currentPowerNet = useMemo(
    () => gear.filter((g) => g.installed).reduce((sum, g) => sum + g.powerW, 0),
    [gear]
  );
  const currentCargoSlots = useMemo(
    () => gear.filter((g) => g.installed).reduce((sum, g) => sum + g.slots, 0),
    [gear]
  );
  const roverDriveSpeed = useMemo(() => {
    const baseSpeed = 4.5;
    const mod = gear.filter((g) => g.installed).reduce((sum, g) => sum + g.speedMod, 0);
    const massPenalty = currentMass > 2600 ? 1 : 0;
    return Math.max(2, baseSpeed + mod * 0.4 - massPenalty);
  }, [gear, currentMass]);

  const hasEssentialGear = useMemo(() => {
    const drill = gear.find((g) => g.id === "plasma_drill")?.installed;
    const isru = gear.find((g) => g.id === "isru_refinery")?.installed;
    const tank = gear.find((g) => g.id === "cryo_tank")?.installed;
    const wheels = gear.find((g) => g.id === "heavy_wheels")?.installed;
    return drill && isru && tank && wheels;
  }, [gear]);

  const isStage1Valid =
    currentMass <= maxMassLimit &&
    currentPowerNet >= 0 &&
    currentCargoSlots <= maxCargoSlots &&
    hasEssentialGear &&
    !timerExpired;

  // Toggle item in builder
  const toggleGear = (id: string) => {
    sounds.playClick();
    setGear((prev) =>
      prev.map((item) => (item.id === id ? { ...item, installed: !item.installed } : item))
    );
  };

  // Solo countdown timer for Stage 1
  useEffect(() => {
    if (stage !== 1 || mode !== "solo" || launchCountdown <= 0) return;
    const timer = setInterval(() => {
      setLaunchCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setTimerExpired(true);
          sounds.playAlarm();
          return 0;
        }
        if (prev <= 15) sounds.playClick(620);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, mode, launchCountdown]);

  // ─────────────────────────────────────────────────────────────
  // STAGE 2: PLAYABLE 2D ASTEROID DRIVING & MINING CANVAS STATE
  // ─────────────────────────────────────────────────────────────
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rover 2D Physics state
  const [roverX, setRoverX] = useState<number>(180); // X coordinate in world
  const [roverY, setRoverY] = useState<number>(240); // Y coordinate (calculated from terrain)
  const [roverAngle, setRoverAngle] = useState<number>(0); // Angle of terrain slope
  const [roverDirection, setRoverDirection] = useState<1 | -1>(1); // 1 = right, -1 = left

  // Driving & Mining Active Keys
  const [isDrivingLeft, setIsDrivingLeft] = useState<boolean>(false);
  const [isDrivingRight, setIsDrivingRight] = useState<boolean>(false);
  const [isDrilling, setIsDrilling] = useState<boolean>(false);

  // Resource & Refinery Progress
  const [iceCollectedKg, setIceCollectedKg] = useState<number>(0);
  const [returnFuelPercent, setReturnFuelPercent] = useState<number>(12); // Start with 12% lunar reserve
  const [batteryPercent, setBatteryPercent] = useState<number>(100);
  const [asteroidWindowSec, setAsteroidWindowSec] = useState<number>(55); // 55s before asteroid escape

  // Terrain deposits
  const [deposits, setDeposits] = useState<MineralDeposit[]>([
    { id: 1, x: 280, yieldKg: 280, mined: false, type: "water_ice" },
    { id: 2, x: 520, yieldKg: 350, mined: false, type: "water_ice" },
    { id: 3, x: 780, yieldKg: 420, mined: false, type: "water_ice" },
    { id: 4, x: 1050, yieldKg: 300, mined: false, type: "water_ice" },
    { id: 5, x: 1320, yieldKg: 480, mined: false, type: "water_ice" },
  ]);

  // Space Crisis state during Stage 2
  const [crisisActive, setCrisisActive] = useState<boolean>(false);
  const [crisisType, setCrisisType] = useState<"dust" | "surge" | null>(null);
  const crisisTriggeredRef = useRef<boolean>(false);

  // Keyboard controls listener for A/D/Arrows/Space
  useEffect(() => {
    if (stage !== 2) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setIsDrivingLeft(true);
        setRoverDirection(-1);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        setIsDrivingRight(true);
        setRoverDirection(1);
      } else if (e.code === "Space") {
        e.preventDefault();
        setIsDrilling(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyA" || e.code === "ArrowLeft") {
        setIsDrivingLeft(false);
      } else if (e.code === "KeyD" || e.code === "ArrowRight") {
        setIsDrivingRight(false);
      } else if (e.code === "Space") {
        setIsDrilling(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [stage]);

  // Asteroid departure countdown timer
  useEffect(() => {
    if (stage !== 2 || asteroidWindowSec <= 0) return;
    const timer = setInterval(() => {
      setAsteroidWindowSec((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        // Trigger mid-operation crisis around halfway mark
        if (t === 28 && !crisisTriggeredRef.current) {
          crisisTriggeredRef.current = true;
          setCrisisActive(true);
          setCrisisType(Math.random() > 0.5 ? "dust" : "surge");
          sounds.playAlarm();
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage, asteroidWindowSec]);

  // Terrain height function for rolling 2D asteroid craters & hills
  const getTerrainHeight = useCallback((x: number) => {
    const baseLine = 260;
    const wave1 = Math.sin(x * 0.008) * 28;
    const wave2 = Math.sin(x * 0.02) * 14;
    const crater = Math.sin(x * 0.003 + 1.2) * 20;
    return baseLine + wave1 + wave2 + crater;
  }, []);

  // Main 60FPS Game Loop for Stage 2 Driving & Physics
  useEffect(() => {
    if (stage !== 2 || crisisActive) return;

    let animId: number;
    const worldWidth = 1600;

    const gameLoop = () => {
      // 1. Move Rover horizontally
      setRoverX((prevX) => {
        let nextX = prevX;
        if (isDrivingLeft) nextX = Math.max(60, prevX - roverDriveSpeed);
        if (isDrivingRight) nextX = Math.min(worldWidth - 60, prevX + roverDriveSpeed);

        // Update Y and slope angle based on terrain
        const curY = getTerrainHeight(nextX);
        const nextStepY = getTerrainHeight(nextX + 10);
        const slopeAngle = Math.atan2(nextStepY - curY, 10);

        setRoverY(curY);
        setRoverAngle(slopeAngle);

        return nextX;
      });

      // 2. Battery consumption & Solar recharge
      setBatteryPercent((prevBat) => {
        let drain = 0;
        if (isDrivingLeft || isDrivingRight) drain += 0.06;
        if (isDrilling) drain += 0.12;

        const solarEquipped = gear.find((g) => g.id === "solar_wings")?.installed;
        const rtgEquipped = gear.find((g) => g.id === "rtg_core")?.installed;
        const recharge = (solarEquipped ? 0.07 : 0) + (rtgEquipped ? 0.05 : 0);

        return Math.max(0, Math.min(100, prevBat - drain + recharge));
      });

      // 3. Mining Drill Logic (If player holds Space over an ice node)
      if (isDrilling) {
        setDeposits((prevDeposits) => {
          return prevDeposits.map((node) => {
            // Check distance to rover
            const dist = Math.abs(node.x - roverX);
            if (dist < 45 && !node.mined) {
              // Yield ice
              const minedAmount = 1.8;
              setIceCollectedKg((ice) => Math.min(1600, ice + minedAmount));
              setReturnFuelPercent((fuel) =>
                Math.min(100, Math.round((fuel + minedAmount * 0.11) * 10) / 10)
              );
              if (Math.random() > 0.65) sounds.playClick(720);

              if (node.yieldKg <= minedAmount) {
                return { ...node, mined: true };
              }
              return { ...node, yieldKg: node.yieldKg - minedAmount };
            }
            return node;
          });
        });
      }

      animId = requestAnimationFrame(gameLoop);
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [stage, isDrivingLeft, isDrivingRight, isDrilling, roverDriveSpeed, roverX, getTerrainHeight, gear, crisisActive]);

  // Canvas Rendering for 2D Asteroid Driving Viewport
  useEffect(() => {
    if (stage !== 2) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Viewport camera tracking rover
    const viewWidth = canvas.width;
    const viewHeight = canvas.height;
    const cameraX = Math.max(0, roverX - viewWidth * 0.45);

    // Clear canvas
    ctx.clearRect(0, 0, viewWidth, viewHeight);

    // 1. Draw Architectural Daylight Background
    ctx.fillStyle = "#F8FAFC";
    ctx.fillRect(0, 0, viewWidth, viewHeight);

    // Faint blueprint grid lines
    ctx.strokeStyle = "rgba(37, 99, 235, 0.06)";
    ctx.lineWidth = 1;
    for (let gx = -cameraX % 40; gx < viewWidth; gx += 40) {
      ctx.beginPath();
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, viewHeight);
      ctx.stroke();
    }

    // 2. Distant Asteroid Horizon Silhouettes
    ctx.fillStyle = "#E2E8F0";
    ctx.beginPath();
    ctx.moveTo(0, viewHeight);
    for (let vx = 0; vx <= viewWidth; vx += 20) {
      const worldX = vx + cameraX;
      const bgY = 190 + Math.sin(worldX * 0.004) * 35 + Math.cos(worldX * 0.01) * 15;
      ctx.lineTo(vx, bgY);
    }
    ctx.lineTo(viewWidth, viewHeight);
    ctx.closePath();
    ctx.fill();

    // 3. Foreground Asteroid Ground Surface
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#0F172A";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, viewHeight);
    for (let vx = 0; vx <= viewWidth; vx += 8) {
      const worldX = vx + cameraX;
      const groundY = getTerrainHeight(worldX);
      ctx.lineTo(vx, groundY);
    }
    ctx.lineTo(viewWidth, viewHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ground texture hatching
    ctx.strokeStyle = "#CBD5E1";
    ctx.lineWidth = 1.5;
    for (let hx = 0; hx <= viewWidth; hx += 24) {
      const worldX = hx + cameraX;
      const groundY = getTerrainHeight(worldX);
      ctx.beginPath();
      ctx.moveTo(hx, groundY + 8);
      ctx.lineTo(hx - 8, groundY + 30);
      ctx.stroke();
    }

    // 4. Render Glowing Cyan Water-Ice Deposits on the ground
    deposits.forEach((node) => {
      const screenX = node.x - cameraX;
      if (screenX >= -40 && screenX <= viewWidth + 40) {
        const nodeY = getTerrainHeight(node.x);

        if (!node.mined) {
          // Glowing ice vein
          ctx.save();
          ctx.fillStyle = "#0284C7";
          ctx.strokeStyle = "#38BDF8";
          ctx.lineWidth = 2.5;

          // Sparkling ice crystal shapes
          ctx.beginPath();
          ctx.arc(screenX, nodeY + 4, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Ice Crystal spikes
          ctx.fillStyle = "#E0F2FE";
          ctx.beginPath();
          ctx.moveTo(screenX, nodeY - 14);
          ctx.lineTo(screenX + 8, nodeY + 4);
          ctx.lineTo(screenX - 8, nodeY + 4);
          ctx.closePath();
          ctx.fill();

          // Label above node
          ctx.fillStyle = "#0369A1";
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(`WATER-ICE (${Math.round(node.yieldKg)}kg)`, screenX, nodeY - 20);
          ctx.restore();
        } else {
          // Depleted node crater
          ctx.fillStyle = "#94A3B8";
          ctx.beginPath();
          ctx.ellipse(screenX, nodeY + 2, 12, 4, 0, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    });

    // 5. Render Player's Modular Rover
    const roverScreenX = roverX - cameraX;
    const roverScreenY = roverY - 8;

    ctx.save();
    ctx.translate(roverScreenX, roverScreenY);
    ctx.rotate(roverAngle);
    if (roverDirection === -1) ctx.scale(-1, 1);

    // Chassis Base Box
    ctx.fillStyle = "#0F172A";
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-34, -28, 68, 22, 6);
    ctx.fill();
    ctx.stroke();

    // Cockpit Visor
    ctx.fillStyle = "#38BDF8";
    ctx.beginPath();
    ctx.roundRect(4, -24, 22, 14, 4);
    ctx.fill();

    // Modular Part 1: Cryogenic Fuel Tank on Rear
    const hasTank = gear.find((g) => g.id === "cryo_tank")?.installed;
    if (hasTank) {
      ctx.fillStyle = "#E2E8F0";
      ctx.strokeStyle = "#2563EB";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(-22, -22, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // Modular Part 2: Deployable Solar Array / RTG on Top
    const hasSolar = gear.find((g) => g.id === "solar_wings")?.installed;
    const hasRTG = gear.find((g) => g.id === "rtg_core")?.installed;
    if (hasSolar) {
      ctx.fillStyle = "#1E293B";
      ctx.strokeStyle = "#0284C7";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-20, -38, 40, 6);
      ctx.strokeRect(-20, -38, 40, 6);
    } else if (hasRTG) {
      ctx.fillStyle = "#D97706";
      ctx.fillRect(-12, -36, 16, 8);
    }

    // Modular Part 3: Front Plasma Drill Arm
    const hasDrill = gear.find((g) => g.id === "plasma_drill")?.installed;
    if (hasDrill) {
      ctx.save();
      ctx.translate(34, -14);
      if (isDrilling) ctx.rotate(0.35); // Lower drill arm when active

      ctx.fillStyle = "#F59E0B";
      ctx.strokeStyle = "#0F172A";
      ctx.lineWidth = 2;
      ctx.fillRect(0, -3, 20, 6);

      // Rotating Drill Bit
      ctx.fillStyle = "#0F172A";
      ctx.beginPath();
      ctx.moveTo(20, -6);
      ctx.lineTo(28, 0);
      ctx.lineTo(20, 6);
      ctx.closePath();
      ctx.fill();

      // Ice/Sparks particles when drilling
      if (isDrilling) {
        ctx.fillStyle = "#38BDF8";
        for (let p = 0; p < 6; p++) {
          const sparkX = 26 + Math.random() * 12;
          const sparkY = -6 + Math.random() * 14;
          ctx.fillRect(sparkX, sparkY, 3, 3);
        }
      }
      ctx.restore();
    }

    // Rover Wheels
    const wheelOffset = (roverX * 0.4) % (Math.PI * 2);
    ctx.fillStyle = "#1E293B";
    ctx.strokeStyle = "#64748B";
    ctx.lineWidth = 2;

    // Rear Wheel
    ctx.beginPath();
    ctx.arc(-22, 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Front Wheel
    ctx.beginPath();
    ctx.arc(22, 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Wheel spokes
    ctx.strokeStyle = "#94A3B8";
    ctx.beginPath();
    ctx.moveTo(-22, 2);
    ctx.lineTo(-22 + Math.cos(wheelOffset) * 8, 2 + Math.sin(wheelOffset) * 8);
    ctx.moveTo(22, 2);
    ctx.lineTo(22 + Math.cos(wheelOffset) * 8, 2 + Math.sin(wheelOffset) * 8);
    ctx.stroke();

    ctx.restore();
  }, [stage, roverX, roverY, roverAngle, roverDirection, deposits, getTerrainHeight, gear, isDrilling]);

  // Handle Crisis Decisions in Stage 2
  const resolveCrisis = (choice: "conserve" | "overdrive") => {
    sounds.playClick(680);
    if (choice === "conserve") {
      setReturnFuelPercent((f) => Math.max(5, f - 6));
    } else {
      setBatteryPercent((b) => Math.max(10, b - 35));
    }
    setCrisisActive(false);
    sounds.playNextStep();
  };

  // ─────────────────────────────────────────────────────────────
  // STAGE 3: EARTH RETURN BURN & DEBRIEF STATE
  // ─────────────────────────────────────────────────────────────
  const [burnThrottle, setBurnThrottle] = useState<number>(50); // 0 to 100%
  const [burnCompleted, setBurnCompleted] = useState<boolean>(false);

  const executeEarthReturnBurn = () => {
    sounds.playLaunchChord();
    setBurnCompleted(true);
    if (returnFuelPercent >= 65) {
      setTimeout(() => sounds.playSuccessChord(), 700);
    } else {
      setTimeout(() => sounds.playAlarm(), 700);
    }
  };

  const returnOutcome = useMemo(() => {
    if (currentMass > maxMassLimit) {
      return {
        status: "overweight_fail",
        rank: "M.I.A.",
        titleTr: "Aşırı Ağırlık Yüzünden Rota Çöküşü",
        titleEn: "Overweight Trajectory Decay",
        descTr:
          "Geminin kütlesi Ay-Dünya itki marjını aştı. Fırlatma yakıtı yetersiz kaldı ve atmosfer giriş penceresi kaçırıldı.",
        descEn:
          "Excess payload mass exceeded engine thrust-to-weight. Velocity decayed short of Earth capture.",
        color: "text-red-600",
        border: "border-red-400",
      };
    }
    if (returnFuelPercent >= 80) {
      return {
        status: "nominal_success",
        rank: "S-RANK (Kusursuz / Nominal)",
        titleTr: "Kusursuz Pasifik İnişi & Mürettebat Kurtuldu!",
        titleEn: "Nominal Pacific Splashdown — Crew Rescued!",
        descTr:
          "Asteroitten rafine edilen %80+ yakıt ile Trans-Earth Injection motoru kusursuz ateşlendi. Isı kalkanı açısıyla güvenli iniş sağlandı!",
        descEn:
          "Flawless Trans-Earth Injection burn! Safe reentry corridor achieved and crew safely splashed down in the Pacific Ocean.",
        color: "text-emerald-600",
        border: "border-emerald-400",
      };
    }
    if (returnFuelPercent >= 62) {
      return {
        status: "marginal_survival",
        rank: "A-RANK (Zorlu Kurtuluş / Hard Aerobraking)",
        titleTr: "Yüksek-G Acil Atmosferik Atlama (Skip-Reentry)",
        titleEn: "High-G Emergency Skip-Reentry Survival",
        descTr:
          "Asgari yakıt seviyesiyle riskli bir aerobraking manevrası yapıldı. Mürettebat sarsıldı fakat sağ salim Dünya'ya ulaştı!",
        descEn:
          "Marginal fuel reserves forced a daring skip-reentry aerobraking maneuver. High G-forces, but crew was rescued safely!",
        color: "text-amber-600",
        border: "border-amber-400",
      };
    }
    return {
      status: "stranded_fail",
      rank: "M.I.A. (Yörüngede Mahsur / Stranded)",
      titleTr: "Cislunar Yüksek Yörüngede Yakıt Tükendi",
      titleEn: "Stranded in High Cislunar Orbit",
      descTr:
        "Dünya atmosferine girmek için gereken Delta-V yetersiz kaldı. Gemi Ay-Dünya arasında acil durum sinyali veriyor.",
      descEn:
        "Insufficient Delta-V for Earth capture. Spacecraft trapped in elliptical cislunar orbit broadcasting distress beacon.",
      color: "text-red-600",
      border: "border-red-400",
    };
  }, [returnFuelPercent, currentMass, maxMassLimit]);

  const restartMission = () => {
    sounds.playNextStep();
    setStage(1);
    setLaunchCountdown(mode === "solo" ? 110 : 0);
    setTimerExpired(false);
    setRoverX(180);
    setIceCollectedKg(0);
    setReturnFuelPercent(12);
    setBatteryPercent(100);
    setAsteroidWindowSec(55);
    setCrisisActive(false);
    crisisTriggeredRef.current = false;
    setBurnCompleted(false);
    setDeposits([
      { id: 1, x: 280, yieldKg: 280, mined: false, type: "water_ice" },
      { id: 2, x: 520, yieldKg: 350, mined: false, type: "water_ice" },
      { id: 3, x: 780, yieldKg: 420, mined: false, type: "water_ice" },
      { id: 4, x: 1050, yieldKg: 300, mined: false, type: "water_ice" },
      { id: 5, x: 1320, yieldKg: 480, mined: false, type: "water_ice" },
    ]);
  };

  const toggleSound = () => {
    sounds.enabled = !soundOn;
    setSoundOn(!soundOn);
    if (!soundOn) sounds.playBlip(720);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-blueprint-grid text-slate-900 font-sans overflow-hidden select-none">
      {/* 1. TOP DAYLIGHT HUD HEADER */}
      <header className="relative z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Progress & Abort Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onReturnToWelcome}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer transition-colors"
              title={lang === "tr" ? "Karşılama Ekranına Geri Dön" : "Return to Welcome Screen"}
            >
              <RotateCcw className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden sm:inline">
                {lang === "tr" ? "Görevi Terk Et" : "Abort to Menu"}
              </span>
            </button>

            {/* Stages Progression */}
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  stage === 1
                    ? "bg-blue-50 border-blue-300 text-blue-700 shadow-sm"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
              >
                1. {lang === "tr" ? "Gemi Tasarım Tezgâhı" : "Rover Builder"}
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  stage === 2
                    ? "bg-blue-600 border-blue-700 text-white shadow-sm"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
              >
                2. {lang === "tr" ? "Asteroit Sürüşü & Maden" : "2D Driving & Mining"}
              </span>
              <span className="text-slate-300">→</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  stage === 3
                    ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                    : "bg-slate-100 border-slate-200 text-slate-500"
                }`}
              >
                3. {lang === "tr" ? "Dünya Dönüşü" : "Earth Return"}
              </span>
            </div>
          </div>

          {/* Mode & Sound controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
              <span>{playerName}</span>
            </div>

            {mode === "solo" ? (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold">
                <ShieldAlert className="w-3.5 h-3.5 text-red-600 animate-pulse" />
                <span>{lang === "tr" ? "SOLO HARDCORE" : "SOLO HARDCORE"}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>{lang === "tr" ? "EKİP MODU" : "CO-OP CREW"}</span>
              </div>
            )}

            <button
              onClick={toggleSound}
              className="p-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 cursor-pointer"
            >
              {soundOn ? (
                <Bell className="w-4 h-4 text-blue-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. MAIN ACTIVE GAMEPLAY BODY */}
      <main className="relative z-30 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 flex flex-col justify-center">
        {/* ═════════════════════════════════════════════════════════════ */}
        {/* STAGE 1: VISUAL MODULAR ROVER BUILDER CANVAS & PART CARDS */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {stage === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header info */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>
                    {lang === "tr"
                      ? "1. Aşama: Modüler Keşif Aracı & Donatım Tezgâhı"
                      : "Stage 1: Modular Rover Builder & Prep Bay"}
                  </span>
                  <Sparkles className="w-5 h-5 text-amber-500" />
                </h2>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  {lang === "tr"
                    ? "Aracınıza parça ekleyip çıkardıkça aşağıdaki teknik çizim anında güncellenir. Ağır yükleri sökün, matkabı ve kriyojenik depoları monte edin!"
                    : "As you toggle parts, the blueprint rover updates in real-time. Strip excess lunar cargo to stay under the takeoff mass limit!"}
                </p>
              </div>

              {mode === "solo" && (
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-red-50 border border-red-200 shadow-sm">
                  <Clock className="w-4 h-4 text-red-600 animate-spin" />
                  <div className="text-right">
                    <span className="text-[10px] text-red-600 uppercase font-mono font-bold block">
                      {lang === "tr" ? "Fırlatma Penceresi" : "Launch Window"}
                    </span>
                    <span
                      className={`text-sm font-mono font-extrabold ${
                        launchCountdown <= 20 ? "text-red-600 animate-pulse" : "text-slate-900"
                      }`}
                    >
                      {launchCountdown}s
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* ── INTERACTIVE VISUAL BLUEPRINT CANVAS (MODULAR ROVER SVG) ── */}
            <div className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
              {/* Technical Blueprint Grid Accent */}
              <div className="absolute inset-0 bg-blueprint-grid opacity-50 pointer-events-none" />

              <div className="relative z-10 w-full max-w-2xl h-56 sm:h-64 flex items-center justify-center">
                <svg
                  viewBox="0 0 500 240"
                  className="w-full h-full filter drop-shadow-[0_10px_20px_rgba(15,23,42,0.12)]"
                >
                  {/* Grid Crosshairs */}
                  <line x1="250" y1="10" x2="250" y2="230" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
                  <line x1="20" y1="120" x2="480" y2="120" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />

                  {/* 1. Base Rover Chassis */}
                  <rect
                    x="160"
                    y="95"
                    width="170"
                    height="50"
                    rx="10"
                    fill="#0F172A"
                    stroke="#2563EB"
                    strokeWidth="3.5"
                  />
                  {/* Cockpit Window */}
                  <path
                    d="M 270 100 L 320 100 L 310 125 L 270 125 Z"
                    fill="#38BDF8"
                    stroke="#0284C7"
                    strokeWidth="2"
                  />
                  {/* Chassis Technical Text */}
                  <text x="215" y="125" fill="#94A3B8" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    CMD-{playerName.toUpperCase().replace(/\s+/g, "").slice(0, 10)}
                  </text>

                  {/* 2. Modular Part: Cryogenic Fuel Tanks (Rear) */}
                  {gear.find((g) => g.id === "cryo_tank")?.installed && (
                    <g className="animate-in fade-in zoom-in-95">
                      <circle cx="120" cy="115" r="24" fill="#F8FAFC" stroke="#2563EB" strokeWidth="3" />
                      <path d="M 144 115 L 160 115" stroke="#2563EB" strokeWidth="4" />
                      <text x="120" y="119" fill="#2563EB" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        LOX/LH2
                      </text>
                    </g>
                  )}

                  {/* 3. Modular Part: Deployable Solar Wings or RTG (Roof) */}
                  {gear.find((g) => g.id === "solar_wings")?.installed && (
                    <g className="animate-in fade-in">
                      <rect x="180" y="55" width="130" height="14" rx="3" fill="#1E293B" stroke="#0284C7" strokeWidth="2" />
                      <line x1="245" y1="69" x2="245" y2="95" stroke="#0F172A" strokeWidth="4" />
                      {/* Solar Grid Lines */}
                      <line x1="210" y1="55" x2="210" y2="69" stroke="#38BDF8" strokeWidth="1" />
                      <line x1="245" y1="55" x2="245" y2="69" stroke="#38BDF8" strokeWidth="1" />
                      <line x1="280" y1="55" x2="280" y2="69" stroke="#38BDF8" strokeWidth="1" />
                    </g>
                  )}
                  {gear.find((g) => g.id === "rtg_core")?.installed && !gear.find((g) => g.id === "solar_wings")?.installed && (
                    <g className="animate-in fade-in">
                      <rect x="225" y="65" width="40" height="24" rx="4" fill="#D97706" stroke="#78350F" strokeWidth="2" />
                      <text x="245" y="80" fill="#FFFFFF" fontSize="8" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        RTG
                      </text>
                    </g>
                  )}

                  {/* 4. Modular Part: Front Plasma Drill Arm */}
                  {gear.find((g) => g.id === "plasma_drill")?.installed && (
                    <g className="animate-in fade-in">
                      {/* Articulated Hydraulic Arm */}
                      <line x1="330" y1="120" x2="385" y2="135" stroke="#0F172A" strokeWidth="6" strokeLinecap="round" />
                      <circle cx="385" cy="135" r="5" fill="#F59E0B" />
                      <line x1="385" y1="135" x2="425" y2="155" stroke="#F59E0B" strokeWidth="6" strokeLinecap="round" />
                      {/* Drill Bit */}
                      <polygon points="425,148 445,155 425,162" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                    </g>
                  )}

                  {/* 5. Modular Part: Heavy All-Terrain Wheels */}
                  {gear.find((g) => g.id === "heavy_wheels")?.installed ? (
                    <g>
                      {/* Suspension Arms */}
                      <line x1="185" y1="140" x2="165" y2="185" stroke="#64748B" strokeWidth="5" />
                      <line x1="305" y1="140" x2="325" y2="185" stroke="#64748B" strokeWidth="5" />
                      {/* Big Rugged Wheels */}
                      <circle cx="165" cy="185" r="26" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                      <circle cx="325" cy="185" r="26" fill="#1E293B" stroke="#0F172A" strokeWidth="4" />
                      <circle cx="165" cy="185" r="12" fill="#94A3B8" />
                      <circle cx="325" cy="185" r="12" fill="#94A3B8" />
                    </g>
                  ) : (
                    <g>
                      {/* Small default wheels */}
                      <circle cx="185" cy="165" r="16" fill="#64748B" stroke="#0F172A" strokeWidth="3" />
                      <circle cx="305" cy="165" r="16" fill="#64748B" stroke="#0F172A" strokeWidth="3" />
                    </g>
                  )}
                </svg>
              </div>

              {/* Dynamic Rover Stats Pills Under Blueprint */}
              <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mt-2">
                <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kütle: {currentMass} / {maxMassLimit} kg</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  <span>Net Güç: {currentPowerNet >= 0 ? `+${currentPowerNet}W` : `${currentPowerNet}W`}</span>
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sürüş Hızı: {roverDriveSpeed.toFixed(1)}x</span>
                </div>
              </div>
            </div>

            {/* ── MODULAR PART CARDS (CLEAN ICONS + DOT INDICATORS) ── */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>
                    {lang === "tr"
                      ? "Modüler Bileşen Seçimi (Tıklayarak Donat/Sök)"
                      : "Modular Components (Click to Equip/Strip)"}
                  </span>
                </h3>
                <span className="text-xs text-slate-500">
                  {currentCargoSlots} / {maxCargoSlots} {lang === "tr" ? "Yuva Dolu" : "Slots Used"}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {gear.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleGear(item.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      item.installed
                        ? item.type === "non-essential"
                          ? "bg-red-50/70 border-red-300 shadow-sm"
                          : "bg-blue-50/70 border-blue-500 shadow-sm ring-2 ring-blue-500/10"
                        : "bg-slate-50/60 border-slate-200 text-slate-400 hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                            item.installed ? "bg-white text-blue-600 shadow-sm" : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {item.type === "drill" ? "⛏" : item.type === "power" ? "⚡" : item.type === "tank" ? "🛢" : item.type === "chassis" ? "⚙" : "📦"}
                        </div>
                        {item.installed ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {lang === "tr" ? "TAKILI" : "EQUIPPED"}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600">
                            {lang === "tr" ? "SÖKÜK" : "STRIPPED"}
                          </span>
                        )}
                      </div>

                      <h4 className={`text-xs font-bold leading-tight ${item.installed ? "text-slate-900" : "text-slate-500"}`}>
                        {lang === "tr" ? item.nameTr : item.nameEn}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                        {lang === "tr" ? item.descriptionTr : item.descriptionEn}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-mono font-bold text-slate-700">
                      <span>{item.massKg} kg</span>
                      <span>{item.powerW >= 0 ? `+${item.powerW}W` : `${item.powerW}W`}</span>
                      <span>{item.slots} {lang === "tr" ? "Yuva" : "Slot"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ready to Launch Action */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  {!isStage1Valid ? (
                    <span className="text-red-600 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0" />
                      {currentMass > maxMassLimit
                        ? lang === "tr"
                          ? "Gemi kütlesi fazla! Ay yaşam kabinini ve zırhı sökerek hafifleyin."
                          : "Overweight! Strip non-essential lunar hab and armor plates."
                        : currentCargoSlots > maxCargoSlots
                        ? lang === "tr"
                          ? `Kargo yuvası aşıldı (${currentCargoSlots}/${maxCargoSlots})! Gereksiz parçaları sökün.`
                          : `Cargo full (${currentCargoSlots}/${maxCargoSlots})! Discard non-essential parts.`
                        : currentPowerNet < 0
                        ? lang === "tr"
                          ? "Güç yetersiz! Güneş kanatlarını veya RTG ekleyin."
                          : "Power deficit! Mount solar wings or RTG."
                        : !hasEssentialGear
                        ? lang === "tr"
                          ? "Tekerlekler, Matkap, ISRU ve Yakıt Deposu monte edilmelidir!"
                          : "Drill, ISRU, Tank, and Wheels are mandatory!"
                        : timerExpired
                        ? lang === "tr"
                          ? "Fırlatma penceresi kaçırıldı!"
                          : "Window missed!"
                        : ""}
                    </span>
                  ) : (
                    <span className="text-emerald-700 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      {lang === "tr"
                        ? "Aracınız asteroit sürüşü için mükemmel hazırlandı!"
                        : "Rover fully calibrated for asteroid surface driving!"}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => {
                    sounds.playLaunchChord();
                    setStage(2);
                  }}
                  disabled={!isStage1Valid}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
                    isStage1Valid
                      ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer shadow-blue-500/20"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  <span>
                    {lang === "tr"
                      ? "Asteroide İn & Sürüşe Başla (Aşama 2)"
                      : "Land on Asteroid & Drive (Stage 2)"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* STAGE 2: PLAYABLE 2D ASTEROID DRIVING & MINING CANVAS */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {stage === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Live Driving Telemetry HUD Bar */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
              {/* Refined Fuel Gauge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Rocket className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">
                    {lang === "tr" ? "Rafine Edilen Dönüş Yakıtı" : "Refined Return Propellant"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-slate-900 font-mono">{returnFuelPercent}%</span>
                    <span className="text-xs text-slate-500">
                      ({lang === "tr" ? "Hedef: %65+" : "Goal: 65%+"})
                    </span>
                  </div>
                </div>
              </div>

              {/* Ice Harvested */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
                  ⛏
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">
                    {lang === "tr" ? "Toplanan Su-Buz" : "Extracted Ice"}
                  </span>
                  <span className="text-lg font-extrabold text-sky-700 font-mono">{Math.round(iceCollectedKg)} kg</span>
                </div>
              </div>

              {/* Rover Battery Gauge */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Battery className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold uppercase block">
                    {lang === "tr" ? "Batarya / Güç" : "Rover Battery"}
                  </span>
                  <span className="text-lg font-extrabold text-slate-900 font-mono">{Math.round(batteryPercent)}%</span>
                </div>
              </div>

              {/* Asteroid Escape Timer */}
              <div className="px-4 py-2 rounded-xl bg-slate-900 text-white flex items-center gap-2 font-mono">
                <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                <div>
                  <span className="text-[9px] text-slate-400 uppercase block">
                    {lang === "tr" ? "Asteroit Ayrılışı" : "Orbit Departure"}
                  </span>
                  <span className={`text-sm font-extrabold ${asteroidWindowSec <= 15 ? "text-red-400 animate-pulse" : "text-white"}`}>
                    {asteroidWindowSec}s
                  </span>
                </div>
              </div>
            </div>

            {/* ── 2D INTERACTIVE DRIVING & MINING CANVAS ── */}
            <div className="relative bg-white rounded-3xl overflow-hidden border-2 border-slate-300 shadow-xl">
              <canvas
                ref={canvasRef}
                width={800}
                height={340}
                className="w-full h-[320px] sm:h-[360px] block"
              />

              {/* In-Canvas Instruction Overlay */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm border border-slate-200 px-3 py-1.5 rounded-xl shadow-sm text-xs font-bold text-slate-700 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>
                  {lang === "tr"
                    ? "Sürüş: A / D veya ◄ ► Ok Tuşları | Madencilik: BOŞLUK (SPACE)"
                    : "Drive: A / D or ◄ ► Keys | Mine: Hold SPACEBAR over Ice"}
                </span>
              </div>

              {/* On-Screen Touch / Click Driving Controls for Mobile & Quick Access */}
              <div className="absolute bottom-4 inset-x-4 flex items-center justify-between pointer-events-none">
                {/* Left/Right Direction Controls */}
                <div className="flex items-center gap-2 pointer-events-auto">
                  <button
                    onMouseDown={() => {
                      setIsDrivingLeft(true);
                      setRoverDirection(-1);
                    }}
                    onMouseUp={() => setIsDrivingLeft(false)}
                    onTouchStart={() => {
                      setIsDrivingLeft(true);
                      setRoverDirection(-1);
                    }}
                    onTouchEnd={() => setIsDrivingLeft(false)}
                    className="w-12 h-12 rounded-2xl bg-white/95 border-2 border-slate-300 active:bg-blue-600 active:text-white text-slate-800 shadow-md font-bold flex items-center justify-center cursor-pointer select-none"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    onMouseDown={() => {
                      setIsDrivingRight(true);
                      setRoverDirection(1);
                    }}
                    onMouseUp={() => setIsDrivingRight(false)}
                    onTouchStart={() => {
                      setIsDrivingRight(true);
                      setRoverDirection(1);
                    }}
                    onTouchEnd={() => setIsDrivingRight(false)}
                    className="w-12 h-12 rounded-2xl bg-white/95 border-2 border-slate-300 active:bg-blue-600 active:text-white text-slate-800 shadow-md font-bold flex items-center justify-center cursor-pointer select-none"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </div>

                {/* Big Action DRILL Button */}
                <div className="pointer-events-auto">
                  <button
                    onMouseDown={() => setIsDrilling(true)}
                    onMouseUp={() => setIsDrilling(false)}
                    onTouchStart={() => setIsDrilling(true)}
                    onTouchEnd={() => setIsDrilling(false)}
                    className={`px-6 py-3 rounded-2xl font-extrabold text-sm border-2 shadow-lg transition-all flex items-center gap-2 cursor-pointer select-none ${
                      isDrilling
                        ? "bg-amber-500 border-amber-600 text-slate-950 scale-95"
                        : "bg-white/95 border-slate-300 text-slate-900 hover:border-blue-500"
                    }`}
                  >
                    <span>⛏</span>
                    <span>{lang === "tr" ? "KAZ / DEL (SPACE)" : "MINE / DRILL (SPACE)"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stage 2 Bottom Bar & Earth Return Transition */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                {returnFuelPercent >= 80 ? (
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    {lang === "tr"
                      ? "Harika! Dünya'ya kusursuz iniş için yeterli yakıt rafine edildi."
                      : "Nominal return propellant refined for safe Earth splashdown!"}
                  </span>
                ) : returnFuelPercent >= 65 ? (
                  <span className="text-amber-700 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    {lang === "tr"
                      ? "Asgari yakıt var. Biraz daha buz kazarak şansınızı artırabilirsiniz."
                      : "Marginal fuel reserves. Mine a bit more ice to ensure high-G survival."}
                  </span>
                ) : (
                  <span className="text-red-600 font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    {lang === "tr"
                      ? "Yakıt yetersiz! Dünya'ya dönmek için en az %65 yakıt gereklidir."
                      : "Insufficient propellant! Need at least 65% to avoid being stranded."}
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  sounds.playLaunchChord();
                  setStage(3);
                }}
                className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                  returnFuelPercent >= 60
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white cursor-pointer shadow-blue-500/20"
                    : "bg-slate-200 text-slate-500 cursor-pointer hover:bg-slate-300"
                }`}
              >
                <Rocket className="w-4 h-4" />
                <span>
                  {lang === "tr"
                    ? "Dünya'ya Ateşle (Aşama 3)"
                    : "Ignite Earth Return (Stage 3)"}
                </span>
              </button>
            </div>

            {/* Mid-Operation Space Crisis Modal */}
            {crisisActive && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
                <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 border-2 border-red-500 shadow-2xl space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b border-red-100">
                    <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
                      <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-red-600 font-extrabold uppercase">
                        {lang === "tr" ? "ACİL DURUM UYARISI" : "CRITICAL SPACE CRISIS"}
                      </span>
                      <h3 className="text-base font-extrabold text-slate-900">
                        {crisisType === "dust"
                          ? lang === "tr"
                            ? "Asteroit Toz Fırtınası Güneş Panellerini Kaplıyor!"
                            : "Regolith Dust Storm Coating Solar Panels!"
                          : lang === "tr"
                          ? "Kriyojenik Tank Aşırı Basınç Sıçraması!"
                          : "Cryogenic Propellant Tank Pressure Surge!"}
                      </h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {crisisType === "dust"
                      ? lang === "tr"
                        ? "Sürüş sırasında kalkan keskin toz güneş panellerini kapatmak üzere! Hangi mühendislik kararını seçeceksin?"
                        : "Billowing asteroid dust is threatening to block the solar wings! Choose your emergency protocol:"
                      : lang === "tr"
                      ? "ISRU reaktöründeki sıcaklık valfleri zorluyor. Hızlı müdahale gerek!"
                      : "Thermal surge inside the ISRU reactor! Select an operational countermeasure:"}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <button
                      onClick={() => resolveCrisis("conserve")}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-blue-200 hover:border-blue-500 text-left transition-all cursor-pointer"
                    >
                      <div className="font-bold text-xs text-blue-700 mb-1">
                        {lang === "tr" ? "Kalkanı Koru (-%6 Yakıt)" : "Shield Panels (-6% Fuel)"}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {lang === "tr"
                          ? "Panelleri temiz tutar fakat %6 rafine yakıt harcar."
                          : "Keeps power stable at the cost of 6% refined propellant."}
                      </p>
                    </button>

                    <button
                      onClick={() => resolveCrisis("overdrive")}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border-2 border-amber-200 hover:border-amber-500 text-left transition-all cursor-pointer"
                    >
                      <div className="font-bold text-xs text-amber-700 mb-1">
                        {lang === "tr" ? "Bataryayı Boşalt (-%35 Güç)" : "Drain Battery (-35% Power)"}
                      </div>
                      <p className="text-[10px] text-slate-500">
                        {lang === "tr"
                          ? "Yakıtı korur fakat bataryayı kritik seviyeye çeker."
                          : "Conserves fuel, drains rover battery reserve."}
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════ */}
        {/* STAGE 3: INTERACTIVE EARTH RETURN BURN & NASA ISRU DEBRIEF */}
        {/* ═════════════════════════════════════════════════════════════ */}
        {stage === 3 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {!burnCompleted ? (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-blue-500 shadow-xl space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Rocket className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-blue-600">
                      TRANS-EARTH INJECTION (TEI)
                    </span>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      {lang === "tr"
                        ? "Dünya'ya Dönüş Motoru Ateşleme Kontrolü"
                        : "Earth Return Thruster Ignition Control"}
                    </h2>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed">
                  {lang === "tr"
                    ? `Asteroitten rafine ettiğiniz %${returnFuelPercent} yakıt ve ${currentMass} kg gemi kütlesi ile Trans-Earth Injection manevrasını gerçekleştireceksiniz. Motor itki gücünü ayarlayıp ateşleyin!`
                    : `Using your ${returnFuelPercent}% refined propellant and ${currentMass} kg spacecraft mass, execute the Trans-Earth Injection burn! Adjust throttle and ignite!`}
                </p>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                    <span>{lang === "tr" ? "İtki Gücü (Throttle)" : "Thruster Throttle"}</span>
                    <span className="font-mono text-blue-600 text-sm">{burnThrottle}%</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={burnThrottle}
                    onChange={(e) => setBurnThrottle(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-400">
                    <span>{lang === "tr" ? "Ekonomik (%30)" : "Eco (30%)"}</span>
                    <span>{lang === "tr" ? "Dengeli (%65)" : "Balanced (65%)"}</span>
                    <span>{lang === "tr" ? "Maksimum (%100)" : "Max Thrust (100%)"}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={executeEarthReturnBurn}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-blue-500/20 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-5 h-5" />
                    <span>{lang === "tr" ? "Trans-Earth Motorunu Ateşle!" : "Ignite TEI Return Engine!"}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className={`bg-white rounded-3xl p-6 sm:p-8 border-2 ${returnOutcome.border} shadow-xl relative overflow-hidden`}>
                {/* Outcome Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200 shadow-sm">
                      <Globe className="w-7 h-7 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-blue-600">
                        {returnOutcome.rank}
                      </span>
                      <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                        {lang === "tr" ? returnOutcome.titleTr : returnOutcome.titleEn}
                      </h2>
                    </div>
                  </div>

                  <div className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono font-bold text-slate-800">
                    {lang === "tr" ? "Nihai Yakıt:" : "Final Propellant:"}{" "}
                    <strong className={returnOutcome.color}>{returnFuelPercent}%</strong>
                  </div>
                </div>

                {/* Trajectory Outcome Description */}
                <div className="py-6">
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-3xl">
                    {lang === "tr" ? returnOutcome.descTr : returnOutcome.descEn}
                  </p>

                  {/* Trajectory Vector Illustration */}
                  <div className="my-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                    <svg className="w-full max-w-lg h-32" viewBox="0 0 500 120" fill="none">
                      <circle cx="50" cy="60" r="18" fill="#F8FAFC" stroke="#0F172A" strokeWidth="2.5" />
                      <text x="50" y="100" fill="#0F172A" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        ASTEROID
                      </text>

                      {/* Return Trajectory Arc */}
                      <path
                        d="M 68 60 Q 250 15, 430 60"
                        stroke={returnFuelPercent >= 65 ? "#10B981" : "#EF4444"}
                        strokeWidth="3.5"
                        strokeDasharray="6 4"
                        fill="none"
                      />

                      {/* Earth Sphere */}
                      <circle cx="440" cy="60" r="26" fill="#0284C7" stroke="#2563EB" strokeWidth="3" />
                      <path d="M 430 50 Q 445 45, 452 55 Q 440 68, 430 50 Z" fill="#10B981" opacity="0.9" />
                      <text x="440" y="102" fill="#2563EB" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                        EARTH
                      </text>

                      <circle
                        cx={returnFuelPercent >= 80 ? "430" : returnFuelPercent >= 65 ? "370" : "250"}
                        cy={returnFuelPercent >= 80 ? "55" : returnFuelPercent >= 65 ? "35" : "25"}
                        r="6"
                        fill="#2563EB"
                        className="animate-ping"
                      />
                    </svg>
                  </div>

                  {/* Flight Telemetry Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {lang === "tr" ? "Kalkış Kütlesi" : "Liftoff Mass"}
                      </span>
                      <strong className="text-slate-900 font-mono text-sm">{currentMass} kg</strong>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {lang === "tr" ? "Çıkarılan Su-Buz" : "ISRU Ice Yield"}
                      </span>
                      <strong className="text-sky-700 font-mono text-sm">{Math.round(iceCollectedKg)} kg</strong>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {lang === "tr" ? "Rafine Yakıt" : "Fuel Produced"}
                      </span>
                      <strong className="text-emerald-700 font-mono text-sm">{returnFuelPercent}%</strong>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <span className="text-[10px] text-slate-500 block font-mono">
                        {lang === "tr" ? "Sürüş Başarısı" : "Drive Performance"}
                      </span>
                      <strong className="text-blue-700 font-mono text-sm">
                        {returnFuelPercent >= 65 ? (lang === "tr" ? "Başarılı" : "Nominal") : "M.I.A."}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Educational NASA ISRU Engineering Breakdown */}
                <div className="mt-2 p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-2">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-blue-800">
                      {lang === "tr"
                        ? "NASA ISRU (Yerinde Kaynak Kullanımı) Gerçek Bilim Notu"
                        : "NASA ISRU (In-Situ Resource Utilization) Real-World Science"}
                    </h4>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {lang === "tr"
                      ? "Tıpkı bu oyunda modüler aracınızla asteroitte sürerek yaptığınız gibi; NASA'nın Artemis ve gelecekteki Mars keşiflerinde tüm dönüş yakıtını Dünya'dan fırlatmak roket boyutunu imkansız derecede büyütür. Bunun yerine Ay kraterlerindeki ve asteroitlerdeki buz (H2O) yerinde çıkarılıp elektroliz ile Sıvı Hidrojen (LH2) ve Sıvı Oksijen (LOX) yakıtına dönüştürülür. ISRU teknolojisi, derin uzayda insanlı keşfin ve hayatta kalmanın temel anahtarıdır."
                      : "Just as you drove your custom rover to extract ice on the asteroid, NASA's Artemis basecamp and Mars missions utilize ISRU (In-Situ Resource Utilization) to produce rocket propellant on-site. Hauling return fuel from Earth multiplies launch mass exponentially; mining extraterrestrial water-ice to synthesize liquid hydrogen and oxygen in space is the definitive breakthrough for sustainable deep space survival."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    onClick={onReturnToWelcome}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs border border-slate-300 cursor-pointer transition-colors"
                  >
                    {lang === "tr" ? "Karşılama Ekranına Dön" : "Return to Welcome Screen"}
                  </button>

                  <button
                    onClick={restartMission}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 cursor-pointer active:scale-95 transition-all"
                  >
                    {lang === "tr" ? "Görevi Yeniden Başlat" : "Replay Mission"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-30 w-full border-t border-slate-200 bg-white/95 py-3 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>NASA Space Apps 2026 — Space Mission Design & Asteroid ISRU Survival</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Mode: {mode.toUpperCase()}</span>
            <span>•</span>
            <span>Stage {stage} / 3</span>
            <span>•</span>
            <span>Playable 2D Rover Driving & Mining</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
