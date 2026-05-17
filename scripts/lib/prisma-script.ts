import { PrismaClient } from "../../src/generated/client"

let prisma: PrismaClient | undefined

export function getScriptDb(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required. Add it to meindesk-prototype/.env (production MongoDB connection string).",
    )
  }
  if (!prisma) {
    prisma = new PrismaClient()
  }
  return prisma
}

export async function disconnectScriptDb(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect()
    prisma = undefined
  }
}
