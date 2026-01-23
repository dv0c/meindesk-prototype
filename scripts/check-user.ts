
import { db } from "../src/lib/db"

async function main() {
    const email = "test@meindesk.gr"
    console.log(`Checking for user with email: ${email}`)

    const user = await db.user.findUnique({
        where: { email },
        include: { memberOfSites: true }
    })

    if (user) {
        console.log("User found:", user.id)
        console.log("Member of sites:", user.memberOfSites.map(s => s.id))
    } else {
        console.log("User NOT found")
    }

    // Also check invitations
    const invitations = await db.invitation.findMany({
        where: { email }
    })
    console.log("Pending Invitations:", invitations)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        // await db.$disconnect()
    })
