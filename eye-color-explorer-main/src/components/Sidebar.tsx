import { motion } from "framer-motion";
import { Eye, BarChart3, Globe2, Sparkles, Activity } from "lucide-react";
import { eyeColors, regions, eyeColorMap, type EyeColor, type Region } from "@/data/eyeColorData";
import AnimatedCounter from "@/components/AnimatedCounter";

interface SidebarProps {
  selectedColor: EyeColor;
  selectedRegion: Region;
  onColorChange: (c: EyeColor) => void;
  onRegionChange: (r: Region) => void;
  avgPercentage: number;
  totalPopulation: number;
  countryCount: number;
}

const regionIcons: Record<string, string> = {
  All: "🌐", Asia: "🌏", Europe: "🌍", Africa: "🌍", "North America": "🌎", "South America": "🌎",
};

export default function Sidebar({
  selectedColor, selectedRegion, onColorChange, onRegionChange,
  avgPercentage, totalPopulation, countryCount,
}: SidebarProps) {
  return (
    <aside className="w-72 h-screen shrink-0 glass-card p-5 flex flex-col gap-5 overflow-y-auto scrollbar-thin">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-3 pb-3 border-b border-border/30"
      >
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/30 to-accent/20 shadow-lg shadow-primary/10">
          <Eye className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h2 className="font-display font-bold text-foreground text-lg tracking-tight">Eye Color Atlas</h2>
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest">AI Analytics</p>
        </div>
      </motion.div>

      {/* Eye Color */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5 block flex items-center gap-1.5">
          <Activity className="w-3 h-3" /> Eye Color
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {eyeColors.map((c, i) => (
            <motion.button
              key={c}
              onClick={() => onColorChange(c)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 relative overflow-hidden ${
                selectedColor === c
                  ? "border border-primary/50 text-foreground"
                  : "bg-secondary/30 border border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {selectedColor === c && (
                <motion.div
                  layoutId="eyeColorBg"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: `${eyeColorMap[c]}18` }}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm relative z-10"
                style={{ background: eyeColorMap[c], boxShadow: selectedColor === c ? `0 0 8px ${eyeColorMap[c]}` : "none" }}
              />
              <span className="relative z-10">{c}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Region */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] mb-2.5 block flex items-center gap-1.5">
          <Globe2 className="w-3 h-3" /> Region Filter
        </label>
        <div className="flex flex-col gap-0.5">
          {regions.map((r) => (
            <motion.button
              key={r}
              onClick={() => onRegionChange(r)}
              whileHover={{ x: 4 }}
              className={`text-left px-3 py-2 rounded-lg text-xs transition-all duration-200 flex items-center gap-2 relative ${
                selectedRegion === r
                  ? "text-accent font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {selectedRegion === r && (
                <motion.div
                  layoutId="regionBg"
                  className="absolute inset-0 bg-accent/10 rounded-lg"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className="relative z-10">{regionIcons[r]} {r}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-auto"
      >
        <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-1.5 mb-3">
          <Sparkles className="w-3 h-3 text-primary" /> Live Statistics
        </h3>
        <div className="glass-card p-3.5 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <BarChart3 className="w-3 h-3 text-primary" /> Avg Prevalence
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={avgPercentage} suffix="%" formatFn={(n) => n.toFixed(1)} />
            </span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-secondary/50 rounded-full h-1">
            <motion.div
              className="h-1 rounded-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${avgPercentage}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <Globe2 className="w-3 h-3 text-accent" /> Total Pop.
            </span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={totalPopulation} />
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-muted-foreground">🏳️ Countries</span>
            <span className="text-sm font-bold text-foreground tabular-nums">
              <AnimatedCounter value={countryCount} />
            </span>
          </div>
        </div>
      </motion.div>
    </aside>
  );
}
