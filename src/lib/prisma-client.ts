import { PrismaClient } from "@/generated/client"

declare global {
  // eslint-disable-next-line no-var, no-unused-vars
  var cachedPrisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient()
}

/** Dev HMR keeps a global Prisma instance; recreate after `prisma generate` adds models. */
function isStaleClient(client: PrismaClient): boolean {
  return typeof client.analyticsDailyRollup?.findMany !== "function"
}

let prisma: PrismaClient
if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient()
} else {
  if (!global.cachedPrisma || isStaleClient(global.cachedPrisma)) {
    global.cachedPrisma = createPrismaClient()
  }
  prisma = global.cachedPrisma
}

export const prismaClient = prisma
