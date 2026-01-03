// lib/auth.ts
import { NextAuthOptions, DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import clientPromise from "./mongodb";

// Allowed roles
export type UserRole = "teacher" | "user" | "admin";

// Extend session to include our custom fields
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: UserRole;
      isValidated: boolean;
      adSkipping: boolean;
    } & DefaultSession["user"];
  }
}

// Extend JWT to include our custom fields
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    isValidated: boolean;
    adSkipping: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const client = await clientPromise;
          const users = client.db().collection("users");

          const user = await users.findOne({
            email: credentials.email.toLowerCase(),
          });

          if (!user || !user.password) return null;

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) return null;

          // Block unvalidated teachers
          if (user.role === "teacher" && !user.isValidated) {
            throw new Error("Teacher account pending approval");
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            isValidated: user.isValidated ?? false,
            adSkipping: user.adSkipping ?? false,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as UserRole;
        token.isValidated = user.isValidated;
        token.adSkipping = user.adSkipping;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Validate role strictly
        const role: UserRole =
          token.role === "teacher" || token.role === "user" || token.role === "admin"
            ? token.role
            : "user";

        session.user.id = token.id;
        session.user.role = role;
        session.user.isValidated = token.isValidated ?? false;
        session.user.adSkipping = token.adSkipping ?? false;
      }
      return session;
    },
  },
};
