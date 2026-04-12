import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Smooth 5-stop color ramp
function riskToColor(risk) {
  if (risk === null || risk === undefined) return "#e2e8f0";
  const t = Math.min(1, risk / 85);
  const stops = [
    [240, 253, 244],   // 0%  – very light green
    [74,  222, 128],   // 20% – green
    [251, 191, 36],    // 40% – amber
    [249, 115, 22],    // 60% – orange
    [220, 38,  38],    // 85%+– red
  ];
  const scaled = t * (stops.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(stops.length - 1, lo + 1);
  const s = scaled - lo;
  const interp = (i) => Math.round(stops[lo][i] + (stops[hi][i] - stops[lo][i]) * s);
  return `rgb(${interp(0)},${interp(1)},${interp(2)})`;
}

function riskLabel(risk) {
  if (risk == null) return "No data";
  if (risk < 15) return "Low";
  if (risk < 30) return "Moderate";
  if (risk < 50) return "Elevated";
  if (risk < 65) return "High";
  return "Critical";
}

const trendArrow = { rising: "↑", falling: "↓", stable: "→" };
const trendColor = { rising: "#ef4444", falling: "#22c55e", stable: "#94a3b8" };

// Map ISO_A2/ISO_A3 → our country codes
const ISO_MAP = {
  "NG": "NG","IN": "IN","BR": "BR","US": "US","CN": "CN","ID": "ID","PK": "PK",
  "BD": "BD","RU": "RU","MX": "MX","JP": "JP","ET": "ET","PH": "PH","EG": "EG",
  "CD": "CD","DE": "DE","GB": "GB","FR": "FR","TH": "TH","TZ": "TZ","ZA": "ZA",
  "KE": "KE","CO": "CO","IT": "IT","MM": "MM","KR": "KR","SD": "SD","UG": "UG",
  "AR": "AR","DZ": "DZ","IQ": "IQ","AF": "AF","CA": "CA","MA": "MA","SA": "SA",
  "PE": "PE","AO": "AO","MZ": "MZ","GH": "GH","YE": "YE","NP": "NP","VE": "VE",
  "MG": "MG","AU": "AU","CM": "CM","NE": "NE","LK": "LK","ML": "ML","GT": "GT",
  "SN": "SN","KH": "KH","TD": "TD","SO": "SO","ZM": "ZM","ZW": "ZW","RW": "RW",
  "GN": "GN","BF": "BF","MW": "MW","BO": "BO","HT": "HT","SE": "SE","PT": "PT",
  "IL": "IL","SL": "SL","LR": "LR","PG": "PG","LA": "LA","VN": "VN","PL": "PL",
  "ES": "ES","TR": "TR","IR": "IR","UA": "UA","MY": "MY","CI": "CI","UZ": "UZ",
  "CL": "CL","NL": "NL","RO": "RO","EC": "EC","HN": "HN","CU": "CU","NZ": "NZ",
  "NO": "NO","FI": "FI","DK": "DK","SG": "SG","TG": "TG","BJ": "BJ","CF": "CF",
  "CG": "CG","SS": "SS","BI": "BI","NI": "NI","DO": "DO","ER": "ER",
};

function GeoLayer({ geoJson, riskMap, selectedCountry, onCountrySelect, isDelta }) {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    if (layerRef.current) {
      layerRef.current.resetStyle();
    }
  }, [riskMap]);

  if (!geoJson) return null;

  const style = (feature) => {
    const iso = feature.properties?.ISO_A2 || feature.properties?.iso_a2;
    const code = ISO_MAP[iso];
    const data = code ? riskMap[code] : null;

    if (isDelta && data) {
      const delta = data.delta;
      let color;
      if (delta > 10) color = "#ef4444";
      else if (delta > 4) color = "#f97316";
      else if (delta > 1) color = "#fbbf24";
      else if (delta > -1) color = "#94a3b8";
      else if (delta > -4) color = "#86efac";
      else color = "#22c55e";
      return {
        fillColor: color,
        fillOpacity: 0.72,
        color: "#fff",
        weight: 0.6,
        opacity: 0.7,
      };
    }

    const risk = data?.risk ?? null;
    const isSelected = data && selectedCountry?.countryCode === data.countryCode;
    return {
      fillColor: riskToColor(risk),
      fillOpacity: risk != null ? (isSelected ? 0.88 : 0.70) : 0.18,
      color: isSelected ? "#1e293b" : "#fff",
      weight: isSelected ? 2 : 0.6,
      opacity: 0.8,
    };
  };

  const onEachFeature = (feature, layer) => {
    const iso = feature.properties?.ISO_A2 || feature.properties?.iso_a2;
    const code = ISO_MAP[iso];
    const data = code ? riskMap[code] : null;

    layer.on({
      click: () => data && onCountrySelect?.(data),
      mouseover: (e) => {
        e.target.setStyle({ weight: 1.5, opacity: 1, fillOpacity: data ? 0.88 : 0.25 });
        if (!data) return;
        const name = feature.properties?.NAME || feature.properties?.name || "";
        const tooltipContent = isDelta && data.delta !== undefined
          ? `<div style="font-family:Inter,sans-serif;min-width:160px;font-size:11px">
              <b style="font-size:13px">${data.country}</b>
              <div style="margin-top:5px">
                <span style="color:#64748b">Year A Risk:</span> <b>${data.riskA?.toFixed(1) ?? "—"}%</b><br/>
                <span style="color:#64748b">Year B Risk:</span> <b>${data.riskB?.toFixed(1) ?? "—"}%</b><br/>
                <span style="color:#64748b">Delta:</span> <b style="color:${data.delta > 0 ? '#ef4444' : '#22c55e'}">${data.delta > 0 ? "+" : ""}${data.delta?.toFixed(1) ?? "—"}%</b>
              </div>
             </div>`
          : `<div style="font-family:Inter,sans-serif;min-width:170px;font-size:11px">
              <b style="font-size:13px">${data.country}</b>
              <table style="width:100%;border-spacing:0 2px;margin-top:5px">
                <tr><td style="color:#64748b">Disease</td><td style="font-weight:600;text-align:right">${data.disease}</td></tr>
                <tr><td style="color:#64748b">Risk</td><td style="font-weight:700;text-align:right;color:${riskToColor(data.risk)}">${data.risk?.toFixed(1)}% — ${riskLabel(data.risk)}</td></tr>
                <tr><td style="color:#64748b">Confidence</td><td style="text-align:right">${data.confidence}%</td></tr>
                <tr><td style="color:#64748b">Trend</td><td style="text-align:right;color:${trendColor[data.trend]}">${trendArrow[data.trend]} ${data.yoyGrowth > 0 ? "+" : ""}${data.yoyGrowth}% YoY</td></tr>
                <tr><td style="color:#64748b">Est. Cases</td><td style="font-weight:600;text-align:right">${data.estimatedCases >= 1e6 ? (data.estimatedCases/1e6).toFixed(1)+"M" : data.estimatedCases >= 1000 ? (data.estimatedCases/1000).toFixed(0)+"K" : data.estimatedCases}</td></tr>
              </table>
              <div style="margin-top:5px;font-size:10px;color:#94a3b8">Click to explore breakdown</div>
             </div>`;
        layer.bindTooltip(tooltipContent, { sticky: true, opacity: 0.97, className: "" }).openTooltip();
      },
      mouseout: (e) => {
        e.target.setStyle(style(feature));
        layer.closeTooltip();
      },
    });
  };

  return (
    <GeoJSON
      key={JSON.stringify(Object.keys(riskMap).slice(0, 3))}
      ref={layerRef}
      data={geoJson}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}

const GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function GlobalMap({ predictions, onCountrySelect, selectedCountry, isDelta = false }) {
  const [geoJson, setGeoJson] = useState(null);

  useEffect(() => {
    fetch(GEO_URL)
      .then(r => r.json())
      .then(setGeoJson)
      .catch(() => {});
  }, []);

  // Build lookup by country code
  const riskMap = {};
  for (const p of (predictions || [])) {
    riskMap[p.countryCode] = p;
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative" style={{ height: 480 }}>
        {!geoJson && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-7 h-7 border-3 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-muted-foreground">Loading map…</p>
            </div>
          </div>
        )}
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
            opacity={0.4}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.5}
          />
          <GeoLayer
            geoJson={geoJson}
            riskMap={riskMap}
            selectedCountry={selectedCountry}
            onCountrySelect={onCountrySelect}
            isDelta={isDelta}
          />
        </MapContainer>

        {/* Legend */}
        {!isDelta ? (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 z-[1000] shadow-md border border-border/60">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Outbreak Risk</p>
            <div
              className="h-2.5 w-32 rounded-full mb-1"
              style={{ background: "linear-gradient(to right, #4ade80, #fbbf24, #f97316, #dc2626)" }}
            />
            <div className="flex justify-between text-[9px] text-muted-foreground w-32">
              <span>Low</span><span>Moderate</span><span>Critical</span>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
              <div><span className="text-red-500">↑</span> Rising &nbsp;<span className="text-emerald-500">↓</span> Falling &nbsp;<span className="text-slate-400">→</span> Stable</div>
              <div className="text-[9px]">Grey = no data</div>
            </div>
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 z-[1000] shadow-md border border-border/60">
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Risk Delta</p>
            <div className="space-y-1">
              {[["#22c55e","Decrease &gt;4%"],["#86efac","Decrease 1–4%"],["#94a3b8","Stable ±1%"],["#fbbf24","Increase 1–4%"],["#f97316","Increase 4–10%"],["#ef4444","Increase &gt;10%"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c }} />
                  <span className="text-[10px] text-muted-foreground" dangerouslySetInnerHTML={{ __html: l }} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}