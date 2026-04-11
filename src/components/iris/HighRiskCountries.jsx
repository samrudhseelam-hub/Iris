import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function getRiskBadge(risk) {
  if (risk >= 60) return { label: "Critical", className: "bg-red-100 text-red-700 border-red-200" };
  if (risk >= 40) return { label: "High", className: "bg-orange-100 text-orange-700 border-orange-200" };
  if (risk >= 25) return { label: "Moderate", className: "bg-amber-100 text-amber-700 border-amber-200" };
  return { label: "Low", className: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

export default function HighRiskCountries({ countries, onSelect }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-red-500/10">
          <AlertTriangle className="w-4 h-4 text-red-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Highest Risk Regions</h3>
      </div>

      <div className="space-y-1">
        {countries.map((c, i) => {
          const badge = getRiskBadge(c.risk);
          return (
            <motion.div
              key={c.countryCode}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => onSelect?.(c)}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors group"
            >
              <span className="text-xs font-mono text-muted-foreground w-5">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{c.country}</p>
                <p className="text-xs text-muted-foreground">{c.disease}</p>
              </div>
              <Badge variant="outline" className={`text-[10px] px-2 py-0.5 border ${badge.className}`}>
                {badge.label}
              </Badge>
              <span className="text-sm font-semibold tabular-nums w-12 text-right">{c.risk}%</span>
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}