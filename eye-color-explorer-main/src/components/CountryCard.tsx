import { motion } from "framer-motion";
import { type EyeColorEntry, eyeColorMap } from "@/data/eyeColorData";
import { MapPin, Users, TrendingUp, Layers } from "lucide-react";

interface CountryCardProps {
  entry: EyeColorEntry;
  index: number;
}

export default function CountryCard({ entry, index }: CountryCardProps) {
  const color = eyeColorMap[entry.eye_color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="glass-card-hover p-5 group cursor-default"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-lg"
            style={{ background: `${color}15` }}>
            🌍
          </div>
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">{entry.country}</h3>
            <p className="text-[10px] text-muted-foreground">{entry.region}</p>
          </div>
        </div>
        <span
          className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider"
          style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}
        >
          {entry.eye_color}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Prevalence
            </span>
            <span className="text-sm font-bold text-foreground">{entry.percentage}%</span>
          </div>
          <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-2 rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
              initial={{ width: 0 }}
              animate={{ width: `${entry.percentage}%` }}
              transition={{ duration: 1, delay: index * 0.06 + 0.3, ease: "easeOut" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground flex items-center gap-1">
            <Users className="w-3 h-3 text-primary" /> Population
          </span>
          <span className="font-semibold text-foreground">
            {entry.population_with_eye_color >= 1e9
              ? (entry.population_with_eye_color / 1e9).toFixed(1) + "B"
              : entry.population_with_eye_color >= 1e6
              ? (entry.population_with_eye_color / 1e6).toFixed(1) + "M"
              : entry.population_with_eye_color.toLocaleString()}
          </span>
        </div>
      </div>

      {entry.resembles_countries.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <p className="text-[10px] text-muted-foreground mb-1.5 flex items-center gap-1">
            <Layers className="w-3 h-3" /> Similar Countries
          </p>
          <div className="flex flex-wrap gap-1">
            {entry.resembles_countries.map((c) => (
              <span key={c} className="px-2 py-0.5 rounded-md bg-secondary/60 text-[10px] text-secondary-foreground border border-border/30">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
