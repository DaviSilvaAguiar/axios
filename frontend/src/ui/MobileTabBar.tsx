"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HouseLine, Receipt, Plus } from "@phosphor-icons/react";
import FabActionSheet from "@/ui/FabActionSheet";

export default function MobileTabBar() {
  const pathname = usePathname();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isHome = pathname === "/dashboard";
  const isEntries =
    pathname.startsWith("/my-submissions") ||
    pathname.startsWith("/my-reimbursements") ||
    pathname.startsWith("/my-expense-reports");

  return (
    <>
      <nav
        role="tablist"
        aria-label="Main navigation"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-app-surface border-t border-app-border-subtle"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="grid grid-cols-3 items-end h-16 max-w-md mx-auto">
          <Link
            href="/dashboard"
            role="tab"
            aria-current={isHome ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 h-full ${
              isHome ? "text-brand" : "text-app-text-muted"
            }`}
          >
            <HouseLine size={22} weight={isHome ? "fill" : "regular"} />
            <span className="text-small">Home</span>
          </Link>

          <div className="flex items-center justify-center -translate-y-3">
            <button
              aria-label="New entry"
              onClick={() => setSheetOpen(true)}
              className="h-14 w-14 rounded-full bg-brand text-white flex items-center justify-center shadow-lg shadow-brand/30 active:scale-95 transition-transform"
            >
              <Plus size={26} weight="bold" />
            </button>
          </div>

          <Link
            href="/my-submissions"
            role="tab"
            aria-current={isEntries ? "page" : undefined}
            className={`flex flex-col items-center justify-center gap-1 h-full ${
              isEntries ? "text-brand" : "text-app-text-muted"
            }`}
          >
            <Receipt size={22} weight={isEntries ? "fill" : "regular"} />
            <span className="text-small">Entries</span>
          </Link>
        </div>
      </nav>
      <FabActionSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}
