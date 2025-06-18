import { auth } from "@/auth"; // import your NextAuth config (session-based)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the session (session-based, not JWT)
  const session = await auth();

  const pathname = req.nextUrl.pathname;

  // Require authentication
  if (!session?.user) {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  const role = session.user.role?.toLowerCase?.();

  // Role-based route protection
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

  // All checks passed, continue
  return NextResponse.next();
}

// Match protected routes
export const config = {
  matcher: [
    "/teacher/:path*",
    "/student/:path*",
    "/admin/:path*",
    "/editor/:path*",
  ],
};
