"use client";

import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { useInvalidateRelatedCache } from "@/hooks/useDataCache";
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
  const { invalidateAfterSessionOperation } = useInvalidateRelatedCache();
  const [editingSession, setEditingSession] = useState<ClassSession | null>(
    null,
  );
  const [editForm, setEditForm] = useState({
    date: "",
    start_time: "",
    end_time: "",
    notes: "",
    status: "Scheduled",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
        // Invalidate cache for sessions
        invalidateAfterSessionOperation(classId);
        onSessionsChangeAction();
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
    setEditForm({
      date: session.date,
      start_time: session.start_time,
      end_time: session.end_time || "",
      notes: session.notes || "",
      status: session.status,
    });
  };

  const handleEditFormChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditFormSubmit = async () => {
    if (!editingSession) return;
    try {
      const patchBody = {
        ...editForm,
        end_time: null, // Always send null for end_time
      };
      const res = await fetch(
        `/api/teacher/classes/${classId}/sessions/${editingSession.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(patchBody),
        },
      );
      if (res.ok) {
        showSuccess("Session updated!");
        setEditingSession(null);
        // Invalidate cache for sessions
        invalidateAfterSessionOperation(classId);
        onSessionsChangeAction();
      } else {
        const err = await res.json();
        showError(err.error || "Failed to update session");
      }
    } catch (e) {
      showError("Error updating session");
    }
  };

  const handleDeleteSession = async () => {
    if (!editingSession) return;
    try {
      const res = await fetch(
        `/api/teacher/classes/${classId}/sessions/${editingSession.id}`,
        {
          method: "DELETE",
        },
      );
      if (res.ok) {
        showSuccess("Session deleted!");
        setEditingSession(null);
        setShowDeleteConfirm(false);
        // Invalidate cache for sessions
        invalidateAfterSessionOperation(classId);
        onSessionsChangeAction();
      } else {
        const err = await res.json();
        showError(err.error || "Failed to delete session");
      }
    } catch (e) {
      showError("Error deleting session");
    }
  };

  const handleViewSession = (sessionId: string) => {
    window.location.href = `/dashboard/class/${classId}/session/${sessionId}`;
  };

  const formatCreatedTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
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

  // Edit Session Modal - Improved design based on AddClassModal
  const editSessionModal = editingSession && (
    <Dialog
      isOpen={!!editingSession}
      onClose={() => setEditingSession(null)}
      title="Edit Session"
      description="Modify session details and settings"
      showActions={false}
      size="xl"
    >
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          handleEditFormSubmit();
        }}
      >
        {/* Session Info Section */}
        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2 mb-6">
          <div className="text-sm text-blue-700">
            Session ID: <span className="font-mono">{editingSession.id}</span>
          </div>
        </div>

        {/* Form Fields Layout - 2 columns for better organization */}
        <div className="grid grid-cols-2 gap-4">
          {/* Date Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Date
            </label>
            <input
              type="date"
              name="date"
              value={editForm.date}
              onChange={handleEditFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:bg-white transition-colors"
              required
            />
            {editForm.date && (
              <p className="text-sm text-gray-800 mt-1">
                {new Date(editForm.date).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* Start Time Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <input
              type="time"
              name="start_time"
              value={editForm.start_time}
              onChange={handleEditFormChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:bg-white transition-colors"
              required
            />
          </div>
        </div>

        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Status
          </label>
          <select
            name="status"
            value={editForm.status}
            onChange={handleEditFormChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base focus:bg-white transition-colors"
          >
            <option value="Scheduled">📅 Scheduled</option>
            <option value="Completed">✅ Completed</option>
          </select>
        </div>

        {/* Notes Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Session Notes
          </label>
          <textarea
            name="notes"
            value={editForm.notes}
            onChange={handleEditFormChange}
            placeholder="Add any notes about this session..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-base bg-gray-300 transition-colors"
            rows={3}
          />
        </div>

        {/* Action Buttons - Enhanced styling */}
        <div className="flex justify-between pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-base font-medium shadow-sm hover:shadow-md"
          >
            Delete Session
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setEditingSession(null)}
              className="px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-base font-medium shadow-sm hover:shadow-md"
            >
              Save Changes
            </button>
          </div>
        </div>
      </form>
    </Dialog>
  );

  return (
    <>
      {editSessionModal}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
        {/* Delete Confirm Dialog */}
        <Dialog
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Delete Session?"
          description="Are you sure you want to delete this session? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          confirmVariant="destructive"
          size="md"
          onConfirm={handleDeleteSession}
        />
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaCalendarAlt className="text-blue-600" />
            Class Sessions ({classSessions.length})
          </h2>
          <Button
            onClick={handleCreateSession}
            className="flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Create Session</span>
            <span className="sm:hidden">Session</span>
          </Button>
        </div>

        {classSessions.length === 0 ? (
          <div className="text-center py-12">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-500 text-lg font-medium mb-2">
              No sessions created
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mb-6 text-center">
              Create your first session to start taking attendance and managing
              your class
            </p>
            <Button
              onClick={handleCreateSession}
              variant="outline"
              className="px-4 sm:px-6 w-full sm:w-auto"
            >
              <FaPlus className="mr-2" />
              Create First Session
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[40rem] sm:max-h-[30rem] overflow-y-scroll">
            {sortedSessions.map((session) => (
              <div
                key={session.id}
                className="p-3 sm:p-4 border border-gray-300 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                    <FaCalendarAlt className="text-blue-600 w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="max-sm:flex max-sm:gap-4">
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                        {formatDate(session.date)}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                        <span className="font-medium">
                          {formatCreatedTime(session.created_at)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}
                        >
                          {session.status}
                        </span>
                      </div>
                    </div>
                    {session.notes && (
                      <p className="text-xs sm:text-sm text-gray-500 bg-gray-100 p-2 w-fit rounded mt-1 sm:mt-2 truncate">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-row flex-wrap gap-2 sm:flex-col sm:items-end min-w-[120px]">
                  <Button
                    onClick={() => handleEditSession(session)}
                    variant="outline"
                    className="hover:bg-gray-100 hover:border-gray-400 text-xs sm:text-sm px-2 sm:px-3 py-1"
                  >
                    <FaEdit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => handleViewSession(session.id)}
                    variant="success"
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1"
                  >
                    {session.status === "Completed"
                      ? "View Attendance"
                      : "Take Attendance"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
