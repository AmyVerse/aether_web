"use client";
import CalendarWidget from "@/components/dashboard/calendar-widget";

export default function StudentDashboard() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          {/* Classes */}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <CalendarWidget />
        </div>
      </div>
    </div>
  );
}
