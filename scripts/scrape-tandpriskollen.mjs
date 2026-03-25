#!/usr/bin/env node
/**
 * Tandpriskollen Scraper (Playwright)
 *
 * Headless browser scraper for tandpriskollen.se (TLV).
 * Data is client-side rendered, so we need a real browser.
 *
 * Step 1: Visit search page → extract embedded clinic list (3139 clinics)
 * Step 2: For each clinic, visit mottagning.html?id={receptionId}
 * Step 3: Extract prices from AppRegistry.getInitialState()
 * Step 4: Save as JSON
 *
 * Usage:
 *   node scripts/scrape-tandpriskollen.mjs --limit 50 --municipality Stockholm
 *   node scripts/scrape-tandpriskollen.mjs --resume   # continue from last save
 */

import { chromium } from "playwright";
import { writeFileSync, existsSync, readFileSync, mkdirSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, "..", "data");
const CLINIC_LIST_FILE = join(OUTPUT_DIR, "clinics.json");
const PRICES_FILE = join(OUTPUT_DIR, "clinic-prices.json");
const PROGRESS_FILE = join(OUTPUT_DIR, ".scrape-progress.json");

const DELAY_MS = 500;
const SEARCH_URL = "https://tandpriskollen.se/mellan-20-och-66.html";
const CLINIC_URL = (id) => `https://tandpriskollen.se/mottagning.html?id=${id}`;

// Parse CLI args
const args = process.argv.slice(2);
const limitIdx = args.indexOf("--limit");
const LIMIT = limitIdx !== -1 ? parseInt(args[limitIdx + 1]) : Infinity;
const munIdx = args.indexOf("--municipality");
const MUNICIPALITY_FILTER = munIdx !== -1 ? args[munIdx + 1] : null;
const RESUME = args.includes("--resume");

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

// ── Step 1: Get clinic list ──────────────────────────────────────────

async function fetchClinicList(page) {
  if (existsSync(CLINIC_LIST_FILE)) {
    console.log("  Clinic list cached, loading from file...");
    return JSON.parse(readFileSync(CLINIC_LIST_FILE, "utf-8"));
  }

  console.log("  Fetching clinic list from tandpriskollen.se...");

  // First visit the landing page and select age group
  await page.goto("https://tandpriskollen.se/", { waitUntil: "networkidle" });

  // Click "Jag är mellan 20 och 66 år" button
  const ageButton = page.locator('button:has-text("Jag är mellan 20 och 66 år")');
  if (await ageButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await ageButton.click();
    await page.waitForURL("**/mellan-20-och-66.html", { timeout: 10000 });
  } else {
    await page.goto(SEARCH_URL, { waitUntil: "networkidle" });
  }

  // Accept necessary cookies if banner appears
  const cookieButton = page.locator('button:has-text("nödvändiga")');
  if (await cookieButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await cookieButton.click();
    await sleep(500);
  }

  // Wait for the page to fully render clinic data
  await page.waitForTimeout(3000);

  // The clinic list is embedded as JSON in rendered HTML
  const clinics = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;
    const startMarker = '[{"receptionId"';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) return null;

    let depth = 0;
    let endIdx = startIdx;
    for (let i = startIdx; i < html.length; i++) {
      if (html[i] === "[") depth++;
      if (html[i] === "]") depth--;
      if (depth === 0) {
        endIdx = i + 1;
        break;
      }
    }
    return JSON.parse(html.substring(startIdx, endIdx));
  });

  if (!clinics) {
    throw new Error("Could not find clinic list. Site structure may have changed.");
  }

  console.log(`  Found ${clinics.length} clinics`);
  writeFileSync(CLINIC_LIST_FILE, JSON.stringify(clinics, null, 2));
  return clinics;
}

// ── Step 2: Scrape individual clinic ─────────────────────────────────

async function scrapeClinic(page, clinic) {
  await page.goto(CLINIC_URL(clinic.receptionId), { waitUntil: "networkidle", timeout: 15000 });

  const data = await page.evaluate(() => {
    const html = document.documentElement.innerHTML;

    // Find the JSON blob containing receptionName by parsing registerInitialState calls
    // Pattern: registerInitialState('KEY', { ...receptionName... })
    const marker = '"receptionName"';
    const idx = html.indexOf(marker);
    if (idx === -1) return null;

    // Walk backwards from receptionName to find the opening { of the state object
    let braceStart = -1;
    let depth = 0;
    for (let i = idx; i >= 0; i--) {
      if (html[i] === '}') depth++;
      if (html[i] === '{') {
        if (depth === 0) { braceStart = i; break; }
        depth--;
      }
    }
    if (braceStart === -1) return null;

    // Walk forward to find the matching closing }
    depth = 0;
    let braceEnd = -1;
    for (let i = braceStart; i < html.length; i++) {
      if (html[i] === '{') depth++;
      if (html[i] === '}') {
        depth--;
        if (depth === 0) { braceEnd = i + 1; break; }
      }
    }
    if (braceEnd === -1) return null;

    try {
      return JSON.parse(html.substring(braceStart, braceEnd));
    } catch {
      return null;
    }
  });

  if (!data) {
    return {
      receptionId: clinic.receptionId,
      name: clinic.name,
      municipality: clinic.municipality,
      area: clinic.area,
      error: "Could not extract state",
    };
  }

  const contact = data.contact || {};

  // Extract per-action-code prices (101, 103, 701, etc.)
  const actionPrices = {};
  if (data.actionPrices) {
    for (const [category, group] of Object.entries(data.actionPrices)) {
      for (const action of group.actions || []) {
        actionPrices[action.id] = {
          receptionPrice: action.receptionPrice
            ? parseInt(action.receptionPrice.replace(/\s/g, ""))
            : null,
          referencePrice: action.referencePriceGeneral
            ? parseInt(action.referencePriceGeneral.replace(/\s/g, ""))
            : null,
          diff: action.differencePrice || null,
        };
      }
    }
  }

  // Extract bundled treatment prices (A1, B2, etc.)
  const treatmentPrices = {};
  if (data.receptionPrices) {
    for (const [, group] of Object.entries(data.receptionPrices)) {
      for (const t of group.treatments || []) {
        treatmentPrices[t.treatmentCode] = {
          title: t.title,
          group: group.groupName,
          receptionPrice: t.receptionPrice
            ? parseInt(t.receptionPrice.replace(/\s/g, ""))
            : null,
          referencePrice: t.referencePrice
            ? parseInt(t.referencePrice.replace(/\s/g, ""))
            : null,
          diff: t.differencePrice || null,
        };
      }
    }
  }

  return {
    receptionId: clinic.receptionId,
    name: data.receptionName,
    caregiver: data.receptionCaregiver,
    municipality: clinic.municipality,
    area: clinic.area,
    address: contact.address || null,
    postalCode: contact.postalCode || null,
    city: contact.city || null,
    phone: contact.phone || null,
    email: contact.mail || null,
    website: contact.webpage || null,
    priceLevel: data.priceLevel || null,
    actionPriceCount: Object.keys(actionPrices).length,
    actionPrices,
    treatmentPrices,
  };
}

// ── Main ─────────────────────────────────────────────────────────────

async function main() {
  console.log("\n  Tandpriskollen Scraper (Playwright)\n");

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Tandkollen-Research/1.0",
  });

  // Set the age group cookie so clinic pages render properly
  await context.addCookies([
    {
      name: "ageGroup",
      value: "between-20-and-66",
      domain: "tandpriskollen.se",
      path: "/",
    },
  ]);

  const page = await context.newPage();

  try {
    // Step 0: Visit landing page and select age group to set session
    console.log("  Setting up age group session...");
    await page.goto("https://tandpriskollen.se/", { waitUntil: "networkidle" });
    const ageBtn = page.locator('button:has-text("Jag är mellan 20 och 66 år")');
    if (await ageBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await ageBtn.click();
      await page.waitForURL("**/mellan-20-och-66.html", { timeout: 10000 });
    }
    // Accept cookies
    const cookieBtn = page.locator('button:has-text("nödvändiga")');
    if (await cookieBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cookieBtn.click();
      await sleep(500);
    }
    console.log("  Session ready.");

    // Step 1: Clinic list
    let clinics = await fetchClinicList(page);

    if (MUNICIPALITY_FILTER) {
      clinics = clinics.filter(
        (c) => c.municipality.toLowerCase() === MUNICIPALITY_FILTER.toLowerCase()
      );
      console.log(`  Filtered to ${clinics.length} clinics in ${MUNICIPALITY_FILTER}`);
    }

    if (LIMIT < clinics.length) {
      clinics = clinics.slice(0, LIMIT);
      console.log(`  Limited to first ${LIMIT} clinics`);
    }

    // Resume support
    let results = [];
    const scraped = new Set();
    if (RESUME && existsSync(PROGRESS_FILE)) {
      const progress = JSON.parse(readFileSync(PROGRESS_FILE, "utf-8"));
      results = progress.results || [];
      for (const r of results) scraped.add(r.receptionId);
      console.log(`  Resuming: ${scraped.size} already scraped`);
    }

    const remaining = clinics.filter((c) => !scraped.has(c.receptionId));
    console.log(`\n  Scraping ${remaining.length} clinics...\n`);

    let count = 0;
    const startTime = Date.now();

    for (const clinic of remaining) {
      count++;
      const pct = ((count / remaining.length) * 100).toFixed(1);
      const eta =
        count > 1
          ? (
              (((Date.now() - startTime) / count) * (remaining.length - count)) /
              1000 /
              60
            ).toFixed(1)
          : "?";

      process.stdout.write(
        `  [${pct}%] ${count}/${remaining.length} ${clinic.name.substring(0, 30).padEnd(30)} ETA: ${eta}min\r`
      );

      try {
        const result = await scrapeClinic(page, clinic);
        results.push(result);
      } catch (err) {
        console.warn(`\n  Failed: ${clinic.name} — ${err.message}`);
        results.push({
          receptionId: clinic.receptionId,
          name: clinic.name,
          municipality: clinic.municipality,
          area: clinic.area,
          error: err.message,
        });
      }

      // Save progress every 25 clinics
      if (count % 25 === 0) {
        writeFileSync(PROGRESS_FILE, JSON.stringify({ results }));
        process.stdout.write(`\n  [checkpoint] Saved ${results.length} results\n`);
      }

      await sleep(DELAY_MS);
    }

    // Final save
    const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    const successful = results.filter((r) => !r.error);
    const failed = results.filter((r) => r.error);

    writeFileSync(PRICES_FILE, JSON.stringify(results, null, 2));

    console.log(`\n\n  Done! ${results.length} clinics in ${elapsed} min`);
    console.log(`  OK: ${successful.length} | Failed: ${failed.length}`);
    console.log(`  Saved to ${PRICES_FILE}`);

    if (successful.length > 0) {
      const avgPrices = (
        successful.reduce((s, r) => s + r.actionPriceCount, 0) / successful.length
      ).toFixed(0);
      console.log(`  Avg action prices per clinic: ${avgPrices}`);
      console.log(
        `  Municipalities: ${new Set(successful.map((r) => r.municipality)).size}`
      );
    }

    // Clean up progress
    if (existsSync(PROGRESS_FILE)) unlinkSync(PROGRESS_FILE);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
