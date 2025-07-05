import { auth } from "@/auth";
import { db } from "@/db/index";
import { rooms } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all rooms
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (teacher, editor, admin)
    if (!["teacher", "editor", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const roomType = searchParams.get("room_type");
    const isActive = searchParams.get("is_active");
    const building = searchParams.get("building");

    // Build where conditions
    const whereConditions = [];
    if (roomType) {
      whereConditions.push(eq(rooms.room_type, roomType as any));
    }
    if (isActive !== null) {
      whereConditions.push(eq(rooms.is_active, isActive === "true"));
    }
    if (building) {
      whereConditions.push(eq(rooms.building, building));
    }

    let allRooms;
    if (whereConditions.length > 0) {
      allRooms = await db
        .select()
        .from(rooms)
        .where(
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions),
        )
        .orderBy(rooms.room_number);
    } else {
      allRooms = await db.select().from(rooms).orderBy(rooms.room_number);
    }

    return NextResponse.json({
      success: true,
      data: allRooms,
    });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST new room
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (editor, admin)
    if (!["editor", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { room_number, room_type, capacity, floor, building, facilities } =
      body;

    // Validate required fields
    if (!room_number || !room_type) {
      return NextResponse.json(
        { error: "Missing required fields: room_number, room_type" },
        { status: 400 },
      );
    }

    // Validate room_type
    const validRoomTypes = ["Classroom", "Lab"];
    if (!validRoomTypes.includes(room_type)) {
      return NextResponse.json(
        { error: "Invalid room_type. Must be one of: Classroom, Lab" },
        { status: 400 },
      );
    }

    // Check if room with same room_number already exists
    const existingRoom = await db
      .select()
      .from(rooms)
      .where(eq(rooms.room_number, room_number))
      .limit(1);

    if (existingRoom.length > 0) {
      return NextResponse.json(
        { error: "Room with this room number already exists" },
        { status: 409 },
      );
    }

    // Create new room
    const newRoom = await db
      .insert(rooms)
      .values({
        room_number,
        room_type: room_type as any,
        capacity: capacity ? parseInt(capacity) : null,
        floor: floor ? parseInt(floor) : null,
        building: building || null,
        facilities: facilities || null,
        is_active: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newRoom[0],
      message: "Room created successfully",
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
