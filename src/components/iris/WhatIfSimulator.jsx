import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FlaskConical, ChevronDown, X, RotateCcw } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COUNTRIES, DISEASE_LIST, applyInterventions, getAllPredictions } from "@/lib/outbreakData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const INTERVENTIONS = [
  {
    key: "vaccinationRollout",
    label: "Vaccination Rollout Speed",
    icon: "💉",
    description: "Accelerates immunization campaign across population",
    color: "from-blue-400 to-blue-500",
    bg: "bg-blue-50",
    textColor: "text-blue-700",
  },
  {
    key: "waterSanitation",
    label: "Water Sanitation Funding",
    icon: "🚰",
    description: "Improves access to clean water & sanitation",
    color: "from-cyan-400 to-cyan-500",
    bg: "bg-cyan-50",
    textColor: "text-cyan-700",
  },
  {
    key: "vectorControl",
    label: "Vector Control Programs",
    icon: "🦟",
    description: "Mosquito & pest control (spraying, bed nets)",
    color: "from-green-400 to-green-500",
    bg: "bg-green-50",
    textColor: "text-green-700",
  },
  {
    key: "healthcareAccess",
    label: "Healthcare Access Expansion",
    icon: "🏥",
    description: "Clinic deployment, medical personnel, diagnostics",
    color: "from-purple-400 to-purple-500",
    bg: "bg-purple-50",
    textColor: "text-purple-700",
  },
  {
    key: "surveillanceStrength",
    label: "Surveillance & Early Warning",
    icon: "📡",
    description: "Disease monitoring, rapid response systems",
    color: "from-amber-400 to-amber-500",
    bg: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    key: "travelRestrictions",
    label: "Travel & Border Controls",
    icon: "✈️",
    description: "Screening, isolation, mobility restrictions",
    color: "from-rose-400 to-rose-500",
    bg: "bg-rose-50",
    textColor: "text-rose-700",
  },
];

const DEFAULT_INTERVENTIONS = Object.fromEntries(INTERVENTIONS.map(i => [i.key, 0]));

function riskColor(risk) {
  if (risk < 15) return "#4ade80";
  if (risk < 30) return "#fbbf24";
  if (risk < 50) return "#fb923c";
  if (risk < 65) return "#f87171";
  return "#ef4444";
}

function riskLabel(risk) {
  if (risk < 15) return "Low";
  if (risk < 30) return "Moderate";
  if (risk < 50) return "Elevated";
  if (risk < 65) return "High";
  return "Critical";
}

function RiskGauge({ value, label }) {
  const pct = Math.min(100, value);
  return (
    <div className="text-center">
      <div
        className="relative w-24 h-24 mx-auto"
        style={{
          background: `conic-gradient(${riskColor(pct)} ${pct * 3.6}deg, #e2e8f0 0deg)`,
          borderRadius: "50%",
        }}
      >
        <div className="absolute inset-2 bg-card rounded-full flex flex-col items-center justify-center">
          <span className="text-lg font-heading font-bold" style={{ color: riskColor(pct) }}>
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>
      <p className="text-xs font-medium text-muted-foreground mt-2">{label}</p>
      <p className="text-[11px] font-semibold" style={{ color: riskColor(pct) }}>
        {riskLabel(pct)}
      </p>
    </div>
  );
}

export default function WhatIfSimulator({ year }) {
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("NG");
  const [selectedDisease, setSelectedDisease] = useState("Malaria");
  const [interventions, setInterventions] = useState(DEFAULT_INTERVENTIONS);

  // Base prediction for chosen country+disease
  const basePrediction = useMemo(() => {
    const all = getAllPredictions(year, selectedDisease);
    return all.find(p => p.countryCode === selectedCountry) || null;
  }, [year, selectedCountry, selectedDisease]);

  const disease = useMemo(() =>
    DISEASE_LIST.find(d => d.name === selectedDisease),
    [selectedDisease]
  );

  const country = useMemo(() =>
    COUNTRIES.find(c => c.code === selectedCountry),
    [selectedCountry]
  );

  // Adjusted risk after interventions
  const adjustedRisk = useMemo(() => {
    if (!basePrediction || !disease || !country) return 0;
    return applyInterventions(basePrediction.risk, interventions, disease, country);
  }, [basePrediction, interventions, disease, country]);

  const reduction = basePrediction ? basePrediction.risk - adjustedRisk : 0;

  // Chart data: baseline vs. adjusted per year (2025–2030)
  const chartData = useMemo(() => {
    if (!basePrediction) return [];
    return [2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => {
      const all = getAllPredictions(y, selectedDisease);
      const base = all.find(p => p.countryCode === selectedCountry)?.risk ?? 0;
      const adjusted = y >= year
        ? applyInterventions(base, interventions, disease, country)
        : base;
      return { year: y, baseline: parseFloat(base.toFixed(1)), adjusted: parseFloat(adjusted.toFixed(1)) };
    });
  }, [selectedCountry, selectedDisease, interventions, year, disease, country, basePrediction]);

  const totalEffort = Object.values(interventions).reduce((a, b) => a + b, 0);

  const updateIntervention = (key, val) => setInterventions(prev => ({ ...prev, [key]: val }));
  const reset = () => setInterventions(DEFAULT_INTERVENTIONS);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header / Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <FlaskConical className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">What-If Simulator</h3>
            <p className="text-xs text-muted-foreground">Model intervention impact on outbreak risk</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {totalEffort > 0 && (
            <span className="text-[10px] font-semibold bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
              {Math.round(totalEffort / 6)}% avg effort
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-border">
              {/* Country + Disease Selectors */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Country
                  </label>
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                    Disease
                  </label>
                  <Select value={selectedDisease} onValueChange={setSelectedDisease}>
                    <SelectTrigger className="text-sm h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-56">
                      {DISEASE_LIST.map(d => (
                        <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Risk Gauges */}
              {basePrediction && (
                <div className="flex items-center justify-around mt-5 mb-4 p-4 bg-muted/30 rounded-xl">
                  <RiskGauge value={basePrediction.risk} label="Baseline Risk" />
                  <div className="text-center">
                    <div className={`text-2xl font-heading font-bold ${reduction > 0 ? "text-emerald-600" : "text-muted-foreground"}`}>
                      {reduction > 0 ? "−" : ""}{Math.abs(reduction).toFixed(1)}%
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">Reduction</p>
                    <div className="mt-1.5 text-[10px] text-muted-foreground">
                      {reduction > 15 ? "🟢 Significant" : reduction > 5 ? "🟡 Moderate" : "⚪ Minimal"}
                    </div>
                  </div>
                  <RiskGauge value={adjustedRisk} label="Projected Risk" />
                </div>
              )}

              {/* Intervention Sliders */}
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Intervention Parameters
                </p>
                <Button variant="ghost" size="sm" className="h-6 text-xs gap-1" onClick={reset}>
                  <RotateCcw className="w-3 h-3" /> Reset
                </Button>
              </div>

              <div className="space-y-3.5">
                {INTERVENTIONS.map(iv => (
                  <div key={iv.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{iv.icon}</span>
                        <span className="text-xs font-medium text-foreground">{iv.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${interventions[iv.key] > 0 ? `${iv.bg} ${iv.textColor}` : "text-muted-foreground"}`}>
                        {interventions[iv.key]}%
                      </span>
                    </div>
                    <Slider
                      value={[interventions[iv.key]]}
                      onValueChange={([v]) => updateIntervention(iv.key, v)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    {interventions[iv.key] > 0 && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">{iv.description}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Impact Chart */}
              {basePrediction && (
                <div className="mt-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Projected Impact Timeline
                  </p>
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                        <defs>
                          <linearGradient id="baseGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f87171" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="adjGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25}/>
                            <stop offset="95%" stopColor="#4ade80" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
                        <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`}/>
                        <Tooltip
                          contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                          formatter={(v, name) => [`${v}%`, name === "baseline" ? "Baseline" : "With Interventions"]}
                        />
                        <ReferenceLine x={year} stroke="#94a3b8" strokeDasharray="4 4" label={{ value: "Now", fontSize: 9, fill: "#94a3b8" }}/>
                        <Area type="monotone" dataKey="baseline" stroke="#f87171" strokeWidth={1.5} fill="url(#baseGrad)" strokeDasharray="4 2" dot={false}/>
                        <Area type="monotone" dataKey="adjusted" stroke="#4ade80" strokeWidth={2} fill="url(#adjGrad)" dot={false}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 justify-center text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-red-400" style={{ borderTop: "2px dashed #f87171" }} />
                      <span>Baseline trajectory</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-0.5 bg-emerald-400" />
                      <span>With interventions</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}