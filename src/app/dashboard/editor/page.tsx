"use client";
import TimetableGrid from "@/components/dashboard/timetable-grid";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaTable,
} from "react-icons/fa";

export default function EditorDashboard() {
  const [currentView, setCurrentView] = useState<"timetable" | "overview">(
    "timetable",
  );
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [semesterType, setSemesterType] = useState<"odd" | "even">("even");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <DashboardLayout
      title="Editor Dashboard"
      subtitle="Manage timetables and class schedules"
    >
      <div className="flex gap-6">
        {/* Sidebar */}
        <div
          className={`${sidebarCollapsed ? "w-16" : "w-80"} transition-all duration-300 flex-shrink-0`}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle
                className={`text-lg ${sidebarCollapsed ? "hidden" : "block"}`}
              >
                Controls
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              >
                {sidebarCollapsed ? <FaChevronRight /> : <FaChevronDown />}
              </Button>
            </CardHeader>

            {!sidebarCollapsed && (
              <CardContent className="space-y-6">
                {/* Academic Year & Semester */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">
                    Academic Session
                  </h3>
                  <div className="space-y-2">
                    <select
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="2024-25">2024-25</option>
                      <option value="2023-24">2023-24</option>
                      <option value="2025-26">2025-26</option>
                    </select>

                    <select
                      value={semesterType}
                      onChange={(e) =>
                        setSemesterType(e.target.value as "odd" | "even")
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="odd">Odd Semester</option>
                      <option value="even">Even Semester</option>
                    </select>
                  </div>
                </div>

                {/* View Toggle */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">View Mode</h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant={
                        currentView === "timetable" ? "default" : "outline"
                      }
                      onClick={() => setCurrentView("timetable")}
                      className="w-full justify-start"
                    >
                      <FaTable className="mr-2" />
                      Timetable View
                    </Button>
                    <Button
                      variant={
                        currentView === "overview" ? "default" : "outline"
                      }
                      onClick={() => setCurrentView("overview")}
                      className="w-full justify-start"
                    >
                      <FaCalendarAlt className="mr-2" />
                      Overview
                    </Button>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900">Quick Stats</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Rooms</span>
                      <span className="font-semibold">24</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Classes Today
                      </span>
                      <span className="font-semibold">156</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Conflicts</span>
                      <span className="font-semibold text-red-600">3</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1">
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
      </div>
    </DashboardLayout>
  );
}
