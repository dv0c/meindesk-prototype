import "server-only"
import { prismaClient } from "@/lib/prisma-client"

export const db = prismaClient
