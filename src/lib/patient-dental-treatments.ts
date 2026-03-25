/**
 * Patient-Facing Dental Treatment Categories and Price Ranges
 * Swedish reference prices from TLV (January 1, 2026)
 * 
 * Simplified for patient communication
 */

export interface PatientTreatmentCategory {
  id: string;
  swedishName: string;
  englishName: string;
  description: string;
  priceRangeSEK: {
    min: number;
    max: number;
  };
  examples: string[];
  commonQuestions?: string[];
}

export const patientFacingTreatments: PatientTreatmentCategory[] = [
  {
    id: 'examination',
    swedishName: 'Undersökning',
    englishName: 'Examination',
    description: 'Tandläkarens grundläggande undersökning av tänder och munhälsa',
    priceRangeSEK: { min: 445, max: 1970 },
    examples: [
      'Basundersökning (101)',
      'Akut undersökning (103)',
      'Omfattande undersökning (107)',
    ],
    commonQuestions: [
      'Hur ofta behöver jag en undersökning?',
      'Vad ingår i en basundersökning?',
    ],
  },
  {
    id: 'xray',
    swedishName: 'Röntgen',
    englishName: 'X-ray / Radiography',
    description: 'Tandröntgenbilder för diagnostik och planering',
    priceRangeSEK: { min: 80, max: 2075 },
    examples: [
      'En tandposition (121)',
      'Helstatus röntgen (123)',
      'Panoramaröntgen (124)',
      'Omfattande röntgen (126)',
    ],
  },
  {
    id: 'filling',
    swedishName: 'Fyllning/Lagning',
    englishName: 'Filling / Restoration',
    description: 'Behandling av hål (karies) i tänder',
    priceRangeSEK: { min: 450, max: 1690 },
    examples: [
      'Fyllning en yta (701)',
      'Fyllning två ytor (702)',
      'Fyllning tre eller flera ytor (703)',
    ],
  },
  {
    id: 'cleaning',
    swedishName: 'Tandstensrengöring / Profylax',
    englishName: 'Cleaning / Prophylaxis',
    description: 'Professionell tandstensrengöring och tandstöd',
    priceRangeSEK: { min: 485, max: 1215 },
    examples: [
      'Tandstensrengöring supragingival (207)',
      'Tandstöd allmän (210)',
    ],
  },
  {
    id: 'rootcanal',
    swedishName: 'Rotfyllning / Endodonti',
    englishName: 'Root Canal Treatment',
    description: 'Behandling av tandnervkanalen vid inflammation eller infektion',
    priceRangeSEK: { min: 2105, max: 5460 },
    examples: [
      'Rensning och rotfyllning, en kanal (501)',
      'Rensning och rotfyllning, två kanaler (502)',
      'Rensning och rotfyllning, tre kanaler (503)',
      'Rensning och rotfyllning, fyra eller fler kanaler (504)',
    ],
  },
  {
    id: 'extraction',
    swedishName: 'Tandutdragning / Extraktion',
    englishName: 'Tooth Extraction',
    description: 'Tanduttagning / tandextraktion',
    priceRangeSEK: { min: 490, max: 2285 },
    examples: [
      'Tanduttagning, enkel (403)',
      'Tanduttagning med separation/friläggning (402)',
      'Kirurgisk tanduttagning, komplicerad (404)',
    ],
  },
  {
    id: 'crown',
    swedishName: 'Tandkrona',
    englishName: 'Crown',
    description: 'Permanent tandkrona för täckning av tandskador',
    priceRangeSEK: { min: 4550, max: 6850 },
    examples: [
      'Permanent tandkrona, en per käke (800)',
      'Laboratorieframställd krona (801)',
    ],
  },
  {
    id: 'implant',
    swedishName: 'Tandimplantat',
    englishName: 'Dental Implant',
    description: 'Tandimplantat för ersättning av förlorad tand',
    priceRangeSEK: { min: 6500, max: 18500 },
    examples: [
      'Implantatöverbyggnad, skruv (911)',
      'Implantatöverbyggnad, cement (912)',
      'Implantatöverbyggnad, präfabricerad skruv (913)',
    ],
  },
  {
    id: 'bridge',
    swedishName: 'Tandbrytill / Bro',
    englishName: 'Bridge',
    description: 'Tandersättning mellan två eller flera tänder',
    priceRangeSEK: { min: 3650, max: 8200 },
    examples: [
      'Tandstödd tandbrytill (841)',
      'Tandbrytill med två tandsupporter (842)',
    ],
  },
  {
    id: 'prosthetics',
    swedishName: 'Tandprotes',
    englishName: 'Dentures / Prosthetics',
    description: 'Tandprotes för ersättning av flera eller alla tänder',
    priceRangeSEK: { min: 3650, max: 8200 },
    examples: [
      'Fullprotes, en käke (851)',
      'Partiell tandprotes (852)',
    ],
  },
  {
    id: 'orthodontics',
    swedishName: 'Tandreglering / Ortodonti',
    englishName: 'Orthodontics / Braces',
    description: 'Tandreglering för att korrigera tandställning',
    priceRangeSEK: { min: 2920, max: 6850 },
    examples: [
      'Tandreglering, högst 6 månader (900)',
      'Tandreglering, högst 1 år (901)',
      'Tandreglering, 1-1.5 år (902)',
    ],
  },
  {
    id: 'emergency',
    swedishName: 'Akutbehandling',
    englishName: 'Emergency Treatment',
    description: 'Akut tandvård för smärta eller akut situation',
    priceRangeSEK: { min: 301, max: 2960 },
    examples: [
      'Sjukdoms- eller smärtbehandling (301)',
      'Akut eller annan undersökning (103)',
    ],
  },
  {
    id: 'periodontal',
    swedishName: 'Tandköttbehandling / Parodontal',
    englishName: 'Periodontal Treatment',
    description: 'Behandling av tandköttsjukdom och inflammation',
    priceRangeSEK: { min: 535, max: 3215 },
    examples: [
      'Parodontal undersökning (114)',
      'Inskalning och rotplanering (421)',
    ],
  },
];

export function findTreatmentByKeyword(keyword: string): PatientTreatmentCategory | undefined {
  const lowerKeyword = keyword.toLowerCase();
  return patientFacingTreatments.find(
    t => t.swedishName.toLowerCase().includes(lowerKeyword) ||
         t.englishName.toLowerCase().includes(lowerKeyword) ||
         t.description.toLowerCase().includes(lowerKeyword)
  );
}

export function getTreatmentsByPriceRange(minSEK: number, maxSEK: number): PatientTreatmentCategory[] {
  return patientFacingTreatments.filter(
    t => t.priceRangeSEK.min <= maxSEK && t.priceRangeSEK.max >= minSEK
  );
}
