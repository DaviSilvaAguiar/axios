import { useCostCentersLookup } from "@/features/cost-center/cost-center.hooks";
import { useExpenseCategoriesLookup } from "@/features/expense-category/expense-category.hooks";
import { useUsersLookup } from "@/features/user/user.hooks";
import type { CostCenter, ExpenseCategory } from "../expense-report.types";
import type { User } from "@/features/auth/auth.types";

export interface Lookups {
  costCenters: CostCenter[];
  categories: ExpenseCategory[];
  users: User[];
}

export function useLookups(): Lookups {
  const costCenters = useCostCentersLookup();
  const categories = useExpenseCategoriesLookup();
  const users = useUsersLookup();

  return {
    costCenters: costCenters.data ?? [],
    categories: categories.data ?? [],
    users: users.data ?? [],
  };
}
