import type { Instrumentation } from "next";

import { getSafeDiagnosticCode, logServerEvent } from "@/lib/observability/server-logger";

export const onRequestError: Instrumentation.onRequestError = async (
  error,
  _request,
  context,
) => {
  logServerEvent({
    level: "error",
    module: "next",
    operation: context.routePath.includes("/documentos/")
      ? "private_document_download"
      : context.routeType,
    code: "SERVER_REQUEST_FAILED",
    diagnosticCode: getSafeDiagnosticCode(error),
  });
};
