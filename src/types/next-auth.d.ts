import type { DefaultSession, DefaultUser } from "next-auth";
import type { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: "SUPERVISOR";
  }

  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "SUPERVISOR";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: "SUPERVISOR";
  }
}
