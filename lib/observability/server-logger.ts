type LogLevel = "warn" | "error";
type LogModule =
  | "auth"
  | "contracts"
  | "demands"
  | "financial"
  | "clients"
  | "access"
  | "next";

type ServerLogEvent = {
  level: LogLevel;
  module: LogModule;
  operation: string;
  code: string;
  diagnosticCode?: string;
};

// Only fixed event fields are accepted. Never serialize Error, request or payload objects.
export function logServerEvent(event: ServerLogEvent): void {
  const record = JSON.stringify({
    timestamp: new Date().toISOString(),
    eventId: globalThis.crypto.randomUUID(),
    level: event.level,
    module: event.module,
    operation: event.operation,
    code: event.code,
    ...(event.diagnosticCode ? { diagnosticCode: event.diagnosticCode } : {}),
  });

  if (event.level === "error") {
    console.error(record);
  } else {
    console.warn(record);
  }
}

const diagnosticCodes = new Set([
  "CONTRACT_EMAIL_RESEND_API_KEY_MISSING",
  "CONTRACT_EMAIL_CONTRACTS_EMAIL_FROM_MISSING",
  "CONTRACT_EMAIL_SENDER_INVALID",
  "CONTRACT_EMAIL_SEND_FAILED",
  "CONTRACT_PDF_GENERATION_FAILED",
  "CONTRACT_DOCUMENT_UPLOAD_FAILED",
  "CONTRACT_DOCUMENT_DOWNLOAD_FAILED",
  "CONTRACT_DOCUMENT_COMPENSATION_FAILED",
  "CONTRACT_DOCUMENT_ORPHAN_COMPENSATION_FAILED",
  "CONTRACT_QUERY_FAILED",
  "CONTRACT_DOCUMENTS_QUERY_FAILED",
  "CONTRACT_TEMPLATE_QUERY_FAILED",
  "CONTRACT_TEMPLATE_LIST_QUERY_FAILED",
  "CONTRACT_LIST_QUERY_FAILED",
  "CONTRACT_RPC_EMPTY_RESULT",
]);

export function getSafeDiagnosticCode(error: unknown): string | undefined {
  let current = error;

  for (let depth = 0; depth < 5; depth += 1) {
    if (!(current instanceof Error)) return undefined;
    if (diagnosticCodes.has(current.message)) return current.message;
    current = current.cause;
  }

  return undefined;
}
