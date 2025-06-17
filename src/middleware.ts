import { auth } from "@/auth-edge"; // your Auth.js config
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const session = await auth(); // Auth.js v5 - automatically detects request
  console.log("MIDDLEWARE SESSION", session); // check this
  const pathname = req.nextUrl.pathname;

  if (!session?.user) {
    // Redirect unauthenticated users
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const role = session.user.role; // assuming role is stored in session.user

  // Role-based routing
  if (pathname.startsWith("/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/student") && role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/editor") && role !== "editor") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next(); // allow access
}

export const config = {
  matcher: [
    "/teacher/:path*",
    "/student/:path*",
    "/admin/:path*",
    "/editor/:path*",
  ],
};
