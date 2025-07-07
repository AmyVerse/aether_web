"use client";

import { Button } from "@/components/ui/button";
import ContentLoader from "@/components/ui/content-loader";
import { useCachedSession } from "@/hooks/useSessionCache";
import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaEye,
  FaHistory,
  FaMapMarkerAlt,
  FaPlus,
  FaUsers,
} from "react-icons/fa";

interface TeacherClass {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  day: string;
  time_slot: string;
  room_number: string;
  student_count?: number;
  session_count?: number;
}

interface ProcessedClass extends TeacherClass {
  subject_display: string;
  formatted_time: string;
  class_location: string;
  class_group: string | null;
  time_sort: number;
}

interface TeacherClassesResponse {
  success: boolean;
  data: TeacherClass[];
}

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClassesList() {
  const [classes, setClasses] = useState<ProcessedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  );
  const { sessionData } = useCachedSession();
  const { showError, showSuccess } = useToast();

  useEffect(() => {
    fetchTeacherClasses();
  }, [sessionData]);

  const fetchTeacherClasses = async () => {
    if (!sessionData?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/teacher/classes");

      if (!response.ok) {
        throw new Error("Failed to fetch teacher classes");
      }

      const result: TeacherClassesResponse = await response.json();

      if (result.success) {
        // Process classes with additional data
        const processedClasses = await Promise.all(
          result.data.map(async (classItem): Promise<ProcessedClass> => {
            const timeSlot = classItem.time_slot;
            const [startTime] = timeSlot.split("-");
            const [hour, minute] = startTime.split(":").map(Number);

            // Convert to 12-hour format
            const period = hour >= 12 ? "PM" : "AM";
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            const formattedTime = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;

            // Create time sort value for sorting
            const timeSortValue = hour * 60 + minute;

            // Fetch real-time student count and session count
            let studentCount = 0;
            let sessionCount = 0;

            try {
              // Fetch students for this class
              const studentsResponse = await fetch(
                `/api/teacher/classes/${classItem.id}/students`,
              );
              if (studentsResponse.ok) {
                const studentsData = await studentsResponse.json();
                if (studentsData.success) {
                  studentCount = studentsData.data.length;
                }
              }

              // Fetch sessions for this class
              const sessionsResponse = await fetch(
                `/api/teacher/classes/${classItem.id}/sessions`,
              );
              if (sessionsResponse.ok) {
                const sessionsData = await sessionsResponse.json();
                if (sessionsData.success) {
                  sessionCount = sessionsData.data.length;
                }
              }
            } catch (error) {
              console.error(
                `Error fetching data for class ${classItem.id}:`,
                error,
              );
              // Keep default values (0) on error
            }

            return {
              ...classItem,
              subject_display: classItem.subject_name,
              formatted_time: formattedTime,
              class_location: classItem.room_number,
              class_group:
                classItem.branch && classItem.section
                  ? `${classItem.branch} - ${classItem.section}`
                  : null,
              time_sort: timeSortValue,
              student_count: studentCount,
              session_count: sessionCount,
            };
          }),
        );

        setClasses(processedClasses);
      } else {
        throw new Error("API returned error");
      }
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
      showError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleViewDetails = (classId: string) => {
    window.location.href = `/dashboard/class/${classId}`;
  };

  const handleCreateSession = async (classId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          start_time: currentTime,
          notes: "Session created from classes list",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");
        window.location.href = `/dashboard/class/${classId}/session/${data.data.id}`;
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create session");
      }
    } catch (error) {
      showError("An error occurred while creating session");
    }
  };

  // Group classes by day
  const classesByDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = classes
        .filter((cls) => cls.day === day)
        .sort((a, b) => a.time_sort - b.time_sort);
      return acc;
    },
    {} as Record<string, ProcessedClass[]>,
  );

  if (loading) {
    return (
      <div className="p-2 sm:p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                My Classes Schedule
              </h2>
            </div>
          </div>
          <div className="p-4">
            <ContentLoader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4">
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 sm:gap-0">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                My Classes Schedule
              </h2>
              <span className="text-sm font-normal text-gray-500">
                • {classes.length} {classes.length === 1 ? "class" : "classes"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  const allDays = new Set(DAYS_ORDER);
                  setExpandedDays(
                    expandedDays.size === DAYS_ORDER.length
                      ? new Set()
                      : allDays,
                  );
                }}
                variant="outline"
                className="text-sm px-3 py-2"
              >
                {expandedDays.size === DAYS_ORDER.length
                  ? "Collapse All"
                  : "Expand All"}
              </Button>
            </div>
          </div>
        </div>

        <div className="p-4">
          <div className="space-y-3">
            {DAYS_ORDER.map((day) => {
              const dayClasses = classesByDay[day];
              const isExpanded = expandedDays.has(day);

              if (dayClasses.length === 0) return null;

              return (
                <div
                  key={day}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleDay(day)}
                    className={`w-full p-4 flex items-center justify-between transition-all duration-200 ${
                      isExpanded
                        ? "bg-gray-100 hover:bg-gray-100 border-b border-gray-200"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <FaChevronDown
                          className={`w-4 h-4 ${isExpanded ? "text-gray-600" : "text-gray-600"}`}
                        />
                      ) : (
                        <FaChevronRight
                          className={`w-4 h-4 ${isExpanded ? "text-gray-600" : "text-gray-600"}`}
                        />
                      )}
                      <h3
                        className={`text-lg font-semibold ${isExpanded ? "text-blue-900" : "text-gray-900"}`}
                      >
                        {day}
                      </h3>
                      <span
                        className={`text-sm px-3 py-1 rounded-full ${
                          isExpanded
                            ? "bg-blue-100 text-blue-700"
                            : "bg-white text-gray-500"
                        }`}
                      >
                        {dayClasses.length}{" "}
                        {dayClasses.length === 1 ? "Class" : "Classes"}
                      </span>
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="p-4 bg-white">
                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {dayClasses.map((classItem) => (
                          <div
                            key={classItem.id}
                            className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
                          >
                            <div className="mb-5">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                                  {classItem.subject_display}
                                </h4>
                                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                  {classItem.subject_code}
                                </span>
                              </div>

                              {classItem.class_group && (
                                <p className="text-base text-gray-600 font-medium mb-3">
                                  {classItem.class_group}
                                </p>
                              )}

                              <div className="space-y-2 grid-flow-col columns-2 text-base text-gray-600">
                                <div className="flex items-center gap-2">
                                  <FaClock className="w-3.5 h-3.5 text-green-600" />
                                  <span className="font-medium">
                                    {classItem.formatted_time}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaMapMarkerAlt className="w-3.5 h-3.5 text-red-600" />
                                  <span>{classItem.class_location}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaUsers className="w-3.5 h-3.5 text-purple-600" />
                                  <span>
                                    {classItem.student_count} students
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <FaHistory className="w-3.5 h-3.5 text-gray-600" />
                                  <span>
                                    {classItem.session_count} sessions
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2">
                              <div className="flex gap-2">
                                <button
                                  onClick={() =>
                                    handleViewDetails(classItem.id)
                                  }
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                  <FaEye className="w-3 h-3" />
                                  Details
                                </button>
                                <button
                                  onClick={() =>
                                    handleCreateSession(classItem.id)
                                  }
                                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                >
                                  <FaPlus className="w-3 h-3" />
                                  Session
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {classes.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Classes Assigned
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Contact your administrator to get classes assigned to you.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
