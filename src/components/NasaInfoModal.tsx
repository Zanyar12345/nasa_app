"use client";

import React, { useEffect } from "react";
import { X, ExternalLink, Telescope, Info, Sparkles, Orbit, Radio } from "lucide-react";

export interface NasaPhotoInfo {
  title: string;
  catalogId: string;
  telescopes: string[];
  credit: string;
  flickrUrl: string;
  descriptionEn: string;
  wavelengthGuide: {
    color: string;
    instrumentEn: string;
    detailsEn: string;
  }[];
  details: {
    labelEn: string;
    value: string;
  }[];
}

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
  descriptionEn:
    "NGC 4258 (Messier 106) is a famous spiral galaxy located approximately 23.5 million light-years away in the constellation Canes Venatici. This multi-wavelength composite brings together infrared imagery from NASA's James Webb Space Telescope (JWST), X-rays from NASA's Chandra X-ray Observatory, and visible light from the Hubble Space Telescope. Powerful particle jets blasting from the central supermassive black hole interact with interstellar gas, producing the galaxy's famous 'anomalous arms'—extra spiral arms blazing in vibrant purple and pink shock waves.",
  wavelengthGuide: [
    {
      color: "bg-purple-500",
      instrumentEn: "Chandra X-rays (Purple & Blue)",
      detailsEn: "Multi-million-degree hot gas and shock waves blasted out by the central supermassive black hole.",
    },
    {
      color: "bg-pink-500",
      instrumentEn: "Webb Infrared (Red & Pink)",
      detailsEn: "Star-forming nurseries and warm molecular gas piercing through dense cosmic dust lanes.",
    },
    {
      color: "bg-sky-400",
      instrumentEn: "Hubble Optical (Yellow & Blue)",
      detailsEn: "Billions of stellar populations and bright star clusters tracing the primary spiral disc.",
    },
  ],
  details: [
    { labelEn: "Object Type", value: "Spiral Galaxy (SABbc Spiral)" },
    { labelEn: "Distance", value: "~23.5 Million Light-Years (Mly)" },
    { labelEn: "Constellation", value: "Canes Venatici" },
    { labelEn: "Wavelengths", value: "X-ray, Infrared, Visible Light" },
  ],
};

interface NasaInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NasaInfoModal({ isOpen, onClose }: NasaInfoModalProps) {
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
        className="relative w-full max-w-2xl max-h-[90vh] bg-slate-950/98 text-slate-100 border-2 border-cyan-400 rounded-none sm:rounded-sm p-6 sm:p-8 shadow-[10px_10px_0px_#000] overflow-y-auto backdrop-blur-xl space-y-6"
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-none text-[9px] font-press-start bg-blue-500/20 text-blue-400 border border-blue-500/40 uppercase flex items-center gap-1.5 shadow-[2px_2px_0px_#000]">
                <Telescope className="w-3 h-3 text-blue-400" />
                NASA / WEBB ARCHIVE
              </span>
              <span className="text-slate-500 text-xs">•</span>
              <span className="text-xs font-silkscreen text-slate-400">{NASA_PHOTO_INFO.catalogId}</span>
            </div>
            <h2 className="text-base sm:text-lg font-press-start text-white tracking-tight pt-1">
              {NASA_PHOTO_INFO.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-none bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white transition-colors cursor-pointer shadow-[3px_3px_0px_#000] arcade-btn"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scientific Description */}
        <div className="space-y-2">
          <h3 className="text-xs font-silkscreen font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            <span>Scientific Overview</span>
          </h3>
          <p className="text-base sm:text-lg font-vt323 text-slate-300 leading-relaxed tracking-wide">
            {NASA_PHOTO_INFO.descriptionEn}
          </p>
        </div>

        {/* Multi-Wavelength Composite Breakdown */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-silkscreen font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Multi-Wavelength Telescope Color Map</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {NASA_PHOTO_INFO.wavelengthGuide.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-none bg-slate-900/80 border border-slate-700 flex flex-col justify-between space-y-1.5 shadow-[2px_2px_0px_#000]"
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-none ${item.color} shadow-sm shrink-0`} />
                  <span className="text-[11px] font-silkscreen font-bold text-white leading-tight">
                    {item.instrumentEn}
                  </span>
                </div>
                <p className="text-sm font-vt323 text-slate-400 leading-snug">
                  {item.detailsEn}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry / Object Details Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-silkscreen font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Orbit className="w-3.5 h-3.5 text-indigo-400" />
            <span>Observation Telemetry</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {NASA_PHOTO_INFO.details.map((detail, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-none bg-slate-900/80 border border-slate-700 text-left shadow-[2px_2px_0px_#000]"
              >
                <span className="text-[10px] font-silkscreen text-slate-400 uppercase block">
                  {detail.labelEn}
                </span>
                <span className="text-xs font-silkscreen font-bold text-slate-200 block truncate">
                  {detail.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Telescopes & Credit */}
        <div className="p-3.5 rounded-none bg-blue-950/40 border-2 border-blue-800/60 text-xs text-slate-300 space-y-1 shadow-[3px_3px_0px_#000]">
          <div className="flex items-center gap-2 text-blue-400 font-bold font-silkscreen">
            <Radio className="w-3.5 h-3.5" />
            <span>Observatories & Credits</span>
          </div>
          <p className="text-xs font-silkscreen text-slate-300">
            {NASA_PHOTO_INFO.telescopes.join(" • ")}
          </p>
          <p className="text-[10px] font-silkscreen text-slate-400">
            Credit: {NASA_PHOTO_INFO.credit}
          </p>
        </div>

        {/* Action Button: Official NASA Flickr Source Link */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t-2 border-slate-800 font-silkscreen">
          <span className="text-[10px] text-slate-400 text-center sm:text-left">
            Direct link to official NASA JWST Flickr Archive
          </span>

          <a
            href={NASA_PHOTO_INFO.flickrUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-none bg-blue-600 hover:bg-blue-500 border-2 border-blue-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-[4px_4px_0px_#000] transition-all cursor-pointer arcade-btn"
          >
            <span>View Official NASA Source</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
