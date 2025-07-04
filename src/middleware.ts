import { auth } from "@/auth"; // import your NextAuth config (session-based)
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  // Get the session (session-based, not JWT)
  const session = await auth();

  const pathname = req.nextUrl.pathname;

  // If user is authenticated and tries to access root, redirect to dashboard
  if (pathname === "/" && session?.user) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Require authentication for dashboard routes
  if (pathname.startsWith("/dashboard") && !session?.user) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // All checks passed, continue
  return NextResponse.next();
}

// Match protected dashboard routes and root path for authenticated users
export const config = {
  matcher: ["/", "/dashboard/:path*"],
};
