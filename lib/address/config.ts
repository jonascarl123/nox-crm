export function getGoogleMapsApiKey(): string | null {
  const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
  return key || null;
}

export function addressProvider(): "google" | "nominatim" {
  return getGoogleMapsApiKey() ? "google" : "nominatim";
}

/** Minimum typed characters before we search. */
export function addressSearchMinLength(): number {
  return addressProvider() === "google" ? 2 : 3;
}
