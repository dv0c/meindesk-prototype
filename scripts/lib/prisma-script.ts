import { prismaClient } from "../../src/lib/prisma-client"

export function getScriptDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is required. Add it to meindesk-prototype/.env (production MongoDB connection string).",
    )
  }
  return prismaClient
}

export async function disconnectScriptDb(): Promise<void> {
  await prismaClient.$disconnect()
}
