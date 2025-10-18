import type { Role } from "@prisma/client"
import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id: string
    username?: string | null
    role: Role
    isImpersonating?: boolean
    originalAdminId?: string
    // originalAdminRole?: Role; // Optional: if you need to store the admin's original role specifically
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username?: string | null
      role: Role
      isImpersonating?: boolean
      originalAdminId?: string
      // originalAdminRole?: Role; // Optional
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    username?: string | null
    role: Role
  }
}
  