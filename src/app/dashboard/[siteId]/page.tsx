'use client'
import PageWrapper from "@/components/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import { useTeam } from "@/hooks/useTeam";
import Link from "next/link";
export default function Page() {
  const { team, loading } = useTeam()
  if (loading) return <div>Loading</div>
  if (!team?.id) {
    return <div className="flex flex-1 items-center justify-center p-4">
      <p className="text-muted-foreground">Site not found.</p>
    </div>
  }



  return <PageWrapper action description="Your are viewing and editing this team" title={"Welcome to " + team.title}>
    <div className="flex flex-wrap  gap-5 max-w-5xl">
      <Link href={`/dashboard/${team.id}/projects/website/articles/`} className="h-[150px]">
        <Card className="max-w-[300px] max-h-[200px] p-0 overflow-hidden shadow hover:bg-accent transition-all cursor-pointer">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold pt-5 px-5">Publish an article</h1>
            <p className="my-5 px-5">Create or publish an article for your team.</p>
          </CardContent>
        </Card>
      </Link>
      <Link href={`/dashboard/${team.id}/projects/website/pages/`} className="h-[150px]">
        <Card className="w-[300px] p-0 overflow-hidden shadow hover:bg-accent transition-all cursor-pointer">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold pt-5 px-5">Publish a page</h1>
            <p className="my-5 px-5">Create or publish a page for your team.</p>
          </CardContent>
        </Card>
      </Link>
      <Link href={`/dashboard/${team.id}/projects/website/categories/`} className="h-[150px]">
        <Card className="w-[300px] p-0 overflow-hidden shadow hover:bg-accent transition-all cursor-pointer">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold pt-5 px-5">Create a category</h1>
            <p className="my-5 px-5">Create or publish a category for your team.</p>
          </CardContent>
        </Card>
      </Link>
      <Link href={`/dashboard/${team.id}/projects/website/media-gallery/`} className="h-[150px]">
        <Card className="w-[300px] p-0 overflow-hidden shadow hover:bg-accent transition-all cursor-pointer">
          <CardContent className="p-0">
            <h1 className="text-2xl font-bold pt-5 px-5">Upload an image</h1>
            <p className="my-5 px-5">Upload an iamge to your team.</p>
          </CardContent>
        </Card>
      </Link>
    </div>
  </PageWrapper>
}
