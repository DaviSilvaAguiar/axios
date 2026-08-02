"use client";

import { Tag } from "@phosphor-icons/react";
import CrudResourcePage from "@/ui/CrudResourcePage";
import ExpenseCategoryForm from "./ExpenseCategoryForm";
import { useExpenseCategories, useExpenseCategoryMutations } from "../expense-category.hooks";
import type { ExpenseCategory, ExpenseCategoryFormData } from "../expense-category.types";

export default function ExpenseCategoriesPage() {
  const list = useExpenseCategories();
  const mutations = useExpenseCategoryMutations();

  return (
    <CrudResourcePage<ExpenseCategory, ExpenseCategoryFormData>
      title="Expense Categories"
      newLabel="New Category"
      searchPlaceholder="Search by description or ERP code…"
      icon={Tag}
      messages={{
        created: "Category created.",
        updated: "Category updated.",
        removed: "Category removed.",
        activated: "Category activated.",
        deactivated: "Category deactivated.",
        statusError: "Could not change the status.",
        removeError: "Could not remove the category.",
        deleteTitle: "Remove category",
        emptyTitle: "No categories found",
      }}
      list={list}
      mutations={mutations}
      renderForm={(expenseCategory, onSave, onCancel) => (
        <ExpenseCategoryForm expenseCategory={expenseCategory} onSave={onSave} onCancel={onCancel} />
      )}
    />
  );
}
