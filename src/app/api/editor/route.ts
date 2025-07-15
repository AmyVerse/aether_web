import { auth } from "@/auth";
import {
  classroomAllocations,
  rooms,
  subjects,
  timetableEntries,
} from "@/db/schema";
import { db } from "@/index";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Excel Import Schema
const excelImportSchema = z.object({
  academic_year: z.string().min(1).max(20),
  semester_type: z.enum(["odd", "even"]),
  data: z.array(
    z.object({
      room_number: z.string().min(1).max(20),
      day: z.enum([
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ]),
      time_slot: z.enum([
        "8:00-8:55",
        "9:00-9:55",
        "10:00-10:55",
        "11:00-11:55",
        "12:00-12:55",
        "13:00-13:55",
        "14:00-14:55",
        "15:00-15:55",
        "16:00-16:55",
        "17:00-17:55",
      ]),
      branch: z
        .enum(["CSE", "CSE-AIML", "CSE-DS", "CSE-HCIGT", "ECE", "ECE-IoT"])
        .optional(),
      section: z.enum(["A", "B", "C"]).optional(),
      subject_code: z.string().optional(), // This will be mapped to course_code in DB
      color_code: z.string().optional(),
      notes: z.string().optional(),
    }),
  ),
});

// Create Room Schema
const createRoomSchema = z.object({
  room_number: z.string().min(1).max(20),
  room_type: z.enum(["Classroom", "Lab"]),
  capacity: z.number().optional(),
  floor: z.number().optional(),
  building: z.string().optional(),
  facilities: z.array(z.string()).optional(),
});

// Timetable Entry Update Schema
const updateTimetableEntrySchema = z.object({
  id: z.string().uuid(),
  room_id: z.string().uuid().optional(),
  subject_id: z.string().uuid().optional(),
  branch: z
    .enum(["CSE", "CSE-AIML", "CSE-DS", "CSE-HCIGT", "ECE", "ECE-IoT"])
    .optional(),
  section: z.enum(["A", "B", "C"]).optional(),
  day: z.enum([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ]),
  time_slot: z.enum([
    "8:00-8:55",
    "9:00-9:55",
    "10:00-10:55",
    "11:00-11:55",
    "12:00-12:55",
    "13:00-13:55",
    "14:00-14:55",
    "15:00-15:55",
    "16:00-16:55",
    "17:00-17:55",
  ]),
  color_code: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "editor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const action = searchParams.get("action");

    switch (action) {
      case "rooms":
        const roomsList = await db
          .select()
          .from(rooms)
          .where(eq(rooms.is_active, true));
        return NextResponse.json({ rooms: roomsList });

      case "subjects":
        const subjectsList = await db
          .select()
          .from(subjects)
          .where(eq(subjects.is_active, true));
        return NextResponse.json({ subjects: subjectsList });

      case "timetable":
        const academicYear = searchParams.get("academic_year");
        const semesterType = searchParams.get("semester_type") as
          | "odd"
          | "even";
        const roomId = searchParams.get("room_id");

        if (!academicYear || !semesterType) {
          return NextResponse.json(
            { error: "Missing academic_year or semester_type" },
            { status: 400 },
          );
        }

        let whereConditions = and(
          eq(classroomAllocations.academic_year, academicYear),
          eq(classroomAllocations.semester_type, semesterType),
        );

        if (roomId) {
          whereConditions = and(
            whereConditions,
            eq(classroomAllocations.room_id, roomId),
          );
        }

        const timetableData = await db
          .select({
            id: timetableEntries.id,
            room_id: classroomAllocations.room_id,
            room_number: rooms.room_number,
            room_type: rooms.room_type,
            subject_id: timetableEntries.subject_id,
            course_code: subjects.course_code,
            course_name: subjects.course_name,
            branch: classroomAllocations.branch,
            section: classroomAllocations.section,
            semester: classroomAllocations.semester,
            color_code: timetableEntries.color_code,
            notes: timetableEntries.notes,
            academic_year: classroomAllocations.academic_year,
            semester_type: classroomAllocations.semester_type,
          })
          .from(timetableEntries)
          .innerJoin(
            classroomAllocations,
            eq(timetableEntries.allocation_id, classroomAllocations.id),
          )
          .leftJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
          .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
          .where(whereConditions);

        return NextResponse.json({ timetable: timetableData });

      case "export-timetable":
        const exportAcademicYear = searchParams.get("academic_year");
        const exportSemesterType = searchParams.get("semester_type") as
          | "odd"
          | "even";
        const exportRoomId = searchParams.get("room_id");

        if (!exportAcademicYear || !exportSemesterType) {
          return NextResponse.json(
            { error: "Missing academic_year or semester_type" },
            { status: 400 },
          );
        }

        let exportWhereConditions = and(
          eq(classroomAllocations.academic_year, exportAcademicYear),
          eq(classroomAllocations.semester_type, exportSemesterType),
        );

        if (exportRoomId) {
          exportWhereConditions = and(
            exportWhereConditions,
            eq(classroomAllocations.room_id, exportRoomId),
          );
        }

        const exportTimetableData = await db
          .select({
            id: timetableEntries.id,
            room_id: classroomAllocations.room_id,
            room_number: rooms.room_number,
            room_type: rooms.room_type,
            subject_id: timetableEntries.subject_id,
            course_code: subjects.course_code,
            course_name: subjects.course_name,
            branch: classroomAllocations.branch,
            section: classroomAllocations.section,
            semester: classroomAllocations.semester,
            color_code: timetableEntries.color_code,
            notes: timetableEntries.notes,
            academic_year: classroomAllocations.academic_year,
            semester_type: classroomAllocations.semester_type,
          })
          .from(timetableEntries)
          .innerJoin(
            classroomAllocations,
            eq(timetableEntries.allocation_id, classroomAllocations.id),
          )
          .leftJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
          .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
          .where(exportWhereConditions);

        return NextResponse.json({
          timetable: exportTimetableData,
          success: true,
          message: "Timetable data ready for export",
        });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("GET /api/editor error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "editor") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create-room":
        const roomData = createRoomSchema.parse(body.data);
        const newRoom = await db.insert(rooms).values(roomData).returning();
        return NextResponse.json({ room: newRoom[0] });

      case "update-timetable-entry":
        const entryData = updateTimetableEntrySchema.parse(body.data);
        const { id, ...updateData } = entryData;

        const updatedEntry = await db
          .update(timetableEntries)
          .set({
            ...updateData,
            updated_at: new Date(),
          })
          .where(eq(timetableEntries.id, id))
          .returning();

        return NextResponse.json({ entry: updatedEntry[0] });

      case "delete-timetable-entry":
        const entryId = body.entry_id;
        await db
          .delete(timetableEntries)
          .where(eq(timetableEntries.id, entryId));

        return NextResponse.json({ success: true });

      case "create-timetable-entry":
        const newEntryData = z
          .object({
            room_id: z.string().uuid(),
            subject_id: z.string().uuid(),
            academic_year: z.string(),
            semester_type: z.enum(["odd", "even"]),
            semester: z.number(),
            branch: z.enum([
              "CSE",
              "CSE-AIML",
              "CSE-DS",
              "CSE-HCIGT",
              "ECE",
              "ECE-IoT",
            ]),
            section: z.enum(["A", "B", "C"]),
            day_half: z.enum(["first_half", "second_half"]),
            color_code: z.string().optional(),
            notes: z.string(),
          })
          .parse(body.data);

        // First, find or create the classroom allocation
        let allocation = await db
          .select()
          .from(classroomAllocations)
          .where(
            and(
              eq(
                classroomAllocations.academic_year,
                newEntryData.academic_year,
              ),
              eq(
                classroomAllocations.semester_type,
                newEntryData.semester_type,
              ),
              eq(classroomAllocations.semester, newEntryData.semester),
              eq(classroomAllocations.branch, newEntryData.branch),
              eq(classroomAllocations.section, newEntryData.section),
              eq(classroomAllocations.room_id, newEntryData.room_id),
              eq(classroomAllocations.day_half, newEntryData.day_half),
            ),
          )
          .limit(1);

        if (allocation.length === 0) {
          // Create new classroom allocation
          const newAllocation = await db
            .insert(classroomAllocations)
            .values({
              academic_year: newEntryData.academic_year,
              semester_type: newEntryData.semester_type,
              semester: newEntryData.semester,
              branch: newEntryData.branch,
              section: newEntryData.section,
              room_id: newEntryData.room_id,
              day_half: newEntryData.day_half,
              created_by: session.user.id,
            })
            .returning();

          allocation = newAllocation;
        }

        // Now create the timetable entry
        const createdEntry = await db
          .insert(timetableEntries)
          .values({
            allocation_id: allocation[0].id,
            subject_id: newEntryData.subject_id,
            color_code: newEntryData.color_code,
            notes: newEntryData.notes,
            created_by: session.user.id,
          })
          .returning();

        return NextResponse.json({ entry: createdEntry[0] });

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Editor API POST error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
