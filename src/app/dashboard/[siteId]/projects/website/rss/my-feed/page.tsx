import MyFeed from "@/components/RSSFeed/my-feed"

const page = async ({ params }: { params: Promise<{ siteId: string; url: string }> }) => {
    return <div>
        <MyFeed />
    </div>
}

export default page