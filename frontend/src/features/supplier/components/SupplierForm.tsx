"use client";

import { useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/ui/Input";
import ActiveBadge from "@/ui/ActiveBadge";
import TaxIdInput from "@/ui/TaxIdInput";
import ModalForm from "@/ui/ModalForm";
import { apenasDigitos, maskCpfCnpj } from "@/lib/masks";
import { toast } from "@/lib/toast";
import { useSettings } from "@/contexts/SettingContext";
import {
  buildSupplierFormSchema,
  type Supplier,
  type SupplierFormData,
  type TipoPessoa,
} from "../supplier.types";
import { consultarCnpjApi } from "../supplier.api";

interface Props {
  supplier?: Supplier;
  onSave: (data: SupplierFormData) => Promise<void>;
  onCancel: () => void;
}

export default function SupplierForm({ supplier, onSave, onCancel }: Props) {
  const { isEnabled } = useSettings();
  const erpCodeRequired = isEnabled("require_erp_code");
  const schema = useMemo(
    () => buildSupplierFormSchema(erpCodeRequired),
    [erpCodeRequired],
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      description: supplier?.description ?? "",
      tax_id:      supplier ? maskCpfCnpj(supplier.tax_id) : "",
      person_type: supplier?.person_type ?? "J",
      email:       supplier?.email ?? "",
      phone:       supplier?.phone ?? "",
      postal_code: supplier?.postal_code ?? "",
      street:      supplier?.street ?? "",
      number:      supplier?.number ?? "",
      complement:  supplier?.complement ?? "",
      district:    supplier?.district ?? "",
      city:        supplier?.city ?? "",
      uf:          supplier?.uf ?? "",
      erp_code:    supplier?.erp_code ?? "",
      active:      supplier?.active ?? true,
    },
  });

  const lastLookedUpCnpj = useRef<string>(supplier?.tax_id ?? "");

  useEffect(() => {
    lastLookedUpCnpj.current = supplier?.tax_id ?? "";
    reset({
      description: supplier?.description ?? "",
      tax_id:      supplier ? maskCpfCnpj(supplier.tax_id) : "",
      person_type: supplier?.person_type ?? "J",
      email:       supplier?.email ?? "",
      phone:       supplier?.phone ?? "",
      postal_code: supplier?.postal_code ?? "",
      street:      supplier?.street ?? "",
      number:      supplier?.number ?? "",
      complement:  supplier?.complement ?? "",
      district:    supplier?.district ?? "",
      city:        supplier?.city ?? "",
      uf:          supplier?.uf ?? "",
      erp_code:    supplier?.erp_code ?? "",
      active:      supplier?.active ?? true,
    });
  }, [supplier, reset]);

  const personType = watch("person_type");
  const taxId      = watch("tax_id");
  const active     = watch("active");

  useEffect(() => {
    if (personType !== "J") return;

    const digits = apenasDigitos(taxId);
    if (digits.length !== 14) return;
    if (lastLookedUpCnpj.current === digits) return;

    lastLookedUpCnpj.current = digits;
    const toastId = toast.loading("Fetching supplier data…");

    consultarCnpjApi(digits)
      .then((result) => {
        if (!result) {
          toast.error("Supplier data not found.", { id: toastId });
          return;
        }
        const current = getValues();
        const fillIfEmpty = (field: keyof SupplierFormData, value: string | null) => {
          if (value && !current[field]) {
            setValue(field, value, { shouldValidate: true });
          }
        };
        fillIfEmpty("description", result.description);
        fillIfEmpty("email",       result.email);
        fillIfEmpty("phone",       result.phone);
        fillIfEmpty("postal_code", result.postal_code);
        fillIfEmpty("street",      result.street);
        fillIfEmpty("number",      result.number);
        fillIfEmpty("complement",  result.complement);
        fillIfEmpty("district",    result.district);
        fillIfEmpty("city",        result.city);
        fillIfEmpty("uf",          result.uf);
        toast.success("Data received successfully.", { id: toastId });
      });
  }, [taxId, personType, getValues, setValue]);

  function changeType(next: TipoPessoa) {
    if (next === personType) return;
    setValue("person_type", next, { shouldValidate: false });
    setValue("tax_id", "", { shouldValidate: false });
    lastLookedUpCnpj.current = "";
  }

  function onChangeTaxId(value: string) {
    const maxDigits = personType === "F" ? 11 : 14;
    const digits = apenasDigitos(value).slice(0, maxDigits);
    setValue("tax_id", maskCpfCnpj(digits), { shouldValidate: true });
  }

  return (
    <ModalForm
      titulo={supplier ? "Edit Supplier" : "New Supplier"}
      onCancelar={onCancel}
      onSubmit={handleSubmit(onSave)}
      submitting={isSubmitting}
    >
      <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-caption font-semibold text-app-text-muted">Entity type</span>
            <div className="inline-flex rounded-xl border border-app-border bg-app-surface p-0.5 w-fit">
              {(["J", "F"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => changeType(t)}
                  className={[
                    "rounded-lg px-4 py-[7px] text-body-sm font-medium transition-colors cursor-pointer",
                    personType === t
                      ? "bg-brand text-white"
                      : "text-app-text-muted hover:text-app-text",
                  ].join(" ")}
                >
                  {t === "J" ? "Company" : "Individual"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <TaxIdInput
              label={personType === "J" ? "CNPJ" : "CPF"}
              value={taxId}
              onChange={onChangeTaxId}
              error={errors.tax_id?.message}
              placeholder={personType === "J" ? "00.000.000/0000-00" : "000.000.000-00"}
            />
          </div>
        </div>

        <Input
          label={personType === "J" ? "Legal Name" : "Name"}
          placeholder="Supplier description"
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="contact@company.com"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Phone"
            placeholder="(00) 00000-0000"
            error={errors.phone?.message}
            {...register("phone")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr_120px] gap-4">
          <Input
            label="Postal Code"
            placeholder="00000000"
            error={errors.postal_code?.message}
            {...register("postal_code")}
          />
          <Input
            label="Street"
            placeholder="Street, avenue…"
            error={errors.street?.message}
            {...register("street")}
          />
          <Input
            label="Number"
            placeholder="123"
            error={errors.number?.message}
            {...register("number")}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_80px] gap-4">
          <Input
            label="Complement"
            placeholder="Suite, floor…"
            error={errors.complement?.message}
            {...register("complement")}
          />
          <Input
            label="District"
            placeholder="District"
            error={errors.district?.message}
            {...register("district")}
          />
          <Input
            label="City"
            placeholder="City"
            error={errors.city?.message}
            {...register("city")}
          />
          <Input
            label="State"
            placeholder="SP"
            maxLength={2}
            error={errors.uf?.message}
            {...register("uf")}
          />
        </div>

        <Input
          label="ERP Code"
          placeholder="Contact ID in the target ERP"
          error={errors.erp_code?.message}
          {...register("erp_code")}
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-caption font-semibold text-app-text-muted">Status</span>
          <button
            type="button"
            onClick={() => setValue("active", !active)}
            className="w-fit cursor-pointer transition-opacity hover:opacity-80"
          >
            <ActiveBadge ativo={active} />
          </button>
        </div>

    </ModalForm>
  );
}
