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
import { cn } from "@/lib/utils";
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
    <div className="max-w-4xl w-full">
      <div className="rounded-lg border border-red-900/50 bg-[#0a0a0a] overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium leading-none tracking-tight mb-2 text-red-500">Delete Project</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-2xl">
            The project will be permanently deleted, including all of its deployments and domains. This action is irreversible and can not be undone.
          </p>
        </div>
        <div className="flex items-center justify-between p-4 px-6 bg-red-900/10 border-t border-red-900/50 rounded-b-lg">
          <div className="text-sm text-red-500 font-medium">
            Please be certain.
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-medium border border-transparent shadow-sm">Delete Project</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Project</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this project? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
};

