# Swedish Dental Reference Prices (Referenspriser)

This directory contains complete TLV (Tandvårds- och läkemedelsverket) reference pricing data for all Swedish dental treatments valid from January 1, 2026.

## Files Overview

### 1. Core Data Files

#### `/src/lib/dental-reference-prices.ts`
**Complete treatment database with all 200 procedures**

```typescript
import { dentalReferencePrices, DentalReferencePrice } from '@/lib/dental-reference-prices';

// Find a specific treatment
const rootCanal = dentalReferencePrices.find(p => p.code === '501');
console.log(`${rootCanal.description}: ${rootCanal.generalPrice} SEK`);

// Get category for a code
import { getCategoryForCode } from '@/lib/dental-reference-prices';
console.log(getCategoryForCode('701')); // "Ortodonti (Orthodontics)"

// Get price range for multiple treatments
import { getPriceRange } from '@/lib/dental-reference-prices';
const range = getPriceRange(['701', '702', '703']); // All filling types
console.log(`Fillings cost between ${range.min} - ${range.max} SEK`);
```

**Interface:**
```typescript
interface DentalReferencePrice {
  code: string;                   // e.g., "101", "501", "800"
  description: string;             // Full Swedish treatment name
  generalPrice: number | null;     // Price for general dentist
  specialistPrice: number | null;  // Price for specialist
  dentalTechCost: number | null;   // Lab technical costs
  materials: string | null;        // Material specifications
}
```

---

#### `/src/lib/patient-dental-treatments.ts`
**Simplified categories for patient-facing content**

Groups treatments into 12 easy-to-understand categories with typical price ranges and examples.

```typescript
import {
  patientFacingTreatments,
  findTreatmentByKeyword,
  getTreatmentsByPriceRange
} from '@/lib/patient-dental-treatments';

// Find treatments in patient's budget
const affordable = getTreatmentsByPriceRange(0, 2000); // SEK
// Returns: Examination, X-rays, Cleaning, Emergency

// Search by keyword
const crown = findTreatmentByKeyword('tandkrona');
console.log(`Crowns cost ${crown.priceRangeSEK.min}-${crown.priceRangeSEK.max} SEK`);
```

**Categories included:**
- Examination (Undersökning)
- X-ray/Radiography (Röntgen)
- Filling/Restoration (Fyllning)
- Cleaning & Prophylaxis (Tandstensrengöring)
- Root Canal Treatment (Rotfyllning)
- Tooth Extraction (Tandutdragning)
- Crown (Tandkrona)
- Bridge (Tandbrytill)
- Dentures (Tandprotes)
- Implant (Tandimplantat)
- Orthodontics (Tandreglering)
- Emergency (Akutbehandling)

---

#### `/src/lib/dental-treatment-quick-reference.ts`
**Real-world treatment scenarios with estimated total costs**

Provides 12 common dental situations with estimated total costs including all related procedures.

```typescript
import {
  treatmentScenarios,
  getTreatmentsByBudget,
  estimateTimeline
} from '@/lib/dental-treatment-quick-reference';

// Find scenario by ID
const scenario = treatmentScenarios.find(s => s.id === 'root-canal-simple');
console.log(`Root canal: ${scenario.estimatedCostGeneralSEK.min}-${scenario.estimatedCostGeneralSEK.max} SEK`);
console.log(`Timeline: ${scenario.timelineEstimate}`);

// Get scenarios within budget
const options = getTreatmentsByBudget(5000); // SEK budget
options.forEach(s => console.log(s.title));

// Estimate time commitment
const timeline = estimateTimeline('cavity-filling');
console.log(`Appointments needed: ${timeline.estimatedAppointments}`);
console.log(`Estimated days: ${timeline.estimatedDays}`);
```

**Scenarios included:**
- Routine checkup
- Single surface cavity filling
- Multi-surface molar filling
- Root canal (simple and complex)
- Tooth extraction (simple and surgical)
- Crown placement
- Bridge (3-tooth pont)
- Single tooth implant
- Complete denture
- Teeth straightening
- Emergency toothache visit

---

### 2. Documentation Files

#### `/DENTAL_REFERENCE_ANALYSIS.md`
**Comprehensive analysis of the entire dataset**

Contains:
- Complete breakdown of all 200 treatments by category (1xx-9xx)
- Price comparisons between general and specialist care
- Patient-facing treatment groupings with typical costs
- Key insights on pricing patterns
- Code system explanation
- Usage examples
- Compliance notes

---

#### `/DENTAL_REFERENCE_README.md`
**This file — usage guide and quick reference**

---

## Quick Statistics

| Metric | Value |
|--------|-------|
| Total treatments | 200 |
| General dentistry treatments | 198 |
| Specialist dentistry treatments | 195 |
| Price range (general) | 80 - 39,160 SEK |
| Average price (general) | 4,873 SEK |
| Median price (general) | 1,820 SEK |
| Average specialist markup | +22.9% |
| Largest category | Other Dental Care (68 treatments, 34%) |

---

## Treatment Code System

Swedish dental codes use a two-digit prefix system:

| Prefix | Category | Examples |
|--------|---|---|
| 1xx | Examination & Diagnostics | Exams, X-rays, CT scans (27 treatments) |
| 2xx | Prevention & Basic Treatment | Cleaning, fluoride, guidance (12 treatments) |
| 3xx | Root Canal & Emergency | Pain treatment, urgent care (18 treatments) |
| 4xx | Periodontal & Extraction | Tooth removal, gum treatment (33 treatments) |
| 5xx | Surgical Root Treatment | Surgical root canals (9 treatments) |
| 6xx | Bite Splints & Occlusion | Bite splints, oral devices (7 treatments) |
| 7xx | Fillings & Restorations | Dental fillings (9 treatments) |
| 8xx | Major Restorations | Crowns, bridges, dentures (68 treatments) |
| 9xx | Implants & Orthodontics | Implants, braces (17 treatments) |

---

## Common Use Cases

### 1. Display treatment price to patient
```typescript
const treatment = dentalReferencePrices.find(p => p.code === '701');
if (treatment?.generalPrice) {
  console.log(`This treatment costs ${treatment.generalPrice} SEK`);
}
```

### 2. Calculate estimated total cost for procedure combo
```typescript
const rootCanalCost = dentalReferencePrices.find(p => p.code === '501');
const crownCost = dentalReferencePrices.find(p => p.code === '800');
const total = (rootCanalCost?.generalPrice || 0) + (crownCost?.generalPrice || 0);
console.log(`Root canal + crown: ${total} SEK`);
```

### 3. Filter treatments by price category
```typescript
const affordable = dentalReferencePrices.filter(
  p => p.generalPrice && p.generalPrice < 1000
);
console.log(`${affordable.length} treatments under 1000 SEK`);
```

### 4. Find all treatments in a category
```typescript
const fillings = dentalReferencePrices.filter(p =>
  p.code.startsWith('7')
);
console.log(`All ${fillings.length} filling types available`);
```

### 5. Display patient education for common scenario
```typescript
const scenario = treatmentScenarios.find(s => s.id === 'crown-placement');
console.log(`${scenario.title}`);
console.log(`Typical cost: ${scenario.estimatedCostGeneralSEK.min}-${scenario.estimatedCostGeneralSEK.max} SEK`);
scenario.notes.forEach(note => console.log(`• ${note}`));
```

---

## Price Interpretation

### General vs. Specialist Pricing

Most treatments have different prices depending on whether they're performed by a general dentist or specialist:

- **General dentistry (allmäntandvård):** Lower-cost option, typically in public/subsidized care
- **Specialist dentistry (specialisttandvård):** Higher-cost option, typically for complex cases

**Average specialist markup:** 22.9% higher than general dentistry

### Reference Prices

These are TLV reference prices used for:
- Cost ceiling on subsidized dental care (tandvårdsstöd)
- Benchmark for comparing provider costs
- Insurance reimbursement limits

**Important:** These are reference prices, not actual charges. Individual providers may charge less, and some may charge more depending on:
- Local market rates
- Provider overhead
- Materials used
- Patient insurance coverage
- Regional variations

---

## Updating the Data

When new reference prices are released (typically annually):

1. Download the new Excel file from TLV
2. Run the Python extraction script
3. Replace the three TypeScript files
4. Update the DENTAL_REFERENCE_ANALYSIS.md with new statistics
5. Commit with message: "Update dental reference prices - TLV [YYYY-MM-DD]"

---

## Data Quality Notes

### Limitations

- **Missing specialist prices:** Some treatments (especially hygienist procedures) only have general prices
- **Missing general prices:** Some specialist-only procedures only have specialist prices
- **Materials:** Specific dental materials are rarely detailed in the reference prices
- **Tech costs:** Dental technical costs are included in treatment prices, not separated

### Accuracy

- Prices are current as of January 1, 2026
- Data extracted directly from official TLV source
- All 200 treatments verified and complete
- Price data cross-checked for consistency

---

## Legal/Compliance

- **Source:** Swedish Health and Social Care Inspectorate (IVO)
- **Authority:** Tandvårds- och läkemedelsverket (TLV)
- **Legal basis:** Swedish health care subsidies regulation
- **Use case:** Reference for patient information and cost estimation
- **Disclaimer:** These are reference prices only, not binding charges

---

## TypeScript Support

All files are fully typed with TypeScript interfaces:

```typescript
// Full type support for intellisense
import type { DentalReferencePrice, PatientTreatmentCategory } from '@/lib/dental-reference-prices';
import { dentalReferencePrices, patientFacingTreatments } from '@/lib/dental-reference-prices';

// Type-safe filtering
const expensiveTreatments: DentalReferencePrice[] = dentalReferencePrices.filter(
  p => (p.generalPrice ?? 0) > 5000
);
```

---

## Contact & Questions

For questions about:
- **Specific treatment codes:** See DENTAL_REFERENCE_ANALYSIS.md for detailed breakdown
- **Data accuracy:** Refer to official TLV source
- **Implementation:** Check the usage examples in each file header
- **Swedish dental system:** Consult IVO or TLV official documentation

---

## Version History

- **v1.0** (2026-03-20)
  - Initial extraction from TLV referenspriser
  - 200 treatments in 9 categories
  - Patient-facing summaries
  - Quick reference scenarios
