import { db } from "@/index";
import { verifyPassword } from "@/utils/auth";
import { getUserByEmail } from "@/utils/auth-helpers";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { students, teachers, users } from "./db/schema";

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
        if (!credentials?.email || !credentials?.password) return null;
        const user = await getUserByEmail(credentials.email as string);
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
    }),
  ],
  events: {
    async createUser({ user }) {
      // Find student or teacher by email
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.email, user.email as string))
        .limit(1);
      const [teacher] = await db
        .select()
        .from(teachers)
        .where(eq(teachers.email, user.email as string))
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
          roleId,
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
      // On subsequent calls (session refresh), fetch latest user data
      if (token?.email) {
        const dbUser = await getUserByEmail(token.email);
        if (dbUser) {
          token.name = dbUser.name || token.name;
          token.role = dbUser.role ?? "student";
          token.roleId = dbUser.roleId ?? "";
          // Optionally update other fields (name, image, etc.)
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
      console.log(session.user); // Should show id, role, roleId, etc.
      return session;
    },
    // async session({ session }) {
    //   if (session.user?.email) {
    //     const user = await getUserByEmail(session.user.email);
    //     if (user) {
    //       session.user.id = user.id;
    //       session.user.role = user.role || "student";
    //       session.user.roleId = user.roleId || "";
    //       session.user.name = user.name;
    //       session.user.image = user.image;
    //     }
    //   }
    //   return session;
    // },
  },
  pages: {
    signIn: "/",
  },
  debug: false, // true in development only
});
