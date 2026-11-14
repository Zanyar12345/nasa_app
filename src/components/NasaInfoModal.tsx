"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Telescope, Info, Sparkles, Orbit, Radio } from "lucide-react";

export interface NasaPhotoInfo {
  title: string;
  catalogId: string;
  telescopes: string[];
  credit: string;
  flickrUrl: string;
  descriptionTr: string;
  descriptionEn: string;
  wavelengthGuide: {
    color: string;
    instrumentTr: string;
    instrumentEn: string;
    detailsTr: string;
    detailsEn: string;
  }[];
  details: {
    labelTr: string;
    labelEn: string;
    value: string;
  }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// OFFICIAL NASA SCIENTIFIC DATA OBJECT
// Easy to customize, update, or paste new NASA/Webb captions and URLs.
// ─────────────────────────────────────────────────────────────────────────────
export const NASA_PHOTO_INFO: NasaPhotoInfo = {
  title: "Spiral Galaxy NGC 4258 (Messier 106)",
  catalogId: "NGC 4258 • Messier 106",
  telescopes: [
    "NASA's James Webb Space Telescope (JWST)",
    "NASA's Chandra X-ray Observatory",
    "NASA/ESA Hubble Space Telescope",
  ],
  credit: "NASA, ESA, CSA, STScI, CXC (Chandra X-ray Center)",
  flickrUrl:
    "https://www.flickr.com/photos/nasawebbtelescope/55487966583/in/album-72177720331299130/",
  descriptionTr:
    "NGC 4258 (Messier 106), Dünya'dan yaklaşık 23.5 milyon ışık yılı uzaklıkta, Canes Venatici (Av Köpekleri) takımyıldızında yer alan görkemli bir sarmal galaksidir. Bu görüntü; James Webb Uzay Teleskobu'nun (JWST) kızılötesi derinliği, Chandra'nın X-ışını verisi ve Hubble'ın optik netliğini birleştiren çok dalga boylu bir NASA kompozitidir. Galaksinin merkezindeki devasa süper kütleli kara delik, olağanüstü güçte yüksek enerjili parçacık jetleri püskürterek ana galaksi diskini kesen ünlü 'anormal sarmal kolları' (mor ve pembe şok cepheleri) meydana getirmektedir.",
  descriptionEn:
    "NGC 4258 (Messier 106) is a famous spiral galaxy located approximately 23.5 million light-years away in the constellation Canes Venatici. This multi-wavelength composite brings together infrared imagery from NASA's James Webb Space Telescope (JWST), X-rays from NASA's Chandra X-ray Observatory, and visible light from the Hubble Space Telescope. Powerful particle jets blasting from the central supermassive black hole interact with interstellar gas, producing the galaxy's famous 'anomalous arms'—extra spiral arms blazing in vibrant purple and pink shock waves.",
  wavelengthGuide: [
    {
      color: "bg-purple-500",
      instrumentTr: "Chandra X-Işını (Mor & Mavi)",
      instrumentEn: "Chandra X-rays (Purple & Blue)",
      detailsTr: "Merkezdeki süper kütleli kara deliğin püskürttüğü milyonlarca derecelik sıcak gaz ve şok dalgaları.",
      detailsEn: "Multi-million-degree hot gas and shock waves blasted out by the central supermassive black hole.",
    },
    {
      color: "bg-pink-500",
      instrumentTr: "Webb Kızılötesi (Kırmızı & Pembe)",
      instrumentEn: "Webb Infrared (Red & Pink)",
      detailsTr: "Yoğun kozmik toz bulutlarının ardındaki yeni doğan yıldızlar ve ısınan moleküler hidrojen gazı.",
      detailsEn: "Star-forming nurseries and warm molecular gas piercing through dense cosmic dust lanes.",
    },
    {
      color: "bg-sky-400",
      instrumentTr: "Hubble Optik (Sarı & Mavi)",
      instrumentEn: "Hubble Optical (Yellow & Blue)",
      detailsTr: "Galaksinin ana sarmal kollarındaki milyarlarca olgun yıldız ve parlak yıldız kümeleri.",
      detailsEn: "Billions of stellar populations and bright star clusters tracing the primary spiral disc.",
    },
  ],
  details: [
    { labelTr: "Gök Cismi Tipi", labelEn: "Object Type", value: "Sarmal Galaksi (SABbc Spiral)" },
    { labelTr: "Uzaklık", labelEn: "Distance", value: "~23.5 Milyon Işık Yılı (Mly)" },
    { labelTr: "Takımyıldız", labelEn: "Constellation", value: "Canes Venatici (Av Köpekleri)" },
    { labelTr: "Gözlem Dalga Boyu", labelEn: "Wavelengths", value: "X-Işını, Kızılötesi, Görünür Işık" },
  ],
};

interface NasaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang?: "tr" | "en";
}

export default function NasaInfoModal({ isOpen, onClose, lang = "tr" }: NasaInfoModalProps) {
  // Close on Escape key press
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Modal Dialog Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900/95 text-slate-100 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-y-auto backdrop-blur-xl ring-1 ring-white/10 space-y-6"
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-widest bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase flex items-center gap-1.5">
                <Telescope className="w-3 h-3 text-blue-400" />
                NASA / WEBB ARCHIVE
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs font-mono text-slate-400">{NASA_PHOTO_INFO.catalogId}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {NASA_PHOTO_INFO.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
            aria-label="Kapat / Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scientific Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang === "tr" ? "Bilimsel Açıklama" : "Scientific Overview"}</span>
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            {lang === "tr" ? NASA_PHOTO_INFO.descriptionTr : NASA_PHOTO_INFO.descriptionEn}
          </p>
        </div>

        {/* Multi-Wavelength Composite Breakdown */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {lang === "tr" ? "Dalga Boyu & Gözlemevi Renk Rehberi" : "Multi-Wavelength Telescope Color Map"}
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {NASA_PHOTO_INFO.wavelengthGuide.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex flex-col justify-between space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${item.color} shadow-sm shrink-0`} />
                  <span className="text-xs font-bold text-white leading-tight">
                    {lang === "tr" ? item.instrumentTr : item.instrumentEn}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  {lang === "tr" ? item.detailsTr : item.detailsEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry / Object Details Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === "tr" ? "Gözlem Verileri" : "Observation Telemetry"}</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NASA_PHOTO_INFO.details.map((detail, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-left"
              >
                <span className="text-[10px] font-mono text-slate-400 uppercase block">
                  {lang === "tr" ? detail.labelTr : detail.labelEn}
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Telescopes & Credit */}
        <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40 text-xs text-slate-300 space-y-1">
          <div className="flex items-center gap-2 text-blue-400 font-bold font-mono">
            <Radio className="w-3.5 h-3.5" />
            <span>{lang === "tr" ? "Gözlemevleri & Telif" : "Observatories & Credits"}</span>
          </div>
          <p className="text-[11px] text-slate-300">
            {NASA_PHOTO_INFO.telescopes.join(" • ")}
          </p>
          <p className="text-[10px] font-mono text-slate-400">
            Credit: {NASA_PHOTO_INFO.credit}
          </p>
        </div>

        {/* Action Button: Official NASA Flickr Source Link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
          <span className="text-[11px] font-mono text-slate-400 text-center sm:text-left">
            {lang === "tr"
              ? "NASA James Webb Resmi Flickr Arşivine yönlendirilir"
              : "Direct link to official NASA JWST Flickr Archive"}
          </span>

          <a
            href={NASA_PHOTO_INFO.flickrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <span>{lang === "tr" ? "Resmi NASA Kaynağını Görüntüle" : "View Official NASA Source"}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
