import { auth } from "@/auth"; // import your NextAuth config (session-based)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the session (session-based, not JWT)
  const session = await auth();

  const pathname = req.nextUrl.pathname;

  // If user is authenticated and tries to access root, redirect to appropriate dashboard
  if (pathname === "/" && session?.user) {
    const role = session.user.role?.toLowerCase?.();

    // If no role or roleId, redirect to setup
    if (!session.user.role || !session.user.roleId) {
      return NextResponse.redirect(new URL("/dashboard/setup", req.url));
    }

    // Redirect to appropriate dashboard based on role
    switch (role) {
      case "teacher":
        return NextResponse.redirect(new URL("/dashboard/teacher", req.url));
      case "student":
        return NextResponse.redirect(new URL("/dashboard/student", req.url));
      case "admin":
        return NextResponse.redirect(new URL("/dashboard/admin", req.url));
      case "editor":
        return NextResponse.redirect(new URL("/dashboard/editor", req.url));
      default:
        return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Require authentication for dashboard routes
  if (pathname.startsWith("/dashboard") && !session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // If authenticated, check role-based access for dashboard routes
  if (session?.user && pathname.startsWith("/dashboard")) {
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
  }

  // All checks passed, continue
  return NextResponse.next();
}

// Match protected dashboard routes and root path for authenticated users
export const config = {
  matcher: [
    "/",
    "/dashboard/teacher/:path*",
    "/dashboard/student/:path*",
    "/dashboard/admin/:path*",
    "/dashboard/editor/:path*",
    "/dashboard/setup",
  ],
};
