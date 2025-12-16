import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CarouselImage } from "./carousel-node";
import { ArrowUp, ArrowDown, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface ManageSlidesDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    images: CarouselImage[];
    onUpdate: (images: CarouselImage[]) => void;
}

export function ManageSlidesDialog({
    open,
    onOpenChange,
    images: initialImages,
    onUpdate,
}: ManageSlidesDialogProps) {
    const [images, setImages] = useState<CarouselImage[]>(initialImages);

    useEffect(() => {
        if (open) {
            setImages(initialImages);
        }
    }, [open]); // Only reset when opening the dialog

    const moveUp = (index: number) => {
        if (index === 0) return;
        const newImages = [...images];
        [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
        setImages(newImages);
    };

    const moveDown = (index: number) => {
        if (index === images.length - 1) return;
        const newImages = [...images];
        [newImages[index + 1], newImages[index]] = [newImages[index], newImages[index + 1]];
        setImages(newImages);
    };

    const remove = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
    };

    const handleSave = () => {
        onUpdate(images);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Manage Slides</DialogTitle>
                </DialogHeader>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-2">
                        {images.map((img, index) => (
                            <div key={img.id || index} className="flex items-center gap-3 p-2 border rounded-md bg-card">
                                <div className="w-16 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                                    <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                                </div>
                                <span className="flex-1 text-sm truncate">{img.alt || "Untitled"}</span>
                                <div className="flex items-center gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={index === 0}
                                        onClick={() => moveUp(index)}
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        disabled={index === images.length - 1}
                                        onClick={() => moveDown(index)}
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-destructive hover:text-destructive"
                                        onClick={() => remove(index)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {images.length === 0 && (
                            <p className="text-center text-muted-foreground py-8">No images in carousel</p>
                        )}
                    </div>
                </ScrollArea>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
