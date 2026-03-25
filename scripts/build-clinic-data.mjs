#!/usr/bin/env node

/**
 * Build script for Tandkollen clinic data
 * Reads scraped data and generates TypeScript module with real Stockholm clinics
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Featured treatments - the 10 most patient-relevant action codes
const FEATURED_TREATMENTS = [
  { code: '101', label: 'Basundersökning' },
  { code: '107', label: 'Omfattande undersökning' },
  { code: '124', label: 'Panoramaröntgen' },
  { code: '301', label: 'Sjukdomsbehandling' },
  { code: '401', label: 'Tandutdragning' },
  { code: '501', label: 'Rotfyllning framtand' },
  { code: '701', label: 'Fyllning 1 yta' },
  { code: '704', label: 'Fyllning 1 yta (kindtand)' },
  { code: '800', label: 'Krona framtand' },
  { code: '801', label: 'Krona kindtand' },
];

// Treatment bundle codes - as specified in requirements
const TREATMENT_BUNDLE_CODES = [
  'A2', 'A3', 'A5',
  'B1', 'B2', 'B3', 'B4', 'B5', 'B6',
  'C1', 'C2',
  'D2', 'D3', 'D4',
  'E1', 'E2', 'E3', 'E4', 'E5',
  'G1', 'G2', 'G3', 'G4',
  'I1', 'I2'
];

/**
 * Parse price level string to percentage
 * "11% högre" → 11
 * "5% lägre" or "under" → -5
 */
function parsePriceLevel(priceLevel) {
  if (!priceLevel) return null;

  // Handle "under referenspriset" separately
  if (priceLevel.includes('under')) {
    const match = priceLevel.match(/(\d+)%/);
    return match ? -parseInt(match[1], 10) : null;
  }

  const match = priceLevel.match(/(\d+)%\s+(högre|lägre)/);
  if (!match) return null;

  const pct = parseInt(match[1], 10);
  return match[2] === 'lägre' ? -pct : pct;
}

function main() {
  console.log('Reading clinic data...');
  const rawData = JSON.parse(readFileSync(join(projectRoot, 'data/clinic-prices.json'), 'utf8'));

  // Load geocoding data if available
  let geoData = {};
  try {
    geoData = JSON.parse(readFileSync(join(projectRoot, 'data/clinic-geo.json'), 'utf8'));
    console.log(`Loaded geo data for ${Object.keys(geoData).length} clinics`);
  } catch {
    console.log('No geo data found (data/clinic-geo.json), skipping coordinates');
  }

  console.log(`Total clinics: ${rawData.length}`);

  // Filter out clinics with error field or no price data
  const validClinics = rawData.filter(c =>
    !c.error &&
    c.actionPriceCount > 0 &&
    c.actionPrices &&
    Object.keys(c.actionPrices).length > 0
  );
  console.log(`Valid clinics: ${validClinics.length}`);

  // Build clinic list with coordinates
  const clinics = validClinics.map(c => {
    const geo = geoData[c.receptionId];
    // Filter out obvious geocoding errors (lng should be ~18 for Stockholm)
    const validGeo = geo && geo.lat && geo.lng > 17 && geo.lng < 19;
    return {
      id: c.receptionId,
      name: c.name,
      area: c.area,
      address: c.address,
      postalCode: c.postalCode,
      phone: c.phone || null,
      email: c.email || null,
      website: c.website || null,
      priceLevelPct: parsePriceLevel(c.priceLevel),
      lat: validGeo ? Math.round(geo.lat * 100000) / 100000 : null,
      lng: validGeo ? Math.round(geo.lng * 100000) / 100000 : null,
    };
  }).sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  // Build featured treatment prices map
  const featuredCodes = new Set(FEATURED_TREATMENTS.map(t => t.code));
  const prices = {};

  for (const clinic of validClinics) {
    const clinicPrices = {};

    for (const code of featuredCodes) {
      if (clinic.actionPrices?.[code]) {
        const { receptionPrice, referencePrice } = clinic.actionPrices[code];
        clinicPrices[code] = [receptionPrice, referencePrice];
      }
    }

    prices[clinic.receptionId] = clinicPrices;
  }

  // Build bundle prices map separately
  const bundlePrices = {};

  for (const clinic of validClinics) {
    const clinicBundles = {};

    for (const code of TREATMENT_BUNDLE_CODES) {
      if (clinic.treatmentPrices?.[code]) {
        const { title, receptionPrice, referencePrice } = clinic.treatmentPrices[code];
        clinicBundles[code] = {
          title,
          price: receptionPrice,
          ref: referencePrice,
        };
      }
    }

    bundlePrices[clinic.receptionId] = clinicBundles;
  }

  // Calculate stats for validation
  const statsExample = {};
  const allActionCodes = FEATURED_TREATMENTS.map(t => t.code);

  for (const code of allActionCodes) {
    const values = [];
    let refPrice = null;

    for (const clinicId in prices) {
      const entry = prices[clinicId][code];
      if (entry) {
        if (entry[0] !== null) values.push(entry[0]);
        if (refPrice === null) refPrice = entry[1];
      }
    }

    if (values.length > 0) {
      values.sort((a, b) => a - b);
      const sum = values.reduce((a, b) => a + b, 0);
      const median = values.length % 2 === 0
        ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
        : values[Math.floor(values.length / 2)];

      statsExample[code] = {
        min: values[0],
        max: values[values.length - 1],
        avg: Math.round(sum / values.length),
        median: Math.round(median),
        ref: refPrice,
        count: values.length,
      };
    }
  }

  console.log('\nExample stats for code 101:', statsExample['101']);
  console.log('Example stats for code 701:', statsExample['701']);

  // Generate TypeScript module
  const output = `/** Auto-generated from Tandpriskollen data. Do not edit manually. */

export interface RealClinic {
  id: string;
  name: string;
  area: string;
  address: string;
  postalCode: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  priceLevelPct: number | null;
  lat: number | null;
  lng: number | null;
}

/** Compact price entry: [clinicPrice, referencePrice] — null if clinic doesn't report */
export type PriceEntry = [number | null, number];

export interface TreatmentInfo {
  code: string;
  label: string;
}

export const FEATURED_TREATMENTS: TreatmentInfo[] = ${JSON.stringify(FEATURED_TREATMENTS, null, 2)};

export const clinics: RealClinic[] = ${JSON.stringify(clinics, null, 2)};

/** Featured treatment prices indexed by clinic ID. prices[clinicId][treatmentCode] = [clinicPrice, refPrice] */
export const prices: Record<string, Record<string, PriceEntry>> = ${JSON.stringify(prices, null, 2)};

/** Bundled treatment prices with titles. bundlePrices[clinicId][bundleCode] = { title, price, ref } */
export const bundlePrices: Record<string, Record<string, { title: string; price: number | null; ref: number }>> = ${JSON.stringify(bundlePrices, null, 2)};

/** Get price stats for a treatment code across all clinics */
export function getPriceStats(code: string): {
  min: number;
  max: number;
  avg: number;
  median: number;
  ref: number;
  count: number;
} | null {
  const values: number[] = [];
  let refPrice: number | null = null;

  for (const clinicId in prices) {
    const entry = prices[clinicId][code];
    if (entry) {
      if (entry[0] !== null) values.push(entry[0]);
      if (refPrice === null) refPrice = entry[1];
    }
  }

  if (values.length === 0 || refPrice === null) return null;

  values.sort((a, b) => a - b);
  const sum = values.reduce((a, b) => a + b, 0);
  const median =
    values.length % 2 === 0
      ? (values[values.length / 2 - 1] + values[values.length / 2]) / 2
      : values[Math.floor(values.length / 2)];

  return {
    min: values[0],
    max: values[values.length - 1],
    avg: Math.round(sum / values.length),
    median: Math.round(median),
    ref: refPrice,
    count: values.length,
  };
}
`;

  const outputPath = join(projectRoot, 'src/lib/clinic-data.ts');
  writeFileSync(outputPath, output, 'utf8');

  console.log(`\nGenerated ${outputPath}`);
  console.log(`- ${clinics.length} clinics`);
  console.log(`- ${FEATURED_TREATMENTS.length} featured treatments`);
  console.log(`- ${TREATMENT_BUNDLE_CODES.length} bundle codes`);

  // File size
  const stats = readFileSync(outputPath, 'utf8');
  console.log(`- ${Math.round(stats.length / 1024)} KB`);
}

main();
