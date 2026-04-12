import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Download, ArrowLeftRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import Sidebar from "@/components/iris/Sidebar";
import FilterBar from "@/components/iris/FilterBar";
import GlobalRiskScore from "@/components/iris/GlobalRiskScore";
import GlobalMap from "@/components/iris/GlobalMap";
import HighRiskCountries from "@/components/iris/HighRiskCountries";
import TrendingDiseases from "@/components/iris/TrendingDiseases";
import AIInsights from "@/components/iris/AIInsights";
import DiseaseTrends from "@/components/iris/DiseaseTrends";
import RiskExplanation from "@/components/iris/RiskExplanation";
import FastGrowingOutbreaks from "@/components/iris/FastGrowingOutbreaks";
import WhatIfSimulator from "@/components/iris/WhatIfSimulator";

import {
  getCountryMaxRisk,
  getTopRiskCountries,
  getFastestGrowingOutbreaks,
  getGlobalRiskScore,
  getDiseaseAggregates,
} from "@/lib/outbreakData";

export default function Dashboard() {
  const [year, setYear] = useState(2026);
  const [diseaseFilter, setDiseaseFilter] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);

  const countryRisks     = useMemo(() => getCountryMaxRisk(year, diseaseFilter), [year, diseaseFilter]);
  const topRiskCountries = useMemo(() => getTopRiskCountries(year, diseaseFilter, 10), [year, diseaseFilter]);
  const fastGrowing      = useMemo(() => getFastestGrowingOutbreaks(year, 8), [year]);
  const globalRisk       = useMemo(() => getGlobalRiskScore(year, diseaseFilter), [year, diseaseFilter]);
  const previousRisk     = useMemo(() => getGlobalRiskScore(year - 1, diseaseFilter), [year, diseaseFilter]);
  const diseaseAggregates= useMemo(() => getDiseaseAggregates(year), [year]);

  const handleExport = () => {
    const csv = [
      "Country,Code,Region,Disease,Risk(%),Confidence(%),Trend,YoY Growth(%),Est.Cases",
      ...countryRisks.map(c =>
        `${c.country},${c.countryCode},${c.region},${c.disease},${c.risk},${c.confidence},${c.trend},${c.yoyGrowth},${c.estimatedCases}`
      )
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `iris-predictions-${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="sticky top-0 z-30 bg-background/85 backdrop-blur-lg border-b border-border">
          <div className="px-4 md:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="lg:hidden w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-base font-heading font-bold text-foreground tracking-tight">IRIS</h1>
                <p className="text-[11px] text-muted-foreground -mt-0.5 hidden sm:block">
                  Intelligent Risk Identification System · v2.0
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FilterBar
                year={year}
                onYearChange={setYear}
                disease={diseaseFilter}
                onDiseaseChange={setDiseaseFilter}
              />
              <Link to="/compare">
                <Button variant="outline" size="sm" className="hidden md:flex items-center gap-1.5 text-xs">
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Compare Years
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="hidden md:flex items-center gap-1.5 text-xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV
              </Button>
            </div>
          </div>
        </header>

        <main className="px-4 md:px-6 lg:px-8 py-5 space-y-5">
          {/* Top Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <GlobalRiskScore score={globalRisk} previousScore={previousRisk} />

            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Countries Monitored
              </p>
              <motion.p
                key={countryRisks.length}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-heading font-bold text-foreground"
              >
                {countryRisks.length}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-1">
                <span className="text-red-500 font-medium">{countryRisks.filter(c => c.risk > 40).length} high-risk</span>
                {" · "}
                <span className="text-emerald-600 font-medium">{countryRisks.filter(c => c.risk <= 20).length} low-risk</span>
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
                Diseases Tracked
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-3xl font-heading font-bold text-foreground"
              >
                {diseaseFilter ? 1 : diseaseAggregates.length}
              </motion.p>
              <p className="text-xs text-muted-foreground mt-1">
                {diseaseFilter || "All pathogen categories"} · {year}
              </p>
            </div>
          </div>

          {/* Map */}
          <GlobalMap
            predictions={countryRisks}
            onCountrySelect={setSelectedCountry}
            selectedCountry={selectedCountry}
            year={year}
          />

          {/* Bottom Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column */}
            <div className="lg:col-span-4 space-y-5">
              <HighRiskCountries countries={topRiskCountries} onSelect={setSelectedCountry} />
              <FastGrowingOutbreaks outbreaks={fastGrowing} />
            </div>

            {/* Middle Column */}
            <div className="lg:col-span-4 space-y-5">
              <TrendingDiseases diseases={diseaseAggregates} />
              <DiseaseTrends diseaseFilter={diseaseFilter} />
            </div>

            {/* Right Column */}
            <div className="lg:col-span-4 space-y-5">
              <AnimatePresence mode="popLayout">
                {selectedCountry && (
                  <RiskExplanation
                    key={`${selectedCountry.countryCode}-${selectedCountry.disease}`}
                    country={selectedCountry}
                    onClose={() => setSelectedCountry(null)}
                  />
                )}
              </AnimatePresence>
              <AIInsights
                topCountries={topRiskCountries}
                diseaseAggregates={diseaseAggregates}
                year={year}
              />
            </div>
          </div>

          {/* What-If Simulator — Full Width */}
          <WhatIfSimulator year={year} />

          {/* Footer */}
          <div className="text-center py-6 border-t border-border">
            <p className="text-[11px] text-muted-foreground">
              IRIS v2.0 · Per-disease calibrated epidemiological model with lag-adjusted time-series features ·
              {" "}All projections are research-grade estimates for {year} · Data source: WHO/IHME/World Bank proxies
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}