
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Plus, Edit, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Theme } from "@prisma/client";

export default function AdminThemesPage() {
    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === "loading") return;
        if (!session || session.user.role !== "ADMIN") {
            router.push("/");
            return;
        }
        fetchThemes();
    }, [session, status]);

    const fetchThemes = async () => {
        try {
            const res = await fetch("/api/admin/themes");
            if (!res.ok) throw new Error("Failed to fetch themes");
            const data = await res.json();
            setThemes(data);
        } catch (error) {
            toast.error("Failed to load themes");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this theme?")) return;

        try {
            const res = await fetch(`/api/admin/themes/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Theme deleted");
            fetchThemes();
        } catch (error) {
            toast.error("Failed to delete theme");
        }
    };

    if (loading) return <div>Loading themes...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">Themes</h2>
                <Link href="/admin/themes/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Create Theme
                    </Button>
                </Link>
            </div>

            <div className="border rounded-lg shadow-sm bg-card">
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm text-muted-foreground">
                    <div className="col-span-2">Thumbnail</div>
                    <div className="col-span-3">Name</div>
                    <div className="col-span-4">Description</div>
                    <div className="col-span-1">Price</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {themes.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">No themes found. Create one to get started.</div>
                ) : (
                    themes.map((theme) => (
                        <div key={theme.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b last:border-0 hover:bg-muted/5">
                            <div className="col-span-2 relative aspect-video rounded-md overflow-hidden bg-muted">
                                {theme.thumbnail ? (
                                    <Image
                                        src={theme.thumbnail}
                                        alt={theme.name}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Image</div>
                                )}
                            </div>
                            <div className="col-span-3 font-medium flex flex-col gap-1">
                                <span className="flex items-center gap-2">
                                    {theme.name}
                                    {theme.isPremium && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">PREMIUM</span>}
                                </span>
                            </div>
                            <div className="col-span-4 text-sm text-muted-foreground truncate">{theme.description}</div>
                            <div className="col-span-1 text-sm">{theme.price > 0 ? `$${theme.price.toFixed(2)}` : "Free"}</div>
                            <div className="col-span-2 flex justify-end gap-2">
                                <Link href={`/admin/themes/${theme.id}`}>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDelete(theme.id)}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
