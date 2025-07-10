"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import {
  FaArrowLeft,
  FaBook,
  FaCalendarAlt,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaPlus,
} from "react-icons/fa";

interface ClassDetails {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  day?: string; // fallback for legacy
  time_slot?: string; // fallback for legacy
  room_number: string;
  academic_year: string;
  semester_type: string;
  notes?: string;
  timings?: { day: string; time_slot: string }[]; // normalized timings
}

interface ClassDescriptionProps {
  classDetails: ClassDetails;
  studentCount: number;
  onBack?: () => void;
}

export default function ClassDescription({
  classDetails,
  studentCount,
  onBack,
}: ClassDescriptionProps) {
  const { showSuccess, showError } = useToast();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  const handleCreateSession = async () => {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    try {
      const response = await fetch(
        `/api/teacher/classes/${classDetails.id}/sessions`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            start_time: currentTime,
            notes: "Session created from class detail view",
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");
        window.location.href = `/dashboard/class/${classDetails.id}/session/${data.data.id}`;
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create session");
      }
    } catch (error) {
      showError("An error occurred while creating session");
    }
  };

  return (
    <div>
      {/* Page Title - Header-like appearance matching dashboard/class pages */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            className="flex items-center bg-gray-100/50 gap-2 px-3 py-2 text-sm border border-gray-300 hover:border-gray-400 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Classes</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
            {classDetails.subject_name}
          </h1>
          <Button
            onClick={handleCreateSession}
            className="flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Session</span>
            <span className="sm:hidden">Session</span>
          </Button>
        </div>

        {/* Class Labels - More compact and integrated */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="font-mono bg-gray-100/80 px-3 py-1.5 rounded-md font-medium text-sm">
            {classDetails.subject_code}
          </span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md font-medium text-sm">
            {classDetails.branch}
          </span>
          <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-md font-medium text-sm">
            Section {classDetails.section}
          </span>
          <span className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-md font-medium text-sm">
            {studentCount} Students
          </span>
        </div>
      </div>

      <div className="p-3 sm:p-4 md:p-6">
        {/* Detailed Information Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <FaBook className="text-blue-600" />
            Class Information
          </h2>

          <div className="grid grid-cols-2 gap-6">
            {/* Academic Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Academic Details
              </h3>
              <div className="grid sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <FaGraduationCap className="text-indigo-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500">Academic Year</p>
                    <p className="font-medium text-gray-900">
                      {classDetails.academic_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaBook className="text-teal-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500">Semester</p>
                    <p className="font-medium text-gray-900">
                      {classDetails.semester_type.charAt(0).toUpperCase() +
                        classDetails.semester_type.slice(1)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Schedule Details */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Schedule Details
              </h3>
              <div className="grid sm:grid-cols-3">
                {/* Class Day and Time (combined label) */}
                <div className="flex items-center gap-3 col-span-2 sm:col-span-2">
                  <FaCalendarAlt className="text-blue-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500">Class Day and Time</p>
                    <p className="font-medium text-gray-900">
                      {Array.isArray(classDetails.timings) &&
                      classDetails.timings.length > 0
                        ? classDetails.timings
                            .map(
                              (timing) => `${timing.day} (${timing.time_slot})`,
                            )
                            .join(", ")
                        : classDetails.day && classDetails.time_slot
                          ? `${classDetails.day} (${classDetails.time_slot})`
                          : classDetails.day || classDetails.time_slot || "-"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaMapMarkerAlt className="text-orange-600 w-4 h-4" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">
                      {classDetails.room_number}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
