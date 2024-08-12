// types/next-auth.d.ts
import NextAuth from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id: string;
    hasPaid: boolean;
    password: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      hasPaid: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    hasPaid: boolean;
  }
}