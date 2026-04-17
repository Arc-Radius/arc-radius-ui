import { apiClient } from './client';

export interface RepOffice {
  type: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
}

export interface Representative {
  name: string;
  party: string | null;
  title: string | null;
  district: string | null;
  chamber: string;
  image: string | null;
  email: string | null;
  phone: string | null;
  offices: RepOffice[];
  links: { url: string; note: string }[];
}

export interface RepLookupResponse {
  zip: string;
  location: {
    lat: number;
    lng: number;
    state: string;
    place_name: string;
  };
  state_legislators: Representative[];
  federal_legislators: Representative[];
}

export async function lookupRepresentatives(zipcode: string): Promise<RepLookupResponse> {
  return apiClient.get<RepLookupResponse>(`/representatives/lookup?zipcode=${zipcode}`);
}

/** Get the representative's email (top-level field from backend). */
export function getRepEmail(rep: Representative): string | null {
  return rep.email ?? null;
}

/** Get the representative's phone (top-level field from backend). */
export function getRepPhone(rep: Representative): string | null {
  return rep.phone ?? null;
}
