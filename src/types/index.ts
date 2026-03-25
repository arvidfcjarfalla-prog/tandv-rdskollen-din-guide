export interface Clinic {
  id: string;
  initials: string;
  name: string;
  address: string;
  area: string;
  rating: number;
  ratingCount: number;
  tags: string[];
  svarstid: string;
  available: boolean;
  availText: string;
  about: string;
  treatments: string[];
  hours: Record<string, string>;
  responseRate: string;
  avgPrice: string;
  patients: string;
}

export interface Offer {
  id: number;
  clinic: string;
  area: string;
  distance: string;
  price: number;
  wait: string;
  responseTime: string;
  rating: number;
  ratingCount: number;
  availType: "calendar" | "clinic";
  badge: "lowest" | "fastest" | null;
  scope: string;
  validUntil: string;
}

export interface PriceData {
  avg: number;
  low: number;
  high: number;
  refPrice: number;
  context: string;
}

export type Track = "exam" | "known" | null;

export interface WizardForm {
  // Step 1: Tooth selection
  selectedTeeth: string[];
  unknownTooth: boolean;

  // Step 2a: Symptoms (exam track)
  symptom: string;
  painLevel: number;
  symptomDuration: string;
  painTriggers: string[];
  swelling: boolean;
  fever: boolean;
  bleeding: boolean;
  knockedTooth: boolean;

  // Step 2b: Treatment (known track)
  treatment: string;
  previousSuggestion: string;
  specialistNeeded: string;
  materialPreference: string;

  // Step 3: Health
  birthYear: string;
  bloodThinners: boolean | null;
  diabetes: boolean | null;
  allergies: boolean | null;
  costProtectionLevel: string;

  // Step 4: Details
  timePreference: string;
  description: string;
  diagnosNote: string;

  // Step 5: Contact
  name: string;
  email: string;
  phone: string;
  consent: boolean;
}

export const PAIN_ANCHORS: Record<number, string> = {
  0: "Ingen smärta",
  1: "",
  2: "Obehag",
  3: "Märkbart",
  4: "",
  5: "Påtagligt",
  6: "Svårt att äta",
  7: "",
  8: "Kraftig smärta",
  9: "Sömnstörande",
  10: "Outhärdligt",
};
