import { useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Smooth color gradient: green → yellow → orange → red
function riskToColor(risk) {
  // risk: 0–100
  const t = Math.min(1, risk / 80);
  if (t < 0.33) {
    // green (#4ade80) → amber (#fbbf24)
    const s = t / 0.33;
    return interpolateColor([74, 222, 128], [251, 191, 36], s);
  } else if (t < 0.66) {
    // amber → orange (#f97316)
    const s = (t - 0.33) / 0.33;
    return interpolateColor([251, 191, 36], [249, 115, 22], s);
  } else {
    // orange → red (#dc2626)
    const s = (t - 0.66) / 0.34;
    return interpolateColor([249, 115, 22], [220, 38, 38], s);
  }
}

function interpolateColor(c1, c2, t) {
  const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
  const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
  const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
  return `rgb(${r},${g},${b})`;
}

function riskLabel(risk) {
  if (risk < 15) return "Low";
  if (risk < 30) return "Moderate";
  if (risk < 50) return "Elevated";
  if (risk < 65) return "High";
  return "Critical";
}

const trendArrow = { rising: "↑", falling: "↓", stable: "→" };
const trendColor = { rising: "#ef4444", falling: "#22c55e", stable: "#94a3b8" };

function getRadius(population) {
  return Math.max(5, Math.min(22, Math.pow(population / 10_000_000, 0.5) * 5));
}

export default function GlobalMap({ predictions, onCountrySelect, selectedCountry }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative" style={{ height: 520 }}>
        <MapContainer
          center={[15, 10]}
          zoom={2}
          className="h-full w-full"
          zoomControl
          scrollWheelZoom
          minZoom={2}
          maxZoom={8}
          style={{ background: "#f0f4f8" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            opacity={0.55}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.45}
          />

          {predictions.map(p => {
            const color = riskToColor(p.risk);
            const isSelected = selectedCountry?.countryCode === p.countryCode;
            const radius = getRadius(p.population);

            return (
              <CircleMarker
                key={p.countryCode}
                center={[p.lat, p.lng]}
                radius={isSelected ? radius + 3 : radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: isSelected ? 0.80 : 0.58,
                  color: isSelected ? "#1e293b" : color,
                  weight: isSelected ? 2.5 : 1.2,
                  opacity: 0.85,
                }}
                eventHandlers={{ click: () => onCountrySelect?.(p) }}
              >
                <Tooltip direction="top" offset={[0, -radius]} opacity={0.98}>
                  <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif" }}>
                    <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 6, borderBottom: "1px solid #e2e8f0", paddingBottom: 4 }}>
                      {p.country}
                    </div>
                    <table style={{ width: "100%", fontSize: 11, borderSpacing: "0 2px" }}>
                      <tbody>
                        <tr>
                          <td style={{ color: "#64748b" }}>Disease</td>
                          <td style={{ fontWeight: 600, textAlign: "right" }}>{p.disease}</td>
                        </tr>
                        <tr>
                          <td style={{ color: "#64748b" }}>Risk Level</td>
                          <td style={{ fontWeight: 700, textAlign: "right", color }}>
                            {p.risk}% — {riskLabel(p.risk)}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: "#64748b" }}>Confidence</td>
                          <td style={{ fontWeight: 600, textAlign: "right" }}>{p.confidence}%</td>
                        </tr>
                        <tr>
                          <td style={{ color: "#64748b" }}>Trend</td>
                          <td style={{ fontWeight: 600, textAlign: "right", color: trendColor[p.trend] }}>
                            {trendArrow[p.trend]} {p.trend} ({p.yoyGrowth > 0 ? "+" : ""}{p.yoyGrowth}% YoY)
                          </td>
                        </tr>
                        <tr>
                          <td style={{ color: "#64748b" }}>Est. Cases</td>
                          <td style={{ fontWeight: 600, textAlign: "right" }}>
                            {p.estimatedCases >= 1e6
                              ? (p.estimatedCases / 1e6).toFixed(1) + "M"
                              : p.estimatedCases >= 1000
                              ? (p.estimatedCases / 1000).toFixed(0) + "K"
                              : p.estimatedCases}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div style={{ marginTop: 6, fontSize: 10, color: "#94a3b8" }}>
                      Click to explore risk breakdown
                    </div>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
        </MapContainer>

        {/* Gradient Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 z-[1000] shadow-md border border-border/60">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Outbreak Risk</p>
          <div className="flex items-center gap-1.5 mb-1">
            <div
              className="h-2.5 w-28 rounded-full"
              style={{ background: "linear-gradient(to right, #4ade80, #fbbf24, #f97316, #dc2626)" }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-muted-foreground w-28">
            <span>Low</span><span>Moderate</span><span>Critical</span>
          </div>
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span style={{ color: "#ef4444" }}>↑</span> Rising &nbsp;
              <span style={{ color: "#22c55e" }}>↓</span> Falling &nbsp;
              <span style={{ color: "#94a3b8" }}>→</span> Stable
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}