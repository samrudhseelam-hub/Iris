import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

function generateInsights(topCountries, diseaseAggregates, year) {
  const insights = [];

  if (topCountries.length > 0) {
    const top = topCountries[0];
    insights.push({
      text: `${top.disease} risk is critically elevated in ${top.country} at ${top.risk}% probability for ${year}, driven primarily by ${top.featureImportance?.[0]?.factor?.toLowerCase() || "epidemiological factors"}.`,
      severity: "critical",
    });
  }

  const tropicalCountries = topCountries.filter(c => c.risk > 40);
  if (tropicalCountries.length > 3) {
    const regions = [...new Set(tropicalCountries.slice(0, 5).map(c => c.region))];
    insights.push({
      text: `${tropicalCountries.length} countries exceed the 40% risk threshold, concentrated in ${regions.slice(0, 2).join(" and ")}. Climate patterns and population density are key drivers.`,
      severity: "high",
    });
  }

  if (diseaseAggregates.length > 0) {
    const topDisease = diseaseAggregates[0];
    insights.push({
      text: `${topDisease.disease} leads the global risk index with an average outbreak probability of ${topDisease.avgRisk}%, affecting an estimated ${(topDisease.totalCases / 1000000).toFixed(1)}M people worldwide.`,
      severity: "high",
    });
  }

  if (diseaseAggregates.length > 2) {
    const vectorBorne = diseaseAggregates.filter(d => d.type === "vector-borne");
    if (vectorBorne.length > 0) {
      insights.push({
        text: `Vector-borne diseases (${vectorBorne.map(d => d.disease).slice(0, 3).join(", ")}) continue to show elevated risk in tropical regions. Rising temperatures are expanding mosquito habitats northward.`,
        severity: "medium",
      });
    }
  }

  const lowRiskCount = topCountries.filter(c => c.risk < 15).length;
  if (lowRiskCount > 0) {
    insights.push({
      text: `${lowRiskCount} monitored regions maintain low-risk status due to robust healthcare infrastructure and high vaccination coverage rates.`,
      severity: "low",
    });
  }

  insights.push({
    text: `Model confidence averages ${Math.round(topCountries.reduce((s, c) => s + c.confidence, 0) / topCountries.length)}% across all predictions. Higher-income nations show stronger data availability and prediction accuracy.`,
    severity: "info",
  });

  return insights;
}

const severityColors = {
  critical: "border-l-red-500 bg-red-500/5",
  high: "border-l-orange-500 bg-orange-500/5",
  medium: "border-l-amber-500 bg-amber-500/5",
  low: "border-l-emerald-500 bg-emerald-500/5",
  info: "border-l-primary bg-primary/5",
};

const severityDots = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-amber-500",
  low: "bg-emerald-500",
  info: "bg-primary",
};

export default function AIInsights({ topCountries, diseaseAggregates, year }) {
  const [insights, setInsights] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setInsights(generateInsights(topCountries, diseaseAggregates, year));
  }, [topCountries, diseaseAggregates, year, refreshKey]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-violet-500/10">
            <Sparkles className="w-4 h-4 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">AI Insights</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setRefreshKey(k => k + 1)}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence mode="popLayout">
          {insights.map((insight, i) => (
            <motion.div
              key={`${refreshKey}-${i}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ delay: i * 0.08 }}
              className={`border-l-2 rounded-r-lg p-3 ${severityColors[insight.severity]}`}
            >
              <div className="flex items-start gap-2">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${severityDots[insight.severity]}`} />
                <p className="text-xs leading-relaxed text-foreground/80">{insight.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}