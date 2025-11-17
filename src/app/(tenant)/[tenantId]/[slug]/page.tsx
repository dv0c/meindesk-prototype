import NotFound from "@/app/not-found"
import { db } from "@/lib/db"



const page = async ({ params }: { params: { slug: string } }) => {
    const { slug } = await params
    const page = await db.page.findFirst({
        where: {
            slug: slug
        }
    })

    if (!page) return NotFound()

    return <div>
        <div className="prose prose-invert prose-xl mx-auto" dangerouslySetInnerHTML={{ __html: page.html as string }} />
    </div>

}

export default page