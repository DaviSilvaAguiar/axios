"use client";

import { useEffect, useState } from "react";
import Button from "@/ui/Button";
import Switch from "@/ui/Switch";
import { toast } from "@/lib/toast";
import {
  listModulosUserApi,
  updateModulosUserApi,
} from "@/features/module/module.api";
import type { Modulo } from "@/features/module/module.types";

interface Props {
  userId: number;
}

export default function UserModulesTab({ userId }: Props) {
  const [modules, setModules] = useState<Modulo[]>([]);
  const [enabled, setEnabled] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLoading(true);
    listModulosUserApi(userId)
      .then(({ modules: list, habilitados: ids }) => {
        setModules(list);
        setEnabled(new Set(ids));
      })
      .catch(() => toast.error("Could not load the modules."))
      .finally(() => setLoading(false));
  }, [userId]);

  function toggle(id: number) {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateModulosUserApi(userId, Array.from(enabled));
      toast.success("Modules updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 animate-pulse py-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center justify-between px-4 py-3 rounded-xl bg-app-surface-raised">
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-32 rounded bg-app-border" />
              <div className="h-3 w-48 rounded bg-app-border" />
            </div>
            <div className="h-6 w-11 rounded-full bg-app-border" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {modules.map((module) => {
          const active = enabled.has(module.id);
          return (
            <div
              key={module.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-app-border bg-app-surface-raised"
            >
              <div className="flex flex-col gap-0.5 mr-4">
                <span className="text-caption font-semibold text-app-text">{module.name}</span>
                {module.description && (
                  <span className="text-small text-app-text-muted">{module.description}</span>
                )}
              </div>
              <Switch
                checked={active}
                onChange={() => toggle(module.id)}
                label={active ? "Disable" : "Enable"}
              />
            </div>
          );
        })}
      </div>

      <div className="flex justify-end pt-2">
        <Button type="button" variant="dark" size="sm" disabled={saving} onClick={handleSave}>
          {saving ? "Saving…" : "Save modules"}
        </Button>
      </div>
    </div>
  );
}
