type SecurityHeadersOptions = {
  isDevelopment: boolean;
  isProduction: boolean;
  supabaseUrl?: string;
};

type SecurityHeader = {
  key: string;
  value: string;
};

function getAllowedOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);

    return url.protocol === "https:" || url.protocol === "http:"
      ? url.origin
      : null;
  } catch {
    return null;
  }
}

export function buildSecurityHeaders({
  isDevelopment,
  isProduction,
  supabaseUrl,
}: SecurityHeadersOptions): SecurityHeader[] {
  const supabaseOrigin = getAllowedOrigin(supabaseUrl);
  const connectSources = [
    "'self'",
    ...(supabaseOrigin ? [supabaseOrigin] : []),
    ...(isDevelopment ? ["ws:"] : []),
  ];
  const directives = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self' data:",
    `connect-src ${connectSources.join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "worker-src 'self' blob:",
    ...(isProduction ? ["upgrade-insecure-requests"] : []),
  ];
  const headers: SecurityHeader[] = [
    {
      key: "Content-Security-Policy",
      value: directives.join("; "),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    {
      key: "Permissions-Policy",
      value: "camera=(), geolocation=(), microphone=(), payment=(), usb=()",
    },
  ];

  if (isProduction) {
    headers.push({
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    });
  }

  return headers;
}
