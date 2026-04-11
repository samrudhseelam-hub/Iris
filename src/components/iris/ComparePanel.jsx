import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitCompare, ChevronDown, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import {
  COUNTRIES, DISEASE_LIST,
  getCountryTimeSeries, getDiseaseAggregates, getTopRiskCountries,
  applyInterventions, getAllPredictions,
} from "@/lib/outbreakData";

// ── Helpers ──────────────────────────────────────────────────────────────────
function riskColor(r) {
  if (r < 15) return "#4ade80";
  if (r < 30) return "#fbbf24";
  if (r < 50) return "#fb923c";
  if (r < 65) return "#f87171";
  return "#ef4444";
}

function riskLabel(r) {
  if (r < 15) return "Low";
  if (r < 30) return "Moderate";
  if (r < 50) return "Elevated";
  if (r < 65) return "High";
  return "Critical";
}

function formatCases(n) {
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

const A_COLOR = "#3b82f6";  // blue
const B_COLOR = "#f43f5e";  // rose

// ── Mini Stat Card ───────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3 text-center">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{label}</p>
      <p className="text-xl font-heading font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ── Trend Chart (two series) ─────────────────────────────────────────────────
function TrendChart({ dataA, dataB, labelA, labelB }) {
  // Merge by year
  const merged = useMemo(() => {
    const map = {};
    for (const d of dataA) map[d.year] = { year: d.year, A: d.risk };
    for (const d of dataB) map[d.year] = { ...map[d.year], year: d.year, B: d.risk };
    return Object.values(map).sort((a, b) => a.year - b.year);
  }, [dataA, dataB]);

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id="gradA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={A_COLOR} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={A_COLOR} stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={B_COLOR} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={B_COLOR} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
          <XAxis dataKey="year" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0,"auto"]}/>
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v, name) => [`${v}%`, name === "A" ? labelA : labelB]}
          />
          <Legend formatter={name => name === "A" ? labelA : labelB} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}/>
          <Area type="monotone" dataKey="A" stroke={A_COLOR} strokeWidth={2} fill="url(#gradA)" dot={false}/>
          <Area type="monotone" dataKey="B" stroke={B_COLOR} strokeWidth={2} fill="url(#gradB)" dot={false}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Feature Importance Side-by-Side ─────────────────────────────────────────
function FeatureCompare({ featuresA, featuresB, labelA, labelB }) {
  const factors = featuresA.map(f => f.factor.split(" ").slice(0, 3).join(" "));
  const data = factors.map((name, i) => ({
    name,
    A: featuresA[i]?.contribution ?? 0,
    B: featuresB[i]?.contribution ?? 0,
  }));

  return (
    <div className="h-44">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 4, right: 8, top: 0, bottom: 0 }}>
          <XAxis type="number" hide domain={[0,"auto"]}/>
          <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: "#64748b" }} axisLine={false} tickLine={false}/>
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
            formatter={(v, name) => [`${v}`, name === "A" ? labelA : labelB]}
          />
          <Legend formatter={name => name === "A" ? labelA : labelB} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}/>
          <Bar dataKey="A" fill={A_COLOR} fillOpacity={0.75} radius={[0,3,3,0]} barSize={7}/>
          <Bar dataKey="B" fill={B_COLOR} fillOpacity={0.75} radius={[0,3,3,0]} barSize={7}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Intervention Projection ──────────────────────────────────────────────────
function InterventionDelta({ predA, predB, labelA, labelB }) {
  if (!predA || !predB) return null;
  const sampleInterventions = { vaccinationRollout: 60, waterSanitation: 50, vectorControl: 40, healthcareAccess: 50, surveillanceStrength: 30, travelRestrictions: 20 };
  const diseaseA = DISEASE_LIST.find(d => d.name === predA.disease);
  const countryA = COUNTRIES.find(c => c.code === predA.countryCode);
  const diseaseB = DISEASE_LIST.find(d => d.name === predB.disease);
  const countryB = COUNTRIES.find(c => c.code === predB.countryCode);

  const adjA = diseaseA && countryA ? applyInterventions(predA.risk, sampleInterventions, diseaseA, countryA) : predA.risk;
  const adjB = diseaseB && countryB ? applyInterventions(predB.risk, sampleInterventions, diseaseB, countryB) : predB.risk;

  const data = [
    { name: "Baseline", A: predA.risk, B: predB.risk },
    { name: "With Interventions", A: parseFloat(adjA.toFixed(1)), B: parseFloat(adjB.toFixed(1)) },
  ];

  return (
    <div>
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
        Intervention Impact (Full-Effort Scenario)
      </p>
      <div className="h-32">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false}/>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false}/>
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`}/>
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v,n) => [`${v}%`, n === "A" ? labelA : labelB]}/>
            <Legend formatter={n => n === "A" ? labelA : labelB} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }}/>
            <Bar dataKey="A" fill={A_COLOR} fillOpacity={0.8} radius={[4,4,0,0]} barSize={28}/>
            <Bar dataKey="B" fill={B_COLOR} fillOpacity={0.8} radius={[4,4,0,0]} barSize={28}/>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ComparePanel({ year }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState("countries"); // "countries" | "diseases"

  // Country compare
  const [countryA, setCountryA] = useState("NG");
  const [countryB, setCountryB] = useState("IN");
  const [sharedDisease, setSharedDisease] = useState("Malaria");

  // Disease compare
  const [diseaseA, setDiseaseA] = useState("Malaria");
  const [diseaseB, setDiseaseB] = useState("Tuberculosis");
  const [sharedCountry, setSharedCountry] = useState("NG");

  const labelA = mode === "countries"
    ? COUNTRIES.find(c => c.code === countryA)?.name || countryA
    : diseaseA;
  const labelB = mode === "countries"
    ? COUNTRIES.find(c => c.code === countryB)?.name || countryB
    : diseaseB;

  // Trend series
  const trendA = useMemo(() => {
    if (mode === "countries") return getCountryTimeSeries(countryA, sharedDisease);
    return getCountryTimeSeries(sharedCountry, diseaseA);
  }, [mode, countryA, countryB, sharedDisease, sharedCountry, diseaseA]);

  const trendB = useMemo(() => {
    if (mode === "countries") return getCountryTimeSeries(countryB, sharedDisease);
    return getCountryTimeSeries(sharedCountry, diseaseB);
  }, [mode, countryA, countryB, sharedDisease, sharedCountry, diseaseB]);

  // Current year predictions
  const predA = useMemo(() => {
    const disease = mode === "countries" ? sharedDisease : diseaseA;
    const code    = mode === "countries" ? countryA      : sharedCountry;
    return getAllPredictions(year, disease).find(p => p.countryCode === code) || null;
  }, [mode, year, countryA, sharedDisease, diseaseA, sharedCountry]);

  const predB = useMemo(() => {
    const disease = mode === "countries" ? sharedDisease : diseaseB;
    const code    = mode === "countries" ? countryB      : sharedCountry;
    return getAllPredictions(year, disease).find(p => p.countryCode === code) || null;
  }, [mode, year, countryB, sharedDisease, diseaseB, sharedCountry]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10">
            <GitCompare className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-foreground">Compare Mode</h3>
            <p className="text-xs text-muted-foreground">Side-by-side country or disease analysis</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
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
            <div className="border-t border-border px-5 pb-6">
              {/* Mode tabs */}
              <div className="mt-4 mb-5">
                <Tabs value={mode} onValueChange={setMode}>
                  <TabsList className="w-full">
                    <TabsTrigger value="countries" className="flex-1 text-xs">Compare Countries</TabsTrigger>
                    <TabsTrigger value="diseases"  className="flex-1 text-xs">Compare Diseases</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Selectors */}
              {mode === "countries" ? (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      <span style={{ color: A_COLOR }}>●</span> Country A
                    </label>
                    <Select value={countryA} onValueChange={setCountryA}>
                      <SelectTrigger className="text-sm h-9"><SelectValue/></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Disease
                    </label>
                    <Select value={sharedDisease} onValueChange={setSharedDisease}>
                      <SelectTrigger className="text-sm h-9"><SelectValue/></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {DISEASE_LIST.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      <span style={{ color: B_COLOR }}>●</span> Country B
                    </label>
                    <Select value={countryB} onValueChange={setCountryB}>
                      <SelectTrigger className="text-sm h-9"><SelectValue/></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      <span style={{ color: A_COLOR }}>●</span> Disease A
                    </label>
                    <Select value={diseaseA} onValueChange={setDiseaseA}>
                      <SelectTrigger className="text-sm h-9"><SelectValue/></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {DISEASE_LIST.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Country
                    </label>
                    <Select value={sharedCountry} onValueChange={setSharedCountry}>
                      <SelectTrigger className="text-sm h-9"><SelectValue/></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {COUNTRIES.map(c => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      <span style={{ color: B_COLOR }}>●</span> Disease B
                    </label>
                    <Select value={diseaseB} onValueChange={setDiseaseB}>
                      <SelectTrigger className="text-sm h-9"><SelectValue/></SelectTrigger>
                      <SelectContent className="max-h-52">
                        {DISEASE_LIST.map(d => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Side-by-side stat cards */}
              {predA && predB && (
                <div className="grid grid-cols-2 gap-4 mb-5">
                  {/* A */}
                  <div className="rounded-xl border-2 p-4 space-y-2" style={{ borderColor: A_COLOR + "40" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: A_COLOR }}/>
                      <p className="text-sm font-semibold truncate">{labelA}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="Risk" value={`${predA.risk}%`} sub={riskLabel(predA.risk)} color={riskColor(predA.risk)}/>
                      <StatCard label="Confidence" value={`${predA.confidence}%`} color="#64748b"/>
                      <StatCard label="Cases" value={formatCases(predA.estimatedCases)} color="#64748b"/>
                      <StatCard label="Trend" value={predA.trend} sub={`${predA.yoyGrowth > 0 ? "+" : ""}${predA.yoyGrowth}% YoY`}
                        color={predA.trend === "rising" ? "#ef4444" : predA.trend === "falling" ? "#22c55e" : "#94a3b8"}/>
                    </div>
                  </div>

                  {/* B */}
                  <div className="rounded-xl border-2 p-4 space-y-2" style={{ borderColor: B_COLOR + "40" }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: B_COLOR }}/>
                      <p className="text-sm font-semibold truncate">{labelB}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <StatCard label="Risk" value={`${predB.risk}%`} sub={riskLabel(predB.risk)} color={riskColor(predB.risk)}/>
                      <StatCard label="Confidence" value={`${predB.confidence}%`} color="#64748b"/>
                      <StatCard label="Cases" value={formatCases(predB.estimatedCases)} color="#64748b"/>
                      <StatCard label="Trend" value={predB.trend} sub={`${predB.yoyGrowth > 0 ? "+" : ""}${predB.yoyGrowth}% YoY`}
                        color={predB.trend === "rising" ? "#ef4444" : predB.trend === "falling" ? "#22c55e" : "#94a3b8"}/>
                    </div>
                  </div>
                </div>
              )}

              {/* Trend Chart */}
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Risk Trend (2018–2030)
              </p>
              <TrendChart dataA={trendA} dataB={trendB} labelA={labelA} labelB={labelB} />

              {/* Feature Importance */}
              {predA?.featureImportance && predB?.featureImportance && (
                <div className="mt-5">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    Contributing Factors Comparison
                  </p>
                  <FeatureCompare
                    featuresA={predA.featureImportance}
                    featuresB={predB.featureImportance}
                    labelA={labelA}
                    labelB={labelB}
                  />
                </div>
              )}

              {/* Intervention impact */}
              <div className="mt-5">
                <InterventionDelta predA={predA} predB={predB} labelA={labelA} labelB={labelB} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}