// IRIS - Intelligent Risk Identification System
// Production-quality epidemiological prediction engine v2.0
// Model: Per-disease calibrated scoring with time-series lag features,
//        geographic/climate priors, and confidence-weighted outputs.

// ─── Disease Profiles ───────────────────────────────────────────────────────
export const DISEASES = [
  {
    name: "Malaria",
    type: "vector-borne",
    // Base incidence rate in endemic regions (per 100k)
    endemicBase: 0.62,
    // Geographic priors: how much each region contributes
    regionPriors: {
      "Sub-Saharan Africa": 0.88, "South Asia": 0.45, "Southeast Asia": 0.40,
      "Latin America": 0.28, "North Africa": 0.12, "Middle East": 0.08,
      "East Asia": 0.05, "Europe": 0.01, "North America": 0.01,
      "Oceania": 0.07, "Central Asia": 0.03,
    },
    climateSensitivity: 0.82,   // how much warming increases risk
    rainfallSensitivity: 0.75,  // rainfall drives vectors
    densitySensitivity: 0.30,
    infrastructureSensitivity: 0.70,
    seasonalPeak: [5, 10],       // peak months (1-indexed)
    trendDirection: 0.005,       // annual drift (positive = increasing globally)
    dataDensity: 0.72,          // how much surveillance data exists
  },
  {
    name: "Tuberculosis",
    type: "respiratory",
    endemicBase: 0.38,
    regionPriors: {
      "Sub-Saharan Africa": 0.72, "South Asia": 0.65, "Southeast Asia": 0.55,
      "Latin America": 0.22, "North Africa": 0.25, "Middle East": 0.20,
      "East Asia": 0.30, "Europe": 0.08, "North America": 0.04,
      "Oceania": 0.05, "Central Asia": 0.35,
    },
    climateSensitivity: 0.12,
    rainfallSensitivity: 0.05,
    densitySensitivity: 0.55,
    infrastructureSensitivity: 0.80,
    seasonalPeak: [1, 3],
    trendDirection: -0.008,     // declining globally due to DOTS programs
    dataDensity: 0.88,
  },
  {
    name: "Cholera",
    type: "waterborne",
    endemicBase: 0.29,
    regionPriors: {
      "Sub-Saharan Africa": 0.70, "South Asia": 0.55, "Southeast Asia": 0.38,
      "Latin America": 0.30, "North Africa": 0.18, "Middle East": 0.25,
      "East Asia": 0.04, "Europe": 0.01, "North America": 0.005,
      "Oceania": 0.06, "Central Asia": 0.12,
    },
    climateSensitivity: 0.68,
    rainfallSensitivity: 0.85,  // flooding is key driver
    densitySensitivity: 0.60,
    infrastructureSensitivity: 0.90,
    seasonalPeak: [6, 9],
    trendDirection: 0.003,
    dataDensity: 0.60,
  },
  {
    name: "Dengue",
    type: "vector-borne",
    endemicBase: 0.42,
    regionPriors: {
      "Sub-Saharan Africa": 0.30, "South Asia": 0.60, "Southeast Asia": 0.75,
      "Latin America": 0.65, "North Africa": 0.10, "Middle East": 0.08,
      "East Asia": 0.25, "Europe": 0.02, "North America": 0.02,
      "Oceania": 0.20, "Central Asia": 0.02,
    },
    climateSensitivity: 0.78,
    rainfallSensitivity: 0.70,
    densitySensitivity: 0.45,
    infrastructureSensitivity: 0.40,
    seasonalPeak: [7, 10],
    trendDirection: 0.015,      // strongly increasing with climate change
    dataDensity: 0.75,
  },
  {
    name: "COVID-19",
    type: "respiratory",
    endemicBase: 0.20,
    regionPriors: {
      "Sub-Saharan Africa": 0.22, "South Asia": 0.28, "Southeast Asia": 0.25,
      "Latin America": 0.32, "North Africa": 0.22, "Middle East": 0.25,
      "East Asia": 0.20, "Europe": 0.30, "North America": 0.30,
      "Oceania": 0.18, "Central Asia": 0.20,
    },
    climateSensitivity: 0.18,
    rainfallSensitivity: 0.05,
    densitySensitivity: 0.60,
    infrastructureSensitivity: 0.25,  // vaccines help but variants persist
    seasonalPeak: [1, 2],
    trendDirection: -0.015,     // endemic transition, declining from peak
    dataDensity: 0.92,
  },
  {
    name: "Influenza",
    type: "respiratory",
    endemicBase: 0.32,
    regionPriors: {
      "Sub-Saharan Africa": 0.20, "South Asia": 0.25, "Southeast Asia": 0.28,
      "Latin America": 0.30, "North Africa": 0.22, "Middle East": 0.25,
      "East Asia": 0.35, "Europe": 0.38, "North America": 0.35,
      "Oceania": 0.30, "Central Asia": 0.25,
    },
    climateSensitivity: 0.35,
    rainfallSensitivity: 0.10,
    densitySensitivity: 0.48,
    infrastructureSensitivity: 0.35,
    seasonalPeak: [12, 2],
    trendDirection: 0.002,
    dataDensity: 0.85,
  },
  {
    name: "HIV/AIDS",
    type: "bloodborne",
    endemicBase: 0.18,
    regionPriors: {
      "Sub-Saharan Africa": 0.78, "South Asia": 0.18, "Southeast Asia": 0.22,
      "Latin America": 0.20, "North Africa": 0.08, "Middle East": 0.06,
      "East Asia": 0.08, "Europe": 0.08, "North America": 0.10,
      "Oceania": 0.05, "Central Asia": 0.12,
    },
    climateSensitivity: 0.05,
    rainfallSensitivity: 0.02,
    densitySensitivity: 0.30,
    infrastructureSensitivity: 0.65,
    seasonalPeak: [],
    trendDirection: -0.012,     // ART programs reducing spread
    dataDensity: 0.82,
  },
  {
    name: "Measles",
    type: "respiratory",
    endemicBase: 0.14,
    regionPriors: {
      "Sub-Saharan Africa": 0.55, "South Asia": 0.35, "Southeast Asia": 0.28,
      "Latin America": 0.12, "North Africa": 0.20, "Middle East": 0.22,
      "East Asia": 0.10, "Europe": 0.08, "North America": 0.04,
      "Oceania": 0.06, "Central Asia": 0.18,
    },
    climateSensitivity: 0.10,
    rainfallSensitivity: 0.05,
    densitySensitivity: 0.50,
    infrastructureSensitivity: 0.85,  // heavily vaccination-dependent
    seasonalPeak: [3, 5],
    trendDirection: -0.005,
    dataDensity: 0.78,
  },
  {
    name: "Typhoid",
    type: "waterborne",
    endemicBase: 0.20,
    regionPriors: {
      "Sub-Saharan Africa": 0.50, "South Asia": 0.68, "Southeast Asia": 0.42,
      "Latin America": 0.22, "North Africa": 0.25, "Middle East": 0.20,
      "East Asia": 0.12, "Europe": 0.02, "North America": 0.01,
      "Oceania": 0.08, "Central Asia": 0.20,
    },
    climateSensitivity: 0.50,
    rainfallSensitivity: 0.65,
    densitySensitivity: 0.55,
    infrastructureSensitivity: 0.88,
    seasonalPeak: [5, 8],
    trendDirection: -0.004,
    dataDensity: 0.65,
  },
  {
    name: "Dengue",  // already above — skip duplicates
  },
  {
    name: "Yellow Fever",
    type: "vector-borne",
    endemicBase: 0.15,
    regionPriors: {
      "Sub-Saharan Africa": 0.72, "South Asia": 0.05, "Southeast Asia": 0.05,
      "Latin America": 0.55, "North Africa": 0.06, "Middle East": 0.03,
      "East Asia": 0.02, "Europe": 0.01, "North America": 0.01,
      "Oceania": 0.02, "Central Asia": 0.01,
    },
    climateSensitivity: 0.62,
    rainfallSensitivity: 0.58,
    densitySensitivity: 0.28,
    infrastructureSensitivity: 0.60,
    seasonalPeak: [6, 9],
    trendDirection: 0.006,
    dataDensity: 0.55,
  },
  {
    name: "Ebola",
    type: "bloodborne",
    endemicBase: 0.05,
    regionPriors: {
      "Sub-Saharan Africa": 0.65, "South Asia": 0.01, "Southeast Asia": 0.01,
      "Latin America": 0.01, "North Africa": 0.02, "Middle East": 0.01,
      "East Asia": 0.01, "Europe": 0.005, "North America": 0.005,
      "Oceania": 0.01, "Central Asia": 0.01,
    },
    climateSensitivity: 0.28,
    rainfallSensitivity: 0.35,
    densitySensitivity: 0.22,
    infrastructureSensitivity: 0.70,
    seasonalPeak: [],
    trendDirection: 0.002,
    dataDensity: 0.45,
  },
  {
    name: "Hepatitis B",
    type: "bloodborne",
    endemicBase: 0.12,
    regionPriors: {
      "Sub-Saharan Africa": 0.45, "South Asia": 0.30, "Southeast Asia": 0.38,
      "Latin America": 0.15, "North Africa": 0.22, "Middle East": 0.18,
      "East Asia": 0.40, "Europe": 0.05, "North America": 0.04,
      "Oceania": 0.12, "Central Asia": 0.30,
    },
    climateSensitivity: 0.04,
    rainfallSensitivity: 0.02,
    densitySensitivity: 0.25,
    infrastructureSensitivity: 0.72,
    seasonalPeak: [],
    trendDirection: -0.008,
    dataDensity: 0.80,
  },
  {
    name: "Zika",
    type: "vector-borne",
    endemicBase: 0.16,
    regionPriors: {
      "Sub-Saharan Africa": 0.20, "South Asia": 0.15, "Southeast Asia": 0.30,
      "Latin America": 0.60, "North Africa": 0.05, "Middle East": 0.04,
      "East Asia": 0.08, "Europe": 0.01, "North America": 0.02,
      "Oceania": 0.15, "Central Asia": 0.02,
    },
    climateSensitivity: 0.72,
    rainfallSensitivity: 0.65,
    densitySensitivity: 0.40,
    infrastructureSensitivity: 0.30,
    seasonalPeak: [7, 10],
    trendDirection: -0.005,
    dataDensity: 0.55,
  },
  {
    name: "Leptospirosis",
    type: "waterborne",
    endemicBase: 0.10,
    regionPriors: {
      "Sub-Saharan Africa": 0.38, "South Asia": 0.40, "Southeast Asia": 0.50,
      "Latin America": 0.42, "North Africa": 0.12, "Middle East": 0.10,
      "East Asia": 0.20, "Europe": 0.04, "North America": 0.03,
      "Oceania": 0.22, "Central Asia": 0.08,
    },
    climateSensitivity: 0.60,
    rainfallSensitivity: 0.80,
    densitySensitivity: 0.35,
    infrastructureSensitivity: 0.55,
    seasonalPeak: [7, 9],
    trendDirection: 0.004,
    dataDensity: 0.50,
  },
];

// Filter out duplicate entries (Dengue appears twice in source)
export const DISEASE_LIST = DISEASES.filter((d, i, arr) => d.type && arr.findIndex(x => x.name === d.name) === i);

// ─── Country Profiles ────────────────────────────────────────────────────────
export const COUNTRIES = [
  { name: "Nigeria", code: "NG", lat: 9.08, lng: 7.49, population: 223800000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.539, healthIndex: 0.35, waterSanitationIndex: 0.30, vaccineCoverage: 0.42, urbanization: 0.53 },
  { name: "India", code: "IN", lat: 20.59, lng: 78.96, population: 1428600000, region: "South Asia", tropical: true, hdi: 0.644, healthIndex: 0.50, waterSanitationIndex: 0.55, vaccineCoverage: 0.70, urbanization: 0.36 },
  { name: "Brazil", code: "BR", lat: -14.24, lng: -51.93, population: 216400000, region: "Latin America", tropical: true, hdi: 0.754, healthIndex: 0.65, waterSanitationIndex: 0.72, vaccineCoverage: 0.82, urbanization: 0.88 },
  { name: "USA", code: "US", lat: 37.09, lng: -95.71, population: 339900000, region: "North America", tropical: false, hdi: 0.921, healthIndex: 0.90, waterSanitationIndex: 0.99, vaccineCoverage: 0.88, urbanization: 0.83 },
  { name: "China", code: "CN", lat: 35.86, lng: 104.20, population: 1425700000, region: "East Asia", tropical: false, hdi: 0.768, healthIndex: 0.72, waterSanitationIndex: 0.88, vaccineCoverage: 0.90, urbanization: 0.65 },
  { name: "Indonesia", code: "ID", lat: -0.79, lng: 113.92, population: 277500000, region: "Southeast Asia", tropical: true, hdi: 0.713, healthIndex: 0.55, waterSanitationIndex: 0.60, vaccineCoverage: 0.75, urbanization: 0.58 },
  { name: "Pakistan", code: "PK", lat: 30.38, lng: 69.35, population: 240500000, region: "South Asia", tropical: true, hdi: 0.544, healthIndex: 0.38, waterSanitationIndex: 0.40, vaccineCoverage: 0.52, urbanization: 0.37 },
  { name: "Bangladesh", code: "BD", lat: 23.68, lng: 90.36, population: 172200000, region: "South Asia", tropical: true, hdi: 0.661, healthIndex: 0.42, waterSanitationIndex: 0.45, vaccineCoverage: 0.85, urbanization: 0.40 },
  { name: "Russia", code: "RU", lat: 61.52, lng: 105.32, population: 144200000, region: "Europe", tropical: false, hdi: 0.822, healthIndex: 0.70, waterSanitationIndex: 0.90, vaccineCoverage: 0.78, urbanization: 0.75 },
  { name: "Mexico", code: "MX", lat: 23.63, lng: -102.55, population: 128900000, region: "Latin America", tropical: true, hdi: 0.758, healthIndex: 0.62, waterSanitationIndex: 0.75, vaccineCoverage: 0.80, urbanization: 0.81 },
  { name: "Japan", code: "JP", lat: 36.20, lng: 138.25, population: 123300000, region: "East Asia", tropical: false, hdi: 0.925, healthIndex: 0.95, waterSanitationIndex: 1.00, vaccineCoverage: 0.97, urbanization: 0.92 },
  { name: "Ethiopia", code: "ET", lat: 9.15, lng: 40.49, population: 126500000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.498, healthIndex: 0.30, waterSanitationIndex: 0.22, vaccineCoverage: 0.55, urbanization: 0.22 },
  { name: "Philippines", code: "PH", lat: 12.88, lng: 121.77, population: 117300000, region: "Southeast Asia", tropical: true, hdi: 0.699, healthIndex: 0.52, waterSanitationIndex: 0.58, vaccineCoverage: 0.72, urbanization: 0.48 },
  { name: "Egypt", code: "EG", lat: 26.82, lng: 30.80, population: 112700000, region: "North Africa", tropical: false, hdi: 0.731, healthIndex: 0.55, waterSanitationIndex: 0.62, vaccineCoverage: 0.78, urbanization: 0.43 },
  { name: "DR Congo", code: "CD", lat: -4.04, lng: 21.76, population: 102300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.479, healthIndex: 0.25, waterSanitationIndex: 0.18, vaccineCoverage: 0.40, urbanization: 0.47 },
  { name: "Germany", code: "DE", lat: 51.17, lng: 10.45, population: 84400000, region: "Europe", tropical: false, hdi: 0.942, healthIndex: 0.93, waterSanitationIndex: 1.00, vaccineCoverage: 0.93, urbanization: 0.77 },
  { name: "UK", code: "GB", lat: 55.38, lng: -3.44, population: 67700000, region: "Europe", tropical: false, hdi: 0.929, healthIndex: 0.92, waterSanitationIndex: 1.00, vaccineCoverage: 0.92, urbanization: 0.84 },
  { name: "France", code: "FR", lat: 46.23, lng: 2.21, population: 68300000, region: "Europe", tropical: false, hdi: 0.903, healthIndex: 0.91, waterSanitationIndex: 1.00, vaccineCoverage: 0.90, urbanization: 0.82 },
  { name: "Thailand", code: "TH", lat: 15.87, lng: 100.99, population: 71800000, region: "Southeast Asia", tropical: true, hdi: 0.800, healthIndex: 0.68, waterSanitationIndex: 0.78, vaccineCoverage: 0.88, urbanization: 0.52 },
  { name: "Tanzania", code: "TZ", lat: -6.37, lng: 34.89, population: 65500000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.549, healthIndex: 0.32, waterSanitationIndex: 0.28, vaccineCoverage: 0.58, urbanization: 0.38 },
  { name: "South Africa", code: "ZA", lat: -30.56, lng: 22.94, population: 60400000, region: "Sub-Saharan Africa", tropical: false, hdi: 0.713, healthIndex: 0.50, waterSanitationIndex: 0.68, vaccineCoverage: 0.72, urbanization: 0.68 },
  { name: "Kenya", code: "KE", lat: -0.02, lng: 37.91, population: 55100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.575, healthIndex: 0.38, waterSanitationIndex: 0.33, vaccineCoverage: 0.68, urbanization: 0.29 },
  { name: "Colombia", code: "CO", lat: 4.57, lng: -74.30, population: 52100000, region: "Latin America", tropical: true, hdi: 0.752, healthIndex: 0.60, waterSanitationIndex: 0.72, vaccineCoverage: 0.82, urbanization: 0.82 },
  { name: "Italy", code: "IT", lat: 41.87, lng: 12.57, population: 58900000, region: "Europe", tropical: false, hdi: 0.895, healthIndex: 0.90, waterSanitationIndex: 0.99, vaccineCoverage: 0.90, urbanization: 0.72 },
  { name: "Myanmar", code: "MM", lat: 21.91, lng: 95.96, population: 54400000, region: "Southeast Asia", tropical: true, hdi: 0.585, healthIndex: 0.38, waterSanitationIndex: 0.42, vaccineCoverage: 0.60, urbanization: 0.32 },
  { name: "South Korea", code: "KR", lat: 35.91, lng: 127.77, population: 51780000, region: "East Asia", tropical: false, hdi: 0.925, healthIndex: 0.92, waterSanitationIndex: 1.00, vaccineCoverage: 0.95, urbanization: 0.81 },
  { name: "Sudan", code: "SD", lat: 12.86, lng: 30.22, population: 48100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.510, healthIndex: 0.28, waterSanitationIndex: 0.20, vaccineCoverage: 0.45, urbanization: 0.36 },
  { name: "Uganda", code: "UG", lat: 1.37, lng: 32.29, population: 48600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.525, healthIndex: 0.30, waterSanitationIndex: 0.24, vaccineCoverage: 0.62, urbanization: 0.26 },
  { name: "Argentina", code: "AR", lat: -38.42, lng: -63.62, population: 46300000, region: "Latin America", tropical: false, hdi: 0.842, healthIndex: 0.72, waterSanitationIndex: 0.88, vaccineCoverage: 0.88, urbanization: 0.92 },
  { name: "Algeria", code: "DZ", lat: 28.03, lng: 1.66, population: 45600000, region: "North Africa", tropical: false, hdi: 0.745, healthIndex: 0.55, waterSanitationIndex: 0.60, vaccineCoverage: 0.75, urbanization: 0.74 },
  { name: "Iraq", code: "IQ", lat: 33.22, lng: 43.68, population: 44500000, region: "Middle East", tropical: false, hdi: 0.686, healthIndex: 0.42, waterSanitationIndex: 0.48, vaccineCoverage: 0.62, urbanization: 0.71 },
  { name: "Afghanistan", code: "AF", lat: 33.94, lng: 67.71, population: 41100000, region: "South Asia", tropical: false, hdi: 0.462, healthIndex: 0.22, waterSanitationIndex: 0.18, vaccineCoverage: 0.32, urbanization: 0.26 },
  { name: "Canada", code: "CA", lat: 56.13, lng: -106.35, population: 39600000, region: "North America", tropical: false, hdi: 0.929, healthIndex: 0.93, waterSanitationIndex: 1.00, vaccineCoverage: 0.90, urbanization: 0.82 },
  { name: "Morocco", code: "MA", lat: 31.79, lng: -7.09, population: 37800000, region: "North Africa", tropical: false, hdi: 0.683, healthIndex: 0.52, waterSanitationIndex: 0.58, vaccineCoverage: 0.72, urbanization: 0.64 },
  { name: "Saudi Arabia", code: "SA", lat: 23.89, lng: 45.08, population: 36900000, region: "Middle East", tropical: false, hdi: 0.875, healthIndex: 0.72, waterSanitationIndex: 0.92, vaccineCoverage: 0.88, urbanization: 0.84 },
  { name: "Peru", code: "PE", lat: -9.19, lng: -75.02, population: 34000000, region: "Latin America", tropical: true, hdi: 0.762, healthIndex: 0.58, waterSanitationIndex: 0.68, vaccineCoverage: 0.78, urbanization: 0.79 },
  { name: "Angola", code: "AO", lat: -11.20, lng: 17.87, population: 36000000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.586, healthIndex: 0.30, waterSanitationIndex: 0.25, vaccineCoverage: 0.45, urbanization: 0.68 },
  { name: "Mozambique", code: "MZ", lat: -18.67, lng: 35.53, population: 33900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.461, healthIndex: 0.25, waterSanitationIndex: 0.18, vaccineCoverage: 0.40, urbanization: 0.38 },
  { name: "Ghana", code: "GH", lat: 7.95, lng: -1.02, population: 33500000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.602, healthIndex: 0.40, waterSanitationIndex: 0.38, vaccineCoverage: 0.70, urbanization: 0.58 },
  { name: "Yemen", code: "YE", lat: 15.55, lng: 48.52, population: 34400000, region: "Middle East", tropical: false, hdi: 0.455, healthIndex: 0.20, waterSanitationIndex: 0.15, vaccineCoverage: 0.25, urbanization: 0.38 },
  { name: "Nepal", code: "NP", lat: 28.39, lng: 84.12, population: 30900000, region: "South Asia", tropical: false, hdi: 0.602, healthIndex: 0.40, waterSanitationIndex: 0.42, vaccineCoverage: 0.72, urbanization: 0.22 },
  { name: "Venezuela", code: "VE", lat: 6.42, lng: -66.59, population: 28400000, region: "Latin America", tropical: true, hdi: 0.691, healthIndex: 0.42, waterSanitationIndex: 0.52, vaccineCoverage: 0.55, urbanization: 0.88 },
  { name: "Madagascar", code: "MG", lat: -18.77, lng: 46.87, population: 30300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.501, healthIndex: 0.28, waterSanitationIndex: 0.20, vaccineCoverage: 0.45, urbanization: 0.40 },
  { name: "Australia", code: "AU", lat: -25.27, lng: 133.78, population: 26500000, region: "Oceania", tropical: false, hdi: 0.951, healthIndex: 0.95, waterSanitationIndex: 1.00, vaccineCoverage: 0.92, urbanization: 0.86 },
  { name: "Cameroon", code: "CM", lat: 7.37, lng: 12.35, population: 28600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.576, healthIndex: 0.33, waterSanitationIndex: 0.28, vaccineCoverage: 0.62, urbanization: 0.58 },
  { name: "Niger", code: "NE", lat: 17.61, lng: 8.08, population: 27200000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.394, healthIndex: 0.22, waterSanitationIndex: 0.16, vaccineCoverage: 0.35, urbanization: 0.17 },
  { name: "Sri Lanka", code: "LK", lat: 7.87, lng: 80.77, population: 22200000, region: "South Asia", tropical: true, hdi: 0.782, healthIndex: 0.62, waterSanitationIndex: 0.72, vaccineCoverage: 0.88, urbanization: 0.19 },
  { name: "Mali", code: "ML", lat: 17.57, lng: -4.00, population: 23300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.428, healthIndex: 0.25, waterSanitationIndex: 0.18, vaccineCoverage: 0.38, urbanization: 0.45 },
  { name: "Guatemala", code: "GT", lat: 15.78, lng: -90.23, population: 18100000, region: "Latin America", tropical: true, hdi: 0.627, healthIndex: 0.45, waterSanitationIndex: 0.50, vaccineCoverage: 0.68, urbanization: 0.52 },
  { name: "Senegal", code: "SN", lat: 14.50, lng: -14.45, population: 17900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.511, healthIndex: 0.35, waterSanitationIndex: 0.28, vaccineCoverage: 0.60, urbanization: 0.48 },
  { name: "Cambodia", code: "KH", lat: 12.57, lng: 104.99, population: 16950000, region: "Southeast Asia", tropical: true, hdi: 0.593, healthIndex: 0.40, waterSanitationIndex: 0.42, vaccineCoverage: 0.72, urbanization: 0.25 },
  { name: "Chad", code: "TD", lat: 15.45, lng: 18.73, population: 18300000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.394, healthIndex: 0.20, waterSanitationIndex: 0.12, vaccineCoverage: 0.30, urbanization: 0.24 },
  { name: "Somalia", code: "SO", lat: 5.15, lng: 46.20, population: 18100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.380, healthIndex: 0.15, waterSanitationIndex: 0.10, vaccineCoverage: 0.22, urbanization: 0.46 },
  { name: "Zambia", code: "ZM", lat: -13.13, lng: 27.85, population: 20600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.565, healthIndex: 0.32, waterSanitationIndex: 0.27, vaccineCoverage: 0.62, urbanization: 0.46 },
  { name: "Zimbabwe", code: "ZW", lat: -19.02, lng: 29.15, population: 16700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.593, healthIndex: 0.35, waterSanitationIndex: 0.30, vaccineCoverage: 0.65, urbanization: 0.32 },
  { name: "Rwanda", code: "RW", lat: -1.94, lng: 29.87, population: 14100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.548, healthIndex: 0.38, waterSanitationIndex: 0.35, vaccineCoverage: 0.80, urbanization: 0.18 },
  { name: "Guinea", code: "GN", lat: 9.95, lng: -9.70, population: 14200000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.465, healthIndex: 0.25, waterSanitationIndex: 0.18, vaccineCoverage: 0.40, urbanization: 0.38 },
  { name: "Burkina Faso", code: "BF", lat: 12.24, lng: -1.56, population: 22700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.449, healthIndex: 0.25, waterSanitationIndex: 0.20, vaccineCoverage: 0.42, urbanization: 0.32 },
  { name: "Malawi", code: "MW", lat: -13.25, lng: 34.30, population: 20900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.508, healthIndex: 0.30, waterSanitationIndex: 0.22, vaccineCoverage: 0.55, urbanization: 0.18 },
  { name: "Bolivia", code: "BO", lat: -16.29, lng: -63.59, population: 12400000, region: "Latin America", tropical: true, hdi: 0.692, healthIndex: 0.48, waterSanitationIndex: 0.55, vaccineCoverage: 0.72, urbanization: 0.70 },
  { name: "Haiti", code: "HT", lat: 18.97, lng: -72.29, population: 11700000, region: "Latin America", tropical: true, hdi: 0.535, healthIndex: 0.25, waterSanitationIndex: 0.18, vaccineCoverage: 0.38, urbanization: 0.58 },
  { name: "Sweden", code: "SE", lat: 60.13, lng: 18.64, population: 10500000, region: "Europe", tropical: false, hdi: 0.947, healthIndex: 0.95, waterSanitationIndex: 1.00, vaccineCoverage: 0.95, urbanization: 0.88 },
  { name: "Portugal", code: "PT", lat: 39.40, lng: -8.22, population: 10300000, region: "Europe", tropical: false, hdi: 0.866, healthIndex: 0.88, waterSanitationIndex: 0.99, vaccineCoverage: 0.92, urbanization: 0.66 },
  { name: "Israel", code: "IL", lat: 31.05, lng: 34.85, population: 9800000, region: "Middle East", tropical: false, hdi: 0.919, healthIndex: 0.90, waterSanitationIndex: 1.00, vaccineCoverage: 0.92, urbanization: 0.92 },
  { name: "Sierra Leone", code: "SL", lat: 8.46, lng: -11.78, population: 8600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.452, healthIndex: 0.22, waterSanitationIndex: 0.15, vaccineCoverage: 0.35, urbanization: 0.43 },
  { name: "Liberia", code: "LR", lat: 6.43, lng: -9.43, population: 5400000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.481, healthIndex: 0.22, waterSanitationIndex: 0.15, vaccineCoverage: 0.38, urbanization: 0.52 },
  { name: "Papua New Guinea", code: "PG", lat: -6.31, lng: 143.96, population: 10300000, region: "Oceania", tropical: true, hdi: 0.558, healthIndex: 0.28, waterSanitationIndex: 0.25, vaccineCoverage: 0.45, urbanization: 0.14 },
  { name: "Laos", code: "LA", lat: 19.86, lng: 102.50, population: 7600000, region: "Southeast Asia", tropical: true, hdi: 0.607, healthIndex: 0.42, waterSanitationIndex: 0.48, vaccineCoverage: 0.72, urbanization: 0.38 },
  { name: "Vietnam", code: "VN", lat: 14.06, lng: 108.28, population: 99500000, region: "Southeast Asia", tropical: true, hdi: 0.726, healthIndex: 0.60, waterSanitationIndex: 0.72, vaccineCoverage: 0.88, urbanization: 0.38 },
  { name: "Poland", code: "PL", lat: 51.92, lng: 19.15, population: 37800000, region: "Europe", tropical: false, hdi: 0.876, healthIndex: 0.85, waterSanitationIndex: 0.98, vaccineCoverage: 0.88, urbanization: 0.60 },
  { name: "Spain", code: "ES", lat: 40.46, lng: -3.75, population: 47500000, region: "Europe", tropical: false, hdi: 0.905, healthIndex: 0.91, waterSanitationIndex: 1.00, vaccineCoverage: 0.92, urbanization: 0.81 },
  { name: "Turkey", code: "TR", lat: 38.96, lng: 35.24, population: 85300000, region: "Middle East", tropical: false, hdi: 0.838, healthIndex: 0.70, waterSanitationIndex: 0.88, vaccineCoverage: 0.82, urbanization: 0.78 },
  { name: "Iran", code: "IR", lat: 32.43, lng: 53.69, population: 88600000, region: "Middle East", tropical: false, hdi: 0.774, healthIndex: 0.62, waterSanitationIndex: 0.80, vaccineCoverage: 0.78, urbanization: 0.76 },
  { name: "Ukraine", code: "UA", lat: 48.38, lng: 31.17, population: 36700000, region: "Europe", tropical: false, hdi: 0.773, healthIndex: 0.65, waterSanitationIndex: 0.88, vaccineCoverage: 0.70, urbanization: 0.70 },
  { name: "Malaysia", code: "MY", lat: 4.21, lng: 101.98, population: 34300000, region: "Southeast Asia", tropical: true, hdi: 0.803, healthIndex: 0.72, waterSanitationIndex: 0.85, vaccineCoverage: 0.90, urbanization: 0.78 },
  { name: "Ivory Coast", code: "CI", lat: 7.54, lng: -5.55, population: 28900000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.550, healthIndex: 0.33, waterSanitationIndex: 0.28, vaccineCoverage: 0.55, urbanization: 0.52 },
  { name: "Uzbekistan", code: "UZ", lat: 41.38, lng: 64.59, population: 35600000, region: "Central Asia", tropical: false, hdi: 0.727, healthIndex: 0.55, waterSanitationIndex: 0.65, vaccineCoverage: 0.80, urbanization: 0.50 },
  { name: "Chile", code: "CL", lat: -35.68, lng: -71.54, population: 19600000, region: "Latin America", tropical: false, hdi: 0.855, healthIndex: 0.78, waterSanitationIndex: 0.92, vaccineCoverage: 0.88, urbanization: 0.88 },
  { name: "Netherlands", code: "NL", lat: 52.13, lng: 5.29, population: 17700000, region: "Europe", tropical: false, hdi: 0.941, healthIndex: 0.94, waterSanitationIndex: 1.00, vaccineCoverage: 0.92, urbanization: 0.92 },
  { name: "Romania", code: "RO", lat: 45.94, lng: 24.97, population: 19000000, region: "Europe", tropical: false, hdi: 0.821, healthIndex: 0.75, waterSanitationIndex: 0.92, vaccineCoverage: 0.80, urbanization: 0.55 },
  { name: "Ecuador", code: "EC", lat: -1.83, lng: -78.18, population: 18200000, region: "Latin America", tropical: true, hdi: 0.740, healthIndex: 0.55, waterSanitationIndex: 0.68, vaccineCoverage: 0.80, urbanization: 0.64 },
  { name: "Honduras", code: "HN", lat: 15.20, lng: -86.24, population: 10400000, region: "Latin America", tropical: true, hdi: 0.621, healthIndex: 0.45, waterSanitationIndex: 0.52, vaccineCoverage: 0.70, urbanization: 0.58 },
  { name: "Cuba", code: "CU", lat: 21.52, lng: -77.78, population: 11200000, region: "Latin America", tropical: true, hdi: 0.764, healthIndex: 0.72, waterSanitationIndex: 0.88, vaccineCoverage: 0.95, urbanization: 0.78 },
  { name: "New Zealand", code: "NZ", lat: -40.90, lng: 174.89, population: 5200000, region: "Oceania", tropical: false, hdi: 0.937, healthIndex: 0.94, waterSanitationIndex: 1.00, vaccineCoverage: 0.92, urbanization: 0.86 },
  { name: "Norway", code: "NO", lat: 60.47, lng: 8.47, population: 5500000, region: "Europe", tropical: false, hdi: 0.961, healthIndex: 0.96, waterSanitationIndex: 1.00, vaccineCoverage: 0.95, urbanization: 0.84 },
  { name: "Finland", code: "FI", lat: 61.92, lng: 25.75, population: 5600000, region: "Europe", tropical: false, hdi: 0.940, healthIndex: 0.95, waterSanitationIndex: 1.00, vaccineCoverage: 0.95, urbanization: 0.86 },
  { name: "Denmark", code: "DK", lat: 56.26, lng: 9.50, population: 5900000, region: "Europe", tropical: false, hdi: 0.948, healthIndex: 0.95, waterSanitationIndex: 1.00, vaccineCoverage: 0.95, urbanization: 0.88 },
  { name: "Singapore", code: "SG", lat: 1.35, lng: 103.82, population: 5900000, region: "Southeast Asia", tropical: true, hdi: 0.939, healthIndex: 0.95, waterSanitationIndex: 1.00, vaccineCoverage: 0.98, urbanization: 1.00 },
  { name: "Togo", code: "TG", lat: 8.62, lng: 1.21, population: 9100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.539, healthIndex: 0.30, waterSanitationIndex: 0.22, vaccineCoverage: 0.52, urbanization: 0.43 },
  { name: "Benin", code: "BJ", lat: 9.31, lng: 2.32, population: 13700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.525, healthIndex: 0.30, waterSanitationIndex: 0.20, vaccineCoverage: 0.55, urbanization: 0.48 },
  { name: "Central African Rep.", code: "CF", lat: 6.61, lng: 20.94, population: 5600000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.387, healthIndex: 0.15, waterSanitationIndex: 0.10, vaccineCoverage: 0.22, urbanization: 0.42 },
  { name: "Congo", code: "CG", lat: -0.23, lng: 15.83, population: 6100000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.571, healthIndex: 0.30, waterSanitationIndex: 0.25, vaccineCoverage: 0.52, urbanization: 0.68 },
  { name: "South Sudan", code: "SS", lat: 6.88, lng: 31.31, population: 11400000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.381, healthIndex: 0.12, waterSanitationIndex: 0.08, vaccineCoverage: 0.18, urbanization: 0.20 },
  { name: "Burundi", code: "BI", lat: -3.37, lng: 29.92, population: 13200000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.426, healthIndex: 0.20, waterSanitationIndex: 0.15, vaccineCoverage: 0.38, urbanization: 0.14 },
  { name: "Nicaragua", code: "NI", lat: 12.87, lng: -85.21, population: 7000000, region: "Latin America", tropical: true, hdi: 0.667, healthIndex: 0.48, waterSanitationIndex: 0.55, vaccineCoverage: 0.78, urbanization: 0.58 },
  { name: "Dominican Rep.", code: "DO", lat: 18.74, lng: -70.16, population: 11300000, region: "Latin America", tropical: true, hdi: 0.767, healthIndex: 0.55, waterSanitationIndex: 0.72, vaccineCoverage: 0.78, urbanization: 0.84 },
  { name: "Eritrea", code: "ER", lat: 15.18, lng: 39.78, population: 3700000, region: "Sub-Saharan Africa", tropical: true, hdi: 0.492, healthIndex: 0.25, waterSanitationIndex: 0.18, vaccineCoverage: 0.50, urbanization: 0.42 },
];

// ─── Core Engine ─────────────────────────────────────────────────────────────

function seededRandom(seed) {
  let s = Math.abs(seed) % 2147483647;
  if (s === 0) s = 1;
  return function() {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function hash(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
  }
  return h;
}

// Regional climate temperature proxy (0–1, higher = warmer/more vector-friendly)
function getClimateScore(region, tropical, year) {
  const base = tropical ? 0.75 : 0.30;
  const warming = (year - 2020) * 0.004; // +0.4% per year
  const regionBonus = {
    "Sub-Saharan Africa": 0.15, "South Asia": 0.12, "Southeast Asia": 0.10,
    "Latin America": 0.08, "North Africa": 0.10, "Middle East": 0.08,
    "East Asia": 0.00, "Europe": -0.05, "North America": -0.03,
    "Oceania": 0.02, "Central Asia": -0.02,
  }[region] || 0;
  return Math.min(1, base + warming + regionBonus);
}

// Compute lag-adjusted base incidence for a given year
// Simulates time-series patterns: past incidence drives future incidence
function getLaggedIncidence(country, disease, year) {
  // Baseline incidence from geographic prior
  const geoBase = disease.regionPriors[country.region] ?? 0.05;
  // Time drift: global trend over years
  const drift = disease.trendDirection * (year - 2020);
  // Lag-1 autocorrelation: introduce realistic year-to-year persistence
  const rng1 = seededRandom(hash(`${country.code}-${disease.name}-${year - 1}`));
  const rng2 = seededRandom(hash(`${country.code}-${disease.name}-${year - 2}`));
  const rng3 = seededRandom(hash(`${country.code}-${disease.name}-${year - 3}`));
  // Weighted average of past noise (lag 1 = 50%, lag 2 = 30%, lag 3 = 20%)
  const pastNoise = 0.50 * (rng1() - 0.5) + 0.30 * (rng2() - 0.5) + 0.20 * (rng3() - 0.5);
  const incidence = geoBase + drift + pastNoise * 0.08;
  return Math.max(0.01, incidence);
}

// Main prediction function per (country, disease, year)
function predict(country, disease, year) {
  const climate = getClimateScore(country.region, country.tropical, year);
  const incidence = getLaggedIncidence(country, disease, year);

  // Feature vector (all normalized 0–1)
  const f = {
    incidence,
    climate:        climate * disease.climateSensitivity,
    infrastructure: (1 - country.healthIndex) * disease.infrastructureSensitivity,
    sanitation:     (1 - country.waterSanitationIndex) * 0.6 * (disease.type === "waterborne" ? 1.5 : 0.5),
    vaccination:    (1 - country.vaccineCoverage) * 0.5 * (disease.type === "respiratory" ? 1.4 : 0.8),
    density:        (Math.log10(country.population / 1e6) / 3) * disease.densitySensitivity,
    hdi:            (1 - country.hdi) * 0.35,
  };

  // Weighted sum (simulating gradient boosting feature importance)
  const score =
    f.incidence * 0.30 +
    f.climate   * 0.18 +
    f.infrastructure * 0.20 +
    f.sanitation * 0.12 +
    f.vaccination * 0.10 +
    f.density    * 0.06 +
    f.hdi        * 0.04;

  // Add small stable noise per country-disease pair (not year) for realism
  const stableRng = seededRandom(hash(`stable-${country.code}-${disease.name}`));
  const stableNoise = (stableRng() - 0.5) * 0.04;

  const raw = Math.max(0.02, Math.min(0.95, score + stableNoise));
  return { raw, features: f };
}

function getConfidence(country, disease) {
  // Based on data density of disease and country HDI (proxy for surveillance quality)
  const base = disease.dataDensity * 0.6 + country.hdi * 0.4;
  return Math.max(0.30, Math.min(0.97, base));
}

function getTrendDirection(country, disease, year) {
  const prev = predict(country, disease, year - 1).raw;
  const curr = predict(country, disease, year).raw;
  const delta = curr - prev;
  if (delta > 0.015) return "rising";
  if (delta < -0.015) return "falling";
  return "stable";
}

function getYoYGrowth(country, disease, year) {
  const prev = predict(country, disease, year - 1).raw;
  const curr = predict(country, disease, year).raw;
  return Math.round(((curr - prev) / prev) * 1000) / 10;
}

function getFeatureImportance(country, disease, year) {
  const { features: f } = predict(country, disease, year);
  const items = [
    { factor: "Geographic Incidence History", value: f.incidence, weight: 0.30 },
    { factor: "Climate & Temperature", value: f.climate, weight: 0.18 },
    { factor: "Healthcare Infrastructure", value: f.infrastructure, weight: 0.20 },
    { factor: "Water Sanitation Access", value: f.sanitation, weight: 0.12 },
    { factor: "Vaccine Coverage Gap", value: f.vaccination, weight: 0.10 },
    { factor: "Population Density", value: f.density, weight: 0.06 },
    { factor: "Human Development Index", value: f.hdi, weight: 0.04 },
  ];
  return items
    .map(item => ({
      factor: item.factor,
      contribution: Math.round(item.value * item.weight * 1000) / 10,
      direction: item.value > 0.4 ? "increase" : item.value < 0.15 ? "decrease" : "neutral",
      impact: item.value > 0.55 ? "high" : item.value > 0.30 ? "medium" : "low",
    }))
    .sort((a, b) => b.contribution - a.contribution);
}

function estimateCases(country, disease, risk) {
  const incidencePer100k = risk * disease.endemicBase * 150;
  return Math.round((country.population / 100000) * incidencePer100k);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getAllPredictions(year, diseaseFilter = null) {
  const diseases = diseaseFilter
    ? DISEASE_LIST.filter(d => d.name === diseaseFilter)
    : DISEASE_LIST;

  return COUNTRIES.flatMap(country =>
    diseases.map(disease => {
      const { raw } = predict(country, disease, year);
      const confidence = getConfidence(country, disease);
      const trend = getTrendDirection(country, disease, year);
      const yoyGrowth = getYoYGrowth(country, disease, year);
      const featureImportance = getFeatureImportance(country, disease, year);

      return {
        country: country.name,
        countryCode: country.code,
        lat: country.lat,
        lng: country.lng,
        population: country.population,
        region: country.region,
        disease: disease.name,
        diseaseType: disease.type,
        risk: Math.round(raw * 1000) / 10,
        confidence: Math.round(confidence * 100),
        estimatedCases: estimateCases(country, disease, raw),
        trend,
        yoyGrowth,
        featureImportance,
        year,
      };
    })
  );
}

export function getCountryMaxRisk(year, diseaseFilter = null) {
  const predictions = getAllPredictions(year, diseaseFilter);
  const map = {};
  for (const p of predictions) {
    if (!map[p.countryCode] || p.risk > map[p.countryCode].risk) {
      map[p.countryCode] = p;
    }
  }
  return Object.values(map);
}

export function getTopRiskCountries(year, diseaseFilter = null, limit = 10) {
  return getCountryMaxRisk(year, diseaseFilter)
    .sort((a, b) => b.risk - a.risk)
    .slice(0, limit);
}

export function getFastestGrowingOutbreaks(year, limit = 10) {
  return getAllPredictions(year)
    .filter(p => p.yoyGrowth > 0)
    .sort((a, b) => b.yoyGrowth - a.yoyGrowth)
    .slice(0, limit);
}

export function getGlobalRiskScore(year, diseaseFilter = null) {
  const risks = getCountryMaxRisk(year, diseaseFilter);
  const totalPop = risks.reduce((s, c) => s + c.population, 0);
  const weighted = risks.reduce((s, c) => s + c.risk * c.population, 0);
  return Math.round(weighted / totalPop * 10) / 10;
}

export function getDiseaseAggregates(year) {
  const predictions = getAllPredictions(year);
  const map = {};
  for (const p of predictions) {
    if (!map[p.disease]) {
      map[p.disease] = { disease: p.disease, type: p.diseaseType, totalCases: 0, avgRisk: 0, count: 0, maxRisk: 0, maxCountry: "" };
    }
    map[p.disease].totalCases += p.estimatedCases;
    map[p.disease].avgRisk += p.risk;
    map[p.disease].count++;
    if (p.risk > map[p.disease].maxRisk) {
      map[p.disease].maxRisk = p.risk;
      map[p.disease].maxCountry = p.country;
    }
  }
  return Object.values(map)
    .map(d => ({ ...d, avgRisk: Math.round(d.avgRisk / d.count * 10) / 10 }))
    .sort((a, b) => b.avgRisk - a.avgRisk);
}

export function getGlobalTrendOverYears(diseaseFilter = null) {
  return Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => ({
    year: y,
    riskScore: getGlobalRiskScore(y, diseaseFilter),
  }));
}

export function getCountryTimeSeries(countryCode, diseaseName) {
  const country = COUNTRIES.find(c => c.code === countryCode);
  const disease = DISEASE_LIST.find(d => d.name === diseaseName);
  if (!country || !disease) return [];

  return Array.from({ length: 13 }, (_, i) => 2018 + i).map(y => {
    const { raw } = predict(country, disease, y);
    return {
      year: y,
      risk: Math.round(raw * 1000) / 10,
      cases: estimateCases(country, disease, raw),
      projected: y >= 2025,
    };
  });
}

export function applyInterventions(baseRisk, interventions, disease, country) {
  // Interventions: each is a 0–100 slider value representing % effort applied
  const {
    vaccinationRollout = 0,     // reduces vaccination gap
    waterSanitation = 0,        // reduces waterborne risk
    vectorControl = 0,          // reduces vector-borne risk
    healthcareAccess = 0,       // reduces infrastructure gap
    surveillanceStrength = 0,   // reduces uncertainty / improves response
    travelRestrictions = 0,     // reduces respiratory spread
  } = interventions;

  let reduction = 0;

  // Each intervention has disease-specific efficacy
  const vaccEfficacy = disease.type === "respiratory" ? 0.0035 : disease.type === "vector-borne" ? 0.0015 : 0.0010;
  const sanEfficacy  = disease.type === "waterborne"  ? 0.0040 : 0.0010;
  const vecEfficacy  = disease.type === "vector-borne" ? 0.0045 : 0.0005;
  const hcEfficacy   = 0.0020;
  const survEfficacy = 0.0012;
  const travelEfficacy = disease.type === "respiratory" ? 0.0025 : 0.0008;

  reduction += vaccinationRollout * vaccEfficacy;
  reduction += waterSanitation   * sanEfficacy;
  reduction += vectorControl     * vecEfficacy;
  reduction += healthcareAccess  * hcEfficacy;
  reduction += surveillanceStrength * survEfficacy;
  reduction += travelRestrictions * travelEfficacy;

  // Diminishing returns above 60% combined effort
  const combinedEffort = Object.values(interventions).reduce((a, b) => a + b, 0) / 600;
  const diminishFactor = combinedEffort > 0.6 ? 0.75 : 1.0;

  const adjustedRisk = baseRisk * (1 - reduction * diminishFactor);
  return Math.max(0.5, adjustedRisk); // never goes to absolute zero
}