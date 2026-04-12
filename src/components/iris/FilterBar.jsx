import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DISEASE_LIST } from "@/lib/outbreakData";
import { Filter, Calendar } from "lucide-react";

const QUARTERS = [
  { value: 1, label: "Q1 · Jan–Mar" },
  { value: 2, label: "Q2 · Apr–Jun" },
  { value: 3, label: "Q3 · Jul–Sep" },
  { value: 4, label: "Q4 · Oct–Dec" },
];

const YEARS = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030];

export default function FilterBar({ year, onYearChange, disease, onDiseaseChange, quarter, onQuarterChange, hideYear = false }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {!hideYear && (
        <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <Select value={String(year)} onValueChange={(v) => onYearChange(Number(v))}>
            <SelectTrigger className="border-0 bg-transparent shadow-none h-8 w-24 p-0 font-medium text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2020,2021,2022,2023,2024,2025,2026,2027,2028,2029,2030].map(y => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
        <Select value={String(quarter)} onValueChange={(v) => onQuarterChange(Number(v))}>
          <SelectTrigger className="border-0 bg-transparent shadow-none h-8 w-32 p-0 font-medium text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {QUARTERS.map(q => (
              <SelectItem key={q.value} value={String(q.value)}>{q.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2 bg-card border border-border rounded-lg px-3 py-1.5">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={disease || "all"} onValueChange={(v) => onDiseaseChange(v === "all" ? null : v)}>
          <SelectTrigger className="border-0 bg-transparent shadow-none h-8 w-36 p-0 font-medium text-sm">
            <SelectValue placeholder="All Diseases" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Diseases</SelectItem>
            {(DISEASE_LIST || []).map(d => (
              <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}