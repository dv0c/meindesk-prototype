"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Site } from "@prisma/client";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const DeleteWebsite = ({ siteId }: { siteId: string }) => {
  const router = useRouter();
  const handleDelete = async () => {
    await axios.delete(`/api/team/${siteId}`).then(() => {
      toast.success("Website deleted successfully!");
      router.push("/dashboard");
    });
  };

  return (
    <div className="max-w-3xl w-full">
      <div className="grid gap-6">
        <Card className="border-dashed pb-0 overflow-hidden border-2 border-red-500/30">
          <CardHeader>
            <CardTitle>Delete your website</CardTitle>
            <CardDescription className="pb-10">
              Once you delete your website, it will be permanently removed from
              our servers.
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t px-6 py-4 bg-red-800/20">
            <AlertDialog>
              <AlertDialogTrigger asChild className=" text-left">
                <Button className="cursor-pointer" variant={"destructive"}>Delete</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your website.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="cursor-pointer" onClick={handleDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};
