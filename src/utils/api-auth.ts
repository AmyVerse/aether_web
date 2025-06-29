import { auth } from "@/auth";
import { NextResponse } from "next/server";

/**
 * Authentication helper for API routes
 * Returns user session or null if not authenticated
 */
export async function getAuthenticatedUser() {
  try {
    const session = await auth();
    return session?.user || null;
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Validates if user has required role
 */
export function hasRole(
  userRole: string | null | undefined,
  requiredRole: string | string[],
) {
  if (!userRole) return false;
  if (Array.isArray(requiredRole)) {
    return requiredRole.some(
      (role) => userRole.toLowerCase() === role.toLowerCase(),
    );
  }
  return userRole.toLowerCase() === requiredRole.toLowerCase();
}

/**
 * Returns unauthorized response
 */
export function unauthorized(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

/**
 * Returns bad request response
 */
export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Returns internal server error response
 */
export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

/**
 * Validates required fields in request body
 */
export function validateFields(body: Record<string, unknown>, fields: string[]) {
  const missing = fields.filter((field) => !body[field]);
  if (missing.length > 0) {
    return `Missing required fields: ${missing.join(", ")}`;
  }
  return null;
}

/**
 * Email validation regex
 */
export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
