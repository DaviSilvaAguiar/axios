"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "@phosphor-icons/react";
import { AnimatePresence } from "framer-motion";
import Button from "@/ui/Button";
import Card from "@/ui/Card";
import Loading from "@/ui/Loading";
import { toast } from "@/lib/toast";
import FundsDashboard from "@/features/fund/components/FundsDashboard";
import FundForm from "@/features/fund/components/FundForm";
import { useFunds, useFundMutations } from "@/features/fund/fund.hooks";
import { type FundStatusFiltro } from "@/features/fund/fund.api";
import { type StoreFundFormData } from "@/features/fund/fund.types";

export default function FundsPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FundStatusFiltro>("abertos");
  const [showForm, setShowForm] = useState(false);

  const { data: funds = [], isLoading: loading } = useFunds(tab);
  const { create } = useFundMutations();

  async function handleCreate(data: StoreFundFormData) {
    await create.mutateAsync(data);
    setShowForm(false);
    toast.success("Fund created successfully!");
  }

  return (
    <>
      <div className="flex flex-col gap-4 p-6">
        <Card>
          <div className="flex items-center justify-between px-5 py-4">
            <h1 className="text-feature-title text-app-text">Fund Management</h1>
            <Button variant="dark" size="sm" onClick={() => setShowForm(true)}>
              <Plus size={14} />
              New Fund
            </Button>
          </div>

          <div className="flex items-center gap-3 border-t border-app-border px-5 py-3">
            <div className="flex rounded-xl border border-app-border bg-app-surface overflow-hidden">
              <button
                onClick={() => setTab("abertos")}
                className={`px-4 py-2 text-caption font-semibold transition-colors cursor-pointer ${
                  tab === "abertos"
                    ? "bg-app-surface-raised text-app-text"
                    : "text-app-text-muted hover:bg-app-hover"
                }`}
              >
                Open
              </button>
              <button
                onClick={() => setTab("fechados")}
                className={`px-4 py-2 text-caption font-semibold transition-colors cursor-pointer ${
                  tab === "fechados"
                    ? "bg-app-surface-raised text-app-text"
                    : "text-app-text-muted hover:bg-app-hover"
                }`}
              >
                Closed
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            {loading ? (
              <Loading />
            ) : (
              <FundsDashboard
                funds={funds}
                onSelectFund={(c) => router.push(`/funds/${c.id}`)}
                closed={tab === "fechados"}
              />
            )}
          </div>
        </Card>
      </div>

      <AnimatePresence>
        {showForm && (
          <FundForm
            onSave={handleCreate}
            onClose={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
