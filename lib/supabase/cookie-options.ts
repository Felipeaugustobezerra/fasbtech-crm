export function getSupabaseCookieOptions(
  isProduction = process.env.NODE_ENV === "production",
) {
  return {
    path: "/",
    sameSite: "lax" as const,
    httpOnly: false,
    secure: isProduction,
  };
}
