"use client";
import TimetableGrid from "@/components/dashboard/timetable-grid";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useSessionStore } from "@/store/useSessionStore";
import { useState } from "react";
import {
  FaChalkboardTeacher,
  FaDoorOpen,
  FaUserGraduate,
} from "react-icons/fa";

// Import the modals we'll create
import { AddRoomModal } from "@/components/editor/add-room-modal";
import AddStudentModal from "@/components/editor/add-student-modal";
import { AddTeacherModal } from "@/components/editor/add-teacher-modal";
import { TimetableEntryModal } from "@/components/editor/timetable-entry-modal";
import Head from "next/head";

export default function EditorDashboard() {
  // Zustand for global session state
  const academicYear = useSessionStore((s) => s.academicYear);
  const setAcademicYear = useSessionStore((s) => s.setAcademicYear);
  const semesterType = useSessionStore((s) => s.semesterType);
  const setSemesterType = useSessionStore((s) => s.setSemesterType);
  const [currentView, setCurrentView] = useState<"timetable" | "overview">(
    "timetable",
  );

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

  // Add a state to trigger TimetableGrid refresh
  const [timetableRefreshKey, setTimetableRefreshKey] = useState(0);

  // Handle timetable cell click
  const handleCellClick = (day: string, timeSlot: string, roomId?: string) => {
    setSelectedCell({ day, timeSlot, roomId });
    setShowTimetableEntryModal(true);
  };
  const { showSuccess, showError } = useToast();

  return (
    <>
      {/* Modals */}
      <AddStudentModal
        isOpen={showAddStudentModal}
        onCloseAction={() => setShowAddStudentModal(false)}
      />
      <AddTeacherModal
        isOpen={showAddTeacherModal}
        onCloseAction={() => setShowAddTeacherModal(false)}
        onTeacherAddedAction={() => {
          showSuccess("Teacher added successfully");
        }}
      />
      <AddRoomModal
        isOpen={showAddRoomModal}
        onCloseAction={() => setShowAddRoomModal(false)}
        onRoomAddedAction={() => {
          showSuccess("Room added successfully");
        }}
      />
      <TimetableEntryModal
        isOpen={showTimetableEntryModal}
        onCloseAction={() => setShowTimetableEntryModal(false)}
        onEntryAddedAction={() => {
          showSuccess("Timetable entry added successfully");
          setTimetableRefreshKey((k) => k + 1); // trigger grid refresh
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
      <Head>
        <title>Dashboard | Aether</title>
      </Head>
      <section>
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm font-[manrope] text-gray-600 mt-1">
              Welcome to your editor dashboard
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
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end px-4 py-3 rounded-lg mb-8">
          {/* Quick Actions */}
          <div className="flex items-end gap-2 w-full sm:w-auto justify-end">
            <Button
              onClick={() => setShowAddStudentModal(true)}
              variant="outline"
              width="auto"
              padding="px-3 py-2"
              font="text-sm"
            >
              <FaUserGraduate className="mr-2" /> Add Student
            </Button>
            <Button
              onClick={() => setShowAddTeacherModal(true)}
              variant="outline"
              width="auto"
              padding="px-3 py-2"
              font="text-sm"
            >
              <FaChalkboardTeacher className="mr-2" /> Add Teacher
            </Button>
            <Button
              onClick={() => setShowAddRoomModal(true)}
              variant="outline"
              width="auto"
              padding="px-3 py-2"
              font="text-sm"
            >
              <FaDoorOpen className="mr-2" /> Add Room
            </Button>
          </div>
        </div>
        {/* Main Content */}
        <section className="p-3 sm:p-4 md:p-6 lg:p-8">
          <TimetableGrid
            onCellClick={handleCellClick}
            refreshKey={timetableRefreshKey}
          />
        </section>
      </section>
    </>
  );
}
