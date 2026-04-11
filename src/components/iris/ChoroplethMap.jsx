import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ── ISO-2 → ISO-3 mapping (covers all COUNTRIES in outbreakData) ─────────────
const ISO2_TO_ISO3 = {
  NG: "NGA", IN: "IND", BR: "BRA", US: "USA", CN: "CHN", ID: "IDN",
  PK: "PAK", BD: "BGD", RU: "RUS", MX: "MEX", JP: "JPN", ET: "ETH",
  PH: "PHL", EG: "EGY", CD: "COD", DE: "DEU", GB: "GBR", FR: "FRA",
  TH: "THA", TZ: "TZA", ZA: "ZAF", KE: "KEN", CO: "COL", IT: "ITA",
  MM: "MMR", KR: "KOR", SD: "SDN", UG: "UGA", AR: "ARG", DZ: "DZA",
  IQ: "IRQ", AF: "AFG", CA: "CAN", MA: "MAR", SA: "SAU", PE: "PER",
  AO: "AGO", MZ: "MOZ", GH: "GHA", YE: "YEM", NP: "NPL", VE: "VEN",
  MG: "MDG", AU: "AUS", CM: "CMR", NE: "NER", LK: "LKA", ML: "MLI",
  GT: "GTM", SN: "SEN", KH: "KHM", TD: "TCD", SO: "SOM", ZM: "ZMB",
  ZW: "ZWE", RW: "RWA", GN: "GIN", BF: "BFA", MW: "MWI", BO: "BOL",
  HT: "HTI", SE: "SWE", PT: "PRT", IL: "ISR", SL: "SLE", LR: "LBR",
  PG: "PNG", LA: "LAO", VN: "VNM", PL: "POL", ES: "ESP", TR: "TUR",
  IR: "IRN", UA: "UKR", MY: "MYS", CI: "CIV", UZ: "UZB", CL: "CHL",
  NL: "NLD", RO: "ROU", EC: "ECU", HN: "HND", CU: "CUB", NZ: "NZL",
  NO: "NOR", FI: "FIN", DK: "DNK", SG: "SGP", TG: "TGO", BJ: "BEN",
  CF: "CAF", CG: "COG", SS: "SSD", BI: "BDI", NI: "NIC", DO: "DOM",
  ER: "ERI",
};

// Reverse map: ISO-3 → ISO-2
const ISO3_TO_ISO2 = Object.fromEntries(Object.entries(ISO2_TO_ISO3).map(([a2, a3]) => [a3, a2]));

// ── Risk colour scale ────────────────────────────────────────────────────────
function riskToFill(risk) {
  const stops = [
    [0,   [209, 250, 229]],
    [15,  [134, 239, 172]],
    [30,  [251, 191,  36]],
    [50,  [249, 115,  22]],
    [70,  [220,  38,  38]],
    [100, [127,  29,  29]],
  ];
  const t = Math.min(100, Math.max(0, risk ?? 5));
  let lo = stops[0], hi = stops[stops.length - 1];
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i][0] && t <= stops[i + 1][0]) { lo = stops[i]; hi = stops[i + 1]; break; }
  }
  const s = (hi[0] - lo[0]) === 0 ? 0 : (t - lo[0]) / (hi[0] - lo[0]);
  const r = Math.round(lo[1][0] + (hi[1][0] - lo[1][0]) * s);
  const g = Math.round(lo[1][1] + (hi[1][1] - lo[1][1]) * s);
  const b = Math.round(lo[1][2] + (hi[1][2] - lo[1][2]) * s);
  return `rgb(${r},${g},${b})`;
}

function riskLabel(r) {
  if (r < 15) return "Low";
  if (r < 30) return "Moderate";
  if (r < 50) return "Elevated";
  if (r < 65) return "High";
  return "Critical";
}

const trendArrow = { rising: "↑", falling: "↓", stable: "→" };
const trendColor = { rising: "#ef4444", falling: "#22c55e", stable: "#94a3b8" };

function formatCases(n) {
  if (!n) return "N/A";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

// Build lookup keyed by ISO-3
function buildLookup(predictions) {
  const map = {};
  for (const p of predictions) {
    const iso3 = ISO2_TO_ISO3[p.countryCode];
    if (iso3) map[iso3] = p;
    // also store by iso2 as fallback
    map[p.countryCode] = p;
  }
  return map;
}

// Extract ISO-3 from a GeoJSON feature (tries multiple property names)
function featureISO3(f) {
  const p = f.properties || {};
  return (
    p.ISO_A3 || p.iso_a3 || p.ADM0_A3 || p.ADM0_A3_IS || p.SOV_A3 || ""
  ).toUpperCase().trim();
}

// Fallback prediction for any country not in our dataset
function makeFallback(iso3, featureName) {
  const iso2 = ISO3_TO_ISO2[iso3] || "??";
  const risk  = 5 + (iso3.charCodeAt(0) % 10); // deterministic 5-14%
  return {
    country: featureName || iso3,
    countryCode: iso2,
    iso3,
    disease: "General",
    risk,
    confidence: 30,
    estimatedCases: null,
    trend: "stable",
    yoyGrowth: 0,
    featureImportance: [],
    isFallback: true,
  };
}

function MapReady({ onReady }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

const GEOJSON_URL =
  "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function ChoroplethMap({ predictions, onCountrySelect, selectedCountry }) {
  const [geoData, setGeoData]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [hoveredISO3, setHovered] = useState(null);
  const lookupRef  = useRef({});
  const geoJsonRef = useRef(null);

  // Fetch GeoJSON once
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(data => { setGeoData(data); setLoading(false); })
      .catch(e  => { setError(e.message); setLoading(false); });
  }, []);

  // Rebuild lookup whenever predictions change
  useEffect(() => {
    lookupRef.current = buildLookup(predictions);
    if (process.env.NODE_ENV !== "production") {
      console.log(`[IRIS] Predictions: ${predictions.length}, Lookup keys: ${Object.keys(lookupRef.current).length}`);
    }
  }, [predictions]);

  // Re-style when predictions or hover change
  useEffect(() => {
    if (geoJsonRef.current) geoJsonRef.current.setStyle(styleFeature);
  // eslint-disable-next-line
  }, [predictions, hoveredISO3, selectedCountry]);

  const getPred = useCallback((feature) => {
    const iso3 = featureISO3(feature);
    const name = feature.properties?.ADMIN || feature.properties?.NAME || iso3;
    return lookupRef.current[iso3] || makeFallback(iso3, name);
  }, []);

  const styleFeature = useCallback((feature) => {
    const pred = getPred(feature);
    const iso3 = featureISO3(feature);
    const isHovered  = iso3 === hoveredISO3;
    const isSelected = selectedCountry && (
      selectedCountry.countryCode === pred.countryCode ||
      ISO2_TO_ISO3[selectedCountry.countryCode] === iso3
    );

    return {
      fillColor:   riskToFill(pred.risk),
      fillOpacity: isHovered ? 0.95 : pred.isFallback ? 0.30 : 0.78,
      color:       isSelected ? "#1e293b" : isHovered ? "#475569" : "#94a3b8",
      weight:      isSelected ? 2 : isHovered ? 1.2 : 0.3,
      opacity:     1,
    };
  }, [getPred, hoveredISO3, selectedCountry]);

  const onEachFeature = useCallback((feature, layer) => {
    const iso3 = featureISO3(feature);
    const name  = feature.properties?.ADMIN || feature.properties?.NAME || iso3;

    layer.on({
      mouseover(e) {
        setHovered(iso3);
        const pred = getPred(feature);
        const tCol = trendColor[pred.trend] || "#94a3b8";
        const arr  = trendArrow[pred.trend]  || "→";
        const body = pred.isFallback
          ? `<div style="font-size:11px;color:#94a3b8">Minimal baseline estimate</div>`
          : `<table style="width:100%;font-size:11px;border-spacing:0 3px">
              <tr><td style="color:#64748b">Disease</td><td style="font-weight:600;text-align:right">${pred.disease}</td></tr>
              <tr><td style="color:#64748b">Risk Level</td>
                  <td style="font-weight:700;text-align:right;color:${riskToFill(pred.risk)}">${pred.risk}% — ${riskLabel(pred.risk)}</td></tr>
              <tr><td style="color:#64748b">Confidence</td><td style="font-weight:600;text-align:right">${pred.confidence}%</td></tr>
              <tr><td style="color:#64748b">Trend</td>
                  <td style="font-weight:600;text-align:right;color:${tCol}">${arr} ${pred.trend} (${pred.yoyGrowth > 0 ? "+" : ""}${pred.yoyGrowth}%)</td></tr>
              <tr><td style="color:#64748b">Est. Cases</td>
                  <td style="font-weight:600;text-align:right">${formatCases(pred.estimatedCases)}</td></tr>
            </table>
            <div style="margin-top:5px;font-size:10px;color:#94a3b8">Click to explore breakdown</div>`;

        layer.bindTooltip(`
          <div style="font-family:Inter,sans-serif;min-width:190px;padding:2px">
            <div style="font-weight:700;font-size:13px;border-bottom:1px solid #e2e8f0;padding-bottom:5px;margin-bottom:6px">${name}</div>
            ${body}
          </div>`, { sticky: true, opacity: 0.98 }).openTooltip(e.latlng);
      },
      mouseout() {
        setHovered(null);
        layer.unbindTooltip();
      },
      click() {
        const pred = getPred(feature);
        if (!pred.isFallback) onCountrySelect?.(pred);
      },
    });
  }, [getPred, onCountrySelect]);

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
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <p className="text-sm text-destructive">Map load error: {error}</p>
          </div>
        )}

        <MapContainer
          center={[15, 10]} zoom={2}
          style={{ height: "100%", width: "100%", background: "#bfdbfe" }}
          zoomControl scrollWheelZoom minZoom={2} maxZoom={7}
        >
          <MapReady onReady={() => {}} />

          {geoData && (
            <GeoJSON
              key={`${predictions.length}-${predictions[0]?.year}`}
              ref={geoJsonRef}
              data={geoData}
              style={styleFeature}
              onEachFeature={onEachFeature}
            />
          )}

          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.55}
            zIndex={500}
          />
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-sm rounded-xl px-4 py-3 shadow-md border border-border/60">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Outbreak Risk</p>
          <div className="h-3 w-44 rounded-full mb-1.5"
            style={{ background: "linear-gradient(to right, #86efac, #fbbf24, #f97316, #dc2626, #7f1d1d)" }} />
          <div className="flex justify-between text-[9px] text-muted-foreground w-44">
            <span>Low</span><span>Moderate</span><span>High</span><span>Critical</span>
          </div>
          <div className="mt-2 flex items-center gap-3 text-[9px] text-muted-foreground">
            <span style={{ color: "#ef4444" }}>↑ Rising</span>
            <span style={{ color: "#22c55e" }}>↓ Falling</span>
            <span style={{ color: "#94a3b8" }}>→ Stable</span>
          </div>
        </div>

        {/* Year badge */}
        <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm border border-border/60">
          <p className="text-[11px] font-semibold text-slate-600">
            {predictions[0]?.year || "—"} · {predictions.length} modelled countries
          </p>
        </div>
      </div>
    </div>
  );
}