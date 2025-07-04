import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import {
  classSessions,
  subjects,
  teacherClasses,
  timetableEntries,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { CalendarDays, Clock, Plus, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface SessionListPageProps {
  params: Promise<{ classId: string }>;
}

async function SessionList({ classId }: { classId: string }) {
  // Verify class exists and get class info with subject details
  const classInfo = await db
    .select({
      id: teacherClasses.id,
      teacher_id: teacherClasses.teacher_id,
      timetable_entry_id: teacherClasses.timetable_entry_id,
      assigned_at: teacherClasses.assigned_at,
      is_active: teacherClasses.is_active,
      notes: teacherClasses.notes,
      subject_name: subjects.course_name,
      subject_code: subjects.course_code,
      short_name: subjects.short_name,
    })
    .from(teacherClasses)
    .leftJoin(
      timetableEntries,
      eq(teacherClasses.timetable_entry_id, timetableEntries.id),
    )
    .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
    .where(eq(teacherClasses.id, classId))
    .limit(1);

  if (classInfo.length === 0) {
    notFound();
  }

  // Get all sessions for this class
  const sessions = await db
    .select()
    .from(classSessions)
    .where(eq(classSessions.teacher_class_id, classId))
    .orderBy(classSessions.date);

  const classData = classInfo[0];

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

export default async function SessionListPage({
  params,
}: SessionListPageProps) {
  const { classId } = await params;

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
      }
    >
      <SessionList classId={classId} />
    </Suspense>
  );
}
