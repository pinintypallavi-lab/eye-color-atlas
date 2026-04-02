import { motion } from "framer-motion";
import { ShieldAlert, Sun, Stethoscope, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { eyeHealthData, allHealthComparison } from "@/data/eyeHealthData";
import { eyeColorMap } from "@/data/eyeColorData";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";

const sensitivityColor: Record<string, string> = {
  Low: "bg-green-500/20 text-green-400 border-green-500/30",
  Moderate: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  High: "bg-red-500/20 text-red-400 border-red-500/30",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-2.5 text-xs border border-primary/20 shadow-xl">
      <p className="text-foreground font-semibold text-[11px]">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-bold text-sm mt-0.5">
          {p.name}: {p.value}/10
        </p>
      ))}
    </div>
  );
};

export default function HealthRiskPanel({ eyeColor }: { eyeColor: string }) {
  const health = eyeHealthData[eyeColor];
  if (!health) return null;

  const color = eyeColorMap[eyeColor] || "hsl(250,90%,65%)";

  return (
    <div className="space-y-4">
      <h3 className="font-display font-bold text-foreground text-sm flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
        Eye Color Health Risk Analysis
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Health Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={eyeColor}
          className="glass-card p-5 lg:col-span-1 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ background: color }} />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
              <ShieldAlert className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <p className="text-foreground font-bold text-sm">{eyeColor} Eyes</p>
              <p className="text-muted-foreground text-[10px] uppercase tracking-wider">Health Profile</p>
            </div>
          </div>

          {/* Sensitivity Badge */}
          <div className="mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Light Sensitivity</p>
            <Badge className={`${sensitivityColor[health.sensitivity]} border text-xs px-3 py-1`}>
              <Sun className="w-3 h-3 mr-1.5" />
              {health.sensitivity}
            </Badge>
          </div>

          {/* Disease Risks */}
          <div className="mb-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              Associated Risks
            </p>
            <ul className="space-y-1.5">
              {health.risks.map((risk) => (
                <li key={risk} className="text-xs text-muted-foreground flex items-start gap-2">
                  <span className="w-1 h-1 rounded-full bg-destructive/60 mt-1.5 shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg bg-primary/5 border border-primary/10 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 flex items-center gap-1">
              <Stethoscope className="w-3 h-3" /> Recommendation
            </p>
            <p className="text-xs text-foreground leading-relaxed">{health.recommendation}</p>
          </div>
        </motion.div>

        {/* Comparison Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-5 lg:col-span-2"
        >
          <h4 className="font-display font-bold text-foreground mb-4 text-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            Sensitivity &amp; Disease Risk Comparison
          </h4>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={allHealthComparison} margin={{ left: -15, bottom: 5 }}>
              <XAxis dataKey="name" tick={{ fill: "hsl(220,15%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 10]} tick={{ fill: "hsl(220,15%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(250,90%,65%,0.05)" }} />
              <Legend wrapperStyle={{ fontSize: 10, color: "hsl(220,15%,55%)" }} iconType="circle" iconSize={6} />
              <Bar dataKey="lightSensitivity" name="Light Sensitivity Score" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={1200}>
                {allHealthComparison.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === eyeColor ? "hsl(200, 90%, 55%)" : "hsl(200, 90%, 55%, 0.25)"}
                  />
                ))}
              </Bar>
              <Bar dataKey="diseaseRisk" name="Health Risk Score" radius={[4, 4, 0, 0]} maxBarSize={28} animationDuration={1200}>
                {allHealthComparison.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.name === eyeColor ? "hsl(0, 84%, 60%)" : "hsl(0, 84%, 60%, 0.25)"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
