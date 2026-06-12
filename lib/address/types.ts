export type ParsedAddress = {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat?: number;
  lng?: number;
};

export type AddressSuggestion = ParsedAddress & {
  id: string;
  label: string;
};

export type NominatimAddress = {
  house_number?: string;
  road?: string;
  street?: string;
  pedestrian?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  municipality?: string;
  county?: string;
  state?: string;
  postcode?: string;
};

export type NominatimResult = {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address?: NominatimAddress;
};
