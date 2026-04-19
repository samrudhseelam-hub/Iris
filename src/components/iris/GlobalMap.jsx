import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getSubRegionRisk } from "@/lib/outbreakData";

// ── Color helpers ─────────────────────────────────────────────────────────────
function riskToColor(risk) {
  if (risk === null || risk === undefined) return "#d1d5db";
  const t = Math.min(1, risk / 85);
  const stops = [
    [220, 252, 231],
    [74,  222, 128],
    [251, 191,  36],
    [249, 115,  22],
    [220,  38,  38],
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

function fmtNum(n) {
  if (!n) return "—";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(0) + "K";
  return String(n);
}

const TREND_ARROW = { rising: "↑", falling: "↓", stable: "→" };
const TREND_COLOR = { rising: "#ef4444", falling: "#22c55e", stable: "#94a3b8" };

// ── ISO resolution ────────────────────────────────────────────────────────────
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

const NAME_MAP = {
  "Nigeria":"NG","India":"IN","Brazil":"BR","United States of America":"US","China":"CN",
  "Indonesia":"ID","Pakistan":"PK","Bangladesh":"BD","Russia":"RU","Mexico":"MX",
  "Japan":"JP","Ethiopia":"ET","Philippines":"PH","Egypt":"EG",
  "Democratic Republic of the Congo":"CD","Germany":"DE","United Kingdom":"GB",
  "France":"FR","Thailand":"TH","Tanzania":"TZ","South Africa":"ZA","Kenya":"KE",
  "Colombia":"CO","Italy":"IT","Myanmar":"MM","South Korea":"KR","Sudan":"SD",
  "Uganda":"UG","Argentina":"AR","Algeria":"DZ","Iraq":"IQ","Afghanistan":"AF",
  "Canada":"CA","Morocco":"MA","Saudi Arabia":"SA","Peru":"PE","Angola":"AO",
  "Mozambique":"MZ","Ghana":"GH","Yemen":"YE","Nepal":"NP","Venezuela":"VE",
  "Madagascar":"MG","Australia":"AU","Cameroon":"CM","Niger":"NE","Sri Lanka":"LK",
  "Mali":"ML","Guatemala":"GT","Senegal":"SN","Cambodia":"KH","Chad":"TD",
  "Somalia":"SO","Zambia":"ZM","Zimbabwe":"ZW","Rwanda":"RW","Guinea":"GN",
  "Burkina Faso":"BF","Malawi":"MW","Bolivia":"BO","Haiti":"HT","Sweden":"SE",
  "Portugal":"PT","Israel":"IL","Sierra Leone":"SL","Liberia":"LR",
  "Papua New Guinea":"PG","Laos":"LA","Vietnam":"VN","Poland":"PL","Spain":"ES",
  "Turkey":"TR","Iran":"IR","Ukraine":"UA","Malaysia":"MY","Côte d'Ivoire":"CI",
  "Ivory Coast":"CI","Uzbekistan":"UZ","Chile":"CL","Netherlands":"NL",
  "Romania":"RO","Ecuador":"EC","Honduras":"HN","Cuba":"CU","New Zealand":"NZ",
  "Norway":"NO","Finland":"FI","Denmark":"DK","Singapore":"SG","Togo":"TG",
  "Benin":"BJ","Central African Republic":"CF","Republic of the Congo":"CG",
  "Congo":"CG","South Sudan":"SS","Burundi":"BI","Nicaragua":"NI",
  "Dominican Republic":"DO","Eritrea":"ER",
};

function resolveCountryCode(props) {
  const iso2 = props?.ISO_A2 || props?.iso_a2 || "";
  if (iso2 && iso2 !== "-99" && ISO_MAP[iso2]) return ISO_MAP[iso2];
  const name = props?.NAME || props?.ADMIN || props?.name || "";
  return NAME_MAP[name] || null;
}

// Full ISO3 → ISO2 map for admin-1 features
const A3_TO_A2 = {
  USA:"US",CHN:"CN",IND:"IN",BRA:"BR",RUS:"RU",AUS:"AU",CAN:"CA",NGA:"NG",IDN:"ID",
  MEX:"MX",ARG:"AR",ZAF:"ZA",COD:"CD",ETH:"ET",PAK:"PK",BGD:"BD",DEU:"DE",GBR:"GB",
  FRA:"FR",THA:"TH",TZA:"TZ",KEN:"KE",COL:"CO",ITA:"IT",MMR:"MM",KOR:"KR",SDN:"SD",
  UGA:"UG",DZA:"DZ",IRQ:"IQ",AFG:"AF",MAR:"MA",SAU:"SA",PER:"PE",AGO:"AO",MOZ:"MZ",
  GHA:"GH",YEM:"YE",NPL:"NP",VEN:"VE",MDG:"MG",CMR:"CM",NER:"NE",LKA:"LK",MLI:"ML",
  GTM:"GT",SEN:"SN",KHM:"KH",TCD:"TD",SOM:"SO",ZMB:"ZM",ZWE:"ZW",RWA:"RW",GIN:"GN",
  BFA:"BF",MWI:"MW",BOL:"BO",HTI:"HT",SWE:"SE",PRT:"PT",ISR:"IL",SLE:"SL",LBR:"LR",
  PNG:"PG",LAO:"LA",VNM:"VN",POL:"PL",ESP:"ES",TUR:"TR",IRN:"IR",UKR:"UA",MYS:"MY",
  CIV:"CI",UZB:"UZ",CHL:"CL",NLD:"NL",ROU:"RO",ECU:"EC",HND:"HN",CUB:"CU",NZL:"NZ",
  NOR:"NO",FIN:"FI",DNK:"DK",SGP:"SG",TGO:"TG",BEN:"BJ",CAF:"CF",COG:"CG",SSD:"SS",
  BDI:"BI",NIC:"NI",DOM:"DO",ERI:"ER",EGY:"EG",PHL:"PH",JPN:"JP",MNG:"MN",KAZ:"KZ",
  UMI:"US",PRK:"KP",SYR:"SY",LBY:"LY",MLT:"MT",GRC:"GR",HRV:"HR",CZE:"CZ",SVK:"SK",
  HUN:"HU",BGR:"BG",SRB:"RS",BIH:"BA",ALB:"AL",MKD:"MK",MDA:"MD",BLR:"BY",LTU:"LT",
  LVA:"LV",EST:"EE",AUT:"AT",CHE:"CH",BEL:"BE",LUX:"LU",IRL:"IE",ISL:"IS",CYP:"CY",
  TUN:"TN",LBN:"LB",JOR:"JO",PSE:"PS",KWT:"KW",QAT:"QA",ARE:"AE",OMN:"OM",BHR:"BH",
  KGZ:"KG",TJK:"TJ",TKM:"TM",AZE:"AZ",GEO:"GE",ARM:"AM",BTN:"BT",MDV:"MV",
  BWA:"BW",NAM:"NA",LSO:"LS",SWZ:"SZ",COM:"KM",MUS:"MU",SYC:"SC",DJI:"DJ",
};

// Risk-board style continent macro-regions per country code
const COUNTRY_MACRO_REGION = {
  US:"North America", CA:"North America", MX:"North America",
  GT:"Central America",HN:"Central America",NI:"Central America",CU:"Central America",
  DO:"Central America",HT:"Central America",
  BR:"South America",AR:"South America",CO:"South America",PE:"South America",
  VE:"South America",CL:"South America",EC:"South America",BO:"South America",
  GB:"Western Europe",FR:"Western Europe",DE:"Western Europe",IT:"Western Europe",
  ES:"Western Europe",PT:"Western Europe",NL:"Western Europe",SE:"Western Europe",
  NO:"Western Europe",FI:"Western Europe",DK:"Western Europe",AT:"Western Europe",
  CH:"Western Europe",IE:"Western Europe",IS:"Western Europe",
  RU:"Eastern Europe",UA:"Eastern Europe",PL:"Eastern Europe",RO:"Eastern Europe",
  BY:"Eastern Europe",RS:"Eastern Europe",BG:"Eastern Europe",SK:"Eastern Europe",
  CZ:"Eastern Europe",HU:"Eastern Europe",HR:"Eastern Europe",
  EG:"North Africa",DZ:"North Africa",MA:"North Africa",TN:"North Africa",LY:"North Africa",
  SA:"Middle East",IQ:"Middle East",IR:"Middle East",TR:"Middle East",YE:"Middle East",
  SY:"Middle East",JO:"Middle East",IL:"Middle East",LB:"Middle East",
  AE:"Middle East",KW:"Middle East",QA:"Middle East",OM:"Middle East",BH:"Middle East",
  NG:"West Africa",GH:"West Africa",SN:"West Africa",ML:"West Africa",
  NE:"West Africa",BF:"West Africa",CI:"West Africa",GN:"West Africa",
  TG:"West Africa",BJ:"West Africa",SL:"West Africa",LR:"West Africa",
  ET:"East Africa",KE:"East Africa",TZ:"East Africa",UG:"East Africa",
  RW:"East Africa",SD:"East Africa",SS:"East Africa",SO:"East Africa",
  ER:"East Africa",BI:"East Africa",MG:"East Africa",MZ:"East Africa",
  CD:"Central Africa",CM:"Central Africa",CF:"Central Africa",CG:"Central Africa",AO:"Central Africa",
  ZA:"Southern Africa",ZM:"Southern Africa",ZW:"Southern Africa",MW:"Southern Africa",
  IN:"South Asia",PK:"South Asia",BD:"South Asia",NP:"South Asia",LK:"South Asia",AF:"South Asia",
  ID:"Southeast Asia",PH:"Southeast Asia",VN:"Southeast Asia",TH:"Southeast Asia",
  MM:"Southeast Asia",MY:"Southeast Asia",KH:"Southeast Asia",LA:"Southeast Asia",SG:"Southeast Asia",
  CN:"East Asia",JP:"East Asia",KR:"East Asia",MN:"East Asia",
  UZ:"Central Asia",KZ:"Central Asia",KG:"Central Asia",TJ:"Central Asia",TM:"Central Asia",
  AU:"Oceania",NZ:"Oceania",PG:"Oceania",
};

// US states → broad risk regions
const US_STATE_TO_REGION = {
  "Maine":"Northeast","New Hampshire":"Northeast","Vermont":"Northeast","Massachusetts":"Northeast",
  "Rhode Island":"Northeast","Connecticut":"Northeast","New York":"Northeast","New Jersey":"Northeast",
  "Pennsylvania":"Northeast","Delaware":"Northeast","Maryland":"Northeast",
  "Virginia":"Southeast","West Virginia":"Southeast","North Carolina":"Southeast","South Carolina":"Southeast",
  "Georgia":"Southeast","Florida":"Southeast","Alabama":"Southeast","Mississippi":"Southeast",
  "Tennessee":"Southeast","Kentucky":"Southeast","Arkansas":"Southeast",
  "Ohio":"Midwest","Indiana":"Midwest","Illinois":"Midwest","Michigan":"Midwest","Wisconsin":"Midwest",
  "Minnesota":"Midwest","Iowa":"Midwest","Missouri":"Midwest","North Dakota":"Midwest","South Dakota":"Midwest",
  "Nebraska":"Midwest","Kansas":"Midwest",
  "Texas":"South Central","Oklahoma":"South Central","Louisiana":"South Central",
  "Montana":"West","Idaho":"West","Wyoming":"West","Colorado":"West","Utah":"West",
  "Nevada":"West","California":"West","Oregon":"West","Washington":"West",
  "Arizona":"Southwest","New Mexico":"Southwest",
  "Alaska":"Alaska","Hawaii":"Hawaii",
};

function resolveAdmin1Code(props) {
  const iso2 = props?.iso_a2 || props?.ISO_A2 || "";
  if (iso2 && iso2 !== "-99" && ISO_MAP[iso2]) return ISO_MAP[iso2];
  const a3 = props?.adm0_a3 || props?.ADM0_A3 || props?.iso_3166_2?.slice(0,3) || "";
  if (a3 && A3_TO_A2[a3]) return A3_TO_A2[a3];
  const cname = props?.admin || props?.ADMIN || props?.sovereignt || "";
  return NAME_MAP[cname] || null;
}

// ── Tooltip builder ────────────────────────────────────────────────────────────
function buildTooltip(data, regionName, isDelta) {
  if (!data) {
    return `<div style="font:12px Inter,sans-serif;padding:2px 0">
      <b style="font-size:13px">${regionName}</b>
      <div style="color:#94a3b8;margin-top:4px;font-size:11px">No prediction data</div>
    </div>`;
  }
  if (isDelta && data.delta !== undefined) {
    const dColor = data.delta > 0 ? "#ef4444" : data.delta < 0 ? "#22c55e" : "#94a3b8";
    return `<div style="font:12px Inter,sans-serif;min-width:190px">
      <b style="font-size:13px;display:block;margin-bottom:6px;border-bottom:1px solid #e2e8f0;padding-bottom:4px">${data.country}</b>
      <table style="width:100%;border-spacing:0 3px;font-size:11px">
        <tr><td style="color:#64748b">Disease</td><td style="font-weight:600;text-align:right">${data.disease}</td></tr>
        <tr><td style="color:#64748b">Scenario A</td><td style="font-weight:700;text-align:right">${(data.riskA ?? 0).toFixed(1)}%</td></tr>
        <tr><td style="color:#64748b">Scenario B</td><td style="font-weight:700;text-align:right">${(data.riskB ?? 0).toFixed(1)}%</td></tr>
        <tr><td style="color:#64748b">Delta</td><td style="font-weight:700;text-align:right;color:${dColor}">${data.delta > 0 ? "+" : ""}${(data.delta ?? 0).toFixed(1)}%</td></tr>
      </table>
    </div>`;
  }
  const rColor = riskToColor(data.risk);
  const tColor = TREND_COLOR[data.trend] || "#94a3b8";
  const isSubRegion = !!data._subRegion;
  return `<div style="font:12px Inter,sans-serif;min-width:205px">
    <b style="font-size:13px;display:block;margin-bottom:2px">${isSubRegion ? data._subRegion : data.country}</b>
    ${isSubRegion
      ? `<div style="font-size:10px;color:#94a3b8;margin-bottom:6px;border-bottom:1px solid #f1f5f9;padding-bottom:4px">${data.country} · ${data.region}</div>`
      : `<div style="font-size:10px;color:#94a3b8;margin-bottom:6px;border-bottom:1px solid #f1f5f9;padding-bottom:4px">${data.region}</div>`}
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
      ${!isSubRegion && data.estimatedCases ? `<tr><td style="color:#64748b">Est. Cases</td><td style="text-align:right;font-weight:600">${fmtNum(data.estimatedCases)}</td></tr>` : ""}
    </table>
    ${!isSubRegion ? `<div style="margin-top:6px;font-size:10px;color:#94a3b8">Click to explore full breakdown →</div>` : ""}
  </div>`;
}

// ── Map layers component ───────────────────────────────────────────────────────
function MapLayers({ countryGeo, admin1Geo, riskMap, isDelta, onCountrySelect, selectedCode, year }) {
  const map = useMap();
  const countryLayerRef = useRef(null);
  const admin1LayerRef = useRef(null);
  const regionBorderLayerRef = useRef(null);

  const OUTLINE = { color: "#111827", weight: 0.5, opacity: 0.65 };
  // No visible border on individual US state polygons
  const OUTLINE_STATE = { color: "#111827", weight: 0, opacity: 0, stroke: false };
  // Thin region-divider border (drawn on top as separate layer)
  const OUTLINE_REGION = { color: "#374151", weight: 0.8, opacity: 0.55 };

  function getUsRegionKey(rawName) {
    if (rawName === "Alaska") return "Alaska";
    if (rawName === "Hawaii") return "Hawaii";
    return US_STATE_TO_REGION[rawName] || "Other";
  }

  function styleCountry(feature) {
    const code = resolveCountryCode(feature.properties);
    const data = code ? riskMap[code] : null;
    let fillColor = "#d1d5db", fillOpacity = 0.20;
    if (data) {
      fillOpacity = 0.78;
      fillColor = isDelta && data.delta !== undefined ? deltaToColor(data.delta) : riskToColor(data.risk);
    }
    return { fillColor, fillOpacity, ...OUTLINE };
  }

  // Style for US state fill — zero border weight so states are seamless within a region
  function styleAdmin1(feature) {
    const countryCode = resolveAdmin1Code(feature.properties);
    if (!countryCode) return { fillOpacity: 0, stroke: false, weight: 0 };
    const countryData = riskMap[countryCode];
    if (!countryData) return { fillColor: "#d1d5db", fillOpacity: 0.15, stroke: false, weight: 0 };

    const rawName = feature.properties?.name || feature.properties?.NAME || "";
    const macroRegion = COUNTRY_MACRO_REGION[countryCode] || "Other";
    const regionKey = countryCode === "US" ? getUsRegionKey(rawName) : macroRegion;
    const subRisk = getSubRegionRisk(countryCode, regionKey, countryData.disease, year, countryData.risk);
    let fillColor;
    if (isDelta && countryData.delta !== undefined) {
      const subDelta = countryData.delta * (0.6 + (subRisk / countryData.risk) * 0.4);
      fillColor = deltaToColor(subDelta);
    } else {
      fillColor = riskToColor(subRisk);
    }
    // No stroke on state polygons — region borders are drawn by regionBorderLayer
    return { fillColor, fillOpacity: 0.78, stroke: false, weight: 0 };
  }

  // Style for region-border overlay — only draws the outline, no fill
  function styleRegionBorder(feature) {
    return { fillOpacity: 0, fill: false, ...OUTLINE_REGION };
  }

  function getRegionData(countryCode, countryData, rawName) {
    if (!countryData) return null;
    const macroRegion = COUNTRY_MACRO_REGION[countryCode] || "Other";
    const regionKey = countryCode === "US" ? getUsRegionKey(rawName) : macroRegion;
    const subRisk = getSubRegionRisk(countryCode, regionKey, countryData.disease, year, countryData.risk);
    return {
      ...countryData,
      risk: Math.round(subRisk * 10) / 10,
      _subRegion: countryCode === "US" ? regionKey : rawName,
    };
  }

  function onEachCountry(feature, layer) {
    const code = resolveCountryCode(feature.properties);
    const data = code ? riskMap[code] : null;
    const name = feature.properties?.NAME || feature.properties?.ADMIN || feature.properties?.name || "Unknown";
    attachInteractions(layer, data, name, styleCountry, feature);
  }

  function onEachAdmin1(feature, layer) {
    const countryCode = resolveAdmin1Code(feature.properties);
    if (!countryCode) return;
    const countryData = riskMap[countryCode];
    const rawName = feature.properties?.name || feature.properties?.NAME || "";
    const macroRegion = COUNTRY_MACRO_REGION[countryCode] || "Other";
    const regionKey = countryCode === "US" ? getUsRegionKey(rawName) : macroRegion;
    const subData = getRegionData(countryCode, countryData, rawName);
    // Tooltip label: show region name for US, state name for others
    const tooltipLabel = countryCode === "US" ? regionKey : rawName;
    attachInteractions(layer, subData, tooltipLabel, styleAdmin1, feature);
  }

  function attachInteractions(layer, data, name, styleFn, feature) {
    layer.on({
      mouseover(e) {
        // For US states: highlight fill only, no border flash
        e.target.setStyle({ fillOpacity: data ? 0.95 : 0.30 });
        e.target.bringToFront();
        const html = buildTooltip(data, name, isDelta);
        layer.bindTooltip(html, {
          sticky: false, direction: "top", offset: [0, -4], opacity: 1,
          className: "iris-tooltip",
        }).openTooltip(e.latlng);
      },
      mouseout(e) {
        e.target.setStyle(styleFn(feature));
        e.target.closeTooltip();
      },
      click() {
        if (data && !data._subRegion) onCountrySelect?.(data);
      },
    });
  }

  useEffect(() => {
    if (!countryGeo || !map) return;
    if (countryLayerRef.current) map.removeLayer(countryLayerRef.current);
    const layer = L.geoJSON(countryGeo, { style: styleCountry, onEachFeature: onEachCountry });
    layer.addTo(map);
    countryLayerRef.current = layer;
    return () => { if (countryLayerRef.current) map.removeLayer(countryLayerRef.current); };
  }, [countryGeo, riskMap, isDelta, admin1Geo, selectedCode]);

  useEffect(() => {
    if (!admin1Geo || !map) return;

    // Remove old layers
    if (admin1LayerRef.current) map.removeLayer(admin1LayerRef.current);
    if (regionBorderLayerRef.current) map.removeLayer(regionBorderLayerRef.current);

    // Layer 1: filled state polygons, no stroke
    const fillLayer = L.geoJSON(admin1Geo, { style: styleAdmin1, onEachFeature: onEachAdmin1 });
    fillLayer.addTo(map);
    admin1LayerRef.current = fillLayer;

    // Layer 2: thin region-border outlines on top (stroke only, no fill)
    // We only show outlines for US features — other countries are handled by countryLayer
    const usFeatures = {
      type: "FeatureCollection",
      features: admin1Geo.features.filter(f => {
        const a3 = f.properties?.adm0_a3 || f.properties?.ADM0_A3 || "";
        return a3 === "USA";
      }),
    };
    const regionBorderLayer = L.geoJSON(usFeatures, { style: styleRegionBorder });
    regionBorderLayer.addTo(map);
    regionBorderLayerRef.current = regionBorderLayer;

    if (countryLayerRef.current) countryLayerRef.current.setStyle(styleCountry);

    return () => {
      if (admin1LayerRef.current) map.removeLayer(admin1LayerRef.current);
      if (regionBorderLayerRef.current) map.removeLayer(regionBorderLayerRef.current);
    };
  }, [admin1Geo, riskMap, isDelta, selectedCode, year]);

  return null;
}

// ── GeoJSON cache ─────────────────────────────────────────────────────────────
let cachedCountryGeo = null;
let cachedAdmin1Geo = null;

const COUNTRY_GEO_URL = "https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson";
const ADMIN1_GEO_URL = "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson";

export default function GlobalMap({ predictions, onCountrySelect, selectedCountry, isDelta = false, year = 2026 }) {
  const [countryGeo, setCountryGeo] = useState(cachedCountryGeo);
  const [admin1Geo, setAdmin1Geo] = useState(cachedAdmin1Geo);
  const [loading, setLoading] = useState(!cachedCountryGeo);

  useEffect(() => {
    const fetchCountry = cachedCountryGeo
      ? Promise.resolve(cachedCountryGeo)
      : fetch(COUNTRY_GEO_URL).then(r => r.json()).then(d => { cachedCountryGeo = d; return d; });
    const fetchAdmin1 = cachedAdmin1Geo
      ? Promise.resolve(cachedAdmin1Geo)
      : fetch(ADMIN1_GEO_URL).then(r => r.json()).then(d => { cachedAdmin1Geo = d; return d; });
    Promise.all([fetchCountry, fetchAdmin1])
      .then(([cGeo, aGeo]) => { setCountryGeo(cGeo); setAdmin1Geo(aGeo); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const riskMap = {};
  for (const p of (predictions || [])) riskMap[p.countryCode] = p;
  const selectedCode = selectedCountry?.countryCode || null;

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden relative">
      <style>{`
        .iris-tooltip {
          background: white !important;
          border: 1px solid #e2e8f0 !important;
          border-radius: 10px !important;
          box-shadow: 0 8px 24px rgba(0,0,0,0.13) !important;
          padding: 10px 13px !important;
          font-family: Inter, sans-serif !important;
          max-width: 250px !important;
        }
        .iris-tooltip::before,
        .leaflet-tooltip-top.iris-tooltip::before { display: none !important; }
      `}</style>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 z-20 rounded-xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-7 h-7 border-[3px] border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading map data…</p>
          </div>
        </div>
      )}

      <div style={{ height: 480 }}>
        <MapContainer
          center={[15, 10]} zoom={2}
          className="h-full w-full"
          scrollWheelZoom minZoom={2} maxZoom={8}
          style={{ background: "#edf2f7" }}
        >
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" opacity={0.30} />
          <TileLayer url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png" opacity={0.55} />
          <MapLayers
            countryGeo={countryGeo}
            admin1Geo={admin1Geo}
            riskMap={riskMap}
            isDelta={isDelta}
            onCountrySelect={onCountrySelect}
            selectedCode={selectedCode}
            year={year}
          />
        </MapContainer>
      </div>

      <div className="absolute bottom-4 left-4 bg-white/96 backdrop-blur-sm rounded-xl p-3 z-[1000] shadow-md border border-slate-200">
        {!isDelta ? (
          <>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Outbreak Risk</p>
            <div className="h-3 w-32 rounded-full mb-1.5" style={{ background: "linear-gradient(to right,#4ade80,#fbbf24,#f97316,#dc2626)" }} />
            <div className="flex justify-between text-[9px] text-slate-400 w-32 mb-1.5">
              <span>Low</span><span>Moderate</span><span>Critical</span>
            </div>
            <div className="text-[9px] text-slate-400">
              <span style={{ color: "#ef4444" }}>↑</span> Rising &nbsp;
              <span style={{ color: "#22c55e" }}>↓</span> Falling &nbsp;
              <span style={{ color: "#94a3b8" }}>→</span> Stable
            </div>
          </>
        ) : (
          <>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Risk Delta</p>
            <div className="space-y-1">
              {[["#22c55e","Decrease >4%"],["#86efac","Decrease 1–4%"],["#94a3b8","Stable ±1%"],["#fbbf24","Increase 1–4%"],["#f97316","Increase 4–10%"],["#ef4444","Increase >10%"]].map(([c,l]) => (
                <div key={l} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
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