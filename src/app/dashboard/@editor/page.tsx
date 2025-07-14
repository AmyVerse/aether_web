"use client";

import ClassroomAllocationTable from "@/components/editor/classroom-allocation-table";
import TimetableGrid from "@/components/editor/timetable-grid";
import { useSessionStore } from "@/store/useSessionStore";
import { useState } from "react";

export default function EditorDashboard() {
  const academicYear = useSessionStore((s) => s.academicYear);
  const setAcademicYear = useSessionStore((s) => s.setAcademicYear);
  const semesterType = useSessionStore((s) => s.semesterType);
  const setSemesterType = useSessionStore((s) => s.setSemesterType);
  const [activeTab, setActiveTab] = useState<"allocations" | "timetable">(
    "allocations",
  );

  return (
    <>
      <section>
        {/* Page Title - Header-like appearance */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm font-[manrope] text-gray-600 mt-1">
              Manage classroom allocations and timetable scheduling
            </p>
          </div>
          {/* Academic Year & Semester Filter */}
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Academic Year:
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm w-32"
              >
                {/* Generate 3 years: previous, current, next in 2024-2025 format */}
                {(() => {
                  const now = new Date();
                  const y = now.getFullYear();
                  const years = [
                    `${y - 3}-${y - 2}`,
                    `${y - 2}-${y - 1}`,
                    `${y - 1}-${y}`,
                    `${y}-${y + 1}`,
                  ];
                  return years.map((yy) => (
                    <option key={yy} value={yy}>
                      {yy}
                    </option>
                  ));
                })()}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Semester:
              </label>
              <select
                value={semesterType}
                onChange={(e) =>
                  setSemesterType(e.target.value as "odd" | "even")
                }
                className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm w-16"
              >
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pt-6">
          <div className="flex space-x-1 border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab("allocations")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "allocations"
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Classroom Allocations
            </button>
            <button
              onClick={() => setActiveTab("timetable")}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "timetable"
                  ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Timetable Grid
            </button>
          </div>
        </div>

        <div className="px-3 sm:px-4 md:px-6 lg:px-8 pb-6">
          {activeTab === "allocations" && <ClassroomAllocationTable />}
          {activeTab === "timetable" && <TimetableGrid />}
        </div>
      </section>
    </>
  );
}
