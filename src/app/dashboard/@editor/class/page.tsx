"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

// Default component for @editor parallel route when on class pages
export default function EditorClass() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden z-0">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full z-0">
        <Header
          pageTitle="Class Management"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto z-0">
          <div className="space-y-6 z-0 relative">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Class Management Tools
              </h2>
              <p className="text-gray-600">
                This section will contain class-specific editor tools and
                functionality.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
