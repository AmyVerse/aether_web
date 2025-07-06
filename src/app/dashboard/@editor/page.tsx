"use client";
import TimetableGrid from "@/components/dashboard/timetable-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import {
  FaCalendarAlt,
  FaChalkboardTeacher,
  FaDoorOpen,
  FaTable,
  FaUserGraduate,
} from "react-icons/fa";

// Import the modals we'll create
import { AddRoomModal } from "@/components/editor/add-room-modal";
import AddStudentModal from "@/components/editor/add-student-modal";
import { AddTeacherModal } from "@/components/editor/add-teacher-modal";
import { TimetableEntryModal } from "@/components/editor/timetable-entry-modal";

export default function EditorDashboard() {
  const [currentView, setCurrentView] = useState<"timetable" | "overview">(
    "timetable",
  );
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [semesterType, setSemesterType] = useState<"odd" | "even">("even");

  // Modal states
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddTeacherModal, setShowAddTeacherModal] = useState(false);
  const [showAddRoomModal, setShowAddRoomModal] = useState(false);
  const [showTimetableEntryModal, setShowTimetableEntryModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    timeSlot: string;
    roomId?: string;
  } | null>(null);

  // Handle timetable cell click
  const handleCellClick = (day: string, timeSlot: string, roomId?: string) => {
    setSelectedCell({ day, timeSlot, roomId });
    setShowTimetableEntryModal(true);
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="space-y-6 relative">
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
                    width="auto"
                    padding="px-3 py-2"
                    font="text-sm"
                  >
                    <FaTable className="mr-2" />
                    Timetable
                  </Button>
                  <Button
                    variant={currentView === "overview" ? "default" : "outline"}
                    onClick={() => setCurrentView("overview")}
                    width="auto"
                    padding="px-3 py-2"
                    font="text-sm"
                  >
                    <FaCalendarAlt className="mr-2" />
                    Overview
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 ml-auto">
                <Button
                  onClick={() => setShowAddStudentModal(true)}
                  variant="outline"
                  width="auto"
                  padding="px-3 py-2"
                  font="text-sm"
                >
                  <FaUserGraduate className="mr-2" />
                  Add Student
                </Button>
                <Button
                  onClick={() => setShowAddTeacherModal(true)}
                  variant="outline"
                  width="auto"
                  padding="px-3 py-2"
                  font="text-sm"
                >
                  <FaChalkboardTeacher className="mr-2" />
                  Add Teacher
                </Button>
                <Button
                  onClick={() => setShowAddRoomModal(true)}
                  variant="outline"
                  width="auto"
                  padding="px-3 py-2"
                  font="text-sm"
                >
                  <FaDoorOpen className="mr-2" />
                  Add Room
                </Button>
              </div>

              {/* Quick Stats */}
              <div className="flex items-center gap-6">
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
            onCellClick={handleCellClick}
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

        {/* Modals */}
        <AddStudentModal
          isOpen={showAddStudentModal}
          onCloseAction={() => setShowAddStudentModal(false)}
        />
        <AddTeacherModal
          isOpen={showAddTeacherModal}
          onCloseAction={() => setShowAddTeacherModal(false)}
          onTeacherAddedAction={() => {
            console.log("Teacher added successfully");
          }}
        />
        <AddRoomModal
          isOpen={showAddRoomModal}
          onCloseAction={() => setShowAddRoomModal(false)}
          onRoomAddedAction={() => {
            console.log("Room added successfully");
          }}
        />
        <TimetableEntryModal
          isOpen={showTimetableEntryModal}
          onCloseAction={() => setShowTimetableEntryModal(false)}
          onEntryAddedAction={() => {
            console.log("Timetable entry added successfully");
          }}
          prefilledData={
            selectedCell
              ? {
                  day: selectedCell.day,
                  timeSlot: selectedCell.timeSlot,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
