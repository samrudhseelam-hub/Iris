import { useEffect, useState, useRef, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { motion } from "framer-motion";
import "leaflet/dist/leaflet.css";

function getRiskColor(risk) {
  if (risk < 15) return "#4ade80";
  if (risk < 25) return "#86efac";
  if (risk < 35) return "#fbbf24";
  if (risk < 50) return "#fb923c";
  if (risk < 65) return "#f87171";
  return "#ef4444";
}

function getRadius(risk, population) {
  const baseRadius = Math.max(4, Math.min(20, Math.sqrt(population / 10000000) * 3));
  const riskMultiplier = 0.7 + (risk / 100) * 0.8;
  return baseRadius * riskMultiplier;
}

function MapUpdater({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, zoom || 3, { duration: 1 });
  }, [center, zoom, map]);
  return null;
}

export default function GlobalMap({ predictions, onCountrySelect, selectedCountry }) {
  const [mapCenter, setMapCenter] = useState([20, 0]);
  const [mapZoom, setMapZoom] = useState(2);

  const handleClick = (pred) => {
    onCountrySelect?.(pred);
    setMapCenter([pred.lat, pred.lng]);
    setMapZoom(4);
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="relative h-[480px] md:h-[560px]">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          className="h-full w-full"
          zoomControl={true}
          scrollWheelZoom={true}
          style={{ background: "hsl(210 20% 96%)" }}
          minZoom={2}
          maxZoom={8}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
            opacity={0.6}
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.4}
          />
          <MapUpdater center={mapCenter} zoom={mapZoom} />

          {predictions.map((pred) => (
            <CircleMarker
              key={pred.countryCode}
              center={[pred.lat, pred.lng]}
              radius={getRadius(pred.risk, pred.population)}
              pathOptions={{
                fillColor: getRiskColor(pred.risk),
                fillOpacity: 0.55,
                color: getRiskColor(pred.risk),
                weight: selectedCountry?.countryCode === pred.countryCode ? 3 : 1.5,
                opacity: selectedCountry?.countryCode === pred.countryCode ? 1 : 0.7,
              }}
              eventHandlers={{
                click: () => handleClick(pred),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -10]}
                opacity={0.97}
              >
                <div className="p-1 min-w-[160px]">
                  <p className="font-semibold text-sm">{pred.country}</p>
                  <div className="mt-1 space-y-0.5 text-xs">
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Disease</span>
                      <span className="font-medium">{pred.disease}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Outbreak Risk</span>
                      <span className="font-bold" style={{ color: getRiskColor(pred.risk) }}>{pred.risk}%</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Est. Cases</span>
                      <span className="font-medium">
                        {pred.estimatedCases >= 1000000
                          ? (pred.estimatedCases / 1000000).toFixed(1) + "M"
                          : (pred.estimatedCases / 1000).toFixed(0) + "K"
                        }
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-gray-500">Confidence</span>
                      <span className="font-medium">{pred.confidence}%</span>
                    </div>
                  </div>
                </div>
              </Tooltip>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 z-[1000] shadow-sm border border-border">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Risk Level</p>
          <div className="flex items-center gap-1.5">
            {[
              { color: "#4ade80", label: "Low" },
              { color: "#fbbf24", label: "Mod" },
              { color: "#fb923c", label: "High" },
              { color: "#ef4444", label: "Crit" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-[10px] text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}