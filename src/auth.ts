import { accounts, students, teachers, users } from "@/db/schema";
import { db } from "@/index";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { compare } from "bcrypt";
import { eq, and } from "drizzle-orm";
import type { Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

// Utility
async function getUserByEmail(email: string) {
  const res = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return res[0] || null;
}

// Auth config
export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email as string);
        if (!user || !user.password) return null;
        const isValid = await compare(
          credentials.password as string,
          user.password,
        );
        if (!isValid) return null;
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          image: user.image ?? undefined,
          role: user.role ?? "student",
          roleId: user.roleId ?? "",
        };
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],

  session: {
    strategy: "database",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    updateAge: 24 * 60 * 60, // refresh session once per day on activity
  },

  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user.id = token.id as string;
      session.user.role = token.role as string;
      session.user.roleId = token.roleId as string;
      session.user.name = token.name;
      session.user.email = token.email;
      session.user.image = token.picture;
      return session;
    },

    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        const dbUser = await getUserByEmail(user.email!);

        if (dbUser) {
          // Check if account already exists for this user
          const existingAccount = await db
            .select()
            .from(accounts)
            .where(
              and(
                eq(accounts.userId, dbUser.id),
                eq(accounts.provider, "google"),
                eq(accounts.providerAccountId, account.providerAccountId),
              ),
            )
            .limit(1);

          if (existingAccount.length === 0) {
            // Link Google account to existing user
            await db.insert(accounts).values({
              userId: dbUser.id,
              provider: "google",
              providerAccountId: account.providerAccountId,
              type: account.type,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              expires_at: account.expires_at
                ? new Date(account.expires_at * 1000)
                : null,
              id_token: account.id_token,
              scope: account.scope,
              token_type: account.token_type,
              session_state: account.session_state as string,
            });
          }

          // Redirect to dashboard based on role
          if (dbUser.role === "teacher") return "/teacher/dashboard";
          if (dbUser.role === "student") return "/student/dashboard";
          return "/unauthorized";
        }

        // If not in users, check student/teacher tables
        const studentArr = await db
          .select()
          .from(students)
          .where(eq(students.email, user.email!))
          .limit(1);
        const teacherArr = await db
          .select()
          .from(teachers)
          .where(eq(teachers.email, user.email!))
          .limit(1);

        let role = "student";
        let roleId = null;
        let name = user.name || profile?.name || "User";

        if (studentArr.length > 0) {
          role = "student";
          roleId = studentArr[0].id;
          name = studentArr[0].name || name;
        } else if (teacherArr.length > 0) {
          role = "teacher";
          roleId = teacherArr[0].id;
          name = teacherArr[0].name || name;
        }

        // Create user
        const [newUser] = await db
          .insert(users)
          .values({
            email: user.email!,
            name,
            image: user.image,
            role,
            roleId,
          })
          .returning();

        // Link Google account to new user
        await db.insert(accounts).values({
          userId: newUser.id,
          provider: "google",
          providerAccountId: account.providerAccountId,
          type: account.type,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at
            ? new Date(account.expires_at * 1000)
            : null,
          id_token: account.id_token,
          scope: account.scope,
          token_type: account.token_type,
          session_state: account.session_state as string,
        });

        // Redirect to dashboard based on role
        if (role === "teacher") return "/teacher/dashboard";
        if (role === "student") return "/student/dashboard";
        return "/unauthorized";
      }

      // Credentials login: redirect by role
      if (user?.role === "teacher") return "/teacher/dashboard";
      if (user?.role === "student") return "/student/dashboard";
      return "/unauthorized";
    },
  },

  pages: {
    signIn: "/",
  },
});
