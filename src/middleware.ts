import { auth } from "@/auth"; // import your NextAuth config (session-based)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the session (session-based, not JWT)
  const session = await auth();

  const pathname = req.nextUrl.pathname;

  // Require authentication
  if (!session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const role = session.user.role?.toLowerCase?.();

  // Role-based route protection for dashboard
  if (pathname.startsWith("/dashboard/teacher") && role !== "teacher") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/dashboard/student") && role !== "student") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }
  if (pathname.startsWith("/dashboard/editor") && role !== "editor") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  // All checks passed, continue
  return NextResponse.next();
}

// Match protected dashboard routes
export const config = {
  matcher: [
    "/dashboard/teacher/:path*",
    "/dashboard/student/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/editor/:path*",
    "/dashboard/setup/:path*",
  ],
};
