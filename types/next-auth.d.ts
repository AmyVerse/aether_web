// types/next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      userid?: string;
      role?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: string;
    userid?: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    userid?: string;
    role?: string;
  }
}
