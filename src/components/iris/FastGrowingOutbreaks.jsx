import { motion } from "framer-motion";
import { Flame, TrendingUp } from "lucide-react";

function formatGrowth(g) {
  return g > 0 ? `+${g}%` : `${g}%`;
}

export default function FastGrowingOutbreaks({ outbreaks }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-orange-500/10">
          <Flame className="w-4 h-4 text-orange-500" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">Fastest Growing Outbreaks</h3>
      </div>

      <div className="space-y-1">
        {outbreaks.map((o, i) => (
          <motion.div
            key={`${o.countryCode}-${o.disease}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-xs font-mono text-muted-foreground w-4">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{o.country}</p>
              <p className="text-xs text-muted-foreground">{o.disease}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold tabular-nums">{o.risk}%</p>
              <div className="flex items-center justify-end gap-0.5">
                <TrendingUp className="w-3 h-3 text-orange-500" />
                <p className="text-[11px] font-semibold text-orange-500">{formatGrowth(o.yoyGrowth)}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}