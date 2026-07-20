export const queryKeys = {
  me: ["me"] as const,

  funds: {
    all: ["funds"] as const,
    list: (status: string) => ["funds", "list", status] as const,
    detail: (id: number) => ["funds", "detail", id] as const,
    statement: (id: number) => ["funds", "statement", id] as const,
  },

  reimbursements: {
    all: ["reimbursements"] as const,
    list: (filters: unknown) => ["reimbursements", "list", filters] as const,
    detail: (id: number) => ["reimbursements", "detail", id] as const,
  },

  expenseReports: {
    all: ["expense-reports"] as const,
    list: ["expense-reports", "list"] as const,
    detail: (id: number) => ["expense-reports", "detail", id] as const,
  },

  submissions: {
    all: ["submissions"] as const,
    list: (filter: string) => ["submissions", "list", filter] as const,
    recent: ["submissions", "recent"] as const,
    summary: (filter: string) => ["submissions", "summary", filter] as const,
  },

  dashboard: {
    all: ["dashboard"] as const,
    overview: (period: string) => ["dashboard", "overview", period] as const,
    pendingApproval: ["dashboard", "pending-approval"] as const,
  },

  settings: ["settings"] as const,

  users: {
    all: ["users"] as const,
    list: ["users", "list"] as const,
    lookup: ["users", "lookup"] as const,
    count: ["users", "count"] as const,
    modules: (userId: number) => ["users", "modules", userId] as const,
  },

  suppliers: {
    all: ["suppliers"] as const,
    list: ["suppliers", "list"] as const,
    active: ["suppliers", "active"] as const,
  },

  costCenters: {
    all: ["cost-centers"] as const,
    list: ["cost-centers", "list"] as const,
    lookup: ["cost-centers", "lookup"] as const,
  },

  expenseCategories: {
    all: ["expense-categories"] as const,
    list: ["expense-categories", "list"] as const,
    lookup: ["expense-categories", "lookup"] as const,
  },

  bankAccounts: {
    all: ["bank-accounts"] as const,
    list: ["bank-accounts", "list"] as const,
  },

  export: {
    all: ["export"] as const,
    pendingStats: ["export", "pending-stats"] as const,
    integrations: ["export", "integrations"] as const,
    pendingExpenseReports: ["export", "pending-expense-reports"] as const,
    pendingReimbursements: ["export", "pending-reimbursements"] as const,
    history: ["export", "history"] as const,
  },
} as const;
