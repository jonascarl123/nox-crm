import { getGooglePlaceAddress } from "@/lib/address/google-places";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const placeId = searchParams.get("placeId")?.trim() ?? "";

  if (!placeId) {
    return Response.json({ error: "placeId is required" }, { status: 400 });
  }

  try {
    const address = await getGooglePlaceAddress(placeId);
    if (!address) {
      return Response.json(
        { error: "Could not parse US address for this place" },
        { status: 404 }
      );
    }
    return Response.json({ address });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Place lookup failed";
    return Response.json({ error: message }, { status: 502 });
  }
}
