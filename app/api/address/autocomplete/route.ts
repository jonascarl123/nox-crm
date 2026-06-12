import {
  addressProvider,
  addressSearchMinLength,
} from "@/lib/address/config";
import { autocompleteGooglePlaces } from "@/lib/address/google-places";
import { searchUsAddresses } from "@/lib/address/nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const minLen = addressSearchMinLength();

  if (q.length < minLen) {
    return Response.json({ suggestions: [], provider: addressProvider(), minLength: minLen });
  }

  try {
    const provider = addressProvider();
    const suggestions =
      provider === "google"
        ? await autocompleteGooglePlaces(q)
        : await searchUsAddresses(q);

    return Response.json({ suggestions, provider, minLength: minLen });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Address search failed";
    return Response.json(
      { error: message, suggestions: [], provider: addressProvider(), minLength: minLen },
      { status: 502 }
    );
  }
}
