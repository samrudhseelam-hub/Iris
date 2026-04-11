import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { getGlobalTrendOverYears } from "@/lib/outbreakData";
import { TrendingUp } from "lucide-react";

export default function DiseaseTrends({ diseaseFilter }) {
  const data = useMemo(() => getGlobalTrendOverYears(diseaseFilter), [diseaseFilter]);

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-cyan-500/10">
          <TrendingUp className="w-4 h-4 text-cyan-600" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Global Risk Trend {diseaseFilter ? `· ${diseaseFilter}` : ""}
        </h3>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="hsl(199, 89%, 48%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 15% 90%)" vertical={false} />
            <XAxis 
              dataKey="year" 
              tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: "hsl(220 10% 46%)" }}
              axisLine={false}
              tickLine={false}
              domain={[0, 'auto']}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip 
              contentStyle={{
                background: "hsl(0 0% 100%)",
                border: "1px solid hsl(210 15% 90%)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
              }}
              formatter={(v) => [`${v}%`, "Risk Score"]}
            />
            <Area
              type="monotone"
              dataKey="riskScore"
              stroke="hsl(199, 89%, 48%)"
              strokeWidth={2}
              fill="url(#riskGradient)"
              dot={false}
              activeDot={{ r: 4, fill: "hsl(199, 89%, 48%)" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}