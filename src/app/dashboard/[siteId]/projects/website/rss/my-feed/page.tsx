import MyFeed from "@/components/RSSFeed/my-feed"

const page = async ({ params }: { params: { siteId: string, url: string } }) => {
    const { siteId } = await params
    return <div>
        <MyFeed siteId={siteId} />
    </div>
}

export default page