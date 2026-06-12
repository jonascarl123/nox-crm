import { getGoogleMapsApiKey } from "./config";
import { isUsStateCode, normalizeZip } from "./normalize";
import type { AddressSuggestion, ParsedAddress } from "./types";

type GooglePrediction = {
  place_id: string;
  description: string;
  structured_formatting?: {
    main_text?: string;
    secondary_text?: string;
  };
};

type GoogleAutocompleteResponse = {
  status: string;
  predictions?: GooglePrediction[];
  error_message?: string;
};

type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

type GooglePlaceDetailsResponse = {
  status: string;
  result?: {
    address_components?: GoogleAddressComponent[];
    geometry?: { location?: { lat: number; lng: number } };
  };
  error_message?: string;
};

function component(
  components: GoogleAddressComponent[],
  type: string
): GoogleAddressComponent | undefined {
  return components.find((c) => c.types.includes(type));
}

export function parseGoogleAddressComponents(
  components: GoogleAddressComponent[],
  geometry?: { lat: number; lng: number }
): ParsedAddress | null {
  const streetNumber = component(components, "street_number")?.long_name ?? "";
  const route = component(components, "route")?.long_name ?? "";
  const street = [streetNumber, route].filter(Boolean).join(" ");
  const city =
    component(components, "locality")?.long_name ??
    component(components, "sublocality")?.long_name ??
    component(components, "postal_town")?.long_name ??
    component(components, "administrative_area_level_2")?.long_name ??
    "";
  const state =
    component(components, "administrative_area_level_1")?.short_name ?? "";
  const zip = normalizeZip(
    component(components, "postal_code")?.long_name ?? ""
  );

  if (!street && !city) return null;
  if (!isUsStateCode(state)) return null;

  return {
    street,
    city,
    state: state.toUpperCase(),
    zip,
    lat: geometry?.lat,
    lng: geometry?.lng,
  };
}

export async function autocompleteGooglePlaces(
  input: string,
  limit = 6
): Promise<AddressSuggestion[]> {
  const key = getGoogleMapsApiKey();
  if (!key) return [];

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/autocomplete/json"
  );
  url.searchParams.set("input", input);
  url.searchParams.set("key", key);
  url.searchParams.set("components", "country:us");
  url.searchParams.set("types", "address");

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as GoogleAutocompleteResponse;

  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(
      data.error_message ?? `Google Places error (${data.status})`
    );
  }

  return (data.predictions ?? []).slice(0, limit).map((p) => ({
    id: p.place_id,
    placeId: p.place_id,
    label: p.description,
    street: p.structured_formatting?.main_text ?? p.description.split(",")[0]?.trim() ?? "",
    city: "",
    state: "",
    zip: "",
  }));
}

export async function getGooglePlaceAddress(
  placeId: string
): Promise<ParsedAddress | null> {
  const key = getGoogleMapsApiKey();
  if (!key) return null;

  const url = new URL(
    "https://maps.googleapis.com/maps/api/place/details/json"
  );
  url.searchParams.set("place_id", placeId);
  url.searchParams.set("key", key);
  url.searchParams.set(
    "fields",
    "address_components,geometry/location,formatted_address"
  );

  const response = await fetch(url.toString(), { next: { revalidate: 0 } });
  const data = (await response.json()) as GooglePlaceDetailsResponse;

  if (data.status !== "OK" || !data.result?.address_components) {
    throw new Error(
      data.error_message ?? `Google Place Details error (${data.status})`
    );
  }

  const loc = data.result.geometry?.location;
  return parseGoogleAddressComponents(
    data.result.address_components,
    loc ? { lat: loc.lat, lng: loc.lng } : undefined
  );
}
