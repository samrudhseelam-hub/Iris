import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ── Color helpers ─────────────────────────────────────────────────────────────
function riskToColor(risk) {
  if (risk === null || risk === undefined) return "#d1d5db";
  const t = Math.min(1, risk / 85);
  const stops = [
    [220, 252, 231],  // 0   – very light green
    [74,  222, 128],  // 20% – green
    [251, 191,  36],  // 40% – amber
    [249, 115,  22],  // 60% – orange
    [220,  38,  38],  // 85%+– red
  ];
  const scaled = t * (stops.length - 1);
  const lo = Math.floor(scaled);
  const hi = Math.min(stops.length - 1, lo + 1);
  const s = scaled - lo;
  const i = (ch) => Math.round(stops[lo][ch] + (stops[hi][ch] - stops[lo][ch]) * s);
  return `rgb(${i(0)},${i(1)},${i(2)})`;
}

function deltaToColor(delta) {
  if (delta > 10)  return "#ef4444";
  if (delta > 4)   return "#f97316";
  if (delta > 1)   return "#fbbf24";
  if (delta > -1)  return "#94a3b8";
  if (delta > -4)  return "#86efac";
  return "#22c55e";
}

function riskLabel(risk) {
  if (risk == null) return "No data";
  if (risk < 15) return "Low";
  if (risk < 30) return "Moderate";
  if (risk < 50) return "Elevated";
  if (risk < 65) return "High";
  return "Critical";
}

function fmtCases(n) {
  if (!n) return "—";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(0) + "K";
  return String(n);
}

const TREND_ARROW = { rising: "↑", falling: "↓", stable: "→" };
const TREND_COLOR = { rising: "#ef4444", falling: "#22c55e", stable: "#94a3b8" };

// ── ISO A2 → our country code map ─────────────────────────────────────────────
const ISO_MAP = {
  NG:"NG",IN:"IN",BR:"BR",US:"US",CN:"CN",ID:"ID",PK:"PK",BD:"BD",RU:"RU",
  MX:"MX",JP:"JP",ET:"ET",PH:"PH",EG:"EG",CD:"CD",DE:"DE",GB:"GB",FR:"FR",
  TH:"TH",TZ:"TZ",ZA:"ZA",KE:"KE",CO:"CO",IT:"IT",MM:"MM",KR:"KR",SD:"SD",
  UG:"UG",AR:"AR",DZ:"DZ",IQ:"IQ",AF:"AF",CA:"CA",MA:"MA",SA:"SA",PE:"PE",
  AO:"AO",MZ:"MZ",GH:"GH",YE:"YE",NP:"NP",VE:"VE",MG:"MG",AU:"AU",CM:"CM",
  NE:"NE",LK:"LK",ML:"ML",GT:"GT",SN:"SN",KH:"KH",TD:"TD",SO:"SO",ZM:"ZM",
  ZW:"ZW",RW:"RW",GN:"GN",BF:"BF",MW:"MW",BO:"BO",HT:"HT",SE:"SE",PT:"PT",
  IL:"IL",SL:"SL",LR:"LR",PG:"PG",LA:"LA",VN:"VN",PL:"PL",ES:"ES",TR:"TR",
  IR:"IR",UA:"UA",MY:"MY",CI:"CI",UZ:"UZ",CL:"CL",NL:"NL",RO:"RO",EC:"EC",
  HN:"HN",CU:"CU",NZ:"NZ",NO:"NO",FI:"FI",DK:"DK",SG:"SG",TG:"TG",BJ:"BJ",
  CF:"CF",CG:"CG",SS:"SS",BI:"BI",NI:"NI","DO":"DO",ER:"ER",
};

// Also map by country name as fallback
const NAME_MAP = {
  "Nigeria":"NG","India":"IN","Brazil":"BR","United States of America":"US","China":"CN",
  "Indonesia":"ID","Pakistan":"PK","Bangladesh":"BD","Russia":"RU","Mexico":"MX",
  "Japan":"JP","Ethiopia":"ET","Philippines":"PH","Egypt":"EG","Democratic Republic of the Congo":"CD",
  "Germany":"DE","United Kingdom":"GB","France":"FR","Thailand":"TH","Tanzania":"TZ",
  "South Africa":"ZA","Kenya":"KE","Colombia":"CO","Italy":"IT","Myanmar":"MM",
  "South Korea":"KR","Sudan":"SD","Uganda":"UG","Argentina":"AR","Algeria":"DZ",
  "Iraq":"IQ","Afghanistan":"AF","Canada":"CA","Morocco":"MA","Saudi Arabia":"SA",
  "Peru":"PE","Angola":"AO","Mozambique":"MZ","Ghana":"GH","Yemen":"YE","Nepal":"NP",
  "Venezuela":"VE","Madagascar":"MG","Australia":"AU","Cameroon":"CM","Niger":"NE",
  "Sri Lanka":"LK","Mali":"ML","Guatemala":"GT","Senegal":"SN","Cambodia":"KH",
  "Chad":"TD","Somalia":"SO","Zambia":"ZM","Zimbabwe":"ZW","Rwanda":"RW","Guinea":"GN",
  "Burkina Faso":"BF","Malawi":"MW","Bolivia":"BO","Haiti":"HT","Sweden":"SE",
  "Portugal":"PT","Israel":"IL","Sierra Leone":"SL","Liberia":"LR",
  "Papua New Guinea":"PG","Laos":"LA","Vietnam":"VN","Poland":"PL","Spain":"ES",
  "Turkey":"TR","Iran":"IR","Ukraine":"UA","Malaysia":"MY","Ivory Coast":"CI",
  "Côte d'Ivoire":"CI","Uzbekistan":"UZ","Chile":"CL","Netherlands":"NL","Romania":"RO",
  "Ecuador":"EC","Honduras":"HN","Cuba":"CU","New Zealand":"NZ","Norway":"NO",
  "Finland":"FI","Denmark":"DK","Singapore":"SG","Togo":"TG","Benin":"BJ",
  "Central African Republic":"CF","Republic of the Congo":"CG","Congo":"CG",
  "South Sudan":"SS","Burundi":"BI","Nicaragua":"NI","Dominican Republic":"DO",
  "Eritrea":"ER",
};

function resolveCode(props) {
  const iso2 = props?.ISO_A2 || props?.iso_a2 || "";
  if (iso2 && iso2 !== "-99" && ISO_MAP[iso2]) return ISO_MAP[iso2];
  const name = props?.NAME || props?.ADMIN || props?.name || "";
  return NAME_MAP[name] || null;
}

// ── Inner map component (has access to map instance) ──────────────────────────
function ChoroplethLayer({ geoJson, riskMap, isDelta, onCountrySelect, selectedCode }) {
  const map = useMap();
  const geojsonLayerRef = useRef(null);

  const getStyle = useCallback((feature) => {
    const code = resolveCode(feature.properties);
    const data = code ? riskMap[code] : null;
    const isSelected = code && selectedCode === code;

    let fillColor = "#d1d5db";
    let fillOpacity = 0.15;

    if (data) {
      fillOpacity = isSelected ? 0.90 : 0.72;
      if (isDelta && data.delta !== undefined) {
        fillColor = deltaToColor(data.delta);
      } else {
        fillColor = riskToColor(data.risk);
      }
    }

    return {
      fillColor,
      fillOpacity,
      color: isSelected ? "#1e293b" : "#ffffff",
      weight: isSelected ? 2 : 0.5,
      opacity: 1,
    };
  }, [riskMap, isDelta, selectedCode]);

  const onEachFeature = useCallback((feature, layer) => {
    const code = resolveCode(feature.properties);
    const data = code ? riskMap[code] : null;
    const countryName = feature.properties?.NAME || feature.properties?.ADMIN || feature.properties?.name || "Unknown";

    // Hover highlight
    layer.on({
      mouseover(e) {
        e.target.setStyle({
          fillOpacity: data ? 0.92 : 0.30,
          weight: 1.5,
          color: "#334155",
        });
        e.target.bringToFront();

        // Build tooltip HTML
        let html = "";
        if (!data) {
          html = `<div style="font-family:Inter,sans-serif;font-size:12px;padding:2px 0">
            <b style="font-size:13px">${countryName}</b>
            <div style="color:#94a3b8;margin-top:4px;font-size:11px">No data available</div>
          </div>`;
        } else if (isDelta && data.delta !== undefined) {
          const dColor = data.delta > 0 ? "#ef4444" : data.delta < 0 ? "#22c55e" : "#94a3b8";
          html = `<div style="font-family:Inter,sans-serif;font-size:12px;min-width:190px">
            <b style="font-size:13px;display:block;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:4px">${data.country}</b>
            <table style="width:100%;border-spacing:0 3px;font-size:11px">
              <tr><td style="color:#64748b">Disease</td><td style="font-weight:600;text-align:right">${data.disease}</td></tr>
              <tr><td style="color:#64748b">Scenario A Risk</td><td style="font-weight:700;text-align:right">${(data.riskA ?? 0).toFixed(1)}%</td></tr>
              <tr><td style="color:#64748b">Scenario B Risk</td><td style="font-weight:700;text-align:right">${(data.riskB ?? 0).toFixed(1)}%</td></tr>
              <tr><td style="color:#64748b">Delta</td><td style="font-weight:700;text-align:right;color:${dColor}">${data.delta > 0 ? "+" : ""}${(data.delta ?? 0).toFixed(1)}%</td></tr>
            </table>
          </div>`;
        } else {
          const rColor = riskToColor(data.risk);
          const tColor = TREND_COLOR[data.trend] || "#94a3b8";
          html = `<div style="font-family:Inter,sans-serif;font-size:12px;min-width:200px">
            <b style="font-size:13px;display:block;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:4px">${data.country}</b>
            <table style="width:100%;border-spacing:0 3px;font-size:11px">
              <tr>
                <td style="color:#64748b">Disease</td>
                <td style="font-weight:600;text-align:right">${data.disease}</td>
              </tr>
              <tr>
                <td style="color:#64748b">Risk Score</td>
                <td style="font-weight:700;text-align:right">
                  <span style="color:${rColor}">${(data.risk ?? 0).toFixed(1)}%</span>
                  <span style="color:#94a3b8;font-weight:400"> — ${riskLabel(data.risk)}</span>
                </td>
              </tr>
              <tr>
                <td style="color:#64748b">Confidence</td>
                <td style="text-align:right;font-weight:600">${data.confidence}%</td>
              </tr>
              <tr>
                <td style="color:#64748b">Trend</td>
                <td style="text-align:right;font-weight:600;color:${tColor}">
                  ${TREND_ARROW[data.trend] || "→"} ${data.yoyGrowth > 0 ? "+" : ""}${data.yoyGrowth}% YoY
                </td>
              </tr>
              <tr>
                <td style="color:#64748b">Region</td>
                <td style="text-align:right;font-weight:600">${data.region}</td>
              </tr>
              <tr>
                <td style="color:#64748b">Est. Cases</td>
                <td style="text-align:right;font-weight:600">${fmtCases(data.estimatedCases)}</td>
              </tr>
              <tr>
                <td style="color:#64748b">Population</td>
                <td style="text-align:right;font-weight:600">${fmtCases(data.population)}</td>
              </tr>
            </table>
            <div style="margin-top:6px;font-size:10px;color:#94a3b8">Click to explore full breakdown →</div>
          </div>`;
        }

        layer.bindTooltip(html, {
          sticky: false,
          direction: "top",
          offset: [0, -4],
          opacity: 1,
          className: "iris-tooltip",
        }).openTooltip(e.latlng);
      },
      mouseout(e) {
        geojsonLayerRef.current?.resetStyle(e.target);
        e.target.closeTooltip();
      },
      click() {
        if (data) onCountrySelect?.(data);
      },
    });
  }, [riskMap, isDelta, onCountrySelect]);

  // Render/re-render GeoJSON imperatively so styles are always fresh
  useEffect(() => {
    if (!geoJson || !map) return;

    // Remove old layer
    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    const layer = L.geoJSON(geoJson, {
      style: getStyle,
      onEachFeature,
    });

    layer.addTo(map);
    geojsonLayerRef.current = layer;

    return () => {
      if (geojsonLayerRef.current) {
        map.removeLayer(geojsonLayerRef.current);
      }
    };
  }, [geoJson, riskMap, isDelta, selectedCode]); // eslint-disable-line

  return null;
}

// ── GeoJSON fetcher (cached) ──────────────────────────────────────────────────
let cachedGeoJson = null;
const GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";

export default function GlobalMap({ predictions, onCountrySelect, selectedCountry, isDelta = false }) {
  const [geoJson, setGeoJson] = useState(cachedGeoJson);
  const [loading, setLoading] = useState(!cachedGeoJson);

  useEffect(() => {
    if (cachedGeoJson) { setGeoJson(cachedGeoJson); setLoading(false); return; }
    fetch(GEO_URL)
      .then(r => r.json())
      .then(data => { cachedGeoJson = data; setGeoJson(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Build lookup by country code
  const riskMap = {};
  for (const p of (predictions || [])) {
    riskMap[p.countryCode] = p;
  }

  const selectedCode = selectedCountry?.countryCode || null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden relative">
      {/* Tooltip styles */}
      <style>{`
        .iris-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12) !important;
          padding: 10px 12px !important;
          font-family: Inter, sans-serif !important;
          max-width: 240px !important;
        }
        .iris-tooltip::before { display: none !important; }
        .leaflet-tooltip-top.iris-tooltip::before { display: none !important; }
      `}</style>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 z-20 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading world map…</p>
          </div>
        </div>
      )}

      <div style={{ height: 480 }}>
        <MapContainer
          center={[15, 10]}
          zoom={2}
          className="h-full w-full"
          scrollWheelZoom
          minZoom={2}
          maxZoom={8}
          style={{ background: "#edf2f7" }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            opacity={0.35}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.55}
          />
          <ChoroplethLayer
            geoJson={geoJson}
            riskMap={riskMap}
            isDelta={isDelta}
            onCountrySelect={onCountrySelect}
            selectedCode={selectedCode}
          />
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/96 backdrop-blur-sm rounded-xl p-3 z-[1000] shadow-md border border-slate-200">
        {!isDelta ? (
          <>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Outbreak Risk</p>
            <div
              className="h-3 w-32 rounded-full mb-1.5"
              style={{ background: "linear-gradient(to right, #4ade80, #fbbf24, #f97316, #dc2626)" }}
            />
            <div className="flex justify-between text-[9px] text-slate-400 w-32 mb-1.5">
              <span>Low</span><span>Moderate</span><span>Critical</span>
            </div>
            <div className="text-[9px] text-slate-400">
              <span style={{ color: "#ef4444" }}>↑</span> Rising &nbsp;
              <span style={{ color: "#22c55e" }}>↓</span> Falling &nbsp;
              <span style={{ color: "#94a3b8" }}>→</span> Stable &nbsp;·&nbsp; Grey = no data
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Risk Delta</p>
            <div className="space-y-1">
              {[
                ["#22c55e", "Decrease >4%"],
                ["#86efac", "Decrease 1–4%"],
                ["#94a3b8", "Stable ±1%"],
                ["#fbbf24", "Increase 1–4%"],
                ["#f97316", "Increase 4–10%"],
                ["#ef4444", "Increase >10%"],
              ].map(([c, l]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: c }} />
                  <span className="text-[10px] text-slate-500">{l}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}