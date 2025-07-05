"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MyClasses from "@/components/teacher/my-classes";
import { useState } from "react";

export default function ClassesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header pageTitle="Classes" onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          <MyClasses fullView={true} />
        </main>
      </div>
    </div>
  );
}
