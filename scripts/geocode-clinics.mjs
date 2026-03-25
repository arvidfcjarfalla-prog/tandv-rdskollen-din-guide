#!/usr/bin/env node
/**
 * Geocode clinics using OpenStreetMap Nominatim.
 * Rate limited to 1 req/s per Nominatim usage policy.
 *
 * Usage:
 *   node scripts/geocode-clinics.mjs
 *   node scripts/geocode-clinics.mjs --resume
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLINIC_FILE = join(__dirname, "..", "data", "clinic-prices.json");
const GEO_FILE = join(__dirname, "..", "data", "clinic-geo.json");
const PROGRESS_FILE = join(__dirname, "..", "data", ".geocode-progress.json");

const DELAY_MS = 1100; // Nominatim requires max 1 req/s
const RESUME = process.argv.includes("--resume");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function geocode(address, postalCode, city) {
  const q = `${address}, ${postalCode} ${city}, Sweden`;
  const url = `https://nominatim.openstreetmap.org/search?` +
    new URLSearchParams({
      q,
      format: "json",
      limit: "1",
      countrycodes: "se",
    });

  const res = await fetch(url, {
    headers: { "User-Agent": "Tandkollen-Geocoder/1.0 (student project)" },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();

  if (data.length === 0) {
    // Try with just postal code + city
    const fallbackUrl = `https://nominatim.openstreetmap.org/search?` +
      new URLSearchParams({
        q: `${postalCode} ${city}, Sweden`,
        format: "json",
        limit: "1",
        countrycodes: "se",
      });
    const res2 = await fetch(fallbackUrl, {
      headers: { "User-Agent": "Tandkollen-Geocoder/1.0 (student project)" },
    });
    const data2 = await res2.json();
    if (data2.length === 0) return null;
    return { lat: parseFloat(data2[0].lat), lng: parseFloat(data2[0].lon), approx: true };
  }

  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), approx: false };
}

async function main() {
  console.log("\n  Clinic Geocoder (Nominatim)\n");

  const clinics = JSON.parse(readFileSync(CLINIC_FILE, "utf-8"))
    .filter((c) => c.actionPriceCount > 0);

  console.log(`  ${clinics.length} clinics to geocode`);

  // Resume support
  let results = {};
  if (RESUME && existsSync(PROGRESS_FILE)) {
    results = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
    console.log(`  Resuming: ${Object.keys(results).length} already geocoded`);
  }

  const remaining = clinics.filter((c) => !results[c.receptionId]);
  console.log(`  ${remaining.length} remaining\n`);

  let count = 0;
  const startTime = Date.now();
  let successCount = Object.values(results).filter((r) => r.lat).length;
  let failCount = Object.values(results).filter((r) => !r.lat).length;

  for (const clinic of remaining) {
    count++;
    const pct = ((count / remaining.length) * 100).toFixed(1);
    const eta = count > 1
      ? (((Date.now() - startTime) / count) * (remaining.length - count) / 1000 / 60).toFixed(1)
      : "?";

    process.stdout.write(
      `  [${pct}%] ${count}/${remaining.length} ${clinic.name.substring(0, 30).padEnd(30)} ETA: ${eta}min\r`
    );

    try {
      const geo = await geocode(
        clinic.address || "",
        clinic.postalCode || "",
        clinic.city || "Stockholm"
      );

      results[clinic.receptionId] = geo
        ? { lat: geo.lat, lng: geo.lng, approx: geo.approx }
        : { lat: null, lng: null, error: "not found" };

      if (geo) successCount++;
      else failCount++;
    } catch (err) {
      results[clinic.receptionId] = { lat: null, lng: null, error: err.message };
      failCount++;
    }

    // Save progress every 25
    if (count % 25 === 0) {
      writeFileSync(PROGRESS_FILE, JSON.stringify(results));
      process.stdout.write(`\n  [checkpoint] ${Object.keys(results).length} geocoded\n`);
    }

    await sleep(DELAY_MS);
  }

  // Final save
  writeFileSync(GEO_FILE, JSON.stringify(results, null, 2));
  console.log(`\n\n  Done! ${Object.keys(results).length} clinics`);
  console.log(`  Found: ${successCount} | Not found: ${failCount}`);
  console.log(`  Saved to ${GEO_FILE}`);

  if (existsSync(PROGRESS_FILE)) {
    const { unlinkSync } = await import("fs");
    unlinkSync(PROGRESS_FILE);
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
