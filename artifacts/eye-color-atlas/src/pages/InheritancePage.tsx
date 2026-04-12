import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dna, ArrowLeft, CheckCircle, TrendingUp } from "lucide-react";
import { inheritanceData } from "@/data/eyeColorData";
import { Link } from "wouter";
import EyeIllustration from "@/components/EyeIllustration";

const COLOR_OPTIONS = [
  { id: "brown",  label: "Brown",  hex: "#7B4F32" },
  { id: "black",  label: "Black",  hex: "#1A0A00" },
  { id: "blue",   label: "Blue",   hex: "#4A90D9" },
  { id: "green",  label: "Green",  hex: "#4A7C4E" },
  { id: "hazel",  label: "Hazel",  hex: "#8E6B3E" },
  { id: "amber",  label: "Amber",  hex: "#C8940A" },
  { id: "grey",   label: "Grey",   hex: "#7E9BA8" },
  { id: "violet", label: "Violet", hex: "#7B2D8B" },
];

const COLOR_HEX: Record<string, string> = {
  brown:  "#7B4F32",
  black:  "#1A0A00",
  blue:   "#4A90D9",
  green:  "#4A7C4E",
  hazel:  "#8E6B3E",
  amber:  "#C8940A",
  grey:   "#7E9BA8",
  violet: "#7B2D8B",
  other:  "#A855F7",
};

function getKey(a: string, b: string) {
  return [a, b].sort().join("-");
}

interface ParentPickerProps {
  label: string;
  value: string;
  onChange: (id: string) => void;
}

function ParentPicker({ label, value, onChange }: ParentPickerProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        {COLOR_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            className={`flex items-center gap-2.5 p-2.5 rounded-2xl border-2 transition-all duration-200 text-left ${
              value === opt.id
                ? "border-gray-900 bg-gray-50 shadow-sm"
                : "border-gray-100 bg-gray-50 hover:border-gray-300"
            }`}
          >
            <EyeIllustration irisColor={opt.hex} size={36} />
            <span className={`font-semibold text-sm ${value === opt.id ? "text-gray-900" : "text-gray-500"}`}>
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function InheritancePage() {
  const [parent1, setParent1] = useState("brown");
  const [parent2, setParent2] = useState("blue");

  const key    = getKey(parent1, parent2);
  const result = inheritanceData[key as keyof typeof inheritanceData];

  const p1opt = COLOR_OPTIONS.find((c) => c.id === parent1)!;
  const p2opt = COLOR_OPTIONS.find((c) => c.id === parent2)!;

  // Find the single most likely outcome
  const topEntry = result
    ? Object.entries(result)
        .filter(([k]) => k !== "successRate" && k !== "note")
        .map(([color, pct]) => ({ color, pct: pct as number }))
        .sort((a, b) => b.pct - a.pct)[0]
    : null;

  const predictedColor = topEntry ? COLOR_OPTIONS.find((c) => c.id === topEntry.color) : null;
  const predictedHex   = topEntry ? (COLOR_HEX[topEntry.color] ?? "#7B4F32") : "#7B4F32";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Atlas
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 mb-8">
            <div className="flex items-center gap-3 mb-3">
              <Dna className="w-8 h-8 text-purple-500" />
              <h1 className="text-3xl font-black text-gray-900">Eye Color Inheritance Predictor</h1>
            </div>
            <p className="text-gray-500 leading-relaxed">
              Select both parents' eye colors to get the predicted eye color for their child,
              with a success rate based on recorded genetic cases.
            </p>
          </div>

          {/* Parent Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <ParentPicker label="Parent 1 Eye Color" value={parent1} onChange={setParent1} />
            <ParentPicker label="Parent 2 Eye Color" value={parent2} onChange={setParent2} />
          </div>

          {/* Combo label */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <EyeIllustration irisColor={p1opt.hex} size={32} />
              <span className="font-semibold text-gray-800">{p1opt.label}</span>
            </div>
            <span className="text-2xl text-gray-400 font-light">×</span>
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <EyeIllustration irisColor={p2opt.hex} size={32} />
              <span className="font-semibold text-gray-800">{p2opt.label}</span>
            </div>
          </div>

          {/* Result */}
          <AnimatePresence mode="wait">
            {result && topEntry ? (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-5"
              >
                {/* Main prediction card */}
                <div
                  className="bg-white rounded-3xl shadow-sm overflow-hidden border-2"
                  style={{ borderColor: predictedHex }}
                >
                  {/* Colour header strip */}
                  <div
                    className="h-3 w-full"
                    style={{ backgroundColor: predictedHex }}
                  />

                  <div className="p-8">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
                      Predicted Eye Color
                    </p>

                    {/* Big eye + color name */}
                    <div className="flex flex-col items-center mb-8">
                      <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 18 }}
                      >
                        <EyeIllustration irisColor={predictedHex} size={160} selected />
                      </motion.div>

                      <h2
                        className="text-4xl font-black mt-5 capitalize"
                        style={{ color: predictedHex }}
                      >
                        {predictedColor?.label ?? topEntry.color}
                      </h2>

                      <p className="text-gray-400 text-sm mt-1">Most likely eye color for the child</p>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-2 gap-4">

                      {/* Genetic probability */}
                      <div className="bg-gray-50 rounded-2xl p-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <TrendingUp className="w-4 h-4 text-gray-400" />
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Genetic Probability
                          </p>
                        </div>
                        <motion.p
                          className="text-4xl font-black"
                          style={{ color: predictedHex }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.25 }}
                        >
                          {topEntry.pct.toFixed(0)}%
                        </motion.p>
                        <p className="text-xs text-gray-400 mt-1">chance of this outcome</p>
                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: predictedHex }}
                            initial={{ width: 0 }}
                            animate={{ width: `${topEntry.pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                          />
                        </div>
                      </div>

                      {/* Historical success rate */}
                      <div className="bg-gray-50 rounded-2xl p-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                            Past Record Rate
                          </p>
                        </div>
                        <motion.p
                          className="text-4xl font-black text-green-500"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.35 }}
                        >
                          {result.successRate}%
                        </motion.p>
                        <p className="text-xs text-gray-400 mt-1">confirmed in recorded cases</p>
                        <div className="mt-3 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-green-400 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${result.successRate}%` }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Genetics note */}
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 text-sm text-purple-800 leading-relaxed">
                  {result.note}
                </div>

                {/* How it works */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-sm text-gray-500 leading-relaxed">
                  <p className="font-semibold text-gray-700 mb-2">How this works</p>
                  <p>
                    Eye color inheritance follows a polygenic model controlled by the{" "}
                    <strong className="text-purple-600">OCA2</strong> and{" "}
                    <strong className="text-purple-600">HERC2</strong> genes on chromosome 15, with input from{" "}
                    <strong className="text-purple-600">SLC24A4</strong>, <strong className="text-purple-600">TYRP1</strong>,
                    and other pigmentation loci. The <em>Genetic Probability</em> is derived from Punnett square and polygenic models.
                    The <em>Past Record Rate</em> reflects how often this exact parent combination produced the predicted outcome
                    in documented genetic studies and family cohort data.
                  </p>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 text-center text-gray-400">
                <Dna className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                <p>Select both parents' eye colors above to see the prediction.</p>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
