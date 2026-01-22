import { CollectionsView } from "@/components/CollectionsView"

export const metadata = {
    title: "Collections | PROTOTYPE",
}

export default async function Page({ params }: { params: { siteId: string } }) {
    const { siteId } = await params
    return <CollectionsView siteId={siteId} />
}
