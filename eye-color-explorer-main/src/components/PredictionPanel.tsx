import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, MapPin, TrendingUp, Users, Globe2, Cpu } from "lucide-react";
import { type EyeColorEntry, predictCountry, eyeColorMap } from "@/data/eyeColorData";

interface PredictionProps {
  data: EyeColorEntry[];
  eyeColor: string;
}

function TypewriterText({ text }: { text: string }) {
  return (
    <motion.span>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: i * 0.04 }}
        >
          {char}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function PredictionPanel({ data, eyeColor }: PredictionProps) {
  const [prediction, setPrediction] = useState<EyeColorEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);

  const handlePredict = () => {
    setLoading(true);
    setPrediction(null);
    setStep(1);
    setTimeout(() => setStep(2), 500);
    setTimeout(() => setStep(3), 900);
    setTimeout(() => {
      setPrediction(predictCountry(data));
      setLoading(false);
      setStep(0);
    }, 1500);
  };

  const color = eyeColorMap[eyeColor] || "hsl(250,90%,65%)";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card p-5 relative overflow-hidden"
    >
      {/* Animated background glow */}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-10 blur-3xl"
        style={{ background: color }} />

      <div className="flex items-center justify-between mb-5 relative z-10">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2 text-sm">
          <Cpu className="w-4 h-4 text-accent" />
          ML Prediction Engine
        </h3>
        <motion.button
          onClick={handlePredict}
          disabled={data.length === 0 || loading}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${color}, hsl(var(--accent)))`,
            color: "hsl(var(--primary-foreground))",
            boxShadow: `0 4px 20px ${color}40`,
          }}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Processing…
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Predict Country
            </span>
          )}
        </motion.button>
      </div>

      {/* Loading steps */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2 mb-4"
          >
            {[
              { s: 1, t: "Analyzing eye color patterns…" },
              { s: 2, t: "Cross-referencing population data…" },
              { s: 3, t: "Running prediction model…" },
            ].map(({ s, t }) => (
              <motion.div
                key={s}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: step >= s ? 1 : 0.3, x: 0 }}
                className="flex items-center gap-2 text-xs"
              >
                {step >= s ? (
                  <span className="w-4 h-4 rounded-full bg-accent/20 flex items-center justify-center text-accent text-[10px]">✓</span>
                ) : (
                  <span className="w-4 h-4 rounded-full bg-secondary/50 animate-pulse" />
                )}
                <span className={step >= s ? "text-foreground" : "text-muted-foreground"}>{t}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence mode="wait">
        {prediction && (
          <motion.div
            key={prediction.country}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="rounded-xl p-5 relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${color}10, hsl(var(--accent) / 0.08))`, border: `1px solid ${color}25` }}
            >
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />

              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ background: `${color}20` }}>
                  🎯
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Predicted Country</p>
                  <h4 className="font-display text-2xl font-black gradient-text">
                    <TypewriterText text={prediction.country} />
                  </h4>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[10px] text-muted-foreground">Confidence</p>
                  <p className="text-xl font-black text-accent">{prediction.percentage}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: TrendingUp, label: "Match", value: `${prediction.percentage}%`, iconColor: "text-accent" },
                  { icon: Users, label: "Population", value: prediction.population_with_eye_color >= 1e9 ? (prediction.population_with_eye_color/1e9).toFixed(1)+"B" : (prediction.population_with_eye_color/1e6).toFixed(1)+"M", iconColor: "text-primary" },
                  { icon: Globe2, label: "Region", value: prediction.region, iconColor: "text-muted-foreground" },
                  { icon: MapPin, label: "Similar", value: prediction.resembles_countries[0] || "—", iconColor: "text-muted-foreground" },
                ].map(({ icon: Icon, label, value, iconColor }, i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="glass-card p-2.5 rounded-lg"
                  >
                    <Icon className={`w-3 h-3 ${iconColor} mb-1`} />
                    <p className="text-[9px] text-muted-foreground uppercase">{label}</p>
                    <p className="text-xs font-bold text-foreground truncate">{value}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!prediction && !loading && (
        <p className="text-xs text-muted-foreground text-center py-6">
          Select an eye color and click <span className="text-accent font-medium">Predict Country</span> to run the ML model 🧠
        </p>
      )}
    </motion.div>
  );
}
