import { motion } from "framer-motion";
import { Bug, Droplets, Wind, Heart, Rat } from "lucide-react";

const typeIcons = {
  "vector-borne": Bug,
  "waterborne": Droplets,
  "respiratory": Wind,
  "bloodborne": Heart,
  "zoonotic": Rat,
};

const typeColors = {
  "vector-borne": "bg-purple-500/10 text-purple-600",
  "waterborne": "bg-blue-500/10 text-blue-600",
  "respiratory": "bg-sky-500/10 text-sky-600",
  "bloodborne": "bg-rose-500/10 text-rose-600",
  "zoonotic": "bg-amber-500/10 text-amber-600",
};

function formatCases(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

export default function TrendingDiseases({ diseases }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-primary/10">
          <Bug className="w-4 h-4 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Disease Overview</h3>
      </div>

      <div className="space-y-2">
        {diseases.slice(0, 8).map((d, i) => {
          const Icon = typeIcons[d.type] || Bug;
          const colorClass = typeColors[d.type] || "bg-gray-500/10 text-gray-600";

          return (
            <motion.div
              key={d.disease}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-2 rounded-lg"
            >
              <div className={`p-1.5 rounded-md ${colorClass}`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{d.disease}</p>
                <p className="text-xs text-muted-foreground">
                  ~{formatCases(d.totalCases)} est. cases · Peak: {d.maxCountry}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold tabular-nums">{d.avgRisk}%</p>
                <p className="text-[10px] text-muted-foreground">avg risk</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}