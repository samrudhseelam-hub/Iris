import { motion } from "framer-motion";
import { Info, ArrowUpRight, ArrowDownRight, Minus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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

const impactBars = {
  high: "w-full",
  medium: "w-2/3",
  low: "w-1/3",
};

const impactColors = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-emerald-400",
};

export default function RiskExplanation({ country, onClose }) {
  if (!country) return null;

  const DirIcon = directionIcons[country.featureImportance?.[0]?.direction] || Minus;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="bg-card border border-border rounded-xl p-5"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Info className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Risk Explanation</h3>
            <p className="text-xs text-muted-foreground">{country.country} · {country.disease}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4 p-3 bg-muted/50 rounded-lg">
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-foreground">{country.risk}%</p>
          <p className="text-[10px] text-muted-foreground uppercase">Probability</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-foreground">{country.confidence}%</p>
          <p className="text-[10px] text-muted-foreground uppercase">Confidence</p>
        </div>
        <div className="w-px h-10 bg-border" />
        <div className="text-center">
          <p className="text-2xl font-heading font-bold text-foreground">
            {country.estimatedCases >= 1000000 
              ? (country.estimatedCases / 1000000).toFixed(1) + "M"
              : (country.estimatedCases / 1000).toFixed(0) + "K"
            }
          </p>
          <p className="text-[10px] text-muted-foreground uppercase">Est. Cases</p>
        </div>
      </div>

      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
        Contributing Factors
      </p>
      <div className="space-y-2">
        {(country.featureImportance || []).map((f, i) => {
          const DIcon = directionIcons[f.direction] || Minus;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-2"
            >
              <DIcon className={`w-3.5 h-3.5 flex-shrink-0 ${directionColors[f.direction]}`} />
              <span className="text-xs text-foreground flex-1">{f.factor}</span>
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${impactColors[f.impact]} ${impactBars[f.impact]}`} />
              </div>
              <span className="text-[10px] text-muted-foreground w-12 text-right capitalize">{f.impact}</span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}