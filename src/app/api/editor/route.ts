import { auth } from "@/auth";
import { rooms, subjects, timetableEntries } from "@/db/schema";
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
        .enum(["CSE", "CSE-AIML", "CSE-DS", "CSE-HCIOT", "ECE", "ECE-IoT"])
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
    .enum(["CSE", "CSE-AIML", "CSE-DS", "CSE-HCIOT", "ECE", "ECE-IoT"])
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
          eq(timetableEntries.academic_year, academicYear),
          eq(timetableEntries.semester_type, semesterType),
        );

        if (roomId) {
          whereConditions = and(
            whereConditions,
            eq(timetableEntries.room_id, roomId),
          );
        }

        const timetableData = await db
          .select({
            id: timetableEntries.id,
            room_id: timetableEntries.room_id,
            room_number: rooms.room_number,
            room_type: rooms.room_type,
            subject_id: timetableEntries.subject_id,
            course_code: subjects.course_code,
            course_name: subjects.course_name,
            day: timetableEntries.day,
            time_slot: timetableEntries.time_slot,
            branch: timetableEntries.branch,
            section: timetableEntries.section,
            color_code: timetableEntries.color_code,
            notes: timetableEntries.notes,
            academic_year: timetableEntries.academic_year,
            semester_type: timetableEntries.semester_type,
          })
          .from(timetableEntries)
          .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
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
          eq(timetableEntries.academic_year, exportAcademicYear),
          eq(timetableEntries.semester_type, exportSemesterType),
        );

        if (exportRoomId) {
          exportWhereConditions = and(
            exportWhereConditions,
            eq(timetableEntries.room_id, exportRoomId),
          );
        }

        const exportTimetableData = await db
          .select({
            id: timetableEntries.id,
            room_id: timetableEntries.room_id,
            room_number: rooms.room_number,
            room_type: rooms.room_type,
            subject_id: timetableEntries.subject_id,
            course_code: subjects.course_code,
            course_name: subjects.course_name,
            day: timetableEntries.day,
            time_slot: timetableEntries.time_slot,
            branch: timetableEntries.branch,
            section: timetableEntries.section,
            color_code: timetableEntries.color_code,
            notes: timetableEntries.notes,
            academic_year: timetableEntries.academic_year,
            semester_type: timetableEntries.semester_type,
          })
          .from(timetableEntries)
          .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
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
      case "import-excel":
        const importData = excelImportSchema.parse(body);

        let successfulEntries = 0;
        let failedEntries = 0;
        const errors: string[] = [];

        // Delete existing data for this academic year and semester
        await db
          .delete(timetableEntries)
          .where(
            and(
              eq(timetableEntries.academic_year, importData.academic_year),
              eq(timetableEntries.semester_type, importData.semester_type),
            ),
          );

        // Process each entry from Excel
        for (const entry of importData.data) {
          try {
            // Find or create room
            let room = await db
              .select()
              .from(rooms)
              .where(eq(rooms.room_number, entry.room_number))
              .limit(1);

            if (room.length === 0) {
              // Create room if it doesn't exist
              const newRoom = await db
                .insert(rooms)
                .values({
                  room_number: entry.room_number,
                  room_type: "Classroom", // Default, can be updated later
                })
                .returning();
              room = newRoom;
            }

            // Find subject if subject_code is provided (maps to course_code in DB)
            let subject_id = null;
            if (entry.subject_code) {
              const subject = await db
                .select()
                .from(subjects)
                .where(eq(subjects.course_code, entry.subject_code))
                .limit(1);

              if (subject.length > 0) {
                subject_id = subject[0].id;
              }
            }

            // Insert timetable entry
            await db.insert(timetableEntries).values({
              academic_year: importData.academic_year,
              semester_type: importData.semester_type,
              room_id: room[0].id,
              subject_id,
              branch: entry.branch,
              section: entry.section,
              day: entry.day,
              time_slot: entry.time_slot,
              color_code: entry.color_code,
              notes: entry.notes,
              created_by: session.user.id,
            });

            successfulEntries++;
          } catch (error) {
            failedEntries++;
            errors.push(
              `Row ${entry.room_number}-${entry.day}-${entry.time_slot}: ${error}`,
            );
          }
        }

        return NextResponse.json({
          success: true,
          successfulEntries,
          failedEntries,
          errors,
        });

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
            subject_id: z.string().uuid().optional(),
            academic_year: z.string(),
            semester_type: z.enum(["odd", "even"]),
            branch: z
              .enum([
                "CSE",
                "CSE-AIML",
                "CSE-DS",
                "CSE-HCIOT",
                "ECE",
                "ECE-IoT",
              ])
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
          })
          .parse(body.data);

        const createdEntry = await db
          .insert(timetableEntries)
          .values({
            ...newEntryData,
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
