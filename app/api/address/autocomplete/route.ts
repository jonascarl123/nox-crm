/** US-only address suggestions (Nominatim countrycodes=us + state validation). */
import { searchUsAddresses } from "@/lib/address/nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 3) {
    return Response.json({ suggestions: [] });
  }

  try {
    const suggestions = await searchUsAddresses(q);
    return Response.json({ suggestions });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Address search failed";
    return Response.json({ error: message, suggestions: [] }, { status: 502 });
  }
}
