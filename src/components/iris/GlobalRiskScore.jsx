import { motion } from "framer-motion";
import { Activity, TrendingUp, TrendingDown } from "lucide-react";

function getRiskColor(score) {
  if (score < 20) return "text-risk-low";
  if (score < 40) return "text-risk-medium";
  if (score < 60) return "text-risk-high";
  return "text-risk-critical";
}

function getRiskBg(score) {
  if (score < 20) return "bg-emerald-500/10";
  if (score < 40) return "bg-amber-500/10";
  if (score < 60) return "bg-orange-500/10";
  return "bg-red-500/10";
}

function getRiskLabel(score) {
  if (score < 20) return "Low";
  if (score < 40) return "Moderate";
  if (score < 60) return "Elevated";
  return "Critical";
}

export default function GlobalRiskScore({ score, previousScore }) {
  const trend = score - (previousScore || score);
  const isUp = trend > 0;

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-1.5 rounded-lg ${getRiskBg(score)}`}>
          <Activity className={`w-4 h-4 ${getRiskColor(score)}`} />
        </div>
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Global Risk Index</span>
      </div>

      <div className="flex items-end gap-3">
        <motion.span
          key={score}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-4xl font-heading font-bold ${getRiskColor(score)}`}
        >
          {score}%
        </motion.span>
        <div className="flex items-center gap-1 mb-1.5">
          {isUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-risk-high" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-risk-low" />
          )}
          <span className={`text-xs font-medium ${isUp ? "text-risk-high" : "text-risk-low"}`}>
            {isUp ? "+" : ""}{trend.toFixed(1)}%
          </span>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${
              score < 20 ? "bg-emerald-500" :
              score < 40 ? "bg-amber-500" :
              score < 60 ? "bg-orange-500" :
              "bg-red-500"
            }`}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-muted-foreground">Low</span>
          <span className={`text-[10px] font-semibold ${getRiskColor(score)}`}>{getRiskLabel(score)}</span>
          <span className="text-[10px] text-muted-foreground">Critical</span>
        </div>
      </div>
    </div>
  );
}