"use client";

import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Plus, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SessionListPageProps {
  params: Promise<{ classId: string }>;
}

interface ClassData {
  id: string;
  teacher_id: string;
  timetable_entry_id: string;
  assigned_at: string;
  is_active: boolean;
  notes: string;
  subject_name: string;
  subject_code: string;
  short_name: string;
}

interface SessionData {
  id: string;
  teacher_class_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
}

// Client-side API call to fetch class and sessions data
async function fetchClassAndSessions(classId: string): Promise<{
  classData: ClassData;
  sessions: SessionData[];
} | null> {
  try {
    const response = await fetch(`/api/teacher/classes/${classId}/sessions`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch class sessions");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching class sessions:", error);
    return null;
  }
}

function SessionList({
  classData,
  sessions,
  classId,
}: {
  classData: ClassData;
  sessions: SessionData[];
  classId: string;
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {classData.subject_name || classData.short_name || "Class"} Sessions
          </h1>
          <p className="text-muted-foreground">{classData.subject_code}</p>
        </div>
        <Link href={`/dashboard/class/${classId}`}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Session
          </Button>
        </Link>
      </div>

      {/* Sessions Grid */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No sessions yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first session to start taking attendance
            </p>
            <Link href={`/dashboard/class/${classId}`}>
              <Button>Create Session</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {session.notes || `Session ${session.id.slice(-4)}`}
                  </CardTitle>
                  <Badge
                    variant={
                      session.status === "Completed" ? "default" : "secondary"
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    {new Date(session.date).toLocaleDateString()}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 mr-2" />
                    {session.start_time} - {session.end_time || "TBD"}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Session attendance
                  </div>

                  <div className="pt-2">
                    <Link
                      href={`/dashboard/class/${classId}/session/${session.id}`}
                      className="w-full"
                    >
                      <Button className="w-full" variant="outline">
                        {session.status === "Completed"
                          ? "View Attendance"
                          : "Take Attendance"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SessionListPage({ params }: SessionListPageProps) {
  const [classId, setClassId] = useState<string>("");
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { classId: resolvedClassId } = await params;
        setClassId(resolvedClassId);

        // Fetch class and sessions data
        const data = await fetchClassAndSessions(resolvedClassId);
        if (!data) {
          setError("Class not found");
          return;
        }

        setClassData(data.classData);
        setSessions(data.sessions);
      } catch (err) {
        setError("Failed to load class data");
        console.error("Error loading class data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params]);

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Header
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            pageTitle="Sessions"
          />

          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-medium mb-2">Error</h3>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Header
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
          pageTitle="Sessions"
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-3 sm:p-4 md:p-6">
          {loading ? (
            <div className="space-y-4 sm:space-y-6">
              <div className="h-6 sm:h-8 bg-muted rounded animate-pulse" />
              <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="space-y-3">
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : classData ? (
            <SessionList
              classData={classData}
              sessions={sessions}
              classId={classId}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}
