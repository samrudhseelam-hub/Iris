// IRIS - Intelligent Risk Identification System
// Realistic disease outbreak prediction data engine

const DISEASES = [
  { name: "Malaria", type: "vector-borne", baseRate: 0.35, tropicalBias: 0.9, climateSensitivity: 0.8 },
  { name: "Tuberculosis", type: "respiratory", baseRate: 0.25, tropicalBias: 0.3, climateSensitivity: 0.2 },
  { name: "Cholera", type: "waterborne", baseRate: 0.18, tropicalBias: 0.7, climateSensitivity: 0.7 },
  { name: "Dengue", type: "vector-borne", baseRate: 0.28, tropicalBias: 0.85, climateSensitivity: 0.75 },
  { name: "COVID-19", type: "respiratory", baseRate: 0.15, tropicalBias: 0.1, climateSensitivity: 0.15 },
  { name: "Influenza", type: "respiratory", baseRate: 0.20, tropicalBias: 0.1, climateSensitivity: 0.4 },
  { name: "HIV/AIDS", type: "bloodborne", baseRate: 0.12, tropicalBias: 0.4, climateSensitivity: 0.05 },
  { name: "Measles", type: "respiratory", baseRate: 0.10, tropicalBias: 0.3, climateSensitivity: 0.1 },
  { name: "Hepatitis B", type: "bloodborne", baseRate: 0.08, tropicalBias: 0.2, climateSensitivity: 0.05 },
  { name: "Typhoid", type: "waterborne", baseRate: 0.15, tropicalBias: 0.6, climateSensitivity: 0.5 },
  { name: "Zika", type: "vector-borne", baseRate: 0.12, tropicalBias: 0.8, climateSensitivity: 0.7 },
  { name: "Ebola", type: "bloodborne", baseRate: 0.04, tropicalBias: 0.7, climateSensitivity: 0.3 },
  { name: "Yellow Fever", type: "vector-borne", baseRate: 0.10, tropicalBias: 0.85, climateSensitivity: 0.6 },
  { name: "Rabies", type: "zoonotic", baseRate: 0.06, tropicalBias: 0.4, climateSensitivity: 0.15 },
  { name: "Leptospirosis", type: "waterborne", baseRate: 0.08, tropicalBias: 0.6, climateSensitivity: 0.6 },
];

const COUNTRIES = [
  { name: "Nigeria", code: "NG", lat: 9.08, lng: 7.49, population: 223800000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.539, healthIndex: 0.35 },
  { name: "India", code: "IN", lat: 20.59, lng: 78.96, population: 1428600000, region: "South Asia", tropical: true, hdi: 0.644, healthIndex: 0.50 },
  { name: "Brazil", code: "BR", lat: -14.24, lng: -51.93, population: 216400000, region: "Latin America", tropical: true, hdi: 0.754, healthIndex: 0.65 },
  { name: "USA", code: "US", lat: 37.09, lng: -95.71, population: 339900000, region: "North America", tropical: false, hdi: 0.921, healthIndex: 0.90 },
  { name: "China", code: "CN", lat: 35.86, lng: 104.20, population: 1425700000, region: "East Asia", tropical: false, hdi: 0.768, healthIndex: 0.72 },
  { name: "Indonesia", code: "ID", lat: -0.79, lng: 113.92, population: 277500000, region: "Southeast Asia", tropical: true, hdi: 0.713, healthIndex: 0.55 },
  { name: "Pakistan", code: "PK", lat: 30.38, lng: 69.35, population: 240500000, region: "South Asia", tropical: true, hdi: 0.544, healthIndex: 0.38 },
  { name: "Bangladesh", code: "BD", lat: 23.68, lng: 90.36, population: 172200000, region: "South Asia", tropical: true, hdi: 0.661, healthIndex: 0.42 },
  { name: "Russia", code: "RU", lat: 61.52, lng: 105.32, population: 144200000, region: "Europe", tropical: false, hdi: 0.822, healthIndex: 0.70 },
  { name: "Mexico", code: "MX", lat: 23.63, lng: -102.55, population: 128900000, region: "Latin America", tropical: true, hdi: 0.758, healthIndex: 0.62 },
  { name: "Japan", code: "JP", lat: 36.20, lng: 138.25, population: 123300000, region: "East Asia", tropical: false, hdi: 0.925, healthIndex: 0.95 },
  { name: "Ethiopia", code: "ET", lat: 9.15, lng: 40.49, population: 126500000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.498, healthIndex: 0.30 },
  { name: "Philippines", code: "PH", lat: 12.88, lng: 121.77, population: 117300000, region: "Southeast Asia", tropical: true, hdi: 0.699, healthIndex: 0.52 },
  { name: "Egypt", code: "EG", lat: 26.82, lng: 30.80, population: 112700000, region: "North Africa", tropical: false, hdi: 0.731, healthIndex: 0.55 },
  { name: "DR Congo", code: "CD", lat: -4.04, lng: 21.76, population: 102300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.479, healthIndex: 0.25 },
  { name: "Germany", code: "DE", lat: 51.17, lng: 10.45, population: 84400000, region: "Europe", tropical: false, hdi: 0.942, healthIndex: 0.93 },
  { name: "UK", code: "GB", lat: 55.38, lng: -3.44, population: 67700000, region: "Europe", tropical: false, hdi: 0.929, healthIndex: 0.92 },
  { name: "France", code: "FR", lat: 46.23, lng: 2.21, population: 68300000, region: "Europe", tropical: false, hdi: 0.903, healthIndex: 0.91 },
  { name: "Thailand", code: "TH", lat: 15.87, lng: 100.99, population: 71800000, region: "Southeast Asia", tropical: true, hdi: 0.800, healthIndex: 0.68 },
  { name: "Tanzania", code: "TZ", lat: -6.37, lng: 34.89, population: 65500000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.549, healthIndex: 0.32 },
  { name: "South Africa", code: "ZA", lat: -30.56, lng: 22.94, population: 60400000, region: "Sub-Saharan Africa", tropical: false, hdi: 0.713, healthIndex: 0.50 },
  { name: "Kenya", code: "KE", lat: -0.02, lng: 37.91, population: 55100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.575, healthIndex: 0.38 },
  { name: "Colombia", code: "CO", lat: 4.57, lng: -74.30, population: 52100000, region: "Latin America", tropical: true, hdi: 0.752, healthIndex: 0.60 },
  { name: "Italy", code: "IT", lat: 41.87, lng: 12.57, population: 58900000, region: "Europe", tropical: false, hdi: 0.895, healthIndex: 0.90 },
  { name: "Myanmar", code: "MM", lat: 21.91, lng: 95.96, population: 54400000, region: "Southeast Asia", tropical: true, hdi: 0.585, healthIndex: 0.38 },
  { name: "South Korea", code: "KR", lat: 35.91, lng: 127.77, population: 51780000, region: "East Asia", tropical: false, hdi: 0.925, healthIndex: 0.92 },
  { name: "Sudan", code: "SD", lat: 12.86, lng: 30.22, population: 48100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.510, healthIndex: 0.28 },
  { name: "Uganda", code: "UG", lat: 1.37, lng: 32.29, population: 48600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.525, healthIndex: 0.30 },
  { name: "Argentina", code: "AR", lat: -38.42, lng: -63.62, population: 46300000, region: "Latin America", tropical: false, hdi: 0.842, healthIndex: 0.72 },
  { name: "Algeria", code: "DZ", lat: 28.03, lng: 1.66, population: 45600000, region: "North Africa", tropical: false, hdi: 0.745, healthIndex: 0.55 },
  { name: "Iraq", code: "IQ", lat: 33.22, lng: 43.68, population: 44500000, region: "Middle East", tropical: false, hdi: 0.686, healthIndex: 0.42 },
  { name: "Afghanistan", code: "AF", lat: 33.94, lng: 67.71, population: 41100000, region: "South Asia", tropical: false, hdi: 0.462, healthIndex: 0.22 },
  { name: "Canada", code: "CA", lat: 56.13, lng: -106.35, population: 39600000, region: "North America", tropical: false, hdi: 0.929, healthIndex: 0.93 },
  { name: "Morocco", code: "MA", lat: 31.79, lng: -7.09, population: 37800000, region: "North Africa", tropical: false, hdi: 0.683, healthIndex: 0.52 },
  { name: "Saudi Arabia", code: "SA", lat: 23.89, lng: 45.08, population: 36900000, region: "Middle East", tropical: false, hdi: 0.875, healthIndex: 0.72 },
  { name: "Peru", code: "PE", lat: -9.19, lng: -75.02, population: 34000000, region: "Latin America", tropical: true, hdi: 0.762, healthIndex: 0.58 },
  { name: "Angola", code: "AO", lat: -11.20, lng: 17.87, population: 36000000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.586, healthIndex: 0.30 },
  { name: "Mozambique", code: "MZ", lat: -18.67, lng: 35.53, population: 33900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.461, healthIndex: 0.25 },
  { name: "Ghana", code: "GH", lat: 7.95, lng: -1.02, population: 33500000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.602, healthIndex: 0.40 },
  { name: "Yemen", code: "YE", lat: 15.55, lng: 48.52, population: 34400000, region: "Middle East", tropical: false, hdi: 0.455, healthIndex: 0.20 },
  { name: "Nepal", code: "NP", lat: 28.39, lng: 84.12, population: 30900000, region: "South Asia", tropical: false, hdi: 0.602, healthIndex: 0.40 },
  { name: "Venezuela", code: "VE", lat: 6.42, lng: -66.59, population: 28400000, region: "Latin America", tropical: true, hdi: 0.691, healthIndex: 0.42 },
  { name: "Madagascar", code: "MG", lat: -18.77, lng: 46.87, population: 30300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.501, healthIndex: 0.28 },
  { name: "Australia", code: "AU", lat: -25.27, lng: 133.78, population: 26500000, region: "Oceania", tropical: false, hdi: 0.951, healthIndex: 0.95 },
  { name: "Cameroon", code: "CM", lat: 7.37, lng: 12.35, population: 28600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.576, healthIndex: 0.33 },
  { name: "Niger", code: "NE", lat: 17.61, lng: 8.08, population: 27200000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.394, healthIndex: 0.22 },
  { name: "Sri Lanka", code: "LK", lat: 7.87, lng: 80.77, population: 22200000, region: "South Asia", tropical: true, hdi: 0.782, healthIndex: 0.62 },
  { name: "Mali", code: "ML", lat: 17.57, lng: -4.00, population: 23300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.428, healthIndex: 0.25 },
  { name: "Guatemala", code: "GT", lat: 15.78, lng: -90.23, population: 18100000, region: "Latin America", tropical: true, hdi: 0.627, healthIndex: 0.45 },
  { name: "Senegal", code: "SN", lat: 14.50, lng: -14.45, population: 17900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.511, healthIndex: 0.35 },
  { name: "Cambodia", code: "KH", lat: 12.57, lng: 104.99, population: 16950000, region: "Southeast Asia", tropical: true, hdi: 0.593, healthIndex: 0.40 },
  { name: "Chad", code: "TD", lat: 15.45, lng: 18.73, population: 18300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.394, healthIndex: 0.20 },
  { name: "Somalia", code: "SO", lat: 5.15, lng: 46.20, population: 18100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.380, healthIndex: 0.15 },
  { name: "Zambia", code: "ZM", lat: -13.13, lng: 27.85, population: 20600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.565, healthIndex: 0.32 },
  { name: "Zimbabwe", code: "ZW", lat: -19.02, lng: 29.15, population: 16700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.593, healthIndex: 0.35 },
  { name: "Rwanda", code: "RW", lat: -1.94, lng: 29.87, population: 14100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.548, healthIndex: 0.38 },
  { name: "Guinea", code: "GN", lat: 9.95, lng: -9.70, population: 14200000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.465, healthIndex: 0.25 },
  { name: "Burkina Faso", code: "BF", lat: 12.24, lng: -1.56, population: 22700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.449, healthIndex: 0.25 },
  { name: "Malawi", code: "MW", lat: -13.25, lng: 34.30, population: 20900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.508, healthIndex: 0.30 },
  { name: "Bolivia", code: "BO", lat: -16.29, lng: -63.59, population: 12400000, region: "Latin America", tropical: true, hdi: 0.692, healthIndex: 0.48 },
  { name: "Haiti", code: "HT", lat: 18.97, lng: -72.29, population: 11700000, region: "Latin America", tropical: true, hdi: 0.535, healthIndex: 0.25 },
  { name: "Sweden", code: "SE", lat: 60.13, lng: 18.64, population: 10500000, region: "Europe", tropical: false, hdi: 0.947, healthIndex: 0.95 },
  { name: "Portugal", code: "PT", lat: 39.40, lng: -8.22, population: 10300000, region: "Europe", tropical: false, hdi: 0.866, healthIndex: 0.88 },
  { name: "Israel", code: "IL", lat: 31.05, lng: 34.85, population: 9800000, region: "Middle East", tropical: false, hdi: 0.919, healthIndex: 0.90 },
  { name: "Sierra Leone", code: "SL", lat: 8.46, lng: -11.78, population: 8600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.452, healthIndex: 0.22 },
  { name: "Liberia", code: "LR", lat: 6.43, lng: -9.43, population: 5400000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.481, healthIndex: 0.22 },
  { name: "Papua New Guinea", code: "PG", lat: -6.31, lng: 143.96, population: 10300000, region: "Oceania", tropical: true, hdi: 0.558, healthIndex: 0.28 },
  { name: "Laos", code: "LA", lat: 19.86, lng: 102.50, population: 7600000, region: "Southeast Asia", tropical: true, hdi: 0.607, healthIndex: 0.42 },
  { name: "Vietnam", code: "VN", lat: 14.06, lng: 108.28, population: 99500000, region: "Southeast Asia", tropical: true, hdi: 0.726, healthIndex: 0.60 },
  { name: "Poland", code: "PL", lat: 51.92, lng: 19.15, population: 37800000, region: "Europe", tropical: false, hdi: 0.876, healthIndex: 0.85 },
  { name: "Spain", code: "ES", lat: 40.46, lng: -3.75, population: 47500000, region: "Europe", tropical: false, hdi: 0.905, healthIndex: 0.91 },
  { name: "Turkey", code: "TR", lat: 38.96, lng: 35.24, population: 85300000, region: "Middle East", tropical: false, hdi: 0.838, healthIndex: 0.70 },
  { name: "Iran", code: "IR", lat: 32.43, lng: 53.69, population: 88600000, region: "Middle East", tropical: false, hdi: 0.774, healthIndex: 0.62 },
  { name: "Ukraine", code: "UA", lat: 48.38, lng: 31.17, population: 36700000, region: "Europe", tropical: false, hdi: 0.773, healthIndex: 0.65 },
  { name: "Malaysia", code: "MY", lat: 4.21, lng: 101.98, population: 34300000, region: "Southeast Asia", tropical: true, hdi: 0.803, healthIndex: 0.72 },
  { name: "Ivory Coast", code: "CI", lat: 7.54, lng: -5.55, population: 28900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.550, healthIndex: 0.33 },
  { name: "Uzbekistan", code: "UZ", lat: 41.38, lng: 64.59, population: 35600000, region: "Central Asia", tropical: false, hdi: 0.727, healthIndex: 0.55 },
  { name: "Chile", code: "CL", lat: -35.68, lng: -71.54, population: 19600000, region: "Latin America", tropical: false, hdi: 0.855, healthIndex: 0.78 },
  { name: "Netherlands", code: "NL", lat: 52.13, lng: 5.29, population: 17700000, region: "Europe", tropical: false, hdi: 0.941, healthIndex: 0.94 },
  { name: "Romania", code: "RO", lat: 45.94, lng: 24.97, population: 19000000, region: "Europe", tropical: false, hdi: 0.821, healthIndex: 0.75 },
  { name: "Ecuador", code: "EC", lat: -1.83, lng: -78.18, population: 18200000, region: "Latin America", tropical: true, hdi: 0.740, healthIndex: 0.55 },
  { name: "Honduras", code: "HN", lat: 15.20, lng: -86.24, population: 10400000, region: "Latin America", tropical: true, hdi: 0.621, healthIndex: 0.45 },
  { name: "Cuba", code: "CU", lat: 21.52, lng: -77.78, population: 11200000, region: "Latin America", tropical: true, hdi: 0.764, healthIndex: 0.72 },
  { name: "New Zealand", code: "NZ", lat: -40.90, lng: 174.89, population: 5200000, region: "Oceania", tropical: false, hdi: 0.937, healthIndex: 0.94 },
  { name: "Norway", code: "NO", lat: 60.47, lng: 8.47, population: 5500000, region: "Europe", tropical: false, hdi: 0.961, healthIndex: 0.96 },
  { name: "Finland", code: "FI", lat: 61.92, lng: 25.75, population: 5600000, region: "Europe", tropical: false, hdi: 0.940, healthIndex: 0.95 },
  { name: "Denmark", code: "DK", lat: 56.26, lng: 9.50, population: 5900000, region: "Europe", tropical: false, hdi: 0.948, healthIndex: 0.95 },
  { name: "Singapore", code: "SG", lat: 1.35, lng: 103.82, population: 5900000, region: "Southeast Asia", tropical: true, hdi: 0.939, healthIndex: 0.95 },
  { name: "Togo", code: "TG", lat: 8.62, lng: 1.21, population: 9100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.539, healthIndex: 0.30 },
  { name: "Benin", code: "BJ", lat: 9.31, lng: 2.32, population: 13700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.525, healthIndex: 0.30 },
  { name: "Central African Rep.", code: "CF", lat: 6.61, lng: 20.94, population: 5600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.387, healthIndex: 0.15 },
  { name: "Congo", code: "CG", lat: -0.23, lng: 15.83, population: 6100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.571, healthIndex: 0.30 },
  { name: "Eritrea", code: "ER", lat: 15.18, lng: 39.78, population: 3700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.492, healthIndex: 0.25 },
  { name: "Nicaragua", code: "NI", lat: 12.87, lng: -85.21, population: 7000000, region: "Latin America", tropical: true, hdi: 0.667, healthIndex: 0.48 },
  { name: "Dominican Rep.", code: "DO", lat: 18.74, lng: -70.16, population: 11300000, region: "Latin America", tropical: true, hdi: 0.767, healthIndex: 0.55 },
  { name: "South Sudan", code: "SS", lat: 6.88, lng: 31.31, population: 11400000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.381, healthIndex: 0.12 },
  { name: "Burundi", code: "BI", lat: -3.37, lng: 29.92, population: 13200000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.426, healthIndex: 0.20 },
];

// Seeded random for consistency
function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function computeRisk(country, disease, year, yearOffset = 0) {
  const seed = hashCode(`${country.code}-${disease.name}-${year + yearOffset}`);
  const rng = seededRandom(Math.abs(seed));

  // Base risk from disease prevalence
  let risk = disease.baseRate;

  // Tropical bias
  if (country.tropical) {
    risk += disease.tropicalBias * 0.25;
  } else {
    risk -= disease.tropicalBias * 0.08;
  }

  // Health infrastructure factor (lower HDI = higher risk)
  const healthFactor = (1 - country.healthIndex) * 0.3;
  risk += healthFactor;

  // Population density effect
  const popFactor = Math.log10(country.population) / 10 * 0.08;
  risk += popFactor;

  // Climate sensitivity with year progression (warming trend)
  const climateEffect = disease.climateSensitivity * (0.01 * (year - 2020 + yearOffset));
  if (country.tropical) {
    risk += climateEffect;
  }

  // Random variation (simulating model uncertainty)
  const noise = (rng() - 0.5) * 0.15;
  risk += noise;

  // Year-over-year trend
  const trend = (rng() - 0.45) * 0.05 * (yearOffset);
  risk += trend;

  // Clamp
  risk = Math.max(0.02, Math.min(0.95, risk));

  return risk;
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return hash;
}

function computeConfidence(country, disease) {
  // Higher HDI countries have more data → higher confidence
  let confidence = 0.5 + country.hdi * 0.35;
  // Respiratory diseases have more surveillance
  if (disease.type === "respiratory") confidence += 0.08;
  // Rare diseases have lower confidence
  if (disease.baseRate < 0.1) confidence -= 0.1;
  return Math.max(0.3, Math.min(0.98, confidence));
}

function estimateCases(country, disease, risk) {
  const incidenceRate = risk * disease.baseRate * 0.001;
  return Math.round(country.population * incidenceRate);
}

function getFeatureImportance(country, disease) {
  const factors = [];
  
  if (country.tropical && disease.tropicalBias > 0.5) {
    factors.push({ factor: "Tropical climate", impact: "high", direction: "increase" });
  }
  if (country.healthIndex < 0.4) {
    factors.push({ factor: "Limited health infrastructure", impact: "high", direction: "increase" });
  }
  if (country.healthIndex > 0.8) {
    factors.push({ factor: "Strong health infrastructure", impact: "high", direction: "decrease" });
  }
  if (country.population > 100000000) {
    factors.push({ factor: "Large population", impact: "medium", direction: "increase" });
  }
  if (disease.climateSensitivity > 0.5 && country.tropical) {
    factors.push({ factor: "Climate change vulnerability", impact: "medium", direction: "increase" });
  }
  if (disease.type === "vector-borne" && country.tropical) {
    factors.push({ factor: "Vector-borne transmission", impact: "high", direction: "increase" });
  }
  if (disease.type === "waterborne" && country.healthIndex < 0.5) {
    factors.push({ factor: "Water sanitation challenges", impact: "medium", direction: "increase" });
  }
  if (country.hdi > 0.85) {
    factors.push({ factor: "High vaccination coverage", impact: "medium", direction: "decrease" });
  }

  if (factors.length === 0) {
    factors.push({ factor: "Baseline epidemiological patterns", impact: "low", direction: "neutral" });
  }

  return factors.slice(0, 5);
}

export function getAllPredictions(year, diseaseFilter = null) {
  const predictions = [];
  const diseases = diseaseFilter 
    ? DISEASES.filter(d => d.name === diseaseFilter)
    : DISEASES;

  for (const country of COUNTRIES) {
    for (const disease of diseases) {
      const risk = computeRisk(country, disease, year);
      const confidence = computeConfidence(country, disease);
      const cases = estimateCases(country, disease, risk);
      const features = getFeatureImportance(country, disease);

      predictions.push({
        country: country.name,
        countryCode: country.code,
        lat: country.lat,
        lng: country.lng,
        population: country.population,
        region: country.region,
        disease: disease.name,
        diseaseType: disease.type,
        risk: Math.round(risk * 1000) / 10,
        confidence: Math.round(confidence * 100),
        estimatedCases: cases,
        featureImportance: features,
        year,
      });
    }
  }

  return predictions;
}

export function getCountryMaxRisk(year, diseaseFilter = null) {
  const predictions = getAllPredictions(year, diseaseFilter);
  const countryMap = {};

  for (const p of predictions) {
    if (!countryMap[p.countryCode] || p.risk > countryMap[p.countryCode].risk) {
      countryMap[p.countryCode] = p;
    }
  }

  return Object.values(countryMap);
}

export function getTopRiskCountries(year, diseaseFilter = null, limit = 10) {
  const countryRisks = getCountryMaxRisk(year, diseaseFilter);
  return countryRisks.sort((a, b) => b.risk - a.risk).slice(0, limit);
}

export function getDiseaseTrends(countryCode, diseaseName) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const disease = DISEASES.find(d => d.name === diseaseName);
  if (!country || !disease) return [];

  const trends = [];
  for (let y = 2018; y <= 2030; y++) {
    const risk = computeRisk(country, disease, y);
    trends.push({
      year: y,
      risk: Math.round(risk * 1000) / 10,
      cases: estimateCases(country, disease, risk),
    });
  }
  return trends;
}

export function getGlobalRiskScore(year, diseaseFilter = null) {
  const countryRisks = getCountryMaxRisk(year, diseaseFilter);
  const totalPop = countryRisks.reduce((s, c) => s + c.population, 0);
  const weightedRisk = countryRisks.reduce((s, c) => s + c.risk * c.population, 0);
  return Math.round(weightedRisk / totalPop * 10) / 10;
}

export function getDiseaseAggregates(year) {
  const predictions = getAllPredictions(year);
  const diseaseMap = {};

  for (const p of predictions) {
    if (!diseaseMap[p.disease]) {
      diseaseMap[p.disease] = { disease: p.disease, type: p.diseaseType, totalCases: 0, avgRisk: 0, count: 0, maxRisk: 0, maxCountry: "" };
    }
    diseaseMap[p.disease].totalCases += p.estimatedCases;
    diseaseMap[p.disease].avgRisk += p.risk;
    diseaseMap[p.disease].count++;
    if (p.risk > diseaseMap[p.disease].maxRisk) {
      diseaseMap[p.disease].maxRisk = p.risk;
      diseaseMap[p.disease].maxCountry = p.country;
    }
  }

  return Object.values(diseaseMap).map(d => ({
    ...d,
    avgRisk: Math.round(d.avgRisk / d.count * 10) / 10,
  })).sort((a, b) => b.avgRisk - a.avgRisk);
}

export function getGlobalTrendOverYears(diseaseFilter = null) {
  const trends = [];
  for (let y = 2020; y <= 2030; y++) {
    trends.push({
      year: y,
      riskScore: getGlobalRiskScore(y, diseaseFilter),
    });
  }
  return trends;
}

export { DISEASES, COUNTRIES };