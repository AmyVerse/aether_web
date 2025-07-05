"use client";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { useState } from "react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden z-0">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full z-0">
        <Header
          pageTitle="Admin Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto z-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 z-0 relative">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-6">
              {/* Admin specific content */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">System Overview</h2>
                <p className="text-gray-600">
                  Admin dashboard content will be implemented here.
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <CalendarWidget />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
