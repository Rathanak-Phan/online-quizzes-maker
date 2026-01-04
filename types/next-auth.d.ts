// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";

export type UserRole = "admin" | "teacher" | "user";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isValidated: boolean;
      adSkipping: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: UserRole;
    isValidated: boolean;
    adSkipping: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isValidated: boolean;
    adSkipping: boolean;
  }
}
