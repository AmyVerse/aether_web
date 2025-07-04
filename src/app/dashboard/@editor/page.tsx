"use client";
import TimetableGrid from "@/components/dashboard/timetable-grid";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { FaCalendarAlt, FaTable } from "react-icons/fa";

export default function EditorDashboard() {
  const [currentView, setCurrentView] = useState<"timetable" | "overview">(
    "timetable",
  );
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [semesterType, setSemesterType] = useState<"odd" | "even">("even");

  return (
    <DashboardLayout
      title="Editor Dashboard"
      subtitle="Manage timetables and class schedules"
    >
      <div className="space-y-6">
        {/* Controls Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-wrap items-center gap-6">
              {/* Academic Session Controls */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Academic Year:
                </label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2023-24">2023-24</option>
                  <option value="2025-26">2025-26</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  Semester:
                </label>
                <select
                  value={semesterType}
                  onChange={(e) =>
                    setSemesterType(e.target.value as "odd" | "even")
                  }
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="odd">Odd Semester</option>
                  <option value="even">Even Semester</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">
                  View:
                </label>
                <div className="flex gap-2">
                  <Button
                    variant={
                      currentView === "timetable" ? "default" : "outline"
                    }
                    onClick={() => setCurrentView("timetable")}
                    size="sm"
                  >
                    <FaTable className="mr-2" />
                    Timetable
                  </Button>
                  <Button
                    variant={currentView === "overview" ? "default" : "outline"}
                    onClick={() => setCurrentView("overview")}
                    size="sm"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Overview
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6 ml-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Total Rooms:</span>
                  <span className="text-sm font-semibold">24</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Classes Today:</span>
                  <span className="text-sm font-semibold">156</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Conflicts:</span>
                  <span className="text-sm font-semibold text-red-600">3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {currentView === "timetable" ? (
          <TimetableGrid
            academicYear={academicYear}
            semesterType={semesterType}
          />
        ) : (
          <div className="space-y-6">
            {/* Overview Content */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        Excel imported successfully
                      </p>
                      <p className="text-xs text-gray-600">
                        2024-25 Even Semester - 156 entries
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">
                      2 hours ago
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">
                        Room CR-201 schedule updated
                      </p>
                      <p className="text-xs text-gray-600">
                        Added CSE-A Semester 4 classes
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">
                      5 hours ago
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div>
                      <p className="text-sm font-medium">Conflict detected</p>
                      <p className="text-xs text-gray-600">
                        CR-102 double booking on Monday 10:00
                      </p>
                    </div>
                    <span className="text-xs text-gray-500 ml-auto">
                      1 day ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
