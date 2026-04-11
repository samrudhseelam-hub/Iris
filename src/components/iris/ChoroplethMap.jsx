import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ── Risk → color (smooth 5-stop gradient) ───────────────────────────────────
function riskToFill(risk) {
  if (risk === null || risk === undefined) return "#e2e8f0"; // no data
  const stops = [
    [0,   [236, 253, 245]],   // #ecfdf5  very light green
    [20,  [167, 243, 208]],   // #a7f3d0  green
    [40,  [251, 191,  36]],   // #fbbf24  amber
    [60,  [249, 115,  22]],   // #f97316  orange
    [80,  [220,  38,  38]],   // #dc2626  red
    [100, [127,  29,  29]],   // #7f1d1d  dark red
  ];
  const t = Math.min(100, Math.max(0, risk));
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) {
      lo = stops[i]; hi = stops[i + 1]; break;
    }
  }
  const s = (t - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * s);
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * s);
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * s);
  return `rgb(${r},${g},${b})`;
}

function riskLabel(r) {
  if (r === null) return "No Data";
  if (r < 15) return "Low";
  if (r < 30) return "Moderate";
  if (r < 50) return "Elevated";
  if (r < 65) return "High";
  return "Critical";
}

const trendArrow = { rising: "↑", falling: "↓", stable: "→" };
const trendColor = { rising: "#ef4444", falling: "#22c55e", stable: "#94a3b8" };

// Build lookup: ISO-A2 → prediction
function buildLookup(predictions) {
  const map = {};
  for (const p of predictions) {
    map[p.countryCode] = p;
  }
  return map;
}

// GeoJSON feature → ISO A2
function featureCode(f) {
  return (
    f.properties?.ISO_A2 ||
    f.properties?.iso_a2 ||
    f.properties?.ADM0_A3_IS ||
    ""
  ).toUpperCase();
}

function MapReady({ onReady }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function ChoroplethMap({ predictions, onCountrySelect, selectedCountry }) {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hoveredCode, setHoveredCode] = useState(null);
  const lookupRef = useRef({});
  const geoJsonRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => r.json())
      .then(data => { setGeoData(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    lookupRef.current = buildLookup(predictions);
  }, [predictions]);

  // Re-render GeoJSON layer when predictions or hover changes
  useEffect(() => {
    if (geoJsonRef.current) {
      geoJsonRef.current.setStyle(styleFeature);
    }
  }, [predictions, hoveredCode]); // eslint-disable-line

  const styleFeature = useCallback((feature) => {
    const code = featureCode(feature);
    const pred = lookupRef.current[code];
    const isHovered = code === hoveredCode;
    const isSelected = selectedCountry?.countryCode === code;

    return {
      fillColor: pred ? riskToFill(pred.risk) : "#e2e8f0",
      fillOpacity: pred ? (isHovered ? 0.92 : 0.78) : 0.35,
      color: isSelected ? "#1e293b" : isHovered ? "#475569" : "#94a3b8",
      weight: isSelected ? 2 : isHovered ? 1.5 : 0.4,
      opacity: 1,
    };
  }, [hoveredCode, selectedCountry]);

  const onEachFeature = useCallback((feature, layer) => {
    const code = featureCode(feature);

    layer.on({
      mouseover(e) {
        setHoveredCode(code);
        const pred = lookupRef.current[code];
        const name = feature.properties?.ADMIN || feature.properties?.NAME || code;
        if (pred) {
          const tColor = trendColor[pred.trend] || "#94a3b8";
          const arrow  = trendArrow[pred.trend]  || "→";
          layer.bindTooltip(`
            <div style="font-family:Inter,sans-serif;min-width:190px;padding:2px">
              <div style="font-weight:700;font-size:13px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:6px">${name}</div>
              <table style="width:100%;font-size:11px;border-spacing:0 3px">
                <tr><td style="color:#64748b">Disease</td><td style="font-weight:600;text-align:right">${pred.disease}</td></tr>
                <tr><td style="color:#64748b">Risk Level</td>
                    <td style="font-weight:700;text-align:right;color:${riskToFill(pred.risk)}">${pred.risk}% — ${riskLabel(pred.risk)}</td></tr>
                <tr><td style="color:#64748b">Confidence</td><td style="font-weight:600;text-align:right">${pred.confidence}%</td></tr>
                <tr><td style="color:#64748b">Trend</td>
                    <td style="font-weight:600;text-align:right;color:${tColor}">${arrow} ${pred.trend} (${pred.yoyGrowth > 0 ? "+" : ""}${pred.yoyGrowth}%)</td></tr>
                <tr><td style="color:#64748b">Est. Cases</td>
                    <td style="font-weight:600;text-align:right">${
                      pred.estimatedCases >= 1e6
                        ? (pred.estimatedCases / 1e6).toFixed(1) + "M"
                        : pred.estimatedCases >= 1000
                        ? (pred.estimatedCases / 1000).toFixed(0) + "K"
                        : pred.estimatedCases
                    }</td></tr>
              </table>
              <div style="margin-top:6px;font-size:10px;color:#94a3b8">Click to explore breakdown</div>
            </div>
          `, { sticky: true, opacity: 0.98 }).openTooltip(e.latlng);
        } else {
          layer.bindTooltip(`<div style="font-family:Inter,sans-serif;font-size:12px;font-weight:600">${name}<br/><span style="color:#94a3b8;font-weight:400;font-size:11px">No data available</span></div>`,
            { sticky: true, opacity: 0.95 }).openTooltip(e.latlng);
        }
      },
      mouseout() {
        setHoveredCode(null);
        layer.unbindTooltip();
      },
      click() {
        const pred = lookupRef.current[code];
        if (pred) onCountrySelect?.(pred);
      },
    });
  }, [onCountrySelect]);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative" style={{ height: 540 }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-background/60 backdrop-blur-sm rounded-xl">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading geographic data…</p>
            </div>
          </div>
        )}

        <MapContainer
          center={[15, 10]}
          zoom={2}
          style={{ height: "100%", width: "100%", background: "#dbeafe" }}
          zoomControl
          scrollWheelZoom
          minZoom={2}
          maxZoom={7}
        >
          <MapReady onReady={m => (mapRef.current = m)} />

          {/* Ocean base */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            opacity={0.15}
          />

          {/* Country polygons */}
          {geoData && (
            <GeoJSON
              key={predictions.length}   // re-mount when data changes
              ref={geoJsonRef}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}

          {/* Labels overlay */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.6}
            zIndex={500}
          />
        </MapContainer>

        {/* Gradient legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-border/60">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Outbreak Risk</p>
          <div
            className="h-3 w-44 rounded-full mb-1.5"
            style={{ background: "linear-gradient(to right, #a7f3d0, #fbbf24, #f97316, #dc2626, #7f1d1d)" }}
          />
          <div className="flex justify-between text-[9px] text-muted-foreground w-44">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
            <span>Critical</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[9px] text-muted-foreground">
            <span style={{ color: "#ef4444" }}>↑ Rising</span>
            <span style={{ color: "#22c55e" }}>↓ Falling</span>
            <span style={{ color: "#94a3b8" }}>→ Stable</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[9px] text-muted-foreground">
            <div className="w-3 h-3 rounded-sm border border-slate-300" style={{ background: "#e2e8f0" }} />
            <span>No data</span>
          </div>
        </div>

        {/* Year badge */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-border/60">
          <p className="text-[11px] font-semibold text-slate-600">
            {predictions[0]?.year || ""} · {predictions.length} countries
          </p>
        </div>
      </div>
    </div>
  );
}