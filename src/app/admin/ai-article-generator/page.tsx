
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles, Save, ArrowRight } from "lucide-react";

import { generateArticleAction, getSitesAndAuthors, createArticleDraft } from "@/actions/ai-article";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditorProvider, EditorToolbar, EditorContent, EditorFooter } from "@/components/blocks/editor-x/editor";
import { cn } from "@/lib/utils";

export default function AIArticleGeneratorPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);

    // Form State
    const [tourUrl, setTourUrl] = useState("");
    const [topic, setTopic] = useState("");
    const [selectedSiteId, setSelectedSiteId] = useState("");
    const [selectedAuthorId, setSelectedAuthorId] = useState("");

    // Data Options
    const [sites, setSites] = useState<any[]>([]);
    const [authors, setAuthors] = useState<any[]>([]);

    // Result State
    const [generatedArticle, setGeneratedArticle] = useState<any>(null);

    useEffect(() => {
        async function loadOptions() {
            setLoading(true);
            const res = await getSitesAndAuthors();
            if (res.success) {
                setSites(res.sites || []);
                setAuthors(res.authors || []);
                if (res.sites && res.sites.length > 0) setSelectedSiteId(res.sites[0].id);
                if (res.authors && res.authors.length > 0) setSelectedAuthorId(res.authors[0].id);
            } else {
                toast.error("Failed to load sites and authors");
            }
            setLoading(false);
        }
        loadOptions();
    }, []);

    const handleGenerate = async () => {
        if (!tourUrl) return toast.error("Please enter a Tour URL");
        if (!topic) return toast.error("Please enter a Topic");

        setGenerating(true);
        setGeneratedArticle(null);

        const res = await generateArticleAction(tourUrl, topic);

        if (res.success) {
            setGeneratedArticle(res.data);
            toast.success("Article generated successfully!");
        } else {
            toast.error(res.error || "Failed to generate article");
        }
        setGenerating(false);
    };

    const handleCreateDraft = async () => {
        if (!generatedArticle) return;
        if (!selectedSiteId) return toast.error("Please select a target site");
        if (!selectedAuthorId) return toast.error("Please select an author");

        setLoading(true);
        const res = await createArticleDraft(selectedSiteId, selectedAuthorId, generatedArticle);

        if (res.success) {
            toast.success("Draft created! Redirecting to editor...");
            router.push(`/dashboard/${selectedSiteId}/projects/website/articles/${res.articleId}/editor`);
        } else {
            toast.error(res.error || "Failed to create draft");
        }
        setLoading(false);
    };

    return (
        <div className="h-screen flex flex-col bg-background overflow-hidden">
            {/* Top Header */}
            <header className="shrink-0 h-14 border-b flex items-center justify-between px-6 bg-background z-10">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h1 className="font-semibold text-lg">AI Article Generator</h1>
                </div>
                <div className="flex items-center gap-2">
                    {generatedArticle && (
                        <Button
                            onClick={handleCreateDraft}
                            disabled={loading}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white gap-2"
                        >
                            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                            Create Draft
                        </Button>
                    )}
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Configuration */}
                <aside className="w-[320px] shrink-0 border-r bg-muted/10 overflow-y-auto p-6 space-y-6">
                    <div>
                        <h2 className="text-sm font-medium mb-4">Configuration</h2>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="tour-url" className="text-xs uppercase text-muted-foreground font-semibold">Tour URL</Label>
                                <Input
                                    id="tour-url"
                                    placeholder="https://..."
                                    value={tourUrl}
                                    onChange={(e) => setTourUrl(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="topic" className="text-xs uppercase text-muted-foreground font-semibold">Topic / Focus</Label>
                                <Input
                                    id="topic"
                                    placeholder="e.g. Food Tour"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground font-semibold">Target Site</Label>
                                <Select value={selectedSiteId} onValueChange={setSelectedSiteId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map(site => (
                                            <SelectItem key={site.id} value={site.id}>{site.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase text-muted-foreground font-semibold">Author</Label>
                                <Select value={selectedAuthorId} onValueChange={setSelectedAuthorId}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select author" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {authors.map(author => (
                                            <SelectItem key={author.id} value={author.id}>{author.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleGenerate}
                                disabled={generating || loading || !tourUrl || !topic}
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        Generate Content
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </aside>

                {/* Main Preview Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-background">
                    {generatedArticle ? (
                        <div className="flex flex-col h-full">
                            {/* Meta Bar */}
                            <div className="shrink-0 border-b px-6 py-3 bg-muted/10 grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">SEO Title</Label>
                                    <div className="text-sm font-medium truncate" title={generatedArticle.metaTitle}>
                                        {generatedArticle.metaTitle}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs text-muted-foreground">SEO Description</Label>
                                    <div className="text-sm text-muted-foreground truncate" title={generatedArticle.metaDescription}>
                                        {generatedArticle.metaDescription}
                                    </div>
                                </div>
                            </div>

                            {/* Editor */}
                            <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden" key={generatedArticle.title}>
                                <EditorProvider
                                    editorSerializedState={generatedArticle.content}
                                    onSerializedChange={(newState) => {
                                        // Update content directly, clear markdown to ensure action uses content
                                        setGeneratedArticle((prev: any) => ({
                                            ...prev,
                                            content: newState,
                                            markdown: undefined
                                        }));
                                    }}
                                >
                                    <div className="shrink-0 border-b bg-background z-10">
                                        <EditorToolbar />
                                    </div>
                                    <div className="flex-1 overflow-y-auto bg-background relative">
                                        <div className="min-h-full p-8 md:px-12 max-w-4xl mx-auto">
                                            <EditorContent siteId={selectedSiteId} className="h-full" />
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <EditorFooter />
                                    </div>
                                </EditorProvider>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
                            <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mb-6">
                                <Sparkles className="h-8 w-8 opacity-20" />
                            </div>
                            <h3 className="text-lg font-medium text-foreground">Ready to Generate</h3>
                            <p className="max-w-md text-center text-sm mt-2">
                                Fill in the tour details on the left sidebar to generate a complete, SEO-optimized article draft.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
