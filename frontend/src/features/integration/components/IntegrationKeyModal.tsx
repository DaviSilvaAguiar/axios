"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Key } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import Input from "@/ui/Input";
import { toast } from "@/lib/toast";
import { saveKeyFormSchema, type SaveKeyForm, type Integration } from "../integration.types";
import { saveKeyIntegrationApi } from "../integration.api";

interface Props {
  integration: Integration;
  onClose: () => void;
  onSaved: () => void;
}

export default function IntegrationKeyModal({ integration, onClose, onSaved }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SaveKeyForm>({
    resolver: zodResolver(saveKeyFormSchema),
    defaultValues: { key: "" },
  });

  async function onSubmit(data: SaveKeyForm) {
    try {
      await saveKeyIntegrationApi(integration.id, data.key);
      toast.success("Integration key saved successfully.");
      onSaved();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save the key.");
    }
  }

  return (
    <Modal open onClose={onClose} className="max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5">
        <div className="mb-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/[0.08]">
              <Key size={18} weight="duotone" className="text-brand" />
            </div>
            <div className="flex flex-col gap-0.5">
              <h1 className="text-feature-title text-app-text">Configure token</h1>
              <p className="text-small text-app-text-muted">{integration.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-app-text-muted hover:bg-app-hover"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <Input
            label="Authentication token"
            type="text"
            placeholder="Paste the token provided by the integration"
            autoComplete="off"
            spellCheck={false}
            error={errors.key?.message}
            {...register("key")}
          />
          <p className="text-small text-app-text-subtle">
            The token is encrypted before being stored in the database.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="light" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="dark" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
