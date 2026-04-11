import { motion, AnimatePresence } from "framer-motion";
import { Info, ArrowUpRight, ArrowDownRight, Minus, X, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts";

const directionIcons = {
  increase: ArrowUpRight,
  decrease: ArrowDownRight,
  neutral: Minus,
};
const directionColors = {
  increase: "text-red-500",
  decrease: "text-emerald-500",
  neutral: "text-muted-foreground",
};
const trendData = {
  rising: { icon: TrendingUp, color: "text-red-500", bg: "bg-red-50", label: "Rising" },
  falling: { icon: TrendingDown, color: "text-emerald-600", bg: "bg-emerald-50", label: "Falling" },
  stable: { icon: Minus, color: "text-slate-500", bg: "bg-slate-50", label: "Stable" },
};

function formatCases(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

function getRiskColor(risk) {
  if (risk < 15) return "#4ade80";
  if (risk < 30) return "#fbbf24";
  if (risk < 50) return "#fb923c";
  if (risk < 65) return "#f87171";
  return "#ef4444";
}

export default function RiskExplanation({ country, onClose }) {
  if (!country) return null;

  const trend = trendData[country.trend] || trendData.stable;
  const TrendIcon = trend.icon;

  const chartData = (country.featureImportance || []).map(f => ({
    name: f.factor.split(" ").slice(0, 2).join(" "),
    fullName: f.factor,
    value: f.contribution,
    direction: f.direction,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.97 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{country.country}</h3>
            <p className="text-xs text-muted-foreground">{country.disease} · {country.year} projection</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 -mt-0.5" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-xl font-heading font-bold" style={{ color: getRiskColor(country.risk) }}>
            {country.risk}%
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Risk</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-xl font-heading font-bold text-foreground">{country.confidence}%</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Confidence</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-2.5 text-center">
          <p className="text-xl font-heading font-bold text-foreground">{formatCases(country.estimatedCases)}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">Est. Cases</p>
        </div>
      </div>

      {/* Trend Badge */}
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold mb-4 ${trend.bg} ${trend.color}`}>
        <TrendIcon className="w-3 h-3" />
        {trend.label} trend · {country.yoyGrowth > 0 ? "+" : ""}{country.yoyGrowth}% YoY
      </div>

      {/* Feature Importance Bar Chart */}
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        Contributing Factors
      </p>

      <div className="h-36 mb-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 'auto']} />
            <YAxis
              type="category"
              dataKey="name"
              width={72}
              tick={{ fontSize: 10, fill: "#64748b" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
              formatter={(v, _, props) => [`${v}`, props.payload.fullName]}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={10}>
              {chartData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.direction === "increase" ? "#f87171" :
                    entry.direction === "decrease" ? "#4ade80" :
                    "#94a3b8"
                  }
                  fillOpacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-400/80"/><span>Increases risk</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-emerald-400/80"/><span>Reduces risk</span></div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-slate-400/80"/><span>Neutral</span></div>
      </div>
    </motion.div>
  );
}