import { auth } from "@/auth";
import DashboardWrapper from "@/components/layout/dashboard-wrapper";
import { users } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  admin: ReactNode;
  teacher: ReactNode;
  student: ReactNode;
  editor: ReactNode;
}

export default async function DashboardLayout({
  children,
  admin,
  teacher,
  student,
  editor,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Get user role from database
  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.email, session.user.email))
    .limit(1);

  if (!user.length) {
    redirect("/auth/signin");
  }

  const userRole = user[0].role;

  // If user doesn't have a role, they need setup
  if (!userRole) {
    return children; // This will show the setup page
  }

  // Render appropriate content based on role while keeping URL as /dashboard
  let roleContent: ReactNode;
  switch (userRole) {
    case "admin":
      roleContent = admin;
      break;
    case "teacher":
      roleContent = teacher;
      break;
    case "student":
      roleContent = student;
      break;
    case "editor":
      roleContent = editor;
      break;
    default:
      roleContent = children; // This will show the setup page
  }

  return <DashboardWrapper>{roleContent}</DashboardWrapper>;
}
