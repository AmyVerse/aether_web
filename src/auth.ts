import { db } from "@/index";
import { getUserByEmail } from "@/utils/auth-helpers";
import { verifyPassword } from "@/utils/verifyPassword";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

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
        const { ...safeUser } = user;
        return {
          ...safeUser,
          role: user.role ?? "student",
          roleId: (user.roleId as string) ?? "",
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.roleId = user.roleId;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        return token;
      }

      // On manual session update or token refresh, fetch latest user data
      if ((trigger === "update" || !token.role) && token?.email) {
        const dbUser = await getUserByEmail(token.email);
        if (dbUser) {
          token.id = dbUser.id;
          token.name = dbUser.name || token.name;
          token.role = dbUser.role;
          token.roleId = dbUser.roleId;
          token.image = dbUser.image || token.picture;
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
      return session;
    },
  },
  pages: {
    signIn: "/",
  },
  debug: false, // true in development only
});
