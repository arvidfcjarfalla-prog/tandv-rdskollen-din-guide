export type RequestStatus = "new" | "matched" | "quoted" | "closed" | "expired";

export interface Procedure {
  id: string;
  code: string;
  name: string;
  category: string;
  isSupportedByState: boolean;
}

export interface Clinic {
  id: string;
  name: string;
  city: string;
  municipalityCode: string;
  postalCode: string;
  avgRating: number | null;
  reviewCount: number;
}

export interface DamageRequest {
  id: string;
  status: RequestStatus;
  municipalityCode: string;
  postalCode: string;
  symptomSummary: string;
  painLevel: number;
  isAcute: boolean;
  preferredTimeWindow: string | null;
  createdAt: string;
}

export interface Quote {
  id: string;
  requestId: string;
  clinicId: string;
  totalMinSek: number;
  totalMaxSek: number;
  earliestSlot: string | null;
  createdAt: string;
}
