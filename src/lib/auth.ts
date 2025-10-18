import { db } from "@/lib/db"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { nanoid } from "nanoid"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcrypt"
import { cookies } from "next/headers"
import { NextAuthOptions, getServerSession } from "next-auth";
import { Role } from "@prisma/client"

const IMPERSONATION_COOKIE_NAME = "impersonation_token"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/setup",
  },
  providers: [
    // --- Email/Password Provider ---
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password)
          throw new Error("Email and password are required")

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.hashedPassword)
          throw new Error("Invalid email or password")

        const isValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!isValid)
          throw new Error("Invalid email or password")

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          username: user.username,
          role: user.role,
        }
      },
    }),

    // --- OAuth Providers ---
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      const cookieStore = await cookies()
      const impersonationCookie = cookieStore.get(IMPERSONATION_COOKIE_NAME)

      // -------------- Impersonation Handling --------------
      if (
        impersonationCookie &&
        typeof impersonationCookie.value === "string" &&
        impersonationCookie.value.trim() !== ""
      ) {
        try {
          const { targetUserId, originalAdminId } = JSON.parse(
            impersonationCookie.value
          )
          const targetUser = await db.user.findUnique({ where: { id: targetUserId } })
          const originalAdmin = await db.user.findUnique({ where: { id: originalAdminId } })

          if (targetUser && originalAdmin && originalAdmin.role === Role.ADMIN) {
            token.id = targetUser.id
            token.name = targetUser.name
            token.email = targetUser.email
            token.picture = targetUser.image
            token.username = targetUser.username
            token.role = targetUser.role
            token.isImpersonating = true
            token.originalAdminId = originalAdminId
            return token
          }
        } catch {
          console.warn("Invalid impersonation cookie.")
        }
      }

      if (token.isImpersonating && token.originalAdminId) {
        const originalAdminUser = await db.user.findUnique({
          where: { id: token.originalAdminId as string },
        })

        if (originalAdminUser) {
          token.id = originalAdminUser.id
          token.name = originalAdminUser.name
          token.email = originalAdminUser.email
          token.picture = originalAdminUser.image
          token.username = originalAdminUser.username
          token.role = originalAdminUser.role
          delete token.isImpersonating
          delete token.originalAdminId
          return token
        }
      }

      delete token.isImpersonating
      delete token.originalAdminId

      // Standard token population
      if (user) {
        token.id = user.id
        token.name = user.name
        token.email = user.email
        token.picture = user.image
        token.role = (user as any).role || Role.USER
      }

      const dbUser = token.id
        ? await db.user.findUnique({ where: { id: token.id as string } })
        : token.email
          ? await db.user.findFirst({ where: { email: token.email as string } })
          : null

      if (dbUser) {
        token.id = dbUser.id
        token.name = dbUser.name
        token.email = dbUser.email
        token.picture = dbUser.image
        token.username = dbUser.username
        token.role = dbUser.role

        if (!dbUser.username) {
          const newUsername = nanoid(10)
          await db.user.update({
            where: { id: dbUser.id },
            data: { username: newUsername },
          })
          token.username = newUsername
        }
      }

      return token
    },

    async session({ session, token }) {
      session.user.id = token.id as string
      session.user.name = token.name
      session.user.email = token.email
      session.user.image = token.picture as string | null | undefined
      session.user.username = token.username as string | null | undefined
      session.user.role = token.role as Role
      session.user.isImpersonating = token.isImpersonating as boolean | undefined
      session.user.originalAdminId = token.originalAdminId as string | undefined
      return session
    },

    redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
}

export const getAuthSession = () => getServerSession(authOptions)
