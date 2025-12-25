"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs } from "@/components/ui/tabs";
import { Eye, Loader2, Search } from "lucide-react";
import { useTheme } from "next-themes";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import placeholder from "../../../../../public/placeholder.svg";

interface Theme {
    id: string;
    name: string;
    description: string;
    thumbnail: string | null;
    price: number;
    isPremium: boolean;

    installed?: boolean; // We will merge this in frontend
    blocks?: any[];
}

export default function ThemeStorePage() {
    const params = useParams();
    const router = useRouter();
    const siteId = params.siteId as string;
    const { theme: mode } = useTheme();

    const [themes, setThemes] = useState<Theme[]>([]);
    const [loading, setLoading] = useState(true);
    const [installing, setInstalling] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [previewTheme, setPreviewTheme] = useState<Theme | null>(null);

    useEffect(() => {
        fetchThemes();
    }, [siteId]);

    const fetchThemes = async () => {
        try {
            setLoading(true);
            const [themesRes, installedRes] = await Promise.all([
                fetch("/api/themes"),
                fetch(`/api/sites/${siteId}/themes/install`)
            ]);

            if (!themesRes.ok || !installedRes.ok) throw new Error("Failed to fetch data");

            const allThemes = await themesRes.json();
            const installedData = await installedRes.json();
            const installedIds = new Set(installedData.map((i: any) => i.themeId));

            setThemes(allThemes.map((t: any) => ({
                ...t,
                installed: installedIds.has(t.id)
            })));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleInstall = async (theme: Theme) => {
        // Prevent uninstalling the Core theme
        if (theme.id === "000000000000000000000001" && theme.installed) {
            alert("The Core theme cannot be uninstalled as it provides essential components.");
            return;
        }

        setInstalling(theme.id);
        const isInstalled = theme.installed;

        try {
            let url = `/api/sites/${siteId}/themes/install`;
            const options: RequestInit = {};

            if (isInstalled) {
                options.method = "DELETE";
                url += `?themeId=${theme.id}`;
            } else {
                options.method = "POST";
                options.body = JSON.stringify({ themeId: theme.id });
                options.headers = { "Content-Type": "application/json" };
            }

            const res = await fetch(url, options);
            if (res.ok) {
                setThemes(themes.map(t =>
                    t.id === theme.id ? { ...t, installed: !isInstalled } : t
                ));
            } else {
                alert("Failed to update theme installation");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setInstalling(null);
        }
    };

    const filteredThemes = themes.filter((t) =>
        t.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Theme Community Store</h1>
                    <p className="text-muted-foreground">
                        Discover and install new components and layouts for your site.
                    </p>
                </div>

            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search themes..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                    {/* <TabsList>
                        <TabsTrigger value="all">All</TabsTrigger>
                        <TabsTrigger value="premium">Premium</TabsTrigger>
                        <TabsTrigger value="free">Free</TabsTrigger>
                    </TabsList> */}
                </Tabs>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredThemes.map((theme) => (
                        <Card key={theme.id} className="flex flex-col h-full overflow-hidden pt-0! hover:shadow-lg transition-shadow">
                            <div className="aspect-video w-full bg-muted relative">
                                {/* Placeholder for thumbnail */}
                                {theme.thumbnail ? (
                                    <img src={theme.thumbnail ? theme.thumbnail : placeholder} alt={theme.name} className="object-cover min-h-[250px] max-h-[250px] w-full h-full" />
                                ) : (
                                    <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/50">
                                        No Preview
                                    </div>
                                )}
                                {theme.isPremium && (
                                    <Badge className="absolute top-2 right-2 variant-default">Premium</Badge>
                                )}
                            </div>
                            <CardHeader>
                                <CardTitle className="flex justify-between items-center">
                                    <span>{theme.name}</span>
                                    <span className="text-sm font-normal text-muted-foreground">
                                        {theme.price > 0 ? `$${theme.price}` : "Free"}
                                    </span>
                                </CardTitle>
                                <CardDescription className="line-clamp-2">{theme.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                {/* List functionality or blocks included? */}
                                <p className="text-xs text-muted-foreground">Includes custom blocks.</p>
                            </CardContent>
                            <CardFooter className="gap-3 flex-col">
                                <Button
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setPreviewTheme(theme)}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    Preview Blocks
                                </Button>
                                <Button
                                    className="w-full"
                                    variant={theme.installed ? "destructive" : "default"}
                                    onClick={() => handleInstall(theme)}
                                    disabled={installing === theme.id || (theme.id === "000000000000000000000001" && theme.installed)}
                                >
                                    {installing === theme.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {installing === theme.id
                                        ? (theme.installed ? "Uninstalling..." : "Installing...")
                                        : theme.id === "000000000000000000000001" && theme.installed
                                            ? "Installed (Required)"
                                            : (theme.installed ? "Uninstall" : "Install Theme")
                                    }
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <Dialog open={!!previewTheme} onOpenChange={(open) => !open && setPreviewTheme(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{previewTheme?.name}</DialogTitle>
                        <DialogDescription>{previewTheme?.description}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg">Included Blocks</h3>
                        <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                            {previewTheme?.blocks && previewTheme.blocks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {previewTheme.blocks.map((block: any, idx: number) => (
                                        <div key={idx} className="border rounded p-3 bg-muted/30">
                                            <p className="font-medium">{block.componentName}</p>
                                            <div className="text-xs text-muted-foreground mt-2">
                                                <p>Category: {block.componentDefinition?.category || 'Uncategorized'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-muted-foreground text-center py-8">No blocks info available for this theme.</p>
                            )}
                        </ScrollArea>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
