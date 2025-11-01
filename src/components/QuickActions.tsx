import { FileIcon, FileText, FolderIcon, ImageIcon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";

interface Features {
  articles?: boolean;
  pages?: boolean;
  cateories?: boolean; // keep same typo as in DB
  media?: boolean;
  analytics?: boolean;
}

interface QuickActionsProps {
  siteId: string;
  features: Features | null;
}

const QuickActions = ({ siteId, features }: QuickActionsProps) => {
  const path = `/dashboard/${siteId}/projects/website`;

  if (!features) return null; // optionally show a skeleton/loading

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

          {features.cateories && (
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
