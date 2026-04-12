import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Globe, ArrowLeft, PieChart as PieIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Sector,
} from "recharts";
import { countryEyeColorData } from "@/data/eyeColorData";
import { Link } from "wouter";

const EYE_PALETTE: Record<string, { label: string; hex: string; gradient: [string, string] }> = {
  brown:  { label: "Brown",        hex: "#8B5E3C", gradient: ["#C48A5A", "#6B3F20"] },
  blue:   { label: "Blue",         hex: "#4A90E2", gradient: ["#74B3FF", "#2962B8"] },
  green:  { label: "Green",        hex: "#4CAF50", gradient: ["#80E07F", "#2E7D32"] },
  hazel:  { label: "Hazel",        hex: "#A67C52", gradient: ["#D4A574", "#7A4F2A"] },
  grey:   { label: "Gray",         hex: "#7B9DB4", gradient: ["#A8C4D8", "#4F7A96"] },
  amber:  { label: "Amber",        hex: "#E8A020", gradient: ["#FFC84A", "#B87000"] },
  black:  { label: "Dark / Black", hex: "#2D2020", gradient: ["#554040", "#0A0A0A"] },
  other:  { label: "Other",        hex: "#A855F7", gradient: ["#C984FF", "#7C22D4"] },
};

function ActiveShape(props: Record<string, unknown>) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle,
    fill, payload, percent,
  } = props as {
    cx: number; cy: number; innerRadius: number; outerRadius: number;
    startAngle: number; endAngle: number; fill: string;
    payload: { name: string; value: number }; percent: number;
  };

  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 10}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.25))" }}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 13}
        outerRadius={outerRadius + 16}
        startAngle={startAngle} endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
      <text x={cx} y={cy - 14} textAnchor="middle" fill="#111827" fontSize={15} fontWeight={800}>
        {payload.name}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="#374151" fontSize={22} fontWeight={900}>
        {`${payload.value}%`}
      </text>
      <text x={cx} y={cy + 26} textAnchor="middle" fill="#9CA3AF" fontSize={11}>
        of population
      </text>
    </g>
  );
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { fill: string } }> }) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-5 py-3 text-sm pointer-events-none">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.payload.fill }} />
        <span className="font-bold text-gray-900">{item.name}</span>
      </div>
      <p className="text-2xl font-black" style={{ color: item.payload.fill }}>{item.value}%</p>
      <p className="text-gray-400 text-xs">of population</p>
    </div>
  );
}

export default function CountryPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | undefined>(undefined);
  const [chartMode, setChartMode] = useState<"donut" | "pie">("donut");

  const countries = Object.keys(countryEyeColorData).sort();
  const filtered = useMemo(
    () => countries.filter((c) => c.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const rawData = selected ? countryEyeColorData[selected] : null;

  const chartData = useMemo(() => {
    if (!rawData) return [];
    return Object.entries(rawData)
      .filter(([, v]) => v > 0)
      .sort(([, a], [, b]) => b - a)
      .map(([color, pct]) => ({
        name: EYE_PALETTE[color]?.label ?? color,
        value: pct as number,
        colorKey: color,
        fill: EYE_PALETTE[color]?.hex ?? "#9CA3AF",
        gradId: `grad-${color}`,
      }));
  }, [rawData]);

  const dominant = chartData[0];
  const onPieEnter = useCallback((_: unknown, index: number) => setActiveIndex(index), []);
  const onPieLeave = useCallback(() => setActiveIndex(undefined), []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Atlas
        </Link>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-3xl shadow-sm p-8 mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Globe className="w-8 h-8 text-teal-500" />
              <h1 className="text-3xl font-black text-gray-900">Find Eye Colors by Country</h1>
            </div>
            <p className="text-gray-400 text-sm">Search any country to discover its eye color distribution in an interactive chart.</p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search country..."
              value={query}
              onChange={(e) => { setQuery(e.target.value); }}
              className="w-full bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-400 shadow-sm transition text-sm"
            />
          </div>

          <div className="grid md:grid-cols-5 gap-5">
            {/* Country list */}
            <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
              <div className="px-5 py-3.5 border-b border-gray-100">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{filtered.length} Countries</span>
              </div>
              <div className="overflow-y-auto flex-1 max-h-[480px]">
                {filtered.map((country) => (
                  <button
                    key={country}
                    onClick={() => { setSelected(country); setActiveIndex(undefined); }}
                    className={`w-full text-left px-5 py-3.5 text-sm transition-all border-b border-gray-50 flex items-center justify-between group ${
                      selected === country
                        ? "bg-teal-50 text-teal-800 font-bold"
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>{country}</span>
                    {selected === country
                      ? <div className="w-2 h-2 rounded-full bg-teal-400" />
                      : <div className="w-1.5 h-1.5 rounded-full bg-gray-200 group-hover:bg-gray-300 transition" />
                    }
                  </button>
                ))}
              </div>
            </div>

            {/* Chart panel */}
            <div className="md:col-span-3">
              <AnimatePresence mode="wait">
                {selected && chartData.length > 0 ? (
                  <motion.div
                    key={selected}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden"
                  >
                    {/* Country title */}
                    <div className="px-7 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900">{selected}</h2>
                        {dominant && (
                          <p className="text-sm text-gray-400 mt-0.5">
                            Dominant: <strong style={{ color: dominant.fill }}>{dominant.name}</strong> ({dominant.value}%)
                          </p>
                        )}
                      </div>
                      {/* Toggle pie / donut */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => setChartMode("donut")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartMode === "donut" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          Donut
                        </button>
                        <button
                          onClick={() => setChartMode("pie")}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${chartMode === "pie" ? "bg-white shadow text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          Pie
                        </button>
                      </div>
                    </div>

                    <div className="px-7 py-5">
                      {/* Donut / Pie chart */}
                      <div className="h-72 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <defs>
                              {chartData.map((d) => {
                                const palette = EYE_PALETTE[d.colorKey];
                                if (!palette) return null;
                                return (
                                  <linearGradient key={d.gradId} id={d.gradId} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor={palette.gradient[0]} />
                                    <stop offset="100%" stopColor={palette.gradient[1]} />
                                  </linearGradient>
                                );
                              })}
                            </defs>
                            <Pie
                              data={chartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={chartMode === "donut" ? "52%" : 0}
                              outerRadius="80%"
                              paddingAngle={chartData.length > 1 ? 2 : 0}
                              dataKey="value"
                              activeIndex={activeIndex}
                              activeShape={chartMode === "donut" ? ActiveShape : undefined}
                              onMouseEnter={onPieEnter}
                              onMouseLeave={onPieLeave}
                              animationBegin={0}
                              animationDuration={900}
                              animationEasing="ease-out"
                              isAnimationActive
                            >
                              {chartData.map((d) => (
                                <Cell
                                  key={d.colorKey}
                                  fill={`url(#${d.gradId})`}
                                  stroke="white"
                                  strokeWidth={2}
                                  style={{ cursor: "pointer", filter: activeIndex !== undefined && chartData.indexOf(d) !== activeIndex ? "brightness(0.88)" : undefined }}
                                />
                              ))}
                            </Pie>
                            {chartMode === "pie" && (
                              <Tooltip content={<CustomTooltip />} />
                            )}
                          </PieChart>
                        </ResponsiveContainer>
                        {/* Center label overlay — only in donut mode when nothing is hovered */}
                        {chartMode === "donut" && activeIndex === undefined && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-sm font-bold text-gray-700">Eye Colors</span>
                            <span className="text-xs text-gray-400">{chartData.length} types</span>
                          </div>
                        )}
                      </div>

                      {/* Legend grid */}
                      <div className="grid grid-cols-2 gap-2 mt-4">
                        {chartData.map((d, i) => (
                          <motion.div
                            key={d.colorKey}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.06 }}
                            onMouseEnter={() => setActiveIndex(i)}
                            onMouseLeave={() => setActiveIndex(undefined)}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                              activeIndex === i
                                ? "border-transparent shadow-md scale-[1.02]"
                                : "border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white"
                            }`}
                            style={activeIndex === i ? { backgroundColor: `${d.fill}18`, borderColor: `${d.fill}40` } : {}}
                          >
                            {/* Color swatch with gradient */}
                            <div
                              className="w-8 h-8 rounded-lg flex-shrink-0 shadow-sm"
                              style={{
                                background: `linear-gradient(135deg, ${EYE_PALETTE[d.colorKey]?.gradient[0] ?? d.fill}, ${EYE_PALETTE[d.colorKey]?.gradient[1] ?? d.fill})`,
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-700 truncate">{d.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="flex-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{ width: `${d.value}%`, backgroundColor: d.fill }}
                                  />
                                </div>
                              </div>
                            </div>
                            <span className="text-sm font-black flex-shrink-0" style={{ color: d.fill }}>
                              {d.value}%
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-white border border-gray-200 rounded-3xl shadow-sm p-10 flex flex-col items-center justify-center text-center min-h-96"
                  >
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <PieIcon className="w-9 h-9 text-gray-200" />
                    </div>
                    <p className="text-gray-500 text-lg font-semibold">Select a country</p>
                    <p className="text-gray-300 text-sm mt-1">to see its eye color distribution</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
