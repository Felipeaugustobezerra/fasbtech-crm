import {
  archiveClientRpc,
  createClientRpc,
  updateClientRpc,
  type ArchiveClientRpcArgs,
  type CreateClientRpcArgs,
  type UpdateClientRpcArgs,
} from "@/lib/clients/rpc";
import type { ClientInput } from "@/schemas/client";

type ClientServiceErrorCode =
  | "CLIENT_CREATE_FAILED"
  | "CLIENT_UPDATE_FAILED"
  | "CLIENT_ARCHIVE_FAILED";

type ClientRpcResult = Awaited<ReturnType<typeof createClientRpc>>;

function mapClientInput(input: ClientInput): CreateClientRpcArgs {
  return {
    p_name: input.name,
    p_company_name: input.company_name,
    p_email: input.email,
    p_phone: input.phone,
    p_tax_id: input.tax_id,
    p_tax_id_type: input.tax_id_type,
    p_address_line_1: input.address_line_1,
    p_address_line_2: input.address_line_2,
    p_city: input.city,
    p_region: input.region,
    p_postal_code: input.postal_code,
    p_country_code: input.country_code,
    p_notes: input.notes,
  };
}

async function executeClientRpc(
  operation: () => Promise<ClientRpcResult>,
  errorCode: ClientServiceErrorCode,
): Promise<string> {
  try {
    const { data, error } = await operation();

    if (error) {
      throw error;
    }

    if (data === null) {
      throw new Error("CLIENT_RPC_EMPTY_RESULT");
    }

    return data;
  } catch (cause) {
    throw new Error(errorCode, { cause });
  }
}

export async function createClient(input: ClientInput): Promise<string> {
  const args = mapClientInput(input);

  return executeClientRpc(() => createClientRpc(args), "CLIENT_CREATE_FAILED");
}

export async function updateClient(
  clientId: string,
  input: ClientInput,
): Promise<string> {
  const args: UpdateClientRpcArgs = {
    ...mapClientInput(input),
    p_client_id: clientId,
  };

  return executeClientRpc(() => updateClientRpc(args), "CLIENT_UPDATE_FAILED");
}

export async function archiveClient(clientId: string): Promise<string> {
  const args: ArchiveClientRpcArgs = {
    p_client_id: clientId,
  };

  return executeClientRpc(
    () => archiveClientRpc(args),
    "CLIENT_ARCHIVE_FAILED",
  );
}
