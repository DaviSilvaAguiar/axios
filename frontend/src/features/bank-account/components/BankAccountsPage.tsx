"use client";

import { Bank } from "@phosphor-icons/react";
import CrudResourcePage from "@/ui/CrudResourcePage";
import BankAccountForm from "./BankAccountForm";
import { useBankAccounts, useBankAccountMutations } from "../bank-account.hooks";
import type { BankAccount, BankAccountFormData } from "../bank-account.types";

export default function BankAccountsPage() {
  const list = useBankAccounts();
  const mutations = useBankAccountMutations();

  return (
    <CrudResourcePage<BankAccount, BankAccountFormData>
      title="Bank Accounts"
      newLabel="New Bank Account"
      searchPlaceholder="Search by description or ERP code…"
      icon={Bank}
      messages={{
        created: "Bank account created.",
        updated: "Bank account updated.",
        removed: "Bank account removed.",
        activated: "Bank account activated.",
        deactivated: "Bank account deactivated.",
        statusError: "Could not change the status.",
        removeError: "Could not remove the bank account.",
        deleteTitle: "Remove bank account",
        emptyTitle: "No bank accounts found",
      }}
      list={list}
      mutations={mutations}
      renderForm={(bankAccount, onSave, onCancel) => (
        <BankAccountForm bankAccount={bankAccount} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}
