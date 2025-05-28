import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userid: string;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id: string;
    userid?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    userid: string;
  }
}
