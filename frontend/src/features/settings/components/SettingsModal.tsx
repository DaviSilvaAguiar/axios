"use client";

import { useEffect, useState } from "react";
import { ArrowUUpLeft, Wallet, Gear, CircleNotch, X } from "@phosphor-icons/react";
import Modal from "@/ui/Modal";
import Button from "@/ui/Button";
import { toast } from "@/lib/toast";
import { useSettings } from "@/contexts/SettingContext";
import { listSettingsApi, updateConfigApi } from "../settings.api";
import type { Config } from "../settings.types";

interface Props {
  open: boolean;
  onClose: () => void;
}

type ModuleKey = "general" | "reimbursement" | "expense_report";

const MODULES: { key: ModuleKey; label: string; icon: typeof Wallet }[] = [
  { key: "general", label: "General", icon: Gear },
  { key: "reimbursement", label: "Reimbursement", icon: ArrowUUpLeft },
  { key: "expense_report", label: "Expense Report", icon: Wallet },
];

const CONFIGS_BY_MODULE: Record<ModuleKey, string[]> = {
  general: ["require_erp_code"],
  reimbursement: ["enable_geolocation_reimbursement_item"],
  expense_report: ["enable_geolocation_expense_report_item"],
};

const MODULE_SUFFIXES = ["_rcm", "_rdc"];

function formatParameterLabel(parametro: string): string {
  let base = parametro;
  for (const suffix of MODULE_SUFFIXES) {
    if (base.endsWith(suffix)) {
      base = base.slice(0, -suffix.length);
      break;
    }
  }
  return base
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function SettingsModal({ open, onClose }: Props) {
  const { reload: reloadContextSettings } = useSettings();
  const [originalSettings, setOriginalSettings] = useState<Config[]>([]);
  const [configs, setSettings] = useState<Config[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleKey>("general");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    listSettingsApi()
      .then((res) => {
        setOriginalSettings(res);
        setSettings(res);
      })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Error loading settings."))
      .finally(() => setLoading(false));
  }, [open]);

  function handleToggle(config: Config) {
    const nextValue = config.value === 1 ? 0 : 1;
    setSettings((prev) => prev.map((c) => (c.id === config.id ? { ...c, value: nextValue } : c)));
  }

  function getChanges(): Config[] {
    return configs.filter((current) => {
      const original = originalSettings.find((o) => o.id === current.id);
      return original && original.value !== current.value;
    });
  }

  async function handleSave() {
    const changes = getChanges();
    if (changes.length === 0) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      const results = await Promise.all(
        changes.map((c) => updateConfigApi(c.id, c.value)),
      );
      setSettings((prev) =>
        prev.map((c) => {
          const updated = results.find((r) => r.id === c.id);
          return updated ?? c;
        }),
      );
      setOriginalSettings((prev) =>
        prev.map((c) => {
          const updated = results.find((r) => r.id === c.id);
          return updated ?? c;
        }),
      );
      await reloadContextSettings();
      toast.success("Settings saved.");
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to save the settings.");
    } finally {
      setSaving(false);
    }
  }

  function handleClose() {
    if (saving) return;
    setSettings(originalSettings);
    onClose();
  }

  const moduleParameters = CONFIGS_BY_MODULE[activeModule];
  const moduleSettings = configs.filter((c) => moduleParameters.includes(c.parameter));
  const hasChanges = getChanges().length > 0;

  return (
    <Modal open={open} onClose={handleClose} className="!max-w-4xl">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 py-5 border-b border-app-border">
          <h2 className="text-feature-title text-app-text">Settings</h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="text-app-text-muted hover:text-app-text transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row min-h-[420px]">
          <aside className="md:w-56 md:border-r border-app-border md:border-b-0 border-b">
            <ul className="p-3 space-y-0.5">
              {MODULES.map(({ key, label, icon: Icon }) => {
                const active = activeModule === key;
                return (
                  <li key={key}>
                    <button
                      onClick={() => setActiveModule(key)}
                      className={[
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
                        active
                          ? "bg-app-nav-active text-brand"
                          : "text-app-text-muted hover:text-app-text hover:bg-app-hover",
                      ].join(" ")}
                    >
                      <Icon size={18} weight={active ? "fill" : "regular"} />
                      <span>{label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <section className="flex-1 p-6">
            {loading ? (
              <div className="flex items-center justify-center h-full text-app-text-muted">
                <CircleNotch size={22} className="animate-spin" />
              </div>
            ) : moduleSettings.length === 0 ? (
              <p className="text-body-sm text-app-text-muted">
                No settings available for this module.
              </p>
            ) : (
              <ul className="space-y-3">
                {moduleSettings.map((config) => (
                  <li
                    key={config.id}
                    className="flex items-start justify-between gap-4 p-4 rounded-xl border border-app-border bg-app-surface-raised"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-body-sm font-medium text-app-text">
                        {formatParameterLabel(config.parameter)}
                      </p>
                      <p className="text-caption text-app-text-muted mt-1">
                        {config.description}
                      </p>
                    </div>
                    <button
                      onClick={() => handleToggle(config)}
                      aria-pressed={config.value === 1}
                      className={[
                        "relative shrink-0 w-11 h-6 rounded-full transition-colors cursor-pointer",
                        config.value === 1 ? "bg-brand" : "bg-app-border",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform",
                          config.value === 1 ? "translate-x-5" : "translate-x-0",
                        ].join(" ")}
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-app-border">
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
