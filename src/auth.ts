import { users } from "@/db/schema";
import { db } from "@/index";
import { verifyPassword } from "@/utils/auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import NextAuth from "next-auth";
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
        const isValid = await verifyPassword(
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
    strategy: "jwt", // Use database sessions
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    // This callback is still needed for CredentialsProvider (to set id etc.)
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },

    // THIS is the important fix!
    async session({ session }) {
      // session.user.id is set by NextAuth, but role etc. are not!
      // Fetch full user from DB and attach fields to session.user
      if (session.user?.email) {
        const user = await getUserByEmail(session.user.email);
        if (user) {
          session.user.id = user.id;
          session.user.role = user.role || "student";
          session.user.roleId = user.roleId || "";
          session.user.name = user.name;
          session.user.image = user.image;
        }
      }
      return session;
    },
  },

  pages: {
    signIn: "/",
  },
});
