"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ContentLoader from "@/components/ui/content-loader";
import { useCachedSession } from "@/hooks/useSessionCache";
import { ReactNode, useState } from "react";

interface DashboardWrapperProps {
  children: ReactNode;
}

export default function DashboardWrapper({ children }: DashboardWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { userRole, isLoading } = useCachedSession();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userRole={userRole}
      />

      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-auto bg-white">
          {isLoading ? (
            <ContentLoader message="Loading dashboard..." />
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}
