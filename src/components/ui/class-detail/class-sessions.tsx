"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { FaCalendarAlt, FaEdit, FaPlus } from "react-icons/fa";

interface ClassSession {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: "Scheduled" | "Completed";
  notes?: string;
  created_at: string;
}

interface ClassSessionsProps {
  classId: string;
  classSessions: ClassSession[];
  onSessionsChangeAction: () => void;
}

export default function ClassSessions({
  classId,
  classSessions,
  onSessionsChangeAction,
}: ClassSessionsProps) {
  const { showSuccess, showError } = useToast();
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null,
  );

  // Sort sessions by date in descending order (newest first)
  const sortedSessions = [...classSessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  const handleCreateSession = async () => {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          start_time: currentTime,
          notes: "Session created from class detail view",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");
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

  const handleEditSession = (session: ClassSession) => {
    setEditingSession(session);
    // TODO: Implement edit session modal
    console.log("Edit session:", session);
  };

  const handleViewSession = (sessionId: string) => {
    window.location.href = `/dashboard/class/${classId}/session/${sessionId}`;
  };

  const formatCreatedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const weekday = date.toLocaleDateString("en-US", { weekday: "long" });

    return `${day} ${month}, ${year} (${weekday})`;
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FaCalendarAlt className="text-blue-600" />
          Class Sessions ({classSessions.length})
        </h2>
        <Button
          onClick={handleCreateSession}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          Create Session
        </Button>
      </div>

      {classSessions.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-4" />
          <h3 className="text-gray-500 text-lg font-medium mb-2">
            No sessions created
          </h3>
          <p className="text-gray-400 text-sm mb-6">
            Create your first session to start taking attendance and managing
            your class
          </p>
          <Button
            onClick={handleCreateSession}
            variant="outline"
            className="px-6"
          >
            <FaPlus className="mr-2" />
            Create First Session
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSessions.map((session) => (
            <div
              key={session.id}
              className="p-4 border border-gray-300 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-blue-600 w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {formatDate(session.date)}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                      <span className="font-medium">
                        {session.start_time}
                        {session.end_time && ` - ${session.end_time}`}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}
                      >
                        {session.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        Created: {formatCreatedTime(session.created_at)}
                      </span>
                    </div>

                    {session.notes && (
                      <p className="text-sm text-gray-500 bg-gray-100 p-2 rounded mt-2">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleEditSession(session)}
                    variant="outline"
                    className="hover:bg-gray-100 hover:border-gray-400 text-sm px-3 py-1"
                  >
                    <FaEdit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleViewSession(session.id)}
                    variant="outline"
                    className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  >
                    {session.status === "Completed"
                      ? "View Attendance"
                      : "Take Attendance"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
