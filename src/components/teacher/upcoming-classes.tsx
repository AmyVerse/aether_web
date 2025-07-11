"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentLoader from "@/components/ui/content-loader";
import { useSessionsCache, useTeacherClassesCache } from "@/hooks/useDataCache";
import { useCachedSession } from "@/hooks/useSessionCache";
import { useToast } from "@/hooks/useToast";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";
import {
  FaCalendarDay,
  FaClock,
  FaEye,
  FaMapMarkerAlt,
  FaPlus,
} from "react-icons/fa";

interface TeacherClass {
  id: string;
  timetable_entry_id?: string;
  subject_name: string;
  subject_code: string;
  branch: string | null;
  section: string | null;
  room_number: string;
  academic_year: string;
  semester_type: string;
  notes?: string;
  timings?: { day: string; time_slot: string }[];
}

interface TodayClass {
  id: string;
  subject_display: string;
  class_location: string;
  class_group: string | null;
  notes?: string;
  time_slot: string;
  time_sort: number;
}

interface TeacherClassesResponse {
  success: boolean;
  data: TeacherClass[];
}

export default function TeacherUpcomingClasses() {
  const [classes, setClasses] = useState<TodayClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState<string>("");
  const { sessionData } = useCachedSession();
  const { showError, showSuccess } = useToast();
  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);

  // Cache hooks
  const { fetchTeacherClasses: fetchCachedTeacherClasses, lastRefresh } =
    useTeacherClassesCache();
  const { invalidateSessions } = useSessionsCache();

  useEffect(() => {
    const fetchTodayClasses = async () => {
      if (!sessionData?.user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Use cached teacher classes data
        const result = (await fetchCachedTeacherClasses(
          academicYear,
          semesterType,
        )) as any;

        if (result.success) {
          // Get current day name
          const today = new Date();
          const dayNames = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ];
          const currentDay = dayNames[today.getDay()];
          setCurrentDay(currentDay);

          // For each class, if it has timings for today, show a card for each timing
          const todayClasses: TodayClass[] = [];
          for (const classItem of result.data) {
            if (Array.isArray(classItem.timings)) {
              classItem.timings.forEach(
                (timing: { day: string; time_slot: string }) => {
                  if (timing.day === currentDay) {
                    const [startTime] = timing.time_slot.split("-");
                    const [hour, minute] = startTime.split(":").map(Number);
                    const period = hour >= 12 ? "PM" : "AM";
                    const displayHour =
                      hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                    const formattedTime = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
                    const classTimeInMinutes = hour * 60 + minute;
                    todayClasses.push({
                      id: classItem.id,
                      subject_display: classItem.subject_name,
                      class_location: classItem.room_number,
                      class_group:
                        classItem.branch && classItem.section
                          ? `${classItem.branch} : ${classItem.section}`
                          : null,
                      notes: classItem.notes,
                      time_slot: `${timing.day}: ${formattedTime}`,
                      time_sort: classTimeInMinutes,
                    });
                  }
                },
              );
            }
          }
          todayClasses.sort((a, b) => a.time_sort - b.time_sort);
          setClasses(todayClasses);
        } else {
          throw new Error("API returned error");
        }
      } catch (err) {
        console.error("Error fetching today's classes:", err);
        setError(err instanceof Error ? err.message : "Failed to load classes");
      } finally {
        setLoading(false);
      }
    };

    fetchTodayClasses();
  }, [sessionData, academicYear, semesterType, lastRefresh]);

  const handleViewDetails = (classId: string) => {
    // Navigate to specific class detail using nanoid
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
          notes: "Session created from today's classes",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");
        // Invalidate sessions cache after creating new session
        invalidateSessions(classId);
        // Redirect to attendance page
        window.location.href = `/dashboard/class/${classId}/session/${data.data.id}`;
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create session");
      }
    } catch (error) {
      showError("An error occurred while creating session");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FaCalendarDay className="w-5 h-5 text-blue-600" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentLoader />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FaCalendarDay className="w-5 h-5 text-blue-600" />
            Today's Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="text-red-500 text-sm mb-2">⚠️ Error</div>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FaCalendarDay className="w-5 h-5 text-blue-600" />
          Today's Classes
          {currentDay && (
            <span className="text-sm font-normal text-gray-500">
              • {currentDay}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto max-sm:max-max-h-[40rem] max-sm:overflow-y-scroll">
          <div
            className={`flex gap-4 sm:${classes.length > 1 ? "min-w-max" : ""} flex-col sm:flex-row`}
          >
            {classes.length > 0 ? (
              classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className="flex-shrink-0 w-full sm:w-80 flex flex-col justify-between p-4 rounded-xl border border-gray-300 bg-white hover:border-gray-400 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg mb-1">
                        {classItem.subject_display}
                      </h4>
                      {classItem.class_group && (
                        <p className="text-sm text-gray-600 font-medium mb-2">
                          {classItem.class_group}
                        </p>
                      )}
                      {classItem.notes && (
                        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium mb-2">
                          {classItem.notes}
                        </div>
                      )}
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <FaClock className="w-3.5 h-3.5" />
                          <span className="font-medium">
                            {classItem.time_slot}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FaMapMarkerAlt className="w-3.5 h-3.5" />
                          <span>{classItem.class_location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-col sm:flex-row">
                    <button
                      onClick={() => handleViewDetails(classItem.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <FaEye className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">View Details</span>
                      <span className="sm:hidden">View</span>
                    </button>
                    <button
                      onClick={() => handleCreateSession(classItem.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <FaPlus className="w-3.5 h-3.5" />
                      Session
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 w-full">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Classes Today
                </h3>
                <p className="text-gray-600 text-sm">
                  Enjoy your free day! You have no classes scheduled for{" "}
                  {currentDay.toLowerCase()}.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
