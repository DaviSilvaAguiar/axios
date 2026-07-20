"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/ui/Sidebar";
import Header from "@/ui/Header";
import MobileHeader from "@/ui/MobileHeader";
import MobileTabBar from "@/ui/MobileTabBar";

interface Props {
  children: ReactNode;
  userCount?: number;
}

export default function AppChrome({ children, userCount = 0 }: Props) {
  const { user } = useAuth();
  const isProvider = user?.role === 3;

  if (!isProvider) {
    return (
      <div className="flex h-screen overflow-hidden bg-app-bg">
        <Sidebar userCount={userCount} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-app-bg">
      <div className="hidden md:flex">
        <Sidebar userCount={userCount} />
      </div>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <div className="hidden md:block">
          <Header />
        </div>
        <MobileHeader />
        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}
