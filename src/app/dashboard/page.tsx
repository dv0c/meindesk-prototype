import { getSite } from "@/lib/actions/helpers/site"
import { redirect } from "next/navigation"

const page = async () => {
    const site = await getSite()
    if (!site) redirect('/setup')
    return redirect('/dashboard/' + site?.id)
}

export default page