export const dynamic = "force-dynamic";

export async function GET() {
  let authAvailable = false;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

    if (baseUrl && publishableKey) {
      const response = await fetch(new URL("/auth/v1/health", baseUrl), {
        headers: { apikey: publishableKey },
        signal: AbortSignal.timeout(2000),
        cache: "no-store",
      });
      authAvailable = response.ok;
    }
  } catch {
    // The public response only reports availability, never endpoint details.
  }

  return Response.json(
    {
      application: "operational",
      auth: authAvailable ? "available" : "unavailable",
    },
    {
      status: authAvailable ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  );
}
