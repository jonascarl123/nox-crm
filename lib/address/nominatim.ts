import {
  isUsStateCode,
  normalizeStateCode,
  normalizeZip,
} from "./normalize";
import type { AddressSuggestion, NominatimResult } from "./types";

function streetLine(address: NonNullable<NominatimResult["address"]>): string {
  const house = address.house_number?.trim() ?? "";
  const road =
    address.road?.trim() ??
    address.street?.trim() ??
    address.pedestrian?.trim() ??
    "";
  return [house, road].filter(Boolean).join(" ");
}

function cityLine(address: NonNullable<NominatimResult["address"]>): string {
  return (
    address.city?.trim() ??
    address.town?.trim() ??
    address.village?.trim() ??
    address.hamlet?.trim() ??
    address.municipality?.trim() ??
    ""
  );
}

export function parseNominatimResult(
  result: NominatimResult
): AddressSuggestion | null {
  const address = result.address;
  if (!address) return null;

  const street = streetLine(address);
  const city = cityLine(address);
  const state = normalizeStateCode(address.state);
  const zip = normalizeZip(address.postcode);

  if (!street && !city) return null;
  if (!isUsStateCode(state)) return null;

  return {
    id: String(result.place_id),
    label: result.display_name,
    street: street || result.display_name.split(",")[0]?.trim() || "",
    city,
    state,
    zip,
    lat: Number(result.lat),
    lng: Number(result.lon),
  };
}

export async function searchUsAddresses(
  query: string,
  limit = 6
): Promise<AddressSuggestion[]> {
  const q = query.trim();
  if (q.length < 3) return [];

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("countrycodes", "us");
  url.searchParams.set("limit", String(limit));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "NoxPower-CRM/1.0 (address-autocomplete)",
    },
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(`Address search failed (${response.status})`);
  }

  const data = (await response.json()) as NominatimResult[];
  return data
    .map(parseNominatimResult)
    .filter((item): item is AddressSuggestion => item !== null);
}
