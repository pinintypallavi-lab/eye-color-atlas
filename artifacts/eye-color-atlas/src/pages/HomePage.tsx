import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Dna, Upload, ChevronDown, ChevronRight, Zap, CheckCircle, AlertTriangle, Shield, Search } from "lucide-react";
import { Link } from "wouter";
import { eyeColors, type RiskLevel } from "@/data/eyeColorData";
import EyeIllustration from "@/components/EyeIllustration";

const RISK_CONFIG: Record<RiskLevel, { label: string; textColor: string; bg: string; barColor: string; icon: React.ReactNode }> = {
  high: {
    label: "HIGH RISK",
    textColor: "text-red-700",
    bg: "#fff5f5",
    barColor: "#ef4444",
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
  },
  moderate: {
    label: "MODERATE RISK",
    textColor: "text-orange-700",
    bg: "#fffbeb",
    barColor: "#f97316",
    icon: <Zap className="w-3.5 h-3.5" />,
  },
  low: {
    label: "LOW RISK",
    textColor: "text-green-700",
    bg: "#f0fdf4",
    barColor: "#22c55e",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
  },
  protective: {
    label: "PROTECTIVE",
    textColor: "text-blue-700",
    bg: "#eff6ff",
    barColor: "#3b82f6",
    icon: <Shield className="w-3.5 h-3.5" />,
  },
};

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return { r: n >> 16, g: (n >> 8) & 0xff, b: n & 0xff };
}

function makePageBackground(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  // Mix colour with white at ~9% opacity → gives a clean tinted background
  const mix = (c: number) => Math.round(255 * 0.91 + c * 0.09);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function makeSelectorBackground(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  const mix = (c: number) => Math.round(255 * 0.84 + c * 0.16);
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const cfg = RISK_CONFIG[level];
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${cfg.textColor}`}
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.barColor}30` }}>
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function DiseaseAccordion({ disease }: { disease: (typeof eyeColors)[0]["diseases"][0] }) {
  const [open, setOpen] = useState(false);
  const cfg = RISK_CONFIG[disease.riskLevel];

  return (
    <div className="rounded-2xl overflow-hidden border" style={{ backgroundColor: cfg.bg, borderColor: `${cfg.barColor}30` }}>
      <button
        className="w-full text-left px-5 py-4 flex items-start justify-between gap-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <span className="mt-0.5 flex-shrink-0" style={{ color: cfg.barColor }}>{cfg.icon}</span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-bold text-gray-900 text-sm">{disease.name}</span>
              <RiskBadge level={disease.riskLevel} />
            </div>
            <p className="text-gray-600 text-xs leading-relaxed line-clamp-2">{disease.description}</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Risk progress bar */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: `${cfg.barColor}22` }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: cfg.barColor }}
              initial={{ width: 0 }}
              animate={{ width: `${disease.riskPercent}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">Risk level</span>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="px-5 pt-2 pb-5 border-t border-gray-100">
              <p className="text-xs font-bold text-green-600 uppercase tracking-wide mb-2">Recovery &amp; Treatment</p>
              <p className="text-sm text-gray-600 leading-relaxed">{disease.recovery}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HomePage() {
  const [selectedId, setSelectedId] = useState("brown");
  const color = eyeColors.find((c) => c.id === selectedId) || eyeColors[0];

  const pageBg = makePageBackground(color.hex);
  const selectorBg = makeSelectorBackground(color.hex);

  const riskCounts = {
    high: color.diseases.filter((d) => d.riskLevel === "high").length,
    moderate: color.diseases.filter((d) => d.riskLevel === "moderate").length,
    low: color.diseases.filter((d) => d.riskLevel === "low").length,
    protective: color.diseases.filter((d) => d.riskLevel === "protective").length,
  };

  return (
    <motion.div
      animate={{ backgroundColor: pageBg }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
      style={{ backgroundColor: pageBg }}
    >
      {/* Eye selector bar */}
      <motion.div
        animate={{ backgroundColor: selectorBg }}
        transition={{ duration: 0.5 }}
        style={{ backgroundColor: selectorBg }}
        className="border-b border-black/5"
      >
        <div className="max-w-6xl mx-auto px-4 py-5">
          {/* Page title */}
          <div className="text-center mb-5">
            <h1 className="text-3xl font-black text-gray-900 mb-1">
              Eye Color <span className="text-blue-600">Atlas</span> 👁️
            </h1>
            <p className="text-gray-500 text-sm">Select an eye color below to explore its global distribution, genetics &amp; health risks</p>
            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Link href="/inheritance">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 hover:bg-white/95 text-purple-700 border border-purple-200 rounded-full text-sm font-semibold transition cursor-pointer shadow-sm">
                  <Dna className="w-4 h-4" /> Inheritance
                </span>
              </Link>
              <Link href="/country">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 hover:bg-white/95 text-teal-700 border border-teal-200 rounded-full text-sm font-semibold transition cursor-pointer shadow-sm">
                  <Search className="w-4 h-4" /> Country Finder
                </span>
              </Link>
              <Link href="/upload">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/70 hover:bg-white/95 text-orange-700 border border-orange-200 rounded-full text-sm font-semibold transition cursor-pointer shadow-sm">
                  <Upload className="w-4 h-4" /> AI Iris Analysis
                </span>
              </Link>
            </div>
          </div>

          {/* Eye buttons row */}
          <div className="flex flex-wrap justify-center gap-3">
            {eyeColors.map((ec) => (
              <EyeIllustration
                key={ec.id}
                irisColor={ec.hex}
                size={90}
                selected={selectedId === ec.id}
                label={ec.name}
                onClick={() => setSelectedId(ec.id)}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedId}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl mx-auto px-4 py-8 space-y-6"
        >
          {/* Top row: eye + country + description */}
          <div className="grid md:grid-cols-3 gap-5">
            {/* Eye card */}
            <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-7 shadow-sm flex flex-col items-center text-center">
              <EyeIllustration irisColor={color.hex} size={150} />
              <h2 className="text-2xl font-black text-gray-900 mt-4">{color.name} Eyes</h2>
              <p className="font-bold mt-1" style={{ color: color.hex }}>{color.globalPrevalence} of world population</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                <span className="w-3 h-3 rounded-full inline-block border border-gray-200" style={{ backgroundColor: color.hex }} />
                Melanin: <strong className="text-gray-600">{color.melaninLevel}</strong>
              </div>
            </div>

            {/* Right column: country + description + genetics */}
            <div className="md:col-span-2 space-y-4">
              {/* Primary country */}
              <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-5 shadow-sm">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Primary Country</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{color.mainCountryFlag}</span>
                    <div>
                      <p className="text-xl font-black text-gray-900">{color.mainCountry}</p>
                      <p className="text-sm text-gray-400">{color.mainCountryRegion}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black" style={{ color: color.hex }}>
                      {color.mainCountryPercentage < 1 ? "<1" : color.mainCountryPercentage}%
                    </p>
                    <p className="text-xs text-gray-400">of population</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white/80 backdrop-blur border border-white/60 rounded-2xl p-5 shadow-sm">
                <p className="text-gray-700 text-sm leading-relaxed">{color.description}</p>
              </div>

              {/* Genetics */}
              <div className="bg-white/60 border border-purple-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span>🧬</span>
                  <p className="text-sm font-bold text-purple-800">Genetics</p>
                </div>
                <p className="text-sm text-purple-700 leading-relaxed">{color.genetics}</p>
              </div>
            </div>
          </div>

          {/* Countries */}
          <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <Globe className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-bold text-gray-900">Countries with {color.name} Eyes</h3>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {color.countries.map((country, i) => (
                <motion.div
                  key={country.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 bg-gray-50/80 rounded-xl"
                >
                  <span className="text-2xl">{country.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-800 truncate">{country.name}</span>
                      <span className="text-sm font-bold ml-2" style={{ color: color.hex }}>
                        {country.percentage < 0.1 ? "<0.1" : country.percentage}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: color.hex }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(country.percentage, 100)}%` }}
                        transition={{ delay: i * 0.04 + 0.2, duration: 0.6 }}
                      />
                    </div>
                    {country.region && <p className="text-xs text-gray-400 mt-0.5">{country.region}</p>}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Similar countries */}
          <div className="bg-white/80 backdrop-blur border border-white/60 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <ChevronRight className="w-5 h-5 text-teal-500" />
              <h3 className="text-lg font-bold text-gray-900">Similar Countries</h3>
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              {color.similarCountries.map((sc, i) => (
                <div key={i} className="flex items-start gap-3 bg-teal-50/80 border border-teal-100 rounded-xl p-4">
                  <span className="text-3xl">{sc.flag}</span>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{sc.country}</p>
                    <p className="text-xs text-teal-700 leading-relaxed mt-0.5">{sc.similarity}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Health & Disease Risks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-black text-gray-900">Health &amp; Disease Risks</h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  Conditions associated with {color.name} eyes — backed by genetic and clinical research
                </p>
              </div>
              <span className="text-2xl">🔬</span>
            </div>

            {/* Risk legend */}
            <div className="flex flex-wrap gap-2 mb-4">
              {riskCounts.high > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-red-500 text-white shadow-sm">
                  <AlertTriangle className="w-3 h-3" /> HIGH RISK
                </span>
              )}
              {riskCounts.moderate > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-orange-400 text-white shadow-sm">
                  <Zap className="w-3 h-3" /> MODERATE RISK
                </span>
              )}
              {riskCounts.low > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-green-500 text-white shadow-sm">
                  <CheckCircle className="w-3 h-3" /> LOW RISK
                </span>
              )}
              {riskCounts.protective > 0 && (
                <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-full bg-blue-500 text-white shadow-sm">
                  <Shield className="w-3 h-3" /> PROTECTIVE
                </span>
              )}
            </div>

            <div className="space-y-3">
              {color.diseases.map((disease, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <DiseaseAccordion disease={disease} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white/80 backdrop-blur border border-green-100 rounded-3xl p-6 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-bold text-gray-900">Recommendations</h3>
            </div>
            <ul className="space-y-2.5">
              {color.recommendations.map((r, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: color.hex }}>
                    {i + 1}
                  </span>
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
