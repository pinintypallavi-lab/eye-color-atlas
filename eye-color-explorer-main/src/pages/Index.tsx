import { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import CountryCard from "@/components/CountryCard";
import Charts from "@/components/Charts";
import PredictionPanel from "@/components/PredictionPanel";
import HealthRiskPanel from "@/components/HealthRiskPanel";
import ParticleBackground from "@/components/ParticleBackground";
import AnimatedCounter from "@/components/AnimatedCounter";
import { type EyeColor, type Region, getFilteredData, getStats, eyeColorMap, eyeColors } from "@/data/eyeColorData";
import { Eye, Menu, X, ChevronDown, BarChart3, Globe2, Users } from "lucide-react";

export default function Index() {
  const [eyeColor, setEyeColor] = useState<EyeColor>("Brown");
  const [region, setRegion] = useState<Region>("All");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const dashRef = useRef<HTMLDivElement>(null);

  const data = useMemo(() => getFilteredData(eyeColor, region), [eyeColor, region]);
  const stats = useMemo(() => getStats(data), [data]);

  const scrollToDashboard = () => {
    setShowHero(false);
    setTimeout(() => dashRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <ParticleBackground />

      {/* HERO SECTION */}
      <AnimatePresence>
        {showHero && (
          <motion.section
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center"
          >
            {/* Radial glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[600px] h-[600px] rounded-full opacity-20 blur-[120px]"
                style={{ background: "radial-gradient(circle, hsl(250,90%,65%), hsl(200,90%,55%), transparent)" }} />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative z-10"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center shadow-2xl shadow-primary/20"
              >
                <Eye className="w-10 h-10 text-primary" />
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-4">
                <span className="gradient-text">Eye Color</span>
                <br />
                <span className="text-foreground">Atlas</span>
              </h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground text-sm sm:text-base max-w-lg mx-auto mb-10 leading-relaxed"
              >
                An AI-powered analytics dashboard exploring global eye color distribution patterns and health insights.
              </motion.p>

              {/* Eye color preview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 mb-10"
              >
                {eyeColors.map((c, i) => (
                  <motion.div
                    key={c}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.05, type: "spring" }}
                    className="w-8 h-8 rounded-full border-2 border-border/30 shadow-lg cursor-pointer hover:scale-125 transition-transform"
                    style={{
                      background: eyeColorMap[c],
                      boxShadow: `0 0 20px ${eyeColorMap[c]}40`,
                    }}
                    title={c}
                    onClick={() => { setEyeColor(c); scrollToDashboard(); }}
                  />
                ))}
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={scrollToDashboard}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3.5 rounded-xl text-sm font-bold tracking-wide uppercase transition-all duration-300 relative overflow-hidden group"
                style={{
                  background: "linear-gradient(135deg, hsl(250,90%,65%), hsl(200,90%,55%))",
                  color: "hsl(0,0%,100%)",
                  boxShadow: "0 8px 30px hsl(250,90%,65%,0.3)",
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  Explore Dashboard
                  <ChevronDown className="w-4 h-4 animate-bounce" />
                </span>
              </motion.button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              className="flex justify-center gap-8 sm:gap-12 mt-2"
            >
              {[
                { icon: BarChart3, label: "Eye Colors", value: "7" },
                { icon: Globe2, label: "Countries", value: "35+" },
                { icon: Users, label: "Data Points", value: "1000+" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="text-center">
                  <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
                  <p className="text-lg font-bold text-foreground">{value}</p>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* DASHBOARD */}
      <div ref={dashRef} className={`${showHero ? "" : ""}`}>
        {!showHero && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex min-h-screen relative z-10"
          >
            {/* Mobile overlay */}
            {sidebarOpen && (
              <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
              <Sidebar
                selectedColor={eyeColor}
                selectedRegion={region}
                onColorChange={(c) => { setEyeColor(c); setSidebarOpen(false); }}
                onRegionChange={(r) => { setRegion(r); setSidebarOpen(false); }}
                avgPercentage={stats.avgPercentage}
                totalPopulation={stats.totalPopulation}
                countryCount={stats.countryCount}
              />
            </div>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
              {/* Topbar */}
              <header className="sticky top-0 z-30 backdrop-blur-xl border-b border-border/30 px-4 lg:px-6 py-3 flex items-center justify-between"
                style={{ background: "hsl(var(--background) / 0.7)" }}>
                <div className="flex items-center gap-3">
                  <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-lg bg-secondary/50 text-foreground hover:bg-secondary transition-colors">
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </button>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-primary" />
                    <h1 className="font-display text-sm font-bold gradient-text hidden sm:block">Eye Color Atlas</h1>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowHero(true)}
                    className="text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
                  >
                    ← Home
                  </button>
                  <div className="h-4 w-px bg-border/30" />
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-sm"
                      style={{ background: eyeColorMap[eyeColor], boxShadow: `0 0 8px ${eyeColorMap[eyeColor]}60` }}
                    />
                    <span className="text-xs font-semibold text-foreground">{eyeColor}</span>
                    <span className="text-[10px] text-muted-foreground">• {region}</span>
                  </div>
                </div>
              </header>

              <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
                {/* Stats strip */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: BarChart3, label: "Avg Prevalence", value: stats.avgPercentage, suffix: "%", color: "text-primary", format: (n: number) => n.toFixed(1) },
                    { icon: Users, label: "Total Population", value: stats.totalPopulation, suffix: "", color: "text-accent", format: undefined },
                    { icon: Globe2, label: "Countries", value: stats.countryCount, suffix: "", color: "text-muted-foreground", format: undefined },
                  ].map(({ icon: Icon, label, value, suffix, color: iconColor, format }, i) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-4 relative overflow-hidden group"
                    >
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon className={`w-4 h-4 ${iconColor} mb-2`} />
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
                      <p className="text-xl font-black text-foreground tabular-nums mt-0.5">
                        <AnimatedCounter value={value} suffix={suffix} formatFn={format} />
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Hero banner */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="glass-card p-6 relative overflow-hidden"
                >
                  <div className="absolute inset-0 opacity-5" style={{ background: `linear-gradient(135deg, ${eyeColorMap[eyeColor]}, transparent 70%)` }} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-xl lg:text-2xl font-black text-foreground mb-1.5 flex items-center gap-2">
                        👁️ {eyeColor} Eye Analysis
                      </h2>
                      <p className="text-xs text-muted-foreground max-w-xl leading-relaxed">
                        Viewing <span className="text-foreground font-medium">{stats.countryCount}</span> countries
                        {region !== "All" ? ` in ${region}` : " worldwide"} with an average prevalence of{" "}
                        <span className="text-accent font-semibold">{stats.avgPercentage}%</span>.
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-1">
                      {eyeColors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setEyeColor(c)}
                          className={`w-5 h-5 rounded-full transition-all duration-300 ${eyeColor === c ? "ring-2 ring-offset-2 ring-offset-background scale-125" : "opacity-50 hover:opacity-100"}`}
                          style={{
                            background: eyeColorMap[c],
                            ...(eyeColor === c ? { ringColor: eyeColorMap[c] } : {}),
                          }}
                          title={c}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>

                <PredictionPanel data={data} eyeColor={eyeColor} />
                <Charts data={data} eyeColor={eyeColor} />

                <HealthRiskPanel eyeColor={eyeColor} />

                <div>
                  <h3 className="font-display font-bold text-foreground mb-4 text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-accent" />
                    Country Analysis ({data.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {data.map((entry, i) => (
                      <CountryCard key={entry.country + entry.eye_color} entry={entry} index={i} />
                    ))}
                  </div>
                  {data.length === 0 && (
                    <div className="glass-card p-10 text-center text-muted-foreground text-sm">
                      No countries found for {eyeColor} eyes in {region}. Try adjusting your filters.
                    </div>
                  )}
                </div>
              </div>
            </main>
          </motion.div>
        )}
      </div>
    </div>
  );
}
