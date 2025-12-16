import { FileIcon, FileText, FolderIcon, ImageIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";

interface Features {
  articles?: boolean;
  pages?: boolean;
  categories?: boolean; // keep same typo as in DB
  media?: boolean;
  analytics?: boolean;
}

interface QuickActionsProps {
  siteId: string;
  features: Features | null;
}

const QuickActions = ({ siteId, features }: QuickActionsProps) => {
  const path = `/dashboard/${siteId}/projects/website`;

  if (!features) return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="h-6 w-28 bg-muted animate-pulse rounded" />
        <div className="h-4 w-44 bg-muted animate-pulse rounded mt-2" />
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 p-4 border rounded">
              <div className="flex items-center justify-between">
                <div className="h-5 w-5 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-3 w-44 bg-muted animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Create and manage your content</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {features.articles && (
            <Link className="grid cursor-pointer" href={`${path}/articles`}>
              <Button
                className="cursor-pointer h-auto flex-col items-start gap-2 p-4 bg-transparent"
                variant="outline"
              >
                <div className="flex w-full items-center justify-between">
                  <FileText className="size-5" />
                  <Plus className="size-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Publish an article</div>
                  <div className="text-xs text-muted-foreground">
                    Create or publish an article for your team
                  </div>
                </div>
              </Button>
            </Link>
          )}

          {features.pages && (
            <Link className="grid cursor-pointer" href={`${path}/pages`}>
              <Button
                className="cursor-pointer h-auto flex-col items-start gap-2 p-4 bg-transparent"
                variant="outline"
              >
                <div className="flex w-full items-center justify-between">
                  <FileIcon className="size-5" />
                  <Plus className="size-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Publish a page</div>
                  <div className="text-xs text-muted-foreground">
                    Create or publish a page for your team
                  </div>
                </div>
              </Button>
            </Link>
          )}

          {features.categories && (
            <Link className="grid cursor-pointer" href={`${path}/categories`}>
              <Button
                className="cursor-pointer h-auto flex-col items-start gap-2 p-4 bg-transparent"
                variant="outline"
              >
                <div className="flex w-full items-center justify-between">
                  <FolderIcon className="size-5" />
                  <Plus className="size-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Create a category</div>
                  <div className="text-xs text-muted-foreground">
                    Create or publish a category for your team
                  </div>
                </div>
              </Button>
            </Link>
          )}

          {features.media && (
            <Link className="grid cursor-pointer" href={`${path}/media-gallery`}>
              <Button
                className="cursor-pointer h-auto flex-col items-start gap-2 p-4 bg-transparent"
                variant="outline"
              >
                <div className="flex w-full items-center justify-between">
                  <ImageIcon className="size-5" />
                  <Plus className="size-4" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Upload an image</div>
                  <div className="text-xs text-muted-foreground">Upload an image to your team</div>
                </div>
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
