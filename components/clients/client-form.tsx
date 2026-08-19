"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, type UseFormRegister } from "react-hook-form";
import { z } from "zod";

import {
  createClientAction,
  updateClientAction,
  type ClientActionResult,
} from "@/app/(private)/clientes/actions";
import { clientSchema, type ClientInput } from "@/schemas/client";

type ClientFormValues = z.input<typeof clientSchema>;

type ClientFormProps =
  | Readonly<{
      mode: "create";
      initialValues?: ClientInput;
    }>
  | Readonly<{
      mode: "edit";
      clientId: string;
      initialValues: ClientInput;
    }>;

const CLIENT_FORM_FIELD_NAMES = [
  "name",
  "company_name",
  "email",
  "phone",
  "tax_id",
  "tax_id_type",
  "address_line_1",
  "address_line_2",
  "city",
  "region",
  "postal_code",
  "country_code",
  "notes",
] as const satisfies readonly (keyof ClientInput)[];

type ClientFormFieldName = (typeof CLIENT_FORM_FIELD_NAMES)[number];

type ClientTextFieldProps = Readonly<{
  name: Exclude<ClientFormFieldName, "notes">;
  label: string;
  register: UseFormRegister<ClientFormValues>;
  error?: string;
  type?: "text" | "email" | "tel";
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}>;

function createDefaultValues(values?: ClientInput): ClientFormValues {
  return {
    name: values?.name ?? "",
    company_name: values?.company_name ?? "",
    email: values?.email ?? "",
    phone: values?.phone ?? "",
    tax_id: values?.tax_id ?? "",
    tax_id_type: values?.tax_id_type ?? "",
    address_line_1: values?.address_line_1 ?? "",
    address_line_2: values?.address_line_2 ?? "",
    city: values?.city ?? "",
    region: values?.region ?? "",
    postal_code: values?.postal_code ?? "",
    country_code: values?.country_code ?? "",
    notes: values?.notes ?? "",
  };
}

function ClientTextField({
  name,
  label,
  register,
  error,
  type = "text",
  autoComplete,
  placeholder,
  required = false,
}: ClientTextFieldProps) {
  const id = `client-${name.replaceAll("_", "-")}`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
        {required ? (
          <span className="ml-1 text-red-700" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 min-h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-3 ${
          error
            ? "border-red-500 focus:border-red-600 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
        }`}
        {...register(name)}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function ClientNotesField({
  register,
  error,
}: Readonly<{
  register: UseFormRegister<ClientFormValues>;
  error?: string;
}>) {
  const id = "client-notes";
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        Observações
      </label>
      <textarea
        id={id}
        rows={5}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 w-full resize-y rounded-lg border bg-white px-3.5 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:ring-3 ${
          error
            ? "border-red-500 focus:border-red-600 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-600 focus:ring-blue-100"
        }`}
        placeholder="Informações operacionais relevantes sobre o cliente."
        {...register("notes")}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ClientForm(props: ClientFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    clearErrors,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues, unknown, ClientInput>({
    resolver: zodResolver(clientSchema),
    defaultValues: createDefaultValues(props.initialValues),
  });

  const isCreate = props.mode === "create";
  const cancelHref = isCreate ? "/clientes" : `/clientes/${props.clientId}`;

  function getError(name: ClientFormFieldName) {
    const message = errors[name]?.message;

    return typeof message === "string" ? message : undefined;
  }

  function applyActionErrors(
    result: Extract<ClientActionResult, { success: false }>,
  ) {
    if (result.code === "OPERATION_FAILED") {
      setFormError(result.message);
      return;
    }

    let hasFieldError = false;

    for (const fieldName of CLIENT_FORM_FIELD_NAMES) {
      const message = result.fieldErrors[fieldName]?.[0];

      if (message) {
        hasFieldError = true;
        setError(fieldName, { type: "server", message });
      }
    }

    const generalErrors = [
      ...result.formErrors,
      ...(result.fieldErrors.clientId ?? []),
    ];

    if (generalErrors.length > 0) {
      setFormError(generalErrors.join(" "));
    } else if (!hasFieldError) {
      setFormError(result.message);
    }
  }

  async function onSubmit(values: ClientInput) {
    setFormError(null);
    clearErrors();

    try {
      const result = isCreate
        ? await createClientAction(values)
        : await updateClientAction(props.clientId, values);

      if (!result.success) {
        applyActionErrors(result);
        return;
      }

      router.push(`/clientes/${result.clientId}`);
    } catch {
      setFormError(
        isCreate
          ? "Não foi possível criar o Cliente. Tente novamente."
          : "Não foi possível atualizar o Cliente. Tente novamente.",
      );
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      aria-busy={isSubmitting}
      className="space-y-6"
    >
      <p className="text-sm text-slate-600">
        Campos marcados com{" "}
        <span className="font-semibold text-red-700">*</span> são obrigatórios.
      </p>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-base font-semibold text-slate-950">
          Identificação
        </legend>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <ClientTextField
            name="name"
            label="Nome"
            register={register}
            error={getError("name")}
            autoComplete="name"
            required
          />
          <ClientTextField
            name="company_name"
            label="Empresa"
            register={register}
            error={getError("company_name")}
            autoComplete="organization"
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-base font-semibold text-slate-950">
          Contato
        </legend>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <ClientTextField
            name="email"
            label="E-mail"
            register={register}
            error={getError("email")}
            type="email"
            autoComplete="email"
          />
          <ClientTextField
            name="phone"
            label="Telefone"
            register={register}
            error={getError("phone")}
            type="tel"
            autoComplete="tel"
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-base font-semibold text-slate-950">
          Identificação fiscal
        </legend>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Quando informados, a identificação e o respetivo tipo são obrigatórios
          em conjunto.
        </p>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <ClientTextField
            name="tax_id"
            label="Identificação fiscal"
            register={register}
            error={getError("tax_id")}
          />
          <ClientTextField
            name="tax_id_type"
            label="Tipo de identificação fiscal"
            register={register}
            error={getError("tax_id_type")}
            placeholder="NIF, VAT, CPF, CNPJ..."
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-base font-semibold text-slate-950">
          Endereço
        </legend>
        <div className="mt-2 grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ClientTextField
              name="address_line_1"
              label="Endereço"
              register={register}
              error={getError("address_line_1")}
              autoComplete="address-line1"
            />
          </div>
          <div className="sm:col-span-2">
            <ClientTextField
              name="address_line_2"
              label="Complemento"
              register={register}
              error={getError("address_line_2")}
              autoComplete="address-line2"
            />
          </div>
          <ClientTextField
            name="city"
            label="Cidade"
            register={register}
            error={getError("city")}
            autoComplete="address-level2"
          />
          <ClientTextField
            name="region"
            label="Região"
            register={register}
            error={getError("region")}
            autoComplete="address-level1"
          />
          <ClientTextField
            name="postal_code"
            label="Código postal"
            register={register}
            error={getError("postal_code")}
            autoComplete="postal-code"
          />
          <ClientTextField
            name="country_code"
            label="Código do país"
            register={register}
            error={getError("country_code")}
            placeholder="PT"
          />
        </div>
      </fieldset>

      <fieldset className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <legend className="px-1 text-base font-semibold text-slate-950">
          Observações
        </legend>
        <div className="mt-2">
          <ClientNotesField register={register} error={getError("notes")} />
        </div>
      </fieldset>

      {formError ? (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link
          href={cancelHref}
          className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="min-h-11 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? isCreate
              ? "Criando..."
              : "Salvando..."
            : isCreate
              ? "Criar Cliente"
              : "Salvar alterações"}
        </button>
      </div>
    </form>
  );
}
