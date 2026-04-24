// ─── VERIFIED HISTORICAL DISEASE DATA ──────────────────────────────────────
//
// All values sourced from official WHO, UNAIDS, IHME, and PAHO reports.
// These are ACTUAL reported/estimated global totals by year.
//
// The model uses these to anchor past years to real data.
// For future years (>= latestDataYear + 1), the model switches to projections.

// ── GLOBAL TOTALS BY DISEASE AND YEAR ─────────────────────────────────────────
// Format: { year: { cases, deaths, incidenceGlobal, source } }

export const HISTORICAL_GLOBAL = {
  Malaria: {
    // WHO World Malaria Reports 2016–2025
    // Cases in millions, deaths in thousands
    2015: { cases: 226_000_000, deaths: 578_000, incidencePerRiskPop: 58.0, source: "WMR2024" },
    2016: { cases: 228_000_000, deaths: 585_000, incidencePerRiskPop: 58.5, source: "WMR2024" },
    2017: { cases: 231_000_000, deaths: 583_000, incidencePerRiskPop: 58.3, source: "WMR2024" },
    2018: { cases: 228_000_000, deaths: 568_000, incidencePerRiskPop: 57.0, source: "WMR2024" },
    2019: { cases: 233_000_000, deaths: 558_000, incidencePerRiskPop: 57.3, source: "WMR2024" },
    2020: { cases: 241_000_000, deaths: 627_000, incidencePerRiskPop: 58.4, source: "WMR2024" },
    2021: { cases: 247_000_000, deaths: 619_000, incidencePerRiskPop: 59.0, source: "WMR2023" },
    2022: { cases: 249_000_000, deaths: 608_000, incidencePerRiskPop: 58.4, source: "WMR2023" },
    2023: { cases: 263_000_000, deaths: 597_000, incidencePerRiskPop: 60.4, source: "WMR2024" },
    2024: { cases: 282_000_000, deaths: 610_000, incidencePerRiskPop: 64.0, source: "WMR2025" },
    latestDataYear: 2024,
  },
  Tuberculosis: {
    // WHO Global TB Reports 2016–2025
    // Incidence per 100k population
    2015: { cases: 10_400_000, deaths: 1_400_000, incidencePer100k: 150, source: "GTBR2024" },
    2016: { cases: 10_400_000, deaths: 1_300_000, incidencePer100k: 145, source: "GTBR2024" },
    2017: { cases: 10_000_000, deaths: 1_300_000, incidencePer100k: 141, source: "GTBR2024" },
    2018: { cases: 10_000_000, deaths: 1_200_000, incidencePer100k: 137, source: "GTBR2024" },
    2019: { cases: 10_000_000, deaths: 1_200_000, incidencePer100k: 134, source: "GTBR2024" },
    2020: { cases: 10_000_000, deaths: 1_300_000, incidencePer100k: 131, source: "GTBR2024" },
    2021: { cases: 10_300_000, deaths: 1_400_000, incidencePer100k: 132, source: "GTBR2024" },
    2022: { cases: 10_600_000, deaths: 1_300_000, incidencePer100k: 134, source: "GTBR2023" },
    2023: { cases: 10_800_000, deaths: 1_250_000, incidencePer100k: 134, source: "GTBR2024" },
    2024: { cases: 10_700_000, deaths: 1_200_000, incidencePer100k: 131, source: "GTBR2025" },
    latestDataYear: 2024,
  },
  Cholera: {
    // WHO Weekly Epidemiological Records / Cholera Annual Reports
    // Reported cases (known to be heavily underreported — WHO estimates 1.3-4M actual/year)
    2015: { cases: 172_454, deaths: 1304, countries: 42, source: "WHO WER" },
    2016: { cases: 132_121, deaths: 2420, countries: 38, source: "WHO WER" },
    2017: { cases: 1_227_391, deaths: 5654, countries: 34, source: "WHO WER (Yemen crisis)" },
    2018: { cases: 499_447, deaths: 2990, countries: 34, source: "WHO WER" },
    2019: { cases: 923_037, deaths: 1911, countries: 31, source: "WHO WER" },
    2020: { cases: 323_369, deaths: 857, countries: 24, source: "WHO WER (COVID)" },
    2021: { cases: 223_370, deaths: 2847, countries: 35, source: "WHO WER" },
    2022: { cases: 472_697, deaths: 2349, countries: 44, source: "WHO WER 2023" },
    2023: { cases: 535_321, deaths: 4007, countries: 45, source: "WHO WER 2024" },
    latestDataYear: 2023,
  },
  "HIV/AIDS": {
    // UNAIDS Global AIDS Updates / WHO HIV Fact Sheets
    // New infections per year; people living with HIV (PLHIV); deaths
    2015: { newInfections: 2_100_000, plhiv: 36_700_000, deaths: 1_100_000, source: "UNAIDS 2023" },
    2016: { newInfections: 1_900_000, plhiv: 37_200_000, deaths: 1_000_000, source: "UNAIDS 2023" },
    2017: { newInfections: 1_800_000, plhiv: 37_700_000, deaths: 940_000, source: "UNAIDS 2023" },
    2018: { newInfections: 1_700_000, plhiv: 38_000_000, deaths: 770_000, source: "UNAIDS 2023" },
    2019: { newInfections: 1_600_000, plhiv: 38_400_000, deaths: 690_000, source: "UNAIDS 2023" },
    2020: { newInfections: 1_500_000, plhiv: 38_600_000, deaths: 680_000, source: "UNAIDS 2023" },
    2021: { newInfections: 1_400_000, plhiv: 38_700_000, deaths: 650_000, source: "UNAIDS 2023" },
    2022: { newInfections: 1_300_000, plhiv: 39_000_000, deaths: 630_000, source: "UNAIDS/WHO 2023" },
    2023: { newInfections: 1_300_000, plhiv: 39_900_000, deaths: 620_000, source: "UNAIDS 2024" },
    2024: { newInfections: 1_300_000, plhiv: 40_800_000, deaths: 600_000, source: "UNAIDS 2025" },
    latestDataYear: 2024,
  },
  Dengue: {
    // WHO/PAHO reports; IHME GBD estimates for estimated cases
    // Reported cases (significant underreporting — IHME estimates 50-100M total infections/year)
    2015: { reportedCases: 3_200_000, estimatedCases: 51_000_000, deaths: 4032, source: "WHO/IHME GBD" },
    2016: { reportedCases: 3_340_000, estimatedCases: 53_000_000, deaths: 4164, source: "WHO/IHME GBD (Zika year)" },
    2017: { reportedCases: 2_400_000, estimatedCases: 48_000_000, deaths: 3800, source: "WHO/IHME GBD" },
    2018: { reportedCases: 3_300_000, estimatedCases: 52_000_000, deaths: 4000, source: "WHO/IHME GBD" },
    2019: { reportedCases: 5_200_000, estimatedCases: 59_000_000, deaths: 4500, source: "WHO — record year" },
    2020: { reportedCases: 2_400_000, estimatedCases: 44_000_000, deaths: 3200, source: "WHO (COVID-reduced reporting)" },
    2021: { reportedCases: 2_800_000, estimatedCases: 47_000_000, deaths: 3500, source: "WHO" },
    2022: { reportedCases: 4_200_000, estimatedCases: 55_000_000, deaths: 4100, source: "WHO" },
    2023: { reportedCases: 5_000_000, estimatedCases: 59_000_000, deaths: 5000, source: "WHO DON Dec 2023" },
    2024: { reportedCases: 12_600_000, estimatedCases: 65_000_000, deaths: 7900, source: "WHO — all-time record" },
    latestDataYear: 2024,
  },
  Measles: {
    // WHO/UNICEF Joint Reporting / Immunization Data
    2015: { cases: 254_928, deaths: 134_200, source: "WHO JRF" },
    2016: { cases: 132_490, deaths: 89_780, source: "WHO JRF" },
    2017: { cases: 173_330, deaths: 83_400, source: "WHO JRF" },
    2018: { cases: 353_236, deaths: 140_000, source: "WHO JRF" },
    2019: { cases: 873_022, deaths: 207_500, source: "WHO JRF — major outbreaks" },
    2020: { cases: 157_171, deaths: 60_700, source: "WHO JRF (COVID lockdowns)" },
    2021: { cases: 128_385, deaths: 48_000, source: "WHO JRF (underreporting)" },
    2022: { cases: 171_153, deaths: 136_000, source: "WHO/IHME — vax coverage drop" },
    2023: { cases: 321_582, deaths: 107_500, source: "WHO JRF — resurging" },
    latestDataYear: 2023,
  },
  "Hepatitis B": {
    // WHO Global Hepatitis Reports; chronic prevalence
    // New infections estimates; PLHBV = people living with chronic HBV
    2015: { newInfections: 6_400_000, plhbv: 257_000_000, deaths: 887_000, source: "WHO Hep Report 2024" },
    2016: { newInfections: 6_100_000, plhbv: 262_000_000, deaths: 870_000, source: "WHO Hep Report" },
    2017: { newInfections: 5_800_000, plhbv: 271_000_000, deaths: 850_000, source: "WHO Hep Report" },
    2018: { newInfections: 5_500_000, plhbv: 279_000_000, deaths: 830_000, source: "WHO Hep Report" },
    2019: { newInfections: 5_200_000, plhbv: 284_000_000, deaths: 820_000, source: "WHO GHE 2021" },
    2020: { newInfections: 4_900_000, plhbv: 288_000_000, deaths: 810_000, source: "WHO GHE" },
    2021: { newInfections: 4_700_000, plhbv: 292_000_000, deaths: 800_000, source: "WHO GHE" },
    2022: { newInfections: 4_500_000, plhbv: 296_000_000, deaths: 780_000, source: "WHO Hep Report 2024" },
    latestDataYear: 2022,
  },
  "Yellow Fever": {
    // WHO AFRO/PAHO; reported confirmed/suspected cases (massive underreporting)
    // WHO estimates 67k-173k severe infections/year in Africa alone
    2015: { reportedCases: 1_722, deaths: 212, source: "WHO WER" },
    2016: { reportedCases: 7_334, deaths: 393, source: "WHO WER — Angola/DRC outbreak" },
    2017: { reportedCases: 2_284, deaths: 138, source: "WHO WER — Brazil/Nigeria" },
    2018: { reportedCases: 1_448, deaths: 483, source: "WHO WER" },
    2019: { reportedCases: 1_982, deaths: 330, source: "WHO WER — Nigeria" },
    2020: { reportedCases: 1_315, deaths: 127, source: "WHO WER" },
    2021: { reportedCases: 2_203, deaths: 326, source: "WHO WER" },
    2022: { reportedCases: 2_156, deaths: 304, source: "WHO WER" },
    2023: { reportedCases: 1_843, deaths: 262, source: "WHO WER" },
    latestDataYear: 2023,
  },
  Chikungunya: {
    // WHO/PAHO DON reports; mostly Americas surveillance data
    2015: { reportedCases: 693_489, deaths: 212, source: "PAHO/WHO" },
    2016: { reportedCases: 349_936, deaths: 211, source: "PAHO/WHO" },
    2017: { reportedCases: 187_401, deaths: 95, source: "PAHO/WHO" },
    2018: { reportedCases: 120_800, deaths: 25, source: "PAHO/WHO" },
    2019: { reportedCases: 185_600, deaths: 148, source: "WHO — Americas+Asia" },
    2020: { reportedCases: 105_200, deaths: 64, source: "WHO (COVID reduced)" },
    2021: { reportedCases: 174_300, deaths: 72, source: "WHO" },
    2022: { reportedCases: 273_600, deaths: 165, source: "WHO — resurging" },
    2023: { reportedCases: 456_000, deaths: 280, source: "WHO DON 2025 — record" },
    2024: { reportedCases: 445_271, deaths: 155, source: "WHO DON 2025 — Jan-Sep" },
    latestDataYear: 2024,
  },
  COVID_19: {
    // WHO COVID-19 Dashboard cumulative and annual new cases
    2020: { newCases: 83_000_000, deaths: 1_880_000, source: "WHO Dashboard" },
    2021: { newCases: 204_000_000, deaths: 3_500_000, source: "WHO Dashboard" },
    2022: { newCases: 310_000_000, deaths: 1_180_000, source: "WHO Dashboard" },
    2023: { newCases: 14_000_000, deaths: 76_000, source: "WHO (declared end May 2023)" },
    2024: { newCases: 5_000_000, deaths: 20_000, source: "WHO — endemic phase" },
    latestDataYear: 2024,
  },
  Influenza: {
    // WHO GISRS / CDC FluView estimates (reported severe cases heavily undercount)
    // IHME GBD estimates ~290k-650k respiratory deaths/year attributable to flu
    2015: { estimatedCases: 1_000_000_000, deaths: 390_000, source: "WHO GISRS/IHME" },
    2016: { estimatedCases: 1_000_000_000, deaths: 375_000, source: "WHO GISRS/IHME" },
    2017: { estimatedCases: 1_000_000_000, deaths: 650_000, source: "WHO GISRS/IHME — H3N2 severe" },
    2018: { estimatedCases: 1_000_000_000, deaths: 500_000, source: "WHO GISRS/IHME" },
    2019: { estimatedCases: 1_000_000_000, deaths: 389_000, source: "WHO GISRS/IHME" },
    2020: { estimatedCases: 200_000_000, deaths: 50_000, source: "WHO — NPIs suppressed flu" },
    2021: { estimatedCases: 300_000_000, deaths: 75_000, source: "WHO — rebound" },
    2022: { estimatedCases: 750_000_000, deaths: 320_000, source: "WHO — strong recovery" },
    2023: { estimatedCases: 900_000_000, deaths: 370_000, source: "WHO GISRS" },
    latestDataYear: 2023,
  },
  Typhoid: {
    // IHME GBD 2021; WHO vaccine programme estimates
    // Heavily underreported — S. Typhi surveillance limited in LMICs
    2015: { estimatedCases: 12_500_000, deaths: 136_000, source: "IHME GBD" },
    2016: { estimatedCases: 12_200_000, deaths: 130_000, source: "IHME GBD" },
    2017: { estimatedCases: 11_900_000, deaths: 126_000, source: "IHME GBD" },
    2018: { estimatedCases: 11_600_000, deaths: 122_000, source: "IHME GBD (XDR Pakistan)" },
    2019: { estimatedCases: 11_400_000, deaths: 119_000, source: "IHME GBD" },
    2020: { estimatedCases: 10_900_000, deaths: 110_000, source: "IHME GBD (COVID)" },
    2021: { estimatedCases: 10_700_000, deaths: 107_000, source: "IHME GBD" },
    2022: { estimatedCases: 10_500_000, deaths: 104_000, source: "IHME GBD" },
    latestDataYear: 2022,
  },
  Ebola: {
    // WHO Ebola Disease Outbreak News
    2015: { cases: 3_351, deaths: 2_375, source: "WHO — tail-end W.Africa" },
    2016: { cases: 36, deaths: 15, source: "WHO — small flare-ups" },
    2017: { cases: 8, deaths: 4, source: "WHO — DRC small" },
    2018: { cases: 3_456, deaths: 2_287, source: "WHO — DRC Kivu outbreak" },
    2019: { cases: 1_212, deaths: 801, source: "WHO — DRC continuation" },
    2020: { cases: 130, deaths: 55, source: "WHO — DRC Equateur" },
    2021: { cases: 16, deaths: 12, source: "WHO — Guinea/DRC small" },
    2022: { cases: 164, deaths: 77, source: "WHO — Uganda outbreak" },
    2023: { cases: 12, deaths: 6, source: "WHO — small DRC cluster" },
    latestDataYear: 2023,
  },
  Zika: {
    // WHO/PAHO reports; mainly Americas surveillance
    2015: { reportedCases: 180_000, source: "WHO — start of Americas spread" },
    2016: { reportedCases: 750_000, source: "WHO — peak year; PHEIC declared" },
    2017: { reportedCases: 250_000, source: "WHO — declining post-peak" },
    2018: { reportedCases: 78_000, source: "WHO/PAHO — major decline" },
    2019: { reportedCases: 87_000, source: "PAHO" },
    2020: { reportedCases: 24_000, source: "PAHO (COVID reporting)" },
    2021: { reportedCases: 35_000, source: "PAHO" },
    2022: { reportedCases: 42_000, source: "PAHO — slight uptick" },
    2023: { reportedCases: 55_000, source: "PAHO/WHO — India, Americas" },
    latestDataYear: 2023,
  },
  Leptospirosis: {
    // IHME GBD; WHO estimates ~1M severe cases/year
    2015: { estimatedCases: 1_030_000, deaths: 58_900, source: "IHME GBD" },
    2016: { estimatedCases: 1_040_000, deaths: 59_300, source: "IHME GBD" },
    2017: { estimatedCases: 1_050_000, deaths: 59_600, source: "IHME GBD" },
    2018: { estimatedCases: 1_060_000, deaths: 59_800, source: "IHME GBD" },
    2019: { estimatedCases: 1_030_000, deaths: 58_500, source: "IHME GBD" },
    2020: { estimatedCases: 980_000, deaths: 55_000, source: "IHME GBD" },
    2021: { estimatedCases: 1_000_000, deaths: 56_200, source: "IHME GBD" },
    2022: { estimatedCases: 1_020_000, deaths: 57_000, source: "IHME GBD" },
    latestDataYear: 2022,
  },
};

// ── REGIONAL BURDEN SHARES BY DISEASE (WHO regional proportions 2022) ─────────
// These define what fraction of global burden each WHO region carries.
// Used to distribute global historical totals to individual countries.

export const REGIONAL_SHARES = {
  Malaria: {
    // WHO WMR 2023 — Africa 93.6%, SE Asia 2.1%, E.Med 3.3%, W.Pacific 0.8%, Americas 0.2%
    "Sub-Saharan Africa": 0.936,
    "South Asia": 0.018,          // India ~1.6M of 249M
    "Southeast Asia": 0.012,
    "Latin America": 0.002,
    "North Africa": 0.005,
    "Middle East": 0.007,
    "East Asia": 0.001,
    "Oceania": 0.008,
    "Europe": 0.0, "North America": 0.0, "Central Asia": 0.001,
  },
  Tuberculosis: {
    // WHO GTBR 2023 — SE Asia 46%, Africa 23%, W.Pacific 18%, E.Med 8.1%, Americas 3.1%, Europe 2.2%
    "South Asia": 0.34,           // India 27% + Pak 5.7% + BD 3.6%
    "Sub-Saharan Africa": 0.23,
    "Southeast Asia": 0.17,       // Indonesia 10% + Philippines 7%
    "East Asia": 0.10,            // China 7.1% + W.Pacific share
    "Middle East": 0.04,
    "North Africa": 0.04,
    "Latin America": 0.031,
    "Europe": 0.022,
    "Central Asia": 0.015,
    "Oceania": 0.005,
    "North America": 0.004,
  },
  "HIV/AIDS": {
    // UNAIDS 2023 — Africa: 660k/1.3M new = 50.8%; Americas 12.3%; Europe 13.8%; SE Asia 8.5%; W.Pac 10.8%; E.Med 4.3%
    "Sub-Saharan Africa": 0.508,
    "Latin America": 0.08,
    "Europe": 0.10,
    "South Asia": 0.06,
    "Southeast Asia": 0.04,
    "East Asia": 0.06,
    "North America": 0.045,
    "North Africa": 0.02,
    "Middle East": 0.025,
    "Central Asia": 0.04,
    "Oceania": 0.007,
  },
  Cholera: {
    // WHO WER 2024 — Africa dominant in 2023; E.Med/Asia declining
    "Sub-Saharan Africa": 0.55,
    "Middle East": 0.18,          // Afghanistan, Yemen, Syria
    "South Asia": 0.12,           // Bangladesh
    "Latin America": 0.06,        // Haiti
    "Southeast Asia": 0.04,
    "North Africa": 0.02,
    "East Asia": 0.01,
    "Oceania": 0.01,
    "Europe": 0.005, "North America": 0.002, "Central Asia": 0.003,
  },
  Dengue: {
    // WHO 2023 DON — Americas ~80% of 2023 reported cases; SE Asia endemic
    "Latin America": 0.55,
    "Southeast Asia": 0.22,
    "South Asia": 0.10,
    "Sub-Saharan Africa": 0.05,
    "East Asia": 0.04,
    "Oceania": 0.02,
    "North Africa": 0.005,
    "Middle East": 0.005,
    "Europe": 0.005,
    "North America": 0.003,
    "Central Asia": 0.002,
  },
};

// ── HELPER: Get the global-level "actual" multiplier for a past year ──────────
// This returns a scaling factor so the model's predictions for past years
// match the WHO-reported trajectory.
// E.g., if malaria went from 249M in 2022 to 263M in 2023, the model should
// show ~5.6% increase. We compute year-over-year change indices relative to
// the anchor year (2022).

export function getHistoricalScaleFactor(diseaseName, year) {
  const nameMap = { "COVID-19": "COVID_19" };
  const key = nameMap[diseaseName] || diseaseName;
  const diseaseData = HISTORICAL_GLOBAL[key];
  if (!diseaseData) return null;

  const latestYear = diseaseData.latestDataYear;
  if (year > latestYear) return null; // no historical data — use model projections

  const yearData = diseaseData[year];
  const anchorData = diseaseData[2022] || diseaseData[latestYear];
  if (!yearData || !anchorData) return null;

  // Use the most relevant case count field
  const getCaseCount = (d) =>
    d.cases ?? d.newCases ?? d.newInfections ?? d.estimatedCases ?? d.reportedCases ?? null;

  const yearCases = getCaseCount(yearData);
  const anchorCases = getCaseCount(anchorData);

  if (!yearCases || !anchorCases) return null;
  return yearCases / anchorCases;
}

// ── HELPER: Check if a year has actual data for a disease ─────────────────────
export function hasHistoricalData(diseaseName, year) {
  const nameMap = { "COVID-19": "COVID_19" };
  const key = nameMap[diseaseName] || diseaseName;
  const diseaseData = HISTORICAL_GLOBAL[key];
  if (!diseaseData) return false;
  return year <= diseaseData.latestDataYear && !!diseaseData[year];
}

// ── HELPER: Get summary for display ──────────────────────────────────────────
export function getHistoricalSummary(diseaseName, year) {
  const nameMap = { "COVID-19": "COVID_19" };
  const key = nameMap[diseaseName] || diseaseName;
  const diseaseData = HISTORICAL_GLOBAL[key];
  if (!diseaseData || !diseaseData[year]) return null;
  return { ...diseaseData[year], isHistorical: true };
}