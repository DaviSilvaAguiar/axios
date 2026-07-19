import { useEffect, useState } from "react";
import { listCentrosDeCustoApi, listCategoriasDespesaApi } from "../expense-report.api";
import { listUsersApi } from "@/features/user/user.api";
import type { CostCenter, ExpenseCategory } from "../expense-report.types";
import type { User } from "@/features/auth/auth.types";

export interface Lookups {
  costCenters: CostCenter[];
  categories: ExpenseCategory[];
  users: User[];
}

export function useLookups(): Lookups {
  const [costCenters, setCostCenters] = useState<CostCenter[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      listCentrosDeCustoApi(1, 1000),
      listCategoriasDespesaApi(1, 1000),
      listUsersApi(1, 200),
    ]).then(([costCentersResult, categoriesResult, usersResult]) => {
      if (cancelled) return;
      setCostCenters(costCentersResult.data);
      setCategories(categoriesResult.data.filter((c) => c.active));
      setUsers(usersResult.data.filter((u) => u.active));
    }).catch(() => {});

    return () => { cancelled = true; };
  }, []);

  return { costCenters, categories, users };
}
