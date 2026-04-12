import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowLeftRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
  ReferenceLine,
} from "recharts";

import GlobalMap from "@/components/iris/GlobalMap";
import FilterBar from "@/components/iris/FilterBar";
import {
  getCountryMaxRisk,
  getGlobalRiskScore,
  DISEASE_LIST,
} from "@/lib/outbreakData";

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

function deltaColor(d) {
  if (d > 10) return "#ef4444";
  if (d > 4) return "#f97316";
  if (d > 1) return "#fbbf24";
  if (d > -1) return "#94a3b8";
  if (d > -4) return "#86efac";
  return "#22c55e";
}

function deltaIcon(d) {
  if (d > 1) return <TrendingUp className="w-3.5 h-3.5 text-red-500 inline-block ml-1" />;
  if (d < -1) return <TrendingDown className="w-3.5 h-3.5 text-emerald-500 inline-block ml-1" />;
  return <Minus className="w-3.5 h-3.5 text-slate-400 inline-block ml-1" />;
}

export default function ComparisonView() {
  const [yearA, setYearA] = useState(2024);
  const [yearB, setYearB] = useState(2028);
  const [diseaseFilter, setDiseaseFilter] = useState(null);
  const [mode, setMode] = useState("year"); // "year" | "scenario" (future)

  const risksA = useMemo(() => getCountryMaxRisk(yearA, diseaseFilter), [yearA, diseaseFilter]);
  const risksB = useMemo(() => getCountryMaxRisk(yearB, diseaseFilter), [yearB, diseaseFilter]);

  const globalA = useMemo(() => getGlobalRiskScore(yearA, diseaseFilter), [yearA, diseaseFilter]);
  const globalB = useMemo(() => getGlobalRiskScore(yearB, diseaseFilter), [yearB, diseaseFilter]);
  const globalDelta = Math.round((globalB - globalA) * 10) / 10;

  // Build delta predictions for the map
  const deltaPredictions = useMemo(() => {
    const mapB = {};
    for (const p of risksB) mapB[p.countryCode] = p;

    return risksA.map(pA => {
      const pB = mapB[pA.countryCode];
      const delta = pB ? Math.round((pB.risk - pA.risk) * 10) / 10 : 0;
      return {
        ...pA,
        riskA: pA.risk,
        riskB: pB?.risk ?? null,
        delta,
      };
    });
  }, [risksA, risksB]);

  // Top movers bar chart data
  const topMovers = useMemo(() => {
    return [...deltaPredictions]
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 15)
      .map(p => ({
        country: p.country.length > 12 ? p.country.slice(0, 11) + "…" : p.country,
        fullName: p.country,
        yearA: parseFloat((p.riskA ?? 0).toFixed(1)),
        yearB: parseFloat((p.riskB ?? 0).toFixed(1)),
        delta: parseFloat((p.delta ?? 0).toFixed(1)),
      }));
  }, [deltaPredictions]);

  // Biggest risers and fallers
  const risers = useMemo(() =>
    [...deltaPredictions].sort((a, b) => b.delta - a.delta).slice(0, 6), [deltaPredictions]);
  const fallers = useMemo(() =>
    [...deltaPredictions].sort((a, b) => a.delta - b.delta).slice(0, 6), [deltaPredictions]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/90 backdrop-blur-lg border-b border-border">
        <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-1.5">
                <ArrowLeft className="w-4 h-4" /> Dashboard
              </Button>
            </Link>
            <div className="h-5 w-px bg-border" />
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-primary" />
              <h1 className="text-sm font-heading font-bold text-foreground">Comparison View</h1>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Year A */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Scenario A</span>
              <Select value={String(yearA)} onValueChange={v => setYearA(Number(v))}>
                <SelectTrigger className="border-0 bg-transparent shadow-none h-8 w-20 p-0 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <span className="text-muted-foreground text-sm font-bold">vs</span>

            {/* Year B */}
            <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Scenario B</span>
              <Select value={String(yearB)} onValueChange={v => setYearB(Number(v))}>
                <SelectTrigger className="border-0 bg-transparent shadow-none h-8 w-20 p-0 text-sm font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {YEARS.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <FilterBar
              year={yearA}
              onYearChange={() => {}}
              disease={diseaseFilter}
              onDiseaseChange={setDiseaseFilter}
              hideYear
            />
          </div>
        </div>
      </header>

      <main className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
        {/* Global Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: `${yearA} Global Risk`, value: `${globalA}%`, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
            {
              label: "Delta",
              value: `${globalDelta > 0 ? "+" : ""}${globalDelta}%`,
              color: globalDelta > 0 ? "text-red-600" : globalDelta < 0 ? "text-emerald-600" : "text-slate-500",
              bg: globalDelta > 0 ? "bg-red-50 border-red-200" : globalDelta < 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200",
              sub: globalDelta > 0 ? "Risk increasing" : globalDelta < 0 ? "Risk decreasing" : "Stable",
            },
            { label: `${yearB} Global Risk`, value: `${globalB}%`, color: "text-rose-600", bg: "bg-rose-50 border-rose-200" },
          ].map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`border rounded-xl p-5 ${card.bg}`}
            >
              <p className="text-xs font-medium text-muted-foreground mb-1">{card.label}</p>
              <p className={`text-4xl font-heading font-bold ${card.color}`}>{card.value}</p>
              {card.sub && <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* Delta Map */}
        <div>
          <h2 className="text-sm font-semibold text-foreground mb-2">
            Risk Delta Map &mdash; {yearA} → {yearB} {diseaseFilter ? `(${diseaseFilter})` : "(All Diseases)"}
          </h2>
          <GlobalMap
            predictions={deltaPredictions}
            isDelta
          />
        </div>

        {/* Side-by-side maps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <h3 className="text-sm font-semibold text-foreground">Scenario A — {yearA}</h3>
              <span className="text-xs text-muted-foreground">Global Risk: {globalA}%</span>
            </div>
            <GlobalMap predictions={risksA} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 rounded-full bg-rose-500" />
              <h3 className="text-sm font-semibold text-foreground">Scenario B — {yearB}</h3>
              <span className="text-xs text-muted-foreground">Global Risk: {globalB}%</span>
            </div>
            <GlobalMap predictions={risksB} />
          </div>
        </div>

        {/* Top Movers Chart */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Top Risk Movers — {yearA} vs {yearB}
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topMovers} margin={{ top: 4, right: 16, bottom: 0, left: -12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="country" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v, name) => [`${v}%`, name === "yearA" ? `${yearA} Risk` : `${yearB} Risk`]}
                  labelFormatter={(l, payload) => payload?.[0]?.payload?.fullName || l}
                />
                <Legend
                  formatter={v => v === "yearA" ? `${yearA}` : `${yearB}`}
                  wrapperStyle={{ fontSize: 11 }}
                />
                <Bar dataKey="yearA" fill="#93c5fd" radius={[3, 3, 0, 0]} barSize={10} />
                <Bar dataKey="yearB" fill="#fca5a5" radius={[3, 3, 0, 0]} barSize={10} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biggest Risers / Fallers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-red-600 mb-3">📈 Biggest Risers</h3>
            <div className="space-y-2">
              {risers.map((p, i) => (
                <div key={p.countryCode} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.country}</p>
                    <p className="text-xs text-muted-foreground">{p.disease}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-500">+{p.delta}%</p>
                    <p className="text-[10px] text-muted-foreground">{(p.riskA ?? 0).toFixed(1)} → {(p.riskB ?? 0).toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-emerald-600 mb-3">📉 Biggest Fallers</h3>
            <div className="space-y-2">
              {fallers.map((p, i) => (
                <div key={p.countryCode} className="flex items-center gap-3">
                  <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.country}</p>
                    <p className="text-xs text-muted-foreground">{p.disease}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-500">{p.delta}%</p>
                    <p className="text-[10px] text-muted-foreground">{(p.riskA ?? 0).toFixed(1)} → {(p.riskB ?? 0).toFixed(1)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}