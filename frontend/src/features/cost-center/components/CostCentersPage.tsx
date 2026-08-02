"use client";

import { Buildings } from "@phosphor-icons/react";
import CrudResourcePage from "@/ui/CrudResourcePage";
import CostCenterForm from "./CostCenterForm";
import { useCostCenters, useCostCenterMutations } from "../cost-center.hooks";
import type { CostCenter, CostCenterFormData } from "../cost-center.types";

export default function CostCentersPage() {
  const list = useCostCenters();
  const mutations = useCostCenterMutations();

  return (
    <CrudResourcePage<CostCenter, CostCenterFormData>
      title="Cost Centers"
      newLabel="New Cost Center"
      searchPlaceholder="Search by description or ERP code…"
      icon={Buildings}
      messages={{
        created: "Cost center created.",
        updated: "Cost center updated.",
        removed: "Cost center removed.",
        activated: "Cost center activated.",
        deactivated: "Cost center deactivated.",
        statusError: "Could not change the status.",
        removeError: "Could not remove the cost center.",
        deleteTitle: "Remove cost center",
        emptyTitle: "No cost centers found",
      }}
      list={list}
      mutations={mutations}
      renderForm={(costCenter, onSave, onCancel) => (
        <CostCenterForm costCenter={costCenter} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}
