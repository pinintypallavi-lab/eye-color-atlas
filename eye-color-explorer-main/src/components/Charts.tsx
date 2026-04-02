import { useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { type EyeColorEntry, eyeColorMap } from "@/data/eyeColorData";

interface ChartsProps {
  data: EyeColorEntry[];
  eyeColor: string;
}

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return percent > 0.05 ? (
    <text x={x} y={y} fill="hsl(220,20%,95%)" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
      {(percent * 100).toFixed(0)}%
    </text>
  ) : null;
};

const pieColors = ["#7c5cfc", "#38bdf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb923c", "#6ee7b7"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-2.5 text-xs border border-primary/20 shadow-xl">
      <p className="text-foreground font-semibold text-[11px]">{label || payload[0]?.name}</p>
      <p className="text-accent font-bold text-sm mt-0.5">
        {payload[0]?.value?.toLocaleString()}
        {typeof payload[0]?.value === "number" && payload[0]?.value <= 100 ? "%" : ""}
      </p>
    </div>
  );
};

export default function Charts({ data, eyeColor }: ChartsProps) {
  const barData = useMemo(() =>
    data.map((d) => ({
      name: d.country.length > 12 ? d.country.slice(0, 10) + "…" : d.country,
      percentage: d.percentage,
    })),
    [data]
  );

  const pieData = useMemo(() =>
    data.map((d) => ({ name: d.country, value: d.population_with_eye_color })),
    [data]
  );

  const color = eyeColorMap[eyeColor] || "hsl(250,90%,65%)";

  if (data.length === 0) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-10 text-center text-muted-foreground">
        No data available for the selected filters.
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-card p-5"
      >
        <h3 className="font-display font-bold text-foreground mb-5 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          Distribution by Country (%)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={barData} margin={{ left: -15, bottom: 5 }}>
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.4} />
              </linearGradient>
            </defs>
            <XAxis dataKey="name" tick={{ fill: "hsl(220,15%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "hsl(220,15%,50%)", fontSize: 10 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(250,90%,65%,0.05)" }} />
            <Bar dataKey="percentage" fill="url(#barGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} animationDuration={1200} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-card p-5"
      >
        <h3 className="font-display font-bold text-foreground mb-5 text-sm flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          Population Share
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <defs>
              {pieColors.map((c, i) => (
                <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={c} stopOpacity={1} />
                  <stop offset="100%" stopColor={c} stopOpacity={0.6} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={100}
              innerRadius={45}
              paddingAngle={3}
              dataKey="value"
              animationDuration={1200}
              stroke="hsl(230,25%,7%)"
              strokeWidth={2}
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={`url(#pieGrad${i % pieColors.length})`} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: 10, color: "hsl(220,15%,55%)" }}
              iconType="circle"
              iconSize={6}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
