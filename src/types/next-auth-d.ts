import type { Role } from "@prisma/client"
import type { DefaultSession, DefaultUser } from "next-auth"
import type { JWT as NextAuthJWT } from "next-auth/jwt"

declare module "next-auth/jwt" {
  interface JWT extends NextAuthJWT {
    id?: string
    username?: string | null
    role?: Role
    isImpersonating?: boolean
    originalAdminId?: string
    developerMode?: boolean
    /** Last time user row was synced from DB (ms); used to throttle jwt callback queries */
    dbLastSync?: number
  }
}

declare module "next-auth" {
  interface Session extends Omit<DefaultSession, "user"> {
    user: (DefaultSession["user"] & {
      id: string
      username?: string | null
      role: Role
      isImpersonating?: boolean
      originalAdminId?: string
      developerMode?: boolean
    }) | null
  }

  interface User extends DefaultUser {
    username?: string | null
    role: Role
    developerMode?: boolean
  }
}
