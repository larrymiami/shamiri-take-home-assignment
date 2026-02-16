import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { env } from "@/lib/env";
import prisma from "@/server/db/prisma";

export const authOptions = {
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim().toLowerCase();
        const password = credentials?.password ?? "";

        if (!email || !password) return null;

        const supervisor = await prisma.supervisor.findUnique({
          where: { email },
          select: { id: true, name: true, email: true, passwordHash: true }
        });

        if (!supervisor?.passwordHash) return null;

        const ok = await bcrypt.compare(password, supervisor.passwordHash);
        if (!ok) return null;

        return {
          id: supervisor.id,
          name: supervisor.name,
          email: supervisor.email,
          role: "SUPERVISOR"
        };
      }
    })
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (!token.sub) {
          throw new Error("Missing token subject");
        }

        session.user = {
          ...session.user,
          id: token.sub,
          role: token.role ?? "SUPERVISOR"
        };
      }
      return session;
    }
  },

  pages: {
    signIn: "/login"
  }
} satisfies NextAuthOptions;
