import { db } from "@/index";
import { verifyPassword } from "@/utils/auth";
import { getUserByEmail } from "@/utils/auth-helpers";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, and } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { accounts, students, teachers, users } from "./db/schema";

function normalizeEmail(email: string | null | undefined): string {
  return (email || "").trim().toLowerCase();
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = normalizeEmail(credentials?.email as string);
        if (!email || !credentials?.password) return null;
        const user = await getUserByEmail(email as string);
        if (!user || !user.password) return null;
        const isValid = await verifyPassword(
          credentials.password as string,
          user.password,
        );
        if (!isValid) return null;
        return {
          ...user,
          role: user.role ?? "student",
          roleId: (user.roleId as string) ?? "",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      profile(profile) {
        return {
          ...profile,
          email: normalizeEmail(profile.email),
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      const email = normalizeEmail(user.email as string);
      // Find student or teacher by email
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.email, email as string))
        .limit(1);
      const [teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.email, email as string))
        .limit(1);

      let roleId: string | null = null;
      let role: string = "student";
      let name: string = user.name || "User";

      if (student) {
        roleId = student.id;
        role = "student";
        name = student.name || name;
      } else if (teacher) {
        roleId = teacher.id;
        role = "teacher";
        name = teacher.name || name;
      }

      // Patch the user record in users table
      await db
        .update(users)
        .set({
          name,
          role,
          roleId: roleId ?? "",
          email: email ?? "",
        })
        .where(eq(users.id, user.id));
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        return token;
      }
      // On subsequent jwt calls like new login or at updateAge
      if (token?.email) {
        const dbUser = await getUserByEmail(token.email);
        if (dbUser) {
          token.name = dbUser.name || token.name;
          token.role = dbUser.role ?? "student";
          token.roleId = dbUser.roleId ?? "";
          // Optionally can update other fields (name, image, etc.)
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.roleId = token.roleId as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.image = token.picture;
      }
      console.log(session.user); // show id, role, roleId, etc.
      return session;
    },

    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const email = normalizeEmail(user.email);
        const existingUser = await getUserByEmail(email);

        if (existingUser) {
          // Check if Google account is already linked
          const [existingAccount] = await db
            .select()
            .from(accounts)
            .where(
              and(
                eq(accounts.userId, existingUser.id),
                eq(accounts.provider, "google"),
                eq(accounts.providerAccountId, account.providerAccountId),
              ),
            )
            .limit(1);

          if (!existingAccount) {
            // Only link if not already linked
            await db.insert(accounts).values({
              userId: existingUser.id,
              type: "oauth",
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              refresh_token: account.refresh_token,
              id_token: account.id_token,
              expires_at: account.expires_at,
            });
          }

          // Always update name and image from Google (even if not null)
          await db
            .update(users)
            .set({
              name: user.name,
              image: user.image,
            })
            .where(eq(users.id, existingUser.id));

          return true; // allow sign in
        }
      }
      return true; // allow sign in for credentials or new Google users
    },
  },
  pages: {
    signIn: "/",
  },
  debug: false, // true in development only
});
