import { users } from "@/db/schema";
import { db } from "@/index"; // your Drizzle client
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import type { Account, Profile, User } from "next-auth";
import { Session } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import type { SessionStrategy } from "next-auth";

export const authOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email));

        if (!user || !user.password) return null;

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) return null;

        // Return userid along with other fields
        return {
          id: user.id,
          userid: user.userid ?? "",
          name: user.name,
          email: user.email,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
      isNewUser?: boolean;
    }) {
      if (user) {
        token.userid = user.userid ?? user.id ?? "";
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.image = user.image;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add all fields from token to session.user
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { userid?: string }).userid = token.userid as string; // <-- Add this line
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        if (token.image) session.user.image = token.image as string;
      }
      return session;
    },
  },
};
