import { auth } from "@/auth";
import { db } from "@/db";
import { rooms } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const roomList = await db
      .select({
        id: rooms.id,
        room_number: rooms.room_number,
        room_type: rooms.room_type,
        capacity: rooms.capacity,
        floor: rooms.floor,
        building: rooms.building,
        facilities: rooms.facilities,
        is_active: rooms.is_active,
      })
      .from(rooms)
      .where(eq(rooms.is_active, true))
      .orderBy(rooms.room_number);

    return NextResponse.json({ rooms: roomList });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
